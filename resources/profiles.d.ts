import { APIResource } from "../core/resource.js";
import * as BrowsersAPI from "./browsers/browsers.js";
import { ProfilesOffsetPagination } from "./browsers/browsers.js";
import { APIPromise } from "../core/api-promise.js";
import { type OffsetPaginationParams, PagePromise } from "../core/pagination.js";
import { RequestOptions } from "../internal/request-options.js";
/**
 * Create, list, retrieve, and delete browser profiles.
 */
export declare class Profiles extends APIResource {
    /**
     * Create a browser profile that can be used to load state into future browser
     * sessions.
     *
     * @example
     * ```ts
     * const profile = await client.profiles.create();
     * ```
     */
    create(body: ProfileCreateParams, options?: RequestOptions): APIPromise<BrowsersAPI.Profile>;
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
    retrieve(idOrName: string, options?: RequestOptions): APIPromise<BrowsersAPI.Profile>;
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
    update(idOrName: string, body: ProfileUpdateParams, options?: RequestOptions): APIPromise<BrowsersAPI.Profile>;
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
    list(query?: ProfileListParams | null | undefined, options?: RequestOptions): PagePromise<ProfilesOffsetPagination, BrowsersAPI.Profile>;
    /**
     * Delete a profile by its ID or by its name.
     *
     * @example
     * ```ts
     * await client.profiles.delete('id_or_name');
     * ```
     */
    delete(idOrName: string, options?: RequestOptions): APIPromise<void>;
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
    download(idOrName: string, query?: ProfileDownloadParams | null | undefined, options?: RequestOptions): APIPromise<Response>;
}
export interface ProfileCreateParams {
    /**
     * Optional name of the profile. Must be unique within the logical project; during
     * the default-project migration, unscoped profiles and profiles in the org default
     * project are treated as the same project.
     */
    name?: string;
}
export interface ProfileUpdateParams {
    /**
     * New profile name. Must be unique within the logical project; during the
     * default-project migration, unscoped profiles and profiles in the org default
     * project are treated as the same project.
     */
    name: string;
}
export interface ProfileListParams extends OffsetPaginationParams {
    /**
     * Exact-match filter on profile name using the database collation. In production,
     * matching is case- and accent-insensitive. During the default-project migration,
     * unscoped requests prefer a concrete default-project profile over a legacy
     * unscoped profile with the same name.
     */
    name?: string;
    /**
     * Case-insensitive substring match against profile name or ID.
     */
    query?: string;
}
export interface ProfileDownloadParams {
    /**
     * Response format for current profile archives. Legacy profiles are always
     * returned as JSON.
     */
    format?: 'tar.zst' | 'tar';
}
export declare namespace Profiles {
    export { type ProfileCreateParams as ProfileCreateParams, type ProfileUpdateParams as ProfileUpdateParams, type ProfileListParams as ProfileListParams, type ProfileDownloadParams as ProfileDownloadParams, };
}
export { type ProfilesOffsetPagination };
//# sourceMappingURL=profiles.d.ts.map