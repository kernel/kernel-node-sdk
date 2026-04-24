import type { Fetch, RequestInfo, RequestInit } from '../internal/builtin-types';
import { joinURL } from './join-url';

export type BrowserRoute = {
  sessionId: string;
  baseURL: string;
  jwt: string;
};

export class BrowserRouteCache {
  private entries = new Map<string, BrowserRoute>();

  get(sessionId: string): BrowserRoute | undefined {
    return this.entries.get(sessionId);
  }

  set(route: BrowserRoute): void {
    this.entries.set(route.sessionId, route);
  }

  delete(sessionId: string): void {
    this.entries.delete(sessionId);
  }

  clear(): void {
    this.entries.clear();
  }
}

const BROWSER_ROUTING_SUBRESOURCES_ENV = 'KERNEL_BROWSER_ROUTING_SUBRESOURCES';
const DEFAULT_BROWSER_ROUTING_SUBRESOURCES = ['curl'];
const BROWSER_ROUTE_CACHEABLE_PATH = /^\/(?:v\d+\/)?browsers(?:\/[^/]+)?\/?$/;
const BROWSER_POOL_ACQUIRE_PATH = /^\/(?:v\d+\/)?browser_pools\/[^/]+\/acquire\/?$/;
const BROWSER_DELETE_BY_ID_PATH = /^\/(?:v\d+\/)?browsers\/([^/]+)\/?$/;
const BROWSER_POOL_RELEASE_PATH = /^\/(?:v\d+\/)?browser_pools\/[^/]+\/release\/?$/;

export function browserRoutingSubresourcesFromEnv(): string[] {
  const raw = readBrowserRoutingSubresourcesEnv();
  if (raw === undefined) {
    return [...DEFAULT_BROWSER_ROUTING_SUBRESOURCES];
  }

  if (raw.trim() === '') {
    return [];
  }

  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export function createRoutingFetch(
  innerFetch: Fetch,
  {
    apiBaseURL,
    subresources,
    cache,
  }: {
    apiBaseURL: string;
    subresources: Iterable<string>;
    cache: BrowserRouteCache;
  },
): Fetch {
  const allowed = new Set([...subresources].map((value) => value.trim()).filter(Boolean));
  const apiOrigin = new URL(apiBaseURL).origin;

  return async (input, init) => {
    const request = new Request(input, init);
    const shouldSniff = shouldSniffAndPopulateCache(request, apiOrigin);
    const response = await routeRequest(innerFetch, { input, init, request }, apiOrigin, allowed, cache);
    if (shouldSniff) {
      await sniffAndPopulateCache(response, cache);
    }
    await maybeEvictBrowserRoute(request, response, apiOrigin, cache);
    return response;
  };
}

function shouldSniffAndPopulateCache(request: Request, apiOrigin: string): boolean {
  const url = new URL(request.url);
  return (
    url.origin === apiOrigin &&
    (BROWSER_ROUTE_CACHEABLE_PATH.test(url.pathname) || BROWSER_POOL_ACQUIRE_PATH.test(url.pathname))
  );
}

async function maybeEvictBrowserRoute(
  request: Request,
  response: Response,
  apiOrigin: string,
  cache: BrowserRouteCache,
): Promise<void> {
  if (!response.ok) {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== apiOrigin) {
    return;
  }

  const sessionId =
    deletedSessionIdFromPath(request, url.pathname) ??
    (await releasedSessionIdFromRequest(request, url.pathname));
  if (sessionId) {
    cache.delete(sessionId);
  }
}

function deletedSessionIdFromPath(request: Request, pathname: string): string | undefined {
  if (request.method.toUpperCase() !== 'DELETE') {
    return undefined;
  }

  const match = pathname.match(BROWSER_DELETE_BY_ID_PATH);
  if (!match) {
    return undefined;
  }

  const sessionId = decodeURIComponent(match[1] ?? '');
  return sessionId || undefined;
}

async function releasedSessionIdFromRequest(request: Request, pathname: string): Promise<string | undefined> {
  if (request.method.toUpperCase() !== 'POST' || !BROWSER_POOL_RELEASE_PATH.test(pathname)) {
    return undefined;
  }

  try {
    const body = await request.clone().json();
    if (!body || typeof body !== 'object') {
      return undefined;
    }

    const sessionId = (body as Record<string, unknown>)['session_id'];
    return typeof sessionId === 'string' && sessionId.trim() ? sessionId.trim() : undefined;
  } catch {
    return undefined;
  }
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
  const jwt = explicitJWT || parseJwtFromCdpWsUrl(cdpWsURL) || '';
  if (!jwt) {
    return undefined;
  }
  return {
    sessionId,
    baseURL,
    jwt,
  };
}

async function sniffAndPopulateCache(response: Response, cache: BrowserRouteCache): Promise<void> {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.includes('application/json')) {
    return;
  }

  try {
    populateCache(await response.clone().json(), cache);
  } catch {
    // Ignore malformed JSON in routing cache population.
  }
}

