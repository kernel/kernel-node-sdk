// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as AuthAPI from './auth/auth';
import {
  AgentAuthInvocationResponse,
  AgentAuthSubmitResponse,
  Auth,
  AuthAgent,
  AuthAgentCreateRequest,
  AuthAgentInvocationCreateRequest,
  AuthAgentInvocationCreateResponse,
  AuthAgentsOffsetPagination,
  AuthCreateParams,
  AuthListParams,
  DiscoveredField,
} from './auth/auth';

export class Agents extends APIResource {
  auth: AuthAPI.Auth = new AuthAPI.Auth(this._client);
}

Agents.Auth = Auth;

export declare namespace Agents {
  export {
    Auth as Auth,
    type AgentAuthInvocationResponse as AgentAuthInvocationResponse,
    type AgentAuthSubmitResponse as AgentAuthSubmitResponse,
    type AuthAgent as AuthAgent,
    type AuthAgentCreateRequest as AuthAgentCreateRequest,
    type AuthAgentInvocationCreateRequest as AuthAgentInvocationCreateRequest,
    type AuthAgentInvocationCreateResponse as AuthAgentInvocationCreateResponse,
    type DiscoveredField as DiscoveredField,
    type AuthAgentsOffsetPagination as AuthAgentsOffsetPagination,
    type AuthCreateParams as AuthCreateParams,
    type AuthListParams as AuthListParams,
  };
}
