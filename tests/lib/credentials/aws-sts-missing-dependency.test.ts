// @aws-sdk/client-sts is an optional peer dependency and is not installed in
// this repository, so this file exercises the real "package is missing" path.
// It must not mock the package.
import Kernel from '@onkernel/sdk';
import {
  WorkloadIdentityError,
  federationCredentialsFromEnv,
  identityTokenFromAWSSTS,
} from '@onkernel/sdk/lib/credentials';
import { isolateCredentialEnv, jsonResponse, mockFetch, tokenResponse } from './helpers';

describe('aws_sts without @aws-sdk/client-sts installed', () => {
  isolateCredentialEnv();

  test('the package really is absent', () => {
    expect(() => require.resolve('@aws-sdk/client-sts')).toThrow();
  });

  test('the source says how to install the optional dependency', async () => {
    const err = await Promise.resolve(identityTokenFromAWSSTS()()).catch((e) => e);
    expect(err).toBeInstanceOf(WorkloadIdentityError);
    expect(err.message).toBe(
      'The aws_sts identity token source needs the optional @aws-sdk/client-sts package (version 3.935.0 or later). Install it with `npm install @aws-sdk/client-sts`.',
    );
    expect(err.cause).toBeDefined();
  });

  test('selecting the source does not load the package; the first exchange fails', async () => {
    process.env['KERNEL_FEDERATION_RULE_ID'] = 'wifr_env';
    process.env['KERNEL_IDENTITY_TOKEN_SOURCE'] = 'aws_sts';
    const { fetch, calls } = mockFetch(() => jsonResponse(tokenResponse()));

    const provider = federationCredentialsFromEnv()!;
    await expect(provider({ client: { fetch, baseURL: 'https://api.onkernel.com/' } })).rejects.toThrow(
      'npm install @aws-sdk/client-sts',
    );
    expect(calls).toHaveLength(0);
  });

  test('a client constructs, and its first request fails with the install instructions', async () => {
    process.env['KERNEL_FEDERATION_RULE_ID'] = 'wifr_env';
    process.env['KERNEL_IDENTITY_TOKEN_SOURCE'] = 'aws_sts';
    const { fetch, calls } = mockFetch(() => jsonResponse({}));

    const kernel = new Kernel({ fetch, maxRetries: 0 });
    await expect(kernel.get('/browsers')).rejects.toThrow('npm install @aws-sdk/client-sts');
    expect(calls).toHaveLength(0);
  });

  test('a client that does not use aws_sts never touches the package', async () => {
    const { fetch, calls } = mockFetch(() => jsonResponse({}));
    const kernel = new Kernel({ apiKey: 'sk-test', fetch });
    await kernel.get('/browsers');
    expect(calls[0]!.headers.get('authorization')).toBe('Bearer sk-test');
  });
});
