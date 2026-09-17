"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logs = void 0;
const resource_1 = require("../../core/resource.js");
const headers_1 = require("../../internal/headers.js");
const path_1 = require("../../internal/utils/path.js");
/**
 * Stream logs from the browser instance.
 */
class Logs extends resource_1.APIResource {
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
    stream(idOrName, query, options) {
        return this._client.get((0, path_1.path) `/browsers/${idOrName}/logs/stream`, {
            query,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: 'text/event-stream' }, options?.headers]),
            stream: true,
        });
    }
}
exports.Logs = Logs;
//# sourceMappingURL=logs.js.map