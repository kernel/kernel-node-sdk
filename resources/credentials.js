"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Credentials = void 0;
const resource_1 = require("../core/resource.js");
const pagination_1 = require("../core/pagination.js");
const headers_1 = require("../internal/headers.js");
const path_1 = require("../internal/utils/path.js");
/**
 * Create and manage credentials for authentication.
 */
class Credentials extends resource_1.APIResource {
    /**
     * Create a new credential for storing login information.
     *
     * @example
     * ```ts
     * const credential = await client.credentials.create({
     *   domain: 'netflix.com',
     *   name: 'my-netflix-login',
     *   values: {
     *     username: 'user@example.com',
     *     password: 'mysecretpassword',
     *   },
     * });
     * ```
     */
    create(body, options) {
        return this._client.post('/credentials', { body, ...options });
    }
    /**
     * Retrieve a credential by its ID or name. Credential values are not returned.
     *
     * @example
     * ```ts
     * const credential = await client.credentials.retrieve(
     *   'id_or_name',
     * );
     * ```
     */
    retrieve(idOrName, options) {
        return this._client.get((0, path_1.path) `/credentials/${idOrName}`, options);
    }
    /**
     * Update a credential's name or values. When values are provided, they are merged
     * with existing values (new keys are added, existing keys are overwritten).
     *
     * @example
     * ```ts
     * const credential = await client.credentials.update(
     *   'id_or_name',
     * );
     * ```
     */
    update(idOrName, body, options) {
        return this._client.patch((0, path_1.path) `/credentials/${idOrName}`, { body, ...options });
    }
    /**
     * List credentials in the resolved project. Credential values are not returned.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const credential of client.credentials.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/credentials', (pagination_1.OffsetPagination), { query, ...options });
    }
    /**
     * Delete a credential by its ID or name.
     *
     * @example
     * ```ts
     * await client.credentials.delete('id_or_name');
     * ```
     */
    delete(idOrName, options) {
        return this._client.delete((0, path_1.path) `/credentials/${idOrName}`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: '*/*' }, options?.headers]),
        });
    }
    /**
     * Returns the current 6-digit TOTP code for a credential with a configured
     * totp_secret. Use this to complete 2FA setup on sites or when you need a fresh
     * code.
     *
     * @example
     * ```ts
     * const response = await client.credentials.totpCode(
     *   'id_or_name',
     * );
     * ```
     */
    totpCode(idOrName, options) {
        return this._client.get((0, path_1.path) `/credentials/${idOrName}/totp-code`, options);
    }
}
exports.Credentials = Credentials;
//# sourceMappingURL=credentials.js.map