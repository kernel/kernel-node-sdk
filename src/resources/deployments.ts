// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as Shared from './shared';
import { APIPromise } from '../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { Stream } from '../core/streaming';
import { type Uploadable } from '../core/uploads';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { multipartFormRequestOptions } from '../internal/uploads';
import { path } from '../internal/utils/path';

/**
 * Create and manage app deployments and stream deployment events.
 */
export class Deployments extends APIResource {
  /**
   * Create a new deployment.
   *
   * @example
   * ```ts
   * const deployment = await client.deployments.create({
   *   entrypoint_rel_path: 'src/app.py',
   *   env_vars: { FOO: 'bar' },
   *   file: fs.createReadStream('path/to/file'),
   *   region: 'aws.us-east-1a',
   *   version: '1.0.0',
   * });
   * ```
   */
  create(body: DeploymentCreateParams, options?: RequestOptions): APIPromise<DeploymentCreateResponse> {
    return this._client.post('/deployments', multipartFormRequestOptions({ body, ...options }, this._client));
  }

  /**
   * Get information about a deployment's status.
   *
   * @example
   * ```ts
   * const deployment = await client.deployments.retrieve('id');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<DeploymentRetrieveResponse> {
    return this._client.get(path`/deployments/${id}`, options);
  }

  /**
   * List deployments. Optionally filter by application name and version.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const deploymentListResponse of client.deployments.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: DeploymentListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<DeploymentListResponsesOffsetPagination, DeploymentListResponse> {
    return this._client.getAPIList('/deployments', OffsetPagination<DeploymentListResponse>, {
      query,
      ...options,
    });
  }

  /**
   * Stops a running deployment and marks it for deletion. If the deployment is
   * already in a terminal state (stopped or failed), returns immediately.
   *
   * @example
   * ```ts
   * await client.deployments.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/deployments/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Establishes a Server-Sent Events (SSE) stream that delivers real-time logs and
   * status updates for a deployment. The stream terminates automatically once the
   * deployment reaches a terminal state.
   *
   * @example
   * ```ts
   * const response = await client.deployments.follow('id');
   * ```
   */
  follow(
    id: string,
    query: DeploymentFollowParams | undefined = {},
    options?: RequestOptions,
  ): APIPromise<Stream<DeploymentFollowResponse>> {
    return this._client.get(path`/deployments/${id}/events`, {
      query,
      ...options,
      headers: buildHeaders([{ Accept: 'text/event-stream' }, options?.headers]),
      stream: true,
    }) as APIPromise<Stream<DeploymentFollowResponse>>;
  }
}

export type DeploymentListResponsesOffsetPagination = OffsetPagination<DeploymentListResponse>;

/**
 * An event representing the current state of a deployment.
 */
export interface DeploymentStateEvent {
  /**
   * Deployment record information.
   */
  deployment: DeploymentStateEvent.Deployment;

  /**
   * Event type identifier (always "deployment_state").
   */
  event: 'deployment_state';

  /**
   * Time the state was reported.
   */
  timestamp: string;
}

export namespace DeploymentStateEvent {
  /**
   * Deployment record information.
   */
  export interface Deployment {
    /**
     * Unique identifier for the deployment
     */
    id: string;

    /**
     * Timestamp when the deployment was created
     */
    created_at: string;

    /**
     * Deployment region code
     */
    region: 'aws.us-east-1a';

    /**
     * Current status of the deployment
     */
    status: 'queued' | 'in_progress' | 'running' | 'failed' | 'stopped';

    /**
     * Relative path to the application entrypoint
     */
    entrypoint_rel_path?: string;

    /**
     * Environment variables configured for this deployment. Values are redacted for
     * API key, OAuth, and managed-auth callers, which receive every key with an empty
     * string value. Only dashboard sessions receive the actual values.
     */
    env_vars?: { [key: string]: string };

    /**
     * Hex-encoded SHA-256 checksum of the source archive. For file uploads, this
     * hashes the uploaded archive; for GitHub-sourced deployments, this hashes the
     * GitHub archive downloaded by the API. Omitted for deployments created before
     * this field was recorded.
     */
    source_checksum?: string;

    /**
     * For GitHub-sourced deployments, the subpath within the repository that was used
     * as the deploy root. Omitted when the repo root was used or for file uploads.
     */
    source_path?: string;

    /**
     * For GitHub-sourced deployments, the git ref as requested at deploy time (branch,
     * tag, or commit SHA — not resolved to a commit). Omitted for file uploads.
     */
    source_ref?: string;

    /**
     * Origin of the deployed source code. This is read-only response provenance;
     * `file` indicates an uploaded archive and `github` indicates a repository fetched
     * by the API.
     */
    source_type?: 'file' | 'github';

    /**
     * For GitHub-sourced deployments, the repository URL that was fetched. Omitted for
     * file uploads.
     */
    source_url?: string;

    /**
     * Status reason
     */
    status_reason?: string;

