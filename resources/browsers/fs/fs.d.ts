import { APIResource } from "../../../core/resource.js";
import * as WatchAPI from "./watch.js";
import { Watch, WatchEventsParams, WatchEventsResponse, WatchStartParams, WatchStartResponse, WatchStopParams } from "./watch.js";
import { APIPromise } from "../../../core/api-promise.js";
import { type Uploadable } from "../../../core/uploads.js";
import { RequestOptions } from "../../../internal/request-options.js";
/**
 * Read, write, and manage files on the browser instance.
 */
export declare class Fs extends APIResource {
    watch: WatchAPI.Watch;
    /**
     * Create a new directory
     *
     * @example
     * ```ts
     * await client.browsers.fs.createDirectory(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { path: '/J!' },
     * );
     * ```
     */
    createDirectory(idOrName: string, body: FCreateDirectoryParams, options?: RequestOptions): APIPromise<void>;
    /**
     * Delete a directory
     *
     * @example
     * ```ts
     * await client.browsers.fs.deleteDirectory(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { path: '/J!' },
     * );
     * ```
     */
    deleteDirectory(idOrName: string, body: FDeleteDirectoryParams, options?: RequestOptions): APIPromise<void>;
    /**
     * Delete a file
     *
     * @example
     * ```ts
     * await client.browsers.fs.deleteFile(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { path: '/J!' },
     * );
     * ```
     */
    deleteFile(idOrName: string, body: FDeleteFileParams, options?: RequestOptions): APIPromise<void>;
    /**
     * Returns a ZIP file containing the contents of the specified directory.
     *
     * @example
     * ```ts
     * const response = await client.browsers.fs.downloadDirZip(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { path: '/J!' },
     * );
     *
     * const content = await response.blob();
     * console.log(content);
     * ```
     */
    downloadDirZip(idOrName: string, query: FDownloadDirZipParams, options?: RequestOptions): APIPromise<Response>;
    /**
     * Get information about a file or directory
     *
     * @example
     * ```ts
     * const response = await client.browsers.fs.fileInfo(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { path: '/J!' },
     * );
     * ```
     */
    fileInfo(idOrName: string, query: FFileInfoParams, options?: RequestOptions): APIPromise<FFileInfoResponse>;
    /**
     * List files in a directory
     *
     * @example
     * ```ts
     * const response = await client.browsers.fs.listFiles(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { path: '/J!' },
     * );
     * ```
     */
    listFiles(idOrName: string, query: FListFilesParams, options?: RequestOptions): APIPromise<FListFilesResponse>;
    /**
     * Move or rename a file or directory
     *
     * @example
     * ```ts
     * await client.browsers.fs.move('htzv5orfit78e1m2biiifpbv', {
     *   dest_path: '/J!',
     *   src_path: '/J!',
     * });
     * ```
     */
    move(idOrName: string, body: FMoveParams, options?: RequestOptions): APIPromise<void>;
    /**
     * Read file contents
     *
     * @example
     * ```ts
     * const response = await client.browsers.fs.readFile(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { path: '/J!' },
     * );
     *
     * const content = await response.blob();
     * console.log(content);
     * ```
     */
    readFile(idOrName: string, query: FReadFileParams, options?: RequestOptions): APIPromise<Response>;
    /**
     * Set file or directory permissions/ownership
     *
     * @example
     * ```ts
     * await client.browsers.fs.setFilePermissions(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { mode: '0611', path: '/J!' },
     * );
     * ```
     */
    setFilePermissions(idOrName: string, body: FSetFilePermissionsParams, options?: RequestOptions): APIPromise<void>;
    /**
     * Allows uploading single or multiple files to the remote filesystem.
     *
     * @example
     * ```ts
     * await client.browsers.fs.upload(
     *   'htzv5orfit78e1m2biiifpbv',
     *   {
     *     files: [
     *       {
     *         dest_path: '/J!',
     *         file: fs.createReadStream('path/to/file'),
     *       },
     *     ],
     *   },
     * );
     * ```
     */
    upload(idOrName: string, body: FUploadParams, options?: RequestOptions): APIPromise<void>;
    /**
     * Upload a zip file and extract its contents to the specified destination path.
     *
     * @example
     * ```ts
     * await client.browsers.fs.uploadZip(
     *   'htzv5orfit78e1m2biiifpbv',
     *   {
     *     dest_path: '/J!',
     *     zip_file: fs.createReadStream('path/to/file'),
     *   },
     * );
     * ```
     */
    uploadZip(idOrName: string, body: FUploadZipParams, options?: RequestOptions): APIPromise<void>;
    /**
     * Write or create a file
     *
     * @example
     * ```ts
     * await client.browsers.fs.writeFile(
     *   'htzv5orfit78e1m2biiifpbv',
     *   fs.createReadStream('path/to/file'),
     *   { path: '/J!' },
     * );
     * ```
     */
    writeFile(idOrName: string, contents: string | ArrayBuffer | ArrayBufferView | Blob | DataView, params: FWriteFileParams, options?: RequestOptions): APIPromise<void>;
}
export interface FFileInfoResponse {
    /**
     * Whether the path is a directory.
     */
    is_dir: boolean;
    /**
     * Last modification time.
     */
    mod_time: string;
    /**
     * File mode bits (e.g., "drwxr-xr-x" or "-rw-r--r--").
     */
    mode: string;
    /**
     * Base name of the file or directory.
     */
    name: string;
    /**
     * Absolute path.
     */
    path: string;
    /**
     * Size in bytes. 0 for directories.
     */
    size_bytes: number;
}
/**
 * Array of file or directory information entries.
 */
