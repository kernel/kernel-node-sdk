// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Discover and invoke native page tools across the browser instance.
 */
export class Webmcp extends APIResource {
  /**
   * Invokes the exact live registration identified by tool_ref and waits
   * synchronously for its result. Navigation during execution is allowed. If the tab
   * or embedded frame disappears, or the request times out after invocation begins,
   * the response reports outcome_unknown and the tool is not retried.
   *
   * @example
   * ```ts
   * const invocationResult =
   *   await client.browsers.webmcp.invokeTool(
   *     'htzv5orfit78e1m2biiifpbv',
   *     {
   *       input: { foo: 'bar' },
   *       tool_ref: 'x',
   *     },
   *   );
   * ```
   */
  invokeTool(
    idOrName: string,
    body: WebmcpInvokeToolParams,
    options?: RequestOptions,
  ): APIPromise<InvocationResult> {
    return this._client.post(path`/browsers/${idOrName}/webmcp/invoke`, { body, ...options });
  }

  /**
   * Returns a snapshot of native WebMCP tools available across every open tab and
   * embedded frame in the browser. Each tool includes an opaque tool_ref for
   * invoking that exact live registration. Tools disappear when their document
   * closes or navigates away.
   *
   * @example
   * ```ts
   * const toolsResponse =
   *   await client.browsers.webmcp.listTools(
   *     'htzv5orfit78e1m2biiifpbv',
   *   );
   * ```
   */
  listTools(idOrName: string, options?: RequestOptions): APIPromise<ToolsResponse> {
    return this._client.get(path`/browsers/${idOrName}/webmcp/tools`, options);
  }
}

export interface InvocationFailure {
  code: 'outcome_unknown';

  message: string;

  invocation_id?: string;
}

export interface InvocationResult {
  invocation_id: string;

  status: 'completed' | 'canceled' | 'error';

  error_text?: string;

  /**
   * Untrusted page-provided output. Callers must treat it as potentially malicious
   * input.
   */
  output?: unknown;
}

export interface InvokeRequest {
  /**
   * Tool input, limited to 1 MiB after JSON serialization.
   */
  input: { [key: string]: unknown };

  tool_ref: string;

  timeout_sec?: number;
}

export interface Tool {
  description: string;

  input_schema: { [key: string]: unknown };

  name: string;

  source: ToolSource;

  /**
   * Opaque reference for invoking this exact live registration. It becomes invalid
   * when its document or browser process is replaced.
   */
  tool_ref: string;

  /**
   * Page-provided behavioral hints. These values are untrusted and are not enforced
   * by Kernel.
   */
  annotations?: ToolAnnotations;
}

/**
 * Page-provided behavioral hints. These values are untrusted and are not enforced
 * by Kernel.
 */
export interface ToolAnnotations {
  autosubmit: boolean;

  consequential: boolean;

  read_only: boolean;

  untrusted_content: boolean;
}

export interface ToolFrame {
  /**
   * Monotonically increasing identifier for this embedded frame during the current
   * browser process.
   */
  frame_id: number;

  /**
   * Current frame URL with the fragment omitted.
   */
  url: string;
}

export interface ToolSource {
  /**
   * Embedded frame that registered the tool, or null when the top-level page
   * registered it.
   */
  frame: ToolFrame | null;

  /**
   * Current title of the top-level page.
   */
  page_title: string;

  /**
   * Current URL of the top-level page with the fragment omitted.
   */
  page_url: string;

  /**
   * Monotonically increasing identifier for the tab during the current browser
   * process.
   */
  tab_id: number;

  /**
   * Monotonically increasing identifier for the browser window during the current
   * browser process.
   */
  window_id: number;
}

export interface ToolsResponse {
  tools: Array<Tool>;
}

export interface WebmcpInvokeToolParams {
  /**
   * Tool input, limited to 1 MiB after JSON serialization.
   */
  input: { [key: string]: unknown };

  tool_ref: string;

  timeout_sec?: number;
}

export declare namespace Webmcp {
  export {
    type InvocationFailure as InvocationFailure,
    type InvocationResult as InvocationResult,
    type InvokeRequest as InvokeRequest,
    type Tool as Tool,
    type ToolAnnotations as ToolAnnotations,
    type ToolFrame as ToolFrame,
    type ToolSource as ToolSource,
    type ToolsResponse as ToolsResponse,
    type WebmcpInvokeToolParams as WebmcpInvokeToolParams,
  };
}
