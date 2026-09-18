"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Telemetry = void 0;
const resource_1 = require("../../core/resource.js");
const pagination_1 = require("../../core/pagination.js");
const headers_1 = require("../../internal/headers.js");
const path_1 = require("../../internal/utils/path.js");
/**
 * Stream live telemetry events from a browser session, and manage the destinations sessions export them to.
 */
class Telemetry extends resource_1.APIResource {
    /**
     * Reads a page of telemetry events for the browser session. To page through
     * results, pass the X-Next-Offset value from the previous response as offset and
     * repeat while X-Has-More is true. Returns an empty list when telemetry data is
     * unavailable.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const telemetryEventsResponse of client.browsers.telemetry.events(
     *   'htzv5orfit78e1m2biiifpbv',
     * )) {
     *   // ...
     * }
     * ```
     */
    events(idOrName, query = {}, options) {
        return this._client.getAPIList((0, path_1.path) `/browsers/${idOrName}/telemetry/events`, (pagination_1.OffsetPagination), { query, ...options });
    }
    /**
     * Streams browser telemetry events as a server-sent events (SSE) stream. The
     * stream closes when the browser session terminates. Each event frame includes an
     * id: field containing a monotonically increasing sequence number; pass it as
     * Last-Event-ID on reconnect to resume without gaps. The event: field is never
     * set; all frames carry JSON in the data: field. A keepalive comment frame is sent
     * every 15 seconds when no events arrive. Returns 404 if the browser session does
     * not exist. If telemetry was not enabled on the session, the stream opens but no
     * events are delivered. Fresh connections only see new events; pass replay=all to
     * start from the oldest retained event instead.
     *
     * @example
     * ```ts
     * const response = await client.browsers.telemetry.stream(
     *   'htzv5orfit78e1m2biiifpbv',
     * );
     * ```
     */
    stream(idOrName, params = {}, options) {
        const { 'Last-Event-ID': lastEventID, ...query } = params ?? {};
        return this._client.get((0, path_1.path) `/browsers/${idOrName}/telemetry/stream`, {
            query,
            ...options,
            headers: (0, headers_1.buildHeaders)([
                {
                    Accept: 'text/event-stream',
                    ...(lastEventID != null ? { 'Last-Event-ID': lastEventID } : undefined),
                },
                options?.headers,
            ]),
            stream: true,
        });
    }
}
exports.Telemetry = Telemetry;
//# sourceMappingURL=telemetry.js.map