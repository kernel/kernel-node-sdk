import { APIResource } from "../../core/resource.js";
import * as Shared from "../shared.js";
import { APIPromise } from "../../core/api-promise.js";
import { Stream } from "../../core/streaming.js";
import { RequestOptions } from "../../internal/request-options.js";
/**
 * Stream logs from the browser instance.
 */
export declare class Logs extends APIResource {
    /**
     * Stream log files on the browser instance via SSE
     *
     * @example
     * ```ts
     * const logEvent = await client.browsers.logs.stream(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { source: 'path' },
     * );
     * ```
     */
    stream(idOrName: string, query: LogStreamParams, options?: RequestOptions): APIPromise<Stream<Shared.LogEvent>>;
}
export interface LogStreamParams {
    source: 'path' | 'supervisor';
    follow?: boolean;
    /**
     * only required if source is path
     */
    path?: string;
    /**
     * only required if source is supervisor
     */
    supervisor_process?: string;
}
export declare namespace Logs {
    export { type LogStreamParams as LogStreamParams };
}
//# sourceMappingURL=logs.d.ts.map