import { APIConnectionTimeoutError, APIUserAbortError, KernelError } from '../core/error';
import type { RequestOptions } from '../internal/request-options';
import type { AuditLogExportChunkParams } from '../resources/audit-logs';

const DEFAULT_MAX_TRANSFER_RETRIES = 6;
const MAX_CHUNK_ROWS = 50_000;
const MAX_RETRY_DELAY_MS = 8_000;

export class AuditLogDownloadError extends KernelError {}

export type AuditLogDownloadParams = Omit<AuditLogExportChunkParams, 'cursor'>;

export interface AuditLogDownloadResult {
  bytesWritten: number;
  chunks: number;
  rows: number;
}

export interface AuditLogDownloadProgress extends AuditLogDownloadResult {
  chunkRows: number;
}

export type AuditLogDownloadWriteResult = void | number | { bytesWritten: number };

export interface AuditLogDownloadDestination {
  write(chunk: Uint8Array): AuditLogDownloadWriteResult | Promise<AuditLogDownloadWriteResult>;
}

export interface AuditLogDownloadOptions
  extends Omit<
    RequestOptions,
    'method' | 'path' | 'query' | 'body' | 'stream' | '__binaryResponse' | '__streamClass'
  > {
  onProgress?(progress: AuditLogDownloadProgress): void | Promise<void>;
  maxTransferRetries?: number;
}

type FetchChunk = (query: AuditLogExportChunkParams, options?: RequestOptions) => Promise<Response>;

export async function downloadAuditLogs(
  fetchChunk: FetchChunk,
  query: AuditLogDownloadParams,
  destination: AuditLogDownloadDestination,
  defaultTimeout: number,
  options: AuditLogDownloadOptions = {},
): Promise<AuditLogDownloadResult> {
  if (!destination || typeof destination.write !== 'function') {
    throw new TypeError('audit log download destination must provide write()');
  }

  const { onProgress, maxTransferRetries = DEFAULT_MAX_TRANSFER_RETRIES, ...requestOptions } = options;
  if (!Number.isInteger(maxTransferRetries) || maxTransferRetries < 0) {
    throw new TypeError('maxTransferRetries must be a non-negative integer');
  }
  const timeout = requestOptions.timeout ?? defaultTimeout;
  let cursor: string | undefined;
  const result: AuditLogDownloadResult = { bytesWritten: 0, chunks: 0, rows: 0 };
  const seenCursors = new Set<string>();

  while (true) {
    const chunk = await fetchVerifiedChunk(
      fetchChunk,
      cursor ? { ...query, cursor } : query,
      requestOptions,
      maxTransferRetries,
      timeout,
    );
    const { nextCursor, hasMore, rows } = parseChunkHeaders(chunk.headers, cursor);
    if (hasMore && nextCursor) {
      if (seenCursors.has(nextCursor)) {
        throw new AuditLogDownloadError('response repeated X-Next-Cursor header');
      }
      seenCursors.add(nextCursor);
    }
    await writeChunk(destination, chunk.body);

    cursor = nextCursor;
    result.bytesWritten += chunk.body.byteLength;
    result.chunks += 1;
    result.rows += rows;
    if (onProgress) {
      await onProgress({ ...result, chunkRows: rows });
    }
    if (!hasMore) {
      return result;
    }
  }
}

async function fetchVerifiedChunk(
  fetchChunk: FetchChunk,
  query: AuditLogExportChunkParams,
  options: RequestOptions,
  maxTransferRetries: number,
  timeout: number,
): Promise<{ body: Uint8Array; headers: Headers }> {
  for (let retries = 0; ; retries += 1) {
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    if (options.signal?.aborted) {
      controller.abort();
    } else {
      options.signal?.addEventListener('abort', onAbort, { once: true });
    }

    let response: Response;
    try {
      response = await fetchChunk(query, { ...options, signal: controller.signal });
    } catch (error) {
      options.signal?.removeEventListener('abort', onAbort);
      throw error;
    }

    let bodyTimedOut = false;
    const timer = setTimeout(() => {
      bodyTimedOut = true;
      controller.abort();
    }, timeout);
    try {
      const body = new Uint8Array(await response.arrayBuffer());
      const expected = response.headers.get('x-content-sha256');
      if (!expected) {
        throw new AuditLogDownloadError('response missing X-Content-Sha256 header');
      }
      const actual = await sha256Hex(body);
      if (bodyTimedOut) {
        throw new APIConnectionTimeoutError();
      }
      if (options.signal?.aborted) {
        throw new APIUserAbortError();
      }
      if (actual !== expected) {
        throw new AuditLogDownloadError(
          `audit log chunk checksum mismatch (got ${actual}, want ${expected})`,
        );
      }
      return { body, headers: response.headers };
    } catch (error) {
      if (bodyTimedOut) {
        error = new APIConnectionTimeoutError();
      } else if (options.signal?.aborted && !(error instanceof APIUserAbortError)) {
        error = new APIUserAbortError();
      }
      if (retries === maxTransferRetries || error instanceof APIUserAbortError) {
        throw error;
      }
      await retryDelay(retries + 1, options.signal);
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', onAbort);
    }
  }
}

function parseChunkHeaders(
  headers: Headers,
  currentCursor: string | undefined,
): { rows: number; nextCursor: string | undefined; hasMore: boolean } {
  const hasMoreValue = headers.get('x-has-more');
  if (hasMoreValue !== 'true' && hasMoreValue !== 'false') {
    throw new AuditLogDownloadError('response missing or invalid X-Has-More header');
  }
  const hasMore = hasMoreValue === 'true';

  const rowCount = headers.get('x-row-count');
  if (rowCount === null || !/^[0-9]+$/.test(rowCount)) {
    throw new AuditLogDownloadError('response missing or invalid X-Row-Count header');
  }
  const rows = Number(rowCount);
  if (!Number.isSafeInteger(rows) || rows > MAX_CHUNK_ROWS) {
    throw new AuditLogDownloadError('response missing or invalid X-Row-Count header');
  }

  const nextCursor = headers.get('x-next-cursor') || undefined;
  if (hasMore && (!nextCursor || nextCursor === currentCursor)) {
    throw new AuditLogDownloadError('response has invalid X-Next-Cursor header');
  }
  if (!hasMore && nextCursor) {
    throw new AuditLogDownloadError('response returned a cursor after the final chunk');
  }
  return { rows, nextCursor, hasMore };
}

async function sha256Hex(body: Uint8Array): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', body);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function retryDelay(attempt: number, signal: AbortSignal | null | undefined): Promise<void> {
  const delay = Math.min(1_000 * 2 ** (attempt - 1), MAX_RETRY_DELAY_MS);
  await new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new APIUserAbortError());
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(new APIUserAbortError());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, delay);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

async function writeChunk(destination: AuditLogDownloadDestination, body: Uint8Array): Promise<void> {
  let offset = 0;
  while (offset < body.byteLength) {
    const result = await destination.write(offset === 0 ? body : body.subarray(offset));
    if (typeof result === 'number') {
      offset += validateWriteCount(result, body.byteLength - offset);
      continue;
    }
    if (result && typeof result === 'object' && 'bytesWritten' in result) {
      const bytesWritten = (result as { bytesWritten: number }).bytesWritten;
      offset += validateWriteCount(bytesWritten, body.byteLength - offset);
      continue;
    }
    return;
  }
}

function validateWriteCount(value: number, remaining: number): number {
  if (!Number.isSafeInteger(value) || value <= 0 || value > remaining) {
    throw new AuditLogDownloadError('audit log download destination performed a short write');
  }
  return value;
}
