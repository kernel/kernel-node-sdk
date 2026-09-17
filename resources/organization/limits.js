"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Limits = void 0;
const resource_1 = require("../../core/resource.js");
/**
 * Read and manage organization-level limits.
 */
class Limits extends resource_1.APIResource {
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
exports.Limits = Limits;
//# sourceMappingURL=limits.js.map