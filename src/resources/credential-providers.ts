// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

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
  create(body: CredentialProviderCreateParams, options?: RequestOptions): APIPromise<CredentialProvider> {
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
  retrieve(id: string, options?: RequestOptions): APIPromise<CredentialProvider> {
    return this._client.get(path`/org/credential_providers/${id}`, options);
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
  update(
    id: string,
    body: CredentialProviderUpdateParams,
    options?: RequestOptions,
  ): APIPromise<CredentialProvider> {
    return this._client.patch(path`/org/credential_providers/${id}`, { body, ...options });
  }

  /**
   * List external credential providers configured for the organization.
   *
   * @example
   * ```ts
   * const credentialProviders =
   *   await client.credentialProviders.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<CredentialProviderListResponse> {
    return this._client.get('/org/credential_providers', options);
  }

  /**
   * Delete a credential provider by its ID.
   *
   * @example
   * ```ts
   * await client.credentialProviders.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/org/credential_providers/${id}`, {
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
  listItems(id: string, options?: RequestOptions): APIPromise<CredentialProviderListItemsResponse> {
    return this._client.get(path`/org/credential_providers/${id}/items`, options);
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
  test(id: string, options?: RequestOptions): APIPromise<CredentialProviderTestResult> {
    return this._client.post(path`/org/credential_providers/${id}/test`, options);
  }
}

/**
 * Request to create an external credential provider
 */
export interface CreateCredentialProviderRequest {
  /**
   * Service account token for the provider (e.g., 1Password service account token)
   */
  token: string;

  /**
   * Human-readable name for this provider instance (unique per org)
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

export namespace CredentialProviderTestResult {
  export interface Vault {
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
   * Human-readable name for this provider instance
   */
  name?: string;

  /**
   * Priority order for credential lookups (lower numbers are checked first)
   */
  priority?: number;
}

export type CredentialProviderListResponse = Array<CredentialProvider>;

export interface CredentialProviderListItemsResponse {
  items?: Array<CredentialProviderItem>;
}

export interface CredentialProviderCreateParams {
  /**
   * Service account token for the provider (e.g., 1Password service account token)
   */
  token: string;

  /**
   * Human-readable name for this provider instance (unique per org)
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
   * Human-readable name for this provider instance
   */
  name?: string;

  /**
   * Priority order for credential lookups (lower numbers are checked first)
   */
  priority?: number;
}

export declare namespace CredentialProviders {
  export {
    type CreateCredentialProviderRequest as CreateCredentialProviderRequest,
    type CredentialProvider as CredentialProvider,
    type CredentialProviderItem as CredentialProviderItem,
    type CredentialProviderTestResult as CredentialProviderTestResult,
    type UpdateCredentialProviderRequest as UpdateCredentialProviderRequest,
    type CredentialProviderListResponse as CredentialProviderListResponse,
    type CredentialProviderListItemsResponse as CredentialProviderListItemsResponse,
    type CredentialProviderCreateParams as CredentialProviderCreateParams,
    type CredentialProviderUpdateParams as CredentialProviderUpdateParams,
  };
}
