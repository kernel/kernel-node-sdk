// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

/**
 * Discover report types and submit typed reports against tasks.
 */
export class Reports extends APIResource {
  /**
   * Submit a typed report against a task. The data is validated against the report
   * type's schema; a validation failure returns 400 with one detail per invalid
   * field. A task can have at most 500 reports.
   *
   * @example
   * ```ts
   * const report = await client.reports.create({
   *   data: { result: 'bar', evidence: 'bar' },
   *   task_id: 'x',
   *   type: 'task.result',
   * });
   * ```
   */
  create(body: ReportCreateParams, options?: RequestOptions): APIPromise<Report> {
    return this._client.post('/reports', { body, ...options });
  }

  /**
   * Retrieve a report.
   *
   * @example
   * ```ts
   * const report = await client.reports.retrieve('id');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<Report> {
    return this._client.get(path`/reports/${id}`, options);
  }

  /**
   * List a task's reports in the order they were submitted, oldest first.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const report of client.reports.list({
   *   task_id: 'task_id',
   * })) {
   *   // ...
   * }
   * ```
   */
  list(query: ReportListParams, options?: RequestOptions): PagePromise<ReportsOffsetPagination, Report> {
    return this._client.getAPIList('/reports', OffsetPagination<Report>, { query, ...options });
  }
}

export type ReportsOffsetPagination = OffsetPagination<Report>;

/**
 * A typed, schema-validated report an agent submitted against a task. Reports are
 * immutable.
 */
export interface Report {
  /**
   * Unique identifier for the report
   */
  id: string;

  /**
   * When the report was submitted
   */
  created_at: string;

  /**
   * Report data, matching the report type's schema
   */
  data: { [key: string]: unknown };

  /**
   * When the reported event happened
   */
  occurred_at: string;

  /**
   * Version of the report type's schema that data was validated against
   */
  schema_version: number;

  /**
   * ID of the task the report belongs to
   */
  task_id: string;

  /**
   * Report type name
   */
  type: string;

  /**
   * ID of the browser the report was observed in, if any
   */
  session_id?: string | null;
}

export interface ReportCreateParams {
  /**
   * Report data. It must match the schema of the report type's version and encode to
   * at most 16 KB of JSON.
   */
  data: { [key: string]: unknown };

  /**
   * ID of the task to report against.
   */
  task_id: string;

  /**
   * Report type name. List report types to see the available types and their
   * schemas.
   */
  type: string;

  /**
   * When the reported event happened. Defaults to the time the report is submitted.
   * Must be no more than 5 minutes in the future or 30 days in the past.
   */
  occurred_at?: string;

  /**
   * Version of the report type's schema to validate data against. Defaults to the
   * type's latest version, which the response returns.
   */
  schema_version?: number;

  /**
   * ID of the browser the report was observed in. It must belong to the task's
   * project; deleted browsers are accepted. The browser is linked to the task if it
   * is not already.
   */
  session_id?: string;
}

export interface ReportListParams extends OffsetPaginationParams {
  /**
   * Task whose reports to list.
   */
  task_id: string;

  /**
   * Only return reports of this type.
   */
  type?: string;
}

export declare namespace Reports {
  export {
    type Report as Report,
    type ReportsOffsetPagination as ReportsOffsetPagination,
    type ReportCreateParams as ReportCreateParams,
    type ReportListParams as ReportListParams,
  };
}
