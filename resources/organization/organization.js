"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = void 0;
const tslib_1 = require("../../internal/tslib.js");
const resource_1 = require("../../core/resource.js");
const EntitlementsAPI = tslib_1.__importStar(require("./entitlements.js"));
const entitlements_1 = require("./entitlements.js");
const LimitsAPI = tslib_1.__importStar(require("./limits.js"));
const limits_1 = require("./limits.js");
class Organization extends resource_1.APIResource {
    constructor() {
        super(...arguments);
        this.entitlements = new EntitlementsAPI.Entitlements(this._client);
        this.limits = new LimitsAPI.Limits(this._client);
    }
}
exports.Organization = Organization;
Organization.Entitlements = entitlements_1.Entitlements;
Organization.Limits = limits_1.Limits;
//# sourceMappingURL=organization.js.map