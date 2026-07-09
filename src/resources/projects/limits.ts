// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Create and manage projects for resource isolation within an organization.
 */
export class Limits extends APIResource {
  /**
   * Get the resource limit overrides for a project. Null values mean no
   * project-level cap (org limit applies).
   *
   * @example
   * ```ts
   * const projectLimits = await client.projects.limits.retrieve(
   *   'id',
   * );
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<ProjectLimits> {
    return this._client.get(path`/org/projects/${id}/limits`, options);
  }

  /**
   * Update resource limit overrides for a project. Only fields present in the
   * request are modified. Set a field to 0 to remove that limit cap; omit a field to
   * leave it unchanged.
   *
   * @example
   * ```ts
   * const projectLimits = await client.projects.limits.update(
   *   'id',
   * );
   * ```
   */
  update(id: string, body: LimitUpdateParams, options?: RequestOptions): APIPromise<ProjectLimits> {
    return this._client.patch(path`/org/projects/${id}/limits`, { body, ...options });
  }
}

export interface ProjectLimits {
  /**
   * Maximum concurrent app invocations for this project. Null means no project-level
   * cap.
   */
  max_concurrent_invocations?: number | null;

  /**
   * Maximum concurrent browsers for this project, covering both on-demand sessions
   * (`browsers.create()`) and browser pool reservations. Null means no project-level
   * cap.
   */
  max_concurrent_sessions?: number | null;

  /**
   * @deprecated Deprecated: pooled browsers now count toward
   * `max_concurrent_sessions`. Always null once the unified concurrency limit is
   * enabled for your organization.
   */
  max_pooled_sessions?: number | null;
}

export interface UpdateProjectLimitsRequest {
  /**
   * Maximum concurrent app invocations for this project. Set to 0 to remove the cap;
   * omit to leave unchanged.
   */
  max_concurrent_invocations?: number | null;

  /**
   * Maximum concurrent browsers for this project, covering both on-demand sessions
   * and browser pool reservations. Set to 0 to remove the cap; omit to leave
   * unchanged.
   */
  max_concurrent_sessions?: number | null;

  /**
   * @deprecated Deprecated: pooled browsers now count toward
   * `max_concurrent_sessions`. Requests that set this field are rejected with a 400
   * once the unified concurrency limit is enabled for your organization.
   */
  max_pooled_sessions?: number | null;
}

export interface LimitUpdateParams {
  /**
   * Maximum concurrent app invocations for this project. Set to 0 to remove the cap;
   * omit to leave unchanged.
   */
  max_concurrent_invocations?: number | null;

  /**
   * Maximum concurrent browsers for this project, covering both on-demand sessions
   * and browser pool reservations. Set to 0 to remove the cap; omit to leave
   * unchanged.
   */
  max_concurrent_sessions?: number | null;

  /**
   * @deprecated Deprecated: pooled browsers now count toward
   * `max_concurrent_sessions`. Requests that set this field are rejected with a 400
   * once the unified concurrency limit is enabled for your organization.
   */
  max_pooled_sessions?: number | null;
}

export declare namespace Limits {
  export {
    type ProjectLimits as ProjectLimits,
    type UpdateProjectLimitsRequest as UpdateProjectLimitsRequest,
    type LimitUpdateParams as LimitUpdateParams,
  };
}
