// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class VaultProviderConfigs extends APIResource {
  /**
   * Register a configuration shared across the organization's projects. Names are
   * unique within the organization; duplicate names return 409 without replacing
   * credentials. A configuration serves many wallets. Secret credentials are never
   * returned. Requires an organization-scoped credential or dashboard
   * authentication; project-scoped credentials receive 403.
   *
   * @example
   * ```ts
   * const vaultProviderConfig =
   *   await client.vaultProviderConfigs.create({
   *     credentials: {
   *       client_id: 'example-client-id',
   *       client_secret: 'example-client-secret',
   *     },
   *     name: 'my-link-client',
   *     provider: 'link',
   *   });
   * ```
   */
  create(body: VaultProviderConfigCreateParams, options?: RequestOptions): APIPromise<VaultProviderConfig> {
    return this._client.post('/vault-provider-configs', { body, ...options });
  }

  /**
   * Look up a configuration by ID or name. Returns 404 when it does not exist in the
   * organization.
   *
   * @example
   * ```ts
   * const vaultProviderConfig =
   *   await client.vaultProviderConfigs.retrieve('id_or_name');
   * ```
   */
  retrieve(idOrName: string, options?: RequestOptions): APIPromise<VaultProviderConfig> {
    return this._client.get(path`/vault-provider-configs/${idOrName}`, options);
  }

  /**
   * Update the supplied fields; omitted fields remain unchanged. Names must remain
   * unique within the organization. Requires an organization-scoped credential or
   * dashboard authentication; project-scoped credentials receive 403.
   *
   * @example
   * ```ts
   * const vaultProviderConfig =
   *   await client.vaultProviderConfigs.update('id_or_name', {
   *     name: 'renamed-link-client',
   *   });
   * ```
   */
  update(
    idOrName: string,
    body: VaultProviderConfigUpdateParams,
    options?: RequestOptions,
  ): APIPromise<VaultProviderConfig> {
    return this._client.patch(path`/vault-provider-configs/${idOrName}`, { body, ...options });
  }

  /**
   * Secret credentials are never returned.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const vaultProviderConfig of client.vaultProviderConfigs.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: VaultProviderConfigListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<VaultProviderConfigsOffsetPagination, VaultProviderConfig> {
    return this._client.getAPIList('/vault-provider-configs', OffsetPagination<VaultProviderConfig>, {
      query,
      ...options,
    });
  }

  /**
   * Delete a configuration in the organization. Returns 409 while any non-deleted
   * vault item references the configuration, regardless of connection status. Does
   * not delete the external OAuth client or revoke unrelated grants. Requires an
   * organization-scoped credential or dashboard authentication; project-scoped
   * credentials receive 403.
   *
   * @example
   * ```ts
   * await client.vaultProviderConfigs.delete('id_or_name');
   * ```
   */
  delete(idOrName: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/vault-provider-configs/${idOrName}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export type VaultProviderConfigsOffsetPagination = OffsetPagination<VaultProviderConfig>;

/**
 * Response schema for a Link configuration, without secret credentials. Kernel
 * generates the ID and timestamps. Configuration creation uses
 * VaultLinkProviderConfigRequest.
 */
export type VaultProviderConfig =
  | VaultProviderConfig.VaultLinkProviderConfig
  | VaultProviderConfig.VaultAgentCardProviderConfig;

export namespace VaultProviderConfig {
  /**
   * Response schema for a Link configuration, without secret credentials. Kernel
   * generates the ID and timestamps. Configuration creation uses
   * VaultLinkProviderConfigRequest.
   */
  export interface VaultLinkProviderConfig {
    id: string;

    /**
     * OAuth client identity; immutable. Secret credentials are never returned.
     */
    client_id: string;

    created_at: string;

    /**
     * Unique within the organization.
     */
    name: string;

    provider: 'link';

    updated_at: string;
  }

  /**
   * Response schema for an AgentCard configuration, without secret credentials.
   * Kernel generates the ID and timestamps and introspects test_mode from the
   * credentials. Configuration creation uses VaultAgentCardProviderConfigRequest.
   */
  export interface VaultAgentCardProviderConfig {
    id: string;

    client_id: string;

    created_at: string;

    name: string;

    provider: 'agentcard';

    /**
     * Introspected mode of the selected credential; true means sandbox objects.
     */
    test_mode: boolean;

    updated_at: string;
  }
}

export type VaultProviderConfigCreateParams =
  | VaultProviderConfigCreateParams.VaultLinkProviderConfigRequest
  | VaultProviderConfigCreateParams.VaultAgentCardProviderConfigRequest;

export declare namespace VaultProviderConfigCreateParams {
  export interface VaultLinkProviderConfigRequest {
    credentials: VaultLinkProviderConfigRequest.Credentials;

    /**
     * Unique within the organization.
     */
    name: string;

    provider: 'link';
  }

  export namespace VaultLinkProviderConfigRequest {
    export interface Credentials {
      client_id: string;

      client_secret: string;
    }
  }

  export interface VaultAgentCardProviderConfigRequest {
    credentials: VaultAgentCardProviderConfigRequest.Credentials;

    /**
     * Unique within the organization.
     */
    name: string;

    provider: 'agentcard';
  }

  export namespace VaultAgentCardProviderConfigRequest {
    export interface Credentials {
      client_id: string;

      client_secret: string;
    }
  }
}

export interface VaultProviderConfigUpdateParams {
  /**
   * Fields to update. Omitted credentials are left unchanged. A rejected update
   * leaves existing credentials unchanged.
   */
  credentials?: VaultProviderConfigUpdateParams.Credentials;

  /**
   * Unique within the organization.
   */
  name?: string;
}

export namespace VaultProviderConfigUpdateParams {
  /**
   * Fields to update. Omitted credentials are left unchanged. A rejected update
   * leaves existing credentials unchanged.
   */
  export interface Credentials {
    client_secret?: string;
  }
}

export interface VaultProviderConfigListParams extends OffsetPaginationParams {}

export declare namespace VaultProviderConfigs {
  export {
    type VaultProviderConfig as VaultProviderConfig,
    type VaultProviderConfigsOffsetPagination as VaultProviderConfigsOffsetPagination,
    type VaultProviderConfigCreateParams as VaultProviderConfigCreateParams,
    type VaultProviderConfigUpdateParams as VaultProviderConfigUpdateParams,
    type VaultProviderConfigListParams as VaultProviderConfigListParams,
  };
}
