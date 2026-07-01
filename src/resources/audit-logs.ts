// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { PagePromise, PageTokenPagination, type PageTokenPaginationParams } from '../core/pagination';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';

/**
 * Read audit log records for the authenticated organization.
 */
export class AuditLogs extends APIResource {
  /**
   * API for searching audit logs. Limited to at most 30 day search, returns up to
   * 100 records per page. Not recommended for bulk export.
   */
  list(
    query: AuditLogListParams,
    options?: RequestOptions,
  ): PagePromise<AuditLogEntriesPageTokenPagination, AuditLogEntry> {
    return this._client.getAPIList('/audit-logs', PageTokenPagination<AuditLogEntry>, { query, ...options });
  }

  /**
   * Download an organization's audit log records for a time range as a file, for
   * archival, compliance, or offline analysis. For interactive browsing, use GET
   * /audit-logs.
   */
  exportChunk(query: AuditLogExportChunkParams, options?: RequestOptions): APIPromise<Response> {
    return this._client.get('/audit-logs/export/chunk', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: 'application/octet-stream' }, options?.headers]),
      __binaryResponse: true,
    });
  }
}

export type AuditLogEntriesPageTokenPagination = PageTokenPagination<AuditLogEntry>;

export interface AuditLogEntry {
  /**
   * Authentication strategy used for the request.
   */
  auth_strategy: string;

  /**
   * Client IP address.
   */
  client_ip: string;

  /**
   * Request host.
   */
  domain: string;

  /**
   * Request duration in milliseconds.
   */
  duration_ms: number;

  /**
   * Email of the authenticated user at request time, if any.
   */
  email: string;

  /**
   * HTTP method.
   */
  method: string;

  /**
   * Request path.
   */
  path: string;

  /**
   * Matched API route pattern, if available.
   */
  route: string;

  /**
   * HTTP response status code.
   */
  status: number;

  /**
   * UTC time when the request was received.
   */
  timestamp: string;

  /**
   * User agent header.
   */
  user_agent: string;

  /**
   * ID of the authenticated user, if any.
   */
  user_id: string;
}

export interface AuditLogListParams extends PageTokenPaginationParams {
  /**
   * Upper bound (exclusive) for the audit record timestamp.
   */
  end: string;

  /**
   * Lower bound (inclusive) for the audit record timestamp.
   */
  start: string;

  /**
   * Filter by authentication strategy.
   */
  auth_strategy?: string;

  /**
   * Filter out results by HTTP method.
   */
  exclude_method?: string;

  /**
   * Filter by HTTP method.
   */
  method?: string;

  /**
   * Free-text search over path, user ID, email, client IP, and status.
   */
  search?: string;

  /**
   * Additional user IDs to OR into free-text search.
   */
  search_user_id?: Array<string>;

  /**
   * Filter by service name.
   */
  service?: string;
}

export interface AuditLogExportChunkParams {
  /**
   * Upper bound (exclusive) for the audit record timestamp.
   */
  end: string;

  /**
   * Lower bound (inclusive) for the audit record timestamp.
   */
  start: string;

  /**
   * Filter by authentication strategy.
   */
  auth_strategy?: string;

  /**
   * Opaque cursor from X-Next-Cursor for the next chunk of older records.
   */
  cursor?: string;

  /**
   * Filter out results by HTTP method.
   */
  exclude_method?: string;

  /**
   * Encoding for the returned chunk.
   */
  format?: 'jsonl' | 'jsonl.gz';

  /**
   * Maximum number of records to return in this chunk.
   */
  limit?: number;

  /**
   * Filter by HTTP method.
   */
  method?: string;

  /**
   * Free-text search over path, user ID, email, client IP, and status.
   */
  search?: string;

  /**
   * Additional user IDs to OR into free-text search.
   */
  search_user_id?: Array<string>;

  /**
   * Filter by service name.
   */
  service?: string;
}

export declare namespace AuditLogs {
  export {
    type AuditLogEntry as AuditLogEntry,
    type AuditLogEntriesPageTokenPagination as AuditLogEntriesPageTokenPagination,
    type AuditLogListParams as AuditLogListParams,
    type AuditLogExportChunkParams as AuditLogExportChunkParams,
  };
}
