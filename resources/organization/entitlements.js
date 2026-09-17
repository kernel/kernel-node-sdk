"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entitlements = void 0;
const resource_1 = require("../../core/resource.js");
/**
 * Read and manage organization-level limits.
 */
class Entitlements extends resource_1.APIResource {
    /**
     * Get the authenticated organization's effective feature access and constraints
     * after applying its plan, active trial treatment, plan status, and
     * organization-specific overrides. Null constraint values mean unlimited.
     */
    retrieve(options) {
        return this._client.get('/org/entitlements', options);
    }
}
exports.Entitlements = Entitlements;
//# sourceMappingURL=entitlements.js.map