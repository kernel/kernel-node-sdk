"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserPools = void 0;
const resource_1 = require("../core/resource.js");
const pagination_1 = require("../core/pagination.js");
const headers_1 = require("../internal/headers.js");
const path_1 = require("../internal/utils/path.js");
/**
 * Create and manage browser pools for acquiring and releasing browsers.
 */
class BrowserPools extends resource_1.APIResource {
    /**
     * Create a new browser pool with the specified configuration and size. Pooled
     * browsers load their profile read-only: any save_changes on the profile is
     * ignored (not rejected), so pooled browsers never persist changes back to the
     * profile.
     *
     * @example
     * ```ts
     * const browserPool = await client.browserPools.create({
     *   size: 10,
     * });
     * ```
     */
    create(body, options) {
        return this._client.post('/browser_pools', { body, ...options });
    }
    /**
     * Retrieve details for a single browser pool by its ID or name.
     *
     * @example
     * ```ts
     * const browserPool = await client.browserPools.retrieve(
     *   'id_or_name',
     * );
     * ```
     */
    retrieve(idOrName, options) {
        return this._client.get((0, path_1.path) `/browser_pools/${idOrName}`, options);
    }
    /**
     * Updates the configuration used to create browsers in the pool. As with creation,
     * save_changes on the pool profile is ignored (not rejected); pooled browsers
     * never persist changes back to the profile. To clear the profile reference, send
     * `profile: { "id": "" }`. Clearing the profile also disables
     * `refresh_on_profile_update`.
     *
     * @example
     * ```ts
     * const browserPool = await client.browserPools.update(
     *   'id_or_name',
     * );
     * ```
     */
    update(idOrName, body, options) {
        return this._client.patch((0, path_1.path) `/browser_pools/${idOrName}`, { body, ...options });
    }
    /**
     * List browser pools in the resolved project.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const browserPool of client.browserPools.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/browser_pools', (pagination_1.OffsetPagination), { query, ...options });
    }
    /**
     * Delete a browser pool and all browsers in it. By default, deletion is blocked if
     * browsers are currently leased. Use force=true to terminate leased browsers.
     *
     * @example
     * ```ts
     * await client.browserPools.delete('id_or_name');
     * ```
     */
    delete(idOrName, body = {}, options) {
        return this._client.delete((0, path_1.path) `/browser_pools/${idOrName}`, {
            body,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: '*/*' }, options?.headers]),
        });
    }
    /**
     * Long-polling endpoint to acquire a browser from the pool. Returns immediately
     * when a browser is available, or returns 204 No Content when the poll times out.
     * The client should retry the request to continue waiting for a browser. The
     * acquired browser will use the pool's timeout_seconds for its idle timeout.
     *
     * @example
     * ```ts
     * const response = await client.browserPools.acquire(
     *   'id_or_name',
     * );
     * ```
     */
    acquire(idOrName, body, options) {
        return this._client.post((0, path_1.path) `/browser_pools/${idOrName}/acquire`, { body, ...options });
    }
    /**
     * Destroys all idle browsers in the pool; leased browsers are not affected.
     *
     * @example
     * ```ts
     * await client.browserPools.flush('id_or_name');
     * ```
     */
    flush(idOrName, options) {
        return this._client.post((0, path_1.path) `/browser_pools/${idOrName}/flush`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: '*/*' }, options?.headers]),
        });
    }
    /**
     * Release a browser back to the pool, optionally recreating the browser instance.
     *
     * @example
     * ```ts
     * await client.browserPools.release('id_or_name', {
     *   session_id: 'ts8iy3sg25ibheguyni2lg9t',
     * });
     * ```
     */
    release(idOrName, body, options) {
        return this._client.post((0, path_1.path) `/browser_pools/${idOrName}/release`, {
            body,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: '*/*' }, options?.headers]),
        });
    }
}
exports.BrowserPools = BrowserPools;
//# sourceMappingURL=browser-pools.js.map