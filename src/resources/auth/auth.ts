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
  ManagedAuthBrowserConfig,
  ManagedAuthCreateRequest,
  ManagedAuthTimelineEvent,
  ManagedAuthTimelineEventsOffsetPagination,
  ManagedAuthUpdateRequest,
  ManagedAuthsOffsetPagination,
  SubmitFieldsRequest,
  SubmitFieldsResponse,
} from './connections';
import * as ContextAPI from './context';
import { AuthContext, Context } from './context';

export class Auth extends APIResource {
  context: ContextAPI.Context = new ContextAPI.Context(this._client);
  connections: ConnectionsAPI.Connections = new ConnectionsAPI.Connections(this._client);
}

Auth.Context = Context;
Auth.Connections = Connections;

export declare namespace Auth {
  export { Context as Context, type AuthContext as AuthContext };

  export {
    Connections as Connections,
    type LoginResponse as LoginResponse,
    type ManagedAuth as ManagedAuth,
    type ManagedAuthBrowserConfig as ManagedAuthBrowserConfig,
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
