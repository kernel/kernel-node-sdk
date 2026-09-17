import { APIResource } from "../../core/resource.mjs";
import * as EntitlementsAPI from "./entitlements.mjs";
import { Entitlements, OrgEntitlements } from "./entitlements.mjs";
import * as LimitsAPI from "./limits.mjs";
import { LimitUpdateParams, Limits, OrgLimits, UpdateOrgLimitsRequest } from "./limits.mjs";
export declare class Organization extends APIResource {
    entitlements: EntitlementsAPI.Entitlements;
    limits: LimitsAPI.Limits;
}
export declare namespace Organization {
    export { Entitlements as Entitlements, type OrgEntitlements as OrgEntitlements };
    export { Limits as Limits, type OrgLimits as OrgLimits, type UpdateOrgLimitsRequest as UpdateOrgLimitsRequest, type LimitUpdateParams as LimitUpdateParams, };
}
//# sourceMappingURL=organization.d.mts.map