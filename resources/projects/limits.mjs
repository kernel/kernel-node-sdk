// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import { path } from "../../internal/utils/path.mjs";
/**
 * Create and manage projects for resource isolation within an organization.
 * When projects are disabled for the organization, project operations return
 * `404` with code `projects_disabled`.
 */
export class Limits extends APIResource {
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
    retrieve(idOrName, options) {
        return this._client.get(path `/org/projects/${idOrName}/limits`, options);
    }
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
    update(idOrName, body, options) {
        return this._client.patch(path `/org/projects/${idOrName}/limits`, { body, ...options });
    }
}
//# sourceMappingURL=limits.mjs.map