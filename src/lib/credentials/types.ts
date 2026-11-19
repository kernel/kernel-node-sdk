import { KernelError } from '../../core/error';
import type { Fetch } from '../../internal/builtin-types';
import { readEnv } from '../../internal/utils/env';

export type AccessToken = {
  token: string;
  /** Unix epoch seconds, fractions allowed. `null` means the token never expires. */
  expiresAt: number | null;
};

/** What a client passes to its credentials on every call. */
export type CredentialsClientContext = {
  /** The client's configured `fetch`, with the client's `fetchOptions` applied. */
  fetch: Fetch;
  /** The client's API base URL. */
  baseURL: string;
};

export type AccessTokenProviderOptions = {
  /**
   * Set by {@link TokenCache.invalidate} after a 401. A provider that keeps
   * its own cache must bypass it and mint a new token.
   */
  forceRefresh?: boolean;
  /** Set when a Kernel client calls the provider. */
  client?: CredentialsClientContext;
};

/** Mints an access token. Wrap it in a {@link TokenCache} to avoid minting one per request. */
export type AccessTokenProvider = (opts?: AccessTokenProviderOptions) => Promise<AccessToken>;

export type IdentityTokenRequest = {
  /** The audience Kernel expects when the source has no explicit audience configured. */
  audience?: string;
  /** The `fetch` to use for sources that make an HTTP request. */
  fetch?: Fetch;
};

/**
 * Returns a token from the workload's own identity provider. It is called
 * once per exchange and must return a fresh token every time: most providers'
 * tokens can be exchanged only once.
 */
export type IdentityTokenProvider = (request?: IdentityTokenRequest) => string | Promise<string>;

export type FederationPrincipal = { type: string; id: string };

export type FederationTokenDetails = {
  /** Unix epoch seconds, fractions allowed. */
  expiresAt: number;
  /** The lifetime the token endpoint reported, in seconds. */
  expiresIn: number;
  scope: string | null;
  orgId: string | null;
  accessScope: string | null;
  projectId: string | null;
  principal: FederationPrincipal | null;
  federationRuleId: string | null;
};

export type FederationAccessToken = { token: string } & FederationTokenDetails;

export const GRANT_TYPE_JWT_BEARER = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
export const TOKEN_ENDPOINT = '/token';
export const DEFAULT_API_BASE_URL = 'https://api.onkernel.com';
export const DEFAULT_AUTH_BASE_URL = 'https://auth.onkernel.com';

export const ADVISORY_REFRESH_THRESHOLD_IN_SECONDS = 120;
export const ADVISORY_REFRESH_LIFETIME_FRACTION = 0.4;
export const MANDATORY_REFRESH_THRESHOLD_IN_SECONDS = 30;
export const MANDATORY_REFRESH_LIFETIME_FRACTION = 0.1;
export const ADVISORY_REFRESH_BACKOFF_IN_SECONDS = 5;

export const MAX_ASSERTION_BYTES = 16 * 1024;
export const MAX_TOKEN_RESPONSE_BYTES = 1 << 20;
export const DEFAULT_CREDENTIALS_TIMEOUT_IN_MS = 30_000;

export function nowAsSeconds(): number {
  return Date.now() / 1000;
}

export class WorkloadIdentityError extends KernelError {
  /** HTTP status of the token endpoint response, when there was one. */
  readonly statusCode: number | null;
  /** OAuth `error` code, such as `invalid_grant`. */
  readonly errorCode: string | null;
  /** OAuth `error_description`. */
  readonly errorDescription: string | null;
  readonly requestId: string | null;
  /** The response body, reduced to its `error`, `error_description` and `error_uri` strings. */
  readonly body: Record<string, string> | null;

  constructor(
    message: string,
    {
      statusCode = null,
      errorCode = null,
      errorDescription = null,
      requestId = null,
      body = null,
      cause,
    }: {
      statusCode?: number | null;
      errorCode?: string | null;
      errorDescription?: string | null;
      requestId?: string | null;
      body?: Record<string, string> | null;
      cause?: unknown;
    } = {},
  ) {
    super(message);
    this.name = 'WorkloadIdentityError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errorDescription = errorDescription;
    this.requestId = requestId;
    this.body = body;
    // in some environments the 'cause' property is already declared
    // @ts-ignore
    if (cause !== undefined) this.cause = cause;
  }
}

/**
 * Rejects token endpoints that would send an identity token over cleartext
 * HTTP. Loopback hosts are allowed for local development.
 */
