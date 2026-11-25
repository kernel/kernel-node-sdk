// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as VersionsAPI from './versions';
import { ReportTypeVersion, VersionRetrieveParams, Versions } from './versions';
import { APIPromise } from '../../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../../core/pagination';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Discover report types and submit typed reports against tasks.
 */
export class ReportTypes extends APIResource {
  versions: VersionsAPI.Versions = new VersionsAPI.Versions(this._client);

  /**
   * Retrieve a report type, its versions, and the JSON Schema of its latest version.
   */
  retrieve(type: string, options?: RequestOptions): APIPromise<ReportType> {
    return this._client.get(path`/report_types/${type}`, options);
  }

  /**
   * List the report types agents can submit for a task. Retrieve a type for the JSON
   * Schema of its data.
   */
  list(
    query: ReportTypeListParams,
    options?: RequestOptions,
  ): PagePromise<ReportTypeSummariesOffsetPagination, ReportTypeSummary> {
    return this._client.getAPIList('/report_types', OffsetPagination<ReportTypeSummary>, {
      query,
      ...options,
    });
  }
}

export type ReportTypeSummariesOffsetPagination = OffsetPagination<ReportTypeSummary>;

/**
 * A kind of report agents can submit against a task, with its versions and the
 * JSON Schema of its latest version. A shipped version never changes; changes ship
 * as new versions.
 */
export interface ReportType {
  /**
   * What the report type records and when to submit it
   */
  description: string;

  /**
   * Highest version that is not retired. A report submitted without a schema_version
   * uses this version. It is 0 when every version is retired.
   */
  latest_version: number;

  /**
   * JSON Schema (draft 2020-12) of the latest version, which a report's data must
   * match. Its field descriptions and examples describe what to send. Null when
   * every version is retired.
   */
  schema: { [key: string]: unknown } | null;

  /**
   * Report type name, such as task.result
   */
  type: string;

  /**
   * Every version of the type, oldest first, including retired versions.
   */
  versions: Array<ReportTypeVersionSummary>;
}

/**
 * A kind of report agents can submit against a task. Retrieve the type for the
 * JSON Schema of its data.
 */
export interface ReportTypeSummary {
  /**
   * What the report type records and when to submit it
   */
  description: string;

  /**
   * Highest version that is not retired. A report submitted without a schema_version
   * uses this version. It is 0 when every version is retired.
   */
  latest_version: number;

  /**
   * Report type name, such as task.result
   */
  type: string;
}

/**
 * One schema version of a report type, without its schema.
 */
export interface ReportTypeVersionSummary {
  /**
   * Whether the version is retired. Retired versions are no longer accepted for new
   * reports; existing reports keep them.
   */
  retired: boolean;

  /**
   * Schema version number, starting at 1.
   */
  version: number;
}

export interface ReportTypeListParams extends OffsetPaginationParams {
  /**
   * Task the agent is finding a report type for.
   */
  task_id: string;

  /**
   * What the agent wants to report, in its own words. Types are ranked by how
   * closely their meaning matches, most relevant first; they need not share any
   * words. Only this text affects the ranking, not the task. Without it, or if
   * ranking is unavailable, types are listed by name.
   */
  query?: string;
}

ReportTypes.Versions = Versions;

export declare namespace ReportTypes {
  export {
    type ReportType as ReportType,
    type ReportTypeSummary as ReportTypeSummary,
    type ReportTypeVersionSummary as ReportTypeVersionSummary,
    type ReportTypeSummariesOffsetPagination as ReportTypeSummariesOffsetPagination,
    type ReportTypeListParams as ReportTypeListParams,
  };

  export {
    Versions as Versions,
    type ReportTypeVersion as ReportTypeVersion,
    type VersionRetrieveParams as VersionRetrieveParams,
  };
}
