// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../../core/pagination';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Stream live telemetry events from a browser session, and manage the destinations sessions export them to.
 */
export class Destinations extends APIResource {
  /**
   * Create an OTLP export destination in the authenticated organization. Names must
   * be unique within the organization. Requires an organization-scoped credential or
   * dashboard authentication; project-scoped credentials receive a 403.
   */
  create(body: DestinationCreateParams, options?: RequestOptions): APIPromise<OtlpDestination> {
    return this._client.post('/telemetry/destinations', { body, ...options });
  }

  /**
   * Retrieve a customer-visible OTLP destination in the authenticated organization
   * by its ID or name. Project-scoped credentials can retrieve these destinations
   * for selection by workloads in their project. Non-dashboard reads return header
   * values redacted.
   */
  retrieve(idOrName: string, options?: RequestOptions): APIPromise<OtlpDestination> {
    return this._client.get(path`/telemetry/destinations/${idOrName}`, options);
  }

  /**
   * Update an OTLP destination. Sessions already exporting to it pick up the new
   * values without restarting, which makes this the way to rotate credentials
   * without interrupting export.
   *
   * Names must be unique within the organization. Renaming is refused with a 409
   * while a managed auth connection selects this destination by name, since that
   * connection resolves the name on every login. Every other field, including
   * `headers`, stays editable. Requires an organization-scoped credential or
   * dashboard authentication; project-scoped credentials receive a 403.
   */
  update(
    idOrName: string,
    body: DestinationUpdateParams,
    options?: RequestOptions,
  ): APIPromise<OtlpDestination> {
    return this._client.patch(path`/telemetry/destinations/${idOrName}`, { body, ...options });
  }

  /**
   * List customer-visible OTLP export destinations in the authenticated
   * organization. Project-scoped credentials can list these destinations for
   * selection by workloads in their project. Non-dashboard reads return header
   * values redacted.
   */
  list(
    query: DestinationListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<OtlpDestinationsOffsetPagination, OtlpDestination> {
    return this._client.getAPIList('/telemetry/destinations', OffsetPagination<OtlpDestination>, {
      query,
      ...options,
    });
  }

  /**
   * Delete an OTLP destination. Sessions bound to it are still exporting, so the
   * delete is refused with a 409 while any exist; either wait for those sessions to
   * end or delete them first. It is refused the same way while a managed auth
   * connection still selects it, because that connection re-resolves the destination
   * on every login, and while a managed auth login using it is still in progress.
   * Requires an organization-scoped credential or dashboard authentication;
   * project-scoped credentials receive a 403.
   */
  delete(idOrName: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/telemetry/destinations/${idOrName}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export type OtlpDestinationsOffsetPagination = OffsetPagination<OtlpDestination>;

/**
 * An OTLP endpoint to export browser session telemetry to. Reference one from
 * `telemetry.export.otlp.destination` when creating a browser to export that
 * session's captured telemetry to it.
 */
export interface OtlpDestination {
  id: string;

  created_at: string;

  /**
   * OTLP/HTTP endpoint telemetry is sent to.
   */
  endpoint: string;

  /**
   * Headers sent with each export request. Names are returned in canonical form
   * (`Authorization`, not `authorization`). Non-dashboard reads return values
   * redacted as empty strings, so the keys are visible but the credentials are not.
   * Dashboard reads return the stored values.
   */
  headers: { [key: string]: string };

  /**
   * Unique within the organization. Usable in place of the ID when selecting a
   * destination, so it cannot be shaped like an ID.
   */
  name: string;

  updated_at: string;

  description?: string;
}

export interface DestinationCreateParams {
  /**
   * Base endpoint of the OTLP/HTTP collector, without a signal path. Kernel appends
   * the signal path itself, so pass `https://api.honeycomb.io` rather than
   * `https://api.honeycomb.io/v1/logs`. If your provider's docs give you a
   * signal-specific URL, drop the trailing `/v1/logs`, `/v1/traces`, or
   * `/v1/metrics` — an endpoint that already carries one is rejected.
   *
   * Must be http or https, must resolve to a public address, and must carry no query
   * string or fragment. Examples: `https://api.honeycomb.io`,
   * `https://otlp-gateway-prod-us-east-0.grafana.net/otlp`,
   * `https://otlp.datadoghq.com` (Datadog's OTLP intake for US1, not its logs
   * intake).
   */
  endpoint: string;

  /**
   * Unique within the organization.
   */
  name: string;

  description?: string;

  /**
   * Headers sent with each export request, typically an ingestion key. Encrypted at
   * rest and returned redacted. Names and values must be valid HTTP header tokens,
   * and the names and values together cannot exceed 8192 bytes. Names are matched
   * case-insensitively and stored canonicalized, so supplying two spellings of one
   * header is rejected.
   */
  headers?: { [key: string]: string };
}

export interface DestinationUpdateParams {
  description?: string;

  /**
   * Base endpoint of the OTLP/HTTP collector, without a signal path. Same rules as
   * on create.
   */
  endpoint?: string;

  /**
   * Edits stored headers key by key rather than replacing the map. A string value
   * adds or replaces that header, `null` deletes it, and any key you omit is left as
   * it is. Names are matched case-insensitively, so `authorization` replaces a
   * stored `Authorization` rather than adding a second entry. This is the credential
   * rotation path; sessions already exporting pick up the new values without
   * restarting. Names and values must be valid HTTP header tokens, and the names and
   * values together cannot exceed 8192 bytes.
   */
  headers?: { [key: string]: string | null };

  name?: string;
}

export interface DestinationListParams extends OffsetPaginationParams {
  /**
   * Exact-match filter on destination name using the database collation. In
   * production, matching is case- and accent-insensitive.
   */
  name?: string;

  /**
   * Case-insensitive substring match against destination name or endpoint. IDs match
   * by exact value.
   */
  query?: string;
}

export declare namespace Destinations {
  export {
    type OtlpDestination as OtlpDestination,
    type OtlpDestinationsOffsetPagination as OtlpDestinationsOffsetPagination,
    type DestinationCreateParams as DestinationCreateParams,
    type DestinationUpdateParams as DestinationUpdateParams,
    type DestinationListParams as DestinationListParams,
  };
}
