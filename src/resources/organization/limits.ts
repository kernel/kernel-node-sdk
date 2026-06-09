// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

/**
 * Read and manage organization-level limits.
 */
export class Limits extends APIResource {
  /**
   * Get the organization's concurrent session ceiling and the default per-project
   * concurrency cap applied to projects without an explicit override.
   */
  retrieve(options?: RequestOptions): APIPromise<OrgLimits> {
    return this._client.get('/org/limits', options);
  }

  /**
   * Set the default per-project concurrency cap applied to projects without an
   * explicit override. Set the value to 0 to remove the default; omit to leave it
   * unchanged. The default cannot exceed the organization's concurrent session
   * ceiling.
   */
  update(body: LimitUpdateParams, options?: RequestOptions): APIPromise<OrgLimits> {
    return this._client.patch('/org/limits', { body, ...options });
  }
}

export interface OrgLimits {
  /**
   * Default maximum concurrent browser sessions applied to every project that has no
   * explicit per-project override. Null means no org-level default, so such projects
   * are uncapped (only the org-wide limit applies). Applies to existing and newly
   * created projects.
   */
  default_project_max_concurrent_sessions?: number | null;

  /**
   * The organization's effective concurrent browser session ceiling, from its plan
   * or an override. Read-only and shared across all projects in the org; a
   * per-project default cannot exceed it.
   */
  max_concurrent_sessions?: number;
}

export interface UpdateOrgLimitsRequest {
  /**
   * Default maximum concurrent browser sessions for projects without an explicit
   * override. Set to 0 to remove the default; omit to leave unchanged. Cannot exceed
   * the organization's concurrent session ceiling.
   */
  default_project_max_concurrent_sessions?: number | null;
}

export interface LimitUpdateParams {
  /**
   * Default maximum concurrent browser sessions for projects without an explicit
   * override. Set to 0 to remove the default; omit to leave unchanged. Cannot exceed
   * the organization's concurrent session ceiling.
   */
  default_project_max_concurrent_sessions?: number | null;
}

export declare namespace Limits {
  export {
    type OrgLimits as OrgLimits,
    type UpdateOrgLimitsRequest as UpdateOrgLimitsRequest,
    type LimitUpdateParams as LimitUpdateParams,
  };
}
