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
   * instead of a partial item. Pending credential items return a collection action.
   * Kernel-hosted active collection links are renewed atomically on expiry for ready
   * or pending items without changing the item version. Invoke collect to open a
   * form for a ready item without clearing values. Sensitive credential values are
   * never returned.
   *
   * @example
   * ```ts
   * const vaultItem = await client.vaults.items.retrieve('x', {
   *   id_or_name: 'id_or_name',
   * });
   * ```
   */
  retrieve(key: string, params: ItemRetrieveParams, options?: RequestOptions): APIPromise<VaultItem> {
    const { id_or_name, ...query } = params;
    return this._client.get(path`/vaults/${id_or_name}/items/${key}`, { query, ...options });
  }

  /**
   * Credential updates require type credential and the current version, and change
   * only values or description; omitted values are preserved, nonempty strings
   * replace, and null or empty strings clear supported fields. Clearing required
   * text/email/password values returns pending_collection; browser forms still
   * require nonempty required inputs. Card updates may omit type for compatibility
   * with legacy requests. Requested cards accept a replacement specification.
   * Pending issuance requests may update provider-supported fields on their existing
   * request, subject to atomic provider approval checks; omitted optional fields
   * remain unchanged and explicit empty lists clear them. Wallet/provider binding
   * and unsupported fields cannot change after authorization starts. An uncertain
   * update enters recovery_required and must not be retried. Checkout cards may be
   * edited between authorizations.
   *
   * @example
   * ```ts
   * const vaultItem = await client.vaults.items.update('x', {
   *   id_or_name: 'id_or_name',
   *   spec: {
   *     provider: 'link',
   *     wallet: 'link-wallet',
   *     payment_method_id: 'pm_example',
   *     amount: 3000,
   *     currency: 'usd',
   *     merchant_name: 'Example Store',
   *     merchant_url: 'https://store.example.com',
   *     context:
   *       'The order total changed to USD 30.00 including shipping and taxes for one notebook. Update this unapproved request rather than creating a second payment.',
   *   },
   *   type: 'card',
   * });
   * ```
   */
  update(key: string, params: ItemUpdateParams, options?: RequestOptions): APIPromise<VaultItem> {
    const { id_or_name, ...body } = params;
    return this._client.patch(path`/vaults/${id_or_name}/items/${key}`, { body, ...options });
  }

  /**
   * Credential entries include safe field metadata and non-sensitive values. Listing
   * never creates or renews collection sessions; only an existing unexpired active
   * session is included. Use single-item GET or collect to obtain a fresh link.
   *
   * @example
   * ```ts
   * const vaultItems = await client.vaults.items.list(
   *   'id_or_name',
   * );
   * ```
   */
  list(idOrName: string, options?: RequestOptions): APIPromise<ItemListResponse> {
    return this._client.get(path`/vaults/${idOrName}/items`, options);
  }

  /**
   * Unresolved payment operations normally block deletion, including operations on
   * child cards of a wallet. Deleting a connected Kernel wallet first blocks new
   * payments on it, then removes its enrolled card. If that fails, the wallet is
   * kept and keeps refusing payments; retry the deletion. An AgentCard card in
   * recovery_required whose checkout create response returned no authorization ID
   * may be explicitly abandoned by deleting that card directly; deleting its wallet
   * or vault remains blocked. Deleting or recreating an item is not proof that a
   * payment did not occur. Deleting a managed auth credential item leaves the
   * connection and its saved credential unchanged.
   *
   * @example
   * ```ts
   * await client.vaults.items.delete('x', {
   *   id_or_name: 'id_or_name',
   * });
   * ```
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
   *
   * @example
   * ```ts
   * const vaultItemEvents = await client.vaults.items.events(
   *   'key',
   *   { id_or_name: 'id_or_name' },
   * );
   * ```
   */
  events(key: string, params: ItemEventsParams, options?: RequestOptions): APIPromise<ItemEventsResponse> {
    const { id_or_name, ...query } = params;
    return this._client.get(path`/vaults/${id_or_name}/items/${key}/events`, { query, ...options });
  }

  /**
   * Retrieve the item first and invoke only an operation listed in
   * `available_operations`, following its natural-language description. Availability
   * is rechecked at execution time; unavailable operations return 409. Authorization
   * and preparation may call an external provider and return updated state. Link
   * cards advertise authorize without checkout context. Eligible unused AgentCard
   * cards advertise prepare_checkout, which requires checkout context and obtains
   * device approval before native Square Pay. Keep the returned approval page open,
   * poll until ready_to_submit, then submit before preparation.expires_at. Unused
   * preparations expire automatically and cannot be reused. If spend-request
   * creation is rejected with a non-retryable provider error, the card item is
   * deleted and the provider's error code and message are returned. Rate limits
   * return HTTP 429 and retain the card item; stop, back off, and retry the same
   * authorize operation.
   *
   * Fill returns a value-free execution result. Validation failures before writing
   * return 400 (invalid request or targets), 403 (access or destination denied), 404
   * (resource not found), or 409 (item or browser not ready). Once writing starts,
   * known partial failures and indeterminate field outcomes return 200 with status
   * `failed` or `unknown`. Fill never submits the page, so it is safe to retry after
   * a failure, an `unknown` outcome, or a transport error.
   *
   * @example
   * ```ts
   * const vaultItemOperationResponse =
   *   await client.vaults.items.performOperation('key', {
   *     id_or_name: 'id_or_name',
   *     type: 'authorize',
   *   });
   * ```
   */
  performOperation(
    key: string,
    params: ItemPerformOperationParams,
    options?: RequestOptions,
  ): APIPromise<VaultItemOperationResponse> {
    const { id_or_name, ...body } = params;
    return this._client.post(path`/vaults/${id_or_name}/items/${key}/operations`, {
      body,
      maxRetries: 0,
      ...options,
    });
  }

  /**
   * Create an item under a key unique within its vault, or retrieve the existing
   * item when its specification matches. An identical card PUT returns the existing
   * card in any lifecycle state without polling the provider, reauthorizing,
   * replacing aliases, or resetting recovery. Conflicting specifications return 409.
   * Provider-specific authorization requirements and retry behavior are described in
   * the item's request schema. Do not use credential items to store, collect, or
   * fill credit card data, including card numbers (PANs), security codes (CVV/CVC),
   * or expiration dates. Use wallet and card item types for credit cards and payment
   * checkout instead.
   *
   * @example
   * ```ts
   * const vaultItem = await client.vaults.items.upsert('x', {
   *   id_or_name: 'id_or_name',
   *   spec: { provider: 'managed_auth' },
   *   type: 'credential',
   * });
   * ```
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
 * One-use processor-bound checkout preparation. Keep the approval page open
 * through device handoff, including Adyen encryption. The amount is declared by
 * the caller and does not constrain the merchant's eventual charge. Adyen device
 * approval and browser Authorised responses are not capture or fulfillment
 * evidence.
 */
export interface AgentcardCheckoutPreparation {
  browser_id: string;

  created_at: string;

  environment: 'production' | 'sandbox' | 'shared';

  merchant_origin: string;

  psp: AgentcardPreparedProcessor;

  /**
   * Preparation consumed means egress claimed the preparation and it cannot be
   * reused. It does not mean the attempt settled. Use the enclosing item's status as
   * the lifecycle indicator; item consumed means the attempt settled, not that an
   * order or charge succeeded.
   */
  status: 'creating' | 'awaiting_approval' | 'ready' | 'consumed' | 'cancelled' | 'expired' | 'unknown';

  id?: string;

  approval_url?: string;

  /**
   * When ready, the absolute deadline to submit the first native request; no later
   * than provider readiness expiry or 30 seconds after Kernel first observes
   * readiness. Polling never extends this deadline.
   */
  expires_at?: string;
}

export type AgentcardPreparedProcessor =
  | 'square'
  | 'braintree'
  | 'worldpay'
  | 'bambora'
  | 'mercado_pago'
  | 'adyen';

/**
 * Authorize a Link or Kernel card using its existing purchase specification. Use
 * only after explicit user approval and when the item advertises authorize. Do not
 * automatically retry provider failures or indeterminate outcomes. Checkout
 * context is not accepted.
 */
export interface AuthorizeVaultItemOperationRequest {
  type: 'authorize';
}

/**
 * Live payment card. Test-mode card creation is not supported.
 */
export type CardVaultItemSpec =
  | CardVaultItemSpec.LinkCardVaultItemSpec
  | CardVaultItemSpec.AgentCardCardVaultItemSpec
  | KernelCardVaultItemSpec;

export namespace CardVaultItemSpec {
  /**
   * Live payment card. Test-mode card creation is not supported.
   */
  export interface LinkCardVaultItemSpec {
    /**
     * Integer amount in minor currency units. Link permits at most 50000 per spend
     * request.
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
   * AgentCard reusable live payment card. Test-mode card creation is not supported.
   * Each checkout creates an authorization for spec.merchant / spec.amount that the
   * cardholder approves, unless AgentCard runs it under one of the cardholder's
   * autopilot rules. The card stays ready after each authorization.
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
     * Opaque card ID returned by AgentCard for a card in the connected wallet. Pass it
     * through unchanged without assuming a prefix or format. Omitted, the cardholder
     * picks on the approval screen.
     */
    card_id?: string;

    /**
     * Origin of the top-level checkout page, such as https://shop.example.com: https,
     * a lowercase host, a port only when it is not 443, and no path. http is accepted
     * only for localhost test pages. Checkouts without a preparation send it to
     * AgentCard, which uses it to match the cardholder's autopilot rules; prepared
     * checkouts send the preparation's merchant_origin instead. Kernel sends the
     * declared value and does not compare it with the page the browser has open.
     * Omitted, those checkouts ask the cardholder to approve. Card updates replace the
     * whole spec, so an update that omits it removes it.
     */
    checkout_origin?: string;
  }
}

/**
 * Issued Link cards retain encrypted card material for the fill operation. Link
 * cards do not expose aliases or support egress substitution.
 */
export type CardVaultItemState =
  | CardVaultItemState.LinkCardState
  | CardVaultItemState.AgentCardCardState
  | KernelCardState;

export namespace CardVaultItemState {
  /**
   * Issued Link cards retain encrypted card material for the fill operation. Link
   * cards do not expose aliases or support egress substitution.
   */
  export interface LinkCardState {
    provider: 'link';

