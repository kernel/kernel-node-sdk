// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as Shared from '../shared';
import { APIPromise } from '../../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../../core/pagination';
import { Stream } from '../../core/streaming';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Connections extends APIResource {
  /**
   * Creates an auth connection for a profile and domain combination. Returns 409
   * Conflict if an auth connection already exists for the given profile and domain.
   *
   * @example
   * ```ts
   * const managedAuth = await client.auth.connections.create({
   *   domain: 'netflix.com',
   *   profile_name: 'user-123',
   * });
   * ```
   */
  create(body: ConnectionCreateParams, options?: RequestOptions): APIPromise<ManagedAuth> {
    return this._client.post('/auth/connections', { body, ...options });
  }

  /**
   * Retrieve an auth connection by its ID. Includes current flow state if a login is
   * in progress.
   *
   * @example
   * ```ts
   * const managedAuth = await client.auth.connections.retrieve(
   *   'id',
   * );
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<ManagedAuth> {
    return this._client.get(path`/auth/connections/${id}`, options);
  }

  /**
   * List auth connections with optional filters for profile_name and domain.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const managedAuth of client.auth.connections.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: ConnectionListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<ManagedAuthsOffsetPagination, ManagedAuth> {
    return this._client.getAPIList('/auth/connections', OffsetPagination<ManagedAuth>, { query, ...options });
  }

  /**
   * Deletes an auth connection and terminates its workflow. This will:
   *
   * - Delete the auth connection record
   * - Terminate the Temporal workflow
   * - Cancel any in-progress login flows
   *
   * @example
   * ```ts
   * await client.auth.connections.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/auth/connections/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Establishes a Server-Sent Events (SSE) stream that delivers real-time login flow
   * state updates. The stream terminates automatically once the flow reaches a
   * terminal state (SUCCESS, FAILED, EXPIRED, CANCELED).
   *
   * @example
   * ```ts
   * const response = await client.auth.connections.follow('id');
   * ```
   */
  follow(id: string, options?: RequestOptions): APIPromise<Stream<ConnectionFollowResponse>> {
    return this._client.get(path`/auth/connections/${id}/events`, {
      ...options,
      headers: buildHeaders([{ Accept: 'text/event-stream' }, options?.headers]),
      stream: true,
    }) as APIPromise<Stream<ConnectionFollowResponse>>;
  }

  /**
   * Starts a login flow for the auth connection. Returns immediately with a hosted
   * URL for the user to complete authentication, or triggers automatic re-auth if
   * credentials are stored.
   *
   * @example
   * ```ts
   * const loginResponse = await client.auth.connections.login(
   *   'id',
   * );
   * ```
   */
  login(
    id: string,
    body: ConnectionLoginParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<LoginResponse> {
    return this._client.post(path`/auth/connections/${id}/login`, { body, ...options });
  }

  /**
   * Submits field values for the login form. Poll the auth connection to track
   * progress and get results.
   *
   * @example
   * ```ts
   * const submitFieldsResponse =
   *   await client.auth.connections.submit('id', {
   *     fields: {
   *       email: 'user@example.com',
   *       password: 'secret',
   *     },
   *   });
   * ```
   */
  submit(
    id: string,
    body: ConnectionSubmitParams,
    options?: RequestOptions,
  ): APIPromise<SubmitFieldsResponse> {
    return this._client.post(path`/auth/connections/${id}/submit`, { body, ...options });
  }
}

export type ManagedAuthsOffsetPagination = OffsetPagination<ManagedAuth>;

/**
 * Request to start a login flow
 */
export interface LoginRequest {
  /**
   * Proxy selection. Provide either id or name. The proxy must belong to the
   * caller's org.
   */
  proxy?: LoginRequest.Proxy;

  /**
   * If provided, saves credentials under this name upon successful login
   */
  save_credential_as?: string;
}

export namespace LoginRequest {
  /**
   * Proxy selection. Provide either id or name. The proxy must belong to the
   * caller's org.
   */
  export interface Proxy {
    /**
     * Proxy ID
     */
    id?: string;

    /**
     * Proxy name
     */
    name?: string;
  }
}

/**
 * Response from starting a login flow
 */
export interface LoginResponse {
  /**
   * Auth connection ID
   */
  id: string;

  /**
   * When the login flow expires
   */
  flow_expires_at: string;

  /**
   * Type of login flow started
   */
  flow_type: 'LOGIN' | 'REAUTH';

  /**
   * URL to redirect user to for login
   */
  hosted_url: string;

  /**
   * One-time code for handoff (internal use)
   */
  handoff_code?: string;

  /**
   * Browser live view URL for watching the login flow
   */
  live_view_url?: string;
}

/**
 * Managed authentication that keeps a profile logged into a specific domain. Flow
 * fields (flow_status, flow_step, discovered_fields, mfa_options) reflect the most
 * recent login flow and are null when no flow has been initiated.
 */
export interface ManagedAuth {
  /**
   * Unique identifier for the auth connection
   */
  id: string;

  /**
   * Target domain for authentication
   */
  domain: string;

  /**
   * Name of the profile associated with this auth connection
   */
  profile_name: string;

  /**
   * Current authentication status of the managed profile
   */
  status: 'AUTHENTICATED' | 'NEEDS_AUTH';

  /**
   * Additional domains that are valid for this auth flow (besides the primary
   * domain). Useful when login pages redirect to different domains.
   *
   * The following SSO/OAuth provider domains are automatically allowed by default
   * and do not need to be specified:
   *
   * - Google: accounts.google.com
   * - Microsoft/Azure AD: login.microsoftonline.com, login.live.com
   * - Okta: _.okta.com, _.oktapreview.com
   * - Auth0: _.auth0.com, _.us.auth0.com, _.eu.auth0.com, _.au.auth0.com
   * - Apple: appleid.apple.com
   * - GitHub: github.com
   * - Facebook/Meta: www.facebook.com
   * - LinkedIn: www.linkedin.com
   * - Amazon Cognito: \*.amazoncognito.com
   * - OneLogin: \*.onelogin.com
   * - Ping Identity: _.pingone.com, _.pingidentity.com
   */
  allowed_domains?: Array<string>;

  /**
   * Whether automatic re-authentication is possible (has credential, selectors, and
   * login_url)
   */
  can_reauth?: boolean;

  /**
   * Reason why automatic re-authentication is or is not possible
   */
  can_reauth_reason?: string;

  /**
   * Reference to credentials for the auth connection. Use one of:
   *
   * - { name } for Kernel credentials
   * - { provider, path } for external provider item
   * - { provider, auto: true } for external provider domain lookup
   */
  credential?: ManagedAuth.Credential;

  /**
   * Fields awaiting input (present when flow_step=awaiting_input)
   */
  discovered_fields?: Array<ManagedAuth.DiscoveredField> | null;

  /**
   * Error message (present when flow_status=failed)
   */
  error_message?: string | null;

  /**
   * Instructions for external action (present when
   * flow_step=awaiting_external_action)
   */
  external_action_message?: string | null;

  /**
   * When the current flow expires (null when no flow in progress)
   */
  flow_expires_at?: string | null;

  /**
   * Current flow status (null when no flow in progress)
   */
  flow_status?: 'IN_PROGRESS' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'CANCELED' | null;

  /**
   * Current step in the flow (null when no flow in progress)
   */
  flow_step?:
    | 'DISCOVERING'
    | 'AWAITING_INPUT'
    | 'AWAITING_EXTERNAL_ACTION'
    | 'SUBMITTING'
    | 'COMPLETED'
    | null;

  /**
   * Type of the current flow (null when no flow in progress)
   */
  flow_type?: 'LOGIN' | 'REAUTH' | null;

  /**
   * Interval in seconds between automatic health checks. When set, the system
   * periodically verifies the authentication status and triggers re-authentication
   * if needed. Maximum is 86400 (24 hours). Default is 3600 (1 hour). The minimum
   * depends on your plan: Enterprise: 300 (5 minutes), Startup: 1200 (20 minutes),
   * Hobbyist: 3600 (1 hour).
   */
  health_check_interval?: number | null;

  /**
   * URL to redirect user to for hosted login (present when flow in progress)
   */
  hosted_url?: string | null;

  /**
   * When the profile was last successfully authenticated
   */
  last_auth_at?: string;

  /**
   * Browser live view URL for debugging (present when flow in progress)
   */
  live_view_url?: string | null;

  /**
   * MFA method options (present when flow_step=awaiting_input and MFA selection
   * required)
   */
  mfa_options?: Array<ManagedAuth.MfaOption> | null;

  /**
   * SSO buttons available (present when flow_step=awaiting_input)
   */
  pending_sso_buttons?: Array<ManagedAuth.PendingSSOButton> | null;

  /**
   * URL where the browser landed after successful login
   */
  post_login_url?: string;

  /**
   * SSO provider being used (e.g., google, github, microsoft)
   */
  sso_provider?: string | null;

  /**
   * Visible error message from the website (e.g., 'Incorrect password'). Present
   * when the website displays an error during login.
   */
  website_error?: string | null;
}

export namespace ManagedAuth {
  /**
   * Reference to credentials for the auth connection. Use one of:
   *
   * - { name } for Kernel credentials
   * - { provider, path } for external provider item
   * - { provider, auto: true } for external provider domain lookup
   */
  export interface Credential {
    /**
     * If true, lookup by domain from the specified provider
     */
    auto?: boolean;

    /**
     * Kernel credential name
     */
    name?: string;

    /**
     * Provider-specific path (e.g., "VaultName/ItemName" for 1Password)
     */
    path?: string;

    /**
     * External provider name (e.g., "my-1p")
     */
    provider?: string;
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
     * If this field is associated with an MFA option, the type of that option (e.g.,
     * password field linked to "Enter password" option)
     */
    linked_mfa_type?: 'sms' | 'call' | 'email' | 'totp' | 'push' | 'password' | null;

    /**
     * Field placeholder
     */
    placeholder?: string;

    /**
     * Whether field is required
     */
    required?: boolean;
  }

  /**
   * An MFA method option for verification
   */
  export interface MfaOption {
    /**
     * The visible option text
     */
    label: string;

    /**
     * The MFA delivery method type (includes password for auth method selection pages)
     */
    type: 'sms' | 'call' | 'email' | 'totp' | 'push' | 'password';

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
 * Request to create an auth connection for a profile and domain
 */
export interface ManagedAuthCreateRequest {
  /**
   * Domain for authentication
   */
  domain: string;

  /**
   * Name of the profile to manage authentication for
   */
  profile_name: string;

  /**
   * Additional domains valid for this auth flow (besides the primary domain). Useful
   * when login pages redirect to different domains.
   *
   * The following SSO/OAuth provider domains are automatically allowed by default
   * and do not need to be specified:
   *
   * - Google: accounts.google.com
   * - Microsoft/Azure AD: login.microsoftonline.com, login.live.com
   * - Okta: _.okta.com, _.oktapreview.com
   * - Auth0: _.auth0.com, _.us.auth0.com, _.eu.auth0.com, _.au.auth0.com
   * - Apple: appleid.apple.com
   * - GitHub: github.com
   * - Facebook/Meta: www.facebook.com
   * - LinkedIn: www.linkedin.com
   * - Amazon Cognito: \*.amazoncognito.com
   * - OneLogin: \*.onelogin.com
   * - Ping Identity: _.pingone.com, _.pingidentity.com
   */
  allowed_domains?: Array<string>;

  /**
   * Reference to credentials for the auth connection. Use one of:
   *
   * - { name } for Kernel credentials
   * - { provider, path } for external provider item
   * - { provider, auto: true } for external provider domain lookup
   */
  credential?: ManagedAuthCreateRequest.Credential;

  /**
   * Interval in seconds between automatic health checks. When set, the system
   * periodically verifies the authentication status and triggers re-authentication
   * if needed. Maximum is 86400 (24 hours). Default is 3600 (1 hour). The minimum
   * depends on your plan: Enterprise: 300 (5 minutes), Startup: 1200 (20 minutes),
   * Hobbyist: 3600 (1 hour).
   */
  health_check_interval?: number;

  /**
   * Optional login page URL to skip discovery
   */
  login_url?: string;

  /**
   * Proxy selection. Provide either id or name. The proxy must belong to the
   * caller's org.
   */
  proxy?: ManagedAuthCreateRequest.Proxy;
}

export namespace ManagedAuthCreateRequest {
  /**
   * Reference to credentials for the auth connection. Use one of:
   *
   * - { name } for Kernel credentials
   * - { provider, path } for external provider item
   * - { provider, auto: true } for external provider domain lookup
   */
  export interface Credential {
    /**
     * If true, lookup by domain from the specified provider
     */
    auto?: boolean;

    /**
     * Kernel credential name
     */
    name?: string;

    /**
     * Provider-specific path (e.g., "VaultName/ItemName" for 1Password)
     */
    path?: string;

    /**
     * External provider name (e.g., "my-1p")
     */
    provider?: string;
  }

  /**
   * Proxy selection. Provide either id or name. The proxy must belong to the
   * caller's org.
   */
  export interface Proxy {
    /**
     * Proxy ID
     */
    id?: string;

    /**
     * Proxy name
     */
    name?: string;
  }
}

/**
 * Request to submit field values for login
 */
export interface SubmitFieldsRequest {
  /**
   * Map of field name to value
   */
  fields: { [key: string]: string };

  /**
   * Optional MFA option ID if user selected an MFA method
   */
  mfa_option_id?: string;

  /**
   * Optional XPath selector if user chose to click an SSO button instead
   */
  sso_button_selector?: string;
}

/**
 * Response from submitting field values
 */
export interface SubmitFieldsResponse {
  /**
   * Whether the submission was accepted for processing
   */
  accepted: boolean;
}

/**
 * Union type representing any managed auth event.
 */
export type ConnectionFollowResponse =
  | ConnectionFollowResponse.ManagedAuthStateEvent
  | Shared.ErrorEvent
  | Shared.HeartbeatEvent;

export namespace ConnectionFollowResponse {
  /**
   * An event representing the current state of a managed auth flow.
   */
  export interface ManagedAuthStateEvent {
    /**
     * Event type identifier (always "managed_auth_state").
     */
    event: 'managed_auth_state';

    /**
     * Current flow status.
     */
    flow_status: 'IN_PROGRESS' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'CANCELED';

    /**
     * Current step in the flow.
     */
    flow_step: 'DISCOVERING' | 'AWAITING_INPUT' | 'AWAITING_EXTERNAL_ACTION' | 'SUBMITTING' | 'COMPLETED';

    /**
     * Time the state was reported.
     */
    timestamp: string;

    /**
     * Fields awaiting input (present when flow_step=AWAITING_INPUT).
     */
    discovered_fields?: Array<ManagedAuthStateEvent.DiscoveredField>;

    /**
     * Error message (present when flow_status=FAILED).
     */
    error_message?: string;

    /**
     * Instructions for external action (present when
     * flow_step=AWAITING_EXTERNAL_ACTION).
     */
    external_action_message?: string;

    /**
     * Type of the current flow.
     */
    flow_type?: 'LOGIN' | 'REAUTH';

    /**
     * URL to redirect user to for hosted login.
     */
    hosted_url?: string;

    /**
     * Browser live view URL for debugging.
     */
    live_view_url?: string;

    /**
     * MFA method options (present when flow_step=AWAITING_INPUT and MFA selection
     * required).
     */
    mfa_options?: Array<ManagedAuthStateEvent.MfaOption>;

    /**
     * SSO buttons available (present when flow_step=AWAITING_INPUT).
     */
    pending_sso_buttons?: Array<ManagedAuthStateEvent.PendingSSOButton>;

    /**
     * URL where the browser landed after successful login.
     */
    post_login_url?: string;

    /**
     * Visible error message from the website (e.g., 'Incorrect password'). Present
     * when the website displays an error during login.
     */
    website_error?: string;
  }

  export namespace ManagedAuthStateEvent {
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
       * If this field is associated with an MFA option, the type of that option (e.g.,
       * password field linked to "Enter password" option)
       */
      linked_mfa_type?: 'sms' | 'call' | 'email' | 'totp' | 'push' | 'password' | null;

      /**
       * Field placeholder
       */
      placeholder?: string;

      /**
       * Whether field is required
       */
      required?: boolean;
    }

    /**
     * An MFA method option for verification
     */
    export interface MfaOption {
      /**
       * The visible option text
       */
      label: string;

      /**
       * The MFA delivery method type (includes password for auth method selection pages)
       */
      type: 'sms' | 'call' | 'email' | 'totp' | 'push' | 'password';

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
}

export interface ConnectionCreateParams {
  /**
   * Domain for authentication
   */
  domain: string;

  /**
   * Name of the profile to manage authentication for
   */
  profile_name: string;

  /**
   * Additional domains valid for this auth flow (besides the primary domain). Useful
   * when login pages redirect to different domains.
   *
   * The following SSO/OAuth provider domains are automatically allowed by default
   * and do not need to be specified:
   *
   * - Google: accounts.google.com
   * - Microsoft/Azure AD: login.microsoftonline.com, login.live.com
   * - Okta: _.okta.com, _.oktapreview.com
   * - Auth0: _.auth0.com, _.us.auth0.com, _.eu.auth0.com, _.au.auth0.com
   * - Apple: appleid.apple.com
   * - GitHub: github.com
   * - Facebook/Meta: www.facebook.com
   * - LinkedIn: www.linkedin.com
   * - Amazon Cognito: \*.amazoncognito.com
   * - OneLogin: \*.onelogin.com
   * - Ping Identity: _.pingone.com, _.pingidentity.com
   */
  allowed_domains?: Array<string>;

  /**
   * Reference to credentials for the auth connection. Use one of:
   *
   * - { name } for Kernel credentials
   * - { provider, path } for external provider item
   * - { provider, auto: true } for external provider domain lookup
   */
  credential?: ConnectionCreateParams.Credential;

  /**
   * Interval in seconds between automatic health checks. When set, the system
   * periodically verifies the authentication status and triggers re-authentication
   * if needed. Maximum is 86400 (24 hours). Default is 3600 (1 hour). The minimum
   * depends on your plan: Enterprise: 300 (5 minutes), Startup: 1200 (20 minutes),
   * Hobbyist: 3600 (1 hour).
   */
  health_check_interval?: number;

  /**
   * Optional login page URL to skip discovery
   */
  login_url?: string;

  /**
   * Proxy selection. Provide either id or name. The proxy must belong to the
   * caller's org.
   */
  proxy?: ConnectionCreateParams.Proxy;
}

export namespace ConnectionCreateParams {
  /**
   * Reference to credentials for the auth connection. Use one of:
   *
   * - { name } for Kernel credentials
   * - { provider, path } for external provider item
   * - { provider, auto: true } for external provider domain lookup
   */
  export interface Credential {
    /**
     * If true, lookup by domain from the specified provider
     */
    auto?: boolean;

    /**
     * Kernel credential name
     */
    name?: string;

    /**
     * Provider-specific path (e.g., "VaultName/ItemName" for 1Password)
     */
    path?: string;

    /**
     * External provider name (e.g., "my-1p")
     */
    provider?: string;
  }

  /**
   * Proxy selection. Provide either id or name. The proxy must belong to the
   * caller's org.
   */
  export interface Proxy {
    /**
     * Proxy ID
     */
    id?: string;

    /**
     * Proxy name
     */
    name?: string;
  }
}

export interface ConnectionListParams extends OffsetPaginationParams {
  /**
   * Filter by domain
   */
  domain?: string;

  /**
   * Filter by profile name
   */
  profile_name?: string;
}

export interface ConnectionLoginParams {
  /**
   * Proxy selection. Provide either id or name. The proxy must belong to the
   * caller's org.
   */
  proxy?: ConnectionLoginParams.Proxy;

  /**
   * If provided, saves credentials under this name upon successful login
   */
  save_credential_as?: string;
}

export namespace ConnectionLoginParams {
  /**
   * Proxy selection. Provide either id or name. The proxy must belong to the
   * caller's org.
   */
  export interface Proxy {
    /**
     * Proxy ID
     */
    id?: string;

    /**
     * Proxy name
     */
    name?: string;
  }
}

export interface ConnectionSubmitParams {
  /**
   * Map of field name to value
   */
  fields: { [key: string]: string };

  /**
   * Optional MFA option ID if user selected an MFA method
   */
  mfa_option_id?: string;

  /**
   * Optional XPath selector if user chose to click an SSO button instead
   */
  sso_button_selector?: string;
}

export declare namespace Connections {
  export {
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
