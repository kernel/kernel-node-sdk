// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../core/resource.mjs";
import { OffsetPagination } from "../core/pagination.mjs";
import { buildHeaders } from "../internal/headers.mjs";
import { multipartFormRequestOptions } from "../internal/uploads.mjs";
import { path } from "../internal/utils/path.mjs";
/**
 * Create, list, retrieve, and delete browser extensions.
 */
export class Extensions extends APIResource {
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
    list(query = {}, options) {
        return this._client.getAPIList('/extensions', (OffsetPagination), {
            query,
            ...options,
        });
    }
    /**
     * Delete an extension by its ID or by its name.
     *
     * @example
     * ```ts
     * await client.extensions.delete('id_or_name');
     * ```
     */
    delete(idOrName, options) {
        return this._client.delete(path `/extensions/${idOrName}`, {
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
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
    download(idOrName, options) {
        return this._client.get(path `/extensions/${idOrName}`, {
            ...options,
            headers: buildHeaders([{ Accept: 'application/octet-stream' }, options?.headers]),
            __binaryResponse: true,
        });
    }
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
    downloadFromChromeStore(query, options) {
        return this._client.get('/extensions/from_chrome_store', {
            query,
            ...options,
            headers: buildHeaders([{ Accept: 'application/octet-stream' }, options?.headers]),
            __binaryResponse: true,
        });
    }
    /**
     * Get an extension's metadata (name, size, timestamps) by ID or name, without
     * downloading the archive.
     *
     * @example
     * ```ts
     * const extension = await client.extensions.get('id_or_name');
     * ```
     */
    get(idOrName, options) {
        return this._client.get(path `/extensions/${idOrName}/metadata`, options);
    }
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
    upload(body, options) {
        return this._client.post('/extensions', multipartFormRequestOptions({ body, ...options }, this._client));
    }
}
//# sourceMappingURL=extensions.mjs.map