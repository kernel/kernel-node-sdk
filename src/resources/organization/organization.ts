// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as LimitsAPI from './limits';
import { LimitUpdateParams, Limits, OrgLimits, UpdateOrgLimitsRequest } from './limits';

export class Organization extends APIResource {
  limits: LimitsAPI.Limits = new LimitsAPI.Limits(this._client);
}

Organization.Limits = Limits;

export declare namespace Organization {
  export {
    Limits as Limits,
    type OrgLimits as OrgLimits,
    type UpdateOrgLimitsRequest as UpdateOrgLimitsRequest,
    type LimitUpdateParams as LimitUpdateParams,
  };
}
