"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialProviders = void 0;
const resource_1 = require("../core/resource.js");
const pagination_1 = require("../core/pagination.js");
const headers_1 = require("../internal/headers.js");
const path_1 = require("../internal/utils/path.js");
/**
 * Configure external credential providers like 1Password.
 */
class CredentialProviders extends resource_1.APIResource {
    /**
     * Configure an external credential provider (e.g., 1Password) for automatic
     * credential lookup.
     *
     * @example
     * ```ts
     * const credentialProvider =
     *   await client.credentialProviders.create({
     *     token: 'ops_eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
     *     name: 'my-1password',
     *     provider_type: 'onepassword',
     *   });
     * ```
     */
    create(body, options) {
        return this._client.post('/org/credential_providers', { body, ...options });
    }
    /**
     * Retrieve a credential provider by its ID.
     *
     * @example
     * ```ts
     * const credentialProvider =
     *   await client.credentialProviders.retrieve('id');
     * ```
     */
    retrieve(id, options) {
        return this._client.get((0, path_1.path) `/org/credential_providers/${id}`, options);
    }
    /**
     * Update a credential provider's configuration.
     *
     * @example
     * ```ts
     * const credentialProvider =
     *   await client.credentialProviders.update('id');
     * ```
     */
    update(id, body, options) {
        return this._client.patch((0, path_1.path) `/org/credential_providers/${id}`, { body, ...options });
    }
    /**
     * List external credential providers configured for the organization.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const credentialProvider of client.credentialProviders.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/org/credential_providers', (pagination_1.OffsetPagination), {
            query,
            ...options,
        });
    }
    /**
     * Delete a credential provider by its ID.
     *
     * @example
     * ```ts
     * await client.credentialProviders.delete('id');
     * ```
     */
    delete(id, options) {
        return this._client.delete((0, path_1.path) `/org/credential_providers/${id}`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: '*/*' }, options?.headers]),
        });
    }
    /**
     * Returns available credential items (e.g., 1Password login items) from the
     * provider.
     *
     * @example
     * ```ts
     * const response = await client.credentialProviders.listItems(
     *   'id',
     * );
     * ```
     */
    listItems(id, options) {
        return this._client.get((0, path_1.path) `/org/credential_providers/${id}/items`, options);
    }
    /**
     * Validate the credential provider's token and list accessible vaults.
     *
     * @example
     * ```ts
     * const credentialProviderTestResult =
     *   await client.credentialProviders.test('id');
     * ```
     */
    test(id, options) {
        return this._client.post((0, path_1.path) `/org/credential_providers/${id}/test`, options);
    }
}
exports.CredentialProviders = CredentialProviders;
//# sourceMappingURL=credential-providers.js.map