// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { Stream } from '../../core/streaming';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Process extends APIResource {
  /**
   * Execute a command synchronously
   *
   * @example
   * ```ts
   * const response = await client.browsers.process.exec('id', {
   *   command: 'command',
   * });
   * ```
   */
  exec(id: string, body: ProcessExecParams, options?: RequestOptions): APIPromise<ProcessExecResponse> {
    return this._client.post(path`/browsers/${id}/process/exec`, { body, ...options });
  }

  /**
   * Send signal to process
   *
   * @example
   * ```ts
   * const response = await client.browsers.process.kill(
   *   '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
   *   { id: 'id', signal: 'TERM' },
   * );
   * ```
   */
  kill(
    processID: string,
    params: ProcessKillParams,
    options?: RequestOptions,
  ): APIPromise<ProcessKillResponse> {
    const { id, ...body } = params;
    return this._client.post(path`/browsers/${id}/process/${processID}/kill`, { body, ...options });
  }

  /**
   * Execute a command asynchronously
   *
   * @example
   * ```ts
   * const response = await client.browsers.process.spawn('id', {
   *   command: 'command',
   * });
   * ```
   */
  spawn(id: string, body: ProcessSpawnParams, options?: RequestOptions): APIPromise<ProcessSpawnResponse> {
    return this._client.post(path`/browsers/${id}/process/spawn`, { body, ...options });
  }

  /**
   * Get process status
   *
   * @example
   * ```ts
   * const response = await client.browsers.process.status(
   *   '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
   *   { id: 'id' },
   * );
   * ```
   */
  status(
    processID: string,
    params: ProcessStatusParams,
    options?: RequestOptions,
  ): APIPromise<ProcessStatusResponse> {
    const { id } = params;
    return this._client.get(path`/browsers/${id}/process/${processID}/status`, options);
  }

  /**
   * Write to process stdin
   *
   * @example
   * ```ts
   * const response = await client.browsers.process.stdin(
   *   '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
   *   { id: 'id', data_b64: 'data_b64' },
   * );
   * ```
   */
  stdin(
    processID: string,
    params: ProcessStdinParams,
    options?: RequestOptions,
  ): APIPromise<ProcessStdinResponse> {
    const { id, ...body } = params;
    return this._client.post(path`/browsers/${id}/process/${processID}/stdin`, { body, ...options });
  }

  /**
   * Stream process stdout via SSE
   *
   * @example
   * ```ts
   * const response = await client.browsers.process.stdoutStream(
   *   '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
   *   { id: 'id' },
   * );
   * ```
   */
  stdoutStream(
    processID: string,
    params: ProcessStdoutStreamParams,
    options?: RequestOptions,
  ): APIPromise<Stream<ProcessStdoutStreamResponse>> {
    const { id } = params;
    return this._client.get(path`/browsers/${id}/process/${processID}/stdout/stream`, {
      ...options,
      headers: buildHeaders([{ Accept: 'text/event-stream' }, options?.headers]),
      stream: true,
    }) as APIPromise<Stream<ProcessStdoutStreamResponse>>;
  }
}

/**
 * Result of a synchronous command execution.
 */
export interface ProcessExecResponse {
  /**
   * Execution duration in milliseconds.
   */
  duration_ms?: number;

  /**
   * Process exit code.
   */
  exit_code?: number;

  /**
   * Base64-encoded stderr buffer.
   */
  stderr_b64?: string;

  /**
   * Base64-encoded stdout buffer.
   */
  stdout_b64?: string;
}

/**
 * Generic OK response.
 */
export interface ProcessKillResponse {
  /**
   * Indicates success.
   */
  ok: boolean;
}

/**
 * Information about a spawned process.
 */
export interface ProcessSpawnResponse {
  /**
   * OS process ID.
   */
  pid?: number;

  /**
   * Server-assigned identifier for the process.
   */
  process_id?: string;

  /**
   * Timestamp when the process started.
   */
  started_at?: string;
}

/**
 * Current status of a process.
 */
export interface ProcessStatusResponse {
  /**
   * Estimated CPU usage percentage.
   */
  cpu_pct?: number;

  /**
   * Exit code if the process has exited.
   */
  exit_code?: number | null;

  /**
   * Estimated resident memory usage in bytes.
   */
  mem_bytes?: number;

  /**
   * Process state.
   */
  state?: 'running' | 'exited';
}

/**
 * Result of writing to stdin.
 */
export interface ProcessStdinResponse {
  /**
   * Number of bytes written.
   */
  written_bytes?: number;
}

/**
 * SSE payload representing process output or lifecycle events.
 */
export interface ProcessStdoutStreamResponse {
  /**
   * Base64-encoded data from the process stream.
   */
  data_b64?: string;

  /**
   * Lifecycle event type.
   */
  event?: 'exit';

  /**
   * Exit code when the event is "exit".
   */
  exit_code?: number;

  /**
   * Source stream of the data chunk.
   */
  stream?: 'stdout' | 'stderr';
}

export interface ProcessExecParams {
  /**
   * Executable or shell command to run.
   */
  command: string;

  /**
   * Command arguments.
   */
  args?: Array<string>;

  /**
   * Run the process with root privileges.
   */
  as_root?: boolean;

  /**
   * Run the process as this user.
   */
  as_user?: string | null;

  /**
   * Working directory (absolute path) to run the command in.
   */
  cwd?: string | null;

  /**
   * Environment variables to set for the process.
   */
  env?: { [key: string]: string };

  /**
   * Maximum execution time in seconds.
   */
  timeout_sec?: number | null;
}

export interface ProcessKillParams {
  /**
   * Path param: Browser session ID
   */
  id: string;

  /**
   * Body param: Signal to send.
   */
  signal: 'TERM' | 'KILL' | 'INT' | 'HUP';
}

export interface ProcessSpawnParams {
  /**
   * Executable or shell command to run.
   */
  command: string;

  /**
   * Command arguments.
   */
  args?: Array<string>;

  /**
   * Run the process with root privileges.
   */
  as_root?: boolean;

  /**
   * Run the process as this user.
   */
  as_user?: string | null;

  /**
   * Working directory (absolute path) to run the command in.
   */
  cwd?: string | null;

  /**
   * Environment variables to set for the process.
   */
  env?: { [key: string]: string };

  /**
   * Maximum execution time in seconds.
   */
  timeout_sec?: number | null;
}

export interface ProcessStatusParams {
  /**
   * Browser session ID
   */
  id: string;
}

export interface ProcessStdinParams {
  /**
   * Path param: Browser session ID
   */
  id: string;

  /**
   * Body param: Base64-encoded data to write.
   */
  data_b64: string;
}

export interface ProcessStdoutStreamParams {
  /**
   * Browser session ID
   */
  id: string;
}

export declare namespace Process {
  export {
    type ProcessExecResponse as ProcessExecResponse,
    type ProcessKillResponse as ProcessKillResponse,
    type ProcessSpawnResponse as ProcessSpawnResponse,
    type ProcessStatusResponse as ProcessStatusResponse,
    type ProcessStdinResponse as ProcessStdinResponse,
    type ProcessStdoutStreamResponse as ProcessStdoutStreamResponse,
    type ProcessExecParams as ProcessExecParams,
    type ProcessKillParams as ProcessKillParams,
    type ProcessSpawnParams as ProcessSpawnParams,
    type ProcessStatusParams as ProcessStatusParams,
    type ProcessStdinParams as ProcessStdinParams,
    type ProcessStdoutStreamParams as ProcessStdoutStreamParams,
  };
}
