import { NotFoundError } from '../core/error';
import type { Kernel } from '../client';
import type { RequestOptions } from '../internal/request-options';
import type { BrowserPoolAcquireParams, BrowserPoolAcquireResponse } from '../resources/browser-pools';

export type AcquireOutcome =
  | { status: 'acquired'; browser: BrowserPoolAcquireResponse }
  | { status: 'timed_out' }
  | { status: 'not_found' };

/**
 * Long-polling acquire that surfaces the HTTP outcome as a typed result.
 *
 * Resolves to one of:
 *
 * - `{ status: 'acquired', browser }` — a browser was leased from the pool.
 * - `{ status: 'timed_out' }` — the long poll expired without a browser becoming
 *   available. Retry to keep waiting.
 * - `{ status: 'not_found' }` — no pool exists with the given id or name.
 *
 * Other API errors (auth, server errors, etc.) still reject.
 */
export async function acquire(
  client: Kernel,
  idOrName: string,
  body: BrowserPoolAcquireParams = {},
  options?: RequestOptions,
): Promise<AcquireOutcome> {
  try {
    const { data, response } = await client.browserPools.acquire(idOrName, body, options).withResponse();
    if (response.status === 204) {
      return { status: 'timed_out' };
    }
    return { status: 'acquired', browser: data };
  } catch (err) {
    if (err instanceof NotFoundError) {
      return { status: 'not_found' };
    }
    throw err;
  }
}
