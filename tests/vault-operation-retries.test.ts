import Kernel from '@onkernel/sdk';

describe('vault operation retries', () => {
  test.each(['connection', 409, 429, 500])('does not retry fill after %s', async (failure) => {
    const fetch = jest.fn(async () => {
      if (typeof failure === 'string') throw new TypeError('connection lost');
      return new Response('{}', { status: failure });
    });
    const client = new Kernel({ apiKey: 'test', maxRetries: 1, fetch });
    await expect(
      client.vaults.items.performOperation('login', {
        id_or_name: 'vault',
        type: 'fill',
        browser_id: 'browser',
        fields: [{ field: 'password', selector: '#password' }],
      }),
    ).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('retains client retries for reads', async () => {
    const fetch = jest.fn(async () => {
      throw new TypeError('connection lost');
    });
    const client = new Kernel({ apiKey: 'test', maxRetries: 1, fetch });
    await expect(client.vaults.items.retrieve('login', { id_or_name: 'vault' })).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
