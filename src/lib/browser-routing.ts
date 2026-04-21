/**
 * Demo: dynamic metro-direct routing for browser subresource calls.
 *
 * This is a proof-of-concept for how the Node SDK could transparently route
 * `/browsers/{id}/<sub>/...` calls directly to metro-api instead of hopping
 * through the public API, without changing any user-facing API surface.
 *
 * Shape of the idea:
 *   1. Intercept the SDK's `fetch` call.
 *   2. Keep a per-client in-memory cache of `{ id -> { baseURL, jwt } }`.
 *   3. On outgoing requests to `<apiBaseURL>/browsers/{id}/<allowlisted sub>`,
 *      rewrite the URL to `<cached.baseURL>/<sub>?jwt=<cached.jwt>` and strip
 *      the Authorization header.
 *   4. On incoming JSON responses that look like a Browser (have `session_id`
 *      + `cdp_ws_url`), populate the cache as a side effect. So the common
 *      case of "create a browser, then use it" warms the cache for free.
 *   5. If the metro-direct call returns 401/403/404, evict the cache entry
 *      and retry once against the public API so the caller never sees a
 *      transient failure caused by our rewrite.
 *
 * Not implemented here (noted as TODOs so the shape is obvious):
 *   - Lazy-fill on cache miss via `GET /browsers/{id}` (with single-flight).
 *   - Driving the allowlist from `x-metro-direct` in the OpenAPI spec instead
 *     of a hardcoded set. That's a codegen change, orthogonal to this runtime.
 *   - True LRU eviction (the demo uses insertion-order + size cap).
 *   - JWT expiry tracking (would normally come from the JWT claims or a TTL
 *     field on the Browser response).
 */

import type { Fetch } from '../internal/builtin-types';

export interface BrowserRoute {
  baseURL: string;
  jwt: string;
  // Expiration; `undefined` means we don't know and we just trust until 401.
  expiresAt?: number;
}

export class BrowserRouteCache {
  private readonly entries = new Map<string, BrowserRoute>();
  constructor(private readonly maxEntries = 1024) {}

  get(id: string): BrowserRoute | undefined {
    const e = this.entries.get(id);
    if (!e) return undefined;
    if (e.expiresAt !== undefined && e.expiresAt < Date.now()) {
      this.entries.delete(id);
      return undefined;
    }
    return e;
  }