    /**
     * recovery_required means an original provider operation has an unresolved
     * outcome. Do not retry, delete, or replace it. Known references may be observed
     * safely, but unknown creation without an ID and uncertain card-material retrieval
     * require manual reconciliation with the provider or support. There is no reset or
     * caller-asserted reconciliation operation.
     */
    status:
      | 'requested'
      | 'pending_authorization'
      | 'ready'
      | 'consumed'
      | 'expired'
      | 'declined'
      | 'recovery_required';

    domains?: Array<string>;

    masks?: LinkCardState.Masks;

    status_reason?: string;
  }

  export namespace LinkCardState {
    export interface Masks {
      brand?: string;

      last4?: string;

      /**
       * Last four digits of the network token presented to the merchant.
       */
      token_last4?: string;

      [k: string]: string | undefined;
    }
  }

  export interface AgentCardCardState {
    provider: 'agentcard';

    /**
     * ready_to_submit is device readiness for at most 30 seconds. consumed means the
     * prepared attempt has settled, not that an order succeeded. stopped cannot be
     * reused. outcome_unknown requires merchant reconciliation and blocks new
     * requests. recovery_required means the original checkout outcome is unresolved.
     * Automatic reuse is blocked. Known authorization IDs must be reconciled through
     * provider observations or support. When no authorization ID was returned, an
     * explicitly confirmed item deletion may abandon the unresolved attempt so the
     * caller can create a replacement; deletion does not prove that the original
     * attempt failed. It does not mean declined or expired.
     */
    status:
      | 'requested'
      | 'ready'
      | 'preparing'
      | 'ready_to_submit'
      | 'pending_approval'
      | 'consumed'
      | 'stopped'
      | 'outcome_unknown'
      | 'degraded'
      | 'recovery_required';

    aliases?: ItemsAPI.VaultCardAliases;

    /**
     * The in-flight or most recent checkout authorization. Present while a checkout is
     * pending approval and after it settles.
     */
    authorization?: ItemsAPI.AgentcardCheckoutAuthorization;

    masks?: AgentCardCardState.Masks;

    /**
     * One-use processor-bound checkout preparation. Keep the approval page open
     * through device handoff, including Adyen encryption. The amount is declared by
     * the caller and does not constrain the merchant's eventual charge. Adyen device
     * approval and browser Authorised responses are not capture or fulfillment
     * evidence.
     */
    preparation?: ItemsAPI.AgentcardCheckoutPreparation;

    status_reason?: string;
  }

  export namespace AgentCardCardState {
    export interface Masks {
      brand?: string;

      last4?: string;

      /**
       * Last four digits of the network token presented to the merchant.
       */
      token_last4?: string;

      [k: string]: string | undefined;
    }
  }
}

/**
 * Return the credential item with its collection action. Supported for ready and
 * pending_collection credential items. Always render the same form from every
 * form-supported field; totp fields have no form input and are omitted. No
 * caller-selected field subsets or form overrides are accepted. Reuse an active
 * Kernel-hosted session or renew an expired session atomically. Customer-hosted
 * forms use their own backend and ordinary item GET/PATCH. Opening the form does
 * not clear values or change readiness or item version. To observe edits on a
 * ready item, record its version and poll GET without wait until the version
 * changes, then reconcile the returned state. Version changes may also come from
 * PATCH; they do not identify a particular form submission. Customer-hosted apps
 * use their own submission callback, including for unchanged forms. The wait
 * parameter waits for readiness, not edits.
 */
export interface CollectVaultItemOperationRequest {
  type: 'collect';
}

export interface CredentialAccountVaultItem {
  id: string;

  available_expansions: Array<CredentialAccountVaultItem.AvailableExpansion>;

  /**
   * Advertises 1pw_recover when Kernel can recover a failed account link. Recovery
   * is unavailable while authorization is pending or after the connection has
   * already been reset.
   */
  available_operations: Array<CredentialAccountVaultItem.AvailableOperation>;

  created_at: string;

  /**
   * Immutable item key assigned when the item is created.
   */
  key: string;

  spec: OnePasswordCredentialAccountSpec;

  state: OnePasswordCredentialAccountState;

  type: 'credential_account';

  updated_at: string;

  action?: OnePasswordOAuthAction;

  expires_at?: string;
}

export namespace CredentialAccountVaultItem {
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

    type:
      | 'authorize'
      | 'collect'
      | 'prepare_checkout'
      | 'fill'
      | '1pw_create_access_request'
      | '1pw_access_request_status'
      | '1pw_fill'
      | '1pw_recover'
      | '1pw_update_access_token'
      | 'webmcp_invoke';
  }
}

export interface CredentialAccountVaultItemRequest {
  spec: OnePasswordCredentialAccountSpec;

  type: 'credential_account';
}

/**
 * One schema-derived form for the item, available in ready or pending_collection
 * state. Render every form-supported field as editable; omit totp fields and
 * preserve their stored seeds. Prefill non-sensitive values, and allow existing
 * sensitive values to be preserved or replaced without ever revealing them. No
 * field subsets or per-request form configuration exist. Validate required fields
 * against the resulting values, including preserved secrets. Submit changed values
 * only, using the version used to render the form. Scoped hosted submission
 * rejects totp edits; seed writes require the ordinary authenticated item API.
 * Customer forms likewise omit totp from their payloads. Save edits atomically. A
 * successful hosted submission increments the version, marks ready, and consumes
 * the session; an empty edit may complete collection while preserving values. A
 * customer form uses PATCH for changed values and does not send an empty PATCH
 * when nothing changed. Kernel-hosted bearer sessions require no Kernel account
 * and are bound to the item version. Expired, superseded, consumed, or
 * deleted-item sessions cannot submit. Authenticated item GET renews expired
 * active sessions for ready or pending items; pending items always receive an
 * action. A ready item with no active session omits the action until collect is
 * invoked. Concurrent renewals return the same link. Renewal changes neither
 * values nor item version. An expired link cannot renew itself. The hosted form
 * handles its collection protocol; callers only open the returned URL and do not
 * extract or submit its token through the public API. For customer-hosted forms,
 * use @onkernel/vault-react and an authenticated customer backend calling the
 * ordinary item GET/PATCH API. Kernel does not store customer collection URLs or
 * authenticate the customer's end users. Treat URLs and submitted values as
 * secrets and exclude them from logs, traces, and errors.
 */
export interface CredentialCollectionAction {
  /**
   * Expiry of the Kernel-hosted collection link (30 minutes after issuance).
   */
  expires_at: string;

  name: 'collect';

  /**
   * Time-scoped hosted form URL (vault.kernel.sh in production). Open this URL as
   * returned; treat it as a secret.
   */
  url: string;
}

export interface CredentialVaultFieldDefinition {
  /**
   * Stable field name used to key values, updates, and browser fills.
   */
  name: string;

  /**
   * Whether a nonempty value is required for readiness and form submission.
   */
  required: boolean;

  /**
   * Whether the value is omitted from every item response. Reserve true for secrets
   * such as passwords, API tokens, and TOTP seeds. Ordinary usernames and email
   * addresses should be false so the form can display and prefill them.
   */
  sensitive: boolean;

  /**
   * Text, email, and password have form inputs; totp does not and is omitted from
   * both Kernel-hosted and customer React forms. Password and totp must be
   * sensitive. A totp value is an RFC 4648 Base32 generator seed (case-insensitive,
   * optional trailing padding), not an otpauth URI or current code. Reject invalid
   * or empty decoded seeds. Browser fill generates an RFC 6238 code at execution
   * time using HMAC-SHA1, 6 digits, and a 30-second period. Preserve leading zeros;
   * never fill the seed. Custom algorithms, digits, periods, and form enrollment are
   * unsupported.
   */
  type: CredentialVaultFieldType;

  /**
   * Optional human-readable display label. It is returned as non-secret metadata and
   * never affects value keys, updates, or browser fills. Use single-line, trimmed
   * display text without control or formatting characters. The server enforces a
   * 128-byte UTF-8 limit.
   */
  label?: string;
}

export interface CredentialVaultFieldInput {
  /**
   * Unique stable field name used to key values, updates, and browser fills.
   */
  name: string;

  /**
   * Text, email, and password have form inputs; totp does not and is omitted from
   * both Kernel-hosted and customer React forms. Password and totp must be
   * sensitive. A totp value is an RFC 4648 Base32 generator seed (case-insensitive,
   * optional trailing padding), not an otpauth URI or current code. Reject invalid
   * or empty decoded seeds. Browser fill generates an RFC 6238 code at execution
   * time using HMAC-SHA1, 6 digits, and a 30-second period. Preserve leading zeros;
   * never fill the seed. Custom algorithms, digits, periods, and form enrollment are
   * unsupported.
   */
  type: CredentialVaultFieldType;

  /**
   * Alternative to value for custom credential collection web apps. Use this only if
   * you run your own credential collection web app and want values encrypted in the
   * browser, sent to your backend still encrypted, and forwarded to Kernel's API
   * still encrypted. In every other case, including server-side code that already
   * holds the plaintext, use value. The field's value encrypted client-side as a
   * compact JWE with alg ECDH-ES and enc A256GCM to the key from GET
   * /vaults/{id_or_name}/encryption_key, with that key's kid in the protected
   * header. Compression is not supported. The decrypted value follows the same rules
   * as value, including that an empty string clears the field on update. A kid that
   * is not this vault's key returns 400 encryption_key_mismatch; fetch the key again
   * and re-encrypt. Other malformed or undecryptable values return 400
   * invalid_request. The whole request body is limited to 128 KiB.
   */
  encrypted_value?: string;

  /**
   * Optional human-readable display label. It is returned as non-secret metadata and
   * never affects value keys, updates, or browser fills. Use single-line, trimmed
   * display text without control or formatting characters. The server enforces a
   * 128-byte UTF-8 limit.
   */
  label?: string;

  required?: boolean;

  /**
   * Set false explicitly for ordinary usernames, email addresses, and other
   * non-secret identifiers. Reserve true for secrets such as passwords, API tokens,
   * and TOTP seeds. Password and totp fields must be true. Omission defaults to true
   * for safety; do not rely on that default for every field. False permits API reads
   * and form prefilling.
   */
  sensitive?: boolean;

