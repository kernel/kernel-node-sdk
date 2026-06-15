import Kernel, { KernelError } from '@onkernel/sdk';
import { OffsetPagination } from '@onkernel/sdk/core/pagination';
import type { FinalRequestOptions } from '@onkernel/sdk/internal/request-options';

const client = new Kernel({
  apiKey: 'test-api-key',
  fetch: () => Promise.reject(new Error('unexpected request')),
});

function pageWith(
  headers: Record<string, string>,
  items: unknown[],
  offset?: number,
): OffsetPagination<unknown> {
  const options: FinalRequestOptions = {
    method: 'get',
    path: '/proxies',
    query: offset === undefined ? {} : { offset },
  };
  return new OffsetPagination(client, new Response('[]', { headers }), items, options);
}

describe('OffsetPagination', () => {
  test('requests the next page at exactly X-Next-Offset', () => {
    // X-Next-Offset already holds the next page's start. Adding the current
    // page length on top (the old behavior) skipped a full page per iteration.
    const page = pageWith({ 'x-next-offset': '100', 'x-has-more': 'true' }, new Array(100).fill({}), 0);
    expect(page.nextPageRequestOptions()?.query).toEqual({ offset: 100 });
  });

  test('stops cleanly when the last page omits X-Next-Offset', () => {
    const page = pageWith({ 'x-has-more': 'false' }, new Array(50).fill({}), 100);
    expect(page.nextPageRequestOptions()).toBeNull();
    expect(page.hasNextPage()).toBe(false);
  });

  test('stops when X-Next-Offset is 0, the last-page sentinel', () => {
    const page = pageWith({ 'x-next-offset': '0', 'x-has-more': 'false' }, new Array(50).fill({}), 100);
    expect(page.hasNextPage()).toBe(false);
  });

  test('stops when X-Has-More is false even with a positive X-Next-Offset', () => {
    const page = pageWith({ 'x-next-offset': '200', 'x-has-more': 'false' }, new Array(50).fill({}), 100);
    expect(page.hasNextPage()).toBe(false);
  });

  test('stops on an empty page', () => {
    const page = pageWith({ 'x-next-offset': '300', 'x-has-more': 'true' }, [], 200);
    expect(page.hasNextPage()).toBe(false);
  });

  test('refuses to silently truncate when X-Has-More is true but X-Next-Offset is missing', () => {
    const page = pageWith({ 'x-has-more': 'true' }, new Array(100).fill({}));
    expect(() => page.hasNextPage()).toThrow(KernelError);
  });
});
