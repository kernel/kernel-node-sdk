// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { type Uploadable } from '../core/uploads';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { multipartFormRequestOptions } from '../internal/uploads';
import { path } from '../internal/utils/path';

export class Extensions extends APIResource {
  /**
   * List extensions owned by the caller's organization.
   *
   * @example
   * ```ts
   * const extensions = await client.extensions.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<ExtensionListResponse> {
    return this._client.get('/extensions', options);
  }

  /**
   * Delete an extension by its ID or by its name.
   *
   * @example
   * ```ts
   * await client.extensions.delete('id_or_name');
   * ```
   */
  delete(idOrName: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/extensions/${idOrName}`, {
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
  download(idOrName: string, options?: RequestOptions): APIPromise<Response> {
    return this._client.get(path`/extensions/${idOrName}`, {
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
  downloadFromChromeStore(
    query: ExtensionDownloadFromChromeStoreParams,
    options?: RequestOptions,
  ): APIPromise<Response> {
    return this._client.get('/extensions/from_chrome_store', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: 'application/octet-stream' }, options?.headers]),
      __binaryResponse: true,
    });
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
  upload(body: ExtensionUploadParams, options?: RequestOptions): APIPromise<ExtensionUploadResponse> {
    return this._client.post('/extensions', multipartFormRequestOptions({ body, ...options }, this._client));
  }
}

export type ExtensionListResponse = Array<ExtensionListResponse.ExtensionListResponseItem>;

export namespace ExtensionListResponse {
  /**
   * A browser extension uploaded to Kernel.
   */
  export interface ExtensionListResponseItem {
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
     * Timestamp when the extension was last used
     */
    last_used_at?: string | null;

    /**
     * Optional, easier-to-reference name for the extension. Must be unique within the
     * organization.
     */
    name?: string | null;
  }
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
   * Timestamp when the extension was last used
   */
  last_used_at?: string | null;

  /**
   * Optional, easier-to-reference name for the extension. Must be unique within the
   * organization.
   */
  name?: string | null;
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
   * Optional unique name within the organization to reference this extension.
   */
  name?: string;
}

export declare namespace Extensions {
  export {
    type ExtensionListResponse as ExtensionListResponse,
    type ExtensionUploadResponse as ExtensionUploadResponse,
    type ExtensionDownloadFromChromeStoreParams as ExtensionDownloadFromChromeStoreParams,
    type ExtensionUploadParams as ExtensionUploadParams,
  };
}
