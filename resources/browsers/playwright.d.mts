import { APIResource } from "../../core/resource.mjs";
import { APIPromise } from "../../core/api-promise.mjs";
import { RequestOptions } from "../../internal/request-options.mjs";
/**
 * Execute Playwright code against the browser instance.
 */
export declare class Playwright extends APIResource {
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
    execute(idOrName: string, body: PlaywrightExecuteParams, options?: RequestOptions): APIPromise<PlaywrightExecuteResponse>;
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
     * Maximum execution time in seconds. Default is 60.
     */
    timeout_sec?: number;
}
export declare namespace Playwright {
    export { type PlaywrightExecuteResponse as PlaywrightExecuteResponse, type PlaywrightExecuteParams as PlaywrightExecuteParams, };
}
//# sourceMappingURL=playwright.d.mts.map