import Kernel from '@onkernel/sdk';

describe('browser routing', () => {
  const normalizeURL = (input: string | URL | Request) =>
    typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  test('warms cache from browser responses and routes allowlisted subresources directly to the VM', async () => {
    const calls: Array<{ url: string; headers: Headers }> = [];
    const kernel = new Kernel({
      apiKey: 'k',
      baseURL: 'https://api.example/',
      browserRouting: {
        enabled: true,
        directToVMSubresources: ['process', 'curl'],
      },
      fetch: async (input, init?: RequestInit) => {
        const url = normalizeURL(input);
        const headers = input instanceof Request ? new Headers(input.headers) : new Headers(init?.headers);
        calls.push({ url, headers });
        if (url === 'https://api.example/browsers') {
          return Response.json({
            session_id: 'sess-1',
            base_url: 'http://browser-session.test/browser/kernel',
            cdp_ws_url: 'wss://browser-session.test/browser/cdp?jwt=token-abc',
          });
        }
        return Response.json({ exit_code: 0, stdout_b64: '', stderr_b64: '' });
      },
    });

    await kernel.browsers.create();
    await kernel.browsers.process.exec('sess-1', { command: 'echo', args: ['hi'] });

    expect(kernel.browserRouteCache.get('sess-1')).toMatchObject({
      sessionId: 'sess-1',
      baseURL: 'http://browser-session.test/browser/kernel',
      jwt: 'token-abc',
    });
    expect(calls).toHaveLength(2);
    expect(calls[1]?.url).toBe('http://browser-session.test/browser/kernel/process/exec?jwt=token-abc');
    expect(calls[1]?.headers.get('authorization')).toBeNull();
  });

  test('does not route non-allowlisted subresources directly to the VM', async () => {
    const calls: string[] = [];
    const kernel = new Kernel({
      apiKey: 'k',
      baseURL: 'https://api.example/',
      browserRouting: {
        enabled: true,
        directToVMSubresources: ['computer'],
      },
      fetch: async (input) => {
        const url = normalizeURL(input);
        calls.push(url);
        if (url === 'https://api.example/browsers') {
          return Response.json({
            session_id: 'sess-1',
            base_url: 'http://browser-session.test/browser/kernel',
            cdp_ws_url: 'wss://browser-session.test/browser/cdp?jwt=token-abc',
          });
        }
        return Response.json({ exit_code: 0, stdout_b64: '', stderr_b64: '' });
      },
    });

    await kernel.browsers.create();
    await kernel.browsers.process.exec('sess-1', { command: 'echo' });

    expect(calls[1]).toBe('https://api.example/browsers/sess-1/process/exec');
  });

  test('withOptions reuses the same browser route cache without double-wrapping fetch', async () => {
    const calls: string[] = [];
    const kernel = new Kernel({
      apiKey: 'k',
      baseURL: 'https://api.example/',
      browserRouting: {
        enabled: true,
        directToVMSubresources: ['process'],
      },
      fetch: async (input) => {
        const url = normalizeURL(input);
        calls.push(url);
        if (url === 'https://api.example/browsers') {
          return Response.json({
            session_id: 'sess-1',
            base_url: 'http://browser-session.test/browser/kernel',
            cdp_ws_url: 'wss://browser-session.test/browser/cdp?jwt=token-abc',
          });
        }
        return Response.json({ exit_code: 0, stdout_b64: '', stderr_b64: '' });
      },
    });
    await kernel.browsers.create();

    const child = kernel.withOptions({ timeout: 1234 });
    await child.browsers.process.exec('sess-1', { command: 'echo' });

    expect(child.browserRouteCache).toBe(kernel.browserRouteCache);
    expect(calls).toEqual([
      'https://api.example/browsers',
      'http://browser-session.test/browser/kernel/process/exec?jwt=token-abc',
    ]);
  });

  test('browser.fetch uses the shared cache and fails clearly on cache miss', async () => {
    const calls: string[] = [];
    const kernel = new Kernel({
      apiKey: 'k',
      baseURL: 'https://api.example/',
      fetch: async (input) => {
        const url = normalizeURL(input);
        calls.push(url);
        return new Response('ok', { status: 200, headers: { 'content-type': 'text/plain' } });
      },
    });

    kernel.browserRouteCache.prime({
      session_id: 'sess-1',
      base_url: 'http://browser-session.test/browser/kernel',
      cdp_ws_url: 'wss://browser-session.test/browser/cdp?jwt=token-abc',
    });
    await kernel.browsers.fetch('sess-1', 'https://example.com/hello');
    expect(calls[0]).toContain('http://browser-session.test/browser/kernel/curl/raw?');

    kernel.browserRouteCache.delete('sess-1');
    await expect(kernel.browsers.fetch('sess-1', 'https://example.com/again')).rejects.toThrow(/route cache/);
  });
});
