// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

/**
 * Create and manage API keys for organization and project-scoped access.
 */
export class APIKeys extends APIResource {
  /**
   * Create a personal API key, or link a key to an organization-owned service
   * account. Service-account keys require an organization administrator, explicit
   * project and nonempty policy. An optional `policy` scopes the key to its listed
   * actions and resources, and each statement may carry a `condition`. A `source_ip`
   * condition restricts the statement to requests whose client address falls inside
   * its CIDR networks, so a key limited to your egress IP ranges only works from
   * your network, even if its secret leaks.
   *
   * @example
   * ```ts
   * const createdAPIKey = await client.apiKeys.create({
   *   name: 'staging',
   * });
   * ```
   */
  create(body: APIKeyCreateParams, options?: RequestOptions): APIPromise<CreatedAPIKey> {
    return this._client.post('/org/api_keys', { body, ...options });
  }

  /**
   * Retrieve an API key by ID for the authenticated organization. API keys are
   * masked.
   *
   * @example
   * ```ts
   * const apiKey = await client.apiKeys.retrieve('id');
   * ```
   */
  retrieve(
    id: string,
    query: APIKeyRetrieveParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<APIKey> {
    return this._client.get(path`/org/api_keys/${id}`, { query, ...options });
  }

  /**
   * Update an API key's name, or replace its permissions by attaching a new policy
   * in place: the key's credential never changes, so consumers keep the same secret.
   * The replacement policy may carry `source_ip` conditions, so you can add, change,
   * or remove IP allowlisting on an existing key without rotating its credential. A
   * present `policy` fully replaces the key's policy and takes effect for new
   * requests within the authorization cache; requests from outside a condition's
   * networks get `403` and are recorded in the audit log with the client address.
   * Requires api_keys:write to rename; api_keys:set_policy to replace permissions.
   *
   * @example
   * ```ts
   * const apiKey = await client.apiKeys.update('id');
   * ```
   */
  update(id: string, body: APIKeyUpdateParams, options?: RequestOptions): APIPromise<APIKey> {
    return this._client.patch(path`/org/api_keys/${id}`, { body, ...options });
  }

  /**
   * List API keys for the authenticated organization. API keys are masked.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const apiKey of client.apiKeys.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: APIKeyListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<APIKeysOffsetPagination, APIKey> {
    return this._client.getAPIList('/org/api_keys', OffsetPagination<APIKey>, { query, ...options });
  }

  /**
   * Delete an API key and asynchronously end browser sessions attributed to it,
   * discarding unsaved profile changes. A key cannot delete itself; use a different
   * key to delete this one. If cleanup cannot be registered, the key is not deleted.
   *
   * @example
   * ```ts
   * await client.apiKeys.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/org/api_keys/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Rotate an API key. Issues a new key that copies the name and project of the
   * rotated key, and schedules the rotated key to expire after a grace period so
   * in-flight callers can swap over. The new plaintext key is returned once. With
   * expire_in_days set to 0, browser sessions attributed to the old key are ended
   * asynchronously and unsaved profile changes are discarded. Grace-period and
   * natural expiry do not end existing browsers. If cleanup cannot be registered, an
   * immediate rotation is not committed. Service-account keys retain their service
   * principal and policy; the rotating administrator is recorded separately for
   * audit.
   *
   * @example
   * ```ts
   * const createdAPIKey = await client.apiKeys.rotate('id');
   * ```
   */
  rotate(
    id: string,
    body: APIKeyRotateParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<CreatedAPIKey> {
    return this._client.post(path`/org/api_keys/${id}/rotate`, { body, ...options });
  }
}

export type APIKeysOffsetPagination = OffsetPagination<APIKey>;

export interface APIKey {
  /**
   * Unique API key identifier
   */
  id: string;

  /**
   * When the API key was created
   */
  created_at: string;

  /**
   * Human audit creator, or null after creator deletion. Not the service
   * credential's principal.
   */
  created_by: APIKey.CreatedBy | null;

  /**
   * When the API key was deleted (soft-deleted). Null for keys that have not been
   * deleted.
   */
  deleted_at: string | null;

  /**
   * When the API key expires
   */
  expires_at: string | null;

  /**
   * When the API key last authenticated a request, accurate to within about 20
   * minutes. Null if the key has not been used since last-use tracking began.
   */
  last_used_at: string | null;

  /**
   * Masked version of the API key
   */
  masked_key: string;

  /**
   * Label for the API key. API keys are not addressable by name; use the ID or key
   * identifier for stable references.
   */
  name: string;

  /**
   * Project identifier for project-scoped API keys. Null means org-wide.
   */
  project_id: string | null;

  /**
   * Project name for project-scoped API keys. Null means the key is org-wide or the
   * project name is unavailable.
   */
  project_name: string | null;

  /**
   * Permissions granted to a scoped API key. Absent for an ordinary key, which keeps
   * unrestricted access within its organization or project.
   */
  policy?: APIKey.Policy | null;

  principal?: APIKey.Principal;

  /**
   * Organization-owned service principal, when linked.
   */
  service_account_id?: string;
}

export namespace APIKey {
  /**
   * Human audit creator, or null after creator deletion. Not the service
   * credential's principal.
   */
  export interface CreatedBy {
    /**
     * Kernel user ID of the creator.
     */
    id: string;

    /**
     * Email address of the creator.
     */
    email: string;

    /**
     * Display name of the creator, if available.
     */
    name: string | null;
  }

  /**
   * Permissions granted to a scoped API key. Absent for an ordinary key, which keeps
   * unrestricted access within its organization or project.
   */
  export interface Policy {
    /**
     * Allow statements. Every action and resource not listed is denied.
     */
    statements: Array<Policy.Statement>;
  }

  export namespace Policy {
    export interface Statement {
      /**
       * Permitted action, such as browsers:use or vaults:read.
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

  export interface Principal {
    id: string;

    type: 'user' | 'service_account';
  }
}

/**
 * API key returned immediately after creation. Includes the plaintext key once.
 */
export interface CreatedAPIKey extends APIKey {
  /**
   * Plaintext API key. Only returned once when the key is created.
   */
  key: string;
}

export interface APIKeyCreateParams {
  /**
   * Label for the API key (1-255 characters). API keys are not addressable by name.
   */
  name: string;

  /**
   * Number of days until expiry, up to 3650. Use null for never. Cannot be combined
   * with expires_at.
   */
  days_to_expire?: number | null;

  /**
   * Exact expiry time. Must be in the future and no later than the issuing
   * credential's own expiry. Cannot be combined with days_to_expire.
   */
  expires_at?: string | null;

  /**
   * Issue a scoped key that may only perform the listed actions on the listed
   * resources. A statement may carry a condition; a `source_ip` condition restricts
   * the statement to requests from inside its CIDR networks.
   */
  policy?: APIKeyCreateParams.Policy;

  /**
   * Unique project identifier
   */
  project_id?: string | null;

  /**
   * Link to an active same-organization service account. Requires an organization
   * administrator, explicit project and nonempty policy. Omit for a personal key.
   */
  service_account_id?: string;
}

export namespace APIKeyCreateParams {
  /**
   * Issue a scoped key that may only perform the listed actions on the listed
   * resources. A statement may carry a condition; a `source_ip` condition restricts
   * the statement to requests from inside its CIDR networks.
   */
  export interface Policy {
    /**
     * Allow statements. Every action and resource not listed is denied.
     */
    statements: Array<Policy.Statement>;
  }

  export namespace Policy {
    export interface Statement {
      /**
       * Permitted action, such as browsers:use or vaults:read.
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

export interface APIKeyRetrieveParams {
  /**
   * When true, return the API key even if it has been deleted (soft-deleted), for
   * audit purposes. Defaults to false, which returns 404 for a deleted key.
   */
  include_deleted?: boolean;
}

export interface APIKeyUpdateParams {
  /**
   * New API key name
   */
  name?: string;

  /**
   * Permissions that fully replace the key's policy. Attaching a policy to a key
   * without one makes the key scoped: every action and resource the policy does not
   * list is denied. The key's credential, name, project, and expiry are unchanged,
   * so consumers never need the key redistributed. A `source_ip` condition adds or
   * changes IP allowlisting without rotating the credential. Requires
   * api_keys:set_policy on the key.
   */
  policy?: APIKeyUpdateParams.Policy;
}

export namespace APIKeyUpdateParams {
  /**
   * Permissions that fully replace the key's policy. Attaching a policy to a key
   * without one makes the key scoped: every action and resource the policy does not
   * list is denied. The key's credential, name, project, and expiry are unchanged,
   * so consumers never need the key redistributed. A `source_ip` condition adds or
   * changes IP allowlisting without rotating the credential. Requires
   * api_keys:set_policy on the key.
   */
  export interface Policy {
    /**
     * Allow statements. Every action and resource not listed is denied.
     */
    statements: Array<Policy.Statement>;
  }

  export namespace Policy {
    export interface Statement {
      /**
       * Permitted action, such as browsers:use or vaults:read.
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

export interface APIKeyListParams extends OffsetPaginationParams {
  /**
   * Deprecated: use status=all instead. When true, include deleted (soft-deleted)
   * API keys in the results for audit purposes.
   */
  include_deleted?: boolean;

  /**
   * Exact-match filter on API key name using the database collation. In production,
   * matching is case- and accent-insensitive. Names are not required to be unique,
   * so multiple keys may match. When status=all or include_deleted=true is set,
   * soft-deleted keys with the same name may also match.
   */
  name?: string;

  /**
   * Case-insensitive substring match against API key name, creator, and project. API
   * key identifiers and masked keys match by exact value or prefix.
   */
  query?: string;

  /**
   * Field to sort API keys by. Keys with no expiry or no recorded use sort last for
   * expires_at and last_used_at in either direction.
   */
  sort_by?: 'created_at' | 'name' | 'expires_at' | 'last_used_at';

  /**
   * Sort direction for API keys.
   */
  sort_direction?: 'asc' | 'desc';

  /**
   * Filter API keys by status. "active" returns keys that are not deleted (default;
   * expired-but-not-deleted keys are still included), "deleted" returns only
   * soft-deleted keys, "all" returns both.
   */
  status?: 'active' | 'deleted' | 'all';
}

export interface APIKeyRotateParams {
  /**
   * Lifetime in days for the new key, up to 3650. Omit to reuse the rotated key's
   * original lifetime, or never-expires if it had none.
   */
  days_to_expire?: number | null;

  /**
   * Grace period in days before the rotated key expires. Use 0 to expire it
   * immediately. Omit for the default grace period of 7 days.
   */
  expire_in_days?: number | null;
}

export declare namespace APIKeys {
  export {
    type APIKey as APIKey,
    type CreatedAPIKey as CreatedAPIKey,
    type APIKeysOffsetPagination as APIKeysOffsetPagination,
    type APIKeyCreateParams as APIKeyCreateParams,
    type APIKeyRetrieveParams as APIKeyRetrieveParams,
    type APIKeyUpdateParams as APIKeyUpdateParams,
    type APIKeyListParams as APIKeyListParams,
    type APIKeyRotateParams as APIKeyRotateParams,
  };
}
