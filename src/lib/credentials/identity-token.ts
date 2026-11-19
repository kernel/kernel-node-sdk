import type { Fetch } from '../../internal/builtin-types';
import { getDefaultFetch } from '../../internal/shims';
import { readEnv } from '../../internal/utils/env';
import type { IdentityTokenProvider, IdentityTokenRequest } from './types';
import {
  DEFAULT_CREDENTIALS_TIMEOUT_IN_MS,
  describeFailure,
  WorkloadIdentityError,
  readLimitedText,
  resolveAuthBaseURL,
  withTimeout,
} from './types';

export type IdentityTokenSourceOptions = {
  /**
   * The audience to request. Defaults to `KERNEL_IDENTITY_TOKEN_AUDIENCE`,
   * else the auth base URL (for example `https://auth.onkernel.com`). The
   * federation rule's `expected_audience` must be set to the same value.
   */
  audience?: string | undefined;
  /** Defaults to the `fetch` of the client using the source, else the global `fetch`. */
  fetch?: Fetch | undefined;
};

const replayHints = new WeakMap<IdentityTokenProvider, string>();

/**
 * What to tell the caller when the token endpoint reports that the token
 * this provider returned was already used. The advice depends on where the
 * token comes from, which only the built-in file and static sources know.
 */
export function replayHintFor(provider: IdentityTokenProvider): string {
  return (
    replayHints.get(provider) ??
    'Every exchange needs a fresh provider token, and the identity token provider returned one that was already exchanged.'
  );
}

/**
 * Reads the token from a file on every call, so a token the platform rotates
 * (such as a Kubernetes projected service account token) is picked up.
 */
export function identityTokenFromFile(path: string): IdentityTokenProvider {
  if (!path) {
    throw new WorkloadIdentityError('Identity token file path is empty');
  }

  const provider: IdentityTokenProvider = async () => {
    let content: string;
    try {
      // Loaded on first use, and not as a literal specifier, so the SDK still
      // loads and bundles on runtimes that have no file system.
      const specifier = 'node:fs/promises';
      const fs: typeof import('node:fs/promises') = await import(
        /* webpackIgnore: true */ /* @vite-ignore */ specifier
      );
      content = await fs.readFile(path, 'utf-8');
    } catch (err) {
      throw new WorkloadIdentityError(`Failed to read identity token file at ${path}: ${err}`, {
        cause: err,
      });
    }
    const token = content.trim();
    if (!token) {
      throw new WorkloadIdentityError(`Identity token file at ${path} is empty`);
    }
    return token;
  };
  replayHints.set(
    provider,
    `Every exchange needs a fresh provider token, and the identity token file at ${path} held the same token as a previous exchange. Whatever writes that file must replace the token before each refresh. For a Kubernetes projected service account token, which the kubelet replaces only as it nears expiry, configure the issuer in Kernel to allow reuse instead.`,
  );
  return provider;
}

/**
 * Wraps one token as an {@link IdentityTokenProvider} that can be used for
 * exactly one exchange.
 *
 * Most providers' tokens are single-use, and a fixed value cannot be
 * replaced with a fresh one, so the second call throws instead of sending
 * the same token again. Use {@link identityTokenFromFile}, a built-in source
 * or your own callback for anything that outlives one access token.
 */
export function identityTokenFromValue(token: string): IdentityTokenProvider {
  if (!token) {
    throw new WorkloadIdentityError('Identity token value is empty');
  }
  let used = false;
  const provider: IdentityTokenProvider = () => {
    if (used) {
      throw new WorkloadIdentityError(
        'The static identity token has already been exchanged once and cannot be reused: every exchange needs a fresh provider token. A static token (such as KERNEL_IDENTITY_TOKEN) is good for one access token only. To keep a client authenticated, use a source that returns a fresh token on every call: KERNEL_IDENTITY_TOKEN_FILE, KERNEL_IDENTITY_TOKEN_SOURCE, or an identityTokenProvider callback.',
      );
    }
    used = true;
    return token;
  };
  replayHints.set(
    provider,
    'Every exchange needs a fresh provider token; a static KERNEL_IDENTITY_TOKEN can be exchanged only once.',
  );
  return provider;
}

/**
 * Requests an ID token from GitHub Actions. The workflow or job needs
 * `permissions: id-token: write`.
 */
export function identityTokenFromGitHubActions(
  options: IdentityTokenSourceOptions = {},
): IdentityTokenProvider {
  return async (request) => {
    const requestURL = readEnv('ACTIONS_ID_TOKEN_REQUEST_URL');
    const requestToken = readEnv('ACTIONS_ID_TOKEN_REQUEST_TOKEN');
    if (!requestURL || !requestToken) {
      throw new WorkloadIdentityError(
        'GitHub Actions did not provide an ID token endpoint: ACTIONS_ID_TOKEN_REQUEST_URL and ACTIONS_ID_TOKEN_REQUEST_TOKEN are not set. Add `permissions: id-token: write` to the workflow or job.',
      );
    }
    const audience = encodeURIComponent(resolveAudience(options, request));
    const url = `${requestURL}${requestURL.includes('?') ? '&' : '?'}audience=${audience}`;
    const body = await fetchIdentityToken('GitHub Actions ID token endpoint', options, request, url, {
      Accept: 'application/json',
      Authorization: `Bearer ${requestToken}`,
    });
    let token: unknown;
    try {
      token = JSON.parse(body)?.value;
    } catch {
      token = undefined;
    }
    if (typeof token !== 'string' || !token) {
      throw new WorkloadIdentityError('GitHub Actions ID token endpoint returned a response with no token');
    }
    return token;
  };
}

const GCP_IDENTITY_URL =
  'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity';

