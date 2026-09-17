// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import * as AnalysesAPI from "./analyses.mjs";
import { Analyses } from "./analyses.mjs";
import { OffsetPagination } from "../../core/pagination.mjs";
/**
 * Resolve browser and proxy recommendations for bot-protected sites.
 */
export class ConfigRegistry extends APIResource {
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
        return this._client.getAPIList('/config-registry', (OffsetPagination), {
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
ConfigRegistry.Analyses = Analyses;
//# sourceMappingURL=config-registry.mjs.map