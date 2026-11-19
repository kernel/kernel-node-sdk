import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { inspect } from 'node:util';
import Kernel, { AuthenticationError, KernelError } from '@onkernel/sdk';
import {
  WorkloadIdentityError,
  identityTokenFromValue,
  oidcFederationProvider,
} from '@onkernel/sdk/lib/credentials';
import type { AccessToken, AccessTokenProvider } from '@onkernel/sdk/lib/credentials';
import {
  type RecordedCall,
  formParams,
  isolateCredentialEnv,
  jsonResponse,
  mockFetch,
  oauthError,
  providerTokens,
  tokenResponse,
} from './helpers';

const GITHUB_REQUEST_URL = 'https://actions.example/idtoken?api-version=2.0';

/**
 * Stands in for GitHub's ID token endpoint, Kernel's token endpoint and the
 * Kernel API. Every identity token and access token it issues is numbered,
 * and each identity token can be exchanged once, as on the real server.
 */
function mockKernel(
  options: { api?: (call: RecordedCall, attempt: number) => Response | Promise<Response> | undefined } = {},
) {
  let identityTokens = 0;
  let accessTokens = 0;
  let apiAttempts = 0;
  const spent = new Set<string>();
  const mock = mockFetch((call) => {
    if (call.url.startsWith(GITHUB_REQUEST_URL)) {
      return jsonResponse({ value: `github-jwt-${++identityTokens}` });
    }
    if (call.url.endsWith('/token')) {
      const assertion = formParams(call)['assertion']!;
      if (spent.has(assertion)) return oauthError('invalid_grant', 'Credential was already used');
      spent.add(assertion);
      return jsonResponse(tokenResponse({ access_token: `access-${++accessTokens}` }));
    }
    return options.api?.(call, ++apiAttempts) ?? jsonResponse({ ok: true });
  });
  const select = (predicate: (call: RecordedCall) => boolean) => mock.calls.filter(predicate);
  return {
    fetch: mock.fetch,
    calls: mock.calls,
    tokenCalls: () => select((call) => call.url.endsWith('/token')),
    identityCalls: () => select((call) => call.url.startsWith(GITHUB_REQUEST_URL)),
    apiCalls: () =>
      select((call) => !call.url.endsWith('/token') && !call.url.startsWith(GITHUB_REQUEST_URL)),
  };
}

function setGitHubEnv() {
  process.env['KERNEL_FEDERATION_RULE_ID'] = 'wifr_env';
  process.env['ACTIONS_ID_TOKEN_REQUEST_URL'] = GITHUB_REQUEST_URL;
  process.env['ACTIONS_ID_TOKEN_REQUEST_TOKEN'] = 'runtime-token';
}

const bearer = (call: RecordedCall) => call.headers.get('authorization');

async function rejection(promise: PromiseLike<unknown>): Promise<WorkloadIdentityError> {
  const err = await promise.then(
    () => undefined,
    (e) => e,
  );
  expect(err).toBeInstanceOf(WorkloadIdentityError);
  return err;
}

