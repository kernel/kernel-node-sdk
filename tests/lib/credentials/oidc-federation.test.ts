import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  type IdentityTokenProvider,
  WorkloadIdentityError,
  exchangeFederationAssertion,
  identityTokenFromFile,
  identityTokenFromGCPMetadata,
  identityTokenFromValue,
  oidcFederationProvider,
} from '@onkernel/sdk/lib/credentials';
import { redactSensitive } from '@onkernel/sdk/lib/credentials/types';
import { VERSION } from '@onkernel/sdk/version';
import {
  formParams,
  isolateCredentialEnv,
  jsonResponse,
  mockFetch,
  oauthError,
  providerTokens,
  tokenResponse,
} from './helpers';

const GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:jwt-bearer';

async function rejection(promise: Promise<unknown>): Promise<WorkloadIdentityError> {
  const err = await promise.then(
    () => undefined,
    (e) => e,
  );
  expect(err).toBeInstanceOf(WorkloadIdentityError);
  return err;
}

describe('oidcFederationProvider', () => {
  isolateCredentialEnv();

  let now = 1_780_000_000;
  beforeEach(() => {
    now = 1_780_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now * 1000);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('posts exactly the four form parameters and no Authorization header', async () => {
    const { fetch, calls } = mockFetch(() => jsonResponse(tokenResponse()));
    const assertion = providerTokens.github();
    const provider = oidcFederationProvider({
      identityTokenProvider: () => assertion,
      federationRuleId: 'wifr_123',
      fetch,
    });

    const token = await provider();

    expect(calls).toHaveLength(1);
    const call = calls[0]!;
    expect(call.url).toBe('https://auth.onkernel.com/token');
    expect(call.method).toBe('POST');
    expect(call.headers.get('content-type')).toBe('application/x-www-form-urlencoded');
    expect(call.headers.get('authorization')).toBeNull();
    expect(call.headers.get('user-agent')).toBe(`Kernel/JS ${VERSION} oidcFederationProvider`);
    expect(call.init?.redirect).toBe('manual');
    expect(formParams(call)).toEqual({
      grant_type: GRANT_TYPE,
      assertion,
      federation_rule_id: 'wifr_123',
      resource: 'https://api.onkernel.com',
    });
    expect([...new URLSearchParams(call.body).keys()]).toHaveLength(4);

    expect(token).toEqual({
      token: 'kernel-access-token',
      expiresAt: now + 298,
      expiresIn: 298,
      scope: 'browsers:create browsers:use browsers:delete',
      orgId: 'org_123',
      accessScope: 'project',
      projectId: 'proj_123',
      principal: { type: 'service_account', id: 'svc_123' },
      federationRuleId: 'wifr_123',
    });
  });

  test.each(Object.entries(providerTokens))('sends a %s token unchanged', async (_name, makeToken) => {
    const { fetch, calls } = mockFetch(() => jsonResponse(tokenResponse()));
    const assertion = makeToken();
    await oidcFederationProvider({
      identityTokenProvider: () => assertion,
      federationRuleId: 'wifr_123',
      fetch,
    })();
    expect(formParams(calls[0]!)['assertion']).toBe(assertion);
  });

  test('asks the identity token provider for a fresh token on every exchange', async () => {
    const { fetch, calls } = mockFetch(() => jsonResponse(tokenResponse()));
    let count = 0;
    const provider = oidcFederationProvider({
      identityTokenProvider: async () => `assertion-${++count}`,
      federationRuleId: 'wifr_123',
      fetch,
    });

    await provider();
    await provider();
    await provider({ forceRefresh: true });

    expect(calls.map((call) => formParams(call)['assertion'])).toEqual([
      'assertion-1',
      'assertion-2',
      'assertion-3',
    ]);
  });

  test('passes the auth base URL as the audience, and its fetch, to the identity token provider', async () => {
    const { fetch } = mockFetch(() => jsonResponse(tokenResponse()));
    const identityTokenProvider = jest.fn(() => 'assertion');
    await oidcFederationProvider({
      identityTokenProvider,
      federationRuleId: 'wifr_123',
      authBaseURL: 'https://auth.dev.onkernel.com/',
      resource: 'https://api.dev.onkernel.com',
      fetch,
    })();
    expect(identityTokenProvider).toHaveBeenCalledWith({ audience: 'https://auth.dev.onkernel.com', fetch });
  });

  describe('hosts', () => {
    const run = async (config: { authBaseURL?: string; resource?: string }, client?: { baseURL: string }) => {
      const { fetch, calls } = mockFetch(() => jsonResponse(tokenResponse()));
      const provider = oidcFederationProvider({
        identityTokenProvider: () => 'assertion',
        federationRuleId: 'wifr_123',
        ...config,
      });
      await provider(client ? { client: { ...client, fetch } } : { client: { baseURL: '', fetch } });
      return { url: calls[0]!.url, resource: formParams(calls[0]!)['resource'] };
    };

    test('default to production', async () => {
      expect(await run({})).toEqual({
        url: 'https://auth.onkernel.com/token',
        resource: 'https://api.onkernel.com',
      });
    });

    test('the production API base URL with a trailing slash still means production', async () => {
      expect(await run({}, { baseURL: 'https://api.onkernel.com/' })).toEqual({
        url: 'https://auth.onkernel.com/token',
        resource: 'https://api.onkernel.com',
      });
    });

    test('a custom API base URL without an auth base URL is a configuration error', async () => {
      const err = await rejection(run({}, { baseURL: 'https://api.dev.onkernel.com/' }));
      expect(err.message).toContain('KERNEL_AUTH_BASE_URL');
      expect(err.message).toContain('https://api.dev.onkernel.com/');
    });

    test('KERNEL_AUTH_BASE_URL pairs with a custom API base URL, whose origin is the resource', async () => {
      process.env['KERNEL_AUTH_BASE_URL'] = 'https://auth.dev.onkernel.com';
      expect(await run({}, { baseURL: 'https://api.dev.onkernel.com/' })).toEqual({
        url: 'https://auth.dev.onkernel.com/token',
        resource: 'https://api.dev.onkernel.com',
      });
    });

    test('explicit options win over the environment and the client', async () => {
      process.env['KERNEL_AUTH_BASE_URL'] = 'https://auth.dev.onkernel.com';
      expect(
        await run(
          { authBaseURL: 'https://auth.example.com', resource: 'https://api.example.com' },
          { baseURL: 'https://api.dev.onkernel.com/' },
        ),
      ).toEqual({ url: 'https://auth.example.com/token', resource: 'https://api.example.com' });
    });

    test('KERNEL_BASE_URL stands in for the client when there is none', async () => {
      process.env['KERNEL_BASE_URL'] = 'https://api.dev.onkernel.com';
      const err = await rejection(run({}));
      expect(err.message).toContain('KERNEL_AUTH_BASE_URL');
    });
  });

  describe('https enforcement', () => {
    test.each(['http://auth.onkernel.com', 'http://10.0.0.5:8080', 'ftp://auth.onkernel.com'])(
      'refuses %s before asking for an identity token',
      async (authBaseURL) => {
        const { fetch, calls } = mockFetch(() => jsonResponse(tokenResponse()));
        const identityTokenProvider = jest.fn(() => 'assertion');
        const provider = oidcFederationProvider({
          identityTokenProvider,
          federationRuleId: 'wifr_123',
          authBaseURL,
          fetch,
        });

        const err = await rejection(provider());
        expect(err.message).toContain('non-https');
        expect(identityTokenProvider).not.toHaveBeenCalled();
        expect(calls).toHaveLength(0);
      },
    );

    test.each(['http://localhost:3001', 'http://127.0.0.1:3001', 'http://[::1]:3001'])(
      'allows %s',
      async (authBaseURL) => {
        const { fetch, calls } = mockFetch(() => jsonResponse(tokenResponse()));
        await oidcFederationProvider({
          identityTokenProvider: () => 'assertion',
          federationRuleId: 'wifr_123',
          authBaseURL,
          fetch,
        })();
        expect(calls[0]!.url).toBe(`${authBaseURL}/token`);
      },
    );
  });

  describe('size limits', () => {
    test('rejects an assertion over 16 KiB without sending it', async () => {
      const { fetch, calls } = mockFetch(() => jsonResponse(tokenResponse()));
      const provider = oidcFederationProvider({
        identityTokenProvider: () => 'a'.repeat(16 * 1024 + 1),
        federationRuleId: 'wifr_123',
        fetch,
      });

      const err = await rejection(provider());
      expect(err.message).toContain('16 KiB');
      expect(calls).toHaveLength(0);
    });

    test('accepts an assertion of exactly 16 KiB', async () => {
      const { fetch, calls } = mockFetch(() => jsonResponse(tokenResponse()));
      await oidcFederationProvider({
        identityTokenProvider: () => 'a'.repeat(16 * 1024),
        federationRuleId: 'wifr_123',
        fetch,
      })();
      expect(calls).toHaveLength(1);
    });

    test('rejects an empty assertion', async () => {
      const { fetch, calls } = mockFetch(() => jsonResponse(tokenResponse()));
      const err = await rejection(
        oidcFederationProvider({ identityTokenProvider: () => '', federationRuleId: 'wifr_123', fetch })(),
      );
      expect(err.message).toContain('empty');
      expect(calls).toHaveLength(0);
    });

    test('reads at most 1 MiB of the response', async () => {
      const chunk = new Uint8Array(64 * 1024).fill(0x20);
      let pulled = 0;
      let cancelled = false;
      const body = new ReadableStream<Uint8Array>({
        pull(controller) {
          pulled += chunk.length;
          controller.enqueue(chunk);
        },
        cancel() {
          cancelled = true;
        },
      });
      const { fetch } = mockFetch(() => new Response(body, { status: 200 }));

      const err = await rejection(
        oidcFederationProvider({
          identityTokenProvider: () => 'assertion',
          federationRuleId: 'wifr_123',
          fetch,
        })(),
      );
      expect(err.message).toContain('not a JSON object');
      expect(cancelled).toBe(true);
      expect(pulled).toBeLessThanOrEqual((1 << 20) + 2 * chunk.length);
    });
  });

  describe('errors', () => {
    const failWith = (response: () => Response) => {
      const { fetch } = mockFetch(response);
      return rejection(
        oidcFederationProvider({
          identityTokenProvider: () => providerTokens.github(),
          federationRuleId: 'wifr_123',
          fetch,
        })(),
      );
    };

    test('exposes the status, OAuth error code, description and request ID', async () => {
      const err = await failWith(() =>
        jsonResponse(
          { error: 'invalid_grant', error_description: 'Credential is invalid, expired, or revoked' },
          400,
          { 'x-request-id': 'req_abc' },
        ),
      );
      expect(err.name).toBe('WorkloadIdentityError');
      expect(err.statusCode).toBe(400);
      expect(err.errorCode).toBe('invalid_grant');
      expect(err.errorDescription).toBe('Credential is invalid, expired, or revoked');
      expect(err.requestId).toBe('req_abc');
      expect(err.message).toBe(
        'Token exchange failed with status 400 (request ID req_abc): invalid_grant: Credential is invalid, expired, or revoked',
      );
    });

    describe('replay hint, when the credential was already used', () => {
      const replayWith = async (identityTokenProvider: IdentityTokenProvider) => {
        const { fetch } = mockFetch(() => oauthError('invalid_grant', 'Credential was already used'));
        const err = await rejection(
          oidcFederationProvider({ identityTokenProvider, federationRuleId: 'wifr_123', fetch })(),
        );
        expect(err.errorCode).toBe('invalid_grant');
        return err.message;
      };
      const prefix = 'Token exchange failed with status 400: invalid_grant: Credential was already used. ';

      test('a callback gets the generic wording', async () => {
        expect(await replayWith(() => providerTokens.github())).toBe(
          prefix +
            'Every exchange needs a fresh provider token, and the identity token provider returned one that was already exchanged.',
        );
      });

      test('a static value gets the single-use wording', async () => {
        expect(await replayWith(identityTokenFromValue(providerTokens.github()))).toBe(
          prefix +
            'Every exchange needs a fresh provider token; a static KERNEL_IDENTITY_TOKEN can be exchanged only once.',
        );
      });

      test('a file names the file, says to rotate it, and mentions issuer reuse for Kubernetes', async () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kernel-replay-hint-'));
        const file = path.join(dir, 'token');
        fs.writeFileSync(file, providerTokens.kubernetes());
        try {
          expect(await replayWith(identityTokenFromFile(file))).toBe(
            prefix +
              `Every exchange needs a fresh provider token, and the identity token file at ${file} held the same token as a previous exchange. Whatever writes that file must replace the token before each refresh. For a Kubernetes projected service account token, which the kubelet replaces only as it nears expiry, configure the issuer in Kernel to allow reuse instead.`,
          );
        } finally {
          fs.rmSync(dir, { recursive: true });
        }
      });

      test('the built-in request sources get the generic wording', async () => {
        const message = await replayWith(
          identityTokenFromGCPMetadata({ fetch: async () => new Response(providerTokens.google()) }),
        );
        expect(message).toContain('the identity token provider returned one that was already exchanged');
        expect(message).not.toContain('KERNEL_IDENTITY_TOKEN');
      });
    });

    test('adds no replay hint to other invalid_grant errors', async () => {
      const err = await failWith(() =>
        oauthError('invalid_grant', 'Credential is invalid, expired, or revoked'),
      );
      expect(err.message).not.toContain('fresh provider token');
    });

    test('names the rejected resource on invalid_target', async () => {
      const err = await failWith(() => oauthError('invalid_target', 'Requested resource is not allowed'));
      expect(err.message).toContain('"https://api.onkernel.com"');
    });

    test('reports 503 temporarily_unavailable', async () => {
      const err = await failWith(() => oauthError('temporarily_unavailable', 'Try again later', 503));
      expect(err.statusCode).toBe(503);
      expect(err.errorCode).toBe('temporarily_unavailable');
    });

    test('keeps only the OAuth error fields of an error body', async () => {
      const assertion = providerTokens.github();
      const err = await failWith(() =>
        jsonResponse(
          {
            error: 'invalid_request',
            error_description: 'Unsupported parameter',
            error_uri: 'https://docs.onkernel.com/errors',
            assertion,
            access_token: 'leaked-access-token',
            debug: { assertion },
          },
          400,
        ),
      );
      expect(err.body).toEqual({
        error: 'invalid_request',
        error_description: 'Unsupported parameter',
        error_uri: 'https://docs.onkernel.com/errors',
      });
      expect(JSON.stringify([err.message, err.body])).not.toContain(assertion);
      expect(err.message).not.toContain('leaked-access-token');
    });

    test('drops error fields that are not strings', async () => {
      const assertion = providerTokens.github();
      const err = await failWith(() =>
        jsonResponse(
          { error: 'invalid_request', error_description: { assertion }, error_uri: [assertion] },
          400,
        ),
      );
      expect(err.body).toEqual({ error: 'invalid_request' });
      expect(err.errorDescription).toBeNull();
      expect(err.message).not.toContain(assertion);
    });

    test('removes the assertion from an error description that echoes it', async () => {
      const assertion = providerTokens.github();
      const err = await failWith(() => oauthError('invalid_grant', `Cannot verify ${assertion}`));
      expect(err.errorDescription).toBe('Cannot verify [redacted]');
      expect(JSON.stringify([err.message, err.body])).not.toContain(assertion);
    });

    test('discards an error body that is not an OAuth error', async () => {
      const assertion = providerTokens.github();
      for (const body of [
        `<html>Bad gateway. Request was: assertion=${assertion}&x=1 proxy-password=hunter2</html>`,
        JSON.stringify([assertion]),
        JSON.stringify({ message: `rejected ${assertion}` }),
      ]) {
        const err = await failWith(() => new Response(body, { status: 502 }));
        expect(err.statusCode).toBe(502);
        expect(err.errorCode).toBeNull();
        expect(err.message).toBe('Token exchange failed with status 502: the response is not an OAuth error');
        expect(JSON.stringify(err.body)).not.toContain(assertion);
      }
    });

    test('does not follow a redirect', async () => {
      const err = await failWith(
        () => new Response(null, { status: 302, headers: { Location: 'https://elsewhere.example/token' } }),
      );
      expect(err.statusCode).toBe(302);
    });

    test('reports a network failure with its causes', async () => {
      const { fetch } = mockFetch(() => {
        const err = new TypeError('fetch failed');
        (err as any).cause = new Error('connect ECONNREFUSED 10.0.0.1:443');
        throw err;
      });
      const err = await rejection(
        oidcFederationProvider({
          identityTokenProvider: () => providerTokens.github(),
          federationRuleId: 'wifr_123',
          fetch,
        })(),
      );
      expect(err.message).toBe(
        'Failed to reach token endpoint https://auth.onkernel.com/token: TypeError: fetch failed: Error: connect ECONNREFUSED 10.0.0.1:443',
      );
      expect(err.statusCode).toBeNull();
    });

    test('keeps the assertion out of a network failure that quotes the request', async () => {
      const assertion = providerTokens.github();
      const { fetch } = mockFetch((call) => {
        const err = new Error(`proxy refused body ${call.body}`);
        (err as any).cause = new Error(`while sending ${assertion}`);
        throw err;
      });
      const err = await rejection(
        oidcFederationProvider({
          identityTokenProvider: () => assertion,
          federationRuleId: 'wifr_123',
          fetch,
        })(),
      );
      expect(err.message).toContain('assertion=[redacted]');
      expect(err.message).toContain('while sending [redacted]');
      // The thrown error is not attached: printing the error must not print the assertion.
      expect((err as any).cause).toBeUndefined();
      expect(require('node:util').inspect(err)).not.toContain(assertion);
    });

    test('times out a token request that never answers', async () => {
      const { fetch } = mockFetch(
        (call) =>
          new Promise<Response>((_resolve, reject) => {
            call.init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
          }),
      );
      const err = await rejection(
        oidcFederationProvider({
          identityTokenProvider: () => 'assertion',
          federationRuleId: 'wifr_123',
          fetch,
          timeout: 10,
        })(),
      );
      expect(err.message).toContain('timed out after 10ms');
    });

    test.each([
      ['no access_token', tokenResponse({ access_token: undefined }), 'access_token is missing'],
      ['a non-Bearer token_type', tokenResponse({ token_type: 'MAC' }), 'token_type is not Bearer'],
      ['a null token_type', tokenResponse({ token_type: null }), 'token_type is not Bearer'],
      ['no expires_in', tokenResponse({ expires_in: undefined }), 'expires_in'],
      ['a non-numeric expires_in', tokenResponse({ expires_in: 'soon' }), 'expires_in'],
      ['a JSON array', [], 'not a JSON object'],
    ])('rejects a success response with %s, without echoing it', async (_name, body, problem) => {
      const err = await failWith(() => jsonResponse(body));
      expect(err.message).toContain(problem);
      expect(err.message).not.toContain('kernel-access-token');
      expect(err.body).toBeNull();
    });
  });

  test('accepts token_type in any case, and a response without one', async () => {
    for (const token_type of ['bearer', 'BEARER', undefined]) {
      const { fetch } = mockFetch(() => jsonResponse(tokenResponse({ token_type })));
      const token = await oidcFederationProvider({
        identityTokenProvider: () => 'assertion',
        federationRuleId: 'wifr_123',
        fetch,
      })();
      expect(token.token).toBe('kernel-access-token');
    }
  });

  test('treats expires_in as authoritative, down to one second', async () => {
    const { fetch } = mockFetch(() => jsonResponse(tokenResponse({ expires_in: 1 })));
    const token = await oidcFederationProvider({
      identityTokenProvider: () => 'assertion',
      federationRuleId: 'wifr_123',
      fetch,
    })();
    expect(token.expiresAt).toBe(now + 1);
  });

  test('requires a federation rule ID', () => {
    expect(() => oidcFederationProvider({ identityTokenProvider: () => 'a', federationRuleId: '' })).toThrow(
      WorkloadIdentityError,
    );
  });

  test('redactSensitive keeps only the OAuth error fields that are strings', () => {
    expect(
      redactSensitive({ error: 'e', error_description: 'd', error_uri: 'u', assertion: 'secret', extra: 1 }),
    ).toEqual({ error: 'e', error_description: 'd', error_uri: 'u' });
    expect(redactSensitive({ error: { nested: 'secret' } })).toEqual({});

    const secret = 'eyJhbGciOiJSUzI1NiJ9/+';
    expect(
      redactSensitive({ error_description: `saw ${secret} and ${encodeURIComponent(secret)}` }, [secret]),
    ).toEqual({ error_description: 'saw [redacted] and [redacted]' });
    expect(redactSensitive({ error: 'no secret is nothing to remove' }, [''])).toEqual({
      error: 'no secret is nothing to remove',
    });

    for (const notAnObject of ['{"error":"e"}', ['secret'], null, undefined, 7]) {
      expect(redactSensitive(notAnObject)).toBeNull();
    }
  });
});

