// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import { OffsetPagination } from "../../core/pagination.mjs";
import { buildHeaders } from "../../internal/headers.mjs";
import { path } from "../../internal/utils/path.mjs";
/**
 * Create and manage auth connections for automated credential capture and login.
 */
export class Connections extends APIResource {
    /**
     * Creates an auth connection for a profile and domain combination. If the provided
     * profile_name does not exist, it is created automatically. Returns 409 Conflict
     * if an auth connection already exists for the given profile and domain.
     *
     * @example
     * ```ts
     * const managedAuth = await client.auth.connections.create({
     *   domain: 'netflix.com',
     *   profile_name: 'user-123',
     * });
     * ```
     */
    create(body, options) {
        return this._client.post('/auth/connections', { body, ...options });
    }
    /**
     * Retrieve an auth connection by its ID. Includes current flow state if a login is
     * in progress.
     *
     * @example
     * ```ts
     * const managedAuth = await client.auth.connections.retrieve(
     *   'id',
     * );
     * ```
     */
    retrieve(id, options) {
        return this._client.get(path `/auth/connections/${id}`, options);
    }
    /**
     * Update an auth connection's configuration. Only the fields provided will be
     * updated.
     *
     * @example
     * ```ts
     * const managedAuth = await client.auth.connections.update(
     *   'id',
     * );
     * ```
     */
    update(id, body, options) {
        return this._client.patch(path `/auth/connections/${id}`, { body, ...options });
    }
    /**
     * List auth connections with optional filters for profile_name and domain.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const managedAuth of client.auth.connections.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/auth/connections', (OffsetPagination), { query, ...options });
    }
    /**
     * Deletes an auth connection and terminates its workflow. This will:
     *
     * - Delete the auth connection record
     * - Terminate the Temporal workflow
     * - Cancel any in-progress login flows
     *
     * @example
     * ```ts
     * await client.auth.connections.delete('id');
     * ```
     */
    delete(id, options) {
        return this._client.delete(path `/auth/connections/${id}`, {
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
    /**
     * Establishes a Server-Sent Events (SSE) stream that delivers real-time login flow
     * state updates. The stream terminates automatically once the flow reaches a
     * terminal state (SUCCESS, FAILED, EXPIRED, CANCELED).
     *
     * @example
     * ```ts
     * const response = await client.auth.connections.follow('id');
     * ```
     */
    follow(id, options) {
        return this._client.get(path `/auth/connections/${id}/events`, {
            ...options,
            headers: buildHeaders([{ Accept: 'text/event-stream' }, options?.headers]),
            stream: true,
        });
    }
    /**
     * Starts a login flow for the auth connection. Returns immediately with a hosted
     * URL for the user to complete authentication, or triggers automatic re-auth if
     * credentials are stored.
     *
     * @example
     * ```ts
     * const loginResponse = await client.auth.connections.login(
     *   'id',
     * );
     * ```
     */
    login(id, body = {}, options) {
        return this._client.post(path `/auth/connections/${id}/login`, { body, ...options });
    }
    /**
     * Submits field values for the login form. Poll the auth connection to track
     * progress and get results.
     *
     * @example
     * ```ts
     * const submitFieldsResponse =
     *   await client.auth.connections.submit('id');
     * ```
     */
    submit(id, body, options) {
        return this._client.post(path `/auth/connections/${id}/submit`, { body, ...options });
    }
    /**
     * Returns a chronological timeline of events for an auth connection — login
     * attempts, automatic re-auth attempts, and health checks. Events are returned
     * newest-first.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const managedAuthTimelineEvent of client.auth.connections.timeline(
     *   'id',
     * )) {
     *   // ...
     * }
     * ```
     */
    timeline(id, query = {}, options) {
        return this._client.getAPIList(path `/auth/connections/${id}/timeline`, (OffsetPagination), { query, ...options });
    }
}
//# sourceMappingURL=connections.mjs.map