"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analyses = void 0;
const resource_1 = require("../../core/resource.js");
const pagination_1 = require("../../core/pagination.js");
const path_1 = require("../../internal/utils/path.js");
/**
 * Resolve browser and proxy recommendations for bot-protected sites.
 */
class Analyses extends resource_1.APIResource {
    /**
     * Returns a project-scoped historical analysis and the recommendation outcome
     * concluded by that run. Later knowledge does not change this response.
     *
     * @example
     * ```ts
     * const configRegistryResponse =
     *   await client.configRegistry.analyses.retrieve('id');
     * ```
     */
    retrieve(id, options) {
        return this._client.get((0, path_1.path) `/config-registry/analyses/${id}`, options);
    }
    /**
     * Lists analyses for the selected project, newest first.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const analysisSummary of client.configRegistry.analyses.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/config-registry/analyses', (pagination_1.OffsetPagination), { query, ...options });
    }
    /**
     * Requests cancellation of a running project-scoped analysis. Cancellation is
     * asynchronous; poll the analysis until its status becomes canceled. Repeating the
     * request after the analysis reaches a terminal state returns the existing
     * outcome.
     *
     * @example
     * ```ts
     * const configRegistryResponse =
     *   await client.configRegistry.analyses.cancel('id');
     * ```
     */
    cancel(id, options) {
        return this._client.post((0, path_1.path) `/config-registry/analyses/${id}/cancel`, options);
    }
}
exports.Analyses = Analyses;
//# sourceMappingURL=analyses.js.map