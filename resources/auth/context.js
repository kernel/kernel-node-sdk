"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const resource_1 = require("../../core/resource.js");
/**
 * Inspect the identity and authorization context for the current request.
 */
class Context extends resource_1.APIResource {
    /**
     * Returns the authenticated principal, organization, credential scope, and
     * effective request scope. The response is derived from the verified request
     * context and does not expose credential secrets.
     *
     * @example
     * ```ts
     * const authContext = await client.auth.context.retrieve();
     * ```
     */
    retrieve(options) {
        return this._client.get('/auth/context', options);
    }
}
exports.Context = Context;
//# sourceMappingURL=context.js.map