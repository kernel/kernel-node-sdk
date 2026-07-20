import { APIConnectionError, APIError, APIUserAbortError, KernelError } from '../core/error';
import type { RequestOptions } from '../internal/request-options';
import type { AuditLogExportChunkParams } from '../resources/audit-logs';

const DOWNLOAD_ATTEMPTS = 7;
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
    'method' | 'path' | 'query' | 'body' | 'maxRetries' | 'stream' | '__binaryResponse' | '__streamClass'
  > {
  onProgress?(progress: AuditLogDownloadProgress): void | Promise<void>;
}

type FetchChunk = (query: AuditLogExportChunkParams, options?: RequestOptions) => Promise<Response>;

export async function downloadAuditLogs(
  fetchChunk: FetchChunk,
  query: AuditLogDownloadParams,
  destination: AuditLogDownloadDestination,
  options: AuditLogDownloadOptions = {},
): Promise<AuditLogDownloadResult> {
  if (!destination || typeof destination.write !== 'function') {
    throw new TypeError('audit log download destination must provide write()');
  }

  const { onProgress, ...requestOptions } = options;
  let cursor: string | undefined;
  const result: AuditLogDownloadResult = { bytesWritten: 0, chunks: 0, rows: 0 };

  while (true) {
    const chunk = await fetchVerifiedChunk(fetchChunk, cursor ? { ...query, cursor } : query, {
      ...requestOptions,
      maxRetries: 0,
    });
    const { nextCursor, hasMore, rows } = parseChunkHeaders(chunk.headers, cursor);
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
): Promise<{ body: Uint8Array; headers: Headers }> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      const response = await fetchChunk(query, options);
      const body = new Uint8Array(await response.arrayBuffer());
      const expected = response.headers.get('x-content-sha256');
      if (!expected) {
        throw new AuditLogDownloadError('response missing X-Content-Sha256 header');
      }
      const actual = await sha256Hex(body);
      if (actual !== expected) {
        throw new AuditLogDownloadError(
          `audit log chunk checksum mismatch (got ${actual}, want ${expected})`,
        );
      }
      return { body, headers: response.headers };
    } catch (error) {
      if (attempt === DOWNLOAD_ATTEMPTS || !isRetryable(error, options.signal)) {
        throw error;
      }
      await retryDelay(attempt, options.signal);
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
  const rows = rowCount === null ? NaN : Number(rowCount);
  if (!Number.isSafeInteger(rows) || rows < 0) {
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
  const subtle = globalThis.crypto?.subtle ?? (await import('node:crypto')).webcrypto.subtle;
  const digest = await subtle.digest('SHA-256', body);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function isRetryable(error: unknown, signal: AbortSignal | null | undefined): boolean {
  if (signal?.aborted || error instanceof APIUserAbortError) {
    return false;
  }
  if (error instanceof APIError && !(error instanceof APIConnectionError)) {
    return error.status === 429 || (error.status !== undefined && error.status >= 500);
  }
  return true;
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
      if (result <= 0 || result > body.byteLength - offset) {
        throw new AuditLogDownloadError('audit log download destination performed a short write');
      }
      offset += result;
      continue;
    }
    if (result && typeof result === 'object' && 'bytesWritten' in result) {
      const bytesWritten = (result as { bytesWritten: number }).bytesWritten;
      if (bytesWritten <= 0 || bytesWritten > body.byteLength - offset) {
        throw new AuditLogDownloadError('audit log download destination performed a short write');
      }
      offset += bytesWritten;
      continue;
    }
    return;
  }
}
