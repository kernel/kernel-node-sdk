"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultProviderConfigs = void 0;
const resource_1 = require("../core/resource.js");
const pagination_1 = require("../core/pagination.js");
const headers_1 = require("../internal/headers.js");
const path_1 = require("../internal/utils/path.js");
class VaultProviderConfigs extends resource_1.APIResource {
    /**
     * Register a configuration shared across the organization's projects. Names are
     * unique within the organization; duplicate names return 409 without replacing
     * credentials. A configuration serves many wallets. Secret credentials are never
     * returned. Requires an organization-scoped credential or dashboard
     * authentication; project-scoped credentials receive 403.
     *
     * @example
     * ```ts
     * const vaultProviderConfig =
     *   await client.vaultProviderConfigs.create({
     *     credentials: {
     *       client_id: 'example-client-id',
     *       client_secret: 'example-client-secret',
     *     },
     *     name: 'my-link-client',
     *     provider: 'link',
     *   });
     * ```
     */
    create(body, options) {
        return this._client.post('/vault-provider-configs', { body, ...options });
    }
    /**
     * Look up a configuration by ID or name. Returns 404 when it does not exist in the
     * organization.
     *
     * @example
     * ```ts
     * const vaultProviderConfig =
     *   await client.vaultProviderConfigs.retrieve('id_or_name');
     * ```
     */
    retrieve(idOrName, options) {
        return this._client.get((0, path_1.path) `/vault-provider-configs/${idOrName}`, options);
    }
    /**
     * Update the supplied fields; omitted fields remain unchanged. Names must remain
     * unique within the organization. Requires an organization-scoped credential or
     * dashboard authentication; project-scoped credentials receive 403.
     *
     * @example
     * ```ts
     * const vaultProviderConfig =
     *   await client.vaultProviderConfigs.update('id_or_name', {
     *     name: 'renamed-link-client',
     *   });
     * ```
     */
    update(idOrName, body, options) {
        return this._client.patch((0, path_1.path) `/vault-provider-configs/${idOrName}`, { body, ...options });
    }
    /**
     * Secret credentials are never returned.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const vaultProviderConfig of client.vaultProviderConfigs.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/vault-provider-configs', (pagination_1.OffsetPagination), {
            query,
            ...options,
        });
    }
    /**
     * Delete a configuration in the organization. Returns 409 while any non-deleted
     * vault item references the configuration, regardless of connection status. Does
     * not delete the external OAuth client or revoke unrelated grants. Requires an
     * organization-scoped credential or dashboard authentication; project-scoped
     * credentials receive 403.
     *
     * @example
     * ```ts
     * await client.vaultProviderConfigs.delete('id_or_name');
     * ```
     */
    delete(idOrName, options) {
        return this._client.delete((0, path_1.path) `/vault-provider-configs/${idOrName}`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: '*/*' }, options?.headers]),
        });
    }
}
exports.VaultProviderConfigs = VaultProviderConfigs;
//# sourceMappingURL=vault-provider-configs.js.map