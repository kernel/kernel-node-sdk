// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import * as ItemsAPI from "./items.mjs";
import { Items, } from "./items.mjs";
import { OffsetPagination } from "../../core/pagination.mjs";
import { buildHeaders } from "../../internal/headers.mjs";
import { path } from "../../internal/utils/path.mjs";
export class Vaults extends APIResource {
    constructor() {
        super(...arguments);
        this.items = new ItemsAPI.Items(this._client);
    }
    /**
     * Get a vault
     *
     * @example
     * ```ts
     * const vault = await client.vaults.retrieve('id_or_name');
     * ```
     */
    retrieve(idOrName, options) {
        return this._client.get(path `/vaults/${idOrName}`, options);
    }
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
    list(query = {}, options) {
        return this._client.getAPIList('/vaults', (OffsetPagination), { query, ...options });
    }
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
    delete(idOrName, options) {
        return this._client.delete(path `/vaults/${idOrName}`, {
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
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
    upsert(body, options) {
        return this._client.post('/vaults', { body, ...options });
    }
}
Vaults.Items = Items;
//# sourceMappingURL=vaults.mjs.map