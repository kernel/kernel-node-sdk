"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogDownloadError = void 0;
exports.downloadAuditLogs = downloadAuditLogs;
const error_1 = require("../core/error.js");
const DEFAULT_MAX_TRANSFER_RETRIES = 6;
const MAX_CHUNK_ROWS = 50000;
const MAX_RETRY_DELAY_MS = 8000;
class AuditLogDownloadError extends error_1.KernelError {
}
exports.AuditLogDownloadError = AuditLogDownloadError;
async function downloadAuditLogs(fetchChunk, query, destination, defaultTimeout, options = {}) {
    if (!destination || typeof destination.write !== 'function') {
        throw new TypeError('audit log download destination must provide write()');
    }
    const { onProgress, maxTransferRetries = DEFAULT_MAX_TRANSFER_RETRIES, ...requestOptions } = options;
    if (!Number.isInteger(maxTransferRetries) || maxTransferRetries < 0) {
        throw new TypeError('maxTransferRetries must be a non-negative integer');
    }
    const timeout = requestOptions.timeout ?? defaultTimeout;
    let cursor;
    const result = { bytesWritten: 0, chunks: 0, rows: 0 };
    const seenCursors = new Set();
    while (true) {
        const chunk = await fetchVerifiedChunk(fetchChunk, cursor ? { ...query, cursor } : query, requestOptions, maxTransferRetries, timeout);
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
async function fetchVerifiedChunk(fetchChunk, query, options, maxTransferRetries, timeout) {
    for (let retries = 0;; retries += 1) {
        const controller = new AbortController();
        const onAbort = () => controller.abort();
        if (options.signal?.aborted) {
            controller.abort();
        }
        else {
            options.signal?.addEventListener('abort', onAbort, { once: true });
        }
        let response;
        try {
            response = await fetchChunk(query, { ...options, signal: controller.signal });
        }
        catch (error) {
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
            clearTimeout(timer);
            if (options.signal?.aborted) {
                throw new error_1.APIUserAbortError();
            }
            if (bodyTimedOut) {
                throw new error_1.APIConnectionTimeoutError();
            }
            const expected = response.headers.get('x-content-sha256');
            if (!expected) {
                throw new AuditLogDownloadError('response missing X-Content-Sha256 header');
            }
            const actual = await sha256Hex(body);
            if (options.signal?.aborted) {
                throw new error_1.APIUserAbortError();
            }
            if (actual !== expected) {
                throw new AuditLogDownloadError(`audit log chunk checksum mismatch (got ${actual}, want ${expected})`);
            }
            return { body, headers: response.headers };
        }
        catch (error) {
            if (options.signal?.aborted && !(error instanceof error_1.APIUserAbortError)) {
                error = new error_1.APIUserAbortError();
            }
            else if (bodyTimedOut) {
                error = new error_1.APIConnectionTimeoutError();
            }
            if (retries === maxTransferRetries || error instanceof error_1.APIUserAbortError) {
                throw error;
            }
            await retryDelay(retries + 1, options.signal);
        }
        finally {
            clearTimeout(timer);
            options.signal?.removeEventListener('abort', onAbort);
        }
    }
}
function parseChunkHeaders(headers, currentCursor) {
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
async function sha256Hex(body) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', body);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
async function retryDelay(attempt, signal) {
    const delay = Math.min(1000 * 2 ** (attempt - 1), MAX_RETRY_DELAY_MS);
    await new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new error_1.APIUserAbortError());
            return;
        }
        const onAbort = () => {
            clearTimeout(timer);
            reject(new error_1.APIUserAbortError());
        };
        const timer = setTimeout(() => {
            signal?.removeEventListener('abort', onAbort);
            resolve();
        }, delay);
        signal?.addEventListener('abort', onAbort, { once: true });
    });
}
async function writeChunk(destination, body) {
    let offset = 0;
    while (offset < body.byteLength) {
        const result = await destination.write(offset === 0 ? body : body.subarray(offset));
        if (typeof result === 'number') {
            offset += validateWriteCount(result, body.byteLength - offset);
            continue;
        }
        if (result && typeof result === 'object' && 'bytesWritten' in result) {
            const bytesWritten = result.bytesWritten;
            offset += validateWriteCount(bytesWritten, body.byteLength - offset);
            continue;
        }
        return;
    }
}
function validateWriteCount(value, remaining) {
    if (!Number.isSafeInteger(value) || value <= 0 || value > remaining) {
        throw new AuditLogDownloadError('audit log download destination performed a short write');
    }
    return value;
}
//# sourceMappingURL=audit-log-download.js.map