// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../core/resource.mjs";
import { OffsetPagination } from "../core/pagination.mjs";
import { buildHeaders } from "../internal/headers.mjs";
import { path } from "../internal/utils/path.mjs";
/**
 * Create and manage proxy configurations for routing browser traffic.
 */
export class Proxies extends APIResource {
    /**
     * Create a new proxy configuration in the resolved project.
     *
     * @example
     * ```ts
     * const proxy = await client.proxies.create({
     *   type: 'datacenter',
     * });
     * ```
     */
    create(body, options) {
        return this._client.post('/proxies', { body, ...options });
    }
    /**
     * Retrieve a proxy in the resolved project by ID.
     *
     * @example
     * ```ts
     * const proxy = await client.proxies.retrieve('id');
     * ```
     */
    retrieve(id, options) {
        return this._client.get(path `/proxies/${id}`, options);
    }
    /**
     * Update a proxy's name. Proxy names are not unique and are not ID-or-name
     * addressable on this endpoint; duplicate names are allowed. Name-based
     * session-create lookups can remain ambiguous until callers resolve proxies by ID
     * or the API adds a stronger uniqueness contract.
     *
     * @example
     * ```ts
     * const proxy = await client.proxies.update('id', {
     *   name: 'my-renamed-proxy',
     * });
     * ```
     */
    update(id, body, options) {
        return this._client.patch(path `/proxies/${id}`, { body, ...options });
    }
    /**
     * List proxies in the resolved project.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const proxyListResponse of client.proxies.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/proxies', (OffsetPagination), { query, ...options });
    }
    /**
     * Soft delete a proxy. Session records referencing it are not modified. If egress
     * binding polling is enabled, existing tunnels for active sessions using the proxy
     * are terminated within one polling interval; subsequent connections through the
     * deleted proxy are rejected.
     *
     * @example
     * ```ts
     * await client.proxies.delete('id');
     * ```
     */
    delete(id, options) {
        return this._client.delete(path `/proxies/${id}`, {
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
    /**
     * Run a health check on the proxy to verify it's working. Optionally specify a URL
     * to test reachability against a specific target. For ISP and datacenter proxies,
     * this reliably tests whether the target site is reachable from the proxy's stable
     * exit IP. For residential and mobile proxies, the exit node varies between
     * requests, so this validates proxy configuration and connectivity rather than
     * guaranteeing site-specific reachability.
     *
     * @example
     * ```ts
     * const response = await client.proxies.check('id');
     * ```
     */
    check(id, body = {}, options) {
        return this._client.post(path `/proxies/${id}/check`, { body, ...options });
    }
}
//# sourceMappingURL=proxies.mjs.map