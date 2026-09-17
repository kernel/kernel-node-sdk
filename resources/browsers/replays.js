"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Replays = void 0;
const resource_1 = require("../../core/resource.js");
const headers_1 = require("../../internal/headers.js");
const path_1 = require("../../internal/utils/path.js");
/**
 * Record and manage browser session video replays.
 */
class Replays extends resource_1.APIResource {
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
        return this._client.get((0, path_1.path) `/browsers/${idOrName}/replays`, options);
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
        return this._client.get((0, path_1.path) `/browsers/${id_or_name}/replays/${replayID}`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: 'video/mp4' }, options?.headers]),
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
        return this._client.post((0, path_1.path) `/browsers/${idOrName}/replays`, { body, ...options });
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
        return this._client.post((0, path_1.path) `/browsers/${id_or_name}/replays/${replayID}/stop`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: '*/*' }, options?.headers]),
        });
    }
}
exports.Replays = Replays;
//# sourceMappingURL=replays.js.map