// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as AuthAPI from './auth';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

export class Invocations extends APIResource {
  /**
   * **Deprecated: Use POST /auth/connections/{id}/login instead.** Creates a new
   * authentication invocation for the specified auth agent. This starts the auth
   * flow and returns a hosted URL for the user to complete authentication.
   *
   * @deprecated
   */
  create(
    body: InvocationCreateParams,
    options?: RequestOptions,
  ): APIPromise<AuthAPI.AuthAgentInvocationCreateResponse> {
    return this._client.post('/agents/auth/invocations', { body, ...options });
  }

  /**
   * **Deprecated: Use GET /auth/connections/{id} instead.** Returns invocation
   * details including status, app_name, and domain. Supports both API key and JWT
   * (from exchange endpoint) authentication.
   *
   * @deprecated
   */
  retrieve(invocationID: string, options?: RequestOptions): APIPromise<AuthAPI.AgentAuthInvocationResponse> {
    return this._client.get(path`/agents/auth/invocations/${invocationID}`, options);
  }

  /**
   * **Deprecated: Use POST /auth/connections/{id}/exchange instead.** Validates the
   * handoff code and returns a JWT token for subsequent requests. No authentication
   * required (the handoff code serves as the credential).
   *
   * @deprecated
   */
  exchange(
    invocationID: string,
    body: InvocationExchangeParams,
    options?: RequestOptions,
  ): APIPromise<InvocationExchangeResponse> {
    return this._client.post(path`/agents/auth/invocations/${invocationID}/exchange`, { body, ...options });
  }

  /**
   * **Deprecated: Use POST /auth/connections/{id}/submit instead.** Submits field
   * values for the discovered login form. Returns immediately after submission is
   * accepted. Poll the invocation endpoint to track progress and get results.
   *
   * @deprecated
   */
  submit(
    invocationID: string,
    body: InvocationSubmitParams,
    options?: RequestOptions,
  ): APIPromise<AuthAPI.AgentAuthSubmitResponse> {
    return this._client.post(path`/agents/auth/invocations/${invocationID}/submit`, { body, ...options });
  }
}

/**
 * Response from exchange endpoint
 */
export interface InvocationExchangeResponse {
  /**
   * Invocation ID
   */
  invocation_id: string;

  /**
   * JWT token with invocation_id claim (30 minute TTL)
   */
  jwt: string;
}

export interface InvocationCreateParams {
  /**
   * ID of the auth agent to create an invocation for
   */
  auth_agent_id: string;

  /**
   * If provided, saves the submitted credentials under this name upon successful
   * login. The credential will be linked to the auth agent for automatic
   * re-authentication.
   */
  save_credential_as?: string;
}

export interface InvocationExchangeParams {
  /**
   * Handoff code from start endpoint
   */
  code: string;
}

export type InvocationSubmitParams =
  | InvocationSubmitParams.Variant0
  | InvocationSubmitParams.Variant1
  | InvocationSubmitParams.Variant2;

export declare namespace InvocationSubmitParams {
  export interface Variant0 {
    /**
     * Values for the discovered login fields
     */
    field_values: { [key: string]: string };
  }

  export interface Variant1 {
    /**
     * Selector of SSO button to click
     */
    sso_button: string;
  }

  export interface Variant2 {
    /**
     * The MFA delivery method type (includes password for auth method selection pages)
     */
    selected_mfa_type: 'sms' | 'call' | 'email' | 'totp' | 'push' | 'password';
  }
}

export declare namespace Invocations {
  export {
    type InvocationExchangeResponse as InvocationExchangeResponse,
    type InvocationCreateParams as InvocationCreateParams,
    type InvocationExchangeParams as InvocationExchangeParams,
    type InvocationSubmitParams as InvocationSubmitParams,
  };
}
