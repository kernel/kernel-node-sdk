import Kernel from '@onkernel/sdk';
import {
  BrowserRouteCache,
  extractRoutesFromBody,
  METRO_DIRECT_SUBRESOURCES,
  createRoutingFetch,
} from '@onkernel/sdk/lib/browser-routing';

const API_BASE = 'https://api.example.test';
const METRO_BASE = 'https://proxy.yul-upbeat-herschel.onkernel.com:8443/browser/kernel';
const SESSION_ID = 'sess-abc';
const JWT = 'jwt-xyz';

// A Browser-shaped response body that matches the real openapi schema.
function browserResponse(overrides: Partial<Record<string, string>> = {}) {
  return {
    session_id: overrides['session_id'] ?? SESSION_ID,
    base_url: overrides['base_url'] ?? METRO_BASE,
    cdp_ws_url:
      overrides['cdp_ws_url'] ??
      `wss://proxy.yul-upbeat-herschel.onkernel.com:8443/browser/kernel/cdp?jwt=${JWT}`,
    webdriver_ws_url: 'wss://example/webdriver?jwt=' + JWT,
    created_at: '2026-04-21T00:00:00Z',
    headless: true,
    stealth: false,
    timeout_seconds: 600,
  };
}

// Helper: make a fake fetch that records every call and returns scripted responses.
function makeFakeFetch(
  scripts: Array<(url: string, init?: RequestInit) => Response | Promise<Response>>,
) {
  const calls: Array<{ url: string; init: RequestInit | undefined }> = [];
  let i = 0;
  const fetch = async (input: any, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : (input as URL).toString();
    calls.push({ url, init });
    const script = scripts[i++] ?? scripts[scripts.length - 1]!;
    return script(url, init);
  };
  return { fetch: fetch as unknown as typeof globalThis.fetch, calls };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('extractRoutesFromBody', () => {
  test('extracts route from a single Browser response', () => {
    const routes = extractRoutesFromBody(browserResponse());
    expect(routes).toEqual([{ id: SESSION_ID, route: { baseURL: METRO_BASE, jwt: JWT } }]);
  });

  test('extracts routes from a list-response shape', () => {
    const routes = extractRoutesFromBody({
      items: [browserResponse(), browserResponse({ session_id: 'sess-2' })],
    });
    expect(routes.map((r) => r.id)).toEqual([SESSION_ID, 'sess-2']);
  });

  test('ignores objects that are not Browser-shaped', () => {
    expect(extractRoutesFromBody({ foo: 'bar' })).toEqual([]);
    expect(extractRoutesFromBody(null)).toEqual([]);
  });

  test('skips Browser entries whose cdp_ws_url has no jwt', () => {
    const routes = extractRoutesFromBody(
      browserResponse({ cdp_ws_url: 'wss://example/cdp' }),
    );
    expect(routes).toEqual([]);
  });
});

describe('createRoutingFetch (unit)', () => {
  test('rewrites allowlisted subresource calls when cache is warm', async () => {
    const cache = new BrowserRouteCache();
    cache.set(SESSION_ID, { baseURL: METRO_BASE, jwt: JWT });

    const upstream = makeFakeFetch([() => jsonResponse({ ok: true })]);
    const routing = createRoutingFetch({
      apiBaseURL: API_BASE,
      inner: upstream.fetch as any,
      cache,
    });

    const res = await routing(`${API_BASE}/browsers/${SESSION_ID}/process/exec`, {
      method: 'POST',
      headers: { Authorization: 'Bearer sk-my-api-key', 'content-type': 'application/json' },
      body: JSON.stringify({ command: 'ls', args: [] }),
    });

    expect(res.status).toBe(200);
    expect(upstream.calls).toHaveLength(1);
    const call = upstream.calls[0]!;
    const url = new URL(call.url);
    expect(url.origin + url.pathname).toBe(`${METRO_BASE}/process/exec`);
    expect(url.searchParams.get('jwt')).toBe(JWT);

    const headers = new Headers(call.init!.headers as any);
    expect(headers.has('authorization')).toBe(false);
    expect(headers.get('content-type')).toBe('application/json');
  });

  test('falls through to public API on cache miss', async () => {
    const cache = new BrowserRouteCache();
    const upstream = makeFakeFetch([() => jsonResponse({ ok: true })]);
    const routing = createRoutingFetch({
      apiBaseURL: API_BASE,
      inner: upstream.fetch as any,
      cache,
    });

    await routing(`${API_BASE}/browsers/unknown-id/fs/read_file`, { method: 'POST' });

    expect(upstream.calls).toHaveLength(1);
    expect(upstream.calls[0]!.url).toBe(`${API_BASE}/browsers/unknown-id/fs/read_file`);
  });

  test('non-allowlisted subresource is never rewritten even with a warm cache', async () => {
    const cache = new BrowserRouteCache();
    cache.set(SESSION_ID, { baseURL: METRO_BASE, jwt: JWT });

    // Sanity check — extensions deliberately excluded.
    expect(METRO_DIRECT_SUBRESOURCES.has('extensions')).toBe(false);

    const upstream = makeFakeFetch([() => jsonResponse({ items: [] })]);
    const routing = createRoutingFetch({
      apiBaseURL: API_BASE,
      inner: upstream.fetch as any,
      cache,
    });

    await routing(`${API_BASE}/browsers/${SESSION_ID}/extensions`, { method: 'GET' });

    expect(upstream.calls).toHaveLength(1);
    expect(upstream.calls[0]!.url).toBe(`${API_BASE}/browsers/${SESSION_ID}/extensions`);
  });

  test('evicts cache and retries public API when metro returns 401', async () => {
    const cache = new BrowserRouteCache();
    cache.set(SESSION_ID, { baseURL: METRO_BASE, jwt: JWT });

    const upstream = makeFakeFetch([
      () => new Response('expired', { status: 401 }),
      () => jsonResponse({ ok: true }),
    ]);
    const routing = createRoutingFetch({
      apiBaseURL: API_BASE,
      inner: upstream.fetch as any,
      cache,
    });

    const res = await routing(`${API_BASE}/browsers/${SESSION_ID}/process/exec`, {
      method: 'POST',
      headers: { Authorization: 'Bearer sk-my-api-key' },
    });

    expect(res.status).toBe(200);
    expect(upstream.calls).toHaveLength(2);
    // First call: metro-direct (rewritten).
    expect(new URL(upstream.calls[0]!.url).origin).toBe(new URL(METRO_BASE).origin);
    // Second call: public API fallback (original URL + Authorization preserved).
    expect(upstream.calls[1]!.url).toBe(`${API_BASE}/browsers/${SESSION_ID}/process/exec`);
    expect(new Headers(upstream.calls[1]!.init!.headers as any).get('authorization')).toBe(
      'Bearer sk-my-api-key',
    );
    // And the failed JWT was evicted.
    expect(cache.get(SESSION_ID)).toBeUndefined();
  });

  test('populates cache from Browser-shaped responses', async () => {
    const cache = new BrowserRouteCache();
    const upstream = makeFakeFetch([() => jsonResponse(browserResponse())]);
    const routing = createRoutingFetch({
      apiBaseURL: API_BASE,
      inner: upstream.fetch as any,
      cache,
    });

    const res = await routing(`${API_BASE}/browsers`, { method: 'POST' });
    // Caller still gets a working body.
    await expect(res.json()).resolves.toMatchObject({ session_id: SESSION_ID });
    expect(cache.get(SESSION_ID)).toEqual({ baseURL: METRO_BASE, jwt: JWT });
  });
});

describe('Kernel integration (browserRouting enabled)', () => {
  test('browsers.process.exec routes to metro after a create populates the cache', async () => {
    const calls: Array<{ url: string; init: RequestInit | undefined }> = [];
    const fakeFetch = (async (input: any, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : (input as URL).toString();
      calls.push({ url, init });
      if (url.startsWith(API_BASE) && url.includes('/browsers') && init?.method === 'POST' && !url.includes('/process')) {
        return jsonResponse(browserResponse());
      }
      return jsonResponse({ exit_code: 0, stdout_b64: '', stderr_b64: '' });
    }) as unknown as typeof globalThis.fetch;

    const client = new Kernel({
      apiKey: 'sk-my-api-key',
      baseURL: API_BASE,
      browserRouting: { enabled: true },
      fetch: fakeFetch,
    });

    const browser = await client.browsers.create();
    expect(browser.session_id).toBe(SESSION_ID);
    expect(client.browserRouteCache?.get(SESSION_ID)).toEqual({
      baseURL: METRO_BASE,
      jwt: JWT,
    });

    // Subresource call should transparently go to metro, strip auth, add ?jwt=.
    await client.browsers.process.exec(browser.session_id, { command: 'ls' } as any);

    expect(calls.length).toBeGreaterThanOrEqual(2);
    const exec = calls.find((c) => c.url.includes('/process/exec'))!;
    const execURL = new URL(exec.url);
    expect(execURL.origin + execURL.pathname).toBe(`${METRO_BASE}/process/exec`);
    expect(execURL.searchParams.get('jwt')).toBe(JWT);
    expect(new Headers(exec.init!.headers as any).has('authorization')).toBe(false);
  });

  test('with browserRouting disabled, subresource calls stay on the public API', async () => {
    const calls: Array<{ url: string }> = [];
    const fakeFetch = (async (input: any, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : (input as URL).toString();
      calls.push({ url });
      if (url.startsWith(API_BASE) && url.includes('/browsers') && init?.method === 'POST' && !url.includes('/process')) {
        return jsonResponse(browserResponse());
      }
      return jsonResponse({ exit_code: 0, stdout_b64: '', stderr_b64: '' });
    }) as unknown as typeof globalThis.fetch;

    const client = new Kernel({
      apiKey: 'sk-my-api-key',
      baseURL: API_BASE,
      fetch: fakeFetch,
    });

    const browser = await client.browsers.create();
    await client.browsers.process.exec(browser.session_id, { command: 'ls' } as any);
    expect(client.browserRouteCache).toBeUndefined();
    const exec = calls.find((c) => c.url.includes('/process/exec'))!;
    expect(new URL(exec.url).origin).toBe(new URL(API_BASE).origin);
  });
});
