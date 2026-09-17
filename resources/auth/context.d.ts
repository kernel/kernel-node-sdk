import { APIResource } from "../../core/resource.js";
import { APIPromise } from "../../core/api-promise.js";
import { RequestOptions } from "../../internal/request-options.js";
/**
 * Inspect the identity and authorization context for the current request.
 */
export declare class Context extends APIResource {
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
    retrieve(options?: RequestOptions): APIPromise<AuthContext>;
}
/**
 * The identity and authorization context resolved for the current request.
 */
export interface AuthContext {
    authentication: AuthContext.Authentication;
    /**
     * The credential's maximum scope and the effective scope selected for this
     * request. Future permission data can be added without changing scope semantics.
     */
    authorization: AuthContext.Authorization;
    organization: AuthContext.Organization;
    principal: AuthContext.Principal;
}
export declare namespace AuthContext {
    interface Authentication {
        /**
         * The API key ID when authenticated with an API key; null for session credentials.
         */
        credential_id: string | null;
        /**
         * The credential format used to authenticate the request.
         */
        method: 'api_key' | 'jwt';
        /**
         * The source classification resolved by authentication middleware.
         */
        source: 'api_key' | 'oauth' | 'dashboard';
    }
    /**
     * The credential's maximum scope and the effective scope selected for this
     * request. Future permission data can be added without changing scope semantics.
     */
    interface Authorization {
        /**
         * A scope within the authenticated organization. A null project_id represents
         * organization-wide scope.
         */
        credential_scope: Authorization.CredentialScope;
        /**
         * A scope within the authenticated organization. A null project_id represents
         * organization-wide scope.
         */
        effective_scope: Authorization.EffectiveScope;
    }
    namespace Authorization {
        /**
         * A scope within the authenticated organization. A null project_id represents
         * organization-wide scope.
         */
        interface CredentialScope {
            /**
             * The Kernel project ID, or null when the scope is organization-wide.
             */
            project_id: string | null;
        }
        /**
         * A scope within the authenticated organization. A null project_id represents
         * organization-wide scope.
         */
        interface EffectiveScope {
            /**
             * The Kernel project ID, or null when the scope is organization-wide.
             */
            project_id: string | null;
        }
    }
    interface Organization {
        /**
         * The authenticated Kernel organization ID.
         */
        id: string;
    }
    interface Principal {
        /**
         * The API key ID for API-key principals or user ID for user principals.
         */
        id: string;
        /**
         * The kind of principal authenticated for the request.
         */
        type: 'api_key' | 'user';
    }
}
export declare namespace Context {
    export { type AuthContext as AuthContext };
}
//# sourceMappingURL=context.d.ts.map