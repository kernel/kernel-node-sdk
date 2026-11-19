import type { Kernel } from '../../client';
import { KernelError } from '../../core/error';
import type { Fetch, RequestInit } from '../../internal/builtin-types';
import { readEnv } from '../../internal/utils/env';
import { loggerFor } from '../../internal/utils/log';
import { federationCredentialsFromEnv } from './credential-chain';
import { TokenCache } from './token-cache';
import type { AccessTokenProvider } from './types';
import { WorkloadIdentityError, requireSecureTokenEndpoint, resolveAuthBaseURL } from './types';

type AuthOptions = {
  apiKey?: string | undefined;
  credentials?: AccessTokenProvider | null | undefined;
  /** Set by `withOptions` to hand the parent's auth to the copy. */
  __auth?: ClientAuth | undefined;
};

// A 401 can only arrive for a token that was sent within the last request
// timeout, so the few most recent tokens are enough to recognize one.
const MAX_RECENT_TOKENS = 4;

let warnedAPIKeyWins = false;

/**
 * How one client authenticates: with its API key, or with an access token
 * from `credentials`. The client calls this from its constructor,
 * `withOptions`, `authHeaders` and its 401 handling.
 */
export class ClientAuth {
  private tokenCache: TokenCache | null = null;
  /** What the token cache was built for: tokens are requested for this API, through this fetch. */
  private target: { baseURL: string; fetch: Fetch; fetchOptions: unknown } | null = null;
  /** The access tokens most recently handed to requests, oldest first. */
  private recentTokens: string[] = [];
  /**
   * For each request options object, the requests sent with it that have
   * already had a 401 answered with a fresh token. An options object the
   * caller sends more than once has one entry per request.
   */
  private refreshed = new WeakMap<object, Set<string>>();

  private constructor(
    private provider: AccessTokenProvider | null,
    private fromEnv = false,
    private warnAPIKeyWins = false,
  ) {}

  /**
   * Picks the credential for a new client. In order:
   *
   *   1. the `credentials` or `apiKey` option;
   *   2. `KERNEL_API_KEY`;
   *   3. workload identity federation configured in the environment.
   *
   * @param options The options the caller passed to the constructor.
   * @param apiKey The `apiKey` option, or else `KERNEL_API_KEY`.
   */
  static resolve(options: AuthOptions = {}, apiKey: string | undefined): ClientAuth {
    if (options.__auth) return options.__auth;

    if (options.credentials != null) {
      if (options.apiKey) {
        throw new KernelError(
          'The `apiKey` and `credentials` options are mutually exclusive; pass only one of them.',
        );
      }
      return new ClientAuth(options.credentials);
    }

    if (apiKey !== undefined) {
      const keyIsFromEnv = options.apiKey === undefined;
      return new ClientAuth(null, false, keyIsFromEnv && !!readEnv('KERNEL_FEDERATION_RULE_ID'));
    }

    return new ClientAuth(federationCredentialsFromEnv(), true);
  }

  /** Whether requests carry an access token from `credentials` instead of the API key. */
  get usesCredentials(): boolean {
    return this.provider != null;
  }

