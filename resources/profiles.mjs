// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../core/resource.mjs";
import { OffsetPagination } from "../core/pagination.mjs";
import { buildHeaders } from "../internal/headers.mjs";
import { path } from "../internal/utils/path.mjs";
/**
 * Create, list, retrieve, and delete browser profiles.
 */
export class Profiles extends APIResource {
    /**
     * Create a browser profile that can be used to load state into future browser
     * sessions.
     *
     * @example
     * ```ts
     * const profile = await client.profiles.create();
     * ```
     */
    create(body, options) {
        return this._client.post('/profiles', { body, ...options });
    }
    /**
     * Retrieve details for a single profile by its ID or name.
     *
     * @example
     * ```ts
     * const profile = await client.profiles.retrieve(
     *   'id_or_name',
     * );
     * ```
     */
    retrieve(idOrName, options) {
        return this._client.get(path `/profiles/${idOrName}`, options);
    }
    /**
     * Update a profile's name. Names must be unique within the logical project; during
     * the default-project migration, unscoped profiles and profiles in the org default
     * project are treated as the same project. Duplicate-name conflicts are checked
     * before update but are best-effort because there is no backing unique index.
     * Renaming a profile while a browser session references it by name may prevent
     * that session's changes from saving; prefer renaming when the profile is not in
     * use.
     *
     * @example
     * ```ts
     * const profile = await client.profiles.update('id_or_name', {
     *   name: 'my-renamed-profile',
     * });
     * ```
     */
    update(idOrName, body, options) {
        return this._client.patch(path `/profiles/${idOrName}`, { body, ...options });
    }
    /**
     * List profiles with optional filtering and pagination.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const profile of client.profiles.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/profiles', (OffsetPagination), { query, ...options });
    }
    /**
     * Delete a profile by its ID or by its name.
     *
     * @example
     * ```ts
     * await client.profiles.delete('id_or_name');
     * ```
     */
    delete(idOrName, options) {
        return this._client.delete(path `/profiles/${idOrName}`, {
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
    /**
     * Downloads the profile in its stored format by default. Current profiles are
     * returned as zstd-compressed tar archives, while legacy profiles remain JSON. Set
     * `format=tar` to decompress current profiles during download; legacy profiles
     * remain JSON.
     *
     * @example
     * ```ts
     * const response = await client.profiles.download(
     *   'id_or_name',
     * );
     *
     * const content = await response.blob();
     * console.log(content);
     * ```
     */
    download(idOrName, query = {}, options) {
        return this._client.get(path `/profiles/${idOrName}/download`, {
            query,
            ...options,
            headers: buildHeaders([{ Accept: 'application/octet-stream' }, options?.headers]),
            __binaryResponse: true,
        });
    }
}
//# sourceMappingURL=profiles.mjs.map