/**
 * Requests an identity token for the attached service account from the
 * Google Cloud metadata server.
 */
export function identityTokenFromGCPMetadata(
  options: IdentityTokenSourceOptions = {},
): IdentityTokenProvider {
  return async (request) => {
    const audience = encodeURIComponent(resolveAudience(options, request));
    const url = `${GCP_IDENTITY_URL}?audience=${audience}&format=full`;
    const body = await fetchIdentityToken('Google Cloud metadata server', options, request, url, {
      'Metadata-Flavor': 'Google',
    });
    const token = body.trim();
    if (!token) {
      throw new WorkloadIdentityError('Google Cloud metadata server returned an empty identity token');
    }
    return token;
  };
}

export type AWSSTSIdentityTokenOptions = {
  /** See {@link IdentityTokenSourceOptions.audience}. */
  audience?: string | undefined;
  /** Defaults to `AWS_REGION`, else `AWS_DEFAULT_REGION`, else `us-east-1`. */
  region?: string | undefined;
};

type STSClient = { send(command: object): Promise<{ WebIdentityToken?: string | undefined }> };
type STSModule = {
  STSClient: new (config: { region: string }) => STSClient;
  GetWebIdentityTokenCommand?: new (input: {
    Audience: string[];
    SigningAlgorithm: string;
    DurationSeconds: number;
  }) => object;
};

/**
 * Requests a token from AWS STS `GetWebIdentityToken` with the workload's
 * ambient AWS credentials.
 *
 * Needs the optional `@aws-sdk/client-sts` package, which is loaded on first
 * use. The call goes to a regional STS endpoint through the AWS SDK's own
 * HTTP client, not the Kernel client's `fetch`.
 */
export function identityTokenFromAWSSTS(options: AWSSTSIdentityTokenOptions = {}): IdentityTokenProvider {
  // One client for the life of the source, so the AWS SDK caches and
  // refreshes the ambient credentials itself.
  let client: STSClient | undefined;
  let Command: NonNullable<STSModule['GetWebIdentityTokenCommand']> | undefined;

  return async (request) => {
    const audience = resolveAudience(options, request);
    if (!client || !Command) {
      const sts = await loadSTS();
      Command = sts.GetWebIdentityTokenCommand;
      client = new sts.STSClient({
        region: options.region || readEnv('AWS_REGION') || readEnv('AWS_DEFAULT_REGION') || 'us-east-1',
      });
    }
    let token: string | undefined;
    try {
      const response = await client.send(
        new Command({ Audience: [audience], SigningAlgorithm: 'RS256', DurationSeconds: 300 }),
      );
      token = response.WebIdentityToken;
    } catch (err) {
      throw new WorkloadIdentityError(`AWS STS GetWebIdentityToken failed: ${err}`, { cause: err });
    }
    if (!token) {
      throw new WorkloadIdentityError('AWS STS GetWebIdentityToken returned no token');
    }
    return token;
  };
}

const STS_PACKAGE = '@aws-sdk/client-sts';
const STS_MIN_VERSION = '3.935.0';

async function loadSTS(): Promise<STSModule & Required<Pick<STSModule, 'GetWebIdentityTokenCommand'>>> {
  let sts: STSModule;
  try {
    // Not a literal specifier: the package is optional, and bundlers must not
    // try to resolve it for users who never select this source.
    const specifier = STS_PACKAGE;
    sts = await import(/* webpackIgnore: true */ /* @vite-ignore */ specifier);
  } catch (err) {
    throw new WorkloadIdentityError(
      `The aws_sts identity token source needs the optional ${STS_PACKAGE} package (version ${STS_MIN_VERSION} or later). Install it with \`npm install ${STS_PACKAGE}\`.`,
      { cause: err },
    );
  }
  const Command = sts.GetWebIdentityTokenCommand;
  if (typeof Command !== 'function') {
    throw new WorkloadIdentityError(
      `The installed ${STS_PACKAGE} is too old to call GetWebIdentityToken; version ${STS_MIN_VERSION} or later is required. Upgrade it with \`npm install ${STS_PACKAGE}@latest\`.`,
    );
  }
  return { STSClient: sts.STSClient, GetWebIdentityTokenCommand: Command };
}

function resolveAudience(
  options: { audience?: string | undefined },
  request: IdentityTokenRequest | undefined,
): string {
  return (
    options.audience || readEnv('KERNEL_IDENTITY_TOKEN_AUDIENCE') || request?.audience || resolveAuthBaseURL()
  );
}

async function fetchIdentityToken(
  source: string,
  options: IdentityTokenSourceOptions,
  request: IdentityTokenRequest | undefined,
  url: string,
  headers: Record<string, string>,
): Promise<string> {
  const fetch = options.fetch ?? request?.fetch ?? getDefaultFetch();
  const secrets = [(headers['Authorization'] ?? '').replace(/^Bearer /, '')];
  return withTimeout(DEFAULT_CREDENTIALS_TIMEOUT_IN_MS, async (signal) => {
    let response: Response;
    try {
      response = await fetch(url, { method: 'GET', redirect: 'manual', headers, signal });
    } catch (err) {
      throw new WorkloadIdentityError(`Failed to reach the ${source}: ${describeFailure(err, secrets)}`);
    }
    if (response.status !== 200) {
      await response.body?.cancel().catch(() => {});
      throw new WorkloadIdentityError(`The ${source} responded with status ${response.status}`, {
        statusCode: response.status,
      });
    }
    try {
      return await readLimitedText(response);
    } catch (err) {
      throw new WorkloadIdentityError(
        `Failed to read the response from the ${source}: ${describeFailure(err, secrets)}`,
      );
    }
  });
}
