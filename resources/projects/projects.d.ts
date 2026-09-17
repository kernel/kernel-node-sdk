import { APIResource } from "../../core/resource.js";
import * as LimitsAPI from "./limits.js";
import { LimitUpdateParams, Limits, ProjectLimits, UpdateProjectLimitsRequest } from "./limits.js";
import { APIPromise } from "../../core/api-promise.js";
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from "../../core/pagination.js";
import { RequestOptions } from "../../internal/request-options.js";
/**
 * Create and manage projects for resource isolation within an organization.
 * When projects are disabled for the organization, project operations return
 * `404` with code `projects_disabled`.
 */
export declare class Projects extends APIResource {
    limits: LimitsAPI.Limits;
    /**
     * Create a new project within the authenticated organization.
     *
     * @example
     * ```ts
     * const project = await client.projects.create({
     *   name: 'staging',
     * });
     * ```
     */
    create(body: ProjectCreateParams, options?: RequestOptions): APIPromise<Project>;
    /**
     * Get a project by its ID or by its name. Names are unique within an organization.
     *
     * @example
     * ```ts
     * const project = await client.projects.retrieve(
     *   'id_or_name',
     * );
     * ```
     */
    retrieve(idOrName: string, options?: RequestOptions): APIPromise<Project>;
    /**
     * Update a project's name or status.
     *
     * @example
     * ```ts
     * const project = await client.projects.update('id_or_name');
     * ```
     */
    update(idOrName: string, body: ProjectUpdateParams, options?: RequestOptions): APIPromise<Project>;
    /**
     * List projects for the authenticated organization.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const project of client.projects.list()) {
     *   // ...
     * }
     * ```
     */
    list(query?: ProjectListParams | null | undefined, options?: RequestOptions): PagePromise<ProjectsOffsetPagination, Project>;
    /**
     * Soft-delete a project. The project must be empty (no active resources).
     *
     * @example
     * ```ts
     * await client.projects.delete('id_or_name');
     * ```
     */
    delete(idOrName: string, options?: RequestOptions): APIPromise<void>;
}
export type ProjectsOffsetPagination = OffsetPagination<Project>;
export interface CreateProjectRequest {
    /**
     * Project name (1-255 Unicode code points; cannot contain `/` or `%`)
     */
    name: string;
}
export interface Project {
    /**
     * Unique project identifier
     */
    id: string;
    /**
     * When the project was created
     */
    created_at: string;
    /**
     * Project name
     */
    name: string;
    /**
     * Project status
     */
    status: 'active' | 'archived';
    /**
     * When the project was last updated
     */
    updated_at: string;
}
export interface UpdateProjectRequest {
    /**
     * New project name (1-255 Unicode code points; cannot contain `/` or `%`)
     */
    name?: string;
    /**
     * New project status
     */
    status?: 'active' | 'archived';
}
export interface ProjectCreateParams {
    /**
     * Project name (1-255 Unicode code points; cannot contain `/` or `%`)
     */
    name: string;
}
export interface ProjectUpdateParams {
    /**
     * New project name (1-255 Unicode code points; cannot contain `/` or `%`)
     */
    name?: string;
    /**
     * New project status
     */
    status?: 'active' | 'archived';
}
export interface ProjectListParams extends OffsetPaginationParams {
    /**
     * Exact-match filter on project name using the database collation. In production,
     * matching is case- and accent-insensitive.
     */
    name?: string;
    /**
     * Case-insensitive substring match against project name
     */
    query?: string;
}
export declare namespace Projects {
    export { type CreateProjectRequest as CreateProjectRequest, type Project as Project, type UpdateProjectRequest as UpdateProjectRequest, type ProjectsOffsetPagination as ProjectsOffsetPagination, type ProjectCreateParams as ProjectCreateParams, type ProjectUpdateParams as ProjectUpdateParams, type ProjectListParams as ProjectListParams, };
    export { Limits as Limits, type ProjectLimits as ProjectLimits, type UpdateProjectLimitsRequest as UpdateProjectLimitsRequest, type LimitUpdateParams as LimitUpdateParams, };
}
//# sourceMappingURL=projects.d.ts.map