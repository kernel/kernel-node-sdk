// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as Shared from '../shared';
import { APIPromise } from '../../core/api-promise';
import { Stream } from '../../core/streaming';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Logs extends APIResource {
  /**
   * Stream log files on the browser instance via SSE
   *
   * @example
   * ```ts
   * const logEvent = await client.browsers.logs.stream('id', {
   *   source: 'path',
   * });
   * ```
   */
  stream(id: string, query: LogStreamParams, options?: RequestOptions): APIPromise<Stream<Shared.LogEvent>> {
    return this._client.get(path`/browsers/${id}/logs/stream`, {
      query,
      ...options,
      headers: buildHeaders([{ Accept: 'text/event-stream' }, options?.headers]),
      stream: true,
    }) as APIPromise<Stream<Shared.LogEvent>>;
  }
}

export interface LogStreamParams {
  source: 'path' | 'supervisor';

  follow?: boolean;

  /**
   * only required if source is path
   */
  path?: string;

  /**
   * only required if source is supervisor
   */
  supervisor_process?: string;
}

export declare namespace Logs {
  export { type LogStreamParams as LogStreamParams };
}
