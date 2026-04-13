import Kernel from '@onkernel/sdk';
import { KernelBrowserSession } from '../../src/lib/kernel-browser-session';

describe('KernelBrowserSession.fetch', () => {
  test('throws when base_url is missing', async () => {
    const kernel = new Kernel({ apiKey: 'k', baseURL: 'https://api.example/' });
    const browser = new KernelBrowserSession(kernel, {
      session_id: 'abc',
      cdp_ws_url: 'wss://x/browser/cdp?jwt=j',
    });
    await expect(browser.fetch('https://example.com')).rejects.toThrow(/base_url/);
  });

  test('throws when jwt cannot be resolved', async () => {
    const kernel = new Kernel({ apiKey: 'k', baseURL: 'https://api.example/' });
    const browser = new KernelBrowserSession(kernel, {
      session_id: 'abc',
      base_url: 'https://metro/browser/kernel',
      cdp_ws_url: 'wss://x/browser/cdp',
    });
    await expect(browser.fetch('https://example.com')).rejects.toThrow(/jwt/);
  });

  test('issues /curl/raw against metro base with jwt query', async () => {
    const fetchCalls: Array<{ url: string; init: RequestInit | undefined }> = [];
    const kernel = new Kernel({ apiKey: 'k', baseURL: 'https://api.example/' });
    (kernel as any).fetch = async (url: string, init?: RequestInit) => {
      fetchCalls.push({ url, init });
      return new Response('ok', {
        status: 200,
        headers: { 'content-type': 'text/plain' },
      });
    };

    const browser = new KernelBrowserSession(kernel, {
      session_id: 'abc',
      base_url: 'https://metro/browser/kernel',
      cdp_ws_url: 'wss://x/browser/cdp?jwt=tok',
    });

    const res = await browser.fetch('https://example.com/hello', {
      method: 'GET',
      headers: { 'X-Test': '1' },
    });
    expect(res.status).toBe(200);
    expect(fetchCalls.length).toBe(1);
    const call = fetchCalls[0]!;
    expect(call.url).toContain('https://metro/browser/kernel/curl/raw?');
    expect(call.url).toContain('url=https%3A%2F%2Fexample.com%2Fhello');
    expect(call.url).toContain('jwt=tok');
    expect((call.init?.headers as Headers).get('authorization')).toBeNull();
  });

  test('rewrites browser subresource paths through metro base', async () => {
    const fetchCalls: Array<{ url: string; init: RequestInit | undefined }> = [];
    const kernel = new Kernel({ apiKey: 'k', baseURL: 'https://api.example/' });
    (kernel as any).fetch = async (url: string, init?: RequestInit) => {
      fetchCalls.push({ url, init });
      return new Response('', {
        status: 200,
        headers: { 'content-type': '*/*' },
      });
    };

    const browser = new KernelBrowserSession(kernel, {
      session_id: 'abc',
      base_url: 'https://metro/browser/kernel',
      cdp_ws_url: 'wss://x/browser/cdp?jwt=tok',
    });

    await browser.computer.clickMouse({ x: 1, y: 2 });

    expect(fetchCalls.length).toBe(1);
    const call = fetchCalls[0]!;
    expect(call.url).toContain('https://metro/browser/kernel/computer/click_mouse?');
    expect(call.url).toContain('jwt=tok');
    expect(call.url).not.toContain('/browsers/abc/');
    expect((call.init?.headers as Headers).get('authorization')).toBeNull();
  });
});
