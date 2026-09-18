// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import { buildHeaders } from "../../internal/headers.mjs";
import { path } from "../../internal/utils/path.mjs";
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
    retrieve(key, params, options) {
        const { id_or_name, ...query } = params;
        return this._client.get(path `/vaults/${id_or_name}/items/${key}`, { query, ...options });
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
    update(key, params, options) {
        const { id_or_name, ...body } = params;
        return this._client.patch(path `/vaults/${id_or_name}/items/${key}`, { body, ...options });
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
    list(idOrName, options) {
        return this._client.get(path `/vaults/${idOrName}/items`, options);
    }
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
    delete(key, params, options) {
        const { id_or_name } = params;
        return this._client.delete(path `/vaults/${id_or_name}/items/${key}`, {
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
    events(key, params, options) {
        const { id_or_name, ...query } = params;
        return this._client.get(path `/vaults/${id_or_name}/items/${key}/events`, { query, ...options });
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
    performOperation(key, params, options) {
        const { id_or_name, ...body } = params;
        return this._client.post(path `/vaults/${id_or_name}/items/${key}/operations`, {
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
     *   spec: { provider: 'link' },
     *   type: 'card',
     * });
     * ```
     */
    upsert(key, params, options) {
        const { id_or_name, ...body } = params;
        return this._client.put(path `/vaults/${id_or_name}/items/${key}`, { body, ...options });
    }
}
//# sourceMappingURL=items.mjs.map