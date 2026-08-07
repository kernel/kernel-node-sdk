// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../../core/pagination';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Read audit log records for the authenticated organization.
 */
export class ExportDestinations extends APIResource {
  /**
   * Create a paused destination. Activate it with a status update once the
   * destination test passes. Requires an active Enterprise plan.
   */
  create(
    body: ExportDestinationCreateParams,
    options?: RequestOptions,
  ): APIPromise<AuditLogExportDestination> {
    return this._client.post('/audit-logs/export/destinations', { body, ...options });
  }

  /**
   * Retrieve details for a single audit log export destination by its ID.
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<AuditLogExportDestination> {
    return this._client.get(path`/audit-logs/export/destinations/${id}`, options);
  }

  /**
   * Apply a partial update to a destination. Requires an active Enterprise plan.
   * Returns 409 when the destination was changed concurrently, because the merged
   * configuration this request validated is no longer the one that would be stored;
   * retry against fresh state. Pausing prevents new delivery attempts, but an S3
   * upload already in progress may complete after the response.
   */
  update(
    id: string,
    body: ExportDestinationUpdateParams,
    options?: RequestOptions,
  ): APIPromise<AuditLogExportDestination> {
    return this._client.patch(path`/audit-logs/export/destinations/${id}`, { body, ...options });
  }

  /**
   * List audit log export destinations for the organization with pagination support.
   */
  list(
    query: ExportDestinationListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<AuditLogExportDestinationsOffsetPagination, AuditLogExportDestination> {
    return this._client.getAPIList(
      '/audit-logs/export/destinations',
      OffsetPagination<AuditLogExportDestination>,
      { query, ...options },
    );
  }

  /**
   * Soft delete the destination and prevent new delivery attempts. An S3 upload
   * already in progress may complete after the response.
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/audit-logs/export/destinations/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Verify the destination is writable by assuming the configured role and uploading
   * a temporary probe object with the same request metadata as a real delivery.
   * Requires an active Enterprise plan.
   */
  test(id: string, options?: RequestOptions): APIPromise<AuditLogExportDestinationTestResult> {
    return this._client.post(path`/audit-logs/export/destinations/${id}/test`, options);
  }
}

export type AuditLogExportDestinationsOffsetPagination = OffsetPagination<AuditLogExportDestination>;

/**
 * An organization-scoped audit log export destination.
 *
 * Delivery is at-least-once for rows visible when their window is committed: a
 * delivery that is retried rewrites the same object, and the same `event_id` can
 * appear in more than one object, so consumers must deduplicate on `event_id`.
 * Each event-time window is held for ten minutes before it commits; a row that
 * becomes visible after its window is committed may not be delivered.
 *
 * Objects are written as
 * `<prefix>/destination_id=<destination>/org_id=<org>/date=<YYYY-MM-DD>/hour=<HH>/<window>-<chunk>.jsonl.gz`,
 * where `date` and `hour` are the UTC calendar hour that fully contains every row
 * in the object, so the layout is safe to register as a Hive-partitioned table.
 * The object name is derived from the rows it holds, so a retried delivery
 * rewrites its own object.
 */
export interface AuditLogExportDestination {
  id: string;

  bucket: string;

  consecutive_failures: number;

  created_at: string;

  external_id: string;

  format: 'jsonl.gz';

  /**
   * The Kernel role that assumes `role_arn` in your account to deliver logs. Allow
   * this role as the principal in your role's trust policy, and require
   * `external_id` as the `sts:ExternalId` condition.
   *
   * Recreating a destination issues a new `external_id`, which the trust policy has
   * to be updated to match.
   */
  kernel_role_arn: string;

  prefix: string;

  region: string;

  role_arn: string;

  /**
   * Pausing prevents new delivery attempts. An S3 upload already in progress may
   * complete after the pause response; its rows can appear again after the
   * destination is resumed.
   */
  status: 'active' | 'paused';

  type: 's3';

  updated_at: string;

  kms_key_id?: string;

  /**
   * Sanitized description of the most recent delivery failure.
   */
  last_error?: string;

  last_error_at?: string;

  /**
   * Opaque, versioned checkpoint for forward-only continuous export. This value is
   * not compatible with audit-log list page tokens.
   *
   * Delivery starts at the moment the destination is activated, so events recorded
   * before that are not delivered. Pausing stops delivery and resuming starts again
   * from the time of the resume: events recorded while a destination was paused are
   * never exported, and pausing is not a way to defer delivery.
   */
  last_exported_cursor?: string;

  last_success_at?: string;

  next_attempt_at?: string;
}

export interface AuditLogExportDestinationTestResult {
  stage: 'assume_role' | 'put_object' | 'complete';

  success: boolean;

  error?: AuditLogExportDestinationTestResult.Error;
}

export namespace AuditLogExportDestinationTestResult {
  export interface Error {
    code: 'assume_role_failed' | 'put_object_failed';

    message: string;
  }
}

export interface CreateAuditLogExportDestinationRequest {
  bucket: string;

  format: 'jsonl.gz';

  prefix: string;

  region: string;

  role_arn: string;

  type: 's3';

  kms_key_id?: string;
}

export interface UpdateAuditLogExportDestinationRequest {
  bucket?: string;

  /**
   * KMS key ID, alias, or ARN. Set to an empty string to remove the configured KMS
   * key; omit or send null to leave unchanged.
   */
  kms_key_id?: string;

  prefix?: string;

  region?: string;

  role_arn?: string;

  status?: 'active' | 'paused';
}

export interface ExportDestinationCreateParams {
  bucket: string;

  format: 'jsonl.gz';

  prefix: string;

  region: string;

  role_arn: string;

  type: 's3';

  kms_key_id?: string;
}

export interface ExportDestinationUpdateParams {
  bucket?: string;

  /**
   * KMS key ID, alias, or ARN. Set to an empty string to remove the configured KMS
   * key; omit or send null to leave unchanged.
   */
  kms_key_id?: string;

  prefix?: string;

  region?: string;

  role_arn?: string;

  status?: 'active' | 'paused';
}

export interface ExportDestinationListParams extends OffsetPaginationParams {}

export declare namespace ExportDestinations {
  export {
    type AuditLogExportDestination as AuditLogExportDestination,
    type AuditLogExportDestinationTestResult as AuditLogExportDestinationTestResult,
    type CreateAuditLogExportDestinationRequest as CreateAuditLogExportDestinationRequest,
    type UpdateAuditLogExportDestinationRequest as UpdateAuditLogExportDestinationRequest,
    type AuditLogExportDestinationsOffsetPagination as AuditLogExportDestinationsOffsetPagination,
    type ExportDestinationCreateParams as ExportDestinationCreateParams,
    type ExportDestinationUpdateParams as ExportDestinationUpdateParams,
    type ExportDestinationListParams as ExportDestinationListParams,
  };
}
