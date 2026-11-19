import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  WorkloadIdentityError,
  identityTokenFromAWSSTS,
  identityTokenFromFile,
  identityTokenFromGCPMetadata,
  identityTokenFromGitHubActions,
  identityTokenFromValue,
} from '@onkernel/sdk/lib/credentials';
import { isolateCredentialEnv, jsonResponse, mockFetch, providerTokens } from './helpers';

// The optional AWS package is not installed in this repository, so these tests
// supply it. aws-sts-missing-dependency.test.ts covers running without it.
const mockSTS = { regions: [] as string[], send: jest.fn(), hasCommand: true };
jest.mock(
  '@aws-sdk/client-sts',
  () => {
    class GetWebIdentityTokenCommand {
      constructor(public input: unknown) {}
    }
    return {
      STSClient: class {
        constructor(config: { region: string }) {
          mockSTS.regions.push(config.region);
        }
        send(command: { input: unknown }) {
          return mockSTS.send(command.input);
        }
      },
      // Releases before 3.935.0 do not export the command.
      get GetWebIdentityTokenCommand() {
        return mockSTS.hasCommand ? GetWebIdentityTokenCommand : undefined;
      },
    };
  },
  { virtual: true },
);

async function rejection(value: unknown): Promise<WorkloadIdentityError> {
  const err = await Promise.resolve(value).then(
    () => undefined,
    (e) => e,
  );
  expect(err).toBeInstanceOf(WorkloadIdentityError);
  return err;
}

describe('identityTokenFromFile', () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kernel-identity-token-'));
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true });
  });

  test('reads and trims the file on every call', async () => {
    const file = path.join(dir, 'token');
    fs.writeFileSync(file, '  first-token\n');
    const provider = identityTokenFromFile(file);

    expect(await provider()).toBe('first-token');
    fs.writeFileSync(file, 'rotated-token\n');
    expect(await provider()).toBe('rotated-token');
  });

  test('throws for an empty file', async () => {
    const file = path.join(dir, 'token');
    fs.writeFileSync(file, ' \n');
    const err = await rejection(identityTokenFromFile(file)());
    expect(err.message).toContain('is empty');
  });

  test('throws for a missing file, naming the path', async () => {
    const file = path.join(dir, 'missing');
    const err = await rejection(identityTokenFromFile(file)());
    expect(err.message).toContain(file);
  });

  test('throws for an empty path', () => {
    expect(() => identityTokenFromFile('')).toThrow(WorkloadIdentityError);
  });
});

describe('identityTokenFromValue', () => {
  test('returns the token once, then refuses to replay it', () => {
    const provider = identityTokenFromValue('static-token');
    expect(provider()).toBe('static-token');
    expect(() => provider()).toThrow(WorkloadIdentityError);
    expect(() => provider()).toThrow(/already been exchanged once.*fresh provider token/);
    expect(() => provider()).toThrow(/KERNEL_IDENTITY_TOKEN_FILE/);
  });

  test('throws for an empty value', () => {
    expect(() => identityTokenFromValue('')).toThrow(WorkloadIdentityError);
  });
});

describe('identityTokenFromGitHubActions', () => {
  isolateCredentialEnv();

  const requestURL =
    'https://run-actions-1-azure-eastus.actions.githubusercontent.com/42//idtoken/abc/def?api-version=2.0';
  beforeEach(() => {
    process.env['ACTIONS_ID_TOKEN_REQUEST_URL'] = requestURL;
    process.env['ACTIONS_ID_TOKEN_REQUEST_TOKEN'] = 'runtime-token';
  });

  test('requests a token with the audience and the runtime bearer token', async () => {
    const jwt = providerTokens.github();
    const { fetch, calls } = mockFetch(() => jsonResponse({ value: jwt }));

    const token = await identityTokenFromGitHubActions()({ audience: 'https://auth.onkernel.com', fetch });

    expect(token).toBe(jwt);
    expect(calls[0]!.url).toBe(`${requestURL}&audience=https%3A%2F%2Fauth.onkernel.com`);
    expect(calls[0]!.method).toBe('GET');
    expect(calls[0]!.headers.get('authorization')).toBe('Bearer runtime-token');
  });

  test('audience: the option wins, then KERNEL_IDENTITY_TOKEN_AUDIENCE, then the auth base URL', async () => {
    const { fetch, calls } = mockFetch(() => jsonResponse({ value: 'jwt' }));
    const audienceOf = (index: number) => new URL(calls[index]!.url).searchParams.get('audience');

    await identityTokenFromGitHubActions({ fetch })();
    expect(audienceOf(0)).toBe('https://auth.onkernel.com');

    await identityTokenFromGitHubActions({ fetch })({ audience: 'https://auth.dev.onkernel.com' });
    expect(audienceOf(1)).toBe('https://auth.dev.onkernel.com');

    process.env['KERNEL_IDENTITY_TOKEN_AUDIENCE'] = 'from-env';
    await identityTokenFromGitHubActions({ fetch })({ audience: 'https://auth.dev.onkernel.com' });
    expect(audienceOf(2)).toBe('from-env');

    await identityTokenFromGitHubActions({ audience: 'from option', fetch })({ audience: 'ignored' });
    expect(calls[3]!.url).toContain('&audience=from%20option');
  });

  test('explains the id-token permission when the request variables are missing', async () => {
    delete process.env['ACTIONS_ID_TOKEN_REQUEST_TOKEN'];
    const { fetch, calls } = mockFetch(() => jsonResponse({ value: 'jwt' }));
    const err = await rejection(identityTokenFromGitHubActions({ fetch })());
    expect(err.message).toContain('permissions: id-token: write');
    expect(calls).toHaveLength(0);
  });

  test('keeps the runtime token out of a network failure that quotes the request', async () => {
    process.env['ACTIONS_ID_TOKEN_REQUEST_TOKEN'] = 'runtime-token-0123456789abcdef';
    const { fetch } = mockFetch((call) => {
      throw new Error(`proxy refused ${call.headers.get('authorization')}`);
    });
    const err = await rejection(identityTokenFromGitHubActions({ fetch })());
    expect(err.message).toBe(
      'Failed to reach the GitHub Actions ID token endpoint: Error: proxy refused Bearer [redacted]',
    );
    expect((err as any).cause).toBeUndefined();
  });

  test('fails on a non-200 response without echoing the runtime token', async () => {
    const { fetch } = mockFetch(() => new Response('Bearer runtime-token is not valid', { status: 401 }));
    const err = await rejection(identityTokenFromGitHubActions({ fetch })());
    expect(err.statusCode).toBe(401);
    expect(err.message).not.toContain('runtime-token');
  });

  test('fails on a response with no token', async () => {
    const { fetch } = mockFetch(() => jsonResponse({ count: 0 }));
    const err = await rejection(identityTokenFromGitHubActions({ fetch })());
    expect(err.message).toContain('no token');
  });
});

