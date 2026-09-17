import { APIResource } from "../../core/resource.mjs";
import * as ConfigRegistryAPI from "./config-registry.mjs";
import { AnalysisSummariesOffsetPagination } from "./config-registry.mjs";
import { APIPromise } from "../../core/api-promise.mjs";
import { type OffsetPaginationParams, PagePromise } from "../../core/pagination.mjs";
import { RequestOptions } from "../../internal/request-options.mjs";
/**
 * Resolve browser and proxy recommendations for bot-protected sites.
 */
export declare class Analyses extends APIResource {
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
    retrieve(id: string, options?: RequestOptions): APIPromise<ConfigRegistryAPI.ConfigRegistryResponse>;
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
    list(query?: AnalysisListParams | null | undefined, options?: RequestOptions): PagePromise<AnalysisSummariesOffsetPagination, ConfigRegistryAPI.AnalysisSummary>;
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
    cancel(id: string, options?: RequestOptions): APIPromise<ConfigRegistryAPI.ConfigRegistryResponse>;
}
export interface AnalysisListParams extends OffsetPaginationParams {
    /**
     * Case-insensitive substring search over requested URLs.
     */
    search?: string;
}
export declare namespace Analyses {
    export { type AnalysisListParams as AnalysisListParams };
}
export { type AnalysisSummariesOffsetPagination };
//# sourceMappingURL=analyses.d.mts.map