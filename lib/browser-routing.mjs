import { CancelReadableStream } from "../internal/shims.mjs";
import { joinURL } from "./join-url.mjs";
export class BrowserRouteCache {
    constructor() {
        this.entries = new Map();
    }
    get(sessionId) {
        return this.entries.get(sessionId);
    }
    set(route) {
        this.entries.set(route.sessionId, route);
    }
    delete(sessionId) {
        this.entries.delete(sessionId);
    }
    deleteIfJwt(sessionId, jwt) {
        const route = this.entries.get(sessionId);
        if (!route || route.jwt !== jwt) {
            return false;
        }
        this.entries.delete(sessionId);
        return true;
    }
    clear() {
        this.entries.clear();
    }
}
const BROWSER_ROUTING_SUBRESOURCES_ENV = 'KERNEL_BROWSER_ROUTING_SUBRESOURCES';
// Path prefixes eligible for direct-to-VM routing. "telemetry/stream" is the live
// SSE endpoint (served by the VM); "telemetry/events" is a historical read served
// by the control plane (S2) and must NOT be here.
const DEFAULT_BROWSER_ROUTING_SUBRESOURCES = [
    'curl',
    'telemetry/stream',
    'computer',
    'playwright',
    'process',
    'fs',
    'logs/stream',
];
const BROWSER_ROUTE_CACHEABLE_PATH = /^\/(?:v\d+\/)?browsers(?:\/[^/]+)?\/?$/;
const BROWSER_POOL_ACQUIRE_PATH = /^\/(?:v\d+\/)?browser_pools\/[^/]+\/acquire\/?$/;
const BROWSER_DELETE_BY_ID_PATH = /^\/(?:v\d+\/)?browsers\/([^/]+)\/?$/;
const BROWSER_POOL_RELEASE_PATH = /^\/(?:v\d+\/)?browser_pools\/[^/]+\/release\/?$/;
export function browserRoutingSubresourcesFromEnv() {
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
export function createRoutingFetch(innerFetch, { apiBaseURL, subresources, cache, }) {
    const allowed = [...subresources].map((value) => value.trim().replace(/^\/+|\/+$/g, '')).filter(Boolean);
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
function shouldSniffAndPopulateCache(request, apiOrigin) {
    const url = new URL(request.url);
    return (url.origin === apiOrigin &&
        (BROWSER_ROUTE_CACHEABLE_PATH.test(url.pathname) || BROWSER_POOL_ACQUIRE_PATH.test(url.pathname)));
}
async function maybeEvictBrowserRoute(request, response, apiOrigin, cache) {
    if (!response.ok) {
        return;
    }
    const url = new URL(request.url);
    if (url.origin !== apiOrigin) {
        return;
    }
    const sessionId = deletedSessionIdFromPath(request, url.pathname) ??
        (await releasedSessionIdFromRequest(request, url.pathname));
    if (sessionId) {
        cache.delete(sessionId);
    }
}
function deletedSessionIdFromPath(request, pathname) {
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
async function releasedSessionIdFromRequest(request, pathname) {
    if (request.method.toUpperCase() !== 'POST' || !BROWSER_POOL_RELEASE_PATH.test(pathname)) {
        return undefined;
    }
    try {
        const body = await request.clone().json();
        if (!body || typeof body !== 'object') {
            return undefined;
        }
        const sessionId = body['session_id'];
        return typeof sessionId === 'string' && sessionId.trim() ? sessionId.trim() : undefined;
    }
    catch {
        return undefined;
    }
}
function browserRouteFromValue(value) {
    if (!value || typeof value !== 'object') {
        return undefined;
    }
    const record = value;
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
async function sniffAndPopulateCache(response, cache) {
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    if (!contentType.includes('application/json')) {
        return;
    }
    try {
        populateCache(await response.clone().json(), cache);
    }
    catch {
        // Ignore malformed JSON in routing cache population.
    }
}
function populateCache(value, cache) {
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
    for (const child of Object.values(value)) {
        if (typeof child === 'object' && child !== null) {
            populateCache(child, cache);
        }
    }
}
// matchesDirectVMPrefix reports whether tail (the path after browsers/{id}/) is
// covered by an allow prefix, matching on segment boundaries: "telemetry/stream"
// matches "telemetry/stream" and "telemetry/stream/...", but not "telemetry/events"
// or "telemetry/streamfoo". Keeps historical control-plane reads (telemetry/events,
// served from S2) off the VM.
export function matchesDirectVMPrefix(tail, prefixes) {
    const t = tail.replace(/^\/+|\/+$/g, '');
    return prefixes.some((p) => t === p || t.startsWith(p + '/'));
}
async function routeRequest(innerFetch, { input, init, request, }, apiOrigin, allowed, cache) {
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
    if (!sessionId || !matchesDirectVMPrefix(subresource + (match[3] ?? ''), allowed)) {
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
    const body = requestBodyForFetch(request, init);
    const routed = await innerFetch(target.toString(), buildRoutedInit(input, request, init, headers));
    if ((routed.status === 401 || routed.status === 403) && target.searchParams.get('jwt')) {
        cache.deleteIfJwt(sessionId, target.searchParams.get('jwt') ?? '');
        if (isStreamingBody(body)) {
            return routed;
        }
        await CancelReadableStream(routed.body);
        return innerFetch(input, init);
    }
    return routed;
}
function buildRoutedInit(input, request, originalInit, headers) {
    const method = request.method.toUpperCase();
    const body = method === 'GET' || method === 'HEAD' ? undefined : requestBodyForFetch(request, originalInit);
    if (derivesOwnContentType(body) && !new Headers(originalInit?.headers).get('content-type')) {
        // `request` was constructed from the same body, so its content-type carries
        // that construction's multipart boundary. The routed fetch re-encodes the
        // body with a new boundary, so let it derive the header again.
        headers.delete('content-type');
    }
    const routedInit = {
        ...(originalInit ?? {}),
        method,
        headers,
        redirect: request.redirect,
        signal: originalInit?.signal ?? (input instanceof Request ? input.signal : undefined),
    };
    delete routedInit['body'];
    delete routedInit['duplex'];
    if (body !== undefined) {
        routedInit.body = body;
    }
    if (method !== 'GET' && method !== 'HEAD') {
        if (originalInit?.duplex !== undefined) {
            routedInit.duplex = originalInit.duplex;
        }
        else if (isStreamingBody(body)) {
            routedInit.duplex = 'half';
        }
    }
    return routedInit;
}
function requestBodyForFetch(request, originalInit) {
    if (originalInit?.body !== undefined && originalInit.body !== null) {
        return originalInit.body;
    }
    return request.body ?? undefined;
}
function derivesOwnContentType(body) {
    return ((globalThis.FormData && body instanceof globalThis.FormData) ||
        (globalThis.URLSearchParams && body instanceof globalThis.URLSearchParams) ||
        (globalThis.Blob && body instanceof globalThis.Blob));
}
function isStreamingBody(body) {
    return ((globalThis.ReadableStream && body instanceof globalThis.ReadableStream) ||
        (typeof body === 'object' && body !== null && Symbol.asyncIterator in body));
}
function parseJwtFromCdpWsUrl(cdpWsUrl) {
    if (!cdpWsUrl) {
        return undefined;
    }
    try {
        return new URL(cdpWsUrl).searchParams.get('jwt') ?? undefined;
    }
    catch {
        return undefined;
    }
}
function readBrowserRoutingSubresourcesEnv() {
    if (typeof globalThis.process !== 'undefined') {
        const value = globalThis.process.env?.[BROWSER_ROUTING_SUBRESOURCES_ENV];
        return typeof value === 'string' ? value : undefined;
    }
    if (typeof globalThis.Deno !== 'undefined') {
        const value = globalThis.Deno.env?.get?.(BROWSER_ROUTING_SUBRESOURCES_ENV);
        return typeof value === 'string' ? value : undefined;
    }
    return undefined;
}
//# sourceMappingURL=browser-routing.mjs.map