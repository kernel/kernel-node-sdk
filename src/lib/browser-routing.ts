import type { RequestInfo, RequestInit } from '../internal/builtin-types';
import { KernelError } from '../core/error';
import { buildHeaders } from '../internal/headers';
import type { Fetch } from '../internal/builtin-types';
import type { FinalRequestOptions, RequestOptions } from '../internal/request-options';
import type { HTTPMethod } from '../internal/types';
import { parseJwtFromCdpWsUrl } from './browser-transport';
import type { Kernel } from '../client';

export interface BrowserFetchInit extends RequestInit {
  timeout_ms?: number;
}

export type BrowserRoute = {
  sessionId: string;
  baseURL: string;
  jwt?: string | undefined;
};

export interface BrowserRoutingOptions {
  enabled?: boolean;
  directToVMSubresources?: string[] | undefined;
  cache?: BrowserRouteCache | undefined;
}

export class BrowserRouteCache {
  private entries = new Map<string, BrowserRoute>();

  get(sessionId: string): BrowserRoute | undefined {
    return this.entries.get(sessionId);
  }

  set(route: BrowserRoute): void {
    this.entries.set(route.sessionId, normalizeRoute(route));
  }

  delete(sessionId: string): void {
    this.entries.delete(sessionId);
  }

  clear(): void {
    this.entries.clear();
  }

  prime(browser: unknown): BrowserRoute | undefined {
    const route = browserRouteFromValue(browser);
    if (!route) {
      return undefined;
    }
    this.set(route);
    return route;
  }

  values(): BrowserRoute[] {
    return [...this.entries.values()];
  }
}

export function createRoutingFetch(
  innerFetch: Fetch,
  {
    apiBaseURL,
    directToVMSubresources,
    cache,
  }: {
    apiBaseURL: string;
    directToVMSubresources: Iterable<string>;
    cache: BrowserRouteCache;
  },
): Fetch {
  const allowed = new Set([...directToVMSubresources].map((value) => value.trim()).filter(Boolean));
  const apiOrigin = new URL(apiBaseURL).origin;

  return async (input, init) => {
    const request = new Request(input as RequestInfo, init);
    const match = matchDirectToVMRequest(request.url, apiOrigin, allowed);

    const response = match ? await fetchDirectToVM(innerFetch, request, match, cache) : await innerFetch(input, init);
    await sniffAndPrimeCache(response, cache);
    return response;
  };
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
  if (!route.jwt) {
    throw new KernelError(`browser.fetch requires a browser session jwt for ${sessionId}`);
  }

  const { url: targetURL, method, headers, body, signal, duplex, timeout_ms } = splitFetchArgs(input, init);
  assertHTTPURL(targetURL);

  const query: Record<string, unknown> = {
    url: targetURL,
    jwt: route.jwt,
  };
  if (timeout_ms !== undefined) {
    query['timeout_ms'] = timeout_ms;
  }

  const accept = headers.get('accept');
  const methodLower = normalizeMethod(method);

  const requestOptions: FinalRequestOptions = {
    method: methodLower,
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

function normalizeRoute(route: BrowserRoute): BrowserRoute {
  return {
    sessionId: route.sessionId.trim(),
    baseURL: route.baseURL.trim(),
    jwt: route.jwt?.trim() || undefined,
  };
}

function browserRouteFromValue(value: unknown): BrowserRoute | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const sessionId = typeof record['session_id'] === 'string' ? record['session_id'].trim() : '';
  const baseURL = typeof record['base_url'] === 'string' ? record['base_url'].trim() : '';
  if (!sessionId || !baseURL) {
    return undefined;
  }

  const explicitJWT = typeof record['jwt'] === 'string' ? record['jwt'].trim() : '';
  const cdpWsURL = typeof record['cdp_ws_url'] === 'string' ? record['cdp_ws_url'] : undefined;
  return {
    sessionId,
    baseURL,
    jwt: explicitJWT || parseJwtFromCdpWsUrl(cdpWsURL) || undefined,
  };
}

async function sniffAndPrimeCache(response: Response, cache: BrowserRouteCache): Promise<void> {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.includes('application/json')) {
    return;
  }

  try {
    const body = await response.clone().json();
    primeRoutesFromJSON(body, cache);
  } catch {
    // Ignore malformed or non-JSON bodies returned with a JSON content type.
  }
}

