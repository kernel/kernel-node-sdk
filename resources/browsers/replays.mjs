// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import { buildHeaders } from "../../internal/headers.mjs";
import { path } from "../../internal/utils/path.mjs";
/**
 * Record and manage browser session video replays.
 */
export class Replays extends APIResource {
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
    list(idOrName, options) {
        return this._client.get(path `/browsers/${idOrName}/replays`, options);
    }
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
    download(replayID, params, options) {
        const { id_or_name } = params;
        return this._client.get(path `/browsers/${id_or_name}/replays/${replayID}`, {
            ...options,
            headers: buildHeaders([{ Accept: 'video/mp4' }, options?.headers]),
            __binaryResponse: true,
        });
    }
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
    start(idOrName, body = {}, options) {
        return this._client.post(path `/browsers/${idOrName}/replays`, { body, ...options });
    }
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
    stop(replayID, params, options) {
        const { id_or_name } = params;
        return this._client.post(path `/browsers/${id_or_name}/replays/${replayID}/stop`, {
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
}
//# sourceMappingURL=replays.mjs.map