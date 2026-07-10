// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as Shared from '../shared';
import { APIPromise } from '../../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../../core/pagination';
import { Stream } from '../../core/streaming';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Create and manage auth connections for automated credential capture and login.
 */
export class Connections extends APIResource {
  /**
   * Creates an auth connection for a profile and domain combination. If the provided
   * profile_name does not exist, it is created automatically. Returns 409 Conflict
   * if an auth connection already exists for the given profile and domain.
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
   * Update an auth connection's configuration. Only the fields provided will be
   * updated.
   *
   * @example
   * ```ts
   * const managedAuth = await client.auth.connections.update(
   *   'id',
   * );
   * ```
   */
  update(id: string, body: ConnectionUpdateParams, options?: RequestOptions): APIPromise<ManagedAuth> {
    return this._client.patch(path`/auth/connections/${id}`, { body, ...options });
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
   *   await client.auth.connections.submit('id');
   * ```
   */
  submit(
    id: string,
    body: ConnectionSubmitParams,
    options?: RequestOptions,
  ): APIPromise<SubmitFieldsResponse> {
    return this._client.post(path`/auth/connections/${id}/submit`, { body, ...options });
  }

  /**
   * Returns a chronological timeline of events for an auth connection — login
   * attempts, automatic re-auth attempts, and health checks. Events are returned
   * newest-first.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const managedAuthTimelineEvent of client.auth.connections.timeline(
   *   'id',
   * )) {
   *   // ...
   * }
   * ```
   */
  timeline(
    id: string,
    query: ConnectionTimelineParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<ManagedAuthTimelineEventsOffsetPagination, ManagedAuthTimelineEvent> {
    return this._client.getAPIList(
      path`/auth/connections/${id}/timeline`,
      OffsetPagination<ManagedAuthTimelineEvent>,
      { query, ...options },
    );
  }
}

export type ManagedAuthsOffsetPagination = OffsetPagination<ManagedAuth>;

export type ManagedAuthTimelineEventsOffsetPagination = OffsetPagination<ManagedAuthTimelineEvent>;

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
   * Whether to record browser session replays for this connection by default. Useful
   * for debugging login flows. Can be overridden per-login.
   */
  record_session: boolean;

  /**
   * Whether credentials are saved after every successful login. One-time codes
   * (TOTP, SMS, etc.) are not saved.
   */
  save_credentials: boolean;

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
   * Whether automatic re-authentication is permitted for this connection. This is an
   * opt-in flag only — it does not check whether re-auth is actually feasible. Even
   * when true, re-auth only runs when the system has what it needs to perform it
   * (for example, saved credentials for the required login fields), and only after a
   * scheduled health check detects an expired session — so this flag has no effect
   * when `health_checks` is false. When false, expired sessions detected by a health
   * check are marked as `NEEDS_AUTH` instead of attempting re-auth.
   */
  auto_reauth?: boolean;

  /**
   * ID of the underlying browser session driving the current flow (present when flow
   * in progress). Use this to inspect or terminate the browser session via the
   * `/browsers` API.
   */
  browser_session_id?: string | null;

  /**
   * Whether Kernel can automatically re-authenticate this connection when the
   * session expires. Requires a prior successful login plus either a Kernel
   * credential or an external credential reference. See `can_reauth_reason` for the
   * specific outcome.
   */
  can_reauth?: boolean;

  /**
   * Machine-readable reason for the current value of `can_reauth`. Affirmative
   * values (re-auth is possible):
   *
   * - `external_credential` — an external credential provider is attached
   * - `cua_has_credential` — CUA flow with a stored credential
   * - `has_credential` — Kernel credential is attached (optimistic; plan viability
   *   not checked)
   * - `viable_plans_found` — at least one stored login plan can be replayed
   * - `no_requirements_recorded` — no recorded credential requirements to fail
   *   against
   * - `requirements_satisfiable` — recorded requirements can be met by the attached
   *   credential
   *
   * Negative values (a human must complete the login flow):
   *
   * - `no_prior_successful_login` — connection has never completed a successful
   *   login
   * - `no_credential` — no Kernel or external credential attached
   * - `no_viable_plans` — credential attached but no replayable login plan exists
   *   yet
   * - `viable_plans_require_external_action` — stored plans need an external step
   *   (email link, push, etc.)
   * - `requires_external_action` — recorded requirements include an external step
   * - `requires_totp_without_secret` — flow needs a TOTP code but no TOTP secret is
   *   stored
   * - `requires_sms_code` — flow needs an SMS code that cannot be received
   *   automatically
   * - `requires_email_code` — flow needs an email code that cannot be received
   *   automatically
   */
  can_reauth_reason?:
    | 'external_credential'
    | 'cua_has_credential'
    | 'has_credential'
    | 'viable_plans_found'
    | 'no_requirements_recorded'
    | 'requirements_satisfiable'
    | 'no_prior_successful_login'
    | 'no_credential'
    | 'no_viable_plans'
    | 'viable_plans_require_external_action'
    | 'requires_external_action'
    | 'requires_totp_without_secret'
    | 'requires_sms_code'
    | 'requires_email_code';

  /**
   * Reference to credentials for the auth connection. Use one of:
   *
   * - { name } for Kernel credentials
   * - { provider, path } for external provider item
   * - { provider, auto: true } for external provider domain lookup
   */
  credential?: ManagedAuth.Credential;

  /**
   * Fields awaiting input (present when flow_step=awaiting_input; may also be
   * present with awaiting_external_action as fallback actions)
   */
  discovered_fields?: Array<ManagedAuth.DiscoveredField> | null;

  /**
   * Machine-readable error code (present when flow_status=failed)
   */
  error_code?: string | null;

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
   * When the current flow expires (null when no flow in progress). A flow past this
   * timestamp is no longer valid and its `flow_status` will be `EXPIRED`. Clients
   * may start a new login to supersede a stale `IN_PROGRESS` flow past this
   * timestamp.
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
   * Whether periodic health checks are enabled for this connection. When false, the
   * system will not automatically verify authentication status, and `auto_reauth`
   * has no effect on the automatic flow (since re-auth is only triggered by a failed
   * scheduled health check). Manually triggering a health check via the API still
   * works regardless of this setting.
   */
  health_checks?: boolean;

  /**
   * URL to redirect user to for hosted login (present when flow in progress)
   */
  hosted_url?: string | null;

  /**
   * @deprecated Deprecated alias for `last_auth_check_at`. Despite the name, this is
   * the last health-check timestamp, not the last successful authentication. Use
   * `last_auth_check_at` instead.
   */
  last_auth_at?: string;

  /**
   * When the most recent auth health check ran for this connection, regardless of
   * outcome. Updated on every health check and does not by itself indicate that the
   * profile is currently authenticated - use `status` for that. May be newer than
   * `flow_expires_at` when a flow is still in progress because health checks
   * continue to run in parallel.
   */
  last_auth_check_at?: string;

  /**
   * Browser live view URL for debugging (present when flow in progress)
   */
  live_view_url?: string | null;

  /**
   * Optional login page URL to skip discovery
   */
  login_url?: string;

  /**
   * MFA method options (present when flow_step=awaiting_input; may also be present
   * with awaiting_external_action as fallback actions)
   */
  mfa_options?: Array<ManagedAuth.MfaOption> | null;

  /**
   * SSO buttons available (present when flow_step=awaiting_input; may also be
   * present with awaiting_external_action as fallback actions)
   */
  pending_sso_buttons?: Array<ManagedAuth.PendingSSOButton> | null;

  /**
   * URL where the browser landed after successful login
   */
  post_login_url?: string;

  /**
   * ID of the proxy associated with this connection, if any.
   */
  proxy_id?: string;

  /**
   * Non-MFA choices presented during the auth flow, such as account selection or org
   * pickers (present when flow_step=awaiting_input; may also be present with
   * awaiting_external_action as fallback actions).
   */
  sign_in_options?: Array<ManagedAuth.SignInOption> | null;

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
     * Contextual help text near the field that tells the user what to enter (e.g.,
     * "Enter the phone ending in (**_) _**-\*\*92")
     */
    hint?: string;

    /**
     * If this field is associated with an MFA option, the type of that option (e.g.,
     * password field linked to "Enter password" option)
     */
    linked_mfa_type?: 'sms' | 'call' | 'email' | 'totp' | 'push' | 'password' | 'switch' | null;

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
     * The MFA delivery method type. Includes 'password' for auth method selection
     * pages and 'switch' for generic method-switcher links like "Use another method"
     * that do not name a specific method.
     */
    type: 'sms' | 'call' | 'email' | 'totp' | 'push' | 'password' | 'switch';

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

  /**
   * A non-MFA choice presented during the auth flow (e.g. account selection, org
   * picker)
   */
  export interface SignInOption {
    /**
     * Unique identifier for this option (used to submit selection back)
     */
    id: string;

    /**
     * Display text for the option
     */
    label: string;

    /**
     * Additional context such as email address or org name
     */
    description?: string | null;
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
   * Name of the profile to manage authentication for. If the profile does not exist,
   * it is created automatically.
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
   * Whether to permit automatic re-authentication when a scheduled health check
   * detects an expired session. This is an opt-in flag only — it does not check
   * whether re-auth is actually feasible. Even when true, re-auth only runs when the
   * system has what it needs to perform it (for example, saved credentials for the
   * required login fields), and only after a scheduled health check detects an
   * expired session — so this flag has no effect when `health_checks` is false. When
   * false, expired sessions are marked as `NEEDS_AUTH` instead of attempting
   * re-auth. Defaults to true.
   */
  auto_reauth?: boolean;

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
   * Whether to enable periodic health checks. When false, the system will not
   * automatically verify authentication status, and `auto_reauth` has no effect on
   * the automatic flow (since re-auth is only triggered by a failed scheduled health
   * check). Defaults to true.
   */
  health_checks?: boolean;

  /**
   * Optional login page URL to skip discovery
   */
  login_url?: string;

  /**
   * Proxy selection. Provide either id or name. The proxy must be in the same
   * project as the resource referencing it. When selecting by name, the name must
   * match exactly one active proxy in the project. Ambiguous names return a 400; use
   * id for stable references.
   */
  proxy?: ManagedAuthCreateRequest.Proxy;

  /**
   * Whether to record browser sessions for this connection by default. Useful for
   * debugging. Can be overridden per-login. Defaults to false.
   */
  record_session?: boolean;

  /**
   * Whether to save credentials after every successful login. Defaults to true.
   * One-time codes (TOTP, SMS, etc.) are not saved.
   */
  save_credentials?: boolean;
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
   * Proxy selection. Provide either id or name. The proxy must be in the same
   * project as the resource referencing it. When selecting by name, the name must
   * match exactly one active proxy in the project. Ambiguous names return a 400; use
   * id for stable references.
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
 * A single event in an auth connection's history — a login attempt, an automatic
 * re-auth attempt, or a health check.
 */
export interface ManagedAuthTimelineEvent {
  /**
   * Identifier of the underlying login/reauth session or health check.
   */
  id: string;

  /**
   * Outcome of the event. For login/reauth events this is the flow status
   * (IN_PROGRESS, SUCCESS, EXPIRED, CANCELED, FAILED). For health_check events it is
   * the observed session state (AUTHENTICATED, NEEDS_AUTH).
   */
  status: 'IN_PROGRESS' | 'SUCCESS' | 'EXPIRED' | 'CANCELED' | 'FAILED' | 'AUTHENTICATED' | 'NEEDS_AUTH';

  /**
   * When the event occurred.
   */
  timestamp: string;

  /**
   * The kind of event. "login" and "reauth" are authentication attempts;
   * "health_check" is a periodic session-validity check.
   */
  type: 'login' | 'reauth' | 'health_check';

  /**
   * Machine-readable error code. Present when a login/reauth event failed.
   */
  error_code?: string;

  /**
   * Human-readable error message. Present when a login/reauth event failed.
   */
  error_message?: string;

  /**
   * The session state observed before this event. Present for health_check events
   * that recorded a prior state.
   */
  previous_status?: 'AUTHENTICATED' | 'NEEDS_AUTH';

  /**
   * Replay recording ID for the event's browser session, if session recording was
   * enabled.
   */
  replay_id?: string;

  /**
   * The step the flow reached. Present for login/reauth events.
   */
  step?:
    | 'INITIALIZED'
    | 'DISCOVERING'
    | 'AWAITING_INPUT'
    | 'AWAITING_EXTERNAL_ACTION'
    | 'AWAITING_HUMAN_INTERVENTION'
    | 'SUBMITTING'
    | 'COMPLETED'
    | 'EXPIRED';

  /**
   * When the event was last updated. Present for login/reauth events.
   */
  updated_at?: string;

  /**
   * Visible error message from the website (e.g., 'Incorrect password'). Present
   * when the website displayed an error during the attempt.
   */
  website_error?: string;
}

/**
 * Request to update an auth connection's configuration
 */
export interface ManagedAuthUpdateRequest {
  /**
   * Additional domains valid for this auth flow (replaces existing list)
   */
  allowed_domains?: Array<string>;

  /**
   * Whether automatic re-authentication is permitted for this connection. This is an
   * opt-in flag only — it does not check whether re-auth is actually feasible. Even
   * when true, re-auth only runs when the system has what it needs to perform it
   * (for example, saved credentials for the required login fields), and only after a
   * scheduled health check detects an expired session — so this flag has no effect
   * when `health_checks` is false. When false, expired sessions detected by a health
   * check are marked as `NEEDS_AUTH` instead of attempting re-auth.
   */
  auto_reauth?: boolean;

  /**
   * Reference to credentials for the auth connection. Use one of:
   *
   * - { name } for Kernel credentials
   * - { provider, path } for external provider item
   * - { provider, auto: true } for external provider domain lookup
   */
  credential?: ManagedAuthUpdateRequest.Credential;

  /**
   * Interval in seconds between automatic health checks
   */
  health_check_interval?: number;

  /**
   * Whether periodic health checks are enabled. When set to false, the system will
   * not automatically verify authentication status, and `auto_reauth` has no effect
   * on the automatic flow (since re-auth is only triggered by a failed scheduled
   * health check).
   */
  health_checks?: boolean;

  /**
   * Login page URL. Set to empty string to clear.
   */
  login_url?: string;

  /**
   * Proxy selection. Provide either id or name. The proxy must be in the same
   * project as the resource referencing it. When selecting by name, the name must
   * match exactly one active proxy in the project. Ambiguous names return a 400; use
   * id for stable references.
   */
  proxy?: ManagedAuthUpdateRequest.Proxy;

  /**
   * Whether to record browser sessions for this connection by default
   */
  record_session?: boolean;

  /**
   * Whether to save credentials after every successful login
   */
  save_credentials?: boolean;
}

export namespace ManagedAuthUpdateRequest {
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
   * Proxy selection. Provide either id or name. The proxy must be in the same
   * project as the resource referencing it. When selecting by name, the name must
   * match exactly one active proxy in the project. Ambiguous names return a 400; use
   * id for stable references.
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
 * Request to submit field values, click an SSO button, select an MFA method, or
 * select a sign-in option. Provide exactly one of fields, sso_button_selector,
 * sso_provider, mfa_option_id, or sign_in_option_id.
 */
export interface SubmitFieldsRequest {
  /**
   * Map of field name to value
   */
  fields?: { [key: string]: string };

  /**
   * The MFA method type to select (when mfa_options were returned)
   */
  mfa_option_id?: string;

  /**
   * The sign-in option ID to select (when sign_in_options were returned)
   */
  sign_in_option_id?: string;

  /**
   * XPath selector for the SSO button to click (ODA). Use sso_provider instead for
   * CUA.
   */
  sso_button_selector?: string;

  /**
   * SSO provider to click, matching the provider field from pending_sso_buttons
   * (e.g., "google", "github"). Cannot be used with sso_button_selector.
   */
  sso_provider?: string;
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
     * Fields awaiting input (present when flow_step=AWAITING_INPUT; may also be
     * present with AWAITING_EXTERNAL_ACTION as fallback actions).
     */
    discovered_fields?: Array<ManagedAuthStateEvent.DiscoveredField>;

    /**
     * Machine-readable error code (present when flow_status=FAILED).
     */
    error_code?: string;

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
     * MFA method options (present when flow_step=AWAITING_INPUT; may also be present
     * with AWAITING_EXTERNAL_ACTION as fallback actions).
     */
    mfa_options?: Array<ManagedAuthStateEvent.MfaOption>;

    /**
     * SSO buttons available (present when flow_step=AWAITING_INPUT; may also be
     * present with AWAITING_EXTERNAL_ACTION as fallback actions).
     */
    pending_sso_buttons?: Array<ManagedAuthStateEvent.PendingSSOButton>;

    /**
     * URL where the browser landed after successful login.
     */
    post_login_url?: string;

    /**
     * Non-MFA choices presented during the auth flow, such as account selection or org
     * pickers (present when flow_step=AWAITING_INPUT; may also be present with
     * AWAITING_EXTERNAL_ACTION as fallback actions).
     */
    sign_in_options?: Array<ManagedAuthStateEvent.SignInOption>;

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
       * Contextual help text near the field that tells the user what to enter (e.g.,
       * "Enter the phone ending in (**_) _**-\*\*92")
       */
      hint?: string;

      /**
       * If this field is associated with an MFA option, the type of that option (e.g.,
       * password field linked to "Enter password" option)
       */
      linked_mfa_type?: 'sms' | 'call' | 'email' | 'totp' | 'push' | 'password' | 'switch' | null;

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
       * The MFA delivery method type. Includes 'password' for auth method selection
       * pages and 'switch' for generic method-switcher links like "Use another method"
       * that do not name a specific method.
       */
      type: 'sms' | 'call' | 'email' | 'totp' | 'push' | 'password' | 'switch';

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

    /**
     * A non-MFA choice presented during the auth flow (e.g. account selection, org
     * picker)
     */
    export interface SignInOption {
      /**
       * Unique identifier for this option (used to submit selection back)
       */
      id: string;

      /**
       * Display text for the option
       */
      label: string;

      /**
       * Additional context such as email address or org name
       */
      description?: string | null;
    }
  }
}

export interface ConnectionCreateParams {
  /**
   * Domain for authentication
   */
  domain: string;

  /**
   * Name of the profile to manage authentication for. If the profile does not exist,
   * it is created automatically.
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
   * Whether to permit automatic re-authentication when a scheduled health check
   * detects an expired session. This is an opt-in flag only — it does not check
   * whether re-auth is actually feasible. Even when true, re-auth only runs when the
   * system has what it needs to perform it (for example, saved credentials for the
   * required login fields), and only after a scheduled health check detects an
   * expired session — so this flag has no effect when `health_checks` is false. When
   * false, expired sessions are marked as `NEEDS_AUTH` instead of attempting
   * re-auth. Defaults to true.
   */
  auto_reauth?: boolean;

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
   * Whether to enable periodic health checks. When false, the system will not
   * automatically verify authentication status, and `auto_reauth` has no effect on
   * the automatic flow (since re-auth is only triggered by a failed scheduled health
   * check). Defaults to true.
   */
  health_checks?: boolean;

  /**
   * Optional login page URL to skip discovery
   */
  login_url?: string;

  /**
   * Proxy selection. Provide either id or name. The proxy must be in the same
   * project as the resource referencing it. When selecting by name, the name must
   * match exactly one active proxy in the project. Ambiguous names return a 400; use
   * id for stable references.
   */
  proxy?: ConnectionCreateParams.Proxy;

  /**
   * Whether to record browser sessions for this connection by default. Useful for
   * debugging. Can be overridden per-login. Defaults to false.
   */
  record_session?: boolean;

  /**
   * Whether to save credentials after every successful login. Defaults to true.
   * One-time codes (TOTP, SMS, etc.) are not saved.
   */
  save_credentials?: boolean;
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
   * Proxy selection. Provide either id or name. The proxy must be in the same
   * project as the resource referencing it. When selecting by name, the name must
   * match exactly one active proxy in the project. Ambiguous names return a 400; use
   * id for stable references.
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

export interface ConnectionUpdateParams {
  /**
   * Additional domains valid for this auth flow (replaces existing list)
   */
  allowed_domains?: Array<string>;

  /**
   * Whether automatic re-authentication is permitted for this connection. This is an
   * opt-in flag only — it does not check whether re-auth is actually feasible. Even
   * when true, re-auth only runs when the system has what it needs to perform it
   * (for example, saved credentials for the required login fields), and only after a
   * scheduled health check detects an expired session — so this flag has no effect
   * when `health_checks` is false. When false, expired sessions detected by a health
   * check are marked as `NEEDS_AUTH` instead of attempting re-auth.
   */
  auto_reauth?: boolean;

  /**
   * Reference to credentials for the auth connection. Use one of:
   *
   * - { name } for Kernel credentials
   * - { provider, path } for external provider item
   * - { provider, auto: true } for external provider domain lookup
   */
  credential?: ConnectionUpdateParams.Credential;

  /**
   * Interval in seconds between automatic health checks
   */
  health_check_interval?: number;

  /**
   * Whether periodic health checks are enabled. When set to false, the system will
   * not automatically verify authentication status, and `auto_reauth` has no effect
   * on the automatic flow (since re-auth is only triggered by a failed scheduled
   * health check).
   */
  health_checks?: boolean;

  /**
   * Login page URL. Set to empty string to clear.
   */
  login_url?: string;

  /**
   * Proxy selection. Provide either id or name. The proxy must be in the same
   * project as the resource referencing it. When selecting by name, the name must
   * match exactly one active proxy in the project. Ambiguous names return a 400; use
   * id for stable references.
   */
  proxy?: ConnectionUpdateParams.Proxy;

  /**
   * Whether to record browser sessions for this connection by default
   */
  record_session?: boolean;

  /**
   * Whether to save credentials after every successful login
   */
  save_credentials?: boolean;
}

export namespace ConnectionUpdateParams {
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
   * Proxy selection. Provide either id or name. The proxy must be in the same
   * project as the resource referencing it. When selecting by name, the name must
   * match exactly one active proxy in the project. Ambiguous names return a 400; use
   * id for stable references.
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

  /**
   * Search auth connections by ID, domain, or profile name.
   */
  query?: string;
}

export interface ConnectionLoginParams {
  /**
   * Proxy selection. Provide either id or name. The proxy must be in the same
   * project as the resource referencing it. When selecting by name, the name must
   * match exactly one active proxy in the project. Ambiguous names return a 400; use
   * id for stable references.
   */
  proxy?: ConnectionLoginParams.Proxy;

  /**
   * Override the connection's default for recording this login's browser session.
   * When omitted, the connection's record_session default is used.
   */
  record_session?: boolean;
}

export namespace ConnectionLoginParams {
  /**
   * Proxy selection. Provide either id or name. The proxy must be in the same
   * project as the resource referencing it. When selecting by name, the name must
   * match exactly one active proxy in the project. Ambiguous names return a 400; use
   * id for stable references.
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
  fields?: { [key: string]: string };

  /**
   * The MFA method type to select (when mfa_options were returned)
   */
  mfa_option_id?: string;

  /**
   * The sign-in option ID to select (when sign_in_options were returned)
   */
  sign_in_option_id?: string;

  /**
   * XPath selector for the SSO button to click (ODA). Use sso_provider instead for
   * CUA.
   */
  sso_button_selector?: string;

  /**
   * SSO provider to click, matching the provider field from pending_sso_buttons
   * (e.g., "google", "github"). Cannot be used with sso_button_selector.
   */
  sso_provider?: string;
}

export interface ConnectionTimelineParams extends OffsetPaginationParams {
  /**
   * Filter the timeline to a single event type.
   */
  type?: 'login' | 'reauth' | 'health_check';
}

export declare namespace Connections {
  export {
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
