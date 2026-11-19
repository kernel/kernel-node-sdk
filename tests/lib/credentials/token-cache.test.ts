import { TokenCache } from '@onkernel/sdk/lib/credentials';
import type { AccessToken, AccessTokenProvider } from '@onkernel/sdk/lib/credentials';

describe('TokenCache', () => {
  let now = 1_000_000;
  beforeEach(() => {
    now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now * 1000);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  const advance = (seconds: number) => {
    now += seconds;
  };

  /** A provider minting `token-1`, `token-2`, ... that each live for `lifetime` seconds. */
  function counter(lifetime: number | null) {
    let count = 0;
    const provider = jest.fn<Promise<AccessToken>, Parameters<AccessTokenProvider>>(async () => ({
      token: `token-${++count}`,
      expiresAt: lifetime == null ? null : now + lifetime,
    }));
    return provider;
  }

  const flush = () => new Promise((resolve) => setImmediate(resolve));

  test('calls the provider on first use and then serves the cached token', async () => {
    const provider = counter(300);
    const cache = new TokenCache(provider);

    expect(await cache.getToken()).toBe('token-1');
    advance(100);
    expect(await cache.getToken()).toBe('token-1');
    expect(provider).toHaveBeenCalledTimes(1);
  });

  test('caches a token with no expiry forever', async () => {
    const provider = counter(null);
    const cache = new TokenCache(provider);

    await cache.getToken();
    advance(10 * 365 * 24 * 3600);
    expect(await cache.getToken()).toBe('token-1');
    expect(provider).toHaveBeenCalledTimes(1);
  });

  describe('a 300 second token uses the 120s and 30s thresholds', () => {
    test('serves the cached token and refreshes in the background in the advisory window', async () => {
      const provider = counter(300);
      const cache = new TokenCache(provider);
      await cache.getToken();

      advance(179); // 121s left
      expect(await cache.getToken()).toBe('token-1');
      expect(provider).toHaveBeenCalledTimes(1);

      advance(2); // 119s left
      expect(await cache.getToken()).toBe('token-1');
      expect(provider).toHaveBeenCalledTimes(2);
      await flush();
      expect(await cache.getToken()).toBe('token-2');
    });

    test('waits for a refresh in the mandatory window', async () => {
      const provider = counter(300);
      const cache = new TokenCache(provider);
      await cache.getToken();

      advance(271); // 29s left
      expect(await cache.getToken()).toBe('token-2');
    });
  });

  describe('thresholds scale down with a short lifetime', () => {
    test('a 10 second token is not refreshed until 4 seconds remain', async () => {
      const provider = counter(10);
      const cache = new TokenCache(provider);
      await cache.getToken();

      advance(5.9); // 4.1s left: more than 40% of the lifetime
      expect(await cache.getToken()).toBe('token-1');
      expect(provider).toHaveBeenCalledTimes(1);

      advance(0.2); // 3.9s left: advisory
      expect(await cache.getToken()).toBe('token-1');
      expect(provider).toHaveBeenCalledTimes(2);
    });

    test('a 10 second token is refreshed synchronously once 1 second remains', async () => {
      const provider = counter(10);
      const cache = new TokenCache(provider);
      await cache.getToken();

      advance(9.1); // 0.9s left: less than 10% of the lifetime
      expect(await cache.getToken()).toBe('token-2');
    });

    test('a 1 second token is served until it is nearly expired', async () => {
      const provider = counter(1);
      const cache = new TokenCache(provider);
      await cache.getToken();

      advance(0.5);
      expect(await cache.getToken()).toBe('token-1');
      expect(provider).toHaveBeenCalledTimes(1);

      advance(0.45); // 0.05s left: mandatory
      expect(await cache.getToken()).toBe('token-2');
    });

    test('an already expired token is replaced on the next call', async () => {
      const provider = counter(0);
      const cache = new TokenCache(provider);

      expect(await cache.getToken()).toBe('token-1');
      expect(await cache.getToken()).toBe('token-2');
    });
  });

  test('keeps serving the cached token when an advisory refresh fails, and backs off', async () => {
    let fail = false;
    let count = 0;
    const provider = jest.fn(async () => {
      if (fail) throw new Error('token endpoint is down');
      return { token: `token-${++count}`, expiresAt: now + 300 };
    });
    const errors: unknown[] = [];
    const cache = new TokenCache(provider, (err) => errors.push(err));
    await cache.getToken();

    fail = true;
    advance(200); // 100s left: advisory
    expect(await cache.getToken()).toBe('token-1');
    await flush();
    expect(errors).toHaveLength(1);
    expect(provider).toHaveBeenCalledTimes(2);

    advance(4); // inside the 5s backoff
    expect(await cache.getToken()).toBe('token-1');
    await flush();
    expect(provider).toHaveBeenCalledTimes(2);

    advance(2); // the backoff has passed
    expect(await cache.getToken()).toBe('token-1');
    await flush();
    expect(provider).toHaveBeenCalledTimes(3);
  });

  test('throws when a mandatory refresh fails, and tries again on the next call', async () => {
    let fail = false;
    let count = 0;
    const provider = jest.fn(async () => {
      if (fail) throw new Error('token endpoint is down');
      return { token: `token-${++count}`, expiresAt: now + 300 };
    });
    const cache = new TokenCache(provider);
    await cache.getToken();

    fail = true;
    advance(280);
    await expect(cache.getToken()).rejects.toThrow('token endpoint is down');

    fail = false;
    expect(await cache.getToken()).toBe('token-2');
  });

  test('concurrent callers share one provider call', async () => {
    let release!: (token: AccessToken) => void;
    const provider = jest.fn(() => new Promise<AccessToken>((resolve) => (release = resolve)));
    const cache = new TokenCache(provider);

    const callers = Array.from({ length: 20 }, () => cache.getToken());
    await flush();
    expect(provider).toHaveBeenCalledTimes(1);

    release({ token: 'shared', expiresAt: now + 300 });
    expect(new Set(await Promise.all(callers))).toEqual(new Set(['shared']));
    expect(provider).toHaveBeenCalledTimes(1);
  });

  test('concurrent callers in the mandatory window share one refresh', async () => {
    const provider = counter(300);
    const cache = new TokenCache(provider);
    await cache.getToken();

    advance(290);
    const tokens = await Promise.all(Array.from({ length: 10 }, () => cache.getToken()));
    expect(new Set(tokens)).toEqual(new Set(['token-2']));
    expect(provider).toHaveBeenCalledTimes(2);
  });

  test('invalidate makes the next call mint a new token and sets forceRefresh', async () => {
    const provider = counter(300);
    const cache = new TokenCache(provider);
    await cache.getToken();

    cache.invalidate();
    expect(await cache.getToken()).toBe('token-2');
    expect(provider).toHaveBeenLastCalledWith({ forceRefresh: true });

    expect(await cache.getToken()).toBe('token-2');
    expect(provider).toHaveBeenCalledTimes(2);
  });

  test('invalidate with a token that has already been replaced does nothing', async () => {
    const provider = counter(300);
    const cache = new TokenCache(provider);
    await cache.getToken();
    cache.invalidate('token-1');
    expect(await cache.getToken()).toBe('token-2');

    // A second request that failed with token-1 reports it after the refresh.
    cache.invalidate('token-1');
    expect(await cache.getToken()).toBe('token-2');
    expect(provider).toHaveBeenCalledTimes(2);
  });

  test('requests that all fail with the same token trigger one refresh', async () => {
    const provider = counter(300);
    const cache = new TokenCache(provider);
    await cache.getToken();

    const retries = Array.from({ length: 5 }, () => {
      cache.invalidate('token-1');
      return cache.getToken();
    });
    expect(new Set(await Promise.all(retries))).toEqual(new Set(['token-2']));
    expect(provider).toHaveBeenCalledTimes(2);
  });

  test('a forced refresh waits for the refresh in flight instead of running beside it', async () => {
    let running = 0;
    let mostAtOnce = 0;
    let count = 0;
    const releases: Array<() => void> = [];
    const provider = jest.fn(async (): Promise<AccessToken> => {
      mostAtOnce = Math.max(mostAtOnce, ++running);
      if (count > 0) await new Promise<void>((resolve) => releases.push(resolve));
      running--;
      return { token: `token-${++count}`, expiresAt: now + 300 };
    });
    const cache = new TokenCache(provider);
    await cache.getToken();

    advance(200); // advisory: starts a background refresh that stays in flight
    expect(await cache.getToken()).toBe('token-1');
    await flush();
    expect(provider).toHaveBeenCalledTimes(2);

    // Two requests are rejected with token-1 while that refresh is running.
    cache.invalidate('token-1');
    const first = cache.getToken();
    cache.invalidate('token-1');
    const second = cache.getToken();
    await flush();
    expect(provider).toHaveBeenCalledTimes(2);

    releases.shift()!();
    await flush();
    expect(provider).toHaveBeenCalledTimes(3);
    expect(provider).toHaveBeenLastCalledWith({ forceRefresh: true });
    releases.shift()!();

    expect(await Promise.all([first, second])).toEqual(['token-3', 'token-3']);
    expect(mostAtOnce).toBe(1);
  });

  test('a refresh that was running when the cache was invalidated does not put the rejected token back', async () => {
    // A provider with a cache of its own: only a forced call mints a new token.
    let minted = 1;
    const releases: Array<() => void> = [];
    const provider = jest.fn(async (opts?: { forceRefresh?: boolean }): Promise<AccessToken> => {
      if (provider.mock.calls.length > 1) await new Promise<void>((resolve) => releases.push(resolve));
      if (opts?.forceRefresh) minted++;
      return { token: `token-${minted}`, expiresAt: now + 300 };
    });
    const cache = new TokenCache(provider);
    await cache.getToken();

    advance(200); // advisory: an unforced refresh starts and stays in flight
    await cache.getToken();
    await flush();
    cache.invalidate('token-1'); // a request was rejected with token-1
    const retry = cache.getToken();

    releases.shift()!(); // the unforced refresh returns token-1 again
    await flush();
    const arrivedDuringForcedRefresh = cache.getToken();
    await flush();
    releases.shift()!();

    expect(await Promise.all([retry, arrivedDuringForcedRefresh])).toEqual(['token-2', 'token-2']);
    expect(provider).toHaveBeenCalledTimes(3);
  });

  test('an invalidated cache stays empty when the forced refresh fails', async () => {
    let call = 0;
    const releases: Array<() => void> = [];
    const provider = jest.fn(async (opts?: { forceRefresh?: boolean }): Promise<AccessToken> => {
      const n = ++call;
      if (n === 2) await new Promise<void>((resolve) => releases.push(resolve));
      if (n === 3) throw new Error('token endpoint is down');
      return { token: opts?.forceRefresh ? 'token-2' : 'token-1', expiresAt: now + 300 };
    });
    const cache = new TokenCache(provider);
    await cache.getToken();

    advance(200);
    await cache.getToken();
    await flush();
    cache.invalidate('token-1');
    const retry = cache.getToken();
    releases.shift()!();

    await expect(retry).rejects.toThrow('token endpoint is down');
    expect(await cache.getToken()).toBe('token-2');
    expect(provider).toHaveBeenLastCalledWith({ forceRefresh: true });
  });

  test('a token that was slow to arrive is not refreshed straight away', async () => {
    // Two seconds to obtain a token that is then valid for one second.
    const provider = jest.fn(async (): Promise<AccessToken> => {
      const expiresAt = now + 3;
      advance(2);
      return { token: 'token', expiresAt };
    });
    const cache = new TokenCache(provider);

    await cache.getToken();
    await cache.getToken();
    advance(0.5);
    await cache.getToken();
    await flush();
    expect(provider).toHaveBeenCalledTimes(1);
  });

  test('a provider that throws synchronously does not break an advisory refresh', async () => {
    let fail = false;
    const provider = jest.fn((): Promise<AccessToken> => {
      if (fail) throw new Error('sync failure');
      return Promise.resolve({ token: 'token-1', expiresAt: now + 300 });
    });
    const errors: unknown[] = [];
    const cache = new TokenCache(provider, (err) => errors.push(err));
    await cache.getToken();

    fail = true;
    advance(200);
    expect(await cache.getToken()).toBe('token-1');
    await flush();
    expect(errors).toHaveLength(1);
  });
});
