import type { Fetch } from '../../internal/builtin-types';
import { getDefaultFetch } from '../../internal/shims';
import { VERSION } from '../../version';
import { replayHintFor } from './identity-token';
import type {
  AccessTokenProviderOptions,
  FederationAccessToken,
  FederationPrincipal,
  FederationTokenDetails,
  IdentityTokenProvider,
} from './types';
import {
  DEFAULT_CREDENTIALS_TIMEOUT_IN_MS,
  describeFailure,
  GRANT_TYPE_JWT_BEARER,
  MAX_ASSERTION_BYTES,
  TOKEN_ENDPOINT,
  WorkloadIdentityError,
  nowAsSeconds,
  readLimitedText,
  redactSensitive,
  requireSecureTokenEndpoint,
  resolveAuthBaseURL,
  resolveResource,
  withTimeout,
} from './types';

type ExchangeOptions = {
  /**
   * The host that exchanges identity tokens. Defaults to
   * `KERNEL_AUTH_BASE_URL`, else `https://auth.onkernel.com` when the API
   * base URL is the production default. A custom API base URL needs it set.
   */
  authBaseURL?: string | undefined;
  /**
   * The API the access token is for. Defaults to the origin of the API base
   * URL, for example `https://api.onkernel.com`. The token endpoint compares
   * it exactly, so it must not end in a slash.
   */
  resource?: string | undefined;
  /** Defaults to the `fetch` of the client using the credentials, else the global `fetch`. */
  fetch?: Fetch | undefined;
  /**
   * How long one token request may take, in milliseconds.
   *
   * @default 30000
   */
  timeout?: number | undefined;
};

export type OIDCFederationConfig = ExchangeOptions & {
  /**
   * Called once per exchange. It must return a fresh token every time: most
   * providers' tokens can be exchanged only once.
   */
  identityTokenProvider: IdentityTokenProvider;
  /** The `wifr_...` ID of the federation rule to authenticate against. */
  federationRuleId: string;
};

export type FederationAssertionExchangeParams = ExchangeOptions & {
  /** The identity provider's token. It is sent as given and never reused. */
  assertion: string;
  /** The `wifr_...` ID of the federation rule to authenticate against. */
  federationRuleId: string;
};

export type FederationExchangeResult = { accessToken: string } & FederationTokenDetails;

/**
 * Exchanges a token from the workload's identity provider for a short-lived
 * Kernel access token (the RFC 7523 jwt-bearer grant).
 *
 * Every call asks `identityTokenProvider` for a fresh token and exchanges
 * it; nothing is cached and nothing is retried. Pass the result as the
 * client's `credentials` option, which wraps it in a {@link TokenCache}.
 *
 * The token endpoint returns no refresh token: when the access token is
 * about to expire, a new identity token is exchanged.
 */
export function oidcFederationProvider(
  config: OIDCFederationConfig,
): (opts?: AccessTokenProviderOptions) => Promise<FederationAccessToken> {
  if (!config.federationRuleId) {
    throw new WorkloadIdentityError('federationRuleId is required');
  }

  return async (opts) => {
    const apiBaseURL = opts?.client?.baseURL;
    const authBaseURL = resolveAuthBaseURL(config.authBaseURL, apiBaseURL);
    requireSecureTokenEndpoint(authBaseURL);
    const resource = resolveResource(config.resource, apiBaseURL);
    const fetch = config.fetch ?? opts?.client?.fetch ?? getDefaultFetch();

    const assertion = await config.identityTokenProvider({ audience: authBaseURL, fetch });
    const { accessToken, ...details } = await exchange({
      assertion,
      replayHint: replayHintFor(config.identityTokenProvider),
      federationRuleId: config.federationRuleId,
      authBaseURL,
      resource,
      fetch,
      userAgent: `Kernel/JS ${VERSION} oidcFederationProvider`,
      timeout: config.timeout ?? DEFAULT_CREDENTIALS_TIMEOUT_IN_MS,
    });
    return { token: accessToken, ...details };
  };
}

/**
 * Exchanges one identity provider token for a Kernel access token, for
 * callers that want to manage the access token themselves. It needs no
 * Kernel credential.
 *
 * The assertion is spent by the call: to get another access token, obtain a
 * fresh assertion from the identity provider first.
 */
export async function exchangeFederationAssertion(
  params: FederationAssertionExchangeParams,
): Promise<FederationExchangeResult> {
  if (!params.federationRuleId) {
    throw new WorkloadIdentityError('federationRuleId is required');
  }
  const authBaseURL = resolveAuthBaseURL(params.authBaseURL);
  requireSecureTokenEndpoint(authBaseURL);
  return exchange({
    assertion: params.assertion,
    replayHint: 'Every exchange needs a fresh provider token; this assertion was already exchanged.',
    federationRuleId: params.federationRuleId,
    authBaseURL,
    resource: resolveResource(params.resource),
    fetch: params.fetch ?? getDefaultFetch(),
    userAgent: `Kernel/JS ${VERSION} exchangeFederationAssertion`,
    timeout: params.timeout ?? DEFAULT_CREDENTIALS_TIMEOUT_IN_MS,
  });
}

