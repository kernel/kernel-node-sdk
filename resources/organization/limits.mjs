// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
/**
 * Read and manage organization-level limits.
 */
export class Limits extends APIResource {
    /**
     * Get the organization's effective limits and managed auth and vault usage.
     */
    retrieve(options) {
        return this._client.get('/org/limits', options);
    }
    /**
     * Set the default per-project concurrency cap applied to projects without an
     * explicit override. Set the value to 0 to remove the default; omit to leave it
     * unchanged. The default cannot exceed the organization's concurrency limit.
     */
    update(body, options) {
        return this._client.patch('/org/limits', { body, ...options });
    }
}
//# sourceMappingURL=limits.mjs.map