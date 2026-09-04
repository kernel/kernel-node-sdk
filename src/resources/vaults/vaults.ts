// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as ItemsAPI from './items';
import {
  AgentcardCheckoutAuthorization,
  CardVaultItemSpec,
  CardVaultItemState,
  ItemDeleteParams,
  ItemEventsParams,
  ItemEventsResponse,
  ItemListResponse,
  ItemPerformOperationParams,
  ItemRetrieveParams,
  ItemUpdateParams,
  ItemUpsertParams,
  Items,
  VaultCardAliases,
  VaultItem,
  VaultItemAction,
  VaultItemEvent,
  VaultPaymentMethod,
  WalletVaultItemSpec,
  WalletVaultItemState,
} from './items';
import { APIPromise } from '../../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../../core/pagination';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Vaults extends APIResource {
  items: ItemsAPI.Items = new ItemsAPI.Items(this._client);

  /**
   * Get a vault
   */
  retrieve(idOrName: string, options?: RequestOptions): APIPromise<Vault> {
    return this._client.get(path`/vaults/${idOrName}`, options);
  }

  /**
   * List vaults in the current project
   */
  list(
    query: VaultListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<VaultsOffsetPagination, Vault> {
    return this._client.getAPIList('/vaults', OffsetPagination<Vault>, { query, ...options });
  }

  /**
   * Delete a vault and invalidate its items
   */
  delete(idOrName: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/vaults/${idOrName}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Create or retrieve a vault by immutable name
   */
  upsert(body: VaultUpsertParams, options?: RequestOptions): APIPromise<Vault> {
    return this._client.post('/vaults', { body, ...options });
  }
}

export type VaultsOffsetPagination = OffsetPagination<Vault>;

export interface Vault {
  id: string;

  created_at: string;

  /**
   * Immutable name assigned when the vault is created.
   */
  name: string;

  updated_at: string;
}

export interface VaultListParams extends OffsetPaginationParams {}

export interface VaultUpsertParams {
  /**
   * Immutable name used to create or retrieve the vault.
   */
  name: string;
}

Vaults.Items = Items;

export declare namespace Vaults {
  export {
    type Vault as Vault,
    type VaultsOffsetPagination as VaultsOffsetPagination,
    type VaultListParams as VaultListParams,
    type VaultUpsertParams as VaultUpsertParams,
  };

  export {
    Items as Items,
    type AgentcardCheckoutAuthorization as AgentcardCheckoutAuthorization,
    type CardVaultItemSpec as CardVaultItemSpec,
    type CardVaultItemState as CardVaultItemState,
    type VaultCardAliases as VaultCardAliases,
    type VaultItem as VaultItem,
    type VaultItemAction as VaultItemAction,
    type VaultItemEvent as VaultItemEvent,
    type VaultPaymentMethod as VaultPaymentMethod,
    type WalletVaultItemSpec as WalletVaultItemSpec,
    type WalletVaultItemState as WalletVaultItemState,
    type ItemListResponse as ItemListResponse,
    type ItemEventsResponse as ItemEventsResponse,
    type ItemRetrieveParams as ItemRetrieveParams,
    type ItemUpdateParams as ItemUpdateParams,
    type ItemDeleteParams as ItemDeleteParams,
    type ItemEventsParams as ItemEventsParams,
    type ItemPerformOperationParams as ItemPerformOperationParams,
    type ItemUpsertParams as ItemUpsertParams,
  };
}
