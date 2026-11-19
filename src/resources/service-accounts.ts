// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class ServiceAccounts extends APIResource {
  /**
   * Organization credential administrators only. No external namespace-ownership or
   * staff approval is required. New trust resources default disabled.
   */
  create(body: ServiceAccountCreateParams, options?: RequestOptions): APIPromise<ServiceAccount> {
    return this._client.post('/org/service_accounts', { body, ...options });
  }

  /**
   * Any signed-in member of the organization can read this. API keys cannot.
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<ServiceAccount> {
    return this._client.get(path`/org/service_accounts/${id}`, options);
  }

  /**
   * Update a service account
   */
  update(id: string, body: ServiceAccountUpdateParams, options?: RequestOptions): APIPromise<ServiceAccount> {
    return this._client.patch(path`/org/service_accounts/${id}`, { body, ...options });
  }

  /**
   * Any signed-in member of the organization can read this. API keys cannot.
   */
  list(
    query: ServiceAccountListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<ServiceAccountsOffsetPagination, ServiceAccount> {
    return this._client.getAPIList('/org/service_accounts', OffsetPagination<ServiceAccount>, {
      query,
      ...options,
    });
  }

  /**
   * Retains history and invalidates associated authority within the documented
   * status bound. Does not delete created browser resources.
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/org/service_accounts/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export type ServiceAccountsOffsetPagination = OffsetPagination<ServiceAccount>;

export interface ServiceAccount {
  id: string;

  archived_at: string | null;

  created_at: string;

  created_by_user_id: string | null;

  description: string;

  /**
   * When one of the account's API keys last authenticated or one of its rules last
   * issued a token. Recorded at most once every 15 minutes, so it can lag. Null if
   * the account has never been used.
   */
  last_used_at: string | null;

  name: string;

  org_id: string;

  /**
   * Authority revision. Cosmetic updates do not widen permissions.
   */
  security_version: number;

  updated_at: string;
}

export interface ServiceAccountConfig {
  name: string;

  description?: string;
}

export interface ServiceAccountCreateParams {
  name: string;

  description?: string;
}

export interface ServiceAccountUpdateParams {
  expected_version: number;

  description?: string;

  name?: string;
}

export interface ServiceAccountListParams extends OffsetPaginationParams {
  /**
   * Case-insensitive substring match against name or description; exact ID match.
   */
  query?: string;

  status?: 'active' | 'archived' | 'all';
}

export declare namespace ServiceAccounts {
  export {
    type ServiceAccount as ServiceAccount,
    type ServiceAccountConfig as ServiceAccountConfig,
    type ServiceAccountsOffsetPagination as ServiceAccountsOffsetPagination,
    type ServiceAccountCreateParams as ServiceAccountCreateParams,
    type ServiceAccountUpdateParams as ServiceAccountUpdateParams,
    type ServiceAccountListParams as ServiceAccountListParams,
  };
}
