"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigRegistry = void 0;
const tslib_1 = require("../../internal/tslib.js");
const resource_1 = require("../../core/resource.js");
const AnalysesAPI = tslib_1.__importStar(require("./analyses.js"));
const analyses_1 = require("./analyses.js");
const pagination_1 = require("../../core/pagination.js");
/**
 * Resolve browser and proxy recommendations for bot-protected sites.
 */
class ConfigRegistry extends resource_1.APIResource {
    constructor() {
        super(...arguments);
        this.analyses = new AnalysesAPI.Analyses(this._client);
    }
    /**
     * Lists unique exact targets previously analyzed by the selected project with the
     * recommendation produced by each target's latest analysis.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const recommendationSummary of client.configRegistry.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/config-registry', (pagination_1.OffsetPagination), {
            query,
            ...options,
        });
    }
    /**
     * Returns current global knowledge without resolving DNS, creating an analysis, or
     * updating config registry data.
     *
     * @example
     * ```ts
     * const lookupResponse = await client.configRegistry.lookup({
     *   url: 'https://example.com',
     * });
     * ```
     */
    lookup(body, options) {
        return this._client.post('/config-registry/lookup', { body, ...options });
    }
    /**
     * Explicitly starts or retries a project-scoped background analysis while
     * preserving current global knowledge when available. Use
     * `/config-registry/lookup` for side-effect-free reads.
     *
     * @example
     * ```ts
     * const configRegistryResponse =
     *   await client.configRegistry.resolve({
     *     url: 'https://example.com',
     *   });
     * ```
     */
    resolve(body, options) {
        return this._client.post('/config-registry/resolve', { body, ...options });
    }
}
exports.ConfigRegistry = ConfigRegistry;
ConfigRegistry.Analyses = analyses_1.Analyses;
//# sourceMappingURL=config-registry.js.map