describe('exchangeFederationAssertion', () => {
  isolateCredentialEnv();

  test('exchanges one assertion and returns the token with its details', async () => {
    const { fetch, calls } = mockFetch(() => jsonResponse(tokenResponse()));
    const assertion = providerTokens.kubernetes();
    const before = Date.now() / 1000;

    const result = await exchangeFederationAssertion({
      assertion,
      federationRuleId: 'wifr_123',
      resource: 'https://api.dev.onkernel.com',
      authBaseURL: 'https://auth.dev.onkernel.com',
      fetch,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe('https://auth.dev.onkernel.com/token');
    expect(calls[0]!.headers.get('authorization')).toBeNull();
    expect(calls[0]!.headers.get('user-agent')).toBe(`Kernel/JS ${VERSION} exchangeFederationAssertion`);
    expect(formParams(calls[0]!)).toEqual({
      grant_type: GRANT_TYPE,
      assertion,
      federation_rule_id: 'wifr_123',
      resource: 'https://api.dev.onkernel.com',
    });
    expect(result).toMatchObject({
      accessToken: 'kernel-access-token',
      expiresIn: 298,
      scope: 'browsers:create browsers:use browsers:delete',
      projectId: 'proj_123',
      principal: { type: 'service_account', id: 'svc_123' },
      federationRuleId: 'wifr_123',
    });
    expect(result.expiresAt).toBeGreaterThanOrEqual(before + 298);
    expect(result.expiresAt).toBeLessThanOrEqual(Date.now() / 1000 + 298);
  });

  test('defaults to production and reads KERNEL_AUTH_BASE_URL', async () => {
    const { fetch, calls } = mockFetch(() => jsonResponse(tokenResponse()));
    await exchangeFederationAssertion({ assertion: 'a', federationRuleId: 'wifr_123', fetch });
    expect(calls[0]!.url).toBe('https://auth.onkernel.com/token');
    expect(formParams(calls[0]!)['resource']).toBe('https://api.onkernel.com');

    process.env['KERNEL_AUTH_BASE_URL'] = 'https://auth.dev.onkernel.com';
    process.env['KERNEL_BASE_URL'] = 'https://api.dev.onkernel.com/';
    await exchangeFederationAssertion({ assertion: 'a', federationRuleId: 'wifr_123', fetch });
    expect(calls[1]!.url).toBe('https://auth.dev.onkernel.com/token');
    expect(formParams(calls[1]!)['resource']).toBe('https://api.dev.onkernel.com');
  });

  test('throws a WorkloadIdentityError with the replay hint', async () => {
    const { fetch } = mockFetch(() => oauthError('invalid_grant', 'Credential was already used'));
    const err = await rejection(
      exchangeFederationAssertion({ assertion: providerTokens.aws(), federationRuleId: 'wifr_123', fetch }),
    );
    expect(err.message).toBe(
      'Token exchange failed with status 400: invalid_grant: Credential was already used. Every exchange needs a fresh provider token; this assertion was already exchanged.',
    );
  });

  test('enforces https', async () => {
    const { fetch, calls } = mockFetch(() => jsonResponse(tokenResponse()));
    const err = await rejection(
      exchangeFederationAssertion({
        assertion: 'a',
        federationRuleId: 'wifr_123',
        authBaseURL: 'http://auth.example.com',
        fetch,
      }),
    );
    expect(err.message).toContain('non-https');
    expect(calls).toHaveLength(0);
  });
});
