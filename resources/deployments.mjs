// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../core/resource.mjs";
import { OffsetPagination } from "../core/pagination.mjs";
import { buildHeaders } from "../internal/headers.mjs";
import { multipartFormRequestOptions } from "../internal/uploads.mjs";
import { path } from "../internal/utils/path.mjs";
/**
 * Create and manage app deployments and stream deployment events.
 */
export class Deployments extends APIResource {
    /**
     * Create a new deployment.
     *
     * @example
     * ```ts
     * const deployment = await client.deployments.create({
     *   entrypoint_rel_path: 'src/app.py',
     *   env_vars: { FOO: 'bar' },
     *   file: fs.createReadStream('path/to/file'),
     *   region: 'aws.us-east-1a',
     *   version: '1.0.0',
     * });
     * ```
     */
    create(body, options) {
        return this._client.post('/deployments', multipartFormRequestOptions({ body, ...options }, this._client));
    }
    /**
     * Get information about a deployment's status.
     *
     * @example
     * ```ts
     * const deployment = await client.deployments.retrieve('id');
     * ```
     */
    retrieve(id, options) {
        return this._client.get(path `/deployments/${id}`, options);
    }
    /**
     * List deployments. Optionally filter by application name and version.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const deploymentListResponse of client.deployments.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/deployments', (OffsetPagination), {
            query,
            ...options,
        });
    }
    /**
     * Stops a running deployment and marks it for deletion. If the deployment is
     * already in a terminal state (stopped or failed), returns immediately.
     *
     * @example
     * ```ts
     * await client.deployments.delete('id');
     * ```
     */
    delete(id, options) {
        return this._client.delete(path `/deployments/${id}`, {
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
    /**
     * Establishes a Server-Sent Events (SSE) stream that delivers real-time logs and
     * status updates for a deployment. The stream terminates automatically once the
     * deployment reaches a terminal state.
     *
     * @example
     * ```ts
     * const response = await client.deployments.follow('id');
     * ```
     */
    follow(id, query = {}, options) {
        return this._client.get(path `/deployments/${id}/events`, {
            query,
            ...options,
            headers: buildHeaders([{ Accept: 'text/event-stream' }, options?.headers]),
            stream: true,
        });
    }
}
//# sourceMappingURL=deployments.mjs.map