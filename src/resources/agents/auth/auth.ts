// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as InvocationsAPI from './invocations';
import {
  InvocationCreateParams,
  InvocationExchangeParams,
  InvocationExchangeResponse,
  InvocationSubmitParams,
  Invocations,
} from './invocations';
import { APIPromise } from '../../../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../../../core/pagination';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

export class Auth extends APIResource {
  invocations: InvocationsAPI.Invocations = new InvocationsAPI.Invocations(this._client);

  /**
   * Creates a new auth agent for the specified domain and profile combination, or
   * returns an existing one if it already exists. This is idempotent - calling with
   * the same domain and profile will return the same agent. Does NOT start an
   * invocation - use POST /agents/auth/invocations to start an auth flow.
   *
   * @example
   * ```ts
   * const authAgent = await client.agents.auth.create({
   *   domain: 'netflix.com',
   *   profile_name: 'user-123',
   * });
   * ```
   */
  create(body: AuthCreateParams, options?: RequestOptions): APIPromise<AuthAgent> {
    return this._client.post('/agents/auth', { body, ...options });
  }

  /**
   * Retrieve an auth agent by its ID. Returns the current authentication status of
   * the managed profile.
   *
   * @example
   * ```ts
   * const authAgent = await client.agents.auth.retrieve('id');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<AuthAgent> {
    return this._client.get(path`/agents/auth/${id}`, options);
  }

  /**
   * List auth agents with optional filters for profile_name and domain.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const authAgent of client.agents.auth.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: AuthListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<AuthAgentsOffsetPagination, AuthAgent> {
    return this._client.getAPIList('/agents/auth', OffsetPagination<AuthAgent>, { query, ...options });
  }

  /**
   * Deletes an auth agent and terminates its workflow. This will:
   *
   * - Soft delete the auth agent record
   * - Gracefully terminate the agent's Temporal workflow
   * - Cancel any in-progress invocations
   *
   * @example
   * ```ts
   * await client.agents.auth.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/agents/auth/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export type AuthAgentsOffsetPagination = OffsetPagination<AuthAgent>;

/**
 * Response from get invocation endpoint
 */
export interface AgentAuthInvocationResponse {
  /**
   * App name (org name at time of invocation creation)
   */
  app_name: string;

  /**
   * Domain for authentication
   */
  domain: string;

  /**
   * When the handoff code expires
   */
  expires_at: string;

  /**
   * Invocation status
   */
  status: 'IN_PROGRESS' | 'SUCCESS' | 'EXPIRED' | 'CANCELED' | 'FAILED';

  /**
   * Current step in the invocation workflow
   */
  step:
    | 'initialized'
    | 'discovering'
    | 'awaiting_input'
    | 'awaiting_external_action'
    | 'submitting'
    | 'completed'
    | 'expired';

  /**
   * The invocation type:
   *
   * - login: First-time authentication
   * - reauth: Re-authentication for previously authenticated agents
   * - auto_login: Legacy type (no longer created, kept for backward compatibility)
   */
  type: 'login' | 'auto_login' | 'reauth';

  /**
   * Error message explaining why the invocation failed (present when status=FAILED)
   */
  error_message?: string | null;

  /**
   * Instructions for user when external action is required (present when
   * step=awaiting_external_action)
   */
  external_action_message?: string | null;

  /**
   * Browser live view URL for debugging the invocation
   */
  live_view_url?: string | null;

  /**
   * MFA method options to choose from (present when step=awaiting_input and MFA
   * selection is required)
   */
  mfa_options?: Array<AgentAuthInvocationResponse.MfaOption> | null;

  /**
   * Fields currently awaiting input (present when step=awaiting_input)
   */
  pending_fields?: Array<DiscoveredField> | null;

  /**
   * SSO buttons available on the page (present when step=awaiting_input)
   */
  pending_sso_buttons?: Array<AgentAuthInvocationResponse.PendingSSOButton> | null;

  /**
   * SSO provider being used for authentication (e.g., google, github, microsoft)
   */
  sso_provider?: string | null;

  /**
   * Names of fields that have been submitted (present when step=submitting or later)
   */
  submitted_fields?: Array<string> | null;
}

export namespace AgentAuthInvocationResponse {
  /**
   * An MFA method option for verification
   */
  export interface MfaOption {
    /**
     * The visible option text
     */
    label: string;

    /**
     * The MFA delivery method type
     */
    type: 'sms' | 'call' | 'email' | 'totp' | 'push' | 'security_key';

    /**
     * Additional instructions from the site
     */
    description?: string | null;

    /**
     * The masked destination (phone/email) if shown
     */
    target?: string | null;
  }

  /**
   * An SSO button for signing in with an external identity provider
   */
  export interface PendingSSOButton {
    /**
     * Visible button text
     */
    label: string;

    /**
     * Identity provider name
     */
    provider: string;

    /**
     * XPath selector for the button
     */
    selector: string;
  }
}

/**
 * Response from submit endpoint - returns immediately after submission is accepted
 */
export interface AgentAuthSubmitResponse {
  /**
   * Whether the submission was accepted for processing
   */
  accepted: boolean;
}

/**
 * An auth agent that manages authentication for a specific domain and profile
 * combination
 */
export interface AuthAgent {
  /**
   * Unique identifier for the auth agent
   */
  id: string;

