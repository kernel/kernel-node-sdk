// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../../core/resource.mjs";
import * as WatchAPI from "./watch.mjs";
import { Watch, } from "./watch.mjs";
import { buildHeaders } from "../../../internal/headers.mjs";
import { multipartFormRequestOptions } from "../../../internal/uploads.mjs";
import { path } from "../../../internal/utils/path.mjs";
/**
 * Read, write, and manage files on the browser instance.
 */
export class Fs extends APIResource {
    constructor() {
        super(...arguments);
        this.watch = new WatchAPI.Watch(this._client);
    }
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
    createDirectory(idOrName, body, options) {
        return this._client.put(path `/browsers/${idOrName}/fs/create_directory`, {
            body,
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
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
    deleteDirectory(idOrName, body, options) {
        return this._client.put(path `/browsers/${idOrName}/fs/delete_directory`, {
            body,
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
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
    deleteFile(idOrName, body, options) {
        return this._client.put(path `/browsers/${idOrName}/fs/delete_file`, {
            body,
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
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
    downloadDirZip(idOrName, query, options) {
        return this._client.get(path `/browsers/${idOrName}/fs/download_dir_zip`, {
            query,
            ...options,
            headers: buildHeaders([{ Accept: 'application/zip' }, options?.headers]),
            __binaryResponse: true,
        });
    }
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
    fileInfo(idOrName, query, options) {
        return this._client.get(path `/browsers/${idOrName}/fs/file_info`, { query, ...options });
    }
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
    listFiles(idOrName, query, options) {
        return this._client.get(path `/browsers/${idOrName}/fs/list_files`, { query, ...options });
    }
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
    move(idOrName, body, options) {
        return this._client.put(path `/browsers/${idOrName}/fs/move`, {
            body,
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
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
    readFile(idOrName, query, options) {
        return this._client.get(path `/browsers/${idOrName}/fs/read_file`, {
            query,
            ...options,
            headers: buildHeaders([{ Accept: 'application/octet-stream' }, options?.headers]),
            __binaryResponse: true,
        });
    }
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
    setFilePermissions(idOrName, body, options) {
        return this._client.put(path `/browsers/${idOrName}/fs/set_file_permissions`, {
            body,
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
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
    upload(idOrName, body, options) {
        return this._client.post(path `/browsers/${idOrName}/fs/upload`, multipartFormRequestOptions({ body, ...options, headers: buildHeaders([{ Accept: '*/*' }, options?.headers]) }, this._client));
    }
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
    uploadZip(idOrName, body, options) {
        return this._client.post(path `/browsers/${idOrName}/fs/upload_zip`, multipartFormRequestOptions({ body, ...options, headers: buildHeaders([{ Accept: '*/*' }, options?.headers]) }, this._client));
    }
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
    writeFile(idOrName, contents, params, options) {
        const { path: path_, mode } = params;
        return this._client.put(path `/browsers/${idOrName}/fs/write_file`, {
            body: contents,
            query: { path: path_, mode },
            ...options,
            headers: buildHeaders([
                { 'Content-Type': 'application/octet-stream', Accept: '*/*' },
                options?.headers,
            ]),
        });
    }
}
Fs.Watch = Watch;
//# sourceMappingURL=fs.mjs.map