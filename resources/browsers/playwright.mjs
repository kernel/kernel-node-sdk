// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import { path } from "../../internal/utils/path.mjs";
/**
 * Execute Playwright code against the browser instance.
 */
export class Playwright extends APIResource {
    /**
     * Execute arbitrary Playwright code in a fresh execution context against the
     * browser. The code runs in the same VM as the browser, minimizing latency and
     * maximizing throughput. It has access to 'page', 'context', 'browser', and
     * 'webmcp' variables. Use 'webmcp.listTools()' to discover browser-wide WebMCP
     * tools and 'webmcp.invokeTool(toolRef, input?, { timeoutSec? })' to invoke an
     * exact registration. It can `return` a value, and this value is returned in the
     * response.
     *
     * @example
     * ```ts
     * const response = await client.browsers.playwright.execute(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { code: 'code' },
     * );
     * ```
     */
    execute(idOrName, body, options) {
        return this._client.post(path `/browsers/${idOrName}/playwright/execute`, { body, ...options });
    }
}
//# sourceMappingURL=playwright.mjs.map