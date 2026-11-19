import type { Fetch } from '@onkernel/sdk/internal/builtin-types';

export const CREDENTIAL_ENV_VARS = [
  'KERNEL_API_KEY',
  'KERNEL_BASE_URL',
  'KERNEL_AUTH_BASE_URL',
  'KERNEL_FEDERATION_RULE_ID',
  'KERNEL_IDENTITY_TOKEN',
  'KERNEL_IDENTITY_TOKEN_FILE',
  'KERNEL_IDENTITY_TOKEN_SOURCE',
  'KERNEL_IDENTITY_TOKEN_AUDIENCE',
  'ACTIONS_ID_TOKEN_REQUEST_URL',
  'ACTIONS_ID_TOKEN_REQUEST_TOKEN',
  'AWS_REGION',
  'AWS_DEFAULT_REGION',
];

/** Clears the credential environment for each test and restores it afterwards. */
export function isolateCredentialEnv(): void {
  const saved: Record<string, string | undefined> = {};
  beforeEach(() => {
    for (const name of CREDENTIAL_ENV_VARS) {
      saved[name] = process.env[name];
      delete process.env[name];
    }
  });
  afterEach(() => {
    for (const name of CREDENTIAL_ENV_VARS) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  });
}

function base64url(value: object | string): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return Buffer.from(text).toString('base64url');
}

/** An unsigned JWT; the SDK never verifies the identity provider's signature. */
export function makeJWT(header: object, payload: object): string {
  return `${base64url(header)}.${base64url(payload)}.${base64url('signature')}`;
}

const iat = 1_780_000_000;

/** Identity tokens shaped like the ones each provider issued during staging QA. */
export const providerTokens = {
  github: () =>
    makeJWT(
      {
        alg: 'RS256',
        kid: '38826b17-6a30-5f9b-b169-8beb8202f723',
        typ: 'JWT',
        x5t: 'ykNaY4qM_ta4k2TgZOCEYLkcYlA',
      },
      {
        iss: 'https://token.actions.githubusercontent.com',
        aud: 'https://auth.onkernel.com',
        sub: 'repo:acme@123/widgets@456:ref:refs/heads/main',
        repository: 'acme/widgets',
        repository_id: '456',
        repository_owner_id: '123',
        ref: 'refs/heads/main',
        jti: 'f1e7a9c2-0b61-4f0e-9a3e-2f2f6f9f3c11',
        iat,
        nbf: iat - 300,
        exp: iat + 300,
      },
    ),
  aws: () =>
    makeJWT(
      { alg: 'RS256', kid: 'RSA_0', typ: 'JWT' },
      {
        iss: 'https://a1b2c3d4-0000-4111-8222-333344445555.tokens.sts.global.api.aws',
        aud: 'https://auth.onkernel.com',
        sub: 'arn:aws:iam::123456789012:role/service/path/kernel-worker',
        jti: '6f2b1d3e-7c4a-4d55-9d6a-0a1b2c3d4e5f',
        iat,
        exp: iat + 300,
        'https://sts.amazonaws.com/': {
          aws_account: '123456789012',
          source_region: 'us-east-1',
          principal_id: 'arn:aws:iam::123456789012:role/service/path/kernel-worker',
        },
      },
    ),
  google: () =>
    makeJWT(
      { alg: 'RS256', kid: 'c8ab71530972bba20b49f78a09c9852c43ff9118', typ: 'JWT' },
      {
        iss: 'https://accounts.google.com',
        aud: 'https://auth.onkernel.com',
        azp: '104857600000000000000',
        sub: '104857600000000000000',
        email: 'kernel-worker@acme-prod.iam.gserviceaccount.com',
        email_verified: true,
        iat,
        exp: iat + 3600,
      },
    ),
  kubernetes: () =>
    makeJWT(
      { alg: 'RS256', kid: 'pZ1nq3yTqk0Hn3lR6vQe1x5b9cD2fG7hJ4kL8mN0oP' },
      {
        iss: 'https://oidc.eks.us-east-1.amazonaws.com/id/EXAMPLED539D4633E53DE1B716D3041E',
        aud: ['https://auth.onkernel.com'],
        sub: 'system:serviceaccount:default:kernel-worker',
        jti: '0d9c8b7a-6f5e-4d3c-2b1a-0f9e8d7c6b5a',
        iat,
        nbf: iat,
        exp: iat + 3600,
        'kubernetes.io': { namespace: 'default', serviceaccount: { name: 'kernel-worker', uid: 'a1b2' } },
      },
    ),
};

/** The token endpoint's success body, as observed on staging. */
export function tokenResponse(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    token_type: 'Bearer',
    access_token: 'kernel-access-token',
    expires_in: 298,
    scope: 'browsers:create browsers:use browsers:delete',
    org_id: 'org_123',
    access_scope: 'project',
    project_id: 'proj_123',
    principal: { type: 'service_account', id: 'svc_123' },
    federation_rule_id: 'wifr_123',
    ...overrides,
  };
}

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export function oauthError(error: string, description: string, status = 400): Response {
  return jsonResponse({ error, error_description: description }, status);
}

export type RecordedCall = {
  url: string;
  method: string;
  headers: Headers;
  body: string | undefined;
  init: RequestInit | undefined;
};

/** A `fetch` that records each call and answers it with `handler`. */
export function mockFetch(handler: (call: RecordedCall) => Response | Promise<Response>): {
  fetch: Fetch;
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];
  const fetch: Fetch = async (input, init) => {
    const call: RecordedCall = {
      url: input instanceof Request ? input.url : String(input),
      method: init?.method ?? 'GET',
      headers: new Headers(init?.headers),
      body: typeof init?.body === 'string' ? init.body : undefined,
      init,
    };
    calls.push(call);
    return handler(call);
  };
  return { fetch, calls };
}

export function formParams(call: RecordedCall): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(call.body ?? ''));
}
