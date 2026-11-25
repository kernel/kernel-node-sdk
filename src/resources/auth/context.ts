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

  workload_identity?: AuthContextWorkloadIdentity;
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

    /**
     * Current effective paired policy for a service-account principal. Omitted for
     * legacy human/client identities.
     */
    effective_policy?: Authorization.EffectivePolicy;
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

    /**
     * Current effective paired policy for a service-account principal. Omitted for
     * legacy human/client identities.
     */
    export interface EffectivePolicy {
      /**
       * Allow statements. Every action and resource not listed is denied.
       */
      statements: Array<EffectivePolicy.Statement>;
    }

    export namespace EffectivePolicy {
      export interface Statement {
        /**
         * Permitted action, such as browsers:use or vaults:read. When creating an API key
         * or replacing its policy, `*` may replace whole components as shorthand:
         * browsers:_ names every browsers action, _:delete every delete action the
         * resource can carry, and _:_ every action the resource can carry. The stored
         * policy lists the concrete actions, so actions added later are not granted, and
         * api_keys:issue_beyond_expiry must always be listed explicitly. Partial
         * components such as brow*:use and a bare * are rejected. Other policies, such as
         * workload identity rules and deployment runtime policies, accept only exact
         * actions.
         */
        action: string;

        /**
         * Resource the action applies to, in the format projects/{project_id}/{kind}/{id}.
         * Wildcards are supported.
         */
        resource: string;

        /**
         * A condition narrows a policy statement to requests matching its constraint: the
         * request attribute, a comparison operator, and that operator's values.
         */
        condition?: Statement.Condition;
      }

      export namespace Statement {
        /**
         * A condition narrows a policy statement to requests matching its constraint: the
         * request attribute, a comparison operator, and that operator's values.
         */
        export interface Condition {
          /**
           * Request attribute the condition constrains. `source_ip` restricts the statement
           * to requests whose client address falls inside one of `values`.
           */
          key: 'source_ip';

          /**
           * Comparison the condition applies between the request attribute and values.
           */
          operator: 'in';

          /**
           * Values the request attribute must match. For `source_ip`, CIDR networks: a bare
           * address without a mask is rejected, and so are an entry with host bits set and
           * an IPv4 network written in IPv6 notation.
           */
          values: Array<string>;
        }
      }
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
     * The authenticated API key, user or organization-owned service-account ID.
     */
    id: string;

    /**
     * The kind of principal authenticated for the request.
     */
    type: 'api_key' | 'user' | 'service_account';
  }
}

export interface AuthContextWorkloadIdentity {
  /**
   * Digest of the verified external subject. Never the original assertion or
   * arbitrary claims.
   */
  external_subject_digest: string;

  federation_rule_id: string;

  issuer_id: string;
}

export declare namespace Context {
  export { type AuthContext as AuthContext, type AuthContextWorkloadIdentity as AuthContextWorkloadIdentity };
}
