import { KernelError } from "../core/error.js";
import type { RequestOptions } from "../internal/request-options.js";
import type { AuditLogExportChunkParams } from "../resources/audit-logs.js";
export declare class AuditLogDownloadError extends KernelError {
}
export type AuditLogDownloadParams = Omit<AuditLogExportChunkParams, 'cursor' | 'format'>;
export interface AuditLogDownloadResult {
    bytesWritten: number;
    chunks: number;
    rows: number;
}
export interface AuditLogDownloadProgress extends AuditLogDownloadResult {
    chunkRows: number;
}
export type AuditLogDownloadWriteResult = void | number | {
    bytesWritten: number;
};
export interface AuditLogDownloadDestination {
    write(chunk: Uint8Array): AuditLogDownloadWriteResult | Promise<AuditLogDownloadWriteResult>;
}
export interface AuditLogDownloadOptions extends Omit<RequestOptions, 'method' | 'path' | 'query' | 'body' | 'stream' | '__binaryResponse' | '__streamClass'> {
    onProgress?(progress: AuditLogDownloadProgress): void | Promise<void>;
    maxTransferRetries?: number;
}
type FetchChunk = (query: AuditLogExportChunkParams, options?: RequestOptions) => Promise<Response>;
export declare function downloadAuditLogs(fetchChunk: FetchChunk, query: AuditLogDownloadParams, destination: AuditLogDownloadDestination, defaultTimeout: number, options?: AuditLogDownloadOptions): Promise<AuditLogDownloadResult>;
export {};
//# sourceMappingURL=audit-log-download.d.ts.map