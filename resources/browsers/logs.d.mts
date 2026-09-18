import { APIResource } from "../../core/resource.mjs";
import * as Shared from "../shared.mjs";
import { APIPromise } from "../../core/api-promise.mjs";
import { Stream } from "../../core/streaming.mjs";
import { RequestOptions } from "../../internal/request-options.mjs";
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
//# sourceMappingURL=logs.d.mts.map