import { APIResource } from "../../core/resource.js";
import * as EntitlementsAPI from "./entitlements.js";
import { Entitlements, OrgEntitlements } from "./entitlements.js";
import * as LimitsAPI from "./limits.js";
import { LimitUpdateParams, Limits, OrgLimits, UpdateOrgLimitsRequest } from "./limits.js";
export declare class Organization extends APIResource {
    entitlements: EntitlementsAPI.Entitlements;
    limits: LimitsAPI.Limits;
}
export declare namespace Organization {
    export { Entitlements as Entitlements, type OrgEntitlements as OrgEntitlements };
    export { Limits as Limits, type OrgLimits as OrgLimits, type UpdateOrgLimitsRequest as UpdateOrgLimitsRequest, type LimitUpdateParams as LimitUpdateParams, };
}
//# sourceMappingURL=organization.d.ts.map