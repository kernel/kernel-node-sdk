// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as LimitsAPI from './limits';
import { LimitUpdateParams, Limits, ProjectLimits, UpdateProjectLimitsRequest } from './limits';
import { APIPromise } from '../../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../../core/pagination';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Create and manage projects for resource isolation within an organization.
 */
export class Projects extends APIResource {
  limits: LimitsAPI.Limits = new LimitsAPI.Limits(this._client);

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
  create(body: ProjectCreateParams, options?: RequestOptions): APIPromise<Project> {
    return this._client.post('/org/projects', { body, ...options });
  }

  /**
   * Get a project by its ID or by its name. Names are unique within an organization.
   *
   * @example
   * ```ts
   * const project = await client.projects.retrieve('id');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<Project> {
    return this._client.get(path`/org/projects/${id}`, options);
  }

  /**
   * Update a project's name or status.
   *
   * @example
   * ```ts
   * const project = await client.projects.update('id');
   * ```
   */
  update(id: string, body: ProjectUpdateParams, options?: RequestOptions): APIPromise<Project> {
    return this._client.patch(path`/org/projects/${id}`, { body, ...options });
  }

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
  list(
    query: ProjectListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<ProjectsOffsetPagination, Project> {
    return this._client.getAPIList('/org/projects', OffsetPagination<Project>, { query, ...options });
  }

  /**
   * Soft-delete a project. The project must be empty (no active resources).
   *
   * @example
   * ```ts
   * await client.projects.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/org/projects/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export type ProjectsOffsetPagination = OffsetPagination<Project>;

export interface CreateProjectRequest {
  /**
   * Project name (1-255 characters)
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
   * New project name
   */
  name?: string;

  /**
   * New project status
   */
  status?: 'active' | 'archived';
}

export interface ProjectCreateParams {
  /**
   * Project name (1-255 characters)
   */
  name: string;
}

export interface ProjectUpdateParams {
  /**
   * New project name
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

Projects.Limits = Limits;

export declare namespace Projects {
  export {
    type CreateProjectRequest as CreateProjectRequest,
    type Project as Project,
    type UpdateProjectRequest as UpdateProjectRequest,
    type ProjectsOffsetPagination as ProjectsOffsetPagination,
    type ProjectCreateParams as ProjectCreateParams,
    type ProjectUpdateParams as ProjectUpdateParams,
    type ProjectListParams as ProjectListParams,
  };

  export {
    Limits as Limits,
    type ProjectLimits as ProjectLimits,
    type UpdateProjectLimitsRequest as UpdateProjectLimitsRequest,
    type LimitUpdateParams as LimitUpdateParams,
  };
}
