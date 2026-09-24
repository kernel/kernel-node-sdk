// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as CustomToolsAPI from './custom-tools';
import {
  AddRequest,
  CustomToolAddParams,
  CustomToolRemoveParams,
  CustomTools,
  CustomToolsResponse,
  Definition,
  Match,
} from './custom-tools';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

/**
 * Discover and invoke native page tools across the browser instance.
 */
export class Webmcp extends APIResource {
  customTools: CustomToolsAPI.CustomTools = new CustomToolsAPI.CustomTools(this._client);

  /**
   * Invokes the exact live registration identified by tool_ref. Non-autosubmit
   * declarative form tools return after their fields are populated with an
   * awaiting_submission status. Other tools wait for a terminal result, including
   * across navigation. Inspect a populated form, obtain any required confirmation,
   * then submit through Playwright or computer interaction without invoking the tool
   * again. If the tab or embedded frame disappears, or the request times out after
   * invocation begins, the response reports outcome_unknown and the tool is not
   * retried. CDP-backed custom tool outputs above 240 KiB return an error rather
   * than a truncated result.
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
   * Returns a snapshot of native and custom WebMCP tools available across every open
   * tab and embedded frame in the browser. Each tool includes an opaque tool_ref for
   * invoking that exact live registration, nested tool metadata, and source
   * information. Custom tools include their generated ID, namespace, and CDP
   * target_id in source. Tools disappear when their document closes or navigates
   * away. Use exclude_custom to return only page-provided tools.
   *
   * @example
   * ```ts
   * const toolsResponse =
   *   await client.browsers.webmcp.listTools(
   *     'htzv5orfit78e1m2biiifpbv',
   *   );
   * ```
   */
  listTools(
    idOrName: string,
    query: WebmcpListToolsParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ToolsResponse> {
    return this._client.get(path`/browsers/${idOrName}/webmcp/tools`, { query, ...options });
  }
}

export interface CustomToolSource {
  id: string;

  namespace: string;
}

export interface InvocationFailure {
  code: 'outcome_unknown';

  message: string;

  invocation_id?: string;
}

export interface InvocationResult {
  invocation_id: string;

  /**
   * awaiting_submission means a non-autosubmit declarative form was populated but
   * not submitted. Inspect the form, obtain any required confirmation, then submit
   * through Playwright or computer interaction without invoking the tool again. The
   * other statuses are terminal results.
   */
  status: 'completed' | 'canceled' | 'error' | 'awaiting_submission';

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
  source: ToolSource;

  /**
   * Tool metadata follows the
   * [MCP Tool definition](https://modelcontextprotocol.io/specification/2025-11-25/server/tools#tool)
   * and the
   * [WebMCP RegisteredTool definition](https://webmachinelearning.github.io/webmcp/#dictdef-registeredtool).
   * outputSchema is optional for page and custom tools.
   */
  tool: ToolMetadata;

  /**
   * Opaque reference for invoking this exact live registration. It becomes invalid
   * when its document or browser process is replaced.
   */
  tool_ref: string;
}

/**
 * Tool-provided behavioral hints from the
 * [MCP tool specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools#tool)
 * and the
 * [WebMCP ToolAnnotations definition](https://webmachinelearning.github.io/webmcp/#dictdef-toolannotations).
 * These hints are untrusted and are not enforced by Kernel.
 */
export interface ToolAnnotations {
  autosubmit?: boolean;

  consequentialHint?: boolean;

  destructiveHint?: boolean;

  idempotentHint?: boolean;

  openWorldHint?: boolean;

  readOnlyHint?: boolean;

  untrustedContentHint?: boolean;
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

/**
 * Tool metadata follows the
 * [MCP Tool definition](https://modelcontextprotocol.io/specification/2025-11-25/server/tools#tool)
 * and the
 * [WebMCP RegisteredTool definition](https://webmachinelearning.github.io/webmcp/#dictdef-registeredtool).
 * outputSchema is optional for page and custom tools.
 */
export interface ToolMetadata {
  description: string;

  inputSchema: { [key: string]: unknown };

  name: string;

  /**
   * Tool-provided behavioral hints from the
   * [MCP tool specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools#tool)
   * and the
   * [WebMCP ToolAnnotations definition](https://webmachinelearning.github.io/webmcp/#dictdef-toolannotations).
   * These hints are untrusted and are not enforced by Kernel.
   */
  annotations?: ToolAnnotations;

  outputSchema?: { [key: string]: unknown };

  title?: string;
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

  custom?: CustomToolSource;

  /**
   * CDP target ID for a custom tool's registration tab; omitted for page-provided
   * tools.
   */
  target_id?: string;
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

export interface WebmcpListToolsParams {
  /**
   * Exclude custom tools when true.
   */
  exclude_custom?: boolean;
}

Webmcp.CustomTools = CustomTools;

export declare namespace Webmcp {
  export {
    type CustomToolSource as CustomToolSource,
    type InvocationFailure as InvocationFailure,
    type InvocationResult as InvocationResult,
    type InvokeRequest as InvokeRequest,
    type Tool as Tool,
    type ToolAnnotations as ToolAnnotations,
    type ToolFrame as ToolFrame,
    type ToolMetadata as ToolMetadata,
    type ToolSource as ToolSource,
    type ToolsResponse as ToolsResponse,
    type WebmcpInvokeToolParams as WebmcpInvokeToolParams,
    type WebmcpListToolsParams as WebmcpListToolsParams,
  };

  export {
    CustomTools as CustomTools,
    type AddRequest as AddRequest,
    type CustomToolsResponse as CustomToolsResponse,
    type Definition as Definition,
    type Match as Match,
    type CustomToolAddParams as CustomToolAddParams,
    type CustomToolRemoveParams as CustomToolRemoveParams,
  };
}