function populateCache(value: unknown, cache: BrowserRouteCache): void {
  const route = browserRouteFromValue(value);
  if (route) {
    cache.set(route);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      populateCache(item, cache);
    }
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  for (const child of Object.values(value as Record<string, unknown>)) {
    if (typeof child === 'object' && child !== null) {
      populateCache(child, cache);
    }
  }
}

async function routeRequest(
  innerFetch: Fetch,
  {
    input,
    init,
    request,
  }: {
    input: RequestInfo;
    init: RequestInit | undefined;
    request: Request;
  },
  apiOrigin: string,
  allowed: ReadonlySet<string>,
  cache: BrowserRouteCache,
): Promise<Response> {
  const url = new URL(request.url);
  if (url.origin !== apiOrigin) {
    return innerFetch(input, init);
  }

  const match = url.pathname.match(/^\/(?:v\d+\/)?browsers\/([^/]+)\/([^/]+)(\/.*)?$/);
  if (!match) {
    return innerFetch(input, init);
  }

  const sessionId = decodeURIComponent(match[1] ?? '');
  const subresource = match[2] ?? '';
  if (!sessionId || !allowed.has(subresource)) {
    return innerFetch(input, init);
  }
  const route = cache.get(sessionId);
  if (route === undefined) {
    return innerFetch(input, init);
  }

  const target = new URL(joinURL(route.baseURL, `/${subresource}${match[3] ?? ''}`));
  url.searchParams.forEach((value, key) => {
    if (key !== 'jwt') {
      target.searchParams.append(key, value);
    }
  });
  if (!target.searchParams.get('jwt')) {
    target.searchParams.set('jwt', route.jwt);
  }

  const headers = new Headers(request.headers);
  headers.delete('authorization');
  return innerFetch(target.toString(), buildRoutedInit(request, init, headers));
}

function buildRoutedInit(
  request: Request,
  originalInit: RequestInit | undefined,
  headers: Headers,
): RequestInit {
  const method = request.method.toUpperCase();
  const routedInit = {
    ...((originalInit ?? {}) as Record<string, unknown>),
    method,
    headers,
    redirect: request.redirect,
    signal: request.signal,
  } as RequestInit & Record<string, unknown>;

  delete routedInit['body'];
  delete routedInit['duplex'];

  if (method !== 'GET' && method !== 'HEAD') {
    const body = requestBodyForFetch(request, originalInit);
    if (body !== undefined) {
      routedInit.body = body;
    }
    if (originalInit?.duplex !== undefined) {
      routedInit.duplex = originalInit.duplex;
    } else if (requiresHalfDuplex(body)) {
      routedInit.duplex = 'half';
    }
  }

  return routedInit;
}

function requestBodyForFetch(
  request: Request,
  originalInit: RequestInit | undefined,
): RequestInit['body'] | undefined {
  if (originalInit?.body !== undefined && originalInit.body !== null) {
    return originalInit.body;
  }

  return request.body ?? undefined;
}

function requiresHalfDuplex(body: RequestInit['body'] | undefined): boolean {
  return (
    ((globalThis as any).ReadableStream && body instanceof (globalThis as any).ReadableStream) ||
    (typeof body === 'object' && body !== null && Symbol.asyncIterator in body)
  );
}

function parseJwtFromCdpWsUrl(cdpWsUrl: string | undefined): string | undefined {
  if (!cdpWsUrl) {
    return undefined;
  }

  try {
    return new URL(cdpWsUrl).searchParams.get('jwt') ?? undefined;
  } catch {
    return undefined;
  }
}

function readBrowserRoutingSubresourcesEnv(): string | undefined {
  if (typeof (globalThis as any).process !== 'undefined') {
    const value = (globalThis as any).process.env?.[BROWSER_ROUTING_SUBRESOURCES_ENV];
    return typeof value === 'string' ? value : undefined;
  }

  if (typeof (globalThis as any).Deno !== 'undefined') {
    const value = (globalThis as any).Deno.env?.get?.(BROWSER_ROUTING_SUBRESOURCES_ENV);
    return typeof value === 'string' ? value : undefined;
  }

  return undefined;
}
