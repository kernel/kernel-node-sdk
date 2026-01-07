// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Replays extends APIResource {
  /**
   * List all replays for the specified browser session.
   *
   * @example
   * ```ts
   * const replays = await client.browsers.replays.list('id');
   * ```
   */
  list(id: string, options?: RequestOptions): APIPromise<ReplayListResponse> {
    return this._client.get(path`/browsers/${id}/replays`, options);
  }

  /**
   * Download or stream the specified replay recording.
   *
   * @example
   * ```ts
   * const response = await client.browsers.replays.download(
   *   'replay_id',
   *   { id: 'id' },
   * );
   *
   * const content = await response.blob();
   * console.log(content);
   * ```
   */
  download(replayID: string, params: ReplayDownloadParams, options?: RequestOptions): APIPromise<Response> {
    const { id } = params;
    return this._client.get(path`/browsers/${id}/replays/${replayID}`, {
      ...options,
      headers: buildHeaders([{ Accept: 'video/mp4' }, options?.headers]),
      __binaryResponse: true,
    });
  }

  /**
   * Start recording the browser session and return a replay ID.
   *
   * @example
   * ```ts
   * const response = await client.browsers.replays.start('id');
   * ```
   */
  start(
    id: string,
    body: ReplayStartParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ReplayStartResponse> {
    return this._client.post(path`/browsers/${id}/replays`, { body, ...options });
  }

  /**
   * Stop the specified replay recording and persist the video.
   *
   * @example
   * ```ts
   * await client.browsers.replays.stop('replay_id', {
   *   id: 'id',
   * });
   * ```
   */
  stop(replayID: string, params: ReplayStopParams, options?: RequestOptions): APIPromise<void> {
    const { id } = params;
    return this._client.post(path`/browsers/${id}/replays/${replayID}/stop`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export type ReplayListResponse = Array<ReplayListResponse.ReplayListResponseItem>;

export namespace ReplayListResponse {
  /**
   * Information about a browser replay recording.
   */
  export interface ReplayListResponseItem {
    /**
     * Unique identifier for the replay recording.
     */
    replay_id: string;

    /**
     * Timestamp when replay finished
     */
    finished_at?: string | null;

    /**
     * URL for viewing the replay recording.
     */
    replay_view_url?: string;

    /**
     * Timestamp when replay started
     */
    started_at?: string | null;
  }
}

/**
 * Information about a browser replay recording.
 */
export interface ReplayStartResponse {
  /**
   * Unique identifier for the replay recording.
   */
  replay_id: string;

  /**
   * Timestamp when replay finished
   */
  finished_at?: string | null;

  /**
   * URL for viewing the replay recording.
   */
  replay_view_url?: string;

  /**
   * Timestamp when replay started
   */
  started_at?: string | null;
}

export interface ReplayDownloadParams {
  /**
   * Browser session ID
   */
  id: string;
}

export interface ReplayStartParams {
  /**
   * Recording framerate in fps.
   */
  framerate?: number;

  /**
   * Maximum recording duration in seconds.
   */
  max_duration_in_seconds?: number;
}

export interface ReplayStopParams {
  /**
   * Browser session ID
   */
  id: string;
}

export declare namespace Replays {
  export {
    type ReplayListResponse as ReplayListResponse,
    type ReplayStartResponse as ReplayStartResponse,
    type ReplayDownloadParams as ReplayDownloadParams,
    type ReplayStartParams as ReplayStartParams,
    type ReplayStopParams as ReplayStopParams,
  };
}