function primeRoutesFromJSON(value: unknown, cache: BrowserRouteCache): void {
  const route = browserRouteFromValue(value);
  if (route) {
    cache.set(route);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      primeRoutesFromJSON(item, cache);
    }
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  for (const child of Object.values(value as Record<string, unknown>)) {
    if (typeof child === 'object' && child !== null) {
      primeRoutesFromJSON(child, cache);
    }
  }
}

function matchDirectToVMRequest(
  rawURL: string,
  apiOrigin: string,
  allowed: ReadonlySet<string>,
): { sessionId: string; subresource: string; rest: string } | undefined {
  const url = new URL(rawURL);
  if (url.origin !== apiOrigin) {
    return undefined;
  }

  const match = url.pathname.match(/^\/(?:v\d+\/)?browsers\/([^/]+)\/([^/]+)(\/.*)?$/);
  if (!match) {
    return undefined;
  }

  const sessionId = decodeURIComponent(match[1] ?? '');
  const subresource = match[2] ?? '';
  if (!sessionId || !allowed.has(subresource)) {
    return undefined;
  }

  return {
    sessionId,
    subresource,
    rest: match[3] ?? '',
  };
}

async function fetchDirectToVM(
  innerFetch: Fetch,
  request: Request,
  match: { sessionId: string; subresource: string; rest: string },
  cache: BrowserRouteCache,
): Promise<Response> {
  const route = cache.get(match.sessionId);
  if (!route) {
    return innerFetch(request);
  }

  const target = new URL(joinURL(route.baseURL, `/${match.subresource}${match.rest}`));
  const current = new URL(request.url);
  current.searchParams.forEach((value, key) => {
    if (key !== 'jwt') {
      target.searchParams.append(key, value);
    }
  });
  if (route.jwt && !target.searchParams.get('jwt')) {
    target.searchParams.set('jwt', route.jwt);
  }

  const headers = new Headers(request.headers);
  headers.delete('authorization');
  const method = request.method.toUpperCase();
  const init: RequestInit = {
    method,
    headers,
    redirect: request.redirect,
    signal: request.signal,
  };
  if (method !== 'GET' && method !== 'HEAD' && request.body) {
    init.body = request.body;
    init.duplex = 'half';
  }

  return innerFetch(new Request(target.toString(), init));
}

function joinURL(baseURL: string, path: string): string {
  return `${baseURL.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
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
    const merged = new Headers(input.headers);
    if (init?.headers) {
      const extra = new Headers(init.headers);
      extra.forEach((value, key) => {
        merged.set(key, value);
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
      headers: merged,
    };
    const mergedBody = init?.body ?? input.body;
    if (mergedBody !== undefined && mergedBody !== null) {
      out.body = mergedBody;
    }
    const mergedSignal = init?.signal ?? input.signal;
    if (mergedSignal !== undefined) {
      out.signal = mergedSignal;
    }
    if (init?.duplex !== undefined) {
      out.duplex = init.duplex;
    }
    if (timeoutFromInit !== undefined) {
      out.timeout_ms = timeoutFromInit;
    }
    return out;
  }

  const url = input instanceof URL ? input.href : String(input);
  const method = (init?.method ?? 'GET').toUpperCase();
  const headers = new Headers(init?.headers);
  const out: {
    url: string;
    method: string;
    headers: Headers;
    body?: RequestInit['body'];
    signal?: AbortSignal | null;
    duplex?: RequestInit['duplex'];
    timeout_ms?: number;
  } = { url, method, headers };
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
    const lower = key.toLowerCase();
    if (
      lower === 'accept' ||
      lower === 'content-length' ||
      lower === 'connection' ||
      lower === 'keep-alive' ||
      lower === 'proxy-authenticate' ||
      lower === 'proxy-authorization' ||
      lower === 'te' ||
      lower === 'trailers' ||
      lower === 'transfer-encoding' ||
      lower === 'upgrade'
    ) {
      return;
    }
    out[key] = value;
  });
  return out;
}
