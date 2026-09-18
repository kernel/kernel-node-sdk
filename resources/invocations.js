"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invocations = void 0;
const resource_1 = require("../core/resource.js");
const pagination_1 = require("../core/pagination.js");
const headers_1 = require("../internal/headers.js");
const path_1 = require("../internal/utils/path.js");
/**
 * Invoke actions and stream or query invocation status and events.
 */
class Invocations extends resource_1.APIResource {
    /**
     * Invoke an action.
     *
     * @example
     * ```ts
     * const invocation = await client.invocations.create({
     *   action_name: 'analyze',
     *   app_name: 'my-app',
     *   version: '1.0.0',
     * });
     * ```
     */
    create(body, options) {
        return this._client.post('/invocations', { body, ...options });
    }
    /**
     * Get details about an invocation's status and output.
     *
     * @example
     * ```ts
     * const invocation = await client.invocations.retrieve(
     *   'rr33xuugxj9h0bkf1rdt2bet',
     * );
     * ```
     */
    retrieve(id, options) {
        return this._client.get((0, path_1.path) `/invocations/${id}`, options);
    }
    /**
     * Update an invocation's status or output. This can be used to cancel an
     * invocation by setting the status to "failed".
     *
     * @example
     * ```ts
     * const invocation = await client.invocations.update('id', {
     *   status: 'succeeded',
     * });
     * ```
     */
    update(id, body, options) {
        return this._client.patch((0, path_1.path) `/invocations/${id}`, { body, ...options });
    }
    /**
     * List invocations. Optionally filter by application name, action name, status,
     * deployment ID, or start time.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const invocationListResponse of client.invocations.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/invocations', (pagination_1.OffsetPagination), {
            query,
            ...options,
        });
    }
    /**
     * Delete all browser sessions created within the specified invocation.
     *
     * @example
     * ```ts
     * await client.invocations.deleteBrowsers('id');
     * ```
     */
    deleteBrowsers(id, options) {
        return this._client.delete((0, path_1.path) `/invocations/${id}/browsers`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: '*/*' }, options?.headers]),
        });
    }
    /**
     * Establishes a Server-Sent Events (SSE) stream that delivers real-time logs and
     * status updates for an invocation. The stream terminates automatically once the
     * invocation reaches a terminal state.
     *
     * @example
     * ```ts
     * const response = await client.invocations.follow('id');
     * ```
     */
    follow(id, query = {}, options) {
        return this._client.get((0, path_1.path) `/invocations/${id}/events`, {
            query,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: 'text/event-stream' }, options?.headers]),
            stream: true,
        });
    }
    /**
     * Returns all active browser sessions created within the specified invocation.
     *
     * @example
     * ```ts
     * const response = await client.invocations.listBrowsers(
     *   'id',
     * );
     * ```
     */
    listBrowsers(id, options) {
        return this._client.get((0, path_1.path) `/invocations/${id}/browsers`, options);
    }
}
exports.Invocations = Invocations;
//# sourceMappingURL=invocations.js.map