async function exchange(request: {
  assertion: string;
  /** Appended to the error when the token endpoint reports the assertion as already used. */
  replayHint: string;
  federationRuleId: string;
  authBaseURL: string;
  resource: string;
  fetch: Fetch;
  userAgent: string;
  timeout: number;
}): Promise<FederationExchangeResult> {
  const { assertion } = request;
  if (typeof assertion !== 'string' || !assertion) {
    throw new WorkloadIdentityError('Identity token is empty');
  }
  // The token endpoint rejects larger assertions. Failing here names the
  // problem, which is usually a path or certificate passed as the token.
  const assertionBytes = new TextEncoder().encode(assertion).length;
  if (assertionBytes > MAX_ASSERTION_BYTES) {
    throw new WorkloadIdentityError(
      `Identity token is ${Math.ceil(assertionBytes / 1024)} KiB, which exceeds the 16 KiB limit`,
    );
  }

  // The token endpoint rejects any parameter other than these four, and any
  // Authorization header.
  const body = new URLSearchParams({
    grant_type: GRANT_TYPE_JWT_BEARER,
    assertion,
    federation_rule_id: request.federationRuleId,
    resource: request.resource,
  }).toString();
  const url = `${request.authBaseURL}${TOKEN_ENDPOINT}`;
  const startedAt = nowAsSeconds();

  return withTimeout(request.timeout, async (signal) => {
    let response: Response;
    try {
      response = await request.fetch(url, {
        method: 'POST',
        redirect: 'manual',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': request.userAgent,
        },
        body,
        signal,
      });
    } catch (err) {
      const reason =
        signal.aborted ? `timed out after ${request.timeout}ms` : describeFailure(err, [assertion]);
      throw new WorkloadIdentityError(`Failed to reach token endpoint ${url}: ${reason}`);
    }

    const requestId = response.headers.get('x-request-id') ?? response.headers.get('request-id');
    let text: string;
    try {
      text = await readLimitedText(response);
    } catch (err) {
      throw new WorkloadIdentityError(
        `Failed to read the response from token endpoint ${url}: ${describeFailure(err, [assertion])}`,
        { statusCode: response.status, requestId },
      );
    }
    if (!response.ok) {
      throw exchangeError(response.status, text, requestId, request);
    }
    return parseTokenResponse(response.status, text, requestId, startedAt);
  });
}

function exchangeError(
  status: number,
  text: string,
  requestId: string | null,
  { assertion, replayHint, resource }: { assertion: string; replayHint: string; resource: string },
): WorkloadIdentityError {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = undefined;
  }
  const body = redactSensitive(parsed, [assertion]);
  const errorCode = body?.['error'] ?? null;
  const errorDescription = body?.['error_description'] ?? null;

  let hint = '';
  if (errorDescription && /already used/i.test(errorDescription)) {
    hint = replayHint;
  } else if (errorCode === 'invalid_target') {
    hint = `The token endpoint does not accept the resource "${resource}". Set the resource option to the Kernel API origin, with no trailing slash.`;
  }

  let detail =
    errorCode ?
      `${errorCode}${errorDescription ? `: ${errorDescription}` : ''}`
    : 'the response is not an OAuth error';
  if (hint) detail = `${detail.replace(/\.$/, '')}. ${hint}`;
  return new WorkloadIdentityError(
    `Token exchange failed with status ${status}${requestId ? ` (request ID ${requestId})` : ''}: ${detail}`,
    { statusCode: status, errorCode, errorDescription, requestId, body },
  );
}

function parseTokenResponse(
  status: number,
  text: string,
  requestId: string | null,
  startedAt: number,
): FederationExchangeResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = undefined;
  }
  // A success body holds the access token, so none of it goes into an error.
  const invalid = (problem: string) =>
    new WorkloadIdentityError(`Token endpoint returned an unusable response (status ${status}): ${problem}`, {
      statusCode: status,
      requestId,
    });
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw invalid('the body is not a JSON object');
  }
  const fields = data as Record<string, unknown>;
  const accessToken = fields['access_token'];
  if (typeof accessToken !== 'string' || !accessToken) {
    throw invalid('access_token is missing');
  }
  const tokenType = fields['token_type'];
  if (tokenType !== undefined && (typeof tokenType !== 'string' || tokenType.toLowerCase() !== 'bearer')) {
    throw invalid('token_type is not Bearer');
  }
  const expiresIn = fields['expires_in'];
  if (typeof expiresIn !== 'number' || !Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw invalid('expires_in is missing or not a positive number');
  }

  const stringOrNull = (value: unknown) => (typeof value === 'string' ? value : null);
  const rawPrincipal = fields['principal'] as Record<string, unknown> | null | undefined;
  let principal: FederationPrincipal | null = null;
  if (
    typeof rawPrincipal === 'object' &&
    rawPrincipal !== null &&
    typeof rawPrincipal['type'] === 'string' &&
    typeof rawPrincipal['id'] === 'string'
  ) {
    principal = { type: rawPrincipal['type'], id: rawPrincipal['id'] };
  }

  return {
    accessToken,
    // Counted from before the request was sent, so the token is never
    // treated as valid for longer than the server allows.
    expiresAt: startedAt + expiresIn,
    expiresIn,
    scope: stringOrNull(fields['scope']),
    orgId: stringOrNull(fields['org_id']),
    accessScope: stringOrNull(fields['access_scope']),
    projectId: stringOrNull(fields['project_id']),
    principal,
    federationRuleId: stringOrNull(fields['federation_rule_id']),
  };
}
