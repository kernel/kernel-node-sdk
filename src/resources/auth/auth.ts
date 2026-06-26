// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as ConnectionsAPI from './connections';
import {
  ConnectionCreateParams,
  ConnectionFollowResponse,
  ConnectionListParams,
  ConnectionLoginParams,
  ConnectionSubmitParams,
  ConnectionTimelineParams,
  ConnectionUpdateParams,
  Connections,
  LoginResponse,
  ManagedAuth,
  ManagedAuthCreateRequest,
  ManagedAuthTimelineEvent,
  ManagedAuthTimelineEventsOffsetPagination,
  ManagedAuthUpdateRequest,
  ManagedAuthsOffsetPagination,
  SubmitFieldsRequest,
  SubmitFieldsResponse,
} from './connections';

export class Auth extends APIResource {
  connections: ConnectionsAPI.Connections = new ConnectionsAPI.Connections(this._client);
}

Auth.Connections = Connections;

export declare namespace Auth {
  export {
    Connections as Connections,
    type LoginResponse as LoginResponse,
    type ManagedAuth as ManagedAuth,
    type ManagedAuthCreateRequest as ManagedAuthCreateRequest,
    type ManagedAuthTimelineEvent as ManagedAuthTimelineEvent,
    type ManagedAuthUpdateRequest as ManagedAuthUpdateRequest,
    type SubmitFieldsRequest as SubmitFieldsRequest,
    type SubmitFieldsResponse as SubmitFieldsResponse,
    type ConnectionFollowResponse as ConnectionFollowResponse,
    type ManagedAuthsOffsetPagination as ManagedAuthsOffsetPagination,
    type ManagedAuthTimelineEventsOffsetPagination as ManagedAuthTimelineEventsOffsetPagination,
    type ConnectionCreateParams as ConnectionCreateParams,
    type ConnectionUpdateParams as ConnectionUpdateParams,
    type ConnectionListParams as ConnectionListParams,
    type ConnectionLoginParams as ConnectionLoginParams,
    type ConnectionSubmitParams as ConnectionSubmitParams,
    type ConnectionTimelineParams as ConnectionTimelineParams,
  };
}
