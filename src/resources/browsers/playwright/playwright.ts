// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as ExecutorsAPI from './executors';
import { Executor, ExecutorDeleteParams, ExecutorList, Executors } from './executors';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

/**
 * Execute Playwright code against the browser instance and manage the executors it runs in.
 */
export class Playwright extends APIResource {
  executors: ExecutorsAPI.Executors = new ExecutorsAPI.Executors(this._client);

  /**
   * Execute arbitrary Playwright code in a fresh execution context against the
   * browser. The code runs in the same VM as the browser, minimizing latency and
   * maximizing throughput. It has access to 'page', 'context', 'browser', and
   * 'webmcp' variables. Use 'webmcp.listTools()' to discover browser-wide WebMCP
   * tools and 'webmcp.invokeTool(toolRef, input?, { timeoutSec? })' to invoke an
   * exact registration. It can `return` a value, and this value is returned in the
   * response.
   *
   * Every call runs in an executor: a dedicated Node.js process with its own browser
   * connection. Calls on different executors run concurrently; calls on the same
   * executor run one at a time. A timeout, crash, or blocked event loop in one
   * executor does not affect other executors. After a timeout the executor keeps its
   * process and drops its browser connection, so code abandoned by the timeout
   * cannot keep driving the browser. After a crash or a blocked event loop, the next
   * call on that executor starts a fresh process.
   *
   * Calls without 'executor' run in the executor named 'default', which always
   * exists and is the same as passing 'executor: "default"'. In the default
   * executor, 'page' is bound to an active tab reported by Chrome. In single-window
   * sessions, this is the foreground tab. When multiple browser windows are open,
   * Chrome reports one active tab per window and the selected window is unspecified.
   * 'context' is the BrowserContext that owns the selected page. Use
   * 'browser.contexts()' to select a context or page explicitly.
   *
   * Pass any other name to run the call in a named executor. The first call with a
   * new name creates it. Each named executor owns a tab: its first call opens a new
   * background tab in the default browser context, and 'page' is bound to that tab
   * on every later call while it stays open. Opening it does not change the active
   * tab of an existing window. If the tab is closed, the next call opens a new one
   * and reports 'tab.created: true'. Executor code can still reach other tabs
   * through 'context' and 'browser'; ownership only decides what 'page' is bound to.
   * Use named executors to drive several tabs of one browser in parallel.
   *
   * A browser can have at most 8 named executors; the default executor does not
   * count. A call that would create another returns 409 with the current executors;
   * delete one with DELETE /browsers/{id_or_name}/playwright/executors/{name}. Named
   * executors are not removed automatically while the browser runs; when it shuts
   * down, they are removed and their tabs closed.
   *
   * A named call to a browser whose image predates executors fails with 400 instead
   * of running on the active tab; calls without 'executor' keep working on every
   * image.
   *
   * @example
   * ```ts
   * const response = await client.browsers.playwright.execute(
   *   'htzv5orfit78e1m2biiifpbv',
   *   { code: 'code' },
   * );
   * ```
   */
  execute(
    idOrName: string,
    body: PlaywrightExecuteParams,
    options?: RequestOptions,
  ): APIPromise<PlaywrightExecuteResponse> {
    return this._client.post(path`/browsers/${idOrName}/playwright/execute`, { body, ...options });
  }
}

/**
 * Returned when a call would create a named executor beyond the per-browser limit
 */
export interface ExecutorLimitError {
  /**
   * The default executor and the named executors that already exist
   */
  executors: Array<ExecutorsAPI.Executor>;

  /**
   * Human-readable error description
   */
  message: string;
}

/**
 * The tab 'page' was bound to for this call. Absent if the call failed before
 * binding a tab.
 */
export interface Tab {
  /**
   * Whether this call opened the tab. For a named executor this happens on its first
   * call and after its previous tab was closed. For the default executor it happens
   * only when the browser had no open page.
   */
  created: boolean;

  /**
   * CDP page target ID of the tab
   */
  target_id: string;
}

/**
 * Result of Playwright code execution
 */
export interface PlaywrightExecuteResponse {
  /**
   * Whether the code executed successfully
   */
  success: boolean;

  /**
   * Error message if execution failed
   */
  error?: string;

  /**
   * The value returned by the code (if any)
   */
  result?: unknown;

  /**
   * Standard error from the execution
   */
  stderr?: string;

  /**
   * Standard output from the execution
   */
  stdout?: string;

  /**
   * The tab 'page' was bound to for this call. Absent if the call failed before
   * binding a tab.
   */
  tab?: Tab;
}

export interface PlaywrightExecuteParams {
  /**
   * TypeScript/JavaScript code to execute. The code has access to 'page', 'context',
   * and 'browser' variables. It runs within a function, so you can use a return
   * statement at the end to return a value. This value is returned as the `result`
   * property in the response. Example: "await page.goto('https://example.com');
   * return await page.title();"
   */
  code: string;

  /**
   * Name of a Playwright executor. Calls with the same name run in the same
   * executor, one at a time; the first call with a new name creates it. Calls on
   * different executors run concurrently. 'default' names the executor that runs
   * calls without a name.
   */
  executor?: string;

  /**
   * Maximum execution time in seconds. Default is 60.
   */
  timeout_sec?: number;
}

Playwright.Executors = Executors;

export declare namespace Playwright {
  export {
    type ExecutorLimitError as ExecutorLimitError,
    type Tab as Tab,
    type PlaywrightExecuteResponse as PlaywrightExecuteResponse,
    type PlaywrightExecuteParams as PlaywrightExecuteParams,
  };

  export {
    Executors as Executors,
    type Executor as Executor,
    type ExecutorList as ExecutorList,
    type ExecutorDeleteParams as ExecutorDeleteParams,
  };
}
