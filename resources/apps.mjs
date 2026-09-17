// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../core/resource.mjs";
import { OffsetPagination } from "../core/pagination.mjs";
/**
 * List applications and versions.
 */
export class Apps extends APIResource {
    /**
     * List applications. Optionally filter by app name and/or version label.
     */
    list(query = {}, options) {
        return this._client.getAPIList('/apps', (OffsetPagination), { query, ...options });
    }
}
//# sourceMappingURL=apps.mjs.map