  set(id: string, route: BrowserRoute): void {
    if (this.entries.size >= this.maxEntries && !this.entries.has(id)) {
      // Evict the oldest entry (insertion order).
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(id, route);
  }

  evict(id: string): void {
    this.entries.delete(id);
  }

  size(): number {
    return this.entries.size;
  }
}

/**
 * Allowlist of browser subresource path segments that are safe to serve
 * directly from metro-api. In the real design this would be generated at
 * codegen time from `x-metro-direct: true` markers in the OpenAPI spec.
 *
 * Notably excluded:
 *   - `extensions`: DB-backed on the public API, no in-VM equivalent.
 *   - `replays`: path semantics differ between public API and metro.
 */
export const METRO_DIRECT_SUBRESOURCES: ReadonlySet<string> = new Set([
  'process',
  'fs',
  'computer',
  'playwright',
  'curl',
  'logs',
]);

const BROWSER_PATH_RE = /^\/(?:v\d+\/)?browsers\/([^/?#]+)\/([^/?#]+)(\/.*)?$/;

export interface RoutingFetchOptions {
  /** API base URL that the SDK would otherwise hit (used to scope rewrite). */
  apiBaseURL: string;
  /** The fetch to delegate to (usually the user-provided or global fetch). */
  inner: Fetch;
  /** Shared routing cache. */
  cache: BrowserRouteCache;
  /** Optional logger for debugging / observability. */
  logger?: { debug?: (...args: unknown[]) => void; warn?: (...args: unknown[]) => void };
}

type RouteMatch =
  | { kind: 'route'; id: string; subresource: string; rest: string }
  | { kind: 'skip' };

function matchBrowserSubresource(url: URL, apiBaseURL: URL): RouteMatch {
  // Only rewrite requests that were aimed at the configured public API.
  if (url.origin !== apiBaseURL.origin) return { kind: 'skip' };

  const m = BROWSER_PATH_RE.exec(url.pathname);
  if (!m) return { kind: 'skip' };
  const [, id, subresource, rest] = m;
  if (!METRO_DIRECT_SUBRESOURCES.has(subresource!)) return { kind: 'skip' };
  return { kind: 'route', id: id!, subresource: subresource!, rest: rest ?? '' };
}

function rewriteRequest(
  originalUrl: URL,
  route: BrowserRoute,
  subresource: string,
  rest: string,
  init: RequestInit | undefined,
): { url: string; init: RequestInit } {
  // `route.baseURL` already includes the `/browser/kernel` prefix
  // (e.g. https://proxy.yul-upbeat-herschel.onkernel.com:8443/browser/kernel).
  const target = new URL(route.baseURL.replace(/\/$/, '') + '/' + subresource + rest);

  // Preserve any query params the caller set.
  originalUrl.searchParams.forEach((v, k) => {
    if (k !== 'jwt') target.searchParams.set(k, v);
  });
  target.searchParams.set('jwt', route.jwt);

  // Strip Authorization: metro-api authenticates via the JWT query param.
  const headers = new Headers((init?.headers as Record<string, string> | Headers | undefined) ?? {});
  headers.delete('authorization');
  headers.delete('Authorization');

  return {
    url: target.toString(),
    init: { ...init, headers },
  };
}

/**
 * Try to extract a BrowserRoute from a decoded JSON body that looks like a
 * Browser (or a list of them). Returns all extracted routes.
 */
export function extractRoutesFromBody(body: unknown): Array<{ id: string; route: BrowserRoute }> {
  const out: Array<{ id: string; route: BrowserRoute }> = [];
  const visit = (v: unknown) => {
    if (!v || typeof v !== 'object') return;
    const obj = v as Record<string, unknown>;

    const sessionId = typeof obj['session_id'] === 'string' ? (obj['session_id'] as string) : undefined;
    const baseURL = typeof obj['base_url'] === 'string' ? (obj['base_url'] as string) : undefined;
    const cdpWsUrl = typeof obj['cdp_ws_url'] === 'string' ? (obj['cdp_ws_url'] as string) : undefined;
    if (sessionId && baseURL && cdpWsUrl) {
      try {
        const jwt = new URL(cdpWsUrl).searchParams.get('jwt');
        if (jwt) out.push({ id: sessionId, route: { baseURL, jwt } });
      } catch {
        // Ignore malformed URLs; we'll just not cache this entry.
      }
    }

    // Common list-response shape: { items: [...] }.
    if (Array.isArray(obj['items'])) for (const item of obj['items']) visit(item);
    // Defensive: walk direct array contents too.
    if (Array.isArray(v)) for (const item of v as unknown[]) visit(item);
  };
  visit(body);
  return out;
}

async function sniffAndPopulateCache(response: Response, cache: BrowserRouteCache): Promise<Response> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return response;

  // Clone so the caller still gets an untouched body.
  const clone = response.clone();
  try {
    const body = await clone.json();
    for (const { id, route } of extractRoutesFromBody(body)) {
      cache.set(id, route);
    }
  } catch {
    // Not valid JSON or already consumed; ignore.
  }
  return response;
}

/**
 * Returns a `fetch`-compatible function that transparently routes
 * browser subresource calls to metro-direct when possible.
 */
export function createRoutingFetch(opts: RoutingFetchOptions): Fetch {
  const { apiBaseURL, inner, cache, logger } = opts;
  const parsedApiBase = new URL(apiBaseURL);

  const fn: Fetch = async (input, init) => {
    const urlString = typeof input === 'string' ? input : (input as URL).toString();
    let url: URL;
    try {
      url = new URL(urlString);
    } catch {
      return inner(input, init);
    }

    const match = matchBrowserSubresource(url, parsedApiBase);
    if (match.kind === 'skip') {
      const resp = await inner(input, init);
      return sniffAndPopulateCache(resp, cache);
    }

    const route = cache.get(match.id);
    if (!route) {
      // TODO(demo): lazy-fill via GET /browsers/{id} with single-flight.
      // For now just fall through to the public API; the response handler
      // below will populate the cache from the Browser response when the
      // endpoint happens to return one, or from subsequent create/retrieve
      // calls.
      logger?.debug?.('[browser-routing] cache miss, falling through', match.id);
      const resp = await inner(input, init);
      return sniffAndPopulateCache(resp, cache);
    }

    const rewritten = rewriteRequest(url, route, match.subresource, match.rest, init);
    logger?.debug?.('[browser-routing] routing metro-direct', {
      id: match.id,
      subresource: match.subresource,
      target: rewritten.url,
    });

    const resp = await inner(rewritten.url, rewritten.init);
    if (resp.status === 401 || resp.status === 403 || resp.status === 404) {
      logger?.warn?.(
        '[browser-routing] metro-direct rejected, evicting and retrying via public API',
        { id: match.id, status: resp.status },
      );
      cache.evict(match.id);
      const fallback = await inner(input, init);
      return sniffAndPopulateCache(fallback, cache);
    }
    return sniffAndPopulateCache(resp, cache);
  };
  return fn;
}
