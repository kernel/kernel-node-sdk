// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import { path } from "../../internal/utils/path.mjs";
/**
 * Discover and invoke native page tools across the browser instance.
 */
export class Webmcp extends APIResource {
    /**
     * Invokes the exact live registration identified by tool_ref. Non-autosubmit
     * declarative form tools return after their fields are populated with an
     * awaiting_submission status. Other tools wait for a terminal result, including
     * across navigation. Inspect a populated form, obtain any required confirmation,
     * then submit through Playwright or computer interaction without invoking the tool
     * again. If the tab or embedded frame disappears, or the request times out after
     * invocation begins, the response reports outcome_unknown and the tool is not
     * retried.
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
    invokeTool(idOrName, body, options) {
        return this._client.post(path `/browsers/${idOrName}/webmcp/invoke`, { body, ...options });
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
    listTools(idOrName, options) {
        return this._client.get(path `/browsers/${idOrName}/webmcp/tools`, options);
    }
}
//# sourceMappingURL=webmcp.mjs.map