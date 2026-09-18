import { APIResource } from "../../../core/resource.js";
import { APIPromise } from "../../../core/api-promise.js";
import { Stream } from "../../../core/streaming.js";
import { RequestOptions } from "../../../internal/request-options.js";
/**
 * Read, write, and manage files on the browser instance.
 */
export declare class Watch extends APIResource {
    /**
     * Stream filesystem events for a watch
     *
     * @example
     * ```ts
     * const response = await client.browsers.fs.watch.events(
     *   'watch_id',
     *   { id_or_name: 'htzv5orfit78e1m2biiifpbv' },
     * );
     * ```
     */
    events(watchID: string, params: WatchEventsParams, options?: RequestOptions): APIPromise<Stream<WatchEventsResponse>>;
    /**
     * Watch a directory for changes
     *
     * @example
     * ```ts
     * const response = await client.browsers.fs.watch.start(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { path: 'path' },
     * );
     * ```
     */
    start(idOrName: string, body: WatchStartParams, options?: RequestOptions): APIPromise<WatchStartResponse>;
    /**
     * Stop watching a directory
     *
     * @example
     * ```ts
     * await client.browsers.fs.watch.stop('watch_id', {
     *   id_or_name: 'htzv5orfit78e1m2biiifpbv',
     * });
     * ```
     */
    stop(watchID: string, params: WatchStopParams, options?: RequestOptions): APIPromise<void>;
}
/**
 * Filesystem change event.
 */
export interface WatchEventsResponse {
    /**
     * Absolute path of the file or directory.
     */
    path: string;
    /**
     * Event type.
     */
    type: 'CREATE' | 'WRITE' | 'DELETE' | 'RENAME';
    /**
     * Whether the affected path is a directory.
     */
    is_dir?: boolean;
    /**
     * Base name of the file or directory affected.
     */
    name?: string;
}
export interface WatchStartResponse {
    /**
     * Unique identifier for the directory watch
     */
    watch_id?: string;
}
export interface WatchEventsParams {
    /**
     * Browser session ID or name
     */
    id_or_name: string;
}
export interface WatchStartParams {
    /**
     * Directory to watch.
     */
    path: string;
    /**
     * Whether to watch recursively.
     */
    recursive?: boolean;
}
export interface WatchStopParams {
    /**
     * Browser session ID or name
     */
    id_or_name: string;
}
export declare namespace Watch {
    export { type WatchEventsResponse as WatchEventsResponse, type WatchStartResponse as WatchStartResponse, type WatchEventsParams as WatchEventsParams, type WatchStartParams as WatchStartParams, type WatchStopParams as WatchStopParams, };
}
//# sourceMappingURL=watch.d.ts.map