// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class WorkloadIdentityIssuers extends APIResource {
  /**
   * Organization credential administrators only. No external namespace-ownership or
   * staff approval is required. New trust resources default disabled.
   */
  create(
    body: WorkloadIdentityIssuerCreateParams,
    options?: RequestOptions,
  ): APIPromise<WorkloadIdentityIssuer> {
    return this._client.post('/org/workload_identity_issuers', { body, ...options });
  }

  /**
   * Any signed-in member of the organization can read this. API keys cannot.
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<WorkloadIdentityIssuer> {
    return this._client.get(path`/org/workload_identity_issuers/${id}`, options);
  }

  /**
   * Update a workload identity issuer
   */
  update(
    id: string,
    body: WorkloadIdentityIssuerUpdateParams,
    options?: RequestOptions,
  ): APIPromise<WorkloadIdentityIssuer> {
    return this._client.patch(path`/org/workload_identity_issuers/${id}`, { body, ...options });
  }

  /**
   * Any signed-in member of the organization can read this. API keys cannot.
   */
  list(
    query: WorkloadIdentityIssuerListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<WorkloadIdentityIssuersOffsetPagination, WorkloadIdentityIssuer> {
    return this._client.getAPIList(
      '/org/workload_identity_issuers',
      OffsetPagination<WorkloadIdentityIssuer>,
      { query, ...options },
    );
  }

  /**
   * Retains history and invalidates associated authority within the documented
   * status bound. Does not delete created browser resources.
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/org/workload_identity_issuers/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Read-only. Does not enable trust, approve namespace ownership, create a grant or
   * issue credentials.
   */
  verify(id: string, options?: RequestOptions): APIPromise<WorkloadIdentityIssuerKeyCheck> {
    return this._client.post(path`/org/workload_identity_issuers/${id}/verify`, options);
  }
}

export type WorkloadIdentityIssuersOffsetPagination = OffsetPagination<WorkloadIdentityIssuer>;

export interface WorkloadIdentityIssuer {
  id: string;

  archived_at: string | null;

  created_at: string;

  created_by_user_id: string | null;

  description: string;

  enabled: boolean;

  /**
   * Exact expected signed issuer. Optional for github_actions and google_cloud,
   * which each have one fixed issuer.
   */
  issuer_url: string;

  jwks: WorkloadIdentityKeySource;

  name: string;

  org_id: string;

  /**
   * The kind of identity provider. GitHub Actions, Google Cloud and Microsoft Entra
   * issuers are recognized by their issuer URL and must use their own type. Defaults
   * to the type the issuer URL belongs to, or custom_oidc.
   */
  preset_type: WorkloadIdentityPresetType;

  /**
   * Authority revision. Cosmetic updates do not widen permissions.
   */
  security_version: number;

  token_validation: WorkloadIdentityTokenValidation;

  updated_at: string;
}

export interface WorkloadIdentityIssuerConfig {
  name: string;

  description?: string;

  enabled?: boolean;

  /**
   * Exact expected signed issuer. Optional for github_actions and google_cloud,
   * which each have one fixed issuer.
   */
  issuer_url?: string;

  jwks?: WorkloadIdentityKeySource;

  /**
   * The kind of identity provider. GitHub Actions, Google Cloud and Microsoft Entra
   * issuers are recognized by their issuer URL and must use their own type. Defaults
   * to the type the issuer URL belongs to, or custom_oidc.
   */
  preset_type?: WorkloadIdentityPresetType;

  token_validation?: WorkloadIdentityTokenValidation;
}

export interface WorkloadIdentityIssuerKeyCheck {
  issuer_id: string;

  key_ids: Array<string>;
}

export interface WorkloadIdentityKeySource {
  type: 'discovery' | 'explicit_url' | 'inline';

  /**
   * Optional public CA certificates. When set, only these CAs are trusted for key
   * retrieval, in place of the system roots. Private keys and private-network
   * retrieval are not supported.
   */
  ca_cert_pem?: string;

  discovery_base_url?: string;

