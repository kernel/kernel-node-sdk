import Kernel, { NotFoundError } from '@onkernel/sdk';

describe('browser pool acquire responses', () => {
  test('returns the browser on a 200', async () => {
    const client = new Kernel({
      apiKey: 'test',
      fetch: async () => Response.json({ session_id: 'session-1' }),
    });

    const result = await client.browserPools.acquire('pool', {});

    expect(result?.session_id).toBe('session-1');
  });

  test('returns null on a 204 without retrying', async () => {
    const fetch = jest.fn(async () => new Response(null, { status: 204 }));
    const client = new Kernel({ apiKey: 'test', fetch });

    const result = await client.browserPools.acquire('pool', {});

    expect(result).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('preserves the typed 404 error', async () => {
    const client = new Kernel({
      apiKey: 'test',
      fetch: async () => Response.json({ code: 'not_found' }, { status: 404 }),
    });

    await expect(client.browserPools.acquire('missing', {})).rejects.toBeInstanceOf(NotFoundError);
  });
});
