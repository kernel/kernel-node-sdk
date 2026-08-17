// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as EntitlementsAPI from './entitlements';
import { Entitlements, OrgEntitlements } from './entitlements';
import * as LimitsAPI from './limits';
import { LimitUpdateParams, Limits, OrgLimits, UpdateOrgLimitsRequest } from './limits';

export class Organization extends APIResource {
  entitlements: EntitlementsAPI.Entitlements = new EntitlementsAPI.Entitlements(this._client);
  limits: LimitsAPI.Limits = new LimitsAPI.Limits(this._client);
}

Organization.Entitlements = Entitlements;
Organization.Limits = Limits;

export declare namespace Organization {
  export { Entitlements as Entitlements, type OrgEntitlements as OrgEntitlements };

  export {
    Limits as Limits,
    type OrgLimits as OrgLimits,
    type UpdateOrgLimitsRequest as UpdateOrgLimitsRequest,
    type LimitUpdateParams as LimitUpdateParams,
  };
}
