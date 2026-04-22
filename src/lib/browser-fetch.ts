import type { RequestInfo, RequestInit } from '../internal/builtin-types';
import { KernelError } from '../core/error';
import { buildHeaders } from '../internal/headers';
import type { FinalRequestOptions, RequestOptions } from '../internal/request-options';
import type { HTTPMethod } from '../internal/types';
import type { Kernel } from '../client';

export interface BrowserFetchInit extends RequestInit {
  timeout_ms?: number;
}

export async function browserFetch(
  client: Kernel,
  sessionId: string,
  input: RequestInfo | URL,
  init?: BrowserFetchInit,
): Promise<Response> {
  const route = client.browserRouteCache.get(sessionId);
  if (!route) {
    throw new KernelError(
      `browser route cache does not contain session ${sessionId}; create, retrieve, or list the browser before calling browser.fetch`,
    );
  }

  const { url: targetURL, method, headers, body, signal, duplex, timeout_ms } = splitFetchArgs(input, init);
  assertHTTPURL(targetURL);

  const query: Record<string, unknown> = { url: targetURL, jwt: route.jwt };
  if (timeout_ms !== undefined) {
    query['timeout_ms'] = timeout_ms;
  }

  const accept = headers.get('accept');
  const requestOptions: FinalRequestOptions = {
    method: normalizeMethod(method),
    path: joinURL(route.baseURL, '/curl/raw'),
    query,
    body: body as RequestOptions['body'],
    headers: buildHeaders([
      { Authorization: null },
      accept ? { Accept: accept } : { Accept: '*/*' },
      headersToRequestOptionsHeaders(headers),
    ]),
    signal: signal ?? null,
    __binaryResponse: true,
  };
  if (duplex) {
    requestOptions.fetchOptions = { duplex } as NonNullable<RequestOptions['fetchOptions']>;
  }

  return client.request(requestOptions).asResponse();
}

function normalizeMethod(method: string): HTTPMethod {
  const methodLower = method.toLowerCase();
  const allowed = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options']);
  if (!allowed.has(methodLower)) {
    throw new KernelError(`browser.fetch unsupported HTTP method: ${method}`);
  }
  return methodLower as HTTPMethod;
}

function splitFetchArgs(
  input: RequestInfo | URL,
  init?: BrowserFetchInit,
): {
  url: string;
  method: string;
  headers: Headers;
  body?: RequestInit['body'];
  signal?: AbortSignal | null;
  duplex?: RequestInit['duplex'];
  timeout_ms?: number;
} {
  const timeoutFromInit = init && 'timeout_ms' in init ? init['timeout_ms'] : undefined;

  if (input instanceof Request) {
    const headers = new Headers(input.headers);
    if (init?.headers) {
      const extra = new Headers(init.headers);
      extra.forEach((value, key) => {
        headers.set(key, value);
      });
    }

    const out: {
      url: string;
      method: string;
      headers: Headers;
      body?: RequestInit['body'];
      signal?: AbortSignal | null;
      duplex?: RequestInit['duplex'];
      timeout_ms?: number;
    } = {
      url: input.url,
      method: (init?.method ?? input.method)?.toUpperCase() || 'GET',
      headers,
    };
    const body = init?.body ?? input.body;
    if (body !== undefined && body !== null) {
      out.body = body;
    }
    const signal = init?.signal ?? input.signal;
    if (signal !== undefined) {
      out.signal = signal;
    }
    if (init?.duplex !== undefined) {
      out.duplex = init.duplex;
    }
    if (timeoutFromInit !== undefined) {
      out.timeout_ms = timeoutFromInit;
    }
    return out;
  }

  const out: {
    url: string;
    method: string;
    headers: Headers;
    body?: RequestInit['body'];
    signal?: AbortSignal | null;
    duplex?: RequestInit['duplex'];
    timeout_ms?: number;
  } = {
    url: input instanceof URL ? input.href : String(input),
    method: (init?.method ?? 'GET').toUpperCase(),
    headers: new Headers(init?.headers),
  };
  if (init?.body !== undefined) {
    out.body = init.body;
  }
  if (init?.signal !== undefined) {
    out.signal = init.signal;
  }
  if (init?.duplex !== undefined) {
    out.duplex = init.duplex;
  }
  if (timeoutFromInit !== undefined) {
    out.timeout_ms = timeoutFromInit;
  }
  return out;
}

function assertHTTPURL(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new KernelError(`browser.fetch target must be an absolute URL; received: ${url}`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new KernelError(`browser.fetch only supports http(s) URLs; received: ${parsed.protocol}`);
  }
}

function headersToRequestOptionsHeaders(headers: Headers): Record<string, string | null | undefined> {
  const out: Record<string, string | null | undefined> = {};

  headers.forEach((value, key) => {
    switch (key.toLowerCase()) {
      case 'accept':
      case 'content-length':
      case 'connection':
      case 'keep-alive':
      case 'proxy-authenticate':
      case 'proxy-authorization':
      case 'te':
      case 'trailers':
      case 'transfer-encoding':
      case 'upgrade':
        return;
      default:
        out[key] = value;
    }
  });

  return out;
}

function joinURL(baseURL: string, path: string): string {
  return `${baseURL.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}
