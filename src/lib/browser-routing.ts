import type { Fetch } from '../internal/builtin-types';
import { parseJwtFromCdpWsUrl } from './browser-transport';

export type BrowserRoute = {
  sessionId: string;
  baseURL: string;
  jwt: string;
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
    this.entries.set(route.sessionId, {
      sessionId: route.sessionId.trim(),
      baseURL: route.baseURL.trim(),
      jwt: route.jwt.trim(),
    });
  }

  delete(sessionId: string): void {
    this.entries.delete(sessionId);
  }

  clear(): void {
    this.entries.clear();
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
    const request = new Request(input, init);
    const response = await routeRequest(innerFetch, request, apiOrigin, allowed, cache);
    await sniffAndPopulateCache(response, cache);
    return response;
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
  request: Request,
  apiOrigin: string,
  allowed: ReadonlySet<string>,
  cache: BrowserRouteCache,
): Promise<Response> {
  const url = new URL(request.url);
  if (url.origin !== apiOrigin) {
    return innerFetch(request);
  }

  const match = url.pathname.match(/^\/(?:v\d+\/)?browsers\/([^/]+)\/([^/]+)(\/.*)?$/);
  if (!match) {
    return innerFetch(request);
  }

  const sessionId = decodeURIComponent(match[1] ?? '');
  const subresource = match[2] ?? '';
  if (!sessionId || !allowed.has(subresource)) {
    return innerFetch(request);
  }
  const route = cache.get(sessionId);
  if (route === undefined) {
    return innerFetch(request);
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

