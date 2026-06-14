// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

/**
 * Create and manage API keys for organization and project-scoped access.
 */
export class APIKeys extends APIResource {
  /**
   * Create a new API key within the authenticated organization.
   *
   * @example
   * ```ts
   * const createdAPIKey = await client.apiKeys.create({
   *   name: 'staging',
   * });
   * ```
   */
  create(body: APIKeyCreateParams, options?: RequestOptions): APIPromise<CreatedAPIKey> {
    return this._client.post('/org/api_keys', { body, ...options });
  }

  /**
   * Retrieve an API key by ID for the authenticated organization. API keys are
   * masked.
   *
   * @example
   * ```ts
   * const apiKey = await client.apiKeys.retrieve('id');
   * ```
   */
  retrieve(
    id: string,
    query: APIKeyRetrieveParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<APIKey> {
    return this._client.get(path`/org/api_keys/${id}`, { query, ...options });
  }

  /**
   * Update an API key's name.
   *
   * @example
   * ```ts
   * const apiKey = await client.apiKeys.update('id', {
   *   name: 'new-api-name',
   * });
   * ```
   */
  update(id: string, body: APIKeyUpdateParams, options?: RequestOptions): APIPromise<APIKey> {
    return this._client.patch(path`/org/api_keys/${id}`, { body, ...options });
  }

  /**
   * List API keys for the authenticated organization. API keys are masked.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const apiKey of client.apiKeys.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: APIKeyListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<APIKeysOffsetPagination, APIKey> {
    return this._client.getAPIList('/org/api_keys', OffsetPagination<APIKey>, { query, ...options });
  }

  /**
   * Delete an API key.
   *
   * @example
   * ```ts
   * await client.apiKeys.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/org/api_keys/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Rotate an API key. Issues a new key that copies the name and project of the
   * rotated key, and schedules the rotated key to expire after a grace period so
   * in-flight callers can swap over. The new plaintext key is returned once.
   *
   * @example
   * ```ts
   * const createdAPIKey = await client.apiKeys.rotate('id');
   * ```
   */
  rotate(
    id: string,
    body: APIKeyRotateParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<CreatedAPIKey> {
    return this._client.post(path`/org/api_keys/${id}/rotate`, { body, ...options });
  }
}

export type APIKeysOffsetPagination = OffsetPagination<APIKey>;

export interface APIKey {
  /**
   * Unique API key identifier
   */
  id: string;

  /**
   * When the API key was created
   */
  created_at: string;

  created_by: APIKey.CreatedBy;

  /**
   * When the API key was deleted (soft-deleted). Null for keys that have not been
   * deleted.
   */
  deleted_at: string | null;

  /**
   * When the API key expires
   */
  expires_at: string | null;

  /**
   * Masked version of the API key
   */
  masked_key: string;

  /**
   * API key name
   */
  name: string;

  /**
   * Project identifier for project-scoped API keys. Null means org-wide.
   */
  project_id: string | null;

  /**
   * Project name for project-scoped API keys. Null means the key is org-wide or the
   * project name is unavailable.
   */
  project_name: string | null;

  /**
   * Derived lifecycle status of the API key. `active` means usable. `expired` means
   * past its expires_at. `deleted` means it was deleted (soft-deleted) and can no
   * longer authenticate. Deleted takes precedence over expired.
   */
  status: 'active' | 'expired' | 'deleted';
}

export namespace APIKey {
  export interface CreatedBy {
    /**
     * Kernel user ID of the creator.
     */
    id: string;

    /**
     * Email address of the creator.
     */
    email: string;

    /**
     * Display name of the creator, if available.
     */
    name: string | null;
  }
}

/**
 * API key returned immediately after creation. Includes the plaintext key once.
 */
export interface CreatedAPIKey extends APIKey {
  /**
   * Plaintext API key. Only returned once when the key is created.
   */
  key: string;
}

export interface APIKeyCreateParams {
  /**
   * API key name (1-255 characters)
   */
  name: string;

  /**
   * Number of days until expiry, up to 3650. Use null for never.
   */
  days_to_expire?: number | null;

  /**
   * Unique project identifier
   */
  project_id?: string | null;
}

export interface APIKeyRetrieveParams {
  /**
   * When true, return the API key even if it has been deleted (soft-deleted), for
   * audit purposes. Defaults to false, which returns 404 for a deleted key.
   */
  include_deleted?: boolean;
}

export interface APIKeyUpdateParams {
  /**
   * New API key name
   */
  name: string;
}

export interface APIKeyListParams extends OffsetPaginationParams {
  /**
   * When true, include deleted (soft-deleted) API keys in the results for audit
   * purposes. Defaults to false, which returns only live keys.
   */
  include_deleted?: boolean;

  /**
   * Case-insensitive substring match against API key name, creator, and project. API
   * key identifiers and masked keys match by exact value or prefix.
   */
  query?: string;

  /**
   * Field to sort API keys by.
   */
  sort_by?: 'created_at' | 'name' | 'expires_at';

  /**
   * Sort direction for API keys.
   */
  sort_direction?: 'asc' | 'desc';
}

export interface APIKeyRotateParams {
  /**
   * Lifetime in days for the new key, up to 3650. Omit to reuse the rotated key's
   * original lifetime, or never-expires if it had none.
   */
  days_to_expire?: number | null;

  /**
   * Grace period in days before the rotated key expires. Use 0 to expire it
   * immediately. Omit for the default grace period of 7 days.
   */
  expire_in_days?: number | null;
}

export declare namespace APIKeys {
  export {
    type APIKey as APIKey,
    type CreatedAPIKey as CreatedAPIKey,
    type APIKeysOffsetPagination as APIKeysOffsetPagination,
    type APIKeyCreateParams as APIKeyCreateParams,
    type APIKeyRetrieveParams as APIKeyRetrieveParams,
    type APIKeyUpdateParams as APIKeyUpdateParams,
    type APIKeyListParams as APIKeyListParams,
    type APIKeyRotateParams as APIKeyRotateParams,
  };
}
