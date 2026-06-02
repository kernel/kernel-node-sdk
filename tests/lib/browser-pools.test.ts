import Kernel, { NotFoundError } from '@onkernel/sdk';

import { acquire, type AcquireOutcome } from '../../src/lib/browser-pools';

const baseBrowser = {
  session_id: 'sess-1',
  base_url: 'http://browser-session.test/browser/kernel',
  cdp_ws_url: 'wss://browser-session.test/browser/cdp?jwt=t',
  webdriver_ws_url: 'wss://x',
  created_at: '2020-01-01T00:00:00Z',
  headless: true,
  stealth: false,
  timeout_seconds: 60,
};

const clientWith = (fetcher: typeof fetch) =>
  new Kernel({ apiKey: 'k', baseURL: 'https://api.example/', fetch: fetcher });

describe('browser pool typed acquire', () => {
  test('resolves to acquired on 200', async () => {
    const client = clientWith(async () => Response.json(baseBrowser));
    const result: AcquireOutcome = await acquire(client, 'my-pool');
    expect(result.status).toBe('acquired');
    if (result.status === 'acquired') {
      expect(result.browser.session_id).toBe('sess-1');
    }
  });

  test('resolves to timed_out on 204', async () => {
    const client = clientWith(async () => new Response(null, { status: 204 }));
    const result = await acquire(client, 'my-pool');
    expect(result.status).toBe('timed_out');
  });

  test('rejects with NotFoundError on 404', async () => {
    const client = clientWith(async () =>
      Response.json({ code: 'not_found', message: 'pool not found' }, { status: 404 }),
    );
    await expect(acquire(client, 'missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});
