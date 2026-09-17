"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vaults = void 0;
const tslib_1 = require("../../internal/tslib.js");
const resource_1 = require("../../core/resource.js");
const ItemsAPI = tslib_1.__importStar(require("./items.js"));
const items_1 = require("./items.js");
const pagination_1 = require("../../core/pagination.js");
const headers_1 = require("../../internal/headers.js");
const path_1 = require("../../internal/utils/path.js");
class Vaults extends resource_1.APIResource {
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
        return this._client.get((0, path_1.path) `/vaults/${idOrName}`, options);
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
        return this._client.getAPIList('/vaults', (pagination_1.OffsetPagination), { query, ...options });
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
        return this._client.delete((0, path_1.path) `/vaults/${idOrName}`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: '*/*' }, options?.headers]),
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
exports.Vaults = Vaults;
Vaults.Items = items_1.Items;
//# sourceMappingURL=vaults.js.map