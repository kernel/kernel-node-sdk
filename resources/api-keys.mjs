// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../core/resource.mjs";
import { OffsetPagination } from "../core/pagination.mjs";
import { buildHeaders } from "../internal/headers.mjs";
import { path } from "../internal/utils/path.mjs";
/**
 * Create and manage API keys for organization and project-scoped access.
 */
export class APIKeys extends APIResource {
    /**
     * Create a new API key within the authenticated organization.
     *
     * @example
     * ```ts
     * const createdAPIKey = await client.apiKeys.create({
     *   name: 'staging',
     * });
     * ```
     */
    create(body, options) {
        return this._client.post('/org/api_keys', { body, ...options });
    }
    /**
     * Retrieve an API key by ID for the authenticated organization. API keys are
     * masked.
     *
     * @example
     * ```ts
     * const apiKey = await client.apiKeys.retrieve('id');
     * ```
     */
    retrieve(id, query = {}, options) {
        return this._client.get(path `/org/api_keys/${id}`, { query, ...options });
    }
    /**
     * Update an API key's name.
     *
     * @example
     * ```ts
     * const apiKey = await client.apiKeys.update('id', {
     *   name: 'new-api-name',
     * });
     * ```
     */
    update(id, body, options) {
        return this._client.patch(path `/org/api_keys/${id}`, { body, ...options });
    }
    /**
     * List API keys for the authenticated organization. API keys are masked.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const apiKey of client.apiKeys.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/org/api_keys', (OffsetPagination), { query, ...options });
    }
    /**
     * Delete an API key. A key cannot delete itself; use a different key to delete
     * this one.
     *
     * @example
     * ```ts
     * await client.apiKeys.delete('id');
     * ```
     */
    delete(id, options) {
        return this._client.delete(path `/org/api_keys/${id}`, {
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
    /**
     * Rotate an API key. Issues a new key that copies the name and project of the
     * rotated key, and schedules the rotated key to expire after a grace period so
     * in-flight callers can swap over. The new plaintext key is returned once.
     *
     * @example
     * ```ts
     * const createdAPIKey = await client.apiKeys.rotate('id');
     * ```
     */
    rotate(id, body = {}, options) {
        return this._client.post(path `/org/api_keys/${id}/rotate`, { body, ...options });
    }
}
//# sourceMappingURL=api-keys.mjs.map