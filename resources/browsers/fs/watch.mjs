// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../../core/resource.mjs";
import { buildHeaders } from "../../../internal/headers.mjs";
import { path } from "../../../internal/utils/path.mjs";
/**
 * Read, write, and manage files on the browser instance.
 */
export class Watch extends APIResource {
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
        return this._client.get(path `/browsers/${id_or_name}/fs/watch/${watchID}/events`, {
            ...options,
            headers: buildHeaders([{ Accept: 'text/event-stream' }, options?.headers]),
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
        return this._client.post(path `/browsers/${idOrName}/fs/watch`, { body, ...options });
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
        return this._client.delete(path `/browsers/${id_or_name}/fs/watch/${watchID}`, {
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
}
//# sourceMappingURL=watch.mjs.map