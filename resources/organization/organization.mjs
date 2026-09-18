// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import * as EntitlementsAPI from "./entitlements.mjs";
import { Entitlements } from "./entitlements.mjs";
import * as LimitsAPI from "./limits.mjs";
import { Limits } from "./limits.mjs";
export class Organization extends APIResource {
    constructor() {
        super(...arguments);
        this.entitlements = new EntitlementsAPI.Entitlements(this._client);
        this.limits = new LimitsAPI.Limits(this._client);
    }
}
Organization.Entitlements = Entitlements;
Organization.Limits = Limits;
//# sourceMappingURL=organization.mjs.map