describe('identityTokenFromGCPMetadata', () => {
  isolateCredentialEnv();

  test('requests a full-format identity token from the metadata server', async () => {
    const jwt = providerTokens.google();
    const { fetch, calls } = mockFetch(() => new Response(`${jwt}\n`));

    const token = await identityTokenFromGCPMetadata()({ audience: 'https://auth.onkernel.com', fetch });

    expect(token).toBe(jwt);
    expect(calls[0]!.url).toBe(
      'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=https%3A%2F%2Fauth.onkernel.com&format=full',
    );
    expect(calls[0]!.headers.get('metadata-flavor')).toBe('Google');
  });

  test('fails when the metadata server cannot be reached', async () => {
    const { fetch } = mockFetch(() => {
      throw new TypeError('fetch failed');
    });
    const err = await rejection(identityTokenFromGCPMetadata({ fetch })());
    expect(err.message).toContain('Google Cloud metadata server');
  });

  test('fails on a non-200 response and on an empty body', async () => {
    const notFound = mockFetch(() => new Response('not found', { status: 404 }));
    expect((await rejection(identityTokenFromGCPMetadata({ fetch: notFound.fetch })())).statusCode).toBe(404);

    const empty = mockFetch(() => new Response(''));
    expect((await rejection(identityTokenFromGCPMetadata({ fetch: empty.fetch })())).message).toContain(
      'empty',
    );
  });
});

describe('identityTokenFromAWSSTS', () => {
  isolateCredentialEnv();

  beforeEach(() => {
    mockSTS.regions.length = 0;
    mockSTS.send.mockReset().mockImplementation(async () => ({ WebIdentityToken: providerTokens.aws() }));
  });

  test('calls GetWebIdentityToken with one audience, RS256 and a 300 second lifetime', async () => {
    const token = await identityTokenFromAWSSTS()({ audience: 'https://auth.onkernel.com' });

    expect(token).toBe(providerTokens.aws());
    expect(mockSTS.send.mock.calls).toEqual([
      [{ Audience: ['https://auth.onkernel.com'], SigningAlgorithm: 'RS256', DurationSeconds: 300 }],
    ]);
    expect(mockSTS.regions).toEqual(['us-east-1']);
  });

  test('region: the option wins, then AWS_REGION, then AWS_DEFAULT_REGION', async () => {
    process.env['AWS_DEFAULT_REGION'] = 'eu-west-1';
    await identityTokenFromAWSSTS()();
    process.env['AWS_REGION'] = 'us-west-2';
    await identityTokenFromAWSSTS()();
    await identityTokenFromAWSSTS({ region: 'ap-southeast-2' })();
    expect(mockSTS.regions).toEqual(['eu-west-1', 'us-west-2', 'ap-southeast-2']);
  });

  test('requests a new token on every call from one STS client', async () => {
    let count = 0;
    mockSTS.send.mockImplementation(async () => ({ WebIdentityToken: `aws-token-${++count}` }));
    const provider = identityTokenFromAWSSTS();

    expect(await provider()).toBe('aws-token-1');
    expect(await provider()).toBe('aws-token-2');
    expect(mockSTS.regions).toHaveLength(1);
  });

  test('wraps an STS failure', async () => {
    mockSTS.send.mockRejectedValue(
      new Error('AccessDenied: not authorized to perform sts:GetWebIdentityToken'),
    );
    const err = await rejection(identityTokenFromAWSSTS()());
    expect(err.message).toContain('AWS STS GetWebIdentityToken failed');
    expect(err.message).toContain('AccessDenied');
  });

  test('fails when STS returns no token', async () => {
    mockSTS.send.mockResolvedValue({});
    const err = await rejection(identityTokenFromAWSSTS()());
    expect(err.message).toContain('returned no token');
  });

  test('says to upgrade when the installed package has no GetWebIdentityTokenCommand', async () => {
    mockSTS.hasCommand = false;
    try {
      const err = await rejection(identityTokenFromAWSSTS()());
      expect(err.message).toContain('too old');
      expect(err.message).toContain('3.935.0');
      expect(err.message).toContain('npm install @aws-sdk/client-sts@latest');
    } finally {
      mockSTS.hasCommand = true;
    }
  });
});
