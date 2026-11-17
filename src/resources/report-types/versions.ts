// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Discover report types and submit typed reports against tasks.
 */
export class Versions extends APIResource {
  /**
   * Retrieve one schema version of a report type, including retired versions.
   */
  retrieve(
    version: number,
    params: VersionRetrieveParams,
    options?: RequestOptions,
  ): APIPromise<ReportTypeVersion> {
    const { type } = params;
    return this._client.get(path`/report_types/${type}/versions/${version}`, options);
  }
}

/**
 * One immutable schema version of a report type.
 */
export interface ReportTypeVersion {
  /**
   * Whether the version is retired. Retired versions are no longer accepted for new
   * reports; existing reports keep them.
   */
  retired: boolean;

  /**
   * JSON Schema (draft 2020-12) that a report's data must match. Its field
   * descriptions and examples describe what to send.
   */
  schema: { [key: string]: unknown };

  /**
   * Report type name, such as task.result
   */
  type: string;

  /**
   * Schema version number, starting at 1.
   */
  version: number;
}

export interface VersionRetrieveParams {
  /**
   * Report type name, such as task.result
   */
  type: string;
}

export declare namespace Versions {
  export { type ReportTypeVersion as ReportTypeVersion, type VersionRetrieveParams as VersionRetrieveParams };
}
