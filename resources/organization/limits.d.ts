import { APIResource } from "../../core/resource.js";
import { APIPromise } from "../../core/api-promise.js";
import { RequestOptions } from "../../internal/request-options.js";
/**
 * Read and manage organization-level limits.
 */
export declare class Limits extends APIResource {
    /**
     * Get the organization's effective limits and current concurrency, managed auth,
     * and vault usage.
     */
    retrieve(options?: RequestOptions): APIPromise<OrgLimits>;
    /**
     * Set the default per-project concurrency cap applied to projects without an
     * explicit override. Set the value to 0 to remove the default; omit to leave it
     * unchanged. The default cannot exceed the organization's concurrency limit.
     */
    update(body: LimitUpdateParams, options?: RequestOptions): APIPromise<OrgLimits>;
}
export interface OrgLimits {
    /**
     * The organization's current non-deleted managed auth connections, counted
     * org-wide across every project. Compare against max_auth_connections to show
     * remaining capacity before a create is rejected with 403 insufficient_plan.
     */
    auth_connections_used: number;
    /**
     * Number of concurrent browser slots currently available to the organization. This
     * is the effective concurrency limit minus active on-demand sessions and browser
     * pool reservations, floored at zero. Null when usage cannot be read.
     */
    concurrent_sessions_available: number | null;
    /**
     * Current organization-wide concurrent browser usage, including active on-demand
     * sessions and browser pool reservations. Null when usage cannot be read.
     */
    concurrent_sessions_used: number | null;
    /**
     * Maximum managed auth connections the organization's plan allows. Null means
     * unlimited. Counted org-wide, so it cannot be multiplied across projects.
     */
    max_auth_connections: number | null;
    /**
     * Maximum non-deleted vaults allowed org-wide across all projects. Null means
     * unlimited.
     */
    max_vaults: number | null;
    /**
     * Smallest health_check_interval the organization's plan accepts on a managed auth
     * connection. Requests below this are rejected with 400. Existing connections
     * stored below the floor are grandfathered until edited.
     */
    min_health_check_interval_seconds: number;
    /**
     * Current non-deleted vault count across all projects in the organization.
     */
    vaults_used: number;
    /**
     * Default maximum concurrent browsers applied to every project that has no
     * explicit per-project override. Null means no org-level default, so such projects
     * are uncapped (only the org-wide limit applies). Applies to existing and newly
     * created projects.
     */
    default_project_max_concurrent_sessions?: number | null;
    /**
     * The organization's effective concurrency limit — the maximum browsers running at
     * once, covering both on-demand sessions and browser pool reservations — from its
     * plan or an override. Read-only and shared across all projects in the org; a
     * per-project default cannot exceed it.
     */
    max_concurrent_sessions?: number;
}
export interface UpdateOrgLimitsRequest {
    /**
     * Default maximum concurrent browsers for projects without an explicit override.
     * Set to 0 to remove the default; omit to leave unchanged. Cannot exceed the
     * organization's concurrency limit.
     */
    default_project_max_concurrent_sessions?: number | null;
}
export interface LimitUpdateParams {
    /**
     * Default maximum concurrent browsers for projects without an explicit override.
     * Set to 0 to remove the default; omit to leave unchanged. Cannot exceed the
     * organization's concurrency limit.
     */
    default_project_max_concurrent_sessions?: number | null;
}
export declare namespace Limits {
    export { type OrgLimits as OrgLimits, type UpdateOrgLimitsRequest as UpdateOrgLimitsRequest, type LimitUpdateParams as LimitUpdateParams, };
}
//# sourceMappingURL=limits.d.ts.map