  /**
   * Optional initial value satisfying the declared type, at most 16 KiB in UTF-8
   * bytes. Omit to leave unset; null and empty strings are rejected on creation.
   * Sensitive values are encrypted and never copied into the returned spec. Use this
   * unless your own credential collection web app encrypts values in the browser;
   * mutually exclusive with encrypted_value.
   */
  value?: string;
}

export interface CredentialVaultFieldState {
  has_value: boolean;

  /**
   * Present exactly when has_value is true and the field is not sensitive. Reflects
   * the latest developer or human edit. For totp, has_value indicates a stored seed;
   * neither the seed nor a generated code is returned.
   */
  value?: string;
}

/**
 * Text, email, and password have form inputs; totp does not and is omitted from
 * both Kernel-hosted and customer React forms. Password and totp must be
 * sensitive. A totp value is an RFC 4648 Base32 generator seed (case-insensitive,
 * optional trailing padding), not an otpauth URI or current code. Reject invalid
 * or empty decoded seeds. Browser fill generates an RFC 6238 code at execution
 * time using HMAC-SHA1, 6 digits, and a 30-second period. Preserve leading zeros;
 * never fill the seed. Custom algorithms, digits, periods, and form enrollment are
 * unsupported.
 */
export type CredentialVaultFieldType = 'text' | 'email' | 'password' | 'totp';

/**
 * Set exactly one of value or encrypted_value. Use value unless the update comes
 * from your own credential collection web app that encrypts values in the browser;
 * see encrypted_value.
 */
export interface CredentialVaultFieldUpdate {
  /**
   * Alternative to value for custom credential collection web apps. Use this only if
   * you run your own credential collection web app and want values encrypted in the
   * browser, sent to your backend still encrypted, and forwarded to Kernel's API
   * still encrypted. In every other case, including server-side code that already
   * holds the plaintext, use value. The field's value encrypted client-side as a
   * compact JWE with alg ECDH-ES and enc A256GCM to the key from GET
   * /vaults/{id_or_name}/encryption_key, with that key's kid in the protected
   * header. Compression is not supported. The decrypted value follows the same rules
   * as value, including that an empty string clears the field on update. A kid that
   * is not this vault's key returns 400 encryption_key_mismatch; fetch the key again
   * and re-encrypt. Other malformed or undecryptable values return 400
   * invalid_request. The whole request body is limited to 128 KiB.
   */
  encrypted_value?: string;

  /**
   * Replacement value (at most 16 KiB in UTF-8 bytes), or null or an empty string to
   * immediately clear the stored value. Clearing a required form-supported field
   * reopens collection; clearing an optional field does not prevent readiness.
   * Values must satisfy the declared field type. For totp, value is the generator
   * seed, never a current code. Clearing a required totp field returns 400 because
   * it cannot be collected in a form.
   */
  value?: string | null;
}

export interface CredentialVaultItem {
  id: string;

  available_expansions: Array<CredentialVaultItem.AvailableExpansion>;

  /**
   * Kernel credentials advertise collect and fill when eligible. 1Password
   * credentials advertise 1pw_create_access_request until a request is made,
   * 1pw_access_request_status while its approval is pending, and 1pw_fill after
   * access is granted. Managed auth credentials advertise fill while ready and
   * nothing otherwise.
   */
  available_operations: Array<CredentialVaultItem.AvailableOperation>;

  created_at: string;

  /**
   * Immutable item key assigned when the item is created.
   */
  key: string;

  /**
   * Stored-token credentials omit account and never return access_token or
   * integration_key.
   */
  spec: CredentialVaultItemSpec;

  state: CredentialVaultItemState;

  type: 'credential';

  updated_at: string;

  /**
   * Starts at 1 and increments on PATCH and successful hosted submission, but not
   * collection-link renewal. Managed auth credentials stay at 1; changes to the
   * underlying credential are read at fill time and do not change the version.
   */
  version: number;

  /**
   * One schema-derived form for the item, available in ready or pending_collection
   * state. Render every form-supported field as editable; omit totp fields and
   * preserve their stored seeds. Prefill non-sensitive values, and allow existing
   * sensitive values to be preserved or replaced without ever revealing them. No
   * field subsets or per-request form configuration exist. Validate required fields
   * against the resulting values, including preserved secrets. Submit changed values
   * only, using the version used to render the form. Scoped hosted submission
   * rejects totp edits; seed writes require the ordinary authenticated item API.
   * Customer forms likewise omit totp from their payloads. Save edits atomically. A
   * successful hosted submission increments the version, marks ready, and consumes
   * the session; an empty edit may complete collection while preserving values. A
   * customer form uses PATCH for changed values and does not send an empty PATCH
   * when nothing changed. Kernel-hosted bearer sessions require no Kernel account
   * and are bound to the item version. Expired, superseded, consumed, or
   * deleted-item sessions cannot submit. Authenticated item GET renews expired
   * active sessions for ready or pending items; pending items always receive an
   * action. A ready item with no active session omits the action until collect is
   * invoked. Concurrent renewals return the same link. Renewal changes neither
   * values nor item version. An expired link cannot renew itself. The hosted form
   * handles its collection protocol; callers only open the returned URL and do not
   * extract or submit its token through the public API. For customer-hosted forms,
   * use @onkernel/vault-react and an authenticated customer backend calling the
   * ordinary item GET/PATCH API. Kernel does not store customer collection URLs or
   * authenticate the customer's end users. Treat URLs and submitted values as
   * secrets and exclude them from logs, traces, and errors.
   */
  action?: CredentialCollectionAction | CredentialVaultItem.OnePasswordAccessApprovalAction;
}

export namespace CredentialVaultItem {
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

    type:
      | 'authorize'
      | 'collect'
      | 'prepare_checkout'
      | 'fill'
      | '1pw_create_access_request'
      | '1pw_access_request_status'
      | '1pw_fill'
      | '1pw_recover'
      | '1pw_update_access_token'
      | 'webmcp_invoke';
  }

  export interface OnePasswordAccessApprovalAction {
    /**
     * Steps for the agent to hand approval to the human and poll the resulting
     * decision.
     */
    instructions: string;

    name: '1password_access_approval';

    /**
     * Native 1Password approval link. Present it to the account owner without
     * modifying it; it does not grant access until they approve in their app.
     */
    url: string;
  }
}

/**
 * Ask the end-user whether to link their site credential through 1Password. If
 * they choose 1Password, connect their account and request access to a login in
 * their own non-shared vault; passkeys are not supported. If they decline or that
 * path fails, collect a Kernel-hosted credential item instead. Never automatically
 * retry an uncertain 1Password request or fill. Do not use credential items for
 * credit card data. Use wallet and card item types instead. Kernel credentials
 * declare fields and may enter pending_collection. 1Password credentials either
 * reference a connected credential_account or store a supplied access token and
 * integration key encrypted on the item. They store no login values or selectors.
 * Managed auth credentials reference a managed auth connection in the same project
 * that already has a saved credential, and read it at fill time; they store no
 * values. Repeating the original creation request returns the current item without
 * overwriting later state. A different request at the same key returns 409.
 */
export interface CredentialVaultItemRequest {
  /**
   * Credential fields are for login and other non-payment credentials. Do not store,
   * collect, or fill credit card data in credential items. Use wallet and card item
   * types for credit cards and payment checkout instead. Field order is preserved in
   * the user-facing collection form, so list fields in the same top-to-bottom order
   * as the website.
   */
  spec: CredentialVaultItemSpecInput;

  type: 'credential';
}

/**
 * Stored-token credentials omit account and never return access_token or
 * integration_key.
 */
export type CredentialVaultItemSpec =
  | KernelCredentialVaultItemSpec
  | OnePasswordCredentialVaultItemSpec
  | ManagedAuthCredentialVaultItemSpec;

/**
 * Credential fields are for login and other non-payment credentials. Do not store,
 * collect, or fill credit card data in credential items. Use wallet and card item
 * types for credit cards and payment checkout instead. Field order is preserved in
 * the user-facing collection form, so list fields in the same top-to-bottom order
 * as the website.
 */
export type CredentialVaultItemSpecInput =
  | KernelCredentialVaultItemSpecInput
  | OnePasswordCredentialVaultItemSpecInput
  | ManagedAuthCredentialVaultItemSpecInput;

export interface CredentialVaultItemSpecUpdate {
  /**
   * Recognizable site or service name used as the form title, without suffixes such
   * as sign-in credentials. An empty string clears it. Display text only, not an
   * enforced destination policy. The server also enforces a 16 KiB UTF-8 byte limit.
   */
  description?: string;

  fields?: { [key: string]: CredentialVaultFieldUpdate };
}

export type CredentialVaultItemState =
  | KernelCredentialVaultItemState
  | OnePasswordCredentialVaultItemState
  | ManagedAuthCredentialVaultItemState;

/**
 * Atomically update description and selected values. Omitted properties are
 * preserved. Field names, types, required flags, and sensitivity cannot change.
 * Unknown field names return 400; stale versions or mismatched item types return
 * 409 without changing the item. A successful update increments version and
 * invalidates outstanding Kernel-hosted collection sessions. If required values
 * remain missing, return pending_collection and a fresh collection action.
 * Otherwise return ready without an action; collect can open the form again
 * without clearing values. Customer URLs have no Kernel-managed expiry. 1Password
 * and managed auth credentials return 409.
 */
export interface CredentialVaultItemUpdateRequest {
  spec: CredentialVaultItemSpecUpdate;

  type: 'credential';

  /**
   * Expected current item version from the latest read.
   */
  version: number;

  /**
   * Optional immutable item ID precondition. Returns 409 if the key now identifies a
   * different item. Accepted writes target this immutable ID, preventing
   * replacement-key races. Supply this when submitting a form bound to a previously
   * read item.
   */
  expected_item_id?: string;
}