  /**
   * Target domain for authentication
   */
  domain: string;

  /**
   * Name of the profile associated with this auth agent
   */
  profile_name: string;

  /**
   * Current authentication status of the managed profile
   */
  status: 'AUTHENTICATED' | 'NEEDS_AUTH';

  /**
   * Additional domains that are valid for this auth agent's authentication flow
   * (besides the primary domain). Useful when login pages redirect to different
   * domains.
   */
  allowed_domains?: Array<string>;

  /**
   * Whether automatic re-authentication is possible (has credential_id, selectors,
   * and login_url)
   */
  can_reauth?: boolean;

  /**
   * ID of the linked credential for automatic re-authentication
   */
  credential_id?: string;

  /**
   * Name of the linked credential for automatic re-authentication
   */
  credential_name?: string;

  /**
   * Whether this auth agent has stored selectors for deterministic re-authentication
   */
  has_selectors?: boolean;

  /**
   * When the last authentication check was performed
   */
  last_auth_check_at?: string;

  /**
   * URL where the browser landed after successful login. Query parameters and
   * fragments are stripped for privacy.
   */
  post_login_url?: string;
}

/**
 * Request to create or find an auth agent
 */
export interface AuthAgentCreateRequest {
  /**
   * Domain for authentication
   */
  domain: string;

  /**
   * Name of the profile to use for this auth agent
   */
  profile_name: string;

  /**
   * Additional domains that are valid for this auth agent's authentication flow
   * (besides the primary domain). Useful when login pages redirect to different
   * domains.
   */
  allowed_domains?: Array<string>;

  /**
   * Optional name of an existing credential to use for this auth agent. If provided,
   * the credential will be linked to the agent and its values will be used to
   * auto-fill the login form on invocation.
   */
  credential_name?: string;

  /**
   * Optional login page URL. If provided, will be stored on the agent and used to
   * skip discovery in future invocations.
   */
  login_url?: string;

  /**
   * Optional proxy configuration
   */
  proxy?: AuthAgentCreateRequest.Proxy;
}

export namespace AuthAgentCreateRequest {
  /**
   * Optional proxy configuration
   */
  export interface Proxy {
    /**
     * ID of the proxy to use
     */
    proxy_id?: string;
  }
}

/**
 * Request to create an invocation for an existing auth agent
 */
export interface AuthAgentInvocationCreateRequest {
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

/**
 * Response from creating an invocation. Always returns an invocation_id.
 */
export interface AuthAgentInvocationCreateResponse {
  /**
   * When the handoff code expires.
   */
  expires_at: string;

  /**
   * One-time code for handoff.
   */
  handoff_code: string;

  /**
   * URL to redirect user to.
   */
  hosted_url: string;

  /**
   * Unique identifier for the invocation.
   */
  invocation_id: string;

  /**
   * The invocation type:
   *
   * - login: First-time authentication
   * - reauth: Re-authentication for previously authenticated agents
   * - auto_login: Legacy type (no longer created, kept for backward compatibility)
   */
  type: 'login' | 'auto_login' | 'reauth';
}

/**
 * A discovered form field
 */
export interface DiscoveredField {
  /**
   * Field label
   */
  label: string;

  /**
   * Field name
   */
  name: string;

  /**
   * CSS selector for the field
   */
  selector: string;

  /**
   * Field type
   */
  type: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url' | 'code' | 'totp';

  /**
   * Field placeholder
   */
  placeholder?: string;

  /**
   * Whether field is required
   */
  required?: boolean;
}

export interface AuthCreateParams {
  /**
   * Domain for authentication
   */
  domain: string;

  /**
   * Name of the profile to use for this auth agent
   */
  profile_name: string;

  /**
   * Additional domains that are valid for this auth agent's authentication flow
   * (besides the primary domain). Useful when login pages redirect to different
   * domains.
   */
  allowed_domains?: Array<string>;

  /**
   * Optional name of an existing credential to use for this auth agent. If provided,
   * the credential will be linked to the agent and its values will be used to
   * auto-fill the login form on invocation.
   */
  credential_name?: string;

  /**
   * Optional login page URL. If provided, will be stored on the agent and used to
   * skip discovery in future invocations.
   */
  login_url?: string;

  /**
   * Optional proxy configuration
   */
  proxy?: AuthCreateParams.Proxy;
}

export namespace AuthCreateParams {
  /**
   * Optional proxy configuration
   */
  export interface Proxy {
    /**
     * ID of the proxy to use
     */
    proxy_id?: string;
  }
}

export interface AuthListParams extends OffsetPaginationParams {
  /**
   * Filter by domain
   */
  domain?: string;

  /**
   * Filter by profile name
   */
  profile_name?: string;
}

Auth.Invocations = Invocations;

export declare namespace Auth {
  export {
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

  export {
    Invocations as Invocations,
    type InvocationExchangeResponse as InvocationExchangeResponse,
    type InvocationCreateParams as InvocationCreateParams,
    type InvocationExchangeParams as InvocationExchangeParams,
    type InvocationSubmitParams as InvocationSubmitParams,
  };
}