  /**
   * Connects the credentials to the client that will use them, so token
   * requests go through the client's `fetch` and `fetchOptions` and are for
   * its base URL. The client calls this when it is constructed and again
   * before each request.
   *
   * Returns this object while the client still targets the API the token
   * cache was built for, through the same fetch. That is how a copy made by
   * `withOptions`, which starts with its parent's auth, shares the parent's
   * token cache. Otherwise returns a new object with its own cache over the
   * same provider, so a token is never sent to an API it was not requested
   * for; this covers a copy with another base URL and a client whose
   * `baseURL` is assigned after construction.
   */
  bind(client: Kernel, clientFetch: Fetch): ClientAuth {
    if (this.warnAPIKeyWins && !warnedAPIKeyWins) {
      warnedAPIKeyWins = true;
      loggerFor(client).warn(
        'Both KERNEL_API_KEY and KERNEL_FEDERATION_RULE_ID are set; using the API key. Unset KERNEL_API_KEY to use workload identity federation.',
      );
    }
    const provider = this.provider;
    if (!provider) return this;

    const target = { baseURL: client.baseURL, fetch: clientFetch, fetchOptions: client.fetchOptions };
    if (this.target) {
      const sameTarget =
        this.target.baseURL === target.baseURL &&
        this.target.fetch === target.fetch &&
        this.target.fetchOptions === target.fetchOptions;
      return sameTarget ? this : new ClientAuth(provider, this.fromEnv).bind(client, clientFetch);
    }

    if (this.fromEnv) {
      requireSecureTokenEndpoint(resolveAuthBaseURL(undefined, target.baseURL));
    }
    this.target = target;
    const fetch: Fetch = (input, init) =>
      clientFetch.call(undefined, input, { ...(target.fetchOptions as RequestInit | undefined), ...init });
    this.tokenCache = new TokenCache(
      (opts) => provider({ ...opts, client: { fetch, baseURL: target.baseURL } }),
      // The error is not logged: this client cannot vouch for what a
      // provider or a custom fetch puts in one. It is thrown to the caller
      // if the refresh still fails once the token is about to expire.
      (err) =>
        loggerFor(client).debug(
          `advisory credential refresh failed${
            err instanceof WorkloadIdentityError && err.statusCode != null ?
              ` with status ${err.statusCode}`
            : ''
          }; serving the cached token`,
        ),
    );
    return this;
  }

  /** The `Authorization` header for one attempt of a request, or `undefined` in API key mode. */
  async bearerAuth(): Promise<{ Authorization: string } | undefined> {
    if (!this.tokenCache) return undefined;
    const token = await this.tokenCache.getToken();
    if (!this.recentTokens.includes(token)) {
      this.recentTokens.push(token);
      if (this.recentTokens.length > MAX_RECENT_TOKENS) this.recentTokens.shift();
    }
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Handles a 401 for an attempt of `request`. Returns true when the attempt
   * should be sent again: the rejected token has been dropped, so the retry
   * exchanges a fresh identity token.
   *
   * Returns false when the 401 should surface. That is when this request
   * (`sent.requestID` names it across all of its attempts) has already been
   * retried for a 401, or when the attempt did not carry an access token
   * from `credentials` to the API: it used the API key or the caller's own
   * `Authorization` header, or was answered by a browser VM it was routed
   * to directly.
   */
  refreshAfter401(
    request: object,
    sent: { requestID: string; url: string; headers: Headers },
    response: Response,
  ): boolean {
    const token = sent.headers.get('authorization')?.replace(/^Bearer /, '');
    if (!this.tokenCache || !token || !this.recentTokens.includes(token)) return false;
    if (response.url && new URL(response.url).origin !== new URL(sent.url).origin) return false;

    let refreshed = this.refreshed.get(request);
    if (!refreshed) this.refreshed.set(request, (refreshed = new Set()));
    if (refreshed.has(sent.requestID)) return false;
    refreshed.add(sent.requestID);
    // Does nothing when another request has already replaced this token.
    this.tokenCache.invalidate(token);
    return true;
  }

  /**
   * The auth options for a copy made by `withOptions(options)`. A copy that
   * sets neither `apiKey` nor `credentials` inherits this client's auth; see
   * {@link bind} for when it also shares the token cache.
   */
  cloneOptions(options: AuthOptions): AuthOptions {
    if (options.apiKey != null && options.credentials != null) {
      // The constructor rejects the pair.
      return { __auth: undefined };
    }
    if (options.apiKey != null) return { credentials: null, __auth: undefined };
    if (options.credentials != null) return { apiKey: undefined, __auth: undefined };
    return { __auth: this };
  }
}
