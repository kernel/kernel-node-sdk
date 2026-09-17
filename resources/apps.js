"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Apps = void 0;
const resource_1 = require("../core/resource.js");
const pagination_1 = require("../core/pagination.js");
/**
 * List applications and versions.
 */
class Apps extends resource_1.APIResource {
    /**
     * List applications. Optionally filter by app name and/or version label.
     */
    list(query = {}, options) {
        return this._client.getAPIList('/apps', (pagination_1.OffsetPagination), { query, ...options });
    }
}
exports.Apps = Apps;
//# sourceMappingURL=apps.js.map