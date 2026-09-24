// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as WebmcpAPI from './webmcp';
import { APIPromise } from '../../../core/api-promise';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

/**
 * Discover and invoke native page tools across the browser instance.
 */
export class CustomTools extends APIResource {
  /**
   * Returns every registered custom tool with its generated ID, namespace, matcher,
   * and MCP tool metadata.
   *
   * @example
   * ```ts
   * const customToolsResponse =
   *   await client.browsers.webmcp.customTools.list(
   *     'id_or_name',
   *   );
   * ```
   */
  list(idOrName: string, options?: RequestOptions): APIPromise<CustomToolsResponse> {
    return this._client.get(path`/browsers/${idOrName}/webmcp/custom-tools`, options);
  }

  /**
   * Add a namespaced batch of custom tools. A custom tool can be page-backed or
   * CDP-backed. Page-backed tools execute in the page via JavaScript. CDP-backed
   * tools execute via CDP and can use all browser REPL tools (see `/repl`). The
   * source must evaluate to a non-empty array of definitions with URL matchers, tool
   * metadata (including an optional output schema), and execute functions. The batch
   * is added atomically. Matchers apply to top-level documents and nested frames,
   * including out-of-process iframes; each matching tool is exposed once on the
   * tab's top-level document and appears in the WebMCP tool snapshot.
   *
   * To update one tool, list the tools, delete its ID, and add its replacement. Set
   * force_overwrite_namespace to replace every existing tool in the namespace
   * atomically; omitted or false adds tools without replacing existing ones.
   * Existing invocations continue.
   *
   * @example
   * ```ts
   * const customToolsResponse =
   *   await client.browsers.webmcp.customTools.add(
   *     'id_or_name',
   *     { namespace: 'namespace', source: 'source' },
   *   );
   * ```
   */
  add(
    idOrName: string,
    body: CustomToolAddParams,
    options?: RequestOptions,
  ): APIPromise<CustomToolsResponse> {
    return this._client.post(path`/browsers/${idOrName}/webmcp/custom-tools`, { body, ...options });
  }

  /**
   * Removes one custom tool by generated ID. An invocation already in progress is
   * not canceled.
   *
   * @example
   * ```ts
   * await client.browsers.webmcp.customTools.remove(
   *   'ct_n10b9798ad53ecc4y69z31e1',
   *   { id_or_name: 'id_or_name' },
   * );
   * ```
   */
  remove(id: string, params: CustomToolRemoveParams, options?: RequestOptions): APIPromise<void> {
    const { id_or_name } = params;
    return this._client.delete(path`/browsers/${id_or_name}/webmcp/custom-tools/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface AddRequest {
  namespace: string;

  /**
   * JavaScript expression that evaluates to a non-empty array of custom tool
   * definitions. Limited to 8,000,000 bytes when UTF-8 encoded, so multi-byte
   * characters reduce the allowed character count.
   */
  source: string;

  /**
   * Atomically replace all existing tools in this namespace with this batch when
   * true.
   */
  force_overwrite_namespace?: boolean;
}

export interface CustomToolsResponse {
  tools: Array<Definition>;
}

export interface Definition {
  id: string;

  kind: string;

  match: Match;

  namespace: string;

  /**
   * Tool metadata follows the
   * [MCP Tool definition](https://modelcontextprotocol.io/specification/2025-11-25/server/tools#tool)
   * and the
   * [WebMCP RegisteredTool definition](https://webmachinelearning.github.io/webmcp/#dictdef-registeredtool).
   * outputSchema is optional for page and custom tools.
   */
  tool: WebmcpAPI.ToolMetadata;
}

export interface Match {
  url_patterns: Array<string>;
}

export interface CustomToolAddParams {
  namespace: string;

  /**
   * JavaScript expression that evaluates to a non-empty array of custom tool
   * definitions. Limited to 8,000,000 bytes when UTF-8 encoded, so multi-byte
   * characters reduce the allowed character count.
   */
  source: string;

  /**
   * Atomically replace all existing tools in this namespace with this batch when
   * true.
   */
  force_overwrite_namespace?: boolean;
}

export interface CustomToolRemoveParams {
  /**
   * Browser session ID or name
   */
  id_or_name: string;
}

export declare namespace CustomTools {
  export {
    type AddRequest as AddRequest,
    type CustomToolsResponse as CustomToolsResponse,
    type Definition as Definition,
    type Match as Match,
    type CustomToolAddParams as CustomToolAddParams,
    type CustomToolRemoveParams as CustomToolRemoveParams,
  };
}
