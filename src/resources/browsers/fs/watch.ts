// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import { APIPromise } from '../../../core/api-promise';
import { Stream } from '../../../core/streaming';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

/**
 * Read, write, and manage files on the browser instance.
 */
export class Watch extends APIResource {
  /**
   * Stream filesystem events for a watch
   *
   * @example
   * ```ts
   * const response = await client.browsers.fs.watch.events(
   *   'watch_id',
   *   { id_or_name: 'htzv5orfit78e1m2biiifpbv' },
   * );
   * ```
   */
  events(
    watchID: string,
    params: WatchEventsParams,
    options?: RequestOptions,
  ): APIPromise<Stream<WatchEventsResponse>> {
    const { id_or_name } = params;
    return this._client.get(path`/browsers/${id_or_name}/fs/watch/${watchID}/events`, {
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
   *   'htzv5orfit78e1m2biiifpbv',
   *   { path: 'path' },
   * );
   * ```
   */
  start(idOrName: string, body: WatchStartParams, options?: RequestOptions): APIPromise<WatchStartResponse> {
    return this._client.post(path`/browsers/${idOrName}/fs/watch`, { body, ...options });
  }

  /**
   * Stop watching a directory
   *
   * @example
   * ```ts
   * await client.browsers.fs.watch.stop('watch_id', {
   *   id_or_name: 'htzv5orfit78e1m2biiifpbv',
   * });
   * ```
   */
  stop(watchID: string, params: WatchStopParams, options?: RequestOptions): APIPromise<void> {
    const { id_or_name } = params;
    return this._client.delete(path`/browsers/${id_or_name}/fs/watch/${watchID}`, {
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
   * Browser session ID or name
   */
  id_or_name: string;
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
   * Browser session ID or name
   */
  id_or_name: string;
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