/**
 * Fill selected fields from one ready credential or ready, unexpired Link or
 * Kernel card into a browser linked to its vault. Only invoke when the item
 * advertises `fill`. Browser and vault must belong to the same project. Kernel
 * checks access and allowed destinations before filling; providing a page URL does
 * not authorize a destination.
 *
 * Find exactly one open page matching `page_url`. Credential items may omit
 * `page_url` to require exactly one open page; cards require an HTTPS page URL.
 * Credentials have no destination allowlist. TOTP fields generate a current code
 * immediately before writing; their seeds never enter the browser. For each
 * selector, search the main frame and all descendant frames for editable inputs or
 * selects matched directly or contained within matching elements. Each selector
 * must resolve to one unique editable element across all frames; zero or multiple
 * candidates fail. Count each element once, even if multiple matching containers
 * contain it. Validate all bindings before filling. Select elements match an
 * option by its value, not its label. If the page navigates or a target disappears
 * during filling, stop rather than selecting a different page or element.
 *
 * Fill in request order and stop on the first failure. This operation is not
 * atomic: previously filled fields are not rolled back. Never submit the form or
 * click buttons, though input/change events may trigger site behavior. Link and
 * Kernel cards use fill for browser checkout and do not expose aliases or support
 * egress substitution. Fill does not consume the item, so a failed or
 * indeterminate fill is safe to retry; a retry rewrites the same fields. A retry
 * right after an indeterminate fill may wait up to 15 seconds for the earlier
 * attempt's browser lock to expire.
 *
 * Secret values are never returned or included in operation logs, traces, audit
 * events, or error details. This does not prevent an agent with unrestricted
 * browser access from reading values from the page or other browser observation
 * surfaces.
 */
export interface FillVaultItemOperationRequest {
  /**
   * Browser session ID, not a reusable browser name.
   */
  browser_id: string;

  /**
   * Field bindings for this step. No two bindings may resolve to the same element.
   */
  fields: Array<VaultFillField>;

  type: 'fill';

  /**
   * Exact current top-level page URL, including path, query, and fragment. Must
   * match exactly one open page in the browser; zero or multiple matches fail. No
   * prefix or glob matching. Required for cards, which must use HTTPS without
   * embedded credentials. Optional for credentials, where omission requires exactly
   * one open page.
   */
  page_url?: string;

  /**
   * Total operation deadline in milliseconds, not a per-field timeout.
   */
  timeout_ms?: number;
}

export interface FillVaultItemOperationResult {
  /**
   * Exactly one result per request binding, in request order. After the first failed
   * or unknown field, all remaining fields are not_attempted.
   */
  fields: Array<VaultFillFieldResult>;

  /**
   * Completed only when all fields were filled. Failed when execution stopped with
   * known outcomes. Unknown when any field's outcome cannot be determined. None of
   * these statuses confirms payment or merchant acceptance.
   */
  status: 'completed' | 'failed' | 'unknown';

  type: 'fill';
}

/**
 * A ready Kernel card retains its encrypted network token and one-time code for
 * the fill operation until the item's expires_at. Fill and submit checkout before
 * then. Visa purchases require a spend_approval action before the code is issued;
 * Mastercard purchases need no hosted approval. masks.last4 is the enrolled card's
 * last four digits; masks.token_last4 is the network token's last four digits
 * shown to the merchant. Kernel cards do not expose aliases or support egress
 * substitution. Kernel does not observe whether the merchant charged the card.
 */
export interface KernelCardState {
  provider: 'kernel';

  /**
   * pending_authorization on a Visa purchase waits for the cardholder to approve it
   * through the spend_approval action; an unused link expires after 30 minutes.
   * recovery_required means approving the purchase or issuing the one-time code has
   * an unresolved outcome. Kernel never approves again or issues another code for
   * the item automatically, and the item cannot be deleted or replaced until the
   * original attempt is reconciled with support. When status_reason says the
   * provider refused retrieval before acceptance, no code was issued and a later
   * read retries. declined means the card network refused to issue a code.
   */
  status:
    | 'requested'
    | 'pending_authorization'
    | 'ready'
    | 'consumed'
    | 'expired'
    | 'declined'
    | 'recovery_required';

  /**
   * Informational registrable domain. Fill is locked to merchant_url's exact origin.
   */
  domains?: Array<string>;

  masks?: KernelCardState.Masks;

  status_reason?: string;
}

export namespace KernelCardState {
  export interface Masks {
    brand?: string;

    last4?: string;

    /**
     * Last four digits of the network token presented to the merchant.
     */
    token_last4?: string;

    [k: string]: string | undefined;
  }
}

/**
 * One live purchase with a Kernel-enrolled card. Authorization obtains an agentic
 * network token number, expiry and one-time 3-digit code. They are stored
 * encrypted for the fill operation, which types them only on merchant_url's
 * origin; the merchant's own checkout submits the payment. The one-time code is
 * valid until the item's expires_at; fill and submit checkout before then.
 * Mastercard purchases need no cardholder approval. A Visa purchase returns a
 * spend_approval action: the cardholder approves it with a Visa passkey, and
 * Kernel registers a Visa intent for one transaction up to the amount before
 * issuing the code. Card updates are not supported; delete and create a new item
 * instead.
 */
export interface KernelCardVaultItemSpec {
  /**
   * Integer amount in minor currency units (at most 50000), bound to the one-time
   * code.
   */
  amount: number;

  /**
   * ISO 4217 code. Supported: aud, brl, cad, chf, czk, dkk, eur, gbp, hkd, inr, jpy,
   * krw, mxn, nok, nzd, pln, sek, sgd, usd, zar.
   */
  currency: string;

  merchant_name: string;

  /**
   * Merchant checkout URL. Fill is allowed only on this URL's origin.
   */
  merchant_url: string;

  provider: 'kernel';

  /**
   * Key of the Kernel wallet item whose enrolled card pays.
   */
  wallet: string;

  /**
   * The merchant's ISO 3166-1 alpha-2 country code. Required for Visa cards, whose
   * one-time code is issued for the merchant's country.
   */
  merchant_country?: string;
}

export interface KernelCredentialVaultItemSpec {
  /**
   * Ordered field definitions rendered in this order by credential collection forms.
   */
  fields: Array<CredentialVaultFieldDefinition>;

  provider: 'kernel';

  /**
   * Recognizable site or service name displayed verbatim as the form title, without
   * suffixes such as sign-in credentials. Display text only, not an enforced
   * destination policy.
   */
  description?: string;
}

/**
 * Credential fields are for login and other non-payment credentials. Do not store,
 * collect, or fill credit card data in credential items. Use wallet and card item
 * types for credit cards and payment checkout instead. Field order is preserved in
 * the user-facing collection form, so list fields in the same top-to-bottom order
 * as the website.
 */
export interface KernelCredentialVaultItemSpecInput {
  /**
   * Ordered field definitions. Use the website's top-to-bottom field order; the
   * collection form renders this order unchanged.
   */
  fields: Array<CredentialVaultFieldInput>;

  provider: 'kernel';

  /**
   * The site's recognizable display name, used verbatim as the user-facing form
   * title (for example, Hacker News). Use only the site or service name; do not
   * append sign-in, login, credentials, or task instructions. This is display text,
   * not an enforced destination policy. At most 16 KiB in UTF-8 bytes.
   */
  description?: string;
}

export interface KernelCredentialVaultItemState {
  /**
   * Exactly one entry for each declared field.
   */
  fields: { [key: string]: CredentialVaultFieldState };

  provider: 'kernel';

  /**
   * Ready means all required fields have values, not that a login succeeded.
   * Optional fields may remain unset.
   */
  status: 'pending_collection' | 'ready';
}

export interface KernelWalletState {
  provider: 'kernel';

  /**
   * pending_authorization asks the cardholder to use the card_enrollment action.
   * connected means the card is stored; it can pay once payment_methods reports
   * capabilities.single_use_card.eligible. reconnect_required asks the cardholder to
   * use a new card_enrollment action after an uncertain enrollment was safely
   * removed. degraded means the enrollment outcome is unknown and the wallet must be
   * deleted before adding another card.
   */
  status: 'pending_authorization' | 'connected' | 'reconnect_required' | 'degraded';

  status_reason?: string;
}

/**
 * One card stored with Kernel-managed credentials. Creation returns a
 * card*enrollment action: the cardholder enters the card and their email on a
 * Kernel-hosted page, and the wallet connects once the card is stored. Kernel then
 * enrolls it for an agentic network token when the issuer supports it. The card
 * number never reaches Kernel. The connected wallet's payment_methods expansion
 * lists the card; capabilities.single_use_card.eligible is false, with a
 * network_token*\* reason, until the card has a network token, and authorize
 * returns 400 for such a card. Visa purchases require the cardholder to complete a
 * spend_approval action before Kernel issues a one-time code; Mastercard purchases
 * need no hosted approval.
 */
export interface KernelWalletVaultItemSpec {
  provider: 'kernel';
}

export interface ManagedAuthCredentialVaultField {
  /**
   * Text, email, and password have form inputs; totp does not and is omitted from
   * both Kernel-hosted and customer React forms. Password and totp must be
   * sensitive. A totp value is an RFC 4648 Base32 generator seed (case-insensitive,
   * optional trailing padding), not an otpauth URI or current code. Reject invalid
   * or empty decoded seeds. Browser fill generates an RFC 6238 code at execution
   * time using HMAC-SHA1, 6 digits, and a 30-second period. Preserve leading zeros;
   * never fill the seed. Custom algorithms, digits, periods, and form enrollment are
   * unsupported.
   */
  type: CredentialVaultFieldType;
}

export interface ManagedAuthCredentialVaultItemSpec {
  /**
   * ID of the managed auth connection whose saved credential this item reads. List
   * connections with `GET /auth/connections`.
   */
  connection_id: string;

  provider: 'managed_auth';

  /**
   * Display text supplied when the item was created. Omitted when none was given.
   */
  description?: string;
}

/**
 * A credential backed by a managed auth connection. The item stores no values: it
 * reads the connection's saved credential at fill time, so updates made through
 * managed auth apply immediately. The connection must be in the vault's project
 * and hold a saved Kernel credential. The check is the saved credential, not
 * connection status: a connection that needs re-authentication qualifies, and an
 * authenticated one without a saved credential does not. Returns 404 for an
 * unknown connection, and 409 when the connection is in another project, has no
 * saved credential yet, or uses an external credential provider such as 1Password.
 * No collection form is offered; managed auth collects the login.
 */
export interface ManagedAuthCredentialVaultItemSpecInput {
  /**
   * ID of the managed auth connection whose saved credential this item reads. List
   * connections with `GET /auth/connections`.
   */
  connection_id: string;

  provider: 'managed_auth';

  /**
   * Optional display text for the item, such as the site or service name. Set at
   * creation and cannot be changed later; repeating the request with a different
   * description returns 409. At most 16 KiB in UTF-8 bytes.
   */
  description?: string;
}