describe('client credentials', () => {
  isolateCredentialEnv();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('credentials option', () => {
    test('sends the provider token as the bearer token and caches it', async () => {
      const server = mockKernel();
      const provider = jest.fn<Promise<AccessToken>, Parameters<AccessTokenProvider>>(async () => ({
        token: 'my-access-token',
        expiresAt: Date.now() / 1000 + 300,
      }));
      const kernel = new Kernel({ credentials: provider, fetch: server.fetch });

      await kernel.get('/browsers');
      await kernel.get('/browsers');

      expect(server.apiCalls().map(bearer)).toEqual(['Bearer my-access-token', 'Bearer my-access-token']);
      expect(provider).toHaveBeenCalledTimes(1);
      expect(kernel.apiKey).toBe('');
    });

    test("gives the provider the client's fetch and base URL", async () => {
      const server = mockKernel();
      const provider = jest.fn<Promise<AccessToken>, Parameters<AccessTokenProvider>>(async (opts) => {
        await opts!.client!.fetch('https://auth.example/whoami', { headers: { 'X-Test': '1' } });
        return { token: 't', expiresAt: null };
      });
      const kernel = new Kernel({
        credentials: provider,
        fetch: server.fetch,
        baseURL: 'https://api.dev.onkernel.com/',
        fetchOptions: { keepalive: true },
      });

      await kernel.get('/browsers');

      expect(provider.mock.calls[0]![0]!.client!.baseURL).toBe('https://api.dev.onkernel.com/');
      const whoami = server.calls.find((call) => call.url === 'https://auth.example/whoami')!;
      expect(whoami.headers.get('x-test')).toBe('1');
      expect(whoami.init?.keepalive).toBe(true);
    });

    test('is mutually exclusive with apiKey', () => {
      expect(
        () => new Kernel({ apiKey: 'sk-test', credentials: async () => ({ token: 't', expiresAt: null }) }),
      ).toThrow('mutually exclusive');
    });

    test('exchanges through the token endpoint with oidcFederationProvider', async () => {
      const server = mockKernel();
      const assertion = providerTokens.kubernetes();
      const kernel = new Kernel({
        credentials: oidcFederationProvider({
          identityTokenProvider: () => assertion,
          federationRuleId: 'wifr_123',
        }),
        fetch: server.fetch,
      });

      await kernel.get('/browsers');

      expect(server.tokenCalls()).toHaveLength(1);
      expect(server.tokenCalls()[0]!.url).toBe('https://auth.onkernel.com/token');
      expect(formParams(server.tokenCalls()[0]!)).toMatchObject({
        assertion,
        federation_rule_id: 'wifr_123',
        resource: 'https://api.onkernel.com',
      });
      expect(server.apiCalls().map(bearer)).toEqual(['Bearer access-1']);
    });

    test('a failed exchange fails the request without sending it', async () => {
      const server = mockKernel();
      const kernel = new Kernel({
        credentials: oidcFederationProvider({
          identityTokenProvider: () => {
            throw new Error('identity provider is down');
          },
          federationRuleId: 'wifr_123',
        }),
        fetch: server.fetch,
      });

      await expect(kernel.get('/browsers')).rejects.toThrow('identity provider is down');
      expect(server.apiCalls()).toHaveLength(0);
    });
  });

  describe('environment chain precedence', () => {
    test('the credentials option beats KERNEL_API_KEY', async () => {
      process.env['KERNEL_API_KEY'] = 'sk-env';
      const server = mockKernel();
      const kernel = new Kernel({
        credentials: async () => ({ token: 'from-credentials', expiresAt: null }),
        fetch: server.fetch,
      });

      await kernel.get('/browsers');
      expect(server.apiCalls().map(bearer)).toEqual(['Bearer from-credentials']);
    });

    test('the apiKey option beats the federation environment, without a warning', async () => {
      setGitHubEnv();
      const server = mockKernel();
      const logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
      const kernel = new Kernel({ apiKey: 'sk-option', fetch: server.fetch, logger });

      await kernel.get('/browsers');
      expect(server.apiCalls().map(bearer)).toEqual(['Bearer sk-option']);
      expect(server.tokenCalls()).toHaveLength(0);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    test('KERNEL_API_KEY beats the federation environment, and says so once', async () => {
      process.env['KERNEL_API_KEY'] = 'sk-env';
      setGitHubEnv();
      const server = mockKernel();
      const logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };

      const kernel = new Kernel({ fetch: server.fetch, logger });
      new Kernel({ fetch: server.fetch, logger });
      kernel.withOptions({ maxRetries: 0 });

      await kernel.get('/browsers');
      expect(kernel.apiKey).toBe('sk-env');
      expect(server.apiCalls().map(bearer)).toEqual(['Bearer sk-env']);
      expect(server.tokenCalls()).toHaveLength(0);
      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(logger.warn.mock.calls[0]![0]).toContain('KERNEL_API_KEY and KERNEL_FEDERATION_RULE_ID');
    });

    test('the federation environment is used when there is no API key', async () => {
      process.env['KERNEL_FEDERATION_RULE_ID'] = 'wifr_env';
      process.env['KERNEL_IDENTITY_TOKEN'] = 'static-jwt-1';
      const server = mockKernel();
      const kernel = new Kernel({ fetch: server.fetch });

      await kernel.get('/browsers');

      expect(formParams(server.tokenCalls()[0]!)).toMatchObject({
        assertion: 'static-jwt-1',
        federation_rule_id: 'wifr_env',
      });
      expect(server.apiCalls().map(bearer)).toEqual(['Bearer access-1']);
    });

    test('with nothing configured, the error names the API key and the federation variables', () => {
      expect(() => new Kernel()).toThrow(KernelError);
      expect(() => new Kernel()).toThrow(/KERNEL_API_KEY environment variable is missing or empty/);
      expect(() => new Kernel()).toThrow(/KERNEL_FEDERATION_RULE_ID/);
    });

    test('a rule ID with no identity token source is not enough', () => {
      process.env['KERNEL_FEDERATION_RULE_ID'] = 'wifr_env';
      expect(() => new Kernel()).toThrow(/KERNEL_API_KEY environment variable is missing or empty/);
    });

    test('a misconfigured source fails construction', () => {
      process.env['KERNEL_FEDERATION_RULE_ID'] = 'wifr_env';
      process.env['KERNEL_IDENTITY_TOKEN_SOURCE'] = 'github_actions';
      expect(() => new Kernel()).toThrow('permissions: id-token: write');
    });
  });

  describe('GitHub Actions with no code changes', () => {
    test('detects the runner, requests an ID token and exchanges it', async () => {
      setGitHubEnv();
      const server = mockKernel();
      const kernel = new Kernel({ fetch: server.fetch });

      await kernel.get('/browsers');
      await kernel.get('/browsers');

      expect(server.calls.map((call) => call.url)).toEqual([
        `${GITHUB_REQUEST_URL}&audience=https%3A%2F%2Fauth.onkernel.com`,
        'https://auth.onkernel.com/token',
        'https://api.onkernel.com/browsers',
        'https://api.onkernel.com/browsers',
      ]);
      expect(bearer(server.identityCalls()[0]!)).toBe('Bearer runtime-token');
      expect(bearer(server.tokenCalls()[0]!)).toBeNull();
      expect(formParams(server.tokenCalls()[0]!)).toEqual({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: 'github-jwt-1',
        federation_rule_id: 'wifr_env',
        resource: 'https://api.onkernel.com',
      });
      expect(server.apiCalls().map(bearer)).toEqual(['Bearer access-1', 'Bearer access-1']);
    });

    test('concurrent first requests share one exchange', async () => {
      setGitHubEnv();
      const server = mockKernel();
      const kernel = new Kernel({ fetch: server.fetch });

      await Promise.all(Array.from({ length: 10 }, () => kernel.get('/browsers')));

      expect(server.identityCalls()).toHaveLength(1);
      expect(server.tokenCalls()).toHaveLength(1);
      expect(new Set(server.apiCalls().map(bearer))).toEqual(new Set(['Bearer access-1']));
    });

    test('exchanges a fresh ID token once the access token is close to expiry', async () => {
      setGitHubEnv();
      let now = 1_780_000_000_000;
      jest.spyOn(Date, 'now').mockImplementation(() => now);
      const server = mockKernel();
      const kernel = new Kernel({ fetch: server.fetch });

      await kernel.get('/browsers');
      now += 100_000;
      await kernel.get('/browsers');
      expect(server.tokenCalls()).toHaveLength(1);

      now += 180_000; // 18 of the 298 seconds remain
      await kernel.get('/browsers');

      expect(server.tokenCalls().map((call) => formParams(call)['assertion'])).toEqual([
        'github-jwt-1',
        'github-jwt-2',
      ]);
      expect(server.apiCalls().map(bearer)).toEqual([
        'Bearer access-1',
        'Bearer access-1',
        'Bearer access-2',
      ]);
    });
  });

  test('a failed background refresh is logged without the error or the credential', async () => {
    setGitHubEnv();
    let now = 1_780_000_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    let failTokenRequests = false;
    const server = mockKernel();
    const fetch: typeof server.fetch = async (input, init) => {
      if (failTokenRequests && String(input).endsWith('/token')) {
        throw new Error(`proxy refused body ${init?.body}`);
      }
      return server.fetch(input, init);
    };
    const logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const kernel = new Kernel({ fetch, logger, logLevel: 'debug' });
    await kernel.get('/browsers');

    failTokenRequests = true;
    now += 200_000; // advisory window
    await kernel.get('/browsers');
    await new Promise((resolve) => setImmediate(resolve));

    expect(server.identityCalls()).toHaveLength(2);
    expect(server.apiCalls().map(bearer)).toEqual(['Bearer access-1', 'Bearer access-1']);
    const logged = Object.values(logger).flatMap((level) => level.mock.calls);
    expect(logged.filter(([message]) => String(message).includes('advisory'))).toEqual([
      ['advisory credential refresh failed; serving the cached token'],
    ]);
    const everything = inspect(logged, { depth: null });
    expect(everything).not.toContain('github-jwt-2');
    expect(everything).not.toContain('runtime-token');
    expect(everything).not.toContain('access-1');
  });

  test('a failed background refresh logs the status the token endpoint answered with', async () => {
    setGitHubEnv();
    let now = 1_780_000_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    let failTokenRequests = false;
    const server = mockKernel();
    const fetch: typeof server.fetch = async (input, init) =>
      failTokenRequests && String(input).endsWith('/token') ?
        oauthError('temporarily_unavailable', 'Try again later', 503)
      : server.fetch(input, init);
    const logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const kernel = new Kernel({ fetch, logger, logLevel: 'debug' });
    await kernel.get('/browsers');

    failTokenRequests = true;
    now += 200_000;
    await kernel.get('/browsers');
    await new Promise((resolve) => setImmediate(resolve));

    expect(logger.debug).toHaveBeenCalledWith(
      'advisory credential refresh failed with status 503; serving the cached token',
    );
  });

  describe('hosts', () => {
    test('a custom API base URL without an auth base URL fails construction', () => {
      setGitHubEnv();
      expect(() => new Kernel({ baseURL: 'https://api.dev.onkernel.com' })).toThrow(WorkloadIdentityError);
      expect(() => new Kernel({ baseURL: 'https://api.dev.onkernel.com' })).toThrow('KERNEL_AUTH_BASE_URL');

      process.env['KERNEL_BASE_URL'] = 'https://api.dev.onkernel.com';
      expect(() => new Kernel()).toThrow('KERNEL_AUTH_BASE_URL');
    });

    test('a non-https KERNEL_AUTH_BASE_URL fails construction', () => {
      setGitHubEnv();
      process.env['KERNEL_AUTH_BASE_URL'] = 'http://auth.dev.onkernel.com';
      expect(() => new Kernel()).toThrow('non-https');
    });

    test('staging: KERNEL_BASE_URL and KERNEL_AUTH_BASE_URL set the endpoint, resource and audience', async () => {
      setGitHubEnv();
      process.env['KERNEL_BASE_URL'] = 'https://api.dev.onkernel.com';
      process.env['KERNEL_AUTH_BASE_URL'] = 'https://auth.dev.onkernel.com';
      const server = mockKernel();
      const kernel = new Kernel({ fetch: server.fetch });

      await kernel.get('/browsers');

      expect(server.calls.map((call) => call.url)).toEqual([
        `${GITHUB_REQUEST_URL}&audience=https%3A%2F%2Fauth.dev.onkernel.com`,
        'https://auth.dev.onkernel.com/token',
        'https://api.dev.onkernel.com/browsers',
      ]);
      expect(formParams(server.tokenCalls()[0]!)['resource']).toBe('https://api.dev.onkernel.com');
    });

    test("the client's fetchOptions apply to the identity and token requests", async () => {
      setGitHubEnv();
      const server = mockKernel();
      const dispatcher = { proxy: true };
      const kernel = new Kernel({ fetch: server.fetch, fetchOptions: { dispatcher } as any });

      await kernel.get('/browsers');

      expect((server.identityCalls()[0]!.init as any).dispatcher).toBe(dispatcher);
      expect((server.tokenCalls()[0]!.init as any).dispatcher).toBe(dispatcher);
      expect(server.tokenCalls()[0]!.method).toBe('POST');
    });
  });

  describe('401 handling', () => {
    test('drops the token and retries once with a fresh identity token', async () => {
      setGitHubEnv();
      const server = mockKernel({
        api: (_call, attempt) => (attempt === 1 ? jsonResponse({ message: 'revoked' }, 401) : undefined),
      });
      const kernel = new Kernel({ fetch: server.fetch, maxRetries: 0 });

      await kernel.post('/browsers', { body: {} });

      expect(server.tokenCalls().map((call) => formParams(call)['assertion'])).toEqual([
        'github-jwt-1',
        'github-jwt-2',
      ]);
      const api = server.apiCalls();
      expect(api.map(bearer)).toEqual(['Bearer access-1', 'Bearer access-2']);
      expect(api[0]!.headers.get('idempotency-key')).toBe(api[1]!.headers.get('idempotency-key'));

      await kernel.get('/browsers');
      expect(server.tokenCalls()).toHaveLength(2);
    });

    test('a second 401 surfaces', async () => {
      setGitHubEnv();
      const server = mockKernel({ api: () => jsonResponse({ message: 'revoked' }, 401) });
      const kernel = new Kernel({ fetch: server.fetch });

      await expect(kernel.get('/browsers')).rejects.toBeInstanceOf(AuthenticationError);
      expect(server.apiCalls().map(bearer)).toEqual(['Bearer access-1', 'Bearer access-2']);
      expect(server.tokenCalls()).toHaveLength(2);
    });

    test('a second 401 surfaces even when an ordinary retry comes in between', async () => {
      setGitHubEnv();
      const server = mockKernel({
        api: (_call, attempt) =>
          attempt === 2 ? jsonResponse({}, 503, { 'retry-after-ms': '1' }) : jsonResponse({}, 401),
      });
      const kernel = new Kernel({ fetch: server.fetch, maxRetries: 2 });

      await expect(kernel.get('/browsers')).rejects.toBeInstanceOf(AuthenticationError);
      // 401, fresh token, 503, ordinary retry, 401 again: no second refresh.
      expect(server.apiCalls().map(bearer)).toEqual([
        'Bearer access-1',
        'Bearer access-2',
        'Bearer access-2',
      ]);
      expect(server.tokenCalls()).toHaveLength(2);
    });

    test('an options object that is sent again gets a retry of its own', async () => {
      setGitHubEnv();
      const server = mockKernel({
        api: (_call, attempt) => (attempt === 1 || attempt === 3 ? jsonResponse({}, 401) : undefined),
      });
      const kernel = new Kernel({ fetch: server.fetch });
      const options = { method: 'get' as const, path: '/browsers' };

      await kernel.request(options);
      await kernel.request(options);

      expect(server.apiCalls().map(bearer)).toEqual([
        'Bearer access-1',
        'Bearer access-2',
        'Bearer access-2',
        'Bearer access-3',
      ]);
    });

    test('overlapping requests that share an options object each get one retry', async () => {
      setGitHubEnv();
      const server = mockKernel({ api: () => jsonResponse({}, 401) });
      const kernel = new Kernel({ fetch: server.fetch });
      const options = { method: 'get' as const, path: '/browsers' };

      const results = await Promise.allSettled([kernel.request(options), kernel.request(options)]);

      expect(results.map((result) => result.status)).toEqual(['rejected', 'rejected']);
      expect(server.apiCalls().map(bearer)).toEqual([
        'Bearer access-1',
        'Bearer access-1',
        'Bearer access-2',
        'Bearer access-2',
      ]);
      expect(server.tokenCalls()).toHaveLength(2);
    });

    test('a slow 401 for a shared options object is retried after a faster one refreshed', async () => {
      setGitHubEnv();
      let retryArrived!: () => void;
      const retryHasArrived = new Promise<void>((resolve) => (retryArrived = resolve));
      const server = mockKernel({
        api: (call, attempt) => {
          if (bearer(call) !== 'Bearer access-1') {
            retryArrived();
            return undefined;
          }
          // The second request's 401 arrives only after the first one's retry was sent.
          const rejected = jsonResponse({}, 401);
          return attempt === 1 ? rejected : retryHasArrived.then(() => rejected);
        },
      });
      const kernel = new Kernel({ fetch: server.fetch });
      const options = { method: 'get' as const, path: '/browsers' };

      await Promise.all([kernel.request(options), kernel.request(options)]);

      expect(server.apiCalls().map(bearer)).toEqual([
        'Bearer access-1',
        'Bearer access-1',
        'Bearer access-2',
        'Bearer access-2',
      ]);
      expect(server.tokenCalls()).toHaveLength(2);
    });

    test('each request gets its own retry', async () => {
      setGitHubEnv();
      const server = mockKernel({
        api: (_call, attempt) => (attempt === 1 || attempt === 3 ? jsonResponse({}, 401) : undefined),
      });
      const kernel = new Kernel({ fetch: server.fetch });

      await kernel.get('/browsers');
      await kernel.get('/browsers');

      expect(server.apiCalls().map(bearer)).toEqual([
        'Bearer access-1',
        'Bearer access-2',
        'Bearer access-2',
        'Bearer access-3',
      ]);
    });

    test('requests that fail together with the same token share one re-exchange', async () => {
      setGitHubEnv();
      const server = mockKernel({
        api: (call) => (bearer(call) === 'Bearer access-1' ? jsonResponse({}, 401) : undefined),
      });
      const kernel = new Kernel({ fetch: server.fetch });

      await Promise.all(Array.from({ length: 5 }, () => kernel.get('/browsers')));

      expect(server.tokenCalls()).toHaveLength(2);
      expect(server.apiCalls().filter((call) => bearer(call) === 'Bearer access-2')).toHaveLength(5);
    });

    test('is not retried with an API key', async () => {
      const server = mockKernel({ api: () => jsonResponse({}, 401) });
      const kernel = new Kernel({ apiKey: 'sk-test', fetch: server.fetch });

      await expect(kernel.get('/browsers')).rejects.toBeInstanceOf(AuthenticationError);
      expect(server.apiCalls()).toHaveLength(1);
    });

    test('is not retried when the request did not carry the access token', async () => {
      setGitHubEnv();
      const server = mockKernel({ api: () => jsonResponse({}, 401) });
      const kernel = new Kernel({ fetch: server.fetch });

      await expect(
        kernel.get('/browsers', { headers: { Authorization: 'Bearer my-own-token' } }),
      ).rejects.toBeInstanceOf(AuthenticationError);
      await expect(kernel.get('/browsers', { headers: { Authorization: null } })).rejects.toBeInstanceOf(
        AuthenticationError,
      );

      expect(server.apiCalls().map(bearer)).toEqual(['Bearer my-own-token', null]);
      expect(server.tokenCalls()).toHaveLength(1);
    });

    test('is not retried when another host answered', async () => {
      setGitHubEnv();
      const server = mockKernel({
        api: () => {
          const response = jsonResponse({}, 401);
          Object.defineProperty(response, 'url', { value: 'https://browser-vm.example/process/exec' });
          return response;
        },
      });
      const kernel = new Kernel({ fetch: server.fetch });

      await expect(kernel.get('/browsers')).rejects.toBeInstanceOf(AuthenticationError);
      expect(server.apiCalls()).toHaveLength(1);
      expect(server.tokenCalls()).toHaveLength(1);
    });
  });

  describe('static identity token', () => {
    test('works for one access token, then fails with an explanation instead of replaying', async () => {
      process.env['KERNEL_FEDERATION_RULE_ID'] = 'wifr_env';
      process.env['KERNEL_IDENTITY_TOKEN'] = 'static-jwt-2';
      const server = mockKernel({
        api: (_call, attempt) => (attempt === 2 ? jsonResponse({}, 401) : undefined),
      });
      const kernel = new Kernel({ fetch: server.fetch });

      await kernel.get('/browsers');
      const err = await rejection(kernel.get('/browsers'));

      expect(err.message).toMatch(/already been exchanged once/);
      expect(err.message).toMatch(/KERNEL_IDENTITY_TOKEN/);
      expect(server.tokenCalls()).toHaveLength(1);
    });

    test('a second client in the same process does not send it again', async () => {
      process.env['KERNEL_FEDERATION_RULE_ID'] = 'wifr_env';
      process.env['KERNEL_IDENTITY_TOKEN'] = 'static-jwt-3';
      const server = mockKernel();

      await new Kernel({ fetch: server.fetch }).get('/browsers');
      await expect(new Kernel({ fetch: server.fetch }).get('/browsers')).rejects.toThrow(
        /already been exchanged once/,
      );
      expect(server.tokenCalls()).toHaveLength(1);
    });

    test('fails the same way when the access token expires', async () => {
      let now = 1_780_000_000_000;
      jest.spyOn(Date, 'now').mockImplementation(() => now);
      const server = mockKernel();
      const kernel = new Kernel({
        credentials: oidcFederationProvider({
          identityTokenProvider: identityTokenFromValue('static-jwt'),
          federationRuleId: 'wifr_123',
        }),
        fetch: server.fetch,
      });

      await kernel.get('/browsers');
      now += 299_000;
      await expect(kernel.get('/browsers')).rejects.toThrow(/already been exchanged once/);
      expect(server.tokenCalls()).toHaveLength(1);
      expect(server.apiCalls()).toHaveLength(1);
    });
  });

  test('a replayed identity token surfaces the hint from the token endpoint', async () => {
    const server = mockKernel({
      api: (_call, attempt) => (attempt === 2 ? jsonResponse({}, 401) : undefined),
    });
    const kernel = new Kernel({
      credentials: oidcFederationProvider({
        identityTokenProvider: () => 'the-same-jwt-every-time',
        federationRuleId: 'wifr_123',
      }),
      fetch: server.fetch,
    });

    await kernel.get('/browsers');
    const err = await rejection(kernel.get('/browsers'));

    expect(err.statusCode).toBe(400);
    expect(err.errorCode).toBe('invalid_grant');
    expect(err.errorDescription).toBe('Credential was already used');
    expect(err.message).toBe(
      'Token exchange failed with status 400: invalid_grant: Credential was already used. Every exchange needs a fresh provider token, and the identity token provider returned one that was already exchanged.',
    );
  });

  describe('withOptions', () => {
    test('a copy shares the token cache', async () => {
      setGitHubEnv();
      const server = mockKernel();
      const kernel = new Kernel({ fetch: server.fetch });
      const copy = kernel.withOptions({ timeout: 5000, maxRetries: 0 });

      await copy.get('/browsers');
      await kernel.get('/browsers');
      await copy.withOptions({ project: 'other' }).get('/browsers');

      expect(server.tokenCalls()).toHaveLength(1);
      expect(server.apiCalls().map(bearer)).toEqual([
        'Bearer access-1',
        'Bearer access-1',
        'Bearer access-1',
      ]);
    });

    test('a copy with another base URL gets its own token for that API', async () => {
      setGitHubEnv();
      process.env['KERNEL_AUTH_BASE_URL'] = 'https://auth.dev.onkernel.com';
      const server = mockKernel();
      const kernel = new Kernel({ fetch: server.fetch });
      const copy = kernel.withOptions({ baseURL: 'https://api.dev.onkernel.com/' });

      await kernel.get('/browsers');
      await copy.get('/browsers');

      expect(server.tokenCalls().map((call) => formParams(call)['resource'])).toEqual([
        'https://api.onkernel.com',
        'https://api.dev.onkernel.com',
      ]);
      expect(server.apiCalls().map((call) => [call.url, bearer(call)])).toEqual([
        ['https://api.onkernel.com/browsers', 'Bearer access-1'],
        ['https://api.dev.onkernel.com/browsers', 'Bearer access-2'],
      ]);
    });

    test('a copy whose base URL changes through the environment does not reuse the token', async () => {
      setGitHubEnv();
      process.env['KERNEL_AUTH_BASE_URL'] = 'https://auth.dev.onkernel.com';
      const server = mockKernel();
      const kernel = new Kernel({ baseURL: 'https://api.onkernel.com/', fetch: server.fetch });
      await kernel.get('/browsers');

      process.env['KERNEL_BASE_URL'] = 'https://api.dev.onkernel.com/';
      const copy = kernel.withOptions({ baseURL: undefined });
      await copy.get('/browsers');

      expect(copy.baseURL).toBe('https://api.dev.onkernel.com/');
      expect(server.tokenCalls().map((call) => formParams(call)['resource'])).toEqual([
        'https://api.onkernel.com',
        'https://api.dev.onkernel.com',
      ]);
      expect(server.apiCalls().map(bearer)).toEqual(['Bearer access-1', 'Bearer access-2']);
    });

    test('a copy with another fetch requests its own token through that fetch', async () => {
      setGitHubEnv();
      const server = mockKernel();
      const other = mockKernel();
      const kernel = new Kernel({ fetch: server.fetch });
      await kernel.get('/browsers');

      await kernel.withOptions({ fetch: other.fetch }).get('/browsers');

      expect(server.tokenCalls()).toHaveLength(1);
      expect(other.tokenCalls()).toHaveLength(1);
      expect(other.apiCalls()).toHaveLength(1);
    });

    test('a client whose baseURL is assigned later requests a token for the new API', async () => {
      setGitHubEnv();
      process.env['KERNEL_AUTH_BASE_URL'] = 'https://auth.dev.onkernel.com';
      const server = mockKernel();
      const kernel = new Kernel({ fetch: server.fetch });
      const copy = kernel.withOptions({});
      await kernel.get('/browsers');

      kernel.baseURL = 'https://api.dev.onkernel.com/';
      await kernel.get('/browsers');
      await copy.get('/browsers');

      expect(server.tokenCalls().map((call) => formParams(call)['resource'])).toEqual([
        'https://api.onkernel.com',
        'https://api.dev.onkernel.com',
      ]);
      expect(server.apiCalls().map((call) => [call.url, bearer(call)])).toEqual([
        ['https://api.onkernel.com/browsers', 'Bearer access-1'],
        ['https://api.dev.onkernel.com/browsers', 'Bearer access-2'],
        ['https://api.onkernel.com/browsers', 'Bearer access-1'],
      ]);
    });

    test('a client whose baseURL is assigned later, with no auth base URL, sends nothing', async () => {
      setGitHubEnv();
      const server = mockKernel();
      const kernel = new Kernel({ fetch: server.fetch });

      kernel.baseURL = 'https://api.dev.onkernel.com/';
      await expect(kernel.get('/browsers')).rejects.toThrow('KERNEL_AUTH_BASE_URL');
      expect(server.calls).toHaveLength(0);
    });

    test('a copy with another base URL and no auth base URL is refused', () => {
      setGitHubEnv();
      const kernel = new Kernel();
      expect(() => kernel.withOptions({ baseURL: 'https://api.dev.onkernel.com/' })).toThrow(
        'KERNEL_AUTH_BASE_URL',
      );
    });

    test('apiKey replaces credentials', async () => {
      const server = mockKernel();
      const kernel = new Kernel({
        credentials: async () => ({ token: 'from-credentials', expiresAt: null }),
        fetch: server.fetch,
      });
      const copy = kernel.withOptions({ apiKey: 'sk-copy' });

      await copy.get('/browsers');
      await copy.withOptions({}).get('/browsers');
      await kernel.get('/browsers');

      expect(copy.apiKey).toBe('sk-copy');
      expect(server.apiCalls().map(bearer)).toEqual([
        'Bearer sk-copy',
        'Bearer sk-copy',
        'Bearer from-credentials',
      ]);
    });

    test('credentials replace an API key', async () => {
      const server = mockKernel();
      const kernel = new Kernel({ apiKey: 'sk-test', fetch: server.fetch });
      const copy = kernel.withOptions({
        credentials: async () => ({ token: 'from-credentials', expiresAt: null }),
      });

      await copy.get('/browsers');
      await kernel.get('/browsers');

      expect(copy.apiKey).toBe('');
      expect(server.apiCalls().map(bearer)).toEqual(['Bearer from-credentials', 'Bearer sk-test']);
    });

    test('credentials replace other credentials', async () => {
      const server = mockKernel();
      const kernel = new Kernel({
        credentials: async () => ({ token: 'first', expiresAt: null }),
        fetch: server.fetch,
      });
      const copy = kernel.withOptions({ credentials: async () => ({ token: 'second', expiresAt: null }) });

      await kernel.get('/browsers');
      await copy.get('/browsers');

      expect(server.apiCalls().map(bearer)).toEqual(['Bearer first', 'Bearer second']);
    });

    test('apiKey and credentials together are refused', () => {
      const kernel = new Kernel({ apiKey: 'sk-test' });
      expect(() =>
        kernel.withOptions({ apiKey: 'sk-copy', credentials: async () => ({ token: 't', expiresAt: null }) }),
      ).toThrow('mutually exclusive');
    });
  });

  test('a token file that was not rotated fails with advice about the file', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kernel-client-credentials-'));
    try {
      const tokenFile = path.join(dir, 'token');
      fs.writeFileSync(tokenFile, 'projected-token\n');
      process.env['KERNEL_FEDERATION_RULE_ID'] = 'wifr_env';
      process.env['KERNEL_IDENTITY_TOKEN_FILE'] = tokenFile;
      const server = mockKernel({
        api: (_call, attempt) => (attempt === 2 ? jsonResponse({}, 401) : undefined),
      });
      const kernel = new Kernel({ fetch: server.fetch });

      await kernel.get('/browsers');
      const err = await rejection(kernel.get('/browsers'));

      expect(err.errorDescription).toBe('Credential was already used');
      expect(err.message).toContain(`the identity token file at ${tokenFile} held the same token`);
      expect(err.message).toContain('must replace the token before each refresh');
      expect(err.message).toContain('Kubernetes');
      expect(err.message).not.toContain('KERNEL_IDENTITY_TOKEN can be exchanged only once');
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });

  test('a static KERNEL_IDENTITY_TOKEN that another process already exchanged keeps the static advice', async () => {
    process.env['KERNEL_FEDERATION_RULE_ID'] = 'wifr_env';
    process.env['KERNEL_IDENTITY_TOKEN'] = 'static-jwt-spent-elsewhere';
    const server = mockKernel();
    await server.fetch('https://auth.onkernel.com/token', {
      method: 'POST',
      body: 'assertion=static-jwt-spent-elsewhere',
    });

    const err = await rejection(new Kernel({ fetch: server.fetch }).get('/browsers'));
    expect(err.message).toContain('a static KERNEL_IDENTITY_TOKEN can be exchanged only once');
  });

  test('reads a Kubernetes projected token again for each exchange', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kernel-client-credentials-'));
    try {
      const tokenFile = path.join(dir, 'token');
      fs.writeFileSync(tokenFile, 'projected-token-1\n');
      process.env['KERNEL_FEDERATION_RULE_ID'] = 'wifr_env';
      process.env['KERNEL_IDENTITY_TOKEN_FILE'] = tokenFile;
      const server = mockKernel({
        api: (_call, attempt) => (attempt === 2 ? jsonResponse({}, 401) : undefined),
      });
      const kernel = new Kernel({ fetch: server.fetch });

      await kernel.get('/browsers');
      fs.writeFileSync(tokenFile, 'projected-token-2\n');
      await kernel.get('/browsers');

      expect(server.tokenCalls().map((call) => formParams(call)['assertion'])).toEqual([
        'projected-token-1',
        'projected-token-2',
      ]);
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });
});
