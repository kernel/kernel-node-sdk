import { APIResource } from "../../core/resource.js";
import { APIPromise } from "../../core/api-promise.js";
import { RequestOptions } from "../../internal/request-options.js";
/**
 * Create and manage projects for resource isolation within an organization.
 * When projects are disabled for the organization, project operations return
 * `404` with code `projects_disabled`.
 */
export declare class Limits extends APIResource {
    /**
     * Get the resource limit overrides for a project. Null values mean no
     * project-level cap (org limit applies).
     *
     * @example
     * ```ts
     * const projectLimits = await client.projects.limits.retrieve(
     *   'id_or_name',
     * );
     * ```
     */
    retrieve(idOrName: string, options?: RequestOptions): APIPromise<ProjectLimits>;
    /**
     * Update resource limit overrides for a project. Only fields present in the
     * request are modified. Set a field to 0 to remove that limit cap; omit a field to
     * leave it unchanged.
     *
     * @example
     * ```ts
     * const projectLimits = await client.projects.limits.update(
     *   'id_or_name',
     * );
     * ```
     */
    update(idOrName: string, body: LimitUpdateParams, options?: RequestOptions): APIPromise<ProjectLimits>;
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
     * `max_concurrent_sessions`. Always null.
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
     * `max_concurrent_sessions`. Requests that set this field are rejected with a 400.
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
     * `max_concurrent_sessions`. Requests that set this field are rejected with a 400.
     */
    max_pooled_sessions?: number | null;
}
export declare namespace Limits {
    export { type ProjectLimits as ProjectLimits, type UpdateProjectLimitsRequest as UpdateProjectLimitsRequest, type LimitUpdateParams as LimitUpdateParams, };
}
//# sourceMappingURL=limits.d.ts.map