  keys?: Array<{ [key: string]: unknown }>;

  url?: string;
}

/**
 * The kind of identity provider. GitHub Actions, Google Cloud and Microsoft Entra
 * issuers are recognized by their issuer URL and must use their own type. Defaults
 * to the type the issuer URL belongs to, or custom_oidc.
 */
export type WorkloadIdentityPresetType =
  | 'github_actions'
  | 'aws'
  | 'google_cloud'
  | 'microsoft_entra'
  | 'kubernetes'
  | 'custom_oidc';

export interface WorkloadIdentityTokenValidation {
  /**
   * Maximum incoming signed exp minus iat, independent of outgoing token lifetime.
   * At most 172800 (48 hours), which covers Azure managed identity tokens that live
   * slightly over 24 hours.
   */
  max_lifetime_seconds?: number;

  /**
   * Whether an incoming token can be exchanged more than once before it expires.
   * Defaults to single_use for github_actions, aws, microsoft_entra and custom_oidc,
   * and to allow_reuse for kubernetes, because a pod reads the same projected token
   * until it is rotated. google_cloud is always allow_reuse because Google identity
   * tokens carry no token ID. allow_reuse can be set on microsoft_entra and
   * custom_oidc, and single_use on kubernetes. github_actions and aws are always
   * single_use.
   */
  replay_protection?: 'single_use' | 'allow_reuse';
}

export interface WorkloadIdentityIssuerCreateParams {
  name: string;

  description?: string;

  enabled?: boolean;

  /**
   * Exact expected signed issuer. Optional for github_actions and google_cloud,
   * which each have one fixed issuer.
   */
  issuer_url?: string;

  jwks?: WorkloadIdentityKeySource;

  /**
   * The kind of identity provider. GitHub Actions, Google Cloud and Microsoft Entra
   * issuers are recognized by their issuer URL and must use their own type. Defaults
   * to the type the issuer URL belongs to, or custom_oidc.
   */
  preset_type?: WorkloadIdentityPresetType;

  token_validation?: WorkloadIdentityTokenValidation;
}

export interface WorkloadIdentityIssuerUpdateParams {
  expected_version: number;

  description?: string;

  enabled?: boolean;

  /**
   * Exact expected signed issuer. Optional for github_actions and google_cloud,
   * which each have one fixed issuer.
   */
  issuer_url?: string;

  jwks?: WorkloadIdentityKeySource;

  name?: string;

  /**
   * The kind of identity provider. GitHub Actions, Google Cloud and Microsoft Entra
   * issuers are recognized by their issuer URL and must use their own type. Defaults
   * to the type the issuer URL belongs to, or custom_oidc.
   */
  preset_type?: WorkloadIdentityPresetType;

  token_validation?: WorkloadIdentityTokenValidation;
}

export interface WorkloadIdentityIssuerListParams extends OffsetPaginationParams {
  enabled?: boolean;

  /**
   * Case-insensitive substring match against name or description; exact ID match.
   */
  query?: string;

  status?: 'active' | 'archived' | 'all';
}

export declare namespace WorkloadIdentityIssuers {
  export {
    type WorkloadIdentityIssuer as WorkloadIdentityIssuer,
    type WorkloadIdentityIssuerConfig as WorkloadIdentityIssuerConfig,
    type WorkloadIdentityIssuerKeyCheck as WorkloadIdentityIssuerKeyCheck,
    type WorkloadIdentityKeySource as WorkloadIdentityKeySource,
    type WorkloadIdentityPresetType as WorkloadIdentityPresetType,
    type WorkloadIdentityTokenValidation as WorkloadIdentityTokenValidation,
    type WorkloadIdentityIssuersOffsetPagination as WorkloadIdentityIssuersOffsetPagination,
    type WorkloadIdentityIssuerCreateParams as WorkloadIdentityIssuerCreateParams,
    type WorkloadIdentityIssuerUpdateParams as WorkloadIdentityIssuerUpdateParams,
    type WorkloadIdentityIssuerListParams as WorkloadIdentityIssuerListParams,
  };
}
