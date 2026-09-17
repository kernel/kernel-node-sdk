// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

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
  retrieve(options?: RequestOptions): APIPromise<AuthContext> {
    return this._client.get('/auth/context', options);
  }
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

export namespace AuthContext {
  export interface Authentication {
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
  export interface Authorization {
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

  export namespace Authorization {
    /**
     * A scope within the authenticated organization. A null project_id represents
     * organization-wide scope.
     */
    export interface CredentialScope {
      /**
       * The Kernel project ID, or null when the scope is organization-wide.
       */
      project_id: string | null;
    }

    /**
     * A scope within the authenticated organization. A null project_id represents
     * organization-wide scope.
     */
    export interface EffectiveScope {
      /**
       * The Kernel project ID, or null when the scope is organization-wide.
       */
      project_id: string | null;
    }
  }

  export interface Organization {
    /**
     * The authenticated Kernel organization ID.
     */
    id: string;
  }

  export interface Principal {
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
