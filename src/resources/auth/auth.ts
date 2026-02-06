// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as ConnectionsAPI from './connections';
import {
  ConnectionCreateParams,
  ConnectionFollowResponse,
  ConnectionListParams,
  ConnectionLoginParams,
  ConnectionSubmitParams,
  Connections,
  LoginRequest,
  LoginResponse,
  ManagedAuth,
  ManagedAuthCreateRequest,
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
    type LoginRequest as LoginRequest,
    type LoginResponse as LoginResponse,
    type ManagedAuth as ManagedAuth,
    type ManagedAuthCreateRequest as ManagedAuthCreateRequest,
    type SubmitFieldsRequest as SubmitFieldsRequest,
    type SubmitFieldsResponse as SubmitFieldsResponse,
    type ConnectionFollowResponse as ConnectionFollowResponse,
    type ManagedAuthsOffsetPagination as ManagedAuthsOffsetPagination,
    type ConnectionCreateParams as ConnectionCreateParams,
    type ConnectionListParams as ConnectionListParams,
    type ConnectionLoginParams as ConnectionLoginParams,
    type ConnectionSubmitParams as ConnectionSubmitParams,
  };
}
