// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class WorkloadIdentityFederationRules extends APIResource {
  /**
   * Organization credential administrators only. No external namespace-ownership or
   * staff approval is required. New trust resources default disabled.
   */
  create(
    body: WorkloadIdentityFederationRuleCreateParams,
    options?: RequestOptions,
  ): APIPromise<WorkloadIdentityFederationRule> {
    return this._client.post('/org/workload_identity_federation_rules', { body, ...options });
  }

  /**
   * Any signed-in member of the organization can read this. API keys cannot.
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<WorkloadIdentityFederationRule> {
    return this._client.get(path`/org/workload_identity_federation_rules/${id}`, options);
  }

  /**
   * Update a workload identity federation rule
   */
  update(
    id: string,
    body: WorkloadIdentityFederationRuleUpdateParams,
    options?: RequestOptions,
  ): APIPromise<WorkloadIdentityFederationRule> {
    return this._client.patch(path`/org/workload_identity_federation_rules/${id}`, { body, ...options });
  }

  /**
   * Any signed-in member of the organization can read this. API keys cannot.
   */
  list(
    query: WorkloadIdentityFederationRuleListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<WorkloadIdentityFederationRulesOffsetPagination, WorkloadIdentityFederationRule> {
    return this._client.getAPIList(
      '/org/workload_identity_federation_rules',
      OffsetPagination<WorkloadIdentityFederationRule>,
      { query, ...options },
    );
  }

  /**
   * Retains history and invalidates associated authority within the documented
   * status bound. Does not delete created browser resources.
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/org/workload_identity_federation_rules/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export type WorkloadIdentityFederationRulesOffsetPagination =
  OffsetPagination<WorkloadIdentityFederationRule>;

export interface WorkloadIdentityAuthorization {
  /**
   * Allow statements for resources in this rule's project, in the same format as a
   * scoped API key policy. API key actions are not allowed.
   */
  policy: WorkloadIdentityAuthorization.Policy;

  /**
   * The one project credentials from this rule are limited to.
   */
  project_id: string;

  token_audience: string;

  max_token_ttl_seconds?: number;
}

export namespace WorkloadIdentityAuthorization {
  /**
   * Allow statements for resources in this rule's project, in the same format as a
   * scoped API key policy. API key actions are not allowed.
   */
  export interface Policy {
    /**
     * Allow statements. Every action and resource not listed is denied.
     */
    statements: Array<Policy.Statement>;
  }

  export namespace Policy {
    export interface Statement {
      /**
       * Permitted action, such as browsers:use or vaults:read.
       */
      action: string;

      /**
       * Resource the action applies to, in the format projects/{project_id}/{kind}/{id}.
       * Wildcards are supported.
       */
      resource: string;

      /**
       * A condition narrows a policy statement to requests matching its constraint: the
       * request attribute, a comparison operator, and that operator's values.
       */
      condition?: Statement.Condition;
    }

    export namespace Statement {
      /**
       * A condition narrows a policy statement to requests matching its constraint: the
       * request attribute, a comparison operator, and that operator's values.
       */
      export interface Condition {
        /**
         * Request attribute the condition constrains. `source_ip` restricts the statement
         * to requests whose client address falls inside one of `values`.
         */
        key: 'source_ip';

        /**
         * Comparison the condition applies between the request attribute and values.
         */
        operator: 'in';

        /**
         * Values the request attribute must match. For `source_ip`, CIDR networks: a bare
         * address without a mask is rejected, and so are an entry with host bits set and
         * an IPv4 network written in IPv6 notation.
         */
        values: Array<string>;
      }
    }
  }
}

export interface WorkloadIdentityFederationRule {
  id: string;

  archived_at: string | null;

  authorization: WorkloadIdentityAuthorization;

  created_at: string;

  created_by_user_id: string | null;

  description: string;

  enabled: boolean;

  expected_audience: string;

  issuer_id: string;

  last_exchange_at: string | null;

  match: WorkloadIdentityMatch;

  name: string;

  org_id: string;

  /**
   * Authority revision. Cosmetic updates do not widen permissions.
   */
  security_version: number;

  target: WorkloadIdentityTarget;

  updated_at: string;
}

export interface WorkloadIdentityFederationRuleConfig {
  authorization: WorkloadIdentityAuthorization;

  expected_audience: string;

  issuer_id: string;

  match: WorkloadIdentityMatch;

  name: string;

  target: WorkloadIdentityTarget;

  description?: string;

  enabled?: boolean;
}

export interface WorkloadIdentityMatch {
  /**
   * Must be the issuer's preset_type.
   */
  type: 'github_actions' | 'aws' | 'google_cloud' | 'microsoft_entra' | 'kubernetes' | 'custom_oidc';

  /**
   * Exact string conditions keyed by RFC 6901 JSON Pointers. All conditions are
   * ANDed.
   */
  claims?: { [key: string]: string };

  environment?: string;

  event_names?: Array<string>;

  job_workflow_ref?: string;

  namespace?: string;

  ref?: string;

  /**
   * Friendly display name. Immutable IDs define the repository identity.
   */
  repository?: string;

  repository_id?: string;

  repository_owner_id?: string;

  service_account?: string;

  subject?: string;

  subject_prefix?: string;

  workflow?: string;

  workflow_ref?: string;
}

export interface WorkloadIdentityTarget {
  service_account_id: string;

  type: 'service_account';
}

export interface WorkloadIdentityFederationRuleCreateParams {
  authorization: WorkloadIdentityAuthorization;

  expected_audience: string;

  issuer_id: string;

  match: WorkloadIdentityMatch;

  name: string;

  target: WorkloadIdentityTarget;

  description?: string;

  enabled?: boolean;
}

export interface WorkloadIdentityFederationRuleUpdateParams {
  expected_version: number;

  authorization?: WorkloadIdentityAuthorization;

  description?: string;

  enabled?: boolean;

  expected_audience?: string;

  issuer_id?: string;

  match?: WorkloadIdentityMatch;

  name?: string;

  target?: WorkloadIdentityTarget;
}

export interface WorkloadIdentityFederationRuleListParams extends OffsetPaginationParams {
  issuer_id?: string;

  project_id?: string;

  /**
   * Case-insensitive substring match against name or description; exact ID match.
   */
  query?: string;

  service_account_id?: string;

  status?: 'active' | 'archived' | 'all';
}

export declare namespace WorkloadIdentityFederationRules {
  export {
    type WorkloadIdentityAuthorization as WorkloadIdentityAuthorization,
    type WorkloadIdentityFederationRule as WorkloadIdentityFederationRule,
    type WorkloadIdentityFederationRuleConfig as WorkloadIdentityFederationRuleConfig,
    type WorkloadIdentityMatch as WorkloadIdentityMatch,
    type WorkloadIdentityTarget as WorkloadIdentityTarget,
    type WorkloadIdentityFederationRulesOffsetPagination as WorkloadIdentityFederationRulesOffsetPagination,
    type WorkloadIdentityFederationRuleCreateParams as WorkloadIdentityFederationRuleCreateParams,
    type WorkloadIdentityFederationRuleUpdateParams as WorkloadIdentityFederationRuleUpdateParams,
    type WorkloadIdentityFederationRuleListParams as WorkloadIdentityFederationRuleListParams,
  };
}