    /**
     * Timestamp when the deployment was last updated
     */
    updated_at?: string | null;
  }
}

/**
 * Deployment record information.
 */
export interface DeploymentCreateResponse {
  /**
   * Unique identifier for the deployment
   */
  id: string;

  /**
   * Timestamp when the deployment was created
   */
  created_at: string;

  /**
   * Deployment region code
   */
  region: 'aws.us-east-1a';

  /**
   * Current status of the deployment
   */
  status: 'queued' | 'in_progress' | 'running' | 'failed' | 'stopped';

  /**
   * Relative path to the application entrypoint
   */
  entrypoint_rel_path?: string;

  /**
   * Environment variables configured for this deployment. Values are redacted for
   * API key, OAuth, and managed-auth callers, which receive every key with an empty
   * string value. Only dashboard sessions receive the actual values.
   */
  env_vars?: { [key: string]: string };

  /**
   * Hex-encoded SHA-256 checksum of the source archive. For file uploads, this
   * hashes the uploaded archive; for GitHub-sourced deployments, this hashes the
   * GitHub archive downloaded by the API. Omitted for deployments created before
   * this field was recorded.
   */
  source_checksum?: string;

  /**
   * For GitHub-sourced deployments, the subpath within the repository that was used
   * as the deploy root. Omitted when the repo root was used or for file uploads.
   */
  source_path?: string;

  /**
   * For GitHub-sourced deployments, the git ref as requested at deploy time (branch,
   * tag, or commit SHA — not resolved to a commit). Omitted for file uploads.
   */
  source_ref?: string;

  /**
   * Origin of the deployed source code. This is read-only response provenance;
   * `file` indicates an uploaded archive and `github` indicates a repository fetched
   * by the API.
   */
  source_type?: 'file' | 'github';

  /**
   * For GitHub-sourced deployments, the repository URL that was fetched. Omitted for
   * file uploads.
   */
  source_url?: string;

  /**
   * Status reason
   */
  status_reason?: string;

  /**
   * Timestamp when the deployment was last updated
   */
  updated_at?: string | null;
}

/**
 * Deployment record information.
 */
export interface DeploymentRetrieveResponse {
  /**
   * Unique identifier for the deployment
   */
  id: string;

  /**
   * Timestamp when the deployment was created
   */
  created_at: string;

  /**
   * Deployment region code
   */
  region: 'aws.us-east-1a';

  /**
   * Current status of the deployment
   */
  status: 'queued' | 'in_progress' | 'running' | 'failed' | 'stopped';

  /**
   * Relative path to the application entrypoint
   */
  entrypoint_rel_path?: string;

  /**
   * Environment variables configured for this deployment. Values are redacted for
   * API key, OAuth, and managed-auth callers, which receive every key with an empty
   * string value. Only dashboard sessions receive the actual values.
   */
  env_vars?: { [key: string]: string };

  /**
   * Hex-encoded SHA-256 checksum of the source archive. For file uploads, this
   * hashes the uploaded archive; for GitHub-sourced deployments, this hashes the
   * GitHub archive downloaded by the API. Omitted for deployments created before
   * this field was recorded.
   */
  source_checksum?: string;

  /**
   * For GitHub-sourced deployments, the subpath within the repository that was used
   * as the deploy root. Omitted when the repo root was used or for file uploads.
   */
  source_path?: string;

  /**
   * For GitHub-sourced deployments, the git ref as requested at deploy time (branch,
   * tag, or commit SHA — not resolved to a commit). Omitted for file uploads.
   */
  source_ref?: string;

  /**
   * Origin of the deployed source code. This is read-only response provenance;
   * `file` indicates an uploaded archive and `github` indicates a repository fetched
   * by the API.
   */
  source_type?: 'file' | 'github';

  /**
   * For GitHub-sourced deployments, the repository URL that was fetched. Omitted for
   * file uploads.
   */
  source_url?: string;

  /**
   * Status reason
   */
  status_reason?: string;

  /**
   * Timestamp when the deployment was last updated
   */
  updated_at?: string | null;
}

/**
 * Deployment record information.
 */
export interface DeploymentListResponse {
  /**
   * Unique identifier for the deployment
   */
  id: string;

  /**
   * Timestamp when the deployment was created
   */
  created_at: string;

  /**
   * Deployment region code
   */
  region: 'aws.us-east-1a';

  /**
   * Current status of the deployment
   */
  status: 'queued' | 'in_progress' | 'running' | 'failed' | 'stopped';

  /**
   * Relative path to the application entrypoint
   */
  entrypoint_rel_path?: string;

  /**
   * Environment variables configured for this deployment. Values are redacted for
   * API key, OAuth, and managed-auth callers, which receive every key with an empty
   * string value. Only dashboard sessions receive the actual values.
   */
  env_vars?: { [key: string]: string };

