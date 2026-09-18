import { APIResource } from "../../core/resource.mjs";
import * as ItemsAPI from "./items.mjs";
import { AgentcardCheckoutAuthorization, AgentcardCheckoutPreparation, AgentcardPreparedProcessor, AuthorizeVaultItemOperationRequest, CardVaultItemSpec, CardVaultItemState, CollectVaultItemOperationRequest, CredentialCollectionAction, CredentialVaultFieldDefinition, CredentialVaultFieldInput, CredentialVaultFieldState, CredentialVaultFieldType, CredentialVaultFieldUpdate, CredentialVaultItem, CredentialVaultItemRequest, CredentialVaultItemSpec, CredentialVaultItemSpecInput, CredentialVaultItemSpecUpdate, CredentialVaultItemState, CredentialVaultItemUpdateRequest, FillVaultItemOperationRequest, FillVaultItemOperationResult, ItemDeleteParams, ItemEventsParams, ItemEventsResponse, ItemListResponse, ItemPerformOperationParams, ItemRetrieveParams, ItemUpdateParams, ItemUpsertParams, Items, PrepareCheckoutVaultItemOperationRequest, VaultCardAliases, VaultCardFillField, VaultCheckoutContext, VaultFillField, VaultFillFieldResult, VaultItem, VaultItemAction, VaultItemEvent, VaultItemOperationResponse, VaultPaymentMethod, WalletVaultItemSpec, WalletVaultItemState } from "./items.mjs";
import { APIPromise } from "../../core/api-promise.mjs";
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from "../../core/pagination.mjs";
import { RequestOptions } from "../../internal/request-options.mjs";
export declare class Vaults extends APIResource {
    items: ItemsAPI.Items;
    /**
     * Get a vault
     *
     * @example
     * ```ts
     * const vault = await client.vaults.retrieve('id_or_name');
     * ```
     */
    retrieve(idOrName: string, options?: RequestOptions): APIPromise<Vault>;
    /**
     * List vaults in the current project
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const vault of client.vaults.list()) {
     *   // ...
     * }
     * ```
     */
    list(query?: VaultListParams | null | undefined, options?: RequestOptions): PagePromise<VaultsOffsetPagination, Vault>;
    /**
     * Unresolved payment operations block deletion. Reconcile the original attempt
     * with the provider or support first; deleting or recreating an item is not proof
     * that a payment did not occur.
     *
     * @example
     * ```ts
     * await client.vaults.delete('id_or_name');
     * ```
     */
    delete(idOrName: string, options?: RequestOptions): APIPromise<void>;
    /**
     * Free organizations can store up to 3 non-deleted vaults across all projects.
     * Paid plans and active trials have no vault cap. Retrieving an existing vault by
     * name succeeds even at the limit.
     *
     * @example
     * ```ts
     * const vault = await client.vaults.upsert({
     *   name: 'checkout',
     * });
     * ```
     */
    upsert(body: VaultUpsertParams, options?: RequestOptions): APIPromise<Vault>;
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
export interface VaultListParams extends OffsetPaginationParams {
}
export interface VaultUpsertParams {
    /**
     * Immutable name used to create or retrieve the vault.
     */
    name: string;
}
export declare namespace Vaults {
    export { type Vault as Vault, type VaultsOffsetPagination as VaultsOffsetPagination, type VaultListParams as VaultListParams, type VaultUpsertParams as VaultUpsertParams, };
    export { Items as Items, type AgentcardCheckoutAuthorization as AgentcardCheckoutAuthorization, type AgentcardCheckoutPreparation as AgentcardCheckoutPreparation, type AgentcardPreparedProcessor as AgentcardPreparedProcessor, type AuthorizeVaultItemOperationRequest as AuthorizeVaultItemOperationRequest, type CardVaultItemSpec as CardVaultItemSpec, type CardVaultItemState as CardVaultItemState, type CollectVaultItemOperationRequest as CollectVaultItemOperationRequest, type CredentialCollectionAction as CredentialCollectionAction, type CredentialVaultFieldDefinition as CredentialVaultFieldDefinition, type CredentialVaultFieldInput as CredentialVaultFieldInput, type CredentialVaultFieldState as CredentialVaultFieldState, type CredentialVaultFieldType as CredentialVaultFieldType, type CredentialVaultFieldUpdate as CredentialVaultFieldUpdate, type CredentialVaultItem as CredentialVaultItem, type CredentialVaultItemRequest as CredentialVaultItemRequest, type CredentialVaultItemSpec as CredentialVaultItemSpec, type CredentialVaultItemSpecInput as CredentialVaultItemSpecInput, type CredentialVaultItemSpecUpdate as CredentialVaultItemSpecUpdate, type CredentialVaultItemState as CredentialVaultItemState, type CredentialVaultItemUpdateRequest as CredentialVaultItemUpdateRequest, type FillVaultItemOperationRequest as FillVaultItemOperationRequest, type FillVaultItemOperationResult as FillVaultItemOperationResult, type PrepareCheckoutVaultItemOperationRequest as PrepareCheckoutVaultItemOperationRequest, type VaultCardAliases as VaultCardAliases, type VaultCardFillField as VaultCardFillField, type VaultCheckoutContext as VaultCheckoutContext, type VaultFillField as VaultFillField, type VaultFillFieldResult as VaultFillFieldResult, type VaultItem as VaultItem, type VaultItemAction as VaultItemAction, type VaultItemEvent as VaultItemEvent, type VaultItemOperationResponse as VaultItemOperationResponse, type VaultPaymentMethod as VaultPaymentMethod, type WalletVaultItemSpec as WalletVaultItemSpec, type WalletVaultItemState as WalletVaultItemState, type ItemListResponse as ItemListResponse, type ItemEventsResponse as ItemEventsResponse, type ItemRetrieveParams as ItemRetrieveParams, type ItemUpdateParams as ItemUpdateParams, type ItemDeleteParams as ItemDeleteParams, type ItemEventsParams as ItemEventsParams, type ItemPerformOperationParams as ItemPerformOperationParams, type ItemUpsertParams as ItemUpsertParams, };
}
//# sourceMappingURL=vaults.d.mts.map