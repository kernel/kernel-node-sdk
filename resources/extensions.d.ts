import { APIResource } from "../core/resource.js";
import { APIPromise } from "../core/api-promise.js";
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from "../core/pagination.js";
import { type Uploadable } from "../core/uploads.js";
import { RequestOptions } from "../internal/request-options.js";
/**
 * Create, list, retrieve, and delete browser extensions.
 */
export declare class Extensions extends APIResource {
    /**
     * List extensions in the resolved project.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const extensionListResponse of client.extensions.list()) {
     *   // ...
     * }
     * ```
     */
    list(query?: ExtensionListParams | null | undefined, options?: RequestOptions): PagePromise<ExtensionListResponsesOffsetPagination, ExtensionListResponse>;
    /**
     * Delete an extension by its ID or by its name.
     *
     * @example
     * ```ts
     * await client.extensions.delete('id_or_name');
     * ```
     */
    delete(idOrName: string, options?: RequestOptions): APIPromise<void>;
    /**
     * Download the extension as a ZIP archive by ID or name.
     *
     * @example
     * ```ts
     * const response = await client.extensions.download(
     *   'id_or_name',
     * );
     *
     * const content = await response.blob();
     * console.log(content);
     * ```
     */
    download(idOrName: string, options?: RequestOptions): APIPromise<Response>;
    /**
     * Returns a ZIP archive containing the unpacked extension fetched from the Chrome
     * Web Store.
     *
     * @example
     * ```ts
     * const response =
     *   await client.extensions.downloadFromChromeStore({
     *     url: 'url',
     *   });
     *
     * const content = await response.blob();
     * console.log(content);
     * ```
     */
    downloadFromChromeStore(query: ExtensionDownloadFromChromeStoreParams, options?: RequestOptions): APIPromise<Response>;
    /**
     * Get an extension's metadata (name, size, timestamps) by ID or name, without
     * downloading the archive.
     *
     * @example
     * ```ts
     * const extension = await client.extensions.get('id_or_name');
     * ```
     */
    get(idOrName: string, options?: RequestOptions): APIPromise<ExtensionGetResponse>;
    /**
     * Upload a zip file containing an unpacked browser extension. Optionally provide a
     * unique name for later reference.
     *
     * @example
     * ```ts
     * const response = await client.extensions.upload({
     *   file: fs.createReadStream('path/to/file'),
     * });
     * ```
     */
    upload(body: ExtensionUploadParams, options?: RequestOptions): APIPromise<ExtensionUploadResponse>;
}
export type ExtensionListResponsesOffsetPagination = OffsetPagination<ExtensionListResponse>;
/**
 * A browser extension uploaded to Kernel.
 */
export interface ExtensionListResponse {
    /**
     * Unique identifier for the extension
     */
    id: string;
    /**
     * Timestamp when the extension was created
     */
    created_at: string;
    /**
     * Size of the extension archive in bytes
     */
    size_bytes: number;
    /**
     * SHA-256 checksum, encoded as lowercase hexadecimal, of the exact uploaded
     * extension archive bytes. This is not a normalized checksum of the extension
     * contents; archive metadata, file ordering, and compression can change the
     * checksum for otherwise identical contents. Omitted for legacy rows and
     * server-repackaged Chrome Web Store extensions.
     */
    checksum?: string | null;
    /**
     * Timestamp when the extension was last used
     */
    last_used_at?: string | null;
    /**
     * Optional, easier-to-reference name for the extension. Must be unique within the
     * project.
     */
    name?: string | null;
}
/**
 * A browser extension uploaded to Kernel.
 */
export interface ExtensionGetResponse {
    /**
     * Unique identifier for the extension
     */
    id: string;
    /**
     * Timestamp when the extension was created
     */
    created_at: string;
    /**
     * Size of the extension archive in bytes
     */
    size_bytes: number;
    /**
     * SHA-256 checksum, encoded as lowercase hexadecimal, of the exact uploaded
     * extension archive bytes. This is not a normalized checksum of the extension
     * contents; archive metadata, file ordering, and compression can change the
     * checksum for otherwise identical contents. Omitted for legacy rows and
     * server-repackaged Chrome Web Store extensions.
     */
    checksum?: string | null;
    /**
     * Timestamp when the extension was last used
     */
    last_used_at?: string | null;
    /**
     * Optional, easier-to-reference name for the extension. Must be unique within the
     * project.
     */
    name?: string | null;
}
/**
 * A browser extension uploaded to Kernel.
 */
export interface ExtensionUploadResponse {
    /**
     * Unique identifier for the extension
     */
    id: string;
    /**
     * Timestamp when the extension was created
     */
    created_at: string;
    /**
     * Size of the extension archive in bytes
     */
    size_bytes: number;
    /**
     * SHA-256 checksum, encoded as lowercase hexadecimal, of the exact uploaded
     * extension archive bytes. This is not a normalized checksum of the extension
     * contents; archive metadata, file ordering, and compression can change the
     * checksum for otherwise identical contents. Omitted for legacy rows and
     * server-repackaged Chrome Web Store extensions.
     */
    checksum?: string | null;
    /**
     * Timestamp when the extension was last used
     */
    last_used_at?: string | null;
    /**
     * Optional, easier-to-reference name for the extension. Must be unique within the
     * project.
     */
    name?: string | null;
}
export interface ExtensionListParams extends OffsetPaginationParams {
    /**
     * Exact-match filter on extension name using the database collation. In
     * production, matching is case- and accent-insensitive. During the default-project
     * migration, unscoped requests prefer a concrete default-project extension over a
     * legacy unscoped extension with the same name.
     */
    name?: string;
    /**
     * Case-insensitive substring match against extension name. IDs match by exact
     * value.
     */
    query?: string;
}
export interface ExtensionDownloadFromChromeStoreParams {
    /**
     * Chrome Web Store URL for the extension.
     */
    url: string;
    /**
     * Target operating system for the extension package. Defaults to linux.
     */
    os?: 'win' | 'mac' | 'linux';
}
export interface ExtensionUploadParams {
    /**
     * ZIP file containing the browser extension.
     */
    file: Uploadable;
    /**
     * Optional unique name within the project to reference this extension.
     */
    name?: string;
}
export declare namespace Extensions {
    export { type ExtensionListResponse as ExtensionListResponse, type ExtensionGetResponse as ExtensionGetResponse, type ExtensionUploadResponse as ExtensionUploadResponse, type ExtensionListResponsesOffsetPagination as ExtensionListResponsesOffsetPagination, type ExtensionListParams as ExtensionListParams, type ExtensionDownloadFromChromeStoreParams as ExtensionDownloadFromChromeStoreParams, type ExtensionUploadParams as ExtensionUploadParams, };
}
//# sourceMappingURL=extensions.d.ts.map