  /**
   * Hex-encoded SHA-256 checksum of the source archive. For file uploads, this
   * hashes the uploaded archive; for GitHub-sourced deployments, this hashes the
   * GitHub archive downloaded by the API. Omitted for deployments created before
   * this field was recorded.
   */
  source_checksum?: string;

  /**
   * For GitHub-sourced deployments, the subpath within the repository that was used
   * as the deploy root. Omitted when the repo root was used or for file uploads.
   */
  source_path?: string;

  /**
   * For GitHub-sourced deployments, the git ref as requested at deploy time (branch,
   * tag, or commit SHA — not resolved to a commit). Omitted for file uploads.
   */
  source_ref?: string;

  /**
   * Origin of the deployed source code. This is read-only response provenance;
   * `file` indicates an uploaded archive and `github` indicates a repository fetched
   * by the API.
   */
  source_type?: 'file' | 'github';

  /**
   * For GitHub-sourced deployments, the repository URL that was fetched. Omitted for
   * file uploads.
   */
  source_url?: string;

  /**
   * Status reason
   */
  status_reason?: string;

  /**
   * Timestamp when the deployment was last updated
   */
  updated_at?: string | null;
}

/**
 * Union type representing any deployment event.
 */
export type DeploymentFollowResponse =
  | Shared.LogEvent
  | DeploymentStateEvent
  | DeploymentFollowResponse.AppVersionSummaryEvent
  | Shared.ErrorEvent
  | Shared.HeartbeatEvent;

export namespace DeploymentFollowResponse {
  /**
   * Summary of an application version.
   */
  export interface AppVersionSummaryEvent {
    /**
     * Unique identifier for the app version
     */
    id: string;

    /**
     * List of actions available on the app
     */
    actions: Array<Shared.AppAction>;

    /**
     * Name of the application
     */
    app_name: string;

    /**
     * Event type identifier (always "app_version_summary").
     */
    event: 'app_version_summary';

    /**
     * Deployment region code
     */
    region: 'aws.us-east-1a';

    /**
     * Time the state was reported.
     */
    timestamp: string;

    /**
     * Version label for the application
     */
    version: string;

    /**
     * Environment variables configured for this app version. Not currently populated
     * on streamed app_version_summary events.
     */
    env_vars?: { [key: string]: string };
  }
}

export interface DeploymentCreateParams {
  /**
   * Relative path to the entrypoint of the application
   */
  entrypoint_rel_path?: string;

  /**
   * Map of environment variables to set for the deployed application. Each key-value
   * pair represents an environment variable.
   */
  env_vars?: { [key: string]: string };

  /**
   * ZIP file containing the application source directory
   */
  file?: Uploadable;

  /**
   * Allow overwriting an existing app version
   */
  force?: boolean;

  /**
   * Region for deployment. Currently we only support "aws.us-east-1a"
   */
  region?: 'aws.us-east-1a';

  /**
   * Source from which to fetch application code.
   */
  source?: DeploymentCreateParams.Source;

  /**
   * Version of the application. Can be any string.
   */
  version?: string;
}

export namespace DeploymentCreateParams {
  /**
   * Source from which to fetch application code.
   */
  export interface Source {
    /**
     * Relative path to the application entrypoint within the selected path.
     */
    entrypoint: string;

    /**
     * Git ref (branch, tag, or commit SHA) to fetch.
     */
    ref: string;

    /**
     * Source type identifier.
     */
    type: 'github';

    /**
     * Base repository URL (without blob/tree suffixes).
     */
    url: string;

    /**
     * Authentication for private repositories.
     */
    auth?: Source.Auth;

    /**
     * Path within the repo to deploy (omit to use repo root).
     */
    path?: string;
  }

  export namespace Source {
    /**
     * Authentication for private repositories.
     */
    export interface Auth {
      /**
       * GitHub PAT or installation access token
       */
      token: string;

      /**
       * Auth method
       */
      method: 'github_token';
    }
  }
}

export interface DeploymentListParams extends OffsetPaginationParams {
  /**
   * Filter results by application name.
   */
  app_name?: string;

  /**
   * Filter results by application version. Requires app_name to be set.
   */
  app_version?: string;

  /**
   * Search deployments by ID or app name.
   */
  query?: string;
}

export interface DeploymentFollowParams {
  /**
   * Show logs since the given time (RFC timestamps or durations like 5m).
   */
  since?: string;
}

export declare namespace Deployments {
  export {
    type DeploymentStateEvent as DeploymentStateEvent,
    type DeploymentCreateResponse as DeploymentCreateResponse,
    type DeploymentRetrieveResponse as DeploymentRetrieveResponse,
    type DeploymentListResponse as DeploymentListResponse,
    type DeploymentFollowResponse as DeploymentFollowResponse,
    type DeploymentListResponsesOffsetPagination as DeploymentListResponsesOffsetPagination,
    type DeploymentCreateParams as DeploymentCreateParams,
    type DeploymentListParams as DeploymentListParams,
    type DeploymentFollowParams as DeploymentFollowParams,
  };
}
