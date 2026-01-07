// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as AuthAPI from './auth';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

export class Invocations extends APIResource {
  /**
   * Creates a new authentication invocation for the specified auth agent. This
   * starts the auth flow and returns a hosted URL for the user to complete
   * authentication.
   *
   * @example
   * ```ts
   * const authAgentInvocationCreateResponse =
   *   await client.agents.auth.invocations.create({
   *     auth_agent_id: 'abc123xyz',
   *   });
   * ```
   */
  create(
    body: InvocationCreateParams,
    options?: RequestOptions,
  ): APIPromise<AuthAPI.AuthAgentInvocationCreateResponse> {
    return this._client.post('/agents/auth/invocations', { body, ...options });
  }

  /**
   * Returns invocation details including status, app_name, and domain. Supports both
   * API key and JWT (from exchange endpoint) authentication.
   *
   * @example
   * ```ts
   * const agentAuthInvocationResponse =
   *   await client.agents.auth.invocations.retrieve(
   *     'invocation_id',
   *   );
   * ```
   */
  retrieve(invocationID: string, options?: RequestOptions): APIPromise<AuthAPI.AgentAuthInvocationResponse> {
    return this._client.get(path`/agents/auth/invocations/${invocationID}`, options);
  }

  /**
   * Validates the handoff code and returns a JWT token for subsequent requests. No
   * authentication required (the handoff code serves as the credential).
   *
   * @example
   * ```ts
   * const response =
   *   await client.agents.auth.invocations.exchange(
   *     'invocation_id',
   *     { code: 'abc123xyz' },
   *   );
   * ```
   */
  exchange(
    invocationID: string,
    body: InvocationExchangeParams,
    options?: RequestOptions,
  ): APIPromise<InvocationExchangeResponse> {
    return this._client.post(path`/agents/auth/invocations/${invocationID}/exchange`, { body, ...options });
  }

  /**
   * Submits field values for the discovered login form. Returns immediately after
   * submission is accepted. Poll the invocation endpoint to track progress and get
   * results.
   *
   * @example
   * ```ts
   * const agentAuthSubmitResponse =
   *   await client.agents.auth.invocations.submit(
   *     'invocation_id',
   *     {
   *       field_values: {
   *         email: 'user@example.com',
   *         password: '********',
   *       },
   *     },
   *   );
   * ```
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

export type InvocationSubmitParams = InvocationSubmitParams.Variant0 | InvocationSubmitParams.Variant1;

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
}

export declare namespace Invocations {
  export {
    type InvocationExchangeResponse as InvocationExchangeResponse,
    type InvocationCreateParams as InvocationCreateParams,
    type InvocationExchangeParams as InvocationExchangeParams,
    type InvocationSubmitParams as InvocationSubmitParams,
  };
}
