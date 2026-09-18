"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Limits = void 0;
const resource_1 = require("../../core/resource.js");
const path_1 = require("../../internal/utils/path.js");
/**
 * Create and manage projects for resource isolation within an organization.
 * When projects are disabled for the organization, project operations return
 * `404` with code `projects_disabled`.
 */
class Limits extends resource_1.APIResource {
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
        return this._client.get((0, path_1.path) `/org/projects/${idOrName}/limits`, options);
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
        return this._client.patch((0, path_1.path) `/org/projects/${idOrName}/limits`, { body, ...options });
    }
}
exports.Limits = Limits;
//# sourceMappingURL=limits.js.map