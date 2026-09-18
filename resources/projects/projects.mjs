// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import * as LimitsAPI from "./limits.mjs";
import { Limits } from "./limits.mjs";
import { OffsetPagination } from "../../core/pagination.mjs";
import { buildHeaders } from "../../internal/headers.mjs";
import { path } from "../../internal/utils/path.mjs";
/**
 * Create and manage projects for resource isolation within an organization.
 * When projects are disabled for the organization, project operations return
 * `404` with code `projects_disabled`.
 */
export class Projects extends APIResource {
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
        return this._client.get(path `/org/projects/${idOrName}`, options);
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
        return this._client.patch(path `/org/projects/${idOrName}`, { body, ...options });
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
        return this._client.getAPIList('/org/projects', (OffsetPagination), { query, ...options });
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
        return this._client.delete(path `/org/projects/${idOrName}`, {
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
}
Projects.Limits = Limits;
//# sourceMappingURL=projects.mjs.map