import { APIResource } from "../../core/resource.js";
import { APIPromise } from "../../core/api-promise.js";
import { RequestOptions } from "../../internal/request-options.js";
/**
 * Record and manage browser session video replays.
 */
export declare class Replays extends APIResource {
    /**
     * List all replays for the specified browser session.
     *
     * @example
     * ```ts
     * const replays = await client.browsers.replays.list(
     *   'htzv5orfit78e1m2biiifpbv',
     * );
     * ```
     */
    list(idOrName: string, options?: RequestOptions): APIPromise<ReplayListResponse>;
    /**
     * Download or stream the specified replay recording.
     *
     * @example
     * ```ts
     * const response = await client.browsers.replays.download(
     *   'replay_id',
     *   { id_or_name: 'htzv5orfit78e1m2biiifpbv' },
     * );
     *
     * const content = await response.blob();
     * console.log(content);
     * ```
     */
    download(replayID: string, params: ReplayDownloadParams, options?: RequestOptions): APIPromise<Response>;
    /**
     * Start recording the browser session and return a replay ID.
     *
     * @example
     * ```ts
     * const response = await client.browsers.replays.start(
     *   'htzv5orfit78e1m2biiifpbv',
     * );
     * ```
     */
    start(idOrName: string, body?: ReplayStartParams | null | undefined, options?: RequestOptions): APIPromise<ReplayStartResponse>;
    /**
     * Stop the specified replay recording and persist the video.
     *
     * @example
     * ```ts
     * await client.browsers.replays.stop('replay_id', {
     *   id_or_name: 'htzv5orfit78e1m2biiifpbv',
     * });
     * ```
     */
    stop(replayID: string, params: ReplayStopParams, options?: RequestOptions): APIPromise<void>;
}
export type ReplayListResponse = Array<ReplayListResponse.ReplayListResponseItem>;
export declare namespace ReplayListResponse {
    /**
     * Information about a browser replay recording.
     */
    interface ReplayListResponseItem {
        /**
         * Unique identifier for the replay recording.
         */
        replay_id: string;
        /**
         * Timestamp when replay finished
         */
        finished_at?: string | null;
        /**
         * URL for viewing the replay recording.
         */
        replay_view_url?: string;
        /**
         * Timestamp when replay started
         */
        started_at?: string | null;
    }
}
/**
 * Information about a browser replay recording.
 */
export interface ReplayStartResponse {
    /**
     * Unique identifier for the replay recording.
     */
    replay_id: string;
    /**
     * Timestamp when replay finished
     */
    finished_at?: string | null;
    /**
     * URL for viewing the replay recording.
     */
    replay_view_url?: string;
    /**
     * Timestamp when replay started
     */
    started_at?: string | null;
}
export interface ReplayDownloadParams {
    /**
     * Browser session ID or name
     */
    id_or_name: string;
}
export interface ReplayStartParams {
    /**
     * Recording framerate in fps. Values above 20 require GPU to be enabled on the
     * browser session.
     */
    framerate?: number;
    /**
     * Maximum recording duration in seconds.
     */
    max_duration_in_seconds?: number;
    /**
     * Record audio in addition to video. When false (the default), the recording is
     * video-only.
     */
    record_audio?: boolean;
}
export interface ReplayStopParams {
    /**
     * Browser session ID or name
     */
    id_or_name: string;
}
export declare namespace Replays {
    export { type ReplayListResponse as ReplayListResponse, type ReplayStartResponse as ReplayStartResponse, type ReplayDownloadParams as ReplayDownloadParams, type ReplayStartParams as ReplayStartParams, type ReplayStopParams as ReplayStopParams, };
}
//# sourceMappingURL=replays.d.ts.map