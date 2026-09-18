// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
/**
 * Read and manage organization-level limits.
 */
export class Entitlements extends APIResource {
    /**
     * Get the authenticated organization's effective feature access and constraints
     * after applying its plan, active trial treatment, plan status, and
     * organization-specific overrides. Null constraint values mean unlimited.
     */
    retrieve(options) {
        return this._client.get('/org/entitlements', options);
    }
}
//# sourceMappingURL=entitlements.mjs.map