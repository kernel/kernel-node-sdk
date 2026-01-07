// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import { APIPromise } from '../../../core/api-promise';
import { Stream } from '../../../core/streaming';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

export class Watch extends APIResource {
  /**
   * Stream filesystem events for a watch
   *
   * @example
   * ```ts
   * const response = await client.browsers.fs.watch.events(
   *   'watch_id',
   *   { id: 'id' },
   * );
   * ```
   */
  events(
    watchID: string,
    params: WatchEventsParams,
    options?: RequestOptions,
  ): APIPromise<Stream<WatchEventsResponse>> {
    const { id } = params;
    return this._client.get(path`/browsers/${id}/fs/watch/${watchID}/events`, {
      ...options,
      headers: buildHeaders([{ Accept: 'text/event-stream' }, options?.headers]),
      stream: true,
    }) as APIPromise<Stream<WatchEventsResponse>>;
  }

  /**
   * Watch a directory for changes
   *
   * @example
   * ```ts
   * const response = await client.browsers.fs.watch.start(
   *   'id',
   *   { path: 'path' },
   * );
   * ```
   */
  start(id: string, body: WatchStartParams, options?: RequestOptions): APIPromise<WatchStartResponse> {
    return this._client.post(path`/browsers/${id}/fs/watch`, { body, ...options });
  }

  /**
   * Stop watching a directory
   *
   * @example
   * ```ts
   * await client.browsers.fs.watch.stop('watch_id', {
   *   id: 'id',
   * });
   * ```
   */
  stop(watchID: string, params: WatchStopParams, options?: RequestOptions): APIPromise<void> {
    const { id } = params;
    return this._client.delete(path`/browsers/${id}/fs/watch/${watchID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

/**
 * Filesystem change event.
 */
export interface WatchEventsResponse {
  /**
   * Absolute path of the file or directory.
   */
  path: string;

  /**
   * Event type.
   */
  type: 'CREATE' | 'WRITE' | 'DELETE' | 'RENAME';

  /**
   * Whether the affected path is a directory.
   */
  is_dir?: boolean;

  /**
   * Base name of the file or directory affected.
   */
  name?: string;
}

export interface WatchStartResponse {
  /**
   * Unique identifier for the directory watch
   */
  watch_id?: string;
}

export interface WatchEventsParams {
  /**
   * Browser session ID
   */
  id: string;
}

export interface WatchStartParams {
  /**
   * Directory to watch.
   */
  path: string;

  /**
   * Whether to watch recursively.
   */
  recursive?: boolean;
}

export interface WatchStopParams {
  /**
   * Browser session ID
   */
  id: string;
}

export declare namespace Watch {
  export {
    type WatchEventsResponse as WatchEventsResponse,
    type WatchStartResponse as WatchStartResponse,
    type WatchEventsParams as WatchEventsParams,
    type WatchStartParams as WatchStartParams,
    type WatchStopParams as WatchStopParams,
  };
}
