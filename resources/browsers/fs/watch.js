"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Watch = void 0;
const resource_1 = require("../../../core/resource.js");
const headers_1 = require("../../../internal/headers.js");
const path_1 = require("../../../internal/utils/path.js");
/**
 * Read, write, and manage files on the browser instance.
 */
class Watch extends resource_1.APIResource {
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
    events(watchID, params, options) {
        const { id_or_name } = params;
        return this._client.get((0, path_1.path) `/browsers/${id_or_name}/fs/watch/${watchID}/events`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: 'text/event-stream' }, options?.headers]),
            stream: true,
        });
    }
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
    start(idOrName, body, options) {
        return this._client.post((0, path_1.path) `/browsers/${idOrName}/fs/watch`, { body, ...options });
    }
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
    stop(watchID, params, options) {
        const { id_or_name } = params;
        return this._client.delete((0, path_1.path) `/browsers/${id_or_name}/fs/watch/${watchID}`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: '*/*' }, options?.headers]),
        });
    }
}
exports.Watch = Watch;
//# sourceMappingURL=watch.js.map