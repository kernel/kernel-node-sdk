import Kernel from '@onkernel/sdk';

import {
  BrowserRouteCache,
  browserRoutingSubresourcesFromEnv,
  createRoutingFetch,
} from '../../src/lib/browser-routing';

describe('browser routing', () => {
  const browserRoutingEnv = 'KERNEL_BROWSER_ROUTING_SUBRESOURCES';

  const withBrowserRoutingEnv = async (value: string | undefined, fn: () => Promise<void>) => {
    const previous = process.env[browserRoutingEnv];
    if (value === undefined) {
      delete process.env[browserRoutingEnv];
    } else {
      process.env[browserRoutingEnv] = value;
    }
    try {
      await fn();
    } finally {
      if (previous === undefined) {
        delete process.env[browserRoutingEnv];
      } else {
        process.env[browserRoutingEnv] = previous;
      }
    }
  };

  const normalizeURL = (input: string | URL | Request) => {
    if (typeof input === 'string') {
      return input;
    }
    if (input instanceof URL) {
      return input.toString();
    }
    return input.url;
  };

  test('warms cache from browser responses and routes allowlisted subresources directly to the VM', async () => {
    await withBrowserRoutingEnv('process,curl', async () => {
      const calls: Array<{ url: string; headers: Headers }> = [];
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
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
  });

  test('does not route non-allowlisted subresources directly to the VM', async () => {
    await withBrowserRoutingEnv('computer', async () => {
      const calls: string[] = [];
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
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
  });

  test('withOptions reuses the same browser route cache without double-wrapping fetch', async () => {
    await withBrowserRoutingEnv('process', async () => {
      const calls: string[] = [];
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
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
  });

  test('skips cache sniffing for non-browser JSON responses', async () => {
    let cloneCalled = false;
    const wrappedFetch = createRoutingFetch(
      async () => {
        const response = Response.json({ ok: true });
        const clone = response.clone.bind(response);
        Object.defineProperty(response, 'clone', {
          value: () => {
            cloneCalled = true;
            return clone();
          },
        });
        return response;
      },
      {
        apiBaseURL: 'https://api.example/',
        subresources: ['process'],
        cache: new BrowserRouteCache(),
      },
    );

    await wrappedFetch('https://api.example/deployments');

    expect(cloneCalled).toBe(false);
  });

  test('preserves custom fetch options for both API and routed VM requests', async () => {
    await withBrowserRoutingEnv('process', async () => {
      const dispatcher = Symbol('dispatcher');
      const calls: Array<{ url: string; init: RequestInit | undefined }> = [];
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
        fetchOptions: { dispatcher } as any,
        fetch: async (input, init?: RequestInit) => {
          const url = normalizeURL(input);
          calls.push({ url, init });
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

      expect((calls[0]?.init as any)?.dispatcher).toBe(dispatcher);
      expect((calls[1]?.init as any)?.dispatcher).toBe(dispatcher);
    });
  });

  test('ignores browser responses that do not include a usable jwt', async () => {
    await withBrowserRoutingEnv('process', async () => {
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
        fetch: async (input) => {
          const url = normalizeURL(input);
          if (url === 'https://api.example/browsers') {
            return Response.json({
              session_id: 'sess-1',
              base_url: 'http://browser-session.test/browser/kernel',
            });
          }
          return Response.json({ exit_code: 0, stdout_b64: '', stderr_b64: '' });
        },
      });

      await kernel.browsers.create();
      expect(kernel.browserRouteCache.get('sess-1')).toBeUndefined();
    });
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

    kernel.browserRouteCache.set({
      sessionId: 'sess-1',
      baseURL: 'http://browser-session.test/browser/kernel',
      jwt: 'token-abc',
    });
    await kernel.browsers.fetch('sess-1', 'https://example.com/hello');
    expect(calls[0]).toContain('http://browser-session.test/browser/kernel/curl/raw?');

    kernel.browserRouteCache.delete('sess-1');
    await expect(kernel.browsers.fetch('sess-1', 'https://example.com/again')).rejects.toThrow(/route cache/);
  });

  test('warms cache from browser pool acquire responses', async () => {
    await withBrowserRoutingEnv('process', async () => {
      const calls: string[] = [];
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
        fetch: async (input) => {
          const url = normalizeURL(input);
          calls.push(url);
          if (url === 'https://api.example/browser_pools/pool-1/acquire') {
            return Response.json({
              session_id: 'sess-1',
              base_url: 'http://browser-session.test/browser/kernel',
              cdp_ws_url: 'wss://browser-session.test/browser/cdp?jwt=token-abc',
            });
          }
          return Response.json({ exit_code: 0, stdout_b64: '', stderr_b64: '' });
        },
      });

      await kernel.browserPools.acquire('pool-1', {});
      await kernel.browsers.process.exec('sess-1', { command: 'echo' });

      expect(kernel.browserRouteCache.get('sess-1')).toMatchObject({
        sessionId: 'sess-1',
        baseURL: 'http://browser-session.test/browser/kernel',
        jwt: 'token-abc',
      });
      expect(calls).toEqual([
        'https://api.example/browser_pools/pool-1/acquire',
        'http://browser-session.test/browser/kernel/process/exec?jwt=token-abc',
      ]);
    });
  });

  test('evicts cached route after successful browser delete by id', async () => {
    const calls: string[] = [];
    const kernel = new Kernel({
      apiKey: 'k',
      baseURL: 'https://api.example/',
      fetch: async (input) => {
        const url = normalizeURL(input);
        calls.push(url);
        return new Response(null, { status: 204 });
      },
    });

    kernel.browserRouteCache.set({
      sessionId: 'sess-1',
      baseURL: 'http://browser-session.test/browser/kernel',
      jwt: 'token-abc',
    });

    await kernel.browsers.deleteByID('sess-1');

    expect(calls).toEqual(['https://api.example/browsers/sess-1']);
    expect(kernel.browserRouteCache.get('sess-1')).toBeUndefined();
  });

  test('evicts cached route after successful browser pool release', async () => {
    const calls: string[] = [];
    const kernel = new Kernel({
      apiKey: 'k',
      baseURL: 'https://api.example/',
      fetch: async (input) => {
        const url = normalizeURL(input);
        calls.push(url);
        return new Response(null, { status: 204 });
      },
    });

    kernel.browserRouteCache.set({
      sessionId: 'sess-1',
      baseURL: 'http://browser-session.test/browser/kernel',
      jwt: 'token-abc',
    });

    await kernel.browserPools.release('pool-1', { session_id: 'sess-1' });

    expect(calls).toEqual(['https://api.example/browser_pools/pool-1/release']);
    expect(kernel.browserRouteCache.get('sess-1')).toBeUndefined();
  });

  test('keeps cached route when browser delete by id fails', async () => {
    const kernel = new Kernel({
      apiKey: 'k',
      baseURL: 'https://api.example/',
      maxRetries: 0,
      fetch: async () => new Response('boom', { status: 500, headers: { 'content-type': 'text/plain' } }),
    });

    kernel.browserRouteCache.set({
      sessionId: 'sess-1',
      baseURL: 'http://browser-session.test/browser/kernel',
      jwt: 'token-abc',
    });

    await expect(kernel.browsers.deleteByID('sess-1')).rejects.toThrow();
    expect(kernel.browserRouteCache.get('sess-1')).toMatchObject({
      sessionId: 'sess-1',
      baseURL: 'http://browser-session.test/browser/kernel',
      jwt: 'token-abc',
    });
  });

  test('keeps cached route when browser pool release fails', async () => {
    const kernel = new Kernel({
      apiKey: 'k',
      baseURL: 'https://api.example/',
      maxRetries: 0,
      fetch: async () => new Response('boom', { status: 500, headers: { 'content-type': 'text/plain' } }),
    });

    kernel.browserRouteCache.set({
      sessionId: 'sess-1',
      baseURL: 'http://browser-session.test/browser/kernel',
      jwt: 'token-abc',
    });

    await expect(kernel.browserPools.release('pool-1', { session_id: 'sess-1' })).rejects.toThrow();
    expect(kernel.browserRouteCache.get('sess-1')).toMatchObject({
      sessionId: 'sess-1',
      baseURL: 'http://browser-session.test/browser/kernel',
      jwt: 'token-abc',
    });
  });

  test('browser.fetch rejects methods outside the SDK HTTPMethod union', async () => {
    const kernel = new Kernel({
      apiKey: 'k',
      baseURL: 'https://api.example/',
      fetch: async () => new Response(null, { status: 204 }),
    });

    kernel.browserRouteCache.set({
      sessionId: 'sess-1',
      baseURL: 'http://browser-session.test/browser/kernel',
      jwt: 'token-abc',
    });

    await expect(
      kernel.browsers.fetch('sess-1', 'https://example.com/hello', { method: 'HEAD' }),
    ).rejects.toThrow(/unsupported HTTP method/i);
    await expect(
      kernel.browsers.fetch('sess-1', 'https://example.com/hello', { method: 'OPTIONS' }),
    ).rejects.toThrow(/unsupported HTTP method/i);
  });

  test('defaults browser routing subresources to curl and telemetry when env is unset', async () => {
    await withBrowserRoutingEnv(undefined, async () => {
      expect(browserRoutingSubresourcesFromEnv()).toEqual(['curl', 'telemetry']);
    });
  });

  test('routes telemetry stream calls to the VM /telemetry/stream path by default', async () => {
    await withBrowserRoutingEnv(undefined, async () => {
      const calls: Array<{ url: string; headers: Headers }> = [];
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
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
          return new Response('id: 1\ndata: {"seq":1}\n\n', {
            status: 200,
            headers: { 'content-type': 'text/event-stream' },
          });
        },
      });

      await kernel.browsers.create();
      await kernel.browsers.telemetry.stream('sess-1');

      expect(calls[1]?.url).toBe('http://browser-session.test/browser/kernel/telemetry/stream?jwt=token-abc');
      expect(calls[1]?.headers.get('authorization')).toBeNull();
    });
  });

  test('disables browser subresource routing when env is set to empty string', async () => {
    await withBrowserRoutingEnv('', async () => {
      expect(browserRoutingSubresourcesFromEnv()).toEqual([]);
    });
  });
});
