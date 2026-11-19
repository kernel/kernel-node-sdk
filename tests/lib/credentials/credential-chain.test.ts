import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { WorkloadIdentityError, federationCredentialsFromEnv } from '@onkernel/sdk/lib/credentials';
import { formParams, isolateCredentialEnv, jsonResponse, mockFetch, tokenResponse } from './helpers';

// The optional AWS package is not installed in this repository, so the aws_sts
// test supplies it. aws-sts-missing-dependency.test.ts covers running without it.
const mockSTSCalls: unknown[] = [];
jest.mock(
  '@aws-sdk/client-sts',
  () => ({
    STSClient: class {
      constructor(config: unknown) {
        mockSTSCalls.push(config);
      }
      async send(command: { input: unknown }) {
        mockSTSCalls.push(command.input);
        return { WebIdentityToken: 'aws-token' };
      }
    },
    GetWebIdentityTokenCommand: class {
      constructor(public input: unknown) {}
    },
  }),
  { virtual: true },
);

describe('federationCredentialsFromEnv', () => {
  isolateCredentialEnv();

  let dir: string;
  let tokenFile: string;
  beforeEach(() => {
    mockSTSCalls.length = 0;
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kernel-credential-chain-'));
    tokenFile = path.join(dir, 'token');
    fs.writeFileSync(tokenFile, 'file-token\n');
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true });
  });

  /** Runs one exchange and reports the assertion sent and every URL requested. */
  async function exchange(): Promise<{ assertion: string | undefined; urls: string[] }> {
    const { fetch, calls } = mockFetch((call) => {
      if (call.url.endsWith('/token')) return jsonResponse(tokenResponse());
      if (call.url.startsWith('http://metadata.google.internal/')) return new Response('gcp-token');
      return jsonResponse({ value: 'github-token' });
    });
    const provider = federationCredentialsFromEnv();
    if (!provider) throw new Error('no credentials resolved');
    await provider({ client: { fetch, baseURL: 'https://api.onkernel.com/' } });
    const tokenCall = calls.find((call) => call.url.endsWith('/token'))!;
    expect(formParams(tokenCall)['federation_rule_id']).toBe('wifr_env');
    return { assertion: formParams(tokenCall)['assertion'], urls: calls.map((call) => call.url) };
  }

  const setGitHubEnv = () => {
    process.env['ACTIONS_ID_TOKEN_REQUEST_URL'] = 'https://actions.example/idtoken?api-version=2.0';
    process.env['ACTIONS_ID_TOKEN_REQUEST_TOKEN'] = 'runtime-token';
  };

  test('resolves nothing without KERNEL_FEDERATION_RULE_ID', () => {
    process.env['KERNEL_IDENTITY_TOKEN'] = 'value-token';
    process.env['KERNEL_IDENTITY_TOKEN_FILE'] = tokenFile;
    process.env['KERNEL_IDENTITY_TOKEN_SOURCE'] = 'file';
    setGitHubEnv();
    expect(federationCredentialsFromEnv()).toBeNull();
  });

  test('resolves nothing with a rule ID but no identity token source', () => {
    process.env['KERNEL_FEDERATION_RULE_ID'] = 'wifr_env';
    expect(federationCredentialsFromEnv()).toBeNull();
  });

  describe('with KERNEL_IDENTITY_TOKEN_SOURCE unset', () => {
    beforeEach(() => {
      process.env['KERNEL_FEDERATION_RULE_ID'] = 'wifr_env';
    });

    test('the token file wins over the token value and GitHub Actions', async () => {
      process.env['KERNEL_IDENTITY_TOKEN_FILE'] = tokenFile;
      process.env['KERNEL_IDENTITY_TOKEN'] = 'value-token';
      setGitHubEnv();
      expect(await exchange()).toEqual({
        assertion: 'file-token',
        urls: ['https://auth.onkernel.com/token'],
      });
    });

    test('the token value wins over GitHub Actions', async () => {
      process.env['KERNEL_IDENTITY_TOKEN'] = 'value-token-1';
      setGitHubEnv();
      expect((await exchange()).assertion).toBe('value-token-1');
    });

    test('GitHub Actions is detected from ACTIONS_ID_TOKEN_REQUEST_URL', async () => {
      setGitHubEnv();
      expect(await exchange()).toEqual({
        assertion: 'github-token',
        urls: [
          'https://actions.example/idtoken?api-version=2.0&audience=https%3A%2F%2Fauth.onkernel.com',
          'https://auth.onkernel.com/token',
        ],
      });
    });
  });

  describe('with KERNEL_IDENTITY_TOKEN_SOURCE set', () => {
    beforeEach(() => {
      process.env['KERNEL_FEDERATION_RULE_ID'] = 'wifr_env';
    });

    test('github_actions', async () => {
      process.env['KERNEL_IDENTITY_TOKEN_SOURCE'] = 'github_actions';
      process.env['KERNEL_IDENTITY_TOKEN_FILE'] = tokenFile;
      setGitHubEnv();
      expect((await exchange()).assertion).toBe('github-token');
    });

    test('github_actions without the request variables explains the id-token permission', () => {
      process.env['KERNEL_IDENTITY_TOKEN_SOURCE'] = 'github_actions';
      expect(() => federationCredentialsFromEnv()).toThrow(WorkloadIdentityError);
      expect(() => federationCredentialsFromEnv()).toThrow('permissions: id-token: write');
    });

    test('gcp_metadata, with KERNEL_IDENTITY_TOKEN_AUDIENCE', async () => {
      process.env['KERNEL_IDENTITY_TOKEN_SOURCE'] = 'gcp_metadata';
      process.env['KERNEL_IDENTITY_TOKEN_AUDIENCE'] = 'kernel-prod';
      const { assertion, urls } = await exchange();
      expect(assertion).toBe('gcp-token');
      expect(urls[0]).toBe(
        'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=kernel-prod&format=full',
      );
    });

    test('aws_sts', async () => {
      process.env['KERNEL_IDENTITY_TOKEN_SOURCE'] = 'aws_sts';
      process.env['AWS_REGION'] = 'us-west-2';

      expect((await exchange()).assertion).toBe('aws-token');
      expect(mockSTSCalls).toEqual([
        { region: 'us-west-2' },
        { Audience: ['https://auth.onkernel.com'], SigningAlgorithm: 'RS256', DurationSeconds: 300 },
      ]);
    });

    test('file', async () => {
      process.env['KERNEL_IDENTITY_TOKEN_SOURCE'] = 'file';
      process.env['KERNEL_IDENTITY_TOKEN_FILE'] = tokenFile;
      process.env['KERNEL_IDENTITY_TOKEN'] = 'value-token';
      expect((await exchange()).assertion).toBe('file-token');
    });

    test('env selects the token value even when a token file is set', async () => {
      process.env['KERNEL_IDENTITY_TOKEN_SOURCE'] = 'env';
      process.env['KERNEL_IDENTITY_TOKEN_FILE'] = tokenFile;
      process.env['KERNEL_IDENTITY_TOKEN'] = 'value-token-2';
      expect((await exchange()).assertion).toBe('value-token-2');
    });

    test.each([
      ['file', 'KERNEL_IDENTITY_TOKEN_FILE'],
      ['env', 'KERNEL_IDENTITY_TOKEN'],
    ])('%s without %s is a configuration error', (source, variable) => {
      process.env['KERNEL_IDENTITY_TOKEN_SOURCE'] = source;
      expect(() => federationCredentialsFromEnv()).toThrow(`${variable} is not set`);
    });

    test('an unknown source is a configuration error', () => {
      process.env['KERNEL_IDENTITY_TOKEN_SOURCE'] = 'azure';
      expect(() => federationCredentialsFromEnv()).toThrow(
        'expected one of github_actions, gcp_metadata, aws_sts, file, env',
      );
    });
  });

  test('a static KERNEL_IDENTITY_TOKEN is exchanged once and never replayed', async () => {
    process.env['KERNEL_FEDERATION_RULE_ID'] = 'wifr_env';
    process.env['KERNEL_IDENTITY_TOKEN'] = 'value-token-3';
    const { fetch, calls } = mockFetch(() => jsonResponse(tokenResponse()));
    const provider = federationCredentialsFromEnv()!;
    const client = { fetch, baseURL: 'https://api.onkernel.com/' };

    await provider({ client });
    await expect(provider({ client })).rejects.toThrow(/already been exchanged once/);
    await expect(provider({ client, forceRefresh: true })).rejects.toThrow(WorkloadIdentityError);
    // Credentials built again from the same environment hold the same spent token.
    await expect(federationCredentialsFromEnv()!({ client })).rejects.toThrow(/already been exchanged once/);
    expect(calls).toHaveLength(1);

    process.env['KERNEL_IDENTITY_TOKEN'] = 'value-token-4';
    await federationCredentialsFromEnv()!({ client });
    expect(calls).toHaveLength(2);
  });
});
