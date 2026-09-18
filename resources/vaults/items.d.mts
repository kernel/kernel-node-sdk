import { APIResource } from "../../core/resource.mjs";
import * as ItemsAPI from "./items.mjs";
import { APIPromise } from "../../core/api-promise.mjs";
import { RequestOptions } from "../../internal/request-options.mjs";
export declare class Items extends APIResource {
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
    retrieve(key: string, params: ItemRetrieveParams, options?: RequestOptions): APIPromise<VaultItem>;
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
    update(key: string, params: ItemUpdateParams, options?: RequestOptions): APIPromise<VaultItem>;
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
    list(idOrName: string, options?: RequestOptions): APIPromise<ItemListResponse>;
    /**
     * Unresolved payment operations normally block deletion, including operations on
     * child cards of a wallet. An AgentCard card in recovery_required whose checkout
     * create response returned no authorization ID may be explicitly abandoned by
     * deleting that card directly; deleting its wallet or vault remains blocked.
     * Deleting or recreating an item is not proof that a payment did not occur.
     *
     * @example
     * ```ts
     * await client.vaults.items.delete('x', {
     *   id_or_name: 'id_or_name',
     * });
     * ```
     */
    delete(key: string, params: ItemDeleteParams, options?: RequestOptions): APIPromise<void>;
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
    events(key: string, params: ItemEventsParams, options?: RequestOptions): APIPromise<ItemEventsResponse>;
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
     * `failed` or `unknown`, not an automatic-retry signal. A transport error may
     * leave the outcome unknown; do not automatically retry.
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
    performOperation(key: string, params: ItemPerformOperationParams, options?: RequestOptions): APIPromise<VaultItemOperationResponse>;
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
     *   spec: { provider: 'link' },
     *   type: 'card',
     * });
     * ```
     */
    upsert(key: string, params: ItemUpsertParams, options?: RequestOptions): APIPromise<VaultItem>;
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
 * through token handoff. The amount is display-only and does not constrain the
 * merchant's eventual charge.
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
export type AgentcardPreparedProcessor = 'square' | 'braintree' | 'worldpay' | 'bambora' | 'mercado_pago';
/**
 * Authorize a Link card using its existing purchase specification. Use only after
 * explicit user approval and when the item advertises authorize. Do not
 * automatically retry provider failures or indeterminate outcomes. Checkout
 * context is not accepted.
 */
export interface AuthorizeVaultItemOperationRequest {
    type: 'authorize';
}
/**
 * Live payment card. Test-mode card creation is not supported.
 */
export type CardVaultItemSpec = CardVaultItemSpec.LinkCardVaultItemSpec | CardVaultItemSpec.AgentCardCardVaultItemSpec;
export declare namespace CardVaultItemSpec {
    /**
     * Live payment card. Test-mode card creation is not supported.
     */
    interface LinkCardVaultItemSpec {
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
        metadata?: {
            [key: string]: string;
        };
        totals?: Array<LinkCardVaultItemSpec.Total>;
    }
    namespace LinkCardVaultItemSpec {
        interface LineItem {
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
        namespace LineItem {
            interface Total {
                /**
                 * Total amount in minor currency units.
                 */
                amount: number;
                display_text: string;
                type: string;
            }
        }
        interface Total {
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
     * Each checkout creates an approval-gated authorization for spec.merchant /
     * spec.amount. The card stays ready after each authorization.
     */
    interface AgentCardCardVaultItemSpec {
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
    }
}
/**
 * Issued Link cards retain encrypted card material for the fill operation. Link
 * cards do not expose aliases or support egress substitution.
 */
export type CardVaultItemState = CardVaultItemState.LinkCardState | CardVaultItemState.AgentCardCardState;
export declare namespace CardVaultItemState {
    /**
     * Issued Link cards retain encrypted card material for the fill operation. Link
     * cards do not expose aliases or support egress substitution.
     */
    interface LinkCardState {
        provider: 'link';
        /**
         * recovery_required means an original provider operation has an unresolved
         * outcome. Do not retry, delete, or replace it. Known references may be observed
         * safely, but unknown creation without an ID and uncertain card-material retrieval
         * require manual reconciliation with the provider or support. There is no reset or
         * caller-asserted reconciliation operation.
         */
        status: 'requested' | 'pending_authorization' | 'ready' | 'consumed' | 'expired' | 'declined' | 'recovery_required';
        domains?: Array<string>;
        masks?: LinkCardState.Masks;
        status_reason?: string;
    }
    namespace LinkCardState {
        interface Masks {
            brand?: string;
            last4?: string;
            [k: string]: string | undefined;
        }
    }
    interface AgentCardCardState {
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
        status: 'requested' | 'ready' | 'preparing' | 'ready_to_submit' | 'pending_approval' | 'consumed' | 'stopped' | 'outcome_unknown' | 'degraded' | 'recovery_required';
        aliases?: ItemsAPI.VaultCardAliases;
        /**
         * The in-flight or most recent checkout authorization. Present while a checkout is
         * pending approval and after it settles.
         */
        authorization?: ItemsAPI.AgentcardCheckoutAuthorization;
        masks?: AgentCardCardState.Masks;
        /**
         * One-use processor-bound checkout preparation. Keep the approval page open
         * through token handoff. The amount is display-only and does not constrain the
         * merchant's eventual charge.
         */
        preparation?: ItemsAPI.AgentcardCheckoutPreparation;
        status_reason?: string;
    }
    namespace AgentCardCardState {
        interface Masks {
            brand?: string;
            last4?: string;
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
     * Sensitive values are encrypted and never copied into the returned spec.
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
export interface CredentialVaultFieldUpdate {
    /**
     * Replacement value (at most 16 KiB in UTF-8 bytes), or null or an empty string to
     * immediately clear the stored value. Clearing a required form-supported field
     * reopens collection; clearing an optional field does not prevent readiness.
     * Values must satisfy the declared field type. For totp, value is the generator
     * seed, never a current code. Clearing a required totp field returns 400 because
     * it cannot be collected in a form.
     */
    value: string | null;
}
export interface CredentialVaultItem {
    id: string;
    available_expansions: Array<CredentialVaultItem.AvailableExpansion>;
    /**
     * Advertises collect for ready and pending_collection items. Browser fill is
     * advertised only when separately implemented and eligible.
     */
    available_operations: Array<CredentialVaultItem.AvailableOperation>;
    created_at: string;
    /**
     * Immutable item key assigned when the item is created.
     */
    key: string;
    spec: CredentialVaultItemSpec;
    state: CredentialVaultItemState;
    type: 'credential';
    updated_at: string;
    /**
     * Starts at 1 and increments on PATCH and successful hosted submission, but not
     * collection-link renewal.
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
    action?: CredentialCollectionAction;
}
export declare namespace CredentialVaultItem {
    /**
     * Live data that can currently be requested by passing its type to the item GET
     * expand parameter.
     */
    interface AvailableExpansion {
        description: string;
        type: 'payment_methods';
    }
    /**
     * An operation that is currently valid for this item. Read the description before
     * invoking it through the item operations endpoint.
     */
    interface AvailableOperation {
        description: string;
        type: 'authorize' | 'collect' | 'prepare_checkout' | 'fill';
    }
}
/**
 * Create a credential item without a wallet or external provider. Do not use
 * credential items to store, collect, or fill credit card data, including card
 * numbers (PANs), security codes (CVV/CVC), or expiration dates. Use wallet and
 * card item types for credit cards and payment checkout instead. If all required
 * fields have values, return ready without a collection action; collect can still
 * open its form. Otherwise return pending_collection with a time-scoped
 * Kernel-hosted collection action. Missing optional fields alone do not trigger
 * collection. Repeating the original creation request returns the current item
 * without overwriting later edits; a different request at the same key
 * returns 409. Use PATCH for updates. Required totp fields must include a valid
 * seed on creation; otherwise return 400 rather than opening a form that cannot
 * collect it. Optional totp fields may be unset and populated later through PATCH.
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
export interface CredentialVaultItemSpec {
    /**
     * Ordered field definitions rendered in this order by credential collection forms.
     */
    fields: Array<CredentialVaultFieldDefinition>;
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
export interface CredentialVaultItemSpecInput {
    /**
     * Ordered field definitions. Use the website's top-to-bottom field order; the
     * collection form renders this order unchanged.
     */
    fields: Array<CredentialVaultFieldInput>;
    /**
     * The site's recognizable display name, used verbatim as the user-facing form
     * title (for example, Hacker News). Use only the site or service name; do not
     * append sign-in, login, credentials, or task instructions. This is display text,
     * not an enforced destination policy. At most 16 KiB in UTF-8 bytes.
     */
    description?: string;
}
export interface CredentialVaultItemSpecUpdate {
    /**
     * Recognizable site or service name used as the form title, without suffixes such
     * as sign-in credentials. An empty string clears it. Display text only, not an
     * enforced destination policy. The server also enforces a 16 KiB UTF-8 byte limit.
     */
    description?: string;
    fields?: {
        [key: string]: CredentialVaultFieldUpdate;
    };
}
export interface CredentialVaultItemState {
    /**
     * Exactly one entry for each declared field.
     */
    fields: {
        [key: string]: CredentialVaultFieldState;
    };
    /**
     * Ready means all required fields have values, not that a login succeeded.
     * Optional fields may remain unset.
     */
    status: 'pending_collection' | 'ready';
}
/**
 * Atomically update description and selected values. Omitted properties are
 * preserved. Field names, types, required flags, and sensitivity cannot change.
 * Unknown field names return 400; stale versions or mismatched item types return
 * 409 without changing the item. A successful update increments version and
 * invalidates outstanding Kernel-hosted collection sessions. If required values
 * remain missing, return pending_collection and a fresh collection action.
 * Otherwise return ready without an action; collect can open the form again
 * without clearing values. Customer URLs have no Kernel-managed expiry.
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
 * Fill selected fields from one ready credential or ready, unexpired Link card
 * into a browser linked to its vault. Only invoke when the item advertises `fill`.
 * Browser and vault must belong to the same project. Kernel checks access and
 * allowed destinations before filling; providing a page URL does not authorize a
 * destination.
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
 * click buttons, though input/change events may trigger site behavior. Link cards
 * use fill for browser checkout and do not expose aliases or support egress
 * substitution. Do not automatically retry a failed or indeterminate operation.
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
 * Prepare an unused AgentCard card for a supported tokenization checkout. Deliver
 * the returned approval URL and keep the approval page open. Poll the item until
 * ready_to_submit, then submit native Pay before preparation.expires_at. Readiness
 * lasts at most 30 seconds. Unused preparations expire automatically. Preparations
 * are single-use even after failure or expiry; do not automatically retry and
 * reconcile uncertain outcomes with the merchant.
 */
export interface PrepareCheckoutVaultItemOperationRequest {
    /**
     * Required when preparing an unused AgentCard card for a supported tokenization
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
export type VaultCardFillField = VaultCardFillField.VaultCardStoredFillField | VaultCardFillField.VaultCardExpirationFillField;
export declare namespace VaultCardFillField {
    interface VaultCardStoredFillField {
        /**
         * Field in the decrypted card, not an alias. Number and CVC preserve leading
         * zeros; month uses two digits and year uses four digits. Billing fields use the
         * provider's stored billing address (name, line1, line2, city, state, postal_code,
         * country) without reformatting. Request only needed billing fields. An absent or
         * empty requested billing field returns 400 field_unavailable before any browser
         * writes; it does not make other card fields unavailable.
         */
        field: 'number' | 'exp_month' | 'exp_year' | 'cvc' | 'billing_name' | 'billing_line1' | 'billing_line2' | 'billing_city' | 'billing_state' | 'billing_postal_code' | 'billing_country';
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
    interface VaultCardExpirationFillField {
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
 * Required when preparing an unused AgentCard card for a supported tokenization
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
     * Use production or sandbox for Square, Braintree and Worldpay; shared for Bambora
     * and Mercado Pago. Shared endpoints do not establish test mode. Merchant
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
     * Tokenization processor. Omit for Square compatibility. Non-Square processors
     * require multi-processor preparation enablement.
     */
    psp?: AgentcardPreparedProcessor;
}
export interface VaultFillField {
    /**
     * A declared credential field name or a supported card field. Unset credential
     * fields cannot be filled.
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
    error_code?: 'target_changed' | 'element_not_found' | 'ambiguous_selector' | 'element_not_editable' | 'option_not_found' | 'timeout' | 'execution_failed';
}
export type VaultItem = VaultItem.WalletVaultItem | VaultItem.CardVaultItem | CredentialVaultItem;
export declare namespace VaultItem {
    interface WalletVaultItem {
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
    namespace WalletVaultItem {
        /**
         * Live data that can currently be requested by passing its type to the item GET
         * expand parameter.
         */
        interface AvailableExpansion {
            description: string;
            type: 'payment_methods';
        }
        /**
         * An operation that is currently valid for this item. Read the description before
         * invoking it through the item operations endpoint.
         */
        interface AvailableOperation {
            description: string;
            type: 'authorize' | 'collect' | 'prepare_checkout' | 'fill';
        }
        /**
         * Live, non-persisted data requested through the item GET expand parameter.
         */
        interface Expanded {
            payment_methods?: Array<ItemsAPI.VaultPaymentMethod>;
        }
    }
    interface CardVaultItem {
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
    namespace CardVaultItem {
        /**
         * Live data that can currently be requested by passing its type to the item GET
         * expand parameter.
         */
        interface AvailableExpansion {
            description: string;
            type: 'payment_methods';
        }
        /**
         * An operation that is currently valid for this item. Read the description before
         * invoking it through the item operations endpoint.
         */
        interface AvailableOperation {
            description: string;
            type: 'authorize' | 'collect' | 'prepare_checkout' | 'fill';
        }
    }
}
export type VaultItemAction = VaultItemAction.LinkOAuthAction | VaultItemAction.SpendApprovalAction | VaultItemAction.PushApprovalAction | VaultItemAction.CollectAction | VaultItemAction.MfaAction | VaultItemAction.EmbeddedCeremonyAction | VaultItemAction.CardEnrollmentAction;
export declare namespace VaultItemAction {
    interface LinkOAuthAction {
        name: 'link_oauth';
        url: string;
    }
    interface SpendApprovalAction {
        name: 'spend_approval';
        url: string;
    }
    interface PushApprovalAction {
        name: 'push_approval';
    }
    interface CollectAction {
        name: 'collect';
    }
    interface MfaAction {
        name: 'mfa';
    }
    interface EmbeddedCeremonyAction {
        name: 'embedded_ceremony';
    }
    interface CardEnrollmentAction {
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
    data?: {
        [key: string]: unknown;
    };
}
/**
 * Authorization and preparation return the existing item shape. Fill returns a
 * value-free execution result; it does not persist transient field outcomes on the
 * item.
 */
export type VaultItemOperationResponse = VaultItemOperationResponse.WalletVaultItem | VaultItemOperationResponse.CardVaultItem | CredentialVaultItem | FillVaultItemOperationResult;
export declare namespace VaultItemOperationResponse {
    interface WalletVaultItem {
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
    namespace WalletVaultItem {
        /**
         * Live data that can currently be requested by passing its type to the item GET
         * expand parameter.
         */
        interface AvailableExpansion {
            description: string;
            type: 'payment_methods';
        }
        /**
         * An operation that is currently valid for this item. Read the description before
         * invoking it through the item operations endpoint.
         */
        interface AvailableOperation {
            description: string;
            type: 'authorize' | 'collect' | 'prepare_checkout' | 'fill';
        }
        /**
         * Live, non-persisted data requested through the item GET expand parameter.
         */
        interface Expanded {
            payment_methods?: Array<ItemsAPI.VaultPaymentMethod>;
        }
    }
    interface CardVaultItem {
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
    namespace CardVaultItem {
        /**
         * Live data that can currently be requested by passing its type to the item GET
         * expand parameter.
         */
        interface AvailableExpansion {
            description: string;
            type: 'payment_methods';
        }
        /**
         * An operation that is currently valid for this item. Read the description before
         * invoking it through the item operations endpoint.
         */
        interface AvailableOperation {
            description: string;
            type: 'authorize' | 'collect' | 'prepare_checkout' | 'fill';
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
export declare namespace VaultPaymentMethod {
    /**
     * Provider-reported advisory capabilities. A missing capability is unknown, not
     * ineligible; only eligible=false is an explicit negative signal.
     */
    interface Capabilities {
        single_use_card?: Capabilities.SingleUseCard;
    }
    namespace Capabilities {
        interface SingleUseCard {
            eligible: boolean;
            reasons: Array<string>;
        }
    }
    interface Display {
        brand?: string;
        label?: string;
        last4?: string;
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
export type WalletVaultItemSpec = WalletVaultItemSpec.LinkWalletVaultItemSpec | WalletVaultItemSpec.AgentCardWalletVaultItemSpec;
export declare namespace WalletVaultItemSpec {
    interface LinkWalletVaultItemSpec {
        authorization: LinkWalletVaultItemSpec.Authorization;
        provider: 'link';
    }
    namespace LinkWalletVaultItemSpec {
        interface Authorization {
            client: Authorization.KernelManagedOAuthClient | Authorization.CustomerManagedOAuthClient;
            method: 'oauth';
        }
        namespace Authorization {
            interface KernelManagedOAuthClient {
                type: 'kernel_managed';
            }
            interface CustomerManagedOAuthClient {
                /**
                 * Select a provider config by ID or name. Responses return the ID. Renaming a
                 * config does not change existing wallet bindings; a wallet cannot switch to a
                 * different config after creation.
                 */
                provider_config: CustomerManagedOAuthClient.ProviderConfig;
                type: 'customer_managed';
            }
            namespace CustomerManagedOAuthClient {
                /**
                 * Select a provider config by ID or name. Responses return the ID. Renaming a
                 * config does not change existing wallet bindings; a wallet cannot switch to a
                 * different config after creation.
                 */
                interface ProviderConfig {
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
    interface AgentCardWalletVaultItemSpec {
        provider: 'agentcard';
        /**
         * Select an AgentCard configuration. The wallet's configuration cannot be changed
         * after creation.
         */
        provider_config?: AgentCardWalletVaultItemSpec.ProviderConfig;
        user_id?: string;
    }
    namespace AgentCardWalletVaultItemSpec {
        /**
         * Select an AgentCard configuration. The wallet's configuration cannot be changed
         * after creation.
         */
        interface ProviderConfig {
            id?: string;
            name?: string;
        }
    }
}
export type WalletVaultItemState = WalletVaultItemState.LinkWalletState | WalletVaultItemState.AgentCardWalletState;
export declare namespace WalletVaultItemState {
    interface LinkWalletState {
        provider: 'link';
        status: 'pending_authorization' | 'connected' | 'declined' | 'reconnect_required' | 'degraded';
        status_reason?: string;
    }
    interface AgentCardWalletState {
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
     * authorization, approval, or credential collection. Return the current item when
     * ready or when the wait elapses. This does not wait for edits to an already-ready
     * credential; poll GET without wait and compare version to observe changes after
     * collect.
     */
    wait?: number;
}
export type ItemUpdateParams = ItemUpdateParams.CardVaultItemUpdateRequest | ItemUpdateParams.CredentialVaultItemUpdateRequest;
export declare namespace ItemUpdateParams {
    interface CardVaultItemUpdateRequest {
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
    interface CredentialVaultItemUpdateRequest {
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
export type ItemPerformOperationParams = ItemPerformOperationParams.AuthorizeVaultItemOperationRequest | ItemPerformOperationParams.CollectVaultItemOperationRequest | ItemPerformOperationParams.PrepareCheckoutVaultItemOperationRequest | ItemPerformOperationParams.FillVaultItemOperationRequest;
export declare namespace ItemPerformOperationParams {
    interface AuthorizeVaultItemOperationRequest {
        /**
         * Path param
         */
        id_or_name: string;
        /**
         * Body param
         */
        type: 'authorize';
    }
    interface CollectVaultItemOperationRequest {
        /**
         * Path param
         */
        id_or_name: string;
        /**
         * Body param
         */
        type: 'collect';
    }
    interface PrepareCheckoutVaultItemOperationRequest {
        /**
         * Path param
         */
        id_or_name: string;
        /**
         * Body param: Required when preparing an unused AgentCard card for a supported
         * tokenization processor. Consent is bound to this browser and declared merchant
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
    interface FillVaultItemOperationRequest {
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
}
export type ItemUpsertParams = ItemUpsertParams.WalletVaultItemRequest | ItemUpsertParams.CardVaultItemRequest | ItemUpsertParams.CredentialVaultItemRequest;
export declare namespace ItemUpsertParams {
    interface WalletVaultItemRequest {
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
        spec: WalletVaultItemRequest.LinkWalletVaultItemRequestSpec | WalletVaultItemRequest.AgentCardWalletVaultItemSpec;
        /**
         * Body param
         */
        type: 'wallet';
    }
    namespace WalletVaultItemRequest {
        interface LinkWalletVaultItemRequestSpec {
            /**
             * Kernel starts and completes the user's Link authorization flow.
             */
            authorization: LinkWalletVaultItemRequestSpec.KernelManagedLinkAuthorizationInput | LinkWalletVaultItemRequestSpec.ImportedLinkAuthorizationInput;
            provider: 'link';
        }
        namespace LinkWalletVaultItemRequestSpec {
            /**
             * Kernel starts and completes the user's Link authorization flow.
             */
            interface KernelManagedLinkAuthorizationInput {
                client: KernelManagedLinkAuthorizationInput.Client;
                method: 'oauth';
            }
            namespace KernelManagedLinkAuthorizationInput {
                interface Client {
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
            interface ImportedLinkAuthorizationInput {
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
            namespace ImportedLinkAuthorizationInput {
                interface Client {
                    /**
                     * Select a provider config by ID or name. Responses return the ID. Renaming a
                     * config does not change existing wallet bindings; a wallet cannot switch to a
                     * different config after creation.
                     */
                    provider_config: Client.ProviderConfig;
                    type: 'customer_managed';
                }
                namespace Client {
                    /**
                     * Select a provider config by ID or name. Responses return the ID. Renaming a
                     * config does not change existing wallet bindings; a wallet cannot switch to a
                     * different config after creation.
                     */
                    interface ProviderConfig {
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
                interface Tokens {
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
        interface AgentCardWalletVaultItemSpec {
            provider: 'agentcard';
            /**
             * Select an AgentCard configuration. The wallet's configuration cannot be changed
             * after creation.
             */
            provider_config?: AgentCardWalletVaultItemSpec.ProviderConfig;
            user_id?: string;
        }
        namespace AgentCardWalletVaultItemSpec {
            /**
             * Select an AgentCard configuration. The wallet's configuration cannot be changed
             * after creation.
             */
            interface ProviderConfig {
                id?: string;
                name?: string;
            }
        }
    }
    interface CardVaultItemRequest {
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
    interface CredentialVaultItemRequest {
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
    export { type AgentcardCheckoutAuthorization as AgentcardCheckoutAuthorization, type AgentcardCheckoutPreparation as AgentcardCheckoutPreparation, type AgentcardPreparedProcessor as AgentcardPreparedProcessor, type AuthorizeVaultItemOperationRequest as AuthorizeVaultItemOperationRequest, type CardVaultItemSpec as CardVaultItemSpec, type CardVaultItemState as CardVaultItemState, type CollectVaultItemOperationRequest as CollectVaultItemOperationRequest, type CredentialCollectionAction as CredentialCollectionAction, type CredentialVaultFieldDefinition as CredentialVaultFieldDefinition, type CredentialVaultFieldInput as CredentialVaultFieldInput, type CredentialVaultFieldState as CredentialVaultFieldState, type CredentialVaultFieldType as CredentialVaultFieldType, type CredentialVaultFieldUpdate as CredentialVaultFieldUpdate, type CredentialVaultItem as CredentialVaultItem, type CredentialVaultItemRequest as CredentialVaultItemRequest, type CredentialVaultItemSpec as CredentialVaultItemSpec, type CredentialVaultItemSpecInput as CredentialVaultItemSpecInput, type CredentialVaultItemSpecUpdate as CredentialVaultItemSpecUpdate, type CredentialVaultItemState as CredentialVaultItemState, type CredentialVaultItemUpdateRequest as CredentialVaultItemUpdateRequest, type FillVaultItemOperationRequest as FillVaultItemOperationRequest, type FillVaultItemOperationResult as FillVaultItemOperationResult, type PrepareCheckoutVaultItemOperationRequest as PrepareCheckoutVaultItemOperationRequest, type VaultCardAliases as VaultCardAliases, type VaultCardFillField as VaultCardFillField, type VaultCheckoutContext as VaultCheckoutContext, type VaultFillField as VaultFillField, type VaultFillFieldResult as VaultFillFieldResult, type VaultItem as VaultItem, type VaultItemAction as VaultItemAction, type VaultItemEvent as VaultItemEvent, type VaultItemOperationResponse as VaultItemOperationResponse, type VaultPaymentMethod as VaultPaymentMethod, type WalletVaultItemSpec as WalletVaultItemSpec, type WalletVaultItemState as WalletVaultItemState, type ItemListResponse as ItemListResponse, type ItemEventsResponse as ItemEventsResponse, type ItemRetrieveParams as ItemRetrieveParams, type ItemUpdateParams as ItemUpdateParams, type ItemDeleteParams as ItemDeleteParams, type ItemEventsParams as ItemEventsParams, type ItemPerformOperationParams as ItemPerformOperationParams, type ItemUpsertParams as ItemUpsertParams, };
}
//# sourceMappingURL=items.d.mts.map