export interface ManagedAuthCredentialVaultItemState {
  provider: 'managed_auth';

  /**
   * Items are created ready, which means the connection has a saved Kernel
   * credential that stores values or a TOTP seed (what has_values or has_totp_secret
   * report on credentials), not that a login succeeded. Unavailable means it no
   * longer does; such items advertise no operations.
   */
  status: 'ready' | 'unavailable';

  /**
   * One entry per non-empty value on the connection's saved credential, keyed by the
   * field name to use in fill bindings. Included on single-item responses (create
   * and get) and omitted from list responses, like `value_keys` on credentials.
   * Empty when unavailable or when every stored value is empty. A stored value named
   * totp_secret is never listed or filled. Values are never returned. A totp entry
   * is present when the credential has a TOTP seed; fill writes a generated code for
   * it. Entries follow the connection's credential.
   */
  fields?: { [key: string]: ManagedAuthCredentialVaultField };

  /**
   * Present when status is unavailable. connection_not_found means the connection
   * was deleted. no_credential means the connection's credential was deleted or
   * emptied after the item was created. external_credential means the connection was
   * moved to an external credential provider.
   */
  status_reason?: 'connection_not_found' | 'no_credential' | 'external_credential';
}

export interface OnePasswordCredentialAccountSpec {
  authorization: OnePasswordCredentialAccountSpec.Authorization;

  provider: '1password';
}

export namespace OnePasswordCredentialAccountSpec {
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

export interface OnePasswordCredentialAccountState {
  provider: '1password';

  status: 'pending_authorization' | 'connected' | 'reconnect_required' | 'declined';

  status_reason?: string;
}

/**
 * Stored-token credentials omit account and never return access_token or
 * integration_key.
 */
export interface OnePasswordCredentialVaultItemSpec {
  provider: '1password';

  /**
   * Credential Request v2 input sent to the extension. A credential item may request
   * up to five login entries.
   */
  requests: OnePasswordCredentialVaultItemSpec.Requests;

  /**
   * Customer-supplied expiry metadata, if provided.
   */
  access_token_expires_at?: string;

  account?: string;
}

export namespace OnePasswordCredentialVaultItemSpec {
  /**
   * Credential Request v2 input sent to the extension. A credential item may request
   * up to five login entries.
   */
  export interface Requests {
    entries: Array<Requests.Entry>;

    /**
     * Must be 2.
     */
    version: number;

    goal?: string;
  }

  export namespace Requests {
    export interface Entry {
      parameters: Entry.Parameters;

      /**
       * Must be login.
       */
      type: string;

      keywords?: Array<string>;

      reason?: string;
    }

    export namespace Entry {
      export interface Parameters {
        website: string;
      }
    }
  }
}

/**
 * A login request backed by a connected 1Password account or by a
 * customer-supplied access token and matching integration key. Supply either
 * account or both secrets, never both. Supplied secrets are write-only and never
 * returned. Supply requests for new items; website remains supported for existing
 * account-backed callers.
 */
export interface OnePasswordCredentialVaultItemSpecInput {
  provider: '1password';

  /**
   * Customer-supplied 1Password broker token. Requires integration_key; stored
   * encrypted on this item. Omit if providing a connected credential_account item
   * via the account field.
   */
  access_token?: string;

  /**
   * Optional supplied token expiry metadata for stored-token credentials. Omit if
   * providing a connected credential_account item via the account field.
   */
  access_token_expires_at?: string;

  /**
   * Key of a connected credential_account item in the same vault. Omit for
   * stored-token credentials.
   */
  account?: string;

  /**
   * Matching customer-supplied integration key. Requires access_token; stored
   * encrypted on this item. Omit if providing a connected credential_account item
   * via the account field.
   */
  integration_key?: string;

  /**
   * Credential Request v2 input sent to the extension. A credential item may request
   * up to five login entries.
   */
  requests?: OnePasswordCredentialVaultItemSpecInput.Requests;

  /**
   * @deprecated Legacy single-login shorthand. Supply requests instead.
   */
  website?: string;
}

export namespace OnePasswordCredentialVaultItemSpecInput {
  /**
   * Credential Request v2 input sent to the extension. A credential item may request
   * up to five login entries.
   */
  export interface Requests {
    entries: Array<Requests.Entry>;

    /**
     * Must be 2.
     */
    version: number;

    goal?: string;
  }

  export namespace Requests {
    export interface Entry {
      parameters: Entry.Parameters;

      /**
       * Must be login.
       */
      type: string;

      keywords?: Array<string>;

      reason?: string;
    }

    export namespace Entry {
      export interface Parameters {
        website: string;
      }
    }
  }
}

export interface OnePasswordCredentialVaultItemState {
  provider: '1password';

  status: 'pending_authorization' | 'ready' | 'declined' | 'failed';

  /**
   * Non-secret broker state. Granted credential references stay encrypted
   * server-side and can only be used by the fill operation.
   */
  access_request?: OnePasswordCredentialVaultItemState.AccessRequest;

  /**
   * Opaque request ID returned by the 1Password broker after a successful
   * createAccessRequest call.
   */
  access_request_id?: string;

  status_reason?: string;
}

export namespace OnePasswordCredentialVaultItemState {
  /**
   * Non-secret broker state. Granted credential references stay encrypted
   * server-side and can only be used by the fill operation.
   */
  export interface AccessRequest {
    id: string;

    has_autofill_token: boolean;

    /**
     * One of pending, resolved, denied, or failed.
     */
    state: string;

    /**
     * Provider-created timestamp as returned by the broker.
     */
    createdAt?: string;

    /**
     * Login entries returned directly on accessRequest by the observed extension
     * build. Omitted when the provider does not supply them.
     */
    entries?: Array<AccessRequest.Entry>;

    /**
     * Goal echoed by the observed createAccessRequest response when present.
     */
    goal?: string;

    granted_count?: number;

    /**
     * Opaque provider identity returned by the broker.
     */
    identity?: string;

    /**
     * Provider path if supplied in the broker response.
     */
    path?: string;

    /**
     * The request object if returned by the extension. The observed create response
     * may omit entries; no entry IDs are invented.
     */
    request?: AccessRequest.Request;
  }

  export namespace AccessRequest {
    export interface Entry {
      id?: string;

      keywords?: Array<string>;

      parameters?: Entry.Parameters;

      reason?: string;

      type?: string;
    }

    export namespace Entry {
      export interface Parameters {
        website?: string;
      }
    }

    /**
     * The request object if returned by the extension. The observed create response
     * may omit entries; no entry IDs are invented.
     */
    export interface Request {
      entries?: Array<Request.Entry>;

      goal?: string;

      version?: number;
    }

    export namespace Request {
      export interface Entry {
        id?: string;

        keywords?: Array<string>;

        parameters?: Entry.Parameters;

        reason?: string;

        type?: string;
      }

      export namespace Entry {
        export interface Parameters {
          website?: string;
        }
      }
    }
  }
}

/**
 * Fill and submit an approved 1Password login in the selected browser page. The
 * page must share the selected entry's login origin. Supply entry_id when more
 * than one approved entry matches the page origin. The extension selects fields;
 * callers cannot supply selectors or secret values. Submission does not confirm
 * website authentication.
 */
export interface OnePasswordFillVaultItemOperationRequest {
  /**
   * Browser session ID, not a reusable browser name.
   */
  browser_id: string;

  /**
   * Exact current top-level page URL. Must match exactly one open page in the
   * browser.
   */
  page_url: string;

  type: '1pw_fill';

  /**
   * ID of an approved request entry. Required when several approved entries have the
   * page's origin.
   */
  entry_id?: string;

  timeout_ms?: number;
}

/**
 * The submission result reported by the 1Password extension when available. Kernel
 * returns fill_unknown if the extension call has no conclusive result. Inspect the
 * page to determine successful authentication on the website.
 */
export interface OnePasswordFillVaultItemOperationResult {
  /**
   * Kernel's outcome of the extension call. fill_submitted means the extension
   * reported submission, not website authentication. fill_failed means the extension
   * returned a known failure and may include error_code. fill_unknown means
   * submission may have happened without a conclusive response; it has no error_code
   * and must not be retried in the same browser.
   */
  status: 'fill_submitted' | 'fill_failed' | 'fill_unknown';

  type: '1pw_fill';

  /**
   * Present only for a conclusive fill_failed response. These are allowlisted
   * 1Password extension codes, never raw errors, secrets, or page content.
   */
  error_code?: 'fillFailed' | 'autosubmitFailed' | 'noExistingCredentials' | 'authenticationFailed';
}

export interface OnePasswordOAuthAction {
  name: '1password_oauth';

  /**
   * 1Password-hosted OAuth authorization URL for the human to open.
   */
  url: string;
}

/**
 * Kernel encountered a recoverable error while linking this 1Password account. Use
 * this action to get a new link to recover the connection. After recovery
 * completes, start a new authorization on the same item.
 */
export interface OnePasswordRecoverVaultItemOperationRequest {
  type: '1pw_recover';
}

/**
 * Request access to login entries in the end-user's own, non-shared 1Password
 * vault. No browser is needed; the end-user approves access in the 1Password app.
 * Shared-vault items and passkeys are not supported. Per-entry reason and keywords
 * overrides are only supported for a single login entry.
 */
export interface OnePasswordRequestAccessVaultItemOperationRequest {
  type: '1pw_create_access_request';

  goal?: string;

  keywords?: Array<string>;

  reason?: string;
}

/**
 * Prepare an unused AgentCard card for a supported checkout. Deliver the returned
 * approval URL and keep the approval page open. Poll the item until
 * ready_to_submit, then submit native Pay before preparation.expires_at. Readiness
 * lasts at most 30 seconds. Unused preparations expire automatically. Preparations
 * are single-use even after failure or expiry; do not automatically retry and
 * reconcile uncertain outcomes with the merchant.
 */
export interface PrepareCheckoutVaultItemOperationRequest {
  /**
   * Required when preparing an unused AgentCard card for a supported checkout
   * processor. Consent is bound to this browser and declared merchant origin, not a
   * tab. Wait for the item's ready_to_submit status before native Pay and submit
   * within its readiness deadline. Unused preparations expire automatically; every
   * preparation is single-use, including after failure or expiry.
   */
  checkout: VaultCheckoutContext;

