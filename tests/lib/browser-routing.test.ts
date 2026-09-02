import Kernel, { toFile } from '@onkernel/sdk';

import {
  BrowserRouteCache,
  browserRoutingSubresourcesFromEnv,
  createRoutingFetch,
  matchesDirectVMPrefix,
} from '../../src/lib/browser-routing';

describe('browser routing', () => {
  const browserRoutingEnv = 'KERNEL_BROWSER_ROUTING_SUBRESOURCES';
  // The SDK probes FormData support with a `data:,` fetch before sending multipart bodies.
  const formDataProbeURL = 'data:,';

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

  test('preserves signal identity from RequestInit and Request inputs', async () => {
    const controller = new AbortController();
    const cache = new BrowserRouteCache();
    cache.set({
      sessionId: 'sess-1',
      baseURL: 'http://browser-session.test/browser/kernel',
      jwt: 'token-abc',
    });

    let routedSignal: AbortSignal | null | undefined;
    const wrappedFetch = createRoutingFetch(
      async (_input, init) => {
        routedSignal = init?.signal;
        return new Response(null, { status: 204 });
      },
      {
        apiBaseURL: 'https://api.example/',
        subresources: ['telemetry/stream'],
        cache,
      },
    );

    await wrappedFetch('https://api.example/browsers/sess-1/telemetry/stream', {
      signal: controller.signal,
    });

    expect(routedSignal === controller.signal).toBe(true);

    const request = new Request('https://api.example/browsers/sess-1/telemetry/stream', {
      signal: controller.signal,
    });
    await wrappedFetch(request);

    expect(routedSignal === request.signal).toBe(true);
  });

  test('keeps stream.controller.abort connected to routed telemetry requests', async () => {
    let routedSignal: AbortSignal | null | undefined;
    const kernel = new Kernel({
      apiKey: 'k',
      baseURL: 'https://api.example/',
      fetch: async (_input, init) => {
        routedSignal = init?.signal;
        return new Response('id: 1\ndata: {"seq":1}\n\n', {
          status: 200,
          headers: { 'content-type': 'text/event-stream' },
        });
      },
    });
    kernel.browserRouteCache.set({
      sessionId: 'sess-1',
      baseURL: 'http://browser-session.test/browser/kernel',
      jwt: 'token-abc',
    });

    const stream = await kernel.browsers.telemetry.stream('sess-1');

    expect(routedSignal).toBe(stream.controller.signal);
    stream.controller.abort();
    expect(routedSignal?.aborted).toBe(true);
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

  test('defaults browser routing subresources when env is unset', async () => {
    await withBrowserRoutingEnv(undefined, async () => {
      expect(browserRoutingSubresourcesFromEnv()).toEqual([
        'curl',
        'telemetry/stream',
        'computer',
        'playwright',
        'process',
        'fs',
        'logs/stream',
      ]);
    });
  });

  test('allowlist matching is segment-boundary aware (telemetry/events stays on the control plane)', () => {
    const prefixes = ['curl', 'telemetry/stream', 'computer', 'playwright', 'process', 'fs', 'logs/stream'];
    expect(matchesDirectVMPrefix('telemetry/stream', prefixes)).toBe(true);
    expect(matchesDirectVMPrefix('telemetry/stream/x', prefixes)).toBe(true);
    expect(matchesDirectVMPrefix('telemetry/events', prefixes)).toBe(false);
    expect(matchesDirectVMPrefix('telemetry/streaming-config', prefixes)).toBe(false);
    expect(matchesDirectVMPrefix('telemetry', prefixes)).toBe(false);
    expect(matchesDirectVMPrefix('curl/raw', prefixes)).toBe(true);
    expect(matchesDirectVMPrefix('computer/screenshot', prefixes)).toBe(true);
    expect(matchesDirectVMPrefix('playwright/execute', prefixes)).toBe(true);
    expect(matchesDirectVMPrefix('process/exec', prefixes)).toBe(true);
    expect(matchesDirectVMPrefix('process/proc-1/stdout/stream', prefixes)).toBe(true);
    expect(matchesDirectVMPrefix('fs/read_file', prefixes)).toBe(true);
    expect(matchesDirectVMPrefix('fs/watch/watch-1/events', prefixes)).toBe(true);
    expect(matchesDirectVMPrefix('fsx/read_file', prefixes)).toBe(false);
    expect(matchesDirectVMPrefix('logs/stream', prefixes)).toBe(true);
    expect(matchesDirectVMPrefix('logs/stream/x', prefixes)).toBe(true);
    expect(matchesDirectVMPrefix('logs', prefixes)).toBe(false);
    expect(matchesDirectVMPrefix('logs/history', prefixes)).toBe(false);
    expect(matchesDirectVMPrefix('logstream', prefixes)).toBe(false);
    expect(matchesDirectVMPrefix('extensions', prefixes)).toBe(false);
    expect(matchesDirectVMPrefix('replays/rec-1', prefixes)).toBe(false);
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

  test('routes default browser subresources to the VM', async () => {
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
          if (url.includes('/computer/screenshot')) {
            return new Response(new Uint8Array([1, 2, 3]), {
              status: 200,
              headers: { 'content-type': 'image/png' },
            });
          }
          if (url.includes('/process/exec')) {
            return Response.json({ exit_code: 0, stdout_b64: '', stderr_b64: '' });
          }
          return Response.json({ success: true });
        },
      });

      await kernel.browsers.create();
      await kernel.browsers.computer.captureScreenshot('sess-1');
      await kernel.browsers.playwright.execute('sess-1', { code: 'return 1' });
      await kernel.browsers.process.exec('sess-1', { command: 'echo' });

      expect(calls[1]?.url).toBe(
        'http://browser-session.test/browser/kernel/computer/screenshot?jwt=token-abc',
      );
      expect(calls[1]?.headers.get('authorization')).toBeNull();
      expect(calls[2]?.url).toBe(
        'http://browser-session.test/browser/kernel/playwright/execute?jwt=token-abc',
      );
      expect(calls[2]?.headers.get('authorization')).toBeNull();
      expect(calls[3]?.url).toBe('http://browser-session.test/browser/kernel/process/exec?jwt=token-abc');
      expect(calls[3]?.headers.get('authorization')).toBeNull();
    });
  });

  test('keeps control-plane subresources on the API origin by default', async () => {
    await withBrowserRoutingEnv(undefined, async () => {
      const calls: Array<{ url: string; headers: Headers }> = [];
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
        fetch: async (input, init?: RequestInit) => {
          const url = normalizeURL(input);
          if (url === formDataProbeURL) {
            return new Response(null, { status: 204 });
          }
          const headers = input instanceof Request ? new Headers(input.headers) : new Headers(init?.headers);
          calls.push({ url, headers });
          if (url === 'https://api.example/browsers') {
            return Response.json({
              session_id: 'sess-1',
              base_url: 'http://browser-session.test/browser/kernel',
              cdp_ws_url: 'wss://browser-session.test/browser/cdp?jwt=token-abc',
            });
          }
          if (url.includes('/extensions')) {
            return new Response(null, { status: 204 });
          }
          return Response.json([]);
        },
      });

      await kernel.browsers.create();
      await kernel.browsers.telemetry.events('sess-1');
      await kernel.browsers.replays.list('sess-1');
      await kernel.browsers.loadExtensions('sess-1', {
        extensions: [{ name: 'ext', zip_file: await toFile(new Uint8Array([1]), 'ext.zip') }],
      });

      expect(calls.slice(1).map((call) => call.url)).toEqual([
        'https://api.example/browsers/sess-1/telemetry/events',
        'https://api.example/browsers/sess-1/replays',
        'https://api.example/browsers/sess-1/extensions',
      ]);
      expect(calls[3]?.headers.get('authorization')).toBe('Bearer k');
    });
  });

  test('falls back to the control plane on a stale direct-VM JWT', async () => {
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
          if (url.includes('browser-session.test')) {
            return new Response('Invalid JWT', { status: 401, headers: { 'content-type': 'text/plain' } });
          }
          return new Response(new Uint8Array([1, 2, 3]), {
            status: 200,
            headers: { 'content-type': 'image/png' },
          });
        },
      });

      await kernel.browsers.create();
      await kernel.browsers.computer.captureScreenshot('sess-1');

      expect(calls[1]?.url).toBe(
        'http://browser-session.test/browser/kernel/computer/screenshot?jwt=token-abc',
      );
      expect(calls[2]?.url).toBe('https://api.example/browsers/sess-1/computer/screenshot');
      expect(calls[2]?.headers.get('authorization')).toBe('Bearer k');
      expect(kernel.browserRouteCache.get('sess-1')).toBeUndefined();
    });
  });

  test('does not evict a refreshed route after a stale JWT 401', async () => {
    await withBrowserRoutingEnv(undefined, async () => {
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
        fetch: async (input) => {
          const url = normalizeURL(input);
          if (url === 'https://api.example/browsers') {
            return Response.json({
              session_id: 'sess-1',
              base_url: 'http://browser-session.test/browser/kernel',
              cdp_ws_url: 'wss://browser-session.test/browser/cdp?jwt=token-abc',
            });
          }
          if (url.includes('browser-session.test')) {
            kernel.browserRouteCache.set({
              sessionId: 'sess-1',
              baseURL: 'http://browser-session.test/browser/kernel',
              jwt: 'jwt-FRESH',
            });
            return new Response('Invalid JWT', { status: 401, headers: { 'content-type': 'text/plain' } });
          }
          return new Response(new Uint8Array([1, 2, 3]), {
            status: 200,
            headers: { 'content-type': 'image/png' },
          });
        },
      });

      await kernel.browsers.create();
      await kernel.browsers.computer.captureScreenshot('sess-1');
      expect(kernel.browserRouteCache.get('sess-1')).toMatchObject({ jwt: 'jwt-FRESH' });
    });
  });

  test('routes fs endpoints to the VM by default and preserves the query', async () => {
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
          if (url.includes('/fs/read_file')) {
            return new Response(new Uint8Array([0, 1, 2]), {
              status: 200,
              headers: { 'content-type': 'application/octet-stream' },
            });
          }
          return Response.json([]);
        },
      });

      await kernel.browsers.create();
      const listed = await kernel.browsers.fs.listFiles('sess-1', { path: '/tmp' });
      const read = await kernel.browsers.fs.readFile('sess-1', { path: '/tmp/x' });

      expect(listed).toEqual([]);
      expect(new Uint8Array(await read.arrayBuffer())).toEqual(new Uint8Array([0, 1, 2]));
      expect(calls[1]?.url).toBe(
        'http://browser-session.test/browser/kernel/fs/list_files?path=%2Ftmp&jwt=token-abc',
      );
      expect(calls[1]?.headers.get('authorization')).toBeNull();
      expect(calls[2]?.url).toBe(
        'http://browser-session.test/browser/kernel/fs/read_file?path=%2Ftmp%2Fx&jwt=token-abc',
      );
      expect(calls[2]?.headers.get('authorization')).toBeNull();
    });
  });

  test('routes fs.writeFile binary bodies to the VM', async () => {
    await withBrowserRoutingEnv(undefined, async () => {
      const calls: Array<{ url: string; headers: Headers; body: Uint8Array }> = [];
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
        fetch: async (input, init?: RequestInit) => {
          const request = new Request(input as any, init);
          calls.push({
            url: request.url,
            headers: new Headers(request.headers),
            body: new Uint8Array(await request.arrayBuffer()),
          });
          return new Response(null, { status: 204 });
        },
      });
      kernel.browserRouteCache.set({
        sessionId: 'sess-1',
        baseURL: 'http://browser-session.test/browser/kernel',
        jwt: 'token-abc',
      });

      await kernel.browsers.fs.writeFile('sess-1', new Uint8Array([7, 8, 9]), {
        path: '/tmp/x',
        mode: '600',
      });

      expect(calls[0]?.url).toBe(
        'http://browser-session.test/browser/kernel/fs/write_file?path=%2Ftmp%2Fx&mode=600&jwt=token-abc',
      );
      expect(calls[0]?.headers.get('authorization')).toBeNull();
      expect(calls[0]?.headers.get('content-type')).toBe('application/octet-stream');
      expect(calls[0]?.body).toEqual(new Uint8Array([7, 8, 9]));
    });
  });

  test('routes fs.upload multipart bodies to the VM with indexed field names', async () => {
    await withBrowserRoutingEnv(undefined, async () => {
      const calls: Array<{ url: string; headers: Headers; body: string }> = [];
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
        fetch: async (input, init?: RequestInit) => {
          const request = new Request(input as any, init);
          if (request.url === formDataProbeURL) {
            return new Response(null, { status: 204 });
          }
          calls.push({
            url: request.url,
            headers: new Headers(request.headers),
            body: await request.text(),
          });
          return new Response(null, { status: 204 });
        },
      });
      kernel.browserRouteCache.set({
        sessionId: 'sess-1',
        baseURL: 'http://browser-session.test/browser/kernel',
        jwt: 'token-abc',
      });

      await kernel.browsers.fs.upload('sess-1', {
        files: [
          { dest_path: '/tmp/one', file: await toFile(Buffer.from('one'), 'one.txt') },
          { dest_path: '/tmp/two', file: await toFile(Buffer.from('two'), 'two.txt') },
        ],
      });

      expect(calls[0]?.url).toBe('http://browser-session.test/browser/kernel/fs/upload?jwt=token-abc');
      expect(calls[0]?.headers.get('authorization')).toBeNull();
      expect(calls[0]?.body).toContain('name="files[0][dest_path]"');
      expect(calls[0]?.body).toContain('name="files[0][file]"');
      expect(calls[0]?.body).toContain('name="files[1][dest_path]"');
      expect(calls[0]?.body).not.toContain('files[][');
    });
  });

  test('routes fs watch events and logs streams to the VM', async () => {
    await withBrowserRoutingEnv(undefined, async () => {
      const calls: Array<{ url: string; headers: Headers }> = [];
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
        fetch: async (input, init?: RequestInit) => {
          const url = normalizeURL(input);
          const headers = input instanceof Request ? new Headers(input.headers) : new Headers(init?.headers);
          calls.push({ url, headers });
          return new Response(
            'data: {"event":"log","message":"hello","timestamp":"2020-01-01T00:00:00Z"}\n\n',
            {
              status: 200,
              headers: { 'content-type': 'text/event-stream' },
            },
          );
        },
      });
      kernel.browserRouteCache.set({
        sessionId: 'sess-1',
        baseURL: 'http://browser-session.test/browser/kernel',
        jwt: 'token-abc',
      });

      const watchEvents = await kernel.browsers.fs.watch.events('watch-1', { id_or_name: 'sess-1' });
      watchEvents.controller.abort();
      const logs = await kernel.browsers.logs.stream('sess-1', {
        source: 'path',
        path: '/var/log/x',
        follow: true,
      });
      logs.controller.abort();

      expect(calls[0]?.url).toBe(
        'http://browser-session.test/browser/kernel/fs/watch/watch-1/events?jwt=token-abc',
      );
      expect(calls[0]?.headers.get('authorization')).toBeNull();
      expect(calls[1]?.url).toBe(
        'http://browser-session.test/browser/kernel/logs/stream?source=path&path=%2Fvar%2Flog%2Fx&follow=true&jwt=token-abc',
      );
      expect(calls[1]?.headers.get('authorization')).toBeNull();
    });
  });

  test('keeps logs stream aborts connected to the routed request', async () => {
    await withBrowserRoutingEnv(undefined, async () => {
      let routedSignal: AbortSignal | null | undefined;
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
        fetch: async (_input, init) => {
          routedSignal = init?.signal;
          return new Response(
            'data: {"event":"log","message":"hello","timestamp":"2020-01-01T00:00:00Z"}\n\n',
            {
              status: 200,
              headers: { 'content-type': 'text/event-stream' },
            },
          );
        },
      });
      kernel.browserRouteCache.set({
        sessionId: 'sess-1',
        baseURL: 'http://browser-session.test/browser/kernel',
        jwt: 'token-abc',
      });

      const stream = await kernel.browsers.logs.stream('sess-1', { source: 'supervisor' });

      expect(routedSignal).toBe(stream.controller.signal);
      stream.controller.abort();
      expect(routedSignal?.aborted).toBe(true);
    });
  });

  test('replays the fs.writeFile body on the control plane after a stale JWT', async () => {
    await withBrowserRoutingEnv(undefined, async () => {
      const calls: Array<{ url: string; headers: Headers; body: Uint8Array }> = [];
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
        fetch: async (input, init?: RequestInit) => {
          const request = new Request(input as any, init);
          const body = new Uint8Array(await request.arrayBuffer());
          calls.push({ url: request.url, headers: new Headers(request.headers), body });
          if (request.url.includes('browser-session.test')) {
            return new Response('Invalid JWT', { status: 401, headers: { 'content-type': 'text/plain' } });
          }
          return new Response(null, { status: 204 });
        },
      });
      kernel.browserRouteCache.set({
        sessionId: 'sess-1',
        baseURL: 'http://browser-session.test/browser/kernel',
        jwt: 'token-abc',
      });

      await kernel.browsers.fs.writeFile('sess-1', new Uint8Array([7, 8, 9]), { path: '/tmp/x' });

      expect(calls).toHaveLength(2);
      expect(calls[0]?.url).toBe(
        'http://browser-session.test/browser/kernel/fs/write_file?path=%2Ftmp%2Fx&jwt=token-abc',
      );
      expect(calls[1]?.url).toBe('https://api.example/browsers/sess-1/fs/write_file?path=%2Ftmp%2Fx');
      expect(calls[1]?.headers.get('authorization')).toBe('Bearer k');
      expect(calls[1]?.body).toEqual(calls[0]?.body);
      expect(kernel.browserRouteCache.get('sess-1')).toBeUndefined();
    });
  });

  test('replays the fs.upload multipart body on the control plane after a stale JWT', async () => {
    await withBrowserRoutingEnv(undefined, async () => {
      const calls: Array<{ url: string; body: string }> = [];
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
        fetch: async (input, init?: RequestInit) => {
          const request = new Request(input as any, init);
          if (request.url === formDataProbeURL) {
            return new Response(null, { status: 204 });
          }
          const body = await request.text();
          calls.push({ url: request.url, body });
          if (request.url.includes('browser-session.test')) {
            return new Response('Invalid JWT', { status: 403, headers: { 'content-type': 'text/plain' } });
          }
          return new Response(null, { status: 204 });
        },
      });
      kernel.browserRouteCache.set({
        sessionId: 'sess-1',
        baseURL: 'http://browser-session.test/browser/kernel',
        jwt: 'token-abc',
      });

      await kernel.browsers.fs.upload('sess-1', {
        files: [{ dest_path: '/tmp/one', file: await toFile(Buffer.from('one'), 'one.txt') }],
      });

      expect(calls).toHaveLength(2);
      expect(calls[1]?.url).toBe('https://api.example/browsers/sess-1/fs/upload');
      expect(calls[1]?.body).toContain('name="files[0][dest_path]"');
      expect(calls[1]?.body).toContain('one');
      expect(kernel.browserRouteCache.get('sess-1')).toBeUndefined();
    });
  });

  test('env override keeps fs and logs on the control plane', async () => {
    await withBrowserRoutingEnv('computer', async () => {
      const calls: string[] = [];
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
        fetch: async (input) => {
          const url = normalizeURL(input);
          calls.push(url);
          if (url.includes('/logs/stream')) {
            return new Response(
              'data: {"event":"log","message":"hi","timestamp":"2020-01-01T00:00:00Z"}\n\n',
              {
                status: 200,
                headers: { 'content-type': 'text/event-stream' },
              },
            );
          }
          return Response.json([]);
        },
      });
      kernel.browserRouteCache.set({
        sessionId: 'sess-1',
        baseURL: 'http://browser-session.test/browser/kernel',
        jwt: 'token-abc',
      });

      await kernel.browsers.fs.listFiles('sess-1', { path: '/tmp' });
      const logs = await kernel.browsers.logs.stream('sess-1', { source: 'path', path: '/var/log/x' });
      logs.controller.abort();

      expect(calls).toEqual([
        'https://api.example/browsers/sess-1/fs/list_files?path=%2Ftmp',
        'https://api.example/browsers/sess-1/logs/stream?source=path&path=%2Fvar%2Flog%2Fx',
      ]);
    });
  });

  test('empty env disables fs routing', async () => {
    await withBrowserRoutingEnv('', async () => {
      const calls: Array<{ url: string; headers: Headers }> = [];
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
        fetch: async (input, init?: RequestInit) => {
          const url = normalizeURL(input);
          const headers = input instanceof Request ? new Headers(input.headers) : new Headers(init?.headers);
          calls.push({ url, headers });
          return Response.json([]);
        },
      });
      kernel.browserRouteCache.set({
        sessionId: 'sess-1',
        baseURL: 'http://browser-session.test/browser/kernel',
        jwt: 'token-abc',
      });

      await kernel.browsers.fs.listFiles('sess-1', { path: '/tmp' });

      expect(calls[0]?.url).toBe('https://api.example/browsers/sess-1/fs/list_files?path=%2Ftmp');
      expect(calls[0]?.headers.get('authorization')).toBe('Bearer k');
    });
  });

  test('lets the routed fetch derive the multipart content-type so the boundary matches the body', async () => {
    await withBrowserRoutingEnv(undefined, async () => {
      const parsed: Array<{ url: string; dest: unknown; file: string }> = [];
      const kernel = new Kernel({
        apiKey: 'k',
        baseURL: 'https://api.example/',
        fetch: async (input, init?: RequestInit) => {
          const request = new Request(input as any, init);
          if (request.url === formDataProbeURL) {
            return new Response(null, { status: 204 });
          }
          // Throws or yields empty fields when the content-type boundary does not
          // match the encoded body.
          const form = await request.formData();
          parsed.push({
            url: request.url,
            dest: form.get('files[0][dest_path]'),
            file: await (form.get('files[0][file]') as File).text(),
          });
          return new Response(null, { status: 204 });
        },
      });
      kernel.browserRouteCache.set({
        sessionId: 'sess-1',
        baseURL: 'http://browser-session.test/browser/kernel',
        jwt: 'token-abc',
      });

      await kernel.browsers.fs.upload('sess-1', {
        files: [{ dest_path: '/tmp/one', file: await toFile(Buffer.from('one'), 'one.txt') }],
      });

      expect(parsed).toEqual([
        {
          url: 'http://browser-session.test/browser/kernel/fs/upload?jwt=token-abc',
          dest: '/tmp/one',
          file: 'one',
        },
      ]);
    });
  });

  test('routes only logs/stream, not the logs subresource', async () => {
    await withBrowserRoutingEnv(undefined, async () => {
      const cache = new BrowserRouteCache();
      cache.set({
        sessionId: 'sess-1',
        baseURL: 'http://browser-session.test/browser/kernel',
        jwt: 'token-abc',
      });

      const routed: string[] = [];
      const wrappedFetch = createRoutingFetch(
        async (input) => {
          routed.push(normalizeURL(input));
          return new Response(null, { status: 204 });
        },
        {
          apiBaseURL: 'https://api.example/',
          subresources: browserRoutingSubresourcesFromEnv(),
          cache,
        },
      );

      for (const path of ['logs/stream', 'logs', 'logs/history', 'logstream']) {
        await wrappedFetch(`https://api.example/browsers/sess-1/${path}`);
      }

      expect(routed).toEqual([
        'http://browser-session.test/browser/kernel/logs/stream?jwt=token-abc',
        'https://api.example/browsers/sess-1/logs',
        'https://api.example/browsers/sess-1/logs/history',
        'https://api.example/browsers/sess-1/logstream',
      ]);
    });
  });
});
