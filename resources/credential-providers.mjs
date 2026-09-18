// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../core/resource.mjs";
import { OffsetPagination } from "../core/pagination.mjs";
import { buildHeaders } from "../internal/headers.mjs";
import { path } from "../internal/utils/path.mjs";
/**
 * Configure external credential providers like 1Password.
 */
export class CredentialProviders extends APIResource {
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
        return this._client.get(path `/org/credential_providers/${id}`, options);
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
        return this._client.patch(path `/org/credential_providers/${id}`, { body, ...options });
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
        return this._client.getAPIList('/org/credential_providers', (OffsetPagination), {
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
        return this._client.delete(path `/org/credential_providers/${id}`, {
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
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
        return this._client.get(path `/org/credential_providers/${id}/items`, options);
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
        return this._client.post(path `/org/credential_providers/${id}/test`, options);
    }
}
//# sourceMappingURL=credential-providers.mjs.map