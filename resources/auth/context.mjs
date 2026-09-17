// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
/**
 * Inspect the identity and authorization context for the current request.
 */
export class Context extends APIResource {
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
//# sourceMappingURL=context.mjs.map