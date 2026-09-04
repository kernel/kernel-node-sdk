// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as ItemsAPI from './items';
import { APIPromise } from '../../core/api-promise';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Items extends APIResource {
  /**
   * The response advertises operations that are valid in the item's current state
   * and live data that can be requested through `expand`. Read each operation's
   * description before using it. Expanded data is fetched from the provider and is
   * not persisted in the vault item. Requesting an unavailable expansion returns 409
   * instead of a partial item.
   */
  retrieve(key: string, params: ItemRetrieveParams, options?: RequestOptions): APIPromise<VaultItem> {
    const { id_or_name, ...query } = params;
    return this._client.get(path`/vaults/${id_or_name}/items/${key}`, { query, ...options });
  }

  /**
   * Update a card specification before or between authorizations
   */
  update(key: string, params: ItemUpdateParams, options?: RequestOptions): APIPromise<VaultItem> {
    const { id_or_name, ...body } = params;
    return this._client.patch(path`/vaults/${id_or_name}/items/${key}`, { body, ...options });
  }

  /**
   * List vault items without secret values
   */
  list(idOrName: string, options?: RequestOptions): APIPromise<ItemListResponse> {
    return this._client.get(path`/vaults/${idOrName}/items`, options);
  }

  /**
   * Delete a vault item and invalidate its secret value
   */
  delete(key: string, params: ItemDeleteParams, options?: RequestOptions): APIPromise<void> {
    const { id_or_name } = params;
    return this._client.delete(path`/vaults/${id_or_name}/items/${key}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * List immutable audit events for a vault item
   */
  events(key: string, params: ItemEventsParams, options?: RequestOptions): APIPromise<ItemEventsResponse> {
    const { id_or_name, ...query } = params;
    return this._client.get(path`/vaults/${id_or_name}/items/${key}/events`, { query, ...options });
  }

  /**
   * Retrieve the item first and invoke only an operation listed in
   * `available_operations`, following its natural-language description. Operations
   * may call an external provider and can return the item's updated state.
   */
  performOperation(
    key: string,
    params: ItemPerformOperationParams,
    options?: RequestOptions,
  ): APIPromise<VaultItem> {
    const { id_or_name, ...body } = params;
    return this._client.post(path`/vaults/${id_or_name}/items/${key}/operations`, { body, ...options });
  }

  /**
   * Create or retrieve an identical vault item by immutable key
   */
  upsert(key: string, params: ItemUpsertParams, options?: RequestOptions): APIPromise<VaultItem> {
    const { id_or_name, ...body } = params;
    return this._client.put(path`/vaults/${id_or_name}/items/${key}`, { body, ...options });
  }
}

/**
 * The in-flight or most recent checkout authorization. Present while a checkout is
 * pending approval and after it settles.
 */
export interface AgentcardCheckoutAuthorization {
  id: string;

  amount_cents: number;

  created_at: string;

  currency: string;

  merchant: string;

  psp: string;

  status: 'awaiting_approval' | 'approved' | 'declined' | 'expired';

  actual_cents?: number;

  /**
   * Display amount shown on the approval screen.
   */
  amount?: string;

  amount_authority?: 'display_only' | 'stripe_payment_intent';

  amount_verified?: boolean;

  approval_url?: string;

  /**
   * Browser session that submitted the checkout.
   */
  browser_id?: string;

  charged_amount_cents?: number;

  charged_currency?: string;

  charged_kind?: 'captured' | 'authorized' | 'none';

  expected_cents?: number;

  expires_at?: string;

  psp_error_code?: string;

  reason?: string;

  replay_attempted?: boolean;

  /**
   * Whether the processor response was delivered to the browser.
   */
  replay_delivered?: boolean;

  /**
   * HTTP status of the replayed processor response.
   */
  replay_status?: number;
}

/**
 * AgentCard reusable card. Each checkout creates an approval-gated authorization
 * for spec.merchant / spec.amount. The card stays ready after each authorization.
 */
export type CardVaultItemSpec =
  | CardVaultItemSpec.LinkCardVaultItemSpec
  | CardVaultItemSpec.AgentCardCardVaultItemSpec;

export namespace CardVaultItemSpec {
  export interface LinkCardVaultItemSpec {
    /**
     * Integer amount in minor currency units.
     */
    amount: number;

    context: string;

    currency: string;

    merchant_name: string;

    merchant_url: string;

    /**
     * Payment-method ID returned by the referenced wallet's payment-method listing.
     * The provider decides whether the selected funding method can satisfy the card
     * request.
     */
    payment_method_id: string;

    provider: 'link';

    /**
     * Whether Link should return test credentials instead of a live payment
     * credential.
     */
    test: boolean;

    /**
     * Wallet item key used to mint this card.
     */
    wallet: string;

    expires_at?: number;

    line_items?: Array<LinkCardVaultItemSpec.LineItem>;

    metadata?: { [key: string]: string };

    totals?: Array<LinkCardVaultItemSpec.Total>;
  }

  export namespace LinkCardVaultItemSpec {
    export interface LineItem {
      name: string;

      description?: string;

      image_url?: string;

      product_url?: string;

      quantity?: number;

      sku?: string;

      totals?: Array<LineItem.Total>;

      /**
       * Unit amount in minor currency units.
       */
      unit_amount?: number;

      url?: string;
    }

    export namespace LineItem {
      export interface Total {
        /**
         * Total amount in minor currency units.
         */
        amount: number;

        display_text: string;

        type: string;
      }
    }

    export interface Total {
      /**
       * Total amount in minor currency units.
       */
      amount: number;

      display_text: string;

      type: string;
    }
  }

  /**
   * AgentCard reusable card. Each checkout creates an approval-gated authorization
   * for spec.merchant / spec.amount. The card stays ready after each authorization.
   */
  export interface AgentCardCardVaultItemSpec {
    /**
     * Integer amount in minor currency units.
     */
    amount: number;

    currency: string;

    /**
     * Merchant name shown on the cardholder's approval screen.
     */
    merchant: string;

    provider: 'agentcard';

    /**
     * Wallet item key used to authorize checkouts.
     */
    wallet: string;

    /**
     * AgentCard vaulted card to pay with. Omitted, the cardholder picks on the
     * approval screen.
     */
    card_id?: string;
  }
}

export type CardVaultItemState = CardVaultItemState.LinkCardState | CardVaultItemState.AgentCardCardState;

export namespace CardVaultItemState {
  export interface LinkCardState {
    provider: 'link';

    status: 'requested' | 'pending_authorization' | 'ready' | 'consumed' | 'expired' | 'declined';

    aliases?: ItemsAPI.VaultCardAliases;

    domains?: Array<string>;

    masks?: LinkCardState.Masks;

    status_reason?: string;
  }

  export namespace LinkCardState {
    export interface Masks {
      brand?: string;

      last4?: string;

      [k: string]: string | undefined;
    }
  }

  export interface AgentCardCardState {
    provider: 'agentcard';

    status: 'requested' | 'ready' | 'pending_approval' | 'degraded';

    aliases?: ItemsAPI.VaultCardAliases;

    /**
     * The in-flight or most recent checkout authorization. Present while a checkout is
     * pending approval and after it settles.
     */
    authorization?: ItemsAPI.AgentcardCheckoutAuthorization;

    masks?: AgentCardCardState.Masks;

    status_reason?: string;
  }

  export namespace AgentCardCardState {
    export interface Masks {
      brand?: string;

      last4?: string;

      [k: string]: string | undefined;
    }
  }
}

export interface VaultCardAliases {
  cvc: string;

  exp_month: string;

  exp_year: string;

  number: string;
}

export type VaultItem = VaultItem.WalletVaultItem | VaultItem.CardVaultItem;

export namespace VaultItem {
  export interface WalletVaultItem {
    id: string;

    available_expansions: Array<WalletVaultItem.AvailableExpansion>;

    available_operations: Array<WalletVaultItem.AvailableOperation>;

    created_at: string;

    /**
     * Immutable item key assigned when the item is created.
     */
    key: string;

    /**
     * AgentCard wallet. Mode (sandbox vs live) is fixed by the deployment's AgentCard
     * credential; there is no per-item test flag. user_id may only reference a user
     * already enrolled by a wallet in this organization.
     */
    spec: ItemsAPI.WalletVaultItemSpec;

    state: ItemsAPI.WalletVaultItemState;

    type: 'wallet';

    updated_at: string;

    action?: ItemsAPI.VaultItemAction;

    /**
     * Live, non-persisted data requested through the item GET expand parameter.
     */
    expanded?: WalletVaultItem.Expanded;

    expires_at?: string;
  }

  export namespace WalletVaultItem {
    /**
     * Live data that can currently be requested by passing its type to the item GET
     * expand parameter.
     */
    export interface AvailableExpansion {
      description: string;

      type: 'payment_methods';
    }

    /**
     * An operation that is currently valid for this item. Read the description before
     * invoking it through the item operations endpoint.
     */
    export interface AvailableOperation {
      description: string;

      type: 'authorize';
    }

    /**
     * Live, non-persisted data requested through the item GET expand parameter.
     */
    export interface Expanded {
      payment_methods?: Array<ItemsAPI.VaultPaymentMethod>;
    }
  }

  export interface CardVaultItem {
    id: string;

    available_expansions: Array<CardVaultItem.AvailableExpansion>;

    available_operations: Array<CardVaultItem.AvailableOperation>;

    created_at: string;

    /**
     * Immutable item key assigned when the item is created.
     */
    key: string;

    /**
     * AgentCard reusable card. Each checkout creates an approval-gated authorization
     * for spec.merchant / spec.amount. The card stays ready after each authorization.
     */
    spec: ItemsAPI.CardVaultItemSpec;

    state: ItemsAPI.CardVaultItemState;

    type: 'card';

    updated_at: string;

    action?: ItemsAPI.VaultItemAction;

    expires_at?: string;
  }

  export namespace CardVaultItem {
    /**
     * Live data that can currently be requested by passing its type to the item GET
     * expand parameter.
     */
    export interface AvailableExpansion {
      description: string;

      type: 'payment_methods';
    }

    /**
     * An operation that is currently valid for this item. Read the description before
     * invoking it through the item operations endpoint.
     */
    export interface AvailableOperation {
      description: string;

      type: 'authorize';
    }
  }
}

export type VaultItemAction =
  | VaultItemAction.LinkOAuthAction
  | VaultItemAction.SpendApprovalAction
  | VaultItemAction.PushApprovalAction
  | VaultItemAction.CollectAction
  | VaultItemAction.MfaAction
  | VaultItemAction.EmbeddedCeremonyAction
  | VaultItemAction.CardEnrollmentAction;

export namespace VaultItemAction {
  export interface LinkOAuthAction {
    name: 'link_oauth';

    url: string;
  }

  export interface SpendApprovalAction {
    name: 'spend_approval';

    url: string;
  }

  export interface PushApprovalAction {
    name: 'push_approval';
  }

  export interface CollectAction {
    name: 'collect';
  }

  export interface MfaAction {
    name: 'mfa';
  }

  export interface EmbeddedCeremonyAction {
    name: 'embedded_ceremony';
  }

  export interface CardEnrollmentAction {
    name: 'card_enrollment';

    url: string;
  }
}

export interface VaultItemEvent {
  id: string;

  created_at: string;

  name: string;

  /**
   * Browser session associated with the event, when applicable.
   */
  browser_id?: string;

  data?: { [key: string]: unknown };
}

export interface VaultPaymentMethod {
  id: string;

  /**
   * Provider-reported advisory capabilities. A missing capability is unknown, not
   * ineligible; only eligible=false is an explicit negative signal.
   */
  capabilities: VaultPaymentMethod.Capabilities;

  display: VaultPaymentMethod.Display;

  is_default: boolean;

  /**
   * Provider that issued this payment-method ID.
   */
  provider: string;

  /**
   * Provider-neutral payment-method type normalized to lowercase.
   */
  type: string;
}

export namespace VaultPaymentMethod {
  /**
   * Provider-reported advisory capabilities. A missing capability is unknown, not
   * ineligible; only eligible=false is an explicit negative signal.
   */
  export interface Capabilities {
    single_use_card?: Capabilities.SingleUseCard;
  }

  export namespace Capabilities {
    export interface SingleUseCard {
      eligible: boolean;

      reasons: Array<string>;
    }
  }

  export interface Display {
    brand?: string;

    label?: string;

    last4?: string;
  }
}

/**
 * AgentCard wallet. Mode (sandbox vs live) is fixed by the deployment's AgentCard
 * credential; there is no per-item test flag. user_id may only reference a user
 * already enrolled by a wallet in this organization.
 */
export type WalletVaultItemSpec =
  | WalletVaultItemSpec.LinkWalletVaultItemSpec
  | WalletVaultItemSpec.AgentCardWalletVaultItemSpec;

export namespace WalletVaultItemSpec {
  export interface LinkWalletVaultItemSpec {
    authorization: LinkWalletVaultItemSpec.Authorization;

    provider: 'link';
  }

  export namespace LinkWalletVaultItemSpec {
    export interface Authorization {
      client: Authorization.Client;

      method: 'oauth';
    }

    export namespace Authorization {
      export interface Client {
        type: 'kernel_managed';
      }
    }
  }

  /**
   * AgentCard wallet. Mode (sandbox vs live) is fixed by the deployment's AgentCard
   * credential; there is no per-item test flag. user_id may only reference a user
   * already enrolled by a wallet in this organization.
   */
  export interface AgentCardWalletVaultItemSpec {
    provider: 'agentcard';

    user_id?: string;
  }
}

export type WalletVaultItemState =
  | WalletVaultItemState.LinkWalletState
  | WalletVaultItemState.AgentCardWalletState;

export namespace WalletVaultItemState {
  export interface LinkWalletState {
    provider: 'link';

    status: 'pending_authorization' | 'connected' | 'declined' | 'reconnect_required' | 'degraded';

    status_reason?: string;
  }

  export interface AgentCardWalletState {
    provider: 'agentcard';

    status: 'pending_authorization' | 'connected' | 'degraded';

    status_reason?: string;

    /**
     * AgentCard user id linked to this wallet. Present once connected.
     */
    user_id?: string;
  }
}

export type ItemListResponse = Array<VaultItem>;

export type ItemEventsResponse = Array<VaultItemEvent>;

export interface ItemRetrieveParams {
  /**
   * Path param
   */
  id_or_name: string;

  /**
   * Query param: Live fields advertised by `available_expansions` to include in
   * `expanded`.
   */
  expand?: Array<'payment_methods'>;

  /**
   * Query param: Hold for up to this many seconds while the item is pending
   * authorization or approval.
   */
  wait?: number;
}

export interface ItemUpdateParams {
  /**
   * Path param
   */
  id_or_name: string;

  /**
   * Body param: AgentCard reusable card. Each checkout creates an approval-gated
   * authorization for spec.merchant / spec.amount. The card stays ready after each
   * authorization.
   */
  spec: CardVaultItemSpec;
}

export interface ItemDeleteParams {
  id_or_name: string;
}

export interface ItemEventsParams {
  /**
   * Path param
   */
  id_or_name: string;

  /**
   * Query param: Return events after this event ID.
   */
  after?: string;

  /**
   * Query param: Long-poll for new events for up to this many seconds.
   */
  wait?: number;
}

export interface ItemPerformOperationParams {
  /**
   * Path param
   */
  id_or_name: string;

  /**
   * Body param
   */
  type: 'authorize';
}

export type ItemUpsertParams =
  | ItemUpsertParams.WalletVaultItemRequest
  | ItemUpsertParams.CardVaultItemRequest;

export declare namespace ItemUpsertParams {
  export interface WalletVaultItemRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param: AgentCard wallet. Mode (sandbox vs live) is fixed by the
     * deployment's AgentCard credential; there is no per-item test flag. user_id may
     * only reference a user already enrolled by a wallet in this organization.
     */
    spec: WalletVaultItemSpec;

    /**
     * Body param
     */
    type: 'wallet';
  }

  export interface CardVaultItemRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param: AgentCard reusable card. Each checkout creates an approval-gated
     * authorization for spec.merchant / spec.amount. The card stays ready after each
     * authorization.
     */
    spec: CardVaultItemSpec;

    /**
     * Body param
     */
    type: 'card';
  }
}

export declare namespace Items {
  export {
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