export function requireSecureTokenEndpoint(baseURL: string): void {
  let url: URL;
  try {
    url = new URL(baseURL);
  } catch {
    throw new WorkloadIdentityError(`Invalid auth base URL "${baseURL}"`);
  }
  if (url.protocol === 'https:') return;
  // URL.hostname keeps the brackets around an IPv6 address.
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (url.protocol === 'http:' && (host === 'localhost' || host === '127.0.0.1' || host === '::1')) {
    return;
  }
  throw new WorkloadIdentityError(
    `Refusing to send an identity token to non-https auth base URL "${baseURL}"`,
  );
}

/**
 * The host that exchanges identity tokens: the explicit value, else
 * `KERNEL_AUTH_BASE_URL`, else production when the API base URL is the
 * production default. A custom API base URL never falls back to production.
 */
export function resolveAuthBaseURL(explicit?: string | undefined, apiBaseURL?: string | undefined): string {
  const configured = explicit || readEnv('KERNEL_AUTH_BASE_URL');
  if (configured) return configured.replace(/\/+$/, '');
  const api = resolveAPIBaseURL(apiBaseURL);
  if (api.replace(/\/+$/, '') === DEFAULT_API_BASE_URL) return DEFAULT_AUTH_BASE_URL;
  throw new WorkloadIdentityError(
    `Cannot determine the auth base URL for the custom API base URL "${api}". Set the KERNEL_AUTH_BASE_URL environment variable or the authBaseURL option.`,
  );
}

/** The `resource` an access token is requested for: the origin of the API base URL. */
export function resolveResource(explicit?: string | undefined, apiBaseURL?: string | undefined): string {
  if (explicit) return explicit;
  const api = resolveAPIBaseURL(apiBaseURL);
  try {
    return new URL(api).origin;
  } catch {
    throw new WorkloadIdentityError(`Invalid API base URL "${api}"`);
  }
}

function resolveAPIBaseURL(apiBaseURL: string | undefined): string {
  return apiBaseURL || readEnv('KERNEL_BASE_URL') || DEFAULT_API_BASE_URL;
}

// RFC 6749 section 5.2 error fields. A token endpoint may echo anything else
// it was sent, including the assertion, so every other field is dropped.
const SAFE_ERROR_KEYS = new Set(['error', 'error_description', 'error_uri']);

/**
 * Reduces a token endpoint error body to what is safe to put in an error:
 * the RFC 6749 error fields that are strings. Anything that is not a JSON
 * object, such as a proxy's error page, is discarded. Pass every credential
 * that was sent as `secrets`, so a server that echoes one back does not
 * leak it.
 */
export function redactSensitive(body: unknown, secrets: string[] = []): Record<string, string> | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    if (SAFE_ERROR_KEYS.has(key) && typeof value === 'string') out[key] = scrubSecrets(value, secrets);
  }
  return out;
}

/**
 * Describes an error thrown while a credential was in flight, with its
 * causes and without the credential. Use the result in place of attaching
 * the error as a `cause`, which loggers print in full.
 */
export function describeFailure(err: unknown, secrets: string[]): string {
  const parts: string[] = [];
  for (
    let current = err;
    current != null && parts.length < 3;
    current = (current as { cause?: unknown }).cause
  ) {
    parts.push(String(current));
  }
  return scrubSecrets(parts.join(': '), secrets);
}

/** Replaces every occurrence of each secret, plain or URL-encoded, in text that came from outside the SDK. */
export function scrubSecrets(text: string, secrets: string[]): string {
  for (const secret of secrets) {
    if (!secret) continue;
    for (const form of new Set([secret, encodeURIComponent(secret)])) {
      text = text.split(form).join('[redacted]');
    }
  }
  return text;
}

/** Reads at most `maxBytes` of a response body as UTF-8 text. */
export async function readLimitedText(
  response: Response,
  maxBytes: number = MAX_TOKEN_RESPONSE_BYTES,
): Promise<string> {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (received + value.length > maxBytes) {
      chunks.push(value.subarray(0, maxBytes - received));
      received = maxBytes;
      await reader.cancel();
      break;
    }
    chunks.push(value);
    received += value.length;
  }
  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder('utf-8').decode(merged);
}

/**
 * Runs `fn` with an abort signal that fires after `timeoutMs`. The timer
 * covers everything `fn` awaits, so it bounds reading the body as well as
 * waiting for the headers.
 */
export async function withTimeout<T>(timeoutMs: number, fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}
