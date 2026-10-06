// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import { APIPromise } from '../../../core/api-promise';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

/**
 * Execute Playwright code against the browser instance and manage the executors it runs in.
 */
export class Executors extends APIResource {
  /**
   * Lists the default executor first, then the named executors created by POST
   * /browsers/{id_or_name}/playwright/execute. Each entry reports whether a call is
   * running on it and, for named executors, the target ID and URL of the tab it
   * owns. Returns 404 for a browser whose image predates executors.
   *
   * @example
   * ```ts
   * const executorList =
   *   await client.browsers.playwright.executors.list(
   *     'htzv5orfit78e1m2biiifpbv',
   *   );
   * ```
   */
  list(idOrName: string, options?: RequestOptions): APIPromise<ExecutorList> {
    return this._client.get(path`/browsers/${idOrName}/playwright/executors`, options);
  }

  /**
   * Stops the executor's process. A call running on it fails with an error saying
   * the executor was deleted. By default the executor's tab is closed too. The name
   * can be reused; the next call with it creates a new executor and tab.
   *
   * The default executor is restarted instead of removed: its process is stopped, a
   * call running on it fails with an error saying the executor was restarted, and
   * queued and later calls run on a new process. It owns no tab, so 'close_tab' has
   * no effect on it.
   *
   * @example
   * ```ts
   * await client.browsers.playwright.executors.delete(
   *   'checkout',
   *   { id_or_name: 'htzv5orfit78e1m2biiifpbv' },
   * );
   * ```
   */
  delete(name: string, params: ExecutorDeleteParams, options?: RequestOptions): APIPromise<void> {
    const { id_or_name, close_tab } = params;
    return this._client.delete(path`/browsers/${id_or_name}/playwright/executors/${name}`, {
      query: { close_tab },
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

/**
 * A Playwright executor on the browser
 */
export interface Executor {
  /**
   * Whether a call is running on the executor
   */
  busy: boolean;

  /**
   * When the executor was created
   */
  created_at: string;

  /**
   * When the most recent call on the executor started
   */
  last_used_at: string;

  /**
   * Name of a Playwright executor. Calls with the same name run in the same
   * executor, one at a time; the first call with a new name creates it. Calls on
   * different executors run concurrently. 'default' names the executor that runs
   * calls without a name.
   */
  name: string;

  /**
   * CDP page target ID of the executor's tab, once it has one. The default executor
   * owns no tab.
   */
  target_id?: string;

  /**
   * Current URL of the executor's tab, when it is open
   */
  url?: string;
}

/**
 * The default executor followed by the named executors
 */
export interface ExecutorList {
  executors: Array<Executor>;
}

export interface ExecutorDeleteParams {
  /**
   * Path param: Browser session ID or name
   */
  id_or_name: string;

  /**
   * Query param: Close the executor's tab. Defaults to true.
   */
  close_tab?: boolean;
}

export declare namespace Executors {
  export {
    type Executor as Executor,
    type ExecutorList as ExecutorList,
    type ExecutorDeleteParams as ExecutorDeleteParams,
  };
}
