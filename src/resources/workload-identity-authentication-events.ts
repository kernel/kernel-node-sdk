// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';

export class WorkloadIdentityAuthenticationEvents extends APIResource {
  /**
   * Any signed-in member of the organization can read this. API keys cannot.
   */
  list(
    query: WorkloadIdentityAuthenticationEventListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<WorkloadIdentityAuthenticationEventsOffsetPagination, WorkloadIdentityAuthenticationEvent> {
    return this._client.getAPIList(
      '/org/workload_identity_authentication_events',
      OffsetPagination<WorkloadIdentityAuthenticationEvent>,
      { query, ...options },
    );
  }
}

export type WorkloadIdentityAuthenticationEventsOffsetPagination =
  OffsetPagination<WorkloadIdentityAuthenticationEvent>;

export interface WorkloadIdentityAuthenticationEvent {
  id: string;

  correlation_id: string;

  created_at: string;

  credential_id: string | null;

  federation_rule_id: string | null;

  issuer_id: string | null;

  org_id: string;

  outcome: 'success' | 'failure';

  project_id: string | null;

  reason: string;

  service_account_id: string | null;
}

export interface WorkloadIdentityAuthenticationEventListParams extends OffsetPaginationParams {
  end_time?: string;

  federation_rule_id?: string;

  issuer_id?: string;

  outcome?: 'success' | 'failure';

  project_id?: string;

  service_account_id?: string;

  start_time?: string;
}

export declare namespace WorkloadIdentityAuthenticationEvents {
  export {
    type WorkloadIdentityAuthenticationEvent as WorkloadIdentityAuthenticationEvent,
    type WorkloadIdentityAuthenticationEventsOffsetPagination as WorkloadIdentityAuthenticationEventsOffsetPagination,
    type WorkloadIdentityAuthenticationEventListParams as WorkloadIdentityAuthenticationEventListParams,
  };
}
