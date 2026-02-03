// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as Shared from './shared';
import * as BrowsersAPI from './browsers/browsers';
import { APIPromise } from '../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { Stream } from '../core/streaming';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Invocations extends APIResource {
  /**
   * Invoke an action.
   *
   * @example
   * ```ts
   * const invocation = await client.invocations.create({
   *   action_name: 'analyze',
   *   app_name: 'my-app',
   *   version: '1.0.0',
   * });
   * ```
   */
  create(body: InvocationCreateParams, options?: RequestOptions): APIPromise<InvocationCreateResponse> {
    return this._client.post('/invocations', { body, ...options });
  }

  /**
   * Get details about an invocation's status and output.
   *
   * @example
   * ```ts
   * const invocation = await client.invocations.retrieve(
   *   'rr33xuugxj9h0bkf1rdt2bet',
   * );
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<InvocationRetrieveResponse> {
    return this._client.get(path`/invocations/${id}`, options);
  }

  /**
   * Update an invocation's status or output. This can be used to cancel an
   * invocation by setting the status to "failed".
   *
   * @example
   * ```ts
   * const invocation = await client.invocations.update('id', {
   *   status: 'succeeded',
   * });
   * ```
   */
  update(
    id: string,
    body: InvocationUpdateParams,
    options?: RequestOptions,
  ): APIPromise<InvocationUpdateResponse> {
    return this._client.patch(path`/invocations/${id}`, { body, ...options });
  }

  /**
   * List invocations. Optionally filter by application name, action name, status,
   * deployment ID, or start time.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const invocationListResponse of client.invocations.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: InvocationListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<InvocationListResponsesOffsetPagination, InvocationListResponse> {
    return this._client.getAPIList('/invocations', OffsetPagination<InvocationListResponse>, {
      query,
      ...options,
    });
  }

  /**
   * Delete all browser sessions created within the specified invocation.
   *
   * @example
   * ```ts
   * await client.invocations.deleteBrowsers('id');
   * ```
   */
  deleteBrowsers(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/invocations/${id}/browsers`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Establishes a Server-Sent Events (SSE) stream that delivers real-time logs and
   * status updates for an invocation. The stream terminates automatically once the
   * invocation reaches a terminal state.
   *
   * @example
   * ```ts
   * const response = await client.invocations.follow('id');
   * ```
   */
  follow(
    id: string,
    query: InvocationFollowParams | undefined = {},
    options?: RequestOptions,
  ): APIPromise<Stream<InvocationFollowResponse>> {
    return this._client.get(path`/invocations/${id}/events`, {
      query,
      ...options,
      headers: buildHeaders([{ Accept: 'text/event-stream' }, options?.headers]),
      stream: true,
    }) as APIPromise<Stream<InvocationFollowResponse>>;
  }

  /**
   * Returns all active browser sessions created within the specified invocation.
   *
   * @example
   * ```ts
   * const response = await client.invocations.listBrowsers(
   *   'id',
   * );
   * ```
   */
  listBrowsers(id: string, options?: RequestOptions): APIPromise<InvocationListBrowsersResponse> {
    return this._client.get(path`/invocations/${id}/browsers`, options);
  }
}

export type InvocationListResponsesOffsetPagination = OffsetPagination<InvocationListResponse>;

/**
 * An event representing the current state of an invocation.
 */
export interface InvocationStateEvent {
  /**
   * Event type identifier (always "invocation_state").
   */
  event: 'invocation_state';

  invocation: InvocationStateEvent.Invocation;

  /**
   * Time the state was reported.
   */
  timestamp: string;
}

export namespace InvocationStateEvent {
  export interface Invocation {
    /**
     * ID of the invocation
     */
    id: string;

    /**
     * Name of the action invoked
     */
    action_name: string;

    /**
     * Name of the application
     */
    app_name: string;

    /**
     * RFC 3339 Nanoseconds timestamp when the invocation started
     */
    started_at: string;

    /**
     * Status of the invocation
     */
    status: 'queued' | 'running' | 'succeeded' | 'failed';

    /**
     * Version label for the application
     */
    version: string;

    /**
     * RFC 3339 Nanoseconds timestamp when the invocation finished (null if still
     * running)
     */
    finished_at?: string | null;

    /**
     * Output produced by the action, rendered as a JSON string. This could be: string,
     * number, boolean, array, object, or null.
     */
    output?: string;

    /**
     * Payload provided to the invocation. This is a string that can be parsed as JSON.
     */
    payload?: string;

    /**
     * Status reason
     */
    status_reason?: string;
  }
}

export interface InvocationCreateResponse {
  /**
   * ID of the invocation
   */
  id: string;

  /**
   * Name of the action invoked
   */
  action_name: string;

  /**
   * Status of the invocation
   */
  status: 'queued' | 'running' | 'succeeded' | 'failed';

  /**
   * The return value of the action that was invoked, rendered as a JSON string. This
   * could be: string, number, boolean, array, object, or null.
   */
  output?: string;

  /**
   * Status reason
   */
  status_reason?: string;
}

export interface InvocationRetrieveResponse {
  /**
   * ID of the invocation
   */
  id: string;

  /**
   * Name of the action invoked
   */
  action_name: string;

  /**
   * Name of the application
   */
  app_name: string;

  /**
   * RFC 3339 Nanoseconds timestamp when the invocation started
   */
  started_at: string;

  /**
   * Status of the invocation
   */
  status: 'queued' | 'running' | 'succeeded' | 'failed';

  /**
   * Version label for the application
   */
  version: string;

  /**
   * RFC 3339 Nanoseconds timestamp when the invocation finished (null if still
   * running)
   */
  finished_at?: string | null;

  /**
   * Output produced by the action, rendered as a JSON string. This could be: string,
   * number, boolean, array, object, or null.
   */
  output?: string;

  /**
   * Payload provided to the invocation. This is a string that can be parsed as JSON.
   */
  payload?: string;

  /**
   * Status reason
   */
  status_reason?: string;
}

export interface InvocationUpdateResponse {
  /**
   * ID of the invocation
   */
  id: string;

  /**
   * Name of the action invoked
   */
  action_name: string;

  /**
   * Name of the application
   */
  app_name: string;

  /**
   * RFC 3339 Nanoseconds timestamp when the invocation started
   */
  started_at: string;

  /**
   * Status of the invocation
   */
  status: 'queued' | 'running' | 'succeeded' | 'failed';

  /**
   * Version label for the application
   */
  version: string;

  /**
   * RFC 3339 Nanoseconds timestamp when the invocation finished (null if still
   * running)
   */
  finished_at?: string | null;

  /**
   * Output produced by the action, rendered as a JSON string. This could be: string,
   * number, boolean, array, object, or null.
   */
  output?: string;

  /**
   * Payload provided to the invocation. This is a string that can be parsed as JSON.
   */
  payload?: string;

  /**
   * Status reason
   */
  status_reason?: string;
}

export interface InvocationListResponse {
  /**
   * ID of the invocation
   */
  id: string;

  /**
   * Name of the action invoked
   */
  action_name: string;

  /**
   * Name of the application
   */
  app_name: string;

  /**
   * RFC 3339 Nanoseconds timestamp when the invocation started
   */
  started_at: string;

  /**
   * Status of the invocation
   */
  status: 'queued' | 'running' | 'succeeded' | 'failed';

  /**
   * Version label for the application
   */
  version: string;

  /**
   * RFC 3339 Nanoseconds timestamp when the invocation finished (null if still
   * running)
   */
  finished_at?: string | null;

  /**
   * Output produced by the action, rendered as a JSON string. This could be: string,
   * number, boolean, array, object, or null.
   */
  output?: string;

  /**
   * Payload provided to the invocation. This is a string that can be parsed as JSON.
   */
  payload?: string;

  /**
   * Status reason
   */
  status_reason?: string;
}

/**
 * Union type representing any invocation event.
 */
export type InvocationFollowResponse =
  | Shared.LogEvent
  | InvocationStateEvent
  | Shared.ErrorEvent
  | Shared.HeartbeatEvent;

export interface InvocationListBrowsersResponse {
  browsers: Array<InvocationListBrowsersResponse.Browser>;
}

export namespace InvocationListBrowsersResponse {
  export interface Browser {
    /**
     * Websocket URL for Chrome DevTools Protocol connections to the browser session
     */
    cdp_ws_url: string;

    /**
     * When the browser session was created.
     */
    created_at: string;

    /**
     * Whether the browser session is running in headless mode.
     */
    headless: boolean;

    /**
     * Unique identifier for the browser session
     */
    session_id: string;

    /**
     * Whether the browser session is running in stealth mode.
     */
    stealth: boolean;

    /**
     * The number of seconds of inactivity before the browser session is terminated.
     */
    timeout_seconds: number;

    /**
     * Remote URL for live viewing the browser session. Only available for non-headless
     * browsers.
     */
    browser_live_view_url?: string;

    /**
     * When the browser session was soft-deleted. Only present for deleted sessions.
     */
    deleted_at?: string;

    /**
     * Whether the browser session is running in kiosk mode.
     */
    kiosk_mode?: boolean;

    /**
     * @deprecated DEPRECATED: Use timeout_seconds (up to 72 hours) and Profiles
     * instead.
     */
    persistence?: BrowsersAPI.BrowserPersistence;

    /**
     * Browser profile metadata.
     */
    profile?: BrowsersAPI.Profile;

    /**
     * ID of the proxy associated with this browser session, if any.
     */
    proxy_id?: string;

    /**
     * Initial browser window size in pixels with optional refresh rate. If omitted,
     * image defaults apply (1920x1080@25). Only specific viewport configurations are
     * supported. The server will reject unsupported combinations. Supported
     * resolutions are: 2560x1440@10, 1920x1080@25, 1920x1200@25, 1440x900@25,
     * 1280x800@60, 1024x768@60, 1200x800@60 If refresh_rate is not provided, it will
     * be automatically determined from the width and height if they match a supported
     * configuration exactly. Note: Higher resolutions may affect the responsiveness of
     * live view browser
     */
    viewport?: Shared.BrowserViewport;
  }
}

export interface InvocationCreateParams {
  /**
   * Name of the action to invoke
   */
  action_name: string;

  /**
   * Name of the application
   */
  app_name: string;

  /**
   * Version of the application
   */
  version: string;

  /**
   * If true, invoke asynchronously. When set, the API responds 202 Accepted with
   * status "queued".
   */
  async?: boolean;

  /**
   * Timeout in seconds for async invocations (min 10, max 3600). Only applies when
   * async is true.
   */
  async_timeout_seconds?: number;

  /**
   * Input data for the action, sent as a JSON string.
   */
  payload?: string;
}

export interface InvocationUpdateParams {
  /**
   * New status for the invocation.
   */
  status: 'succeeded' | 'failed';

  /**
   * Updated output of the invocation rendered as JSON string.
   */
  output?: string;
}

export interface InvocationListParams extends OffsetPaginationParams {
  /**
   * Filter results by action name.
   */
  action_name?: string;

  /**
   * Filter results by application name.
   */
  app_name?: string;

  /**
   * Filter results by deployment ID.
   */
  deployment_id?: string;

  /**
   * Show invocations that have started since the given time (RFC timestamps or
   * durations like 5m).
   */
  since?: string;

  /**
   * Filter results by invocation status.
   */
  status?: 'queued' | 'running' | 'succeeded' | 'failed';

  /**
   * Filter results by application version.
   */
  version?: string;
}

export interface InvocationFollowParams {
  /**
   * Show logs since the given time (RFC timestamps or durations like 5m).
   */
  since?: string;
}

export declare namespace Invocations {
  export {
    type InvocationStateEvent as InvocationStateEvent,
    type InvocationCreateResponse as InvocationCreateResponse,
    type InvocationRetrieveResponse as InvocationRetrieveResponse,
    type InvocationUpdateResponse as InvocationUpdateResponse,
    type InvocationListResponse as InvocationListResponse,
    type InvocationFollowResponse as InvocationFollowResponse,
    type InvocationListBrowsersResponse as InvocationListBrowsersResponse,
    type InvocationListResponsesOffsetPagination as InvocationListResponsesOffsetPagination,
    type InvocationCreateParams as InvocationCreateParams,
    type InvocationUpdateParams as InvocationUpdateParams,
    type InvocationListParams as InvocationListParams,
    type InvocationFollowParams as InvocationFollowParams,
  };
}
