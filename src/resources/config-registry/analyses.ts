// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as ConfigRegistryAPI from './config-registry';
import { AnalysisSummariesOffsetPagination } from './config-registry';
import { APIPromise } from '../../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../../core/pagination';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Resolve browser and proxy recommendations for bot-protected sites.
 */
export class Analyses extends APIResource {
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
  retrieve(id: string, options?: RequestOptions): APIPromise<ConfigRegistryAPI.ConfigRegistryResponse> {
    return this._client.get(path`/config-registry/analyses/${id}`, options);
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
  list(
    query: AnalysisListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<AnalysisSummariesOffsetPagination, ConfigRegistryAPI.AnalysisSummary> {
    return this._client.getAPIList(
      '/config-registry/analyses',
      OffsetPagination<ConfigRegistryAPI.AnalysisSummary>,
      { query, ...options },
    );
  }
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