  type: 'prepare_checkout';
}

export interface VaultCardAliases {
  cvc: string;

  exp_month: string;

  exp_year: string;

  number: string;
}

/**
 * Combined expiration derived from the stored month and year; not a separate
 * stored secret.
 */
export type VaultCardFillField =
  | VaultCardFillField.VaultCardStoredFillField
  | VaultCardFillField.VaultCardExpirationFillField;

export namespace VaultCardFillField {
  export interface VaultCardStoredFillField {
    /**
     * Field in the decrypted card, not an alias. Number and CVC preserve leading
     * zeros; month uses two digits and year uses four digits. Billing fields use the
     * provider's stored billing address (name, line1, line2, city, state, postal_code,
     * country) without reformatting. Request only needed billing fields. An absent or
     * empty requested billing field returns 400 field_unavailable before any browser
     * writes; it does not make other card fields unavailable.
     */
    field:
      | 'number'
      | 'exp_month'
      | 'exp_year'
      | 'cvc'
      | 'billing_name'
      | 'billing_line1'
      | 'billing_line2'
      | 'billing_city'
      | 'billing_state'
      | 'billing_postal_code'
      | 'billing_country';

    /**
     * CSS selector for an editable input or select, or a containing element. Must
     * resolve to one unique editable element across all page frames.
     */
    selector: string;
  }

  /**
   * Combined expiration derived from the stored month and year; not a separate
   * stored secret.
   */
  export interface VaultCardExpirationFillField {
    field: 'expiration';

    format: 'MM/YY' | 'MM/YYYY';

    /**
     * CSS selector for an editable input or select, or a containing element. Must
     * resolve to one unique editable element across all page frames.
     */
    selector: string;
  }
}

/**
 * Required when preparing an unused AgentCard card for a supported checkout
 * processor. Consent is bound to this browser and declared merchant origin, not a
 * tab. Wait for the item's ready_to_submit status before native Pay and submit
 * within its readiness deadline. Unused preparations expire automatically; every
 * preparation is single-use, including after failure or expiry.
 */
export interface VaultCheckoutContext {
  /**
   * Active browser session with this vault bound to it.
   */
  browser_id: string;

  /**
   * Use production or sandbox for Square, Braintree, Worldpay and Adyen; shared for
   * Bambora and Mercado Pago. Shared endpoints do not establish test mode. Merchant
   * credentials/configuration determine processor test mode, independently of the
   * AgentCard credential mode.
   */
  environment: 'production' | 'sandbox' | 'shared';

  /**
   * Canonical HTTPS origin of the top-level merchant document, not a processor
   * iframe. HTTP localhost is accepted for tests.
   */
  merchant_origin: string;

  /**
   * Checkout processor. Omit for Square compatibility. Adyen supports fresh-card
   * Sessions requests on Adyen hosts only. Use public dummy card fields, not vault
   * aliases. The unique armed preparation is associated with the subsequent eligible
   * request from this browser and declared merchant origin; competing preparations
   * are rejected.
   */
  psp?: AgentcardPreparedProcessor;
}

export interface VaultFillField {
  /**
   * A credential field name from the item's declared fields (Kernel) or state.fields
   * from a single-item read (managed auth), or a supported card field. Unset
   * credential fields cannot be filled.
   */
  field: string;

  selector: string;

  /**
   * Required only for a card's combined expiration field. Forbidden for other card
   * fields and all credential fields.
   */
  format?: 'MM/YY' | 'MM/YYYY';
}

export interface VaultFillFieldResult {
  /**
   * Zero-based index into the request fields array.
   */
  index: number;

  /**
   * Filled means the fill action completed, not that the website retained or
   * accepted the value.
   */
  status: 'filled' | 'failed' | 'not_attempted' | 'unknown';

  /**
   * Present only for failed or unknown fields. Never includes secret values, DOM
   * content, or raw browser errors.
   */
  error_code?:
    | 'target_changed'
    | 'element_not_found'
    | 'ambiguous_selector'
    | 'element_not_editable'
    | 'option_not_found'
    | 'timeout'
    | 'execution_failed';
}

export type VaultItem =
  | VaultItem.WalletVaultItem
  | VaultItem.CardVaultItem
  | CredentialAccountVaultItem
  | CredentialVaultItem;

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
     * AgentCard wallet. Omit provider_config to use Kernel-managed credentials, or
     * select a customer-owned configuration. Mode (sandbox vs live) is determined by
     * the selected credential; there is no per-item test flag. Without user_id,
     * creation returns a hosted enrollment action and Kernel polls until the user
     * connects. user_id may only reference a user already enrolled by a wallet in this
     * organization under the same configuration.
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

      type:
        | 'authorize'
        | 'collect'
        | 'prepare_checkout'
        | 'fill'
        | '1pw_create_access_request'
        | '1pw_access_request_status'
        | '1pw_fill'
        | '1pw_recover'
        | '1pw_update_access_token'
        | 'webmcp_invoke';
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
     * Live payment card. Test-mode card creation is not supported.
     */
    spec: ItemsAPI.CardVaultItemSpec;

    /**
     * Issued Link cards retain encrypted card material for the fill operation. Link
     * cards do not expose aliases or support egress substitution.
     */
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

      type:
        | 'authorize'
        | 'collect'
        | 'prepare_checkout'
        | 'fill'
        | '1pw_create_access_request'
        | '1pw_access_request_status'
        | '1pw_fill'
        | '1pw_recover'
        | '1pw_update_access_token'
        | 'webmcp_invoke';
    }
  }
}

export type VaultItemAction =
  | VaultItemAction.LinkOAuthAction
  | OnePasswordOAuthAction
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

/**
 * Authorization and preparation return the existing item shape. Fill returns a
 * value-free result; WebMCP invocation returns the tool's output. Neither persists
 * transient outcomes on the item.
 */
export type VaultItemOperationResponse =
  | VaultItemOperationResponse.WalletVaultItem
  | VaultItemOperationResponse.CardVaultItem
  | CredentialAccountVaultItem
  | CredentialVaultItem
  | FillVaultItemOperationResult
  | OnePasswordFillVaultItemOperationResult
  | WebmcpInvokeVaultItemOperationResult;

export namespace VaultItemOperationResponse {
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
     * AgentCard wallet. Omit provider_config to use Kernel-managed credentials, or
     * select a customer-owned configuration. Mode (sandbox vs live) is determined by
     * the selected credential; there is no per-item test flag. Without user_id,
     * creation returns a hosted enrollment action and Kernel polls until the user
     * connects. user_id may only reference a user already enrolled by a wallet in this
     * organization under the same configuration.
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

      type:
        | 'authorize'
        | 'collect'
        | 'prepare_checkout'
        | 'fill'
        | '1pw_create_access_request'
        | '1pw_access_request_status'
        | '1pw_fill'
        | '1pw_recover'
        | '1pw_update_access_token'
        | 'webmcp_invoke';
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
     * Live payment card. Test-mode card creation is not supported.
     */
    spec: ItemsAPI.CardVaultItemSpec;

    /**
     * Issued Link cards retain encrypted card material for the fill operation. Link
     * cards do not expose aliases or support egress substitution.
     */
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

      type:
        | 'authorize'
        | 'collect'
        | 'prepare_checkout'
        | 'fill'
        | '1pw_create_access_request'
        | '1pw_access_request_status'
        | '1pw_fill'
        | '1pw_recover'
        | '1pw_update_access_token'
        | 'webmcp_invoke';
    }
  }
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

export interface VaultWebmcpBinding {
  /**
   * A declared, populated credential field or supported card field. A TOTP field
   * supplies a fresh code, never its seed.
   */
  field: string;

  /**
   * RFC 6901 JSON Pointer to an existing null value in input. Object keys are exact;
   * array indices must be canonical and in range. No root or array-append paths.
   * Each path and each field may occur only once.
   */
  input_path: string;

  /**
   * Required for card expiration (MM/YY or MM/YYYY), forbidden for other fields.
   * Invalid formats are rejected before invocation.
   */
  format?: string;
}

/**
 * AgentCard wallet. Omit provider_config to use Kernel-managed credentials, or
 * select a customer-owned configuration. Mode (sandbox vs live) is determined by
 * the selected credential; there is no per-item test flag. Without user_id,
 * creation returns a hosted enrollment action and Kernel polls until the user
 * connects. user_id may only reference a user already enrolled by a wallet in this
 * organization under the same configuration.
 */
export type WalletVaultItemSpec =
  | WalletVaultItemSpec.LinkWalletVaultItemSpec
  | WalletVaultItemSpec.AgentCardWalletVaultItemSpec
  | KernelWalletVaultItemSpec;

export namespace WalletVaultItemSpec {
  export interface LinkWalletVaultItemSpec {
    authorization: LinkWalletVaultItemSpec.Authorization;

    provider: 'link';
  }

  export namespace LinkWalletVaultItemSpec {
    export interface Authorization {
      client: Authorization.KernelManagedOAuthClient | Authorization.CustomerManagedOAuthClient;

      method: 'oauth';
    }

    export namespace Authorization {
      export interface KernelManagedOAuthClient {
        type: 'kernel_managed';
      }

      export interface CustomerManagedOAuthClient {
        /**
         * Select a provider config by ID or name. Responses return the ID. Renaming a
         * config does not change existing wallet bindings; an item cannot switch to a
         * different config after creation.
         */
        provider_config: CustomerManagedOAuthClient.ProviderConfig;

        type: 'customer_managed';
      }

      export namespace CustomerManagedOAuthClient {
        /**
         * Select a provider config by ID or name. Responses return the ID. Renaming a
         * config does not change existing wallet bindings; an item cannot switch to a
         * different config after creation.
         */
        export interface ProviderConfig {
          id?: string;

          name?: string;
        }
      }
    }
  }

  /**
   * AgentCard wallet. Omit provider_config to use Kernel-managed credentials, or
   * select a customer-owned configuration. Mode (sandbox vs live) is determined by
   * the selected credential; there is no per-item test flag. Without user_id,
   * creation returns a hosted enrollment action and Kernel polls until the user
   * connects. user_id may only reference a user already enrolled by a wallet in this
   * organization under the same configuration.
   */
  export interface AgentCardWalletVaultItemSpec {
    provider: 'agentcard';