export type FListFilesResponse = Array<FListFilesResponse.FListFilesResponseItem>;
export declare namespace FListFilesResponse {
    interface FListFilesResponseItem {
        /**
         * Whether the path is a directory.
         */
        is_dir: boolean;
        /**
         * Last modification time.
         */
        mod_time: string;
        /**
         * File mode bits (e.g., "drwxr-xr-x" or "-rw-r--r--").
         */
        mode: string;
        /**
         * Base name of the file or directory.
         */
        name: string;
        /**
         * Absolute path.
         */
        path: string;
        /**
         * Size in bytes. 0 for directories.
         */
        size_bytes: number;
    }
}
export interface FCreateDirectoryParams {
    /**
     * Absolute directory path to create.
     */
    path: string;
    /**
     * Optional directory mode (octal string, e.g. 755). Defaults to 755.
     */
    mode?: string;
}
export interface FDeleteDirectoryParams {
    /**
     * Absolute path to delete.
     */
    path: string;
}
export interface FDeleteFileParams {
    /**
     * Absolute path to delete.
     */
    path: string;
}
export interface FDownloadDirZipParams {
    /**
     * Absolute directory path to archive and download.
     */
    path: string;
}
export interface FFileInfoParams {
    /**
     * Absolute path of the file or directory.
     */
    path: string;
}
export interface FListFilesParams {
    /**
     * Absolute directory path.
     */
    path: string;
}
export interface FMoveParams {
    /**
     * Absolute destination path.
     */
    dest_path: string;
    /**
     * Absolute source path.
     */
    src_path: string;
}
export interface FReadFileParams {
    /**
     * Absolute file path to read.
     */
    path: string;
}
export interface FSetFilePermissionsParams {
    /**
     * File mode bits (octal string, e.g. 644).
     */
    mode: string;
    /**
     * Absolute path whose permissions are to be changed.
     */
    path: string;
    /**
     * New group name or GID.
     */
    group?: string;
    /**
     * New owner username or UID.
     */
    owner?: string;
}
export interface FUploadParams {
    files: Array<FUploadParams.File>;
}
export declare namespace FUploadParams {
    interface File {
        /**
         * Absolute destination path to write the file.
         */
        dest_path: string;
        file: Uploadable;
    }
}
export interface FUploadZipParams {
    /**
     * Absolute destination directory to extract the archive to.
     */
    dest_path: string;
    zip_file: Uploadable;
}
export interface FWriteFileParams {
    /**
     * Query param: Destination absolute file path.
     */
    path: string;
    /**
     * Query param: Optional file mode (octal string, e.g. 644). Defaults to 644.
     */
    mode?: string;
}
export declare namespace Fs {
    export { type FFileInfoResponse as FFileInfoResponse, type FListFilesResponse as FListFilesResponse, type FCreateDirectoryParams as FCreateDirectoryParams, type FDeleteDirectoryParams as FDeleteDirectoryParams, type FDeleteFileParams as FDeleteFileParams, type FDownloadDirZipParams as FDownloadDirZipParams, type FFileInfoParams as FFileInfoParams, type FListFilesParams as FListFilesParams, type FMoveParams as FMoveParams, type FReadFileParams as FReadFileParams, type FSetFilePermissionsParams as FSetFilePermissionsParams, type FUploadParams as FUploadParams, type FUploadZipParams as FUploadZipParams, type FWriteFileParams as FWriteFileParams, };
    export { Watch as Watch, type WatchEventsResponse as WatchEventsResponse, type WatchStartResponse as WatchStartResponse, type WatchEventsParams as WatchEventsParams, type WatchStartParams as WatchStartParams, type WatchStopParams as WatchStopParams, };
}
//# sourceMappingURL=fs.d.ts.map