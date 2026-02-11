// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Credentials extends APIResource {
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
  create(body: CredentialCreateParams, options?: RequestOptions): APIPromise<Credential> {
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
  retrieve(idOrName: string, options?: RequestOptions): APIPromise<Credential> {
    return this._client.get(path`/credentials/${idOrName}`, options);
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
  update(idOrName: string, body: CredentialUpdateParams, options?: RequestOptions): APIPromise<Credential> {
    return this._client.patch(path`/credentials/${idOrName}`, { body, ...options });
  }

  /**
   * List credentials owned by the caller's organization. Credential values are not
   * returned.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const credential of client.credentials.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: CredentialListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<CredentialsOffsetPagination, Credential> {
    return this._client.getAPIList('/credentials', OffsetPagination<Credential>, { query, ...options });
  }

  /**
   * Delete a credential by its ID or name.
   *
   * @example
   * ```ts
   * await client.credentials.delete('id_or_name');
   * ```
   */
  delete(idOrName: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/credentials/${idOrName}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
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
  totpCode(idOrName: string, options?: RequestOptions): APIPromise<CredentialTotpCodeResponse> {
    return this._client.get(path`/credentials/${idOrName}/totp-code`, options);
  }
}

export type CredentialsOffsetPagination = OffsetPagination<Credential>;

/**
 * Request to create a new credential
 */
export interface CreateCredentialRequest {
  /**
   * Target domain this credential is for
   */
  domain: string;

  /**
   * Unique name for the credential within the organization
   */
  name: string;

  /**
   * Field name to value mapping (e.g., username, password)
   */
  values: { [key: string]: string };

  /**
   * If set, indicates this credential should be used with the specified SSO provider
   * (e.g., google, github, microsoft). When the target site has a matching SSO
   * button, it will be clicked first before filling credential values on the
   * identity provider's login page.
   */
  sso_provider?: string;

  /**
   * Base32-encoded TOTP secret for generating one-time passwords. Used for automatic
   * 2FA during login.
   */
  totp_secret?: string;
}

/**
 * A stored credential for automatic re-authentication
 */
export interface Credential {
  /**
   * Unique identifier for the credential
   */
  id: string;

  /**
   * When the credential was created
   */
  created_at: string;

  /**
   * Target domain this credential is for
   */
  domain: string;

  /**
   * Unique name for the credential within the organization
   */
  name: string;

  /**
   * When the credential was last updated
   */
  updated_at: string;

  /**
   * Whether this credential has a TOTP secret configured for automatic 2FA
   */
  has_totp_secret?: boolean;

  /**
   * Whether this credential has stored values (email, password, etc.)
   */
  has_values?: boolean;

  /**
   * If set, indicates this credential should be used with the specified SSO provider
   * (e.g., google, github, microsoft). When the target site has a matching SSO
   * button, it will be clicked first before filling credential values on the
   * identity provider's login page.
   */
  sso_provider?: string | null;

  /**
   * Current 6-digit TOTP code. Only included in create/update responses when
   * totp_secret was just set.
   */
  totp_code?: string;

  /**
   * When the totp_code expires. Only included when totp_code is present.
   */
  totp_code_expires_at?: string;
}

/**
 * Request to update an existing credential
 */
export interface UpdateCredentialRequest {
  /**
   * New name for the credential
   */
  name?: string;

  /**
   * If set, indicates this credential should be used with the specified SSO
   * provider. Set to empty string or null to remove.
   */
  sso_provider?: string | null;

  /**
   * Base32-encoded TOTP secret for generating one-time passwords. Spaces and
   * formatting are automatically normalized. Set to empty string to remove.
   */
  totp_secret?: string;

  /**
   * Field name to value mapping. Values are merged with existing values (new keys
   * added, existing keys overwritten).
   */
  values?: { [key: string]: string };
}

export interface CredentialTotpCodeResponse {
  /**
   * Current 6-digit TOTP code
   */
  code: string;

  /**
   * When this code expires (ISO 8601 timestamp)
   */
  expires_at: string;
}

export interface CredentialCreateParams {
  /**
   * Target domain this credential is for
   */
  domain: string;

  /**
   * Unique name for the credential within the organization
   */
  name: string;

  /**
   * Field name to value mapping (e.g., username, password)
   */
  values: { [key: string]: string };

  /**
   * If set, indicates this credential should be used with the specified SSO provider
   * (e.g., google, github, microsoft). When the target site has a matching SSO
   * button, it will be clicked first before filling credential values on the
   * identity provider's login page.
   */
  sso_provider?: string;

  /**
   * Base32-encoded TOTP secret for generating one-time passwords. Used for automatic
   * 2FA during login.
   */
  totp_secret?: string;
}

export interface CredentialUpdateParams {
  /**
   * New name for the credential
   */
  name?: string;

  /**
   * If set, indicates this credential should be used with the specified SSO
   * provider. Set to empty string or null to remove.
   */
  sso_provider?: string | null;

  /**
   * Base32-encoded TOTP secret for generating one-time passwords. Spaces and
   * formatting are automatically normalized. Set to empty string to remove.
   */
  totp_secret?: string;

  /**
   * Field name to value mapping. Values are merged with existing values (new keys
   * added, existing keys overwritten).
   */
  values?: { [key: string]: string };
}

export interface CredentialListParams extends OffsetPaginationParams {
  /**
   * Filter by domain
   */
  domain?: string;
}

export declare namespace Credentials {
  export {
    type CreateCredentialRequest as CreateCredentialRequest,
    type Credential as Credential,
    type UpdateCredentialRequest as UpdateCredentialRequest,
    type CredentialTotpCodeResponse as CredentialTotpCodeResponse,
    type CredentialsOffsetPagination as CredentialsOffsetPagination,
    type CredentialCreateParams as CredentialCreateParams,
    type CredentialUpdateParams as CredentialUpdateParams,
    type CredentialListParams as CredentialListParams,
  };
}