    /**
     * Select an AgentCard configuration. The wallet's configuration cannot be changed
     * after creation.
     */
    provider_config?: AgentCardWalletVaultItemSpec.ProviderConfig;

    user_id?: string;
  }

  export namespace AgentCardWalletVaultItemSpec {
    /**
     * Select an AgentCard configuration. The wallet's configuration cannot be changed
     * after creation.
     */
    export interface ProviderConfig {
      id?: string;

      name?: string;
    }
  }
}

export type WalletVaultItemState =
  | WalletVaultItemState.LinkWalletState
  | WalletVaultItemState.AgentCardWalletState
  | KernelWalletState;

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

/**
 * Invoke a WebMCP tool using values from a vaulted item. The browser must be
 * attached to the item's vault. Discover the tool_ref, inputSchema, and source
 * with GET /browsers/{id_or_name}/webmcp/tools or webmcp.listTools() in the
 * Browser REPL (POST /browsers/{id_or_name}/repl) before invoking it. Input paths
 * replace existing null slots in input. Tool output is returned without redaction
 * and may include the supplied values. The tool may submit or perform other side
 * effects. Any item destination restrictions apply to the tool's top-level page
 * and registering frame (if any).
 */
export interface WebmcpInvokeVaultItemOperationRequest {
  bindings: Array<VaultWebmcpBinding>;

  /**
   * Browser session ID, not a reusable browser name.
   */
  browser_id: string;

  /**
   * Public tool arguments with an existing null slot at each binding path. At most
   * 64 KiB after JSON serialization, including substituted values. Never include
   * vault values here.
   */
  input: { [key: string]: unknown };

  /**
   * Exact top-level URL from the discovered tool source (fragment omitted). This
   * pins the target page; it does not authorize a destination.
   */
  page_url: string;

  /**
   * Opaque reference to the exact live WebMCP registration.
   */
  tool_ref: string;

  type: 'webmcp_invoke';

  /**
   * Tool invocation timeout in seconds; preflight and response handling have an
   * additional bounded allowance. An indeterminate outcome is not retried.
   */
  timeout_sec?: number;
}

/**
 * Returns the same tool result fields as the browser WebMCP invoke API, plus the
 * vault operation discriminator. Output and error text are untrusted page-provided
 * data, returned without redaction; tools may include supplied vault values.
 * Inspect the browser page to determine whether the intended site action
 * succeeded.
 */
export interface WebmcpInvokeVaultItemOperationResult {
  /**
   * Unknown means invocation may have run; do not retry automatically. No status
   * confirms that the website accepted the action.
   */
  status: 'completed' | 'canceled' | 'error' | 'awaiting_submission' | 'unknown';

  type: 'webmcp_invoke';

  /**
   * Untrusted page-provided error text, returned without redaction. May contain
   * supplied vault values.
   */
  error_text?: string;

  /**
   * Present when the browser reported one.
   */
  invocation_id?: string;

  /**
   * Untrusted page-provided output, returned without redaction. May contain supplied
   * vault values.
   */
  output?: unknown;
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
   * authorization, approval, or credential collection. Return the current item when
   * ready or when the wait elapses. This does not wait for edits to an already-ready
   * credential; poll GET without wait and compare version to observe changes after
   * collect. Managed auth credentials are created ready, so wait returns
   * immediately.
   */
  wait?: number;
}

export type ItemUpdateParams =
  | ItemUpdateParams.CardVaultItemUpdateRequest
  | ItemUpdateParams.CredentialVaultItemUpdateRequest;

export declare namespace ItemUpdateParams {
  export interface CardVaultItemUpdateRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param: Live payment card. Test-mode card creation is not supported.
     */
    spec: CardVaultItemSpec;

    /**
     * Body param
     */
    type?: 'card';
  }

  export interface CredentialVaultItemUpdateRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param
     */
    spec: CredentialVaultItemSpecUpdate;

    /**
     * Body param
     */
    type: 'credential';

    /**
     * Body param: Expected current item version from the latest read.
     */
    version: number;

    /**
     * Body param: Optional immutable item ID precondition. Returns 409 if the key now
     * identifies a different item. Accepted writes target this immutable ID,
     * preventing replacement-key races. Supply this when submitting a form bound to a
     * previously read item.
     */
    expected_item_id?: string;
  }
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

export type ItemPerformOperationParams =
  | ItemPerformOperationParams.AuthorizeVaultItemOperationRequest
  | ItemPerformOperationParams.CollectVaultItemOperationRequest
  | ItemPerformOperationParams.PrepareCheckoutVaultItemOperationRequest
  | ItemPerformOperationParams.FillVaultItemOperationRequest
  | ItemPerformOperationParams.OnePasswordRequestAccessVaultItemOperationRequest
  | ItemPerformOperationParams.OnePasswordPollAccessVaultItemOperationRequest
  | ItemPerformOperationParams.OnePasswordFillVaultItemOperationRequest
  | ItemPerformOperationParams.OnePasswordRecoverVaultItemOperationRequest
  | ItemPerformOperationParams.OnePasswordUpdateAccessTokenVaultItemOperationRequest
  | ItemPerformOperationParams.WebmcpInvokeVaultItemOperationRequest;

export declare namespace ItemPerformOperationParams {
  export interface AuthorizeVaultItemOperationRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param
     */
    type: 'authorize';
  }

  export interface CollectVaultItemOperationRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param
     */
    type: 'collect';
  }

  export interface PrepareCheckoutVaultItemOperationRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param: Required when preparing an unused AgentCard card for a supported
     * checkout processor. Consent is bound to this browser and declared merchant
     * origin, not a tab. Wait for the item's ready_to_submit status before native Pay
     * and submit within its readiness deadline. Unused preparations expire
     * automatically; every preparation is single-use, including after failure or
     * expiry.
     */
    checkout: VaultCheckoutContext;

    /**
     * Body param
     */
    type: 'prepare_checkout';
  }

  export interface FillVaultItemOperationRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param: Browser session ID, not a reusable browser name.
     */
    browser_id: string;

    /**
     * Body param: Field bindings for this step. No two bindings may resolve to the
     * same element.
     */
    fields: Array<VaultFillField>;

    /**
     * Body param
     */
    type: 'fill';

    /**
     * Body param: Exact current top-level page URL, including path, query, and
     * fragment. Must match exactly one open page in the browser; zero or multiple
     * matches fail. No prefix or glob matching. Required for cards, which must use
     * HTTPS without embedded credentials. Optional for credentials, where omission
     * requires exactly one open page.
     */
    page_url?: string;

    /**
     * Body param: Total operation deadline in milliseconds, not a per-field timeout.
     */
    timeout_ms?: number;
  }

  export interface OnePasswordRequestAccessVaultItemOperationRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param
     */
    type: '1pw_create_access_request';

    /**
     * Body param
     */
    goal?: string;

    /**
     * Body param
     */
    keywords?: Array<string>;

    /**
     * Body param
     */
    reason?: string;
  }

  export interface OnePasswordPollAccessVaultItemOperationRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param
     */
    type: '1pw_access_request_status';

    /**
     * Body param
     */
    timeout_seconds?: number;
  }

  export interface OnePasswordFillVaultItemOperationRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param: Browser session ID, not a reusable browser name.
     */
    browser_id: string;

    /**
     * Body param: Exact current top-level page URL. Must match exactly one open page
     * in the browser.
     */
    page_url: string;

    /**
     * Body param
     */
    type: '1pw_fill';

    /**
     * Body param: ID of an approved request entry. Required when several approved
     * entries have the page's origin.
     */
    entry_id?: string;

    /**
     * Body param
     */
    timeout_ms?: number;
  }

  export interface OnePasswordRecoverVaultItemOperationRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param
     */
    type: '1pw_recover';
  }

  export interface OnePasswordUpdateAccessTokenVaultItemOperationRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param
     */
    access_token: string;

    /**
     * Body param
     */
    type: '1pw_update_access_token';

    /**
     * Body param: Optional supplied expiry. Omit to clear the old expiry.
     */
    access_token_expires_at?: string;
  }

  export interface WebmcpInvokeVaultItemOperationRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param
     */
    bindings: Array<VaultWebmcpBinding>;

    /**
     * Body param: Browser session ID, not a reusable browser name.
     */
    browser_id: string;

    /**
     * Body param: Public tool arguments with an existing null slot at each binding
     * path. At most 64 KiB after JSON serialization, including substituted values.
     * Never include vault values here.
     */
    input: { [key: string]: unknown };

    /**
     * Body param: Exact top-level URL from the discovered tool source (fragment
     * omitted). This pins the target page; it does not authorize a destination.
     */
    page_url: string;

    /**
     * Body param: Opaque reference to the exact live WebMCP registration.
     */
    tool_ref: string;

    /**
     * Body param
     */
    type: 'webmcp_invoke';

    /**
     * Body param: Tool invocation timeout in seconds; preflight and response handling
     * have an additional bounded allowance. An indeterminate outcome is not retried.
     */
    timeout_sec?: number;
  }
}

export type ItemUpsertParams =
  | ItemUpsertParams.WalletVaultItemRequest
  | ItemUpsertParams.CardVaultItemRequest
  | ItemUpsertParams.CredentialAccountVaultItemRequest
  | ItemUpsertParams.CredentialVaultItemRequest;

export declare namespace ItemUpsertParams {
  export interface WalletVaultItemRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param: AgentCard wallet. Omit provider_config to use Kernel-managed
     * credentials, or select a customer-owned configuration. Mode (sandbox vs live) is
     * determined by the selected credential; there is no per-item test flag. Without
     * user_id, creation returns a hosted enrollment action and Kernel polls until the
     * user connects. user_id may only reference a user already enrolled by a wallet in
     * this organization under the same configuration.
     */
    spec:
      | WalletVaultItemRequest.LinkWalletVaultItemRequestSpec
      | WalletVaultItemRequest.AgentCardWalletVaultItemSpec
      | KernelWalletVaultItemSpec;

