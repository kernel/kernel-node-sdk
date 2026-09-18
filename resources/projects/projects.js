"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Projects = void 0;
const tslib_1 = require("../../internal/tslib.js");
const resource_1 = require("../../core/resource.js");
const LimitsAPI = tslib_1.__importStar(require("./limits.js"));
const limits_1 = require("./limits.js");
const pagination_1 = require("../../core/pagination.js");
const headers_1 = require("../../internal/headers.js");
const path_1 = require("../../internal/utils/path.js");
/**
 * Create and manage projects for resource isolation within an organization.
 * When projects are disabled for the organization, project operations return
 * `404` with code `projects_disabled`.
 */
class Projects extends resource_1.APIResource {
    constructor() {
        super(...arguments);
        this.limits = new LimitsAPI.Limits(this._client);
    }
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
    create(body, options) {
        return this._client.post('/org/projects', { body, ...options });
    }
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
    retrieve(idOrName, options) {
        return this._client.get((0, path_1.path) `/org/projects/${idOrName}`, options);
    }
    /**
     * Update a project's name or status.
     *
     * @example
     * ```ts
     * const project = await client.projects.update('id_or_name');
     * ```
     */
    update(idOrName, body, options) {
        return this._client.patch((0, path_1.path) `/org/projects/${idOrName}`, { body, ...options });
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
    list(query = {}, options) {
        return this._client.getAPIList('/org/projects', (pagination_1.OffsetPagination), { query, ...options });
    }
    /**
     * Soft-delete a project. The project must be empty (no active resources).
     *
     * @example
     * ```ts
     * await client.projects.delete('id_or_name');
     * ```
     */
    delete(idOrName, options) {
        return this._client.delete((0, path_1.path) `/org/projects/${idOrName}`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: '*/*' }, options?.headers]),
        });
    }
}
exports.Projects = Projects;
Projects.Limits = limits_1.Limits;
//# sourceMappingURL=projects.js.map