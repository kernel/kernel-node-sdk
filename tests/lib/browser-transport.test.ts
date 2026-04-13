import {
  mergeBrowserScopedRequestOptions,
  parseJwtFromCdpWsUrl,
  resolveBrowserTransport,
} from '../../src/lib/browser-transport';

describe('browser transport', () => {
  test('parseJwtFromCdpWsUrl reads jwt query param', () => {
    const jwt = parseJwtFromCdpWsUrl('wss://browser-session.test/browser/cdp?jwt=abc%2B123&x=1');
    expect(jwt).toBe('abc+123');
  });

  test('resolveBrowserTransport prefers explicit jwt', () => {
    const t = resolveBrowserTransport({
      session_id: 'sess',
      base_url: 'https://vm.browser-session.test/browser/kernel',
      cdp_ws_url: 'wss://x/cdp?jwt=fromcdp',
      jwt: 'explicit',
    });
    expect(t.sessionId).toBe('sess');
    expect(t.defaultBaseURL).toBe('https://vm.browser-session.test/browser/kernel');
    expect(t.jwt).toBe('explicit');
  });

  test('resolveBrowserTransport falls back to cdp_ws_url jwt', () => {
    const t = resolveBrowserTransport({
      session_id: 'sess',
      base_url: 'https://vm.browser-session.test/browser/kernel',
      cdp_ws_url: 'wss://x/cdp?jwt=fromcdp',
    });
    expect(t.jwt).toBe('fromcdp');
  });

  test('mergeBrowserScopedRequestOptions injects jwt into query', () => {
    const merged = mergeBrowserScopedRequestOptions(
      { sessionId: 's', defaultBaseURL: 'https://m/k', jwt: 'j' },
      { query: { a: '1' } },
    );
    expect(merged?.defaultBaseURL).toBe('https://m/k');
    expect(merged?.query).toEqual({ a: '1', jwt: 'j' });
  });

  test('mergeBrowserScopedRequestOptions is noop without browser session base URL', () => {
    const opts = { query: { a: '1' } };
    const merged = mergeBrowserScopedRequestOptions({ sessionId: 's' }, opts);
    expect(merged).toBe(opts);
  });
});