    /**
     * Body param
     */
    type: 'wallet';
  }

  export namespace WalletVaultItemRequest {
    export interface LinkWalletVaultItemRequestSpec {
      /**
       * Kernel starts and completes the user's Link authorization flow.
       */
      authorization:
        | LinkWalletVaultItemRequestSpec.KernelManagedLinkAuthorizationInput
        | LinkWalletVaultItemRequestSpec.ImportedLinkAuthorizationInput;

      provider: 'link';
    }

    export namespace LinkWalletVaultItemRequestSpec {
      /**
       * Kernel starts and completes the user's Link authorization flow.
       */
      export interface KernelManagedLinkAuthorizationInput {
        client: KernelManagedLinkAuthorizationInput.Client;

        method: 'oauth';
      }

      export namespace KernelManagedLinkAuthorizationInput {
        export interface Client {
          type: 'kernel_managed';
        }
      }

      /**
       * The customer's backend completes Link OAuth and supplies the resulting tokens.
       * For a new wallet, Kernel verifies the access token can access Link payment
       * methods without consuming or rotating the refresh token. Valid access creates a
       * wallet with state.status=connected. An expired, invalid, revoked, or
       * insufficiently scoped access token returns 400 and no wallet is created. Refresh
       * expired tokens in your backend before importing them. A failed import does not
       * modify existing wallets. After successful import, Kernel owns subsequent
       * refresh-token rotation; the customer must stop refreshing this grant. Import
       * does not verify the refresh token: if it or the configured client credentials
       * are rejected during a later refresh, the imported wallet becomes degraded. An
       * unknown refresh outcome also leaves it degraded; Kernel does not retry a refresh
       * token that may already have been consumed. There is no in-place reauthorization
       * operation for an imported wallet. If this imported wallet's credentials become
       * unusable, obtain a fresh Link OAuth grant in your backend and create a wallet
       * under a NEW wallet key. Use the new wallet for NEW cards and payments, not to
       * retry an old payment whose outcome is uncertain. This does not replace the old
       * grant, rebind existing cards, or resolve their payment outcomes. Retain the old
       * wallet and its cards while reconciling any uncertain payments with the provider
       * or support. Do not repeat an uncertain payment on the new wallet, and do not
       * treat deletion as evidence that it did not execute. Deletion of the old wallet
       * can remain blocked by unresolved child cards. Repeating a create for the same
       * item key and non-secret spec returns the existing wallet without replacing
       * tokens, even if they have rotated or the wallet needs reconnection. ID and name
       * references resolving to the same config are equivalent. A different config or
       * non-secret spec returns 409. This create operation does not replace an existing
       * grant.
       */
      export interface ImportedLinkAuthorizationInput {
        client: ImportedLinkAuthorizationInput.Client;

        method: 'oauth';

        /**
         * Send the token pair from your backend. Both tokens must be from the same Link
         * grant under the referenced client. Supply a currently valid access token. Kernel
         * refreshes when needed after import and uses the expiry returned by Link for
         * subsequent tokens. Tokens are never returned in wallet responses, events, or
         * logs.
         */
        tokens: ImportedLinkAuthorizationInput.Tokens;
      }

      export namespace ImportedLinkAuthorizationInput {
        export interface Client {
          /**
           * Select a provider config by ID or name. Responses return the ID. Renaming a
           * config does not change existing wallet bindings; an item cannot switch to a
           * different config after creation.
           */
          provider_config: Client.ProviderConfig;

          type: 'customer_managed';
        }

        export namespace Client {
          /**
           * Select a provider config by ID or name. Responses return the ID. Renaming a
           * config does not change existing wallet bindings; an item cannot switch to a
           * different config after creation.
           */
          export interface ProviderConfig {
            id?: string;

            name?: string;
          }
        }

        /**
         * Send the token pair from your backend. Both tokens must be from the same Link
         * grant under the referenced client. Supply a currently valid access token. Kernel
         * refreshes when needed after import and uses the expiry returned by Link for
         * subsequent tokens. Tokens are never returned in wallet responses, events, or
         * logs.
         */
        export interface Tokens {
          access_token: string;

          refresh_token: string;
        }
      }
    }

    /**
     * AgentCard wallet. Omit provider_config to use Kernel-managed credentials, or
     * select a customer-owned configuration. Mode (sandbox vs live) is determined by
     * the selected credential; there is no per-item test flag. Without user_id,
     * creation returns a hosted enrollment action and Kernel polls until the user
     * connects. user_id may only reference a user already enrolled by a wallet in this
     * organization under the same configuration.
     */
    export interface AgentCardWalletVaultItemSpec {
      provider: 'agentcard';

      /**
       * Select an AgentCard configuration. The wallet's configuration cannot be changed
       * after creation.
       */
      provider_config?: AgentCardWalletVaultItemSpec.ProviderConfig;

      user_id?: string;
    }

    export namespace AgentCardWalletVaultItemSpec {
      /**
       * Select an AgentCard configuration. The wallet's configuration cannot be changed
       * after creation.
       */
      export interface ProviderConfig {
        id?: string;

        name?: string;
      }
    }
  }

  export interface CardVaultItemRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param: Live payment card. Test-mode card creation is not supported.
     */
    spec: CardVaultItemSpec;

    /**
     * Body param
     */
    type: 'card';
  }

  export interface CredentialAccountVaultItemRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param
     */
    spec: OnePasswordCredentialAccountSpec;

    /**
     * Body param
     */
    type: 'credential_account';
  }

  export interface CredentialVaultItemRequest {
    /**
     * Path param
     */
    id_or_name: string;

    /**
     * Body param: Credential fields are for login and other non-payment credentials.
     * Do not store, collect, or fill credit card data in credential items. Use wallet
     * and card item types for credit cards and payment checkout instead. Field order
     * is preserved in the user-facing collection form, so list fields in the same
     * top-to-bottom order as the website.
     */
    spec: CredentialVaultItemSpecInput;

    /**
     * Body param
     */
    type: 'credential';
  }
}

export declare namespace Items {
  export {
    type AgentcardCheckoutAuthorization as AgentcardCheckoutAuthorization,
    type AgentcardCheckoutPreparation as AgentcardCheckoutPreparation,
    type AgentcardPreparedProcessor as AgentcardPreparedProcessor,
    type AuthorizeVaultItemOperationRequest as AuthorizeVaultItemOperationRequest,
    type CardVaultItemSpec as CardVaultItemSpec,
    type CardVaultItemState as CardVaultItemState,
    type CollectVaultItemOperationRequest as CollectVaultItemOperationRequest,
    type CredentialAccountVaultItem as CredentialAccountVaultItem,
    type CredentialAccountVaultItemRequest as CredentialAccountVaultItemRequest,
    type CredentialCollectionAction as CredentialCollectionAction,
    type CredentialVaultFieldDefinition as CredentialVaultFieldDefinition,
    type CredentialVaultFieldInput as CredentialVaultFieldInput,
    type CredentialVaultFieldState as CredentialVaultFieldState,
    type CredentialVaultFieldType as CredentialVaultFieldType,
    type CredentialVaultFieldUpdate as CredentialVaultFieldUpdate,
    type CredentialVaultItem as CredentialVaultItem,
    type CredentialVaultItemRequest as CredentialVaultItemRequest,
    type CredentialVaultItemSpec as CredentialVaultItemSpec,
    type CredentialVaultItemSpecInput as CredentialVaultItemSpecInput,
    type CredentialVaultItemSpecUpdate as CredentialVaultItemSpecUpdate,
    type CredentialVaultItemState as CredentialVaultItemState,
    type CredentialVaultItemUpdateRequest as CredentialVaultItemUpdateRequest,
    type FillVaultItemOperationRequest as FillVaultItemOperationRequest,
    type FillVaultItemOperationResult as FillVaultItemOperationResult,
    type KernelCardState as KernelCardState,
    type KernelCardVaultItemSpec as KernelCardVaultItemSpec,
    type KernelCredentialVaultItemSpec as KernelCredentialVaultItemSpec,
    type KernelCredentialVaultItemSpecInput as KernelCredentialVaultItemSpecInput,
    type KernelCredentialVaultItemState as KernelCredentialVaultItemState,
    type KernelWalletState as KernelWalletState,
    type KernelWalletVaultItemSpec as KernelWalletVaultItemSpec,
    type ManagedAuthCredentialVaultField as ManagedAuthCredentialVaultField,
    type ManagedAuthCredentialVaultItemSpec as ManagedAuthCredentialVaultItemSpec,
    type ManagedAuthCredentialVaultItemSpecInput as ManagedAuthCredentialVaultItemSpecInput,
    type ManagedAuthCredentialVaultItemState as ManagedAuthCredentialVaultItemState,
    type OnePasswordCredentialAccountSpec as OnePasswordCredentialAccountSpec,
    type OnePasswordCredentialAccountState as OnePasswordCredentialAccountState,
    type OnePasswordCredentialVaultItemSpec as OnePasswordCredentialVaultItemSpec,
    type OnePasswordCredentialVaultItemSpecInput as OnePasswordCredentialVaultItemSpecInput,
    type OnePasswordCredentialVaultItemState as OnePasswordCredentialVaultItemState,
    type OnePasswordFillVaultItemOperationRequest as OnePasswordFillVaultItemOperationRequest,
    type OnePasswordFillVaultItemOperationResult as OnePasswordFillVaultItemOperationResult,
    type OnePasswordOAuthAction as OnePasswordOAuthAction,
    type OnePasswordRecoverVaultItemOperationRequest as OnePasswordRecoverVaultItemOperationRequest,
    type OnePasswordRequestAccessVaultItemOperationRequest as OnePasswordRequestAccessVaultItemOperationRequest,
    type PrepareCheckoutVaultItemOperationRequest as PrepareCheckoutVaultItemOperationRequest,
    type VaultCardAliases as VaultCardAliases,
    type VaultCardFillField as VaultCardFillField,
    type VaultCheckoutContext as VaultCheckoutContext,
    type VaultFillField as VaultFillField,
    type VaultFillFieldResult as VaultFillFieldResult,
    type VaultItem as VaultItem,
    type VaultItemAction as VaultItemAction,
    type VaultItemEvent as VaultItemEvent,
    type VaultItemOperationResponse as VaultItemOperationResponse,
    type VaultPaymentMethod as VaultPaymentMethod,
    type VaultWebmcpBinding as VaultWebmcpBinding,
    type WalletVaultItemSpec as WalletVaultItemSpec,
    type WalletVaultItemState as WalletVaultItemState,
    type WebmcpInvokeVaultItemOperationRequest as WebmcpInvokeVaultItemOperationRequest,
    type WebmcpInvokeVaultItemOperationResult as WebmcpInvokeVaultItemOperationResult,
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
