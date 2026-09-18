import { APIResource } from "../core/resource.mjs";
import { APIPromise } from "../core/api-promise.mjs";
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from "../core/pagination.mjs";
import { RequestOptions } from "../internal/request-options.mjs";
/**
 * Configure external credential providers like 1Password.
 */
export declare class CredentialProviders extends APIResource {
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
    create(body: CredentialProviderCreateParams, options?: RequestOptions): APIPromise<CredentialProvider>;
    /**
     * Retrieve a credential provider by its ID.
     *
     * @example
     * ```ts
     * const credentialProvider =
     *   await client.credentialProviders.retrieve('id');
     * ```
     */
    retrieve(id: string, options?: RequestOptions): APIPromise<CredentialProvider>;
    /**
     * Update a credential provider's configuration.
     *
     * @example
     * ```ts
     * const credentialProvider =
     *   await client.credentialProviders.update('id');
     * ```
     */
    update(id: string, body: CredentialProviderUpdateParams, options?: RequestOptions): APIPromise<CredentialProvider>;
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
    list(query?: CredentialProviderListParams | null | undefined, options?: RequestOptions): PagePromise<CredentialProvidersOffsetPagination, CredentialProvider>;
    /**
     * Delete a credential provider by its ID.
     *
     * @example
     * ```ts
     * await client.credentialProviders.delete('id');
     * ```
     */
    delete(id: string, options?: RequestOptions): APIPromise<void>;
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
    listItems(id: string, options?: RequestOptions): APIPromise<CredentialProviderListItemsResponse>;
    /**
     * Validate the credential provider's token and list accessible vaults.
     *
     * @example
     * ```ts
     * const credentialProviderTestResult =
     *   await client.credentialProviders.test('id');
     * ```
     */
    test(id: string, options?: RequestOptions): APIPromise<CredentialProviderTestResult>;
}
export type CredentialProvidersOffsetPagination = OffsetPagination<CredentialProvider>;
/**
 * Request to create an external credential provider
 */
export interface CreateCredentialProviderRequest {
    /**
     * Service account token for the provider (e.g., 1Password service account token)
     */
    token: string;
    /**
     * Human-readable name for this provider instance (unique per org). Surrounding
     * whitespace is trimmed and the trimmed value must be non-empty.
     */
    name: string;
    /**
     * Type of credential provider
     */
    provider_type: 'onepassword';
    /**
     * How long to cache credential lists (default 300 seconds)
     */
    cache_ttl_seconds?: number;
}
/**
 * An external credential provider (e.g., 1Password) for automatic credential
 * lookup
 */
export interface CredentialProvider {
    /**
     * Unique identifier for the credential provider
     */
    id: string;
    /**
     * When the credential provider was created
     */
    created_at: string;
    /**
     * Whether the provider is enabled for credential lookups
     */
    enabled: boolean;
    /**
     * Human-readable name for this provider instance
     */
    name: string;
    /**
     * Priority order for credential lookups (lower numbers are checked first)
     */
    priority: number;
    /**
     * Type of credential provider
     */
    provider_type: 'onepassword';
    /**
     * When the credential provider was last updated
     */
    updated_at: string;
}
/**
 * A credential item from an external provider (e.g., a 1Password login item)
 */
export interface CredentialProviderItem {
    /**
     * Unique identifier for the item within the provider
     */
    id: string;
    /**
     * Path to reference this item (VaultName/ItemTitle format)
     */
    path: string;
    /**
     * Display name of the credential item
     */
    title: string;
    /**
     * ID of the vault containing this item
     */
    vault_id: string;
    /**
     * Name of the vault containing this item
     */
    vault_name: string;
    /**
     * URLs associated with this credential
     */
    urls?: Array<string>;
}
/**
 * Result of testing a credential provider connection
 */
export interface CredentialProviderTestResult {
    /**
     * Whether the connection test was successful
     */
    success: boolean;
    /**
     * List of vaults accessible by the service account
     */
    vaults: Array<CredentialProviderTestResult.Vault>;
    /**
     * Error message if the test failed
     */
    error?: string;
}
export declare namespace CredentialProviderTestResult {
    interface Vault {
        /**
         * Vault ID
         */
        id: string;
        /**
         * Vault name
         */
        name: string;
    }
}
/**
 * Request to update a credential provider
 */
export interface UpdateCredentialProviderRequest {
    /**
     * New service account token (to rotate credentials)
     */
    token?: string;
    /**
     * How long to cache credential lists
     */
    cache_ttl_seconds?: number;
    /**
     * Whether the provider is enabled for credential lookups
     */
    enabled?: boolean;
    /**
     * Human-readable name for this provider instance. Surrounding whitespace is
     * trimmed and the trimmed value must be non-empty.
     */
    name?: string;
    /**
     * Priority order for credential lookups (lower numbers are checked first)
     */
    priority?: number;
}
export interface CredentialProviderListItemsResponse {
    items?: Array<CredentialProviderItem>;
}
export interface CredentialProviderCreateParams {
    /**
     * Service account token for the provider (e.g., 1Password service account token)
     */
    token: string;
    /**
     * Human-readable name for this provider instance (unique per org). Surrounding
     * whitespace is trimmed and the trimmed value must be non-empty.
     */
    name: string;
    /**
     * Type of credential provider
     */
    provider_type: 'onepassword';
    /**
     * How long to cache credential lists (default 300 seconds)
     */
    cache_ttl_seconds?: number;
}
export interface CredentialProviderUpdateParams {
    /**
     * New service account token (to rotate credentials)
     */
    token?: string;
    /**
     * How long to cache credential lists
     */
    cache_ttl_seconds?: number;
    /**
     * Whether the provider is enabled for credential lookups
     */
    enabled?: boolean;
    /**
     * Human-readable name for this provider instance. Surrounding whitespace is
     * trimmed and the trimmed value must be non-empty.
     */
    name?: string;
    /**
     * Priority order for credential lookups (lower numbers are checked first)
     */
    priority?: number;
}
export interface CredentialProviderListParams extends OffsetPaginationParams {
    /**
     * Case-insensitive substring match against credential provider name. IDs match by
     * exact value.
     */
    query?: string;
}
export declare namespace CredentialProviders {
    export { type CreateCredentialProviderRequest as CreateCredentialProviderRequest, type CredentialProvider as CredentialProvider, type CredentialProviderItem as CredentialProviderItem, type CredentialProviderTestResult as CredentialProviderTestResult, type UpdateCredentialProviderRequest as UpdateCredentialProviderRequest, type CredentialProviderListItemsResponse as CredentialProviderListItemsResponse, type CredentialProvidersOffsetPagination as CredentialProvidersOffsetPagination, type CredentialProviderCreateParams as CredentialProviderCreateParams, type CredentialProviderUpdateParams as CredentialProviderUpdateParams, type CredentialProviderListParams as CredentialProviderListParams, };
}
//# sourceMappingURL=credential-providers.d.mts.map