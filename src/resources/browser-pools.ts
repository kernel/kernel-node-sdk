// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as Shared from './shared';
import * as BrowsersAPI from './browsers/browsers';
import * as TelemetryAPI from './browsers/telemetry';
import { APIPromise } from '../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

/**
 * Create and manage browser pools for acquiring and releasing browsers.
 */
export class BrowserPools extends APIResource {
  /**
   * Create a new browser pool with the specified configuration and size. Pooled
   * browsers load their profile read-only: any save_changes on the profile is
   * ignored (not rejected), so pooled browsers never persist changes back to the
   * profile.
   *
   * @example
   * ```ts
   * const browserPool = await client.browserPools.create({
   *   size: 10,
   * });
   * ```
   */
  create(body: BrowserPoolCreateParams, options?: RequestOptions): APIPromise<BrowserPool> {
    return this._client.post('/browser_pools', { body, ...options });
  }

  /**
   * Retrieve details for a single browser pool by its ID or name.
   *
   * @example
   * ```ts
   * const browserPool = await client.browserPools.retrieve(
   *   'id_or_name',
   * );
   * ```
   */
  retrieve(idOrName: string, options?: RequestOptions): APIPromise<BrowserPool> {
    return this._client.get(path`/browser_pools/${idOrName}`, options);
  }

  /**
   * Updates the configuration used to create browsers in the pool. As with creation,
   * save_changes on the pool profile is ignored (not rejected); pooled browsers
   * never persist changes back to the profile. To clear the profile reference, send
   * `profile: { "id": "" }`. Clearing the profile also disables
   * `refresh_on_profile_update`.
   *
   * @example
   * ```ts
   * const browserPool = await client.browserPools.update(
   *   'id_or_name',
   * );
   * ```
   */
  update(idOrName: string, body: BrowserPoolUpdateParams, options?: RequestOptions): APIPromise<BrowserPool> {
    return this._client.patch(path`/browser_pools/${idOrName}`, { body, ...options });
  }

  /**
   * List browser pools in the resolved project.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const browserPool of client.browserPools.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: BrowserPoolListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<BrowserPoolsOffsetPagination, BrowserPool> {
    return this._client.getAPIList('/browser_pools', OffsetPagination<BrowserPool>, { query, ...options });
  }

  /**
   * Delete a browser pool and all browsers in it. By default, deletion is blocked if
   * browsers are currently leased. Use force=true to terminate leased browsers.
   *
   * @example
   * ```ts
   * await client.browserPools.delete('id_or_name');
   * ```
   */
  delete(
    idOrName: string,
    body: BrowserPoolDeleteParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<void> {
    return this._client.delete(path`/browser_pools/${idOrName}`, {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Long-polling endpoint to acquire a browser from the pool. Returns immediately
   * when a browser is available, or returns 204 No Content when the poll times out.
   * The client should retry the request to continue waiting for a browser. The
   * acquired browser will use the pool's timeout_seconds for its idle timeout.
   *
   * @example
   * ```ts
   * const response = await client.browserPools.acquire(
   *   'id_or_name',
   * );
   * ```
   */
  acquire(
    idOrName: string,
    body: BrowserPoolAcquireParams,
    options?: RequestOptions,
  ): APIPromise<BrowserPoolAcquireResponse> {
    return this._client.post(path`/browser_pools/${idOrName}/acquire`, { body, ...options });
  }

  /**
   * Destroys all idle browsers in the pool; leased browsers are not affected.
   *
   * @example
   * ```ts
   * await client.browserPools.flush('id_or_name');
   * ```
   */
  flush(idOrName: string, options?: RequestOptions): APIPromise<void> {
    return this._client.post(path`/browser_pools/${idOrName}/flush`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Release a browser back to the pool, optionally recreating the browser instance.
   *
   * @example
   * ```ts
   * await client.browserPools.release('id_or_name', {
   *   session_id: 'ts8iy3sg25ibheguyni2lg9t',
   * });
   * ```
   */
  release(idOrName: string, body: BrowserPoolReleaseParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post(path`/browser_pools/${idOrName}/release`, {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export type BrowserPoolsOffsetPagination = OffsetPagination<BrowserPool>;

/**
 * A browser pool containing multiple identically configured browsers.
 */
export interface BrowserPool {
  /**
   * Unique identifier for the browser pool
   */
  id: string;

  /**
   * Number of browsers currently acquired from the pool
   */
  acquired_count: number;

  /**
   * Number of browsers currently available in the pool
   */
  available_count: number;

  /**
   * Configuration used to create all browsers in this pool
   */
  browser_pool_config: BrowserPool.BrowserPoolConfig;

  /**
   * Timestamp when the browser pool was created
   */
  created_at: string;

  /**
   * Resolved extension IDs attached to the pool, in configured load order. Empty
   * when no extensions are attached. Authoritative for programmatic consumers; the
   * extensions inside `browser_pool_config` reflect the configured selector (echoed
   * as sent on create).
   */
  extension_ids: Array<string>;

  /**
   * Browser pool name, if set
   */
  name?: string;

  /**
   * Resolved profile ID the pool is attached to. Omitted when no profile is
   * attached. Authoritative for programmatic consumers; the profile inside
   * `browser_pool_config` reflects the configured selector (echoed as sent on
   * create).
   */
  profile_id?: string;
}

export namespace BrowserPool {
  /**
   * Configuration used to create all browsers in this pool
   */
  export interface BrowserPoolConfig {
    /**
     * Number of browsers maintained in the pool. The maximum size is determined by
     * your organization's pooled sessions limit (the sum of all pool sizes cannot
     * exceed your limit).
     */
    size: number;

    /**
     * Custom Chrome enterprise policy overrides applied to all browsers in this pool.
     * Keys are Chrome enterprise policy names; values must match their expected types.
     * Blocked: kernel-managed policies (extensions, proxy, CDP/automation). See
     * https://chromeenterprise.google/policies/ The serialized JSON payload is capped
     * at 5 MiB.
     */
    chrome_policy?: { [key: string]: unknown };

    /**
     * List of browser extensions to load into the session. Provide each by id or name.
     */
    extensions?: Array<Shared.BrowserExtension>;

    /**
     * Percentage of the pool to fill per minute. The cap is 25 for most organizations
     * but can be raised per-organization, so only the lower bound is enforced here.
     */
    fill_rate_per_minute?: number;

    /**
     * If true, launches the browser using a headless image.
     */
    headless?: boolean;

    /**
     * If true, launches the browser in kiosk mode to hide address bar and tabs in live
     * view.
     */
    kiosk_mode?: boolean;

    /**
     * Optional name for the browser pool. Must be unique within the project.
     */
    name?: string;

    /**
     * Profile configuration for browsers in a pool. Provide either id or name.
     * Profiles must be created beforehand. Unlike single browser sessions, pools load
     * the profile read-only and never persist changes back to it, so save_changes is
     * omitted here. Any save_changes value sent on a pool profile is silently ignored
     * rather than rejected.
     */
    profile?: BrowserPoolConfig.Profile;

    /**
     * Optional proxy associated to the browser session. References a proxy in the same
     * project as the browser session.
     */
    proxy_id?: string;

    /**
     * When true, flush idle browsers when the profile the pool uses is updated, so
     * pool browsers pick up the latest profile data. When a profile is provided during
     * creation, this defaults to true. Requires a profile to be set on the pool.
     */
    refresh_on_profile_update?: boolean;

    /**
     * Optional URL to navigate to when a new browser is warmed into the pool.
     * Best-effort: failures to navigate do not fail pool fill. Only applied to
     * newly-warmed browsers; browsers reused via release/acquire keep whatever URL the
     * previous lease left them on. Accepts any URL Chromium can resolve, including
     * chrome:// pages.
     */
    start_url?: string;

    /**
     * If true, launches the browser in stealth mode to reduce detection by anti-bot
     * mechanisms.
     */
    stealth?: boolean;

    /**
     * Default idle timeout in seconds for browsers acquired from this pool before they
     * are destroyed. Minimum 10, maximum 259200 (72 hours).
     */
    timeout_seconds?: number;

    /**
     * Initial browser window size in pixels with optional refresh rate. If omitted,
     * image defaults apply (1920x1080@25). For GPU images, the default is
     * 1920x1080@60. Arbitrary viewport dimensions and refresh rates are accepted.
     * Known-good presets include: 2560x1440@10, 1920x1080@25, 1920x1200@25,
     * 1440x900@25, 1280x800@60, 1024x768@60, 1200x800@60, 768x1024@60, 390x844@60. For
     * GPU images, recommended presets use one of these resolutions with refresh rates
     * 60, 30, 25, or 10: 800x600, 960x720, 1024x576, 1024x768, 1152x648, 1200x800,
     * 1280x720, 1368x768, 1440x900, 1600x900, 1920x1080, 1920x1200, 390x844, 360x250,
     * 768x1024, 800x1600. Viewports outside this list may exhibit unstable live view
     * or recording behavior. If refresh_rate is not provided, it will be automatically
     * determined based on the resolution (higher resolutions use lower refresh rates
     * to keep bandwidth reasonable).
     */
    viewport?: Shared.BrowserViewport;
  }

  export namespace BrowserPoolConfig {
    /**
     * Profile configuration for browsers in a pool. Provide either id or name.
     * Profiles must be created beforehand. Unlike single browser sessions, pools load
     * the profile read-only and never persist changes back to it, so save_changes is
     * omitted here. Any save_changes value sent on a pool profile is silently ignored
     * rather than rejected.
     */
    export interface Profile {
      /**
       * Profile ID to load for browsers in this pool
       */
      id?: string;

      /**
       * Profile name to load for browsers in this pool (instead of id). Must be 1-255
       * characters, using letters, numbers, dots, underscores, or hyphens.
       */
      name?: string;
    }
  }
}

export interface BrowserPoolAcquireResponse {
  /**
   * Websocket URL for Chrome DevTools Protocol connections to the browser session
   */
  cdp_ws_url: string;

  /**
   * When the browser session was created.
   */
  created_at: string;

  /**
   * Whether the browser session is running in headless mode.
   */
  headless: boolean;

  /**
   * Unique identifier for the browser session
   */
  session_id: string;

  /**
   * Whether the browser session is running in stealth mode.
   */
  stealth: boolean;

  /**
   * The number of seconds of inactivity before the browser session is terminated.
   */
  timeout_seconds: number;

  /**
   * Websocket URL for WebDriver BiDi connections to the browser session
   */
  webdriver_ws_url: string;

  /**
   * Metro-API HTTP base URL for this browser session.
   */
  base_url?: string;

  /**
   * Remote URL for live viewing the browser session. Only available for non-headless
   * browsers.
   */
  browser_live_view_url?: string;

  /**
   * Custom Chrome enterprise policy overrides that were applied to this browser
   * session, if any. Echoed back for verification. Keys are Chrome enterprise policy
   * names.
   */
  chrome_policy?: { [key: string]: unknown };

  /**
   * When the browser session was soft-deleted. Only present for deleted sessions.
   */
  deleted_at?: string;

  /**
   * Whether GPU acceleration is enabled for the browser session (only supported for
   * headful sessions).
   */
  gpu?: boolean;

  /**
   * Whether the browser session is running in kiosk mode.
   */
  kiosk_mode?: boolean;

  /**
   * Human-readable name of the browser session, if one was set at creation.
   */
  name?: string;

  /**
   * Browser pool this session was acquired from, if any.
   */
  pool?: BrowsersAPI.BrowserPoolRef;

  /**
   * Browser profile metadata.
   */
  profile?: BrowsersAPI.Profile;

  /**
   * ID of the proxy associated with this browser session, if any.
   */
  proxy_id?: string;

  /**
   * URL the session was asked to navigate to on creation, if any. Recorded for
   * debugging. Navigation is fire-and-forget — the URL is dispatched to the browser
   * without waiting for it to load, and any errors (DNS failure, bad status,
   * timeout) are silently dropped. Captures what was requested, not what the browser
   * actually loaded.
   */
  start_url?: string;

  /**
   * User-defined key-value tags that were set on this browser session, if any.
   * Echoed back when present.
   */
  tags?: BrowsersAPI.Tags;

  /**
   * Active telemetry configuration for the session, if any.
   */
  telemetry?: TelemetryAPI.BrowserTelemetryConfig | null;

  /**
   * Session usage metrics.
   */
  usage?: BrowsersAPI.BrowserUsage;

  /**
   * Initial browser window size in pixels with optional refresh rate. If omitted,
   * image defaults apply (1920x1080@25). For GPU images, the default is
   * 1920x1080@60. Arbitrary viewport dimensions and refresh rates are accepted.
   * Known-good presets include: 2560x1440@10, 1920x1080@25, 1920x1200@25,
   * 1440x900@25, 1280x800@60, 1024x768@60, 1200x800@60, 768x1024@60, 390x844@60. For
   * GPU images, recommended presets use one of these resolutions with refresh rates
   * 60, 30, 25, or 10: 800x600, 960x720, 1024x576, 1024x768, 1152x648, 1200x800,
   * 1280x720, 1368x768, 1440x900, 1600x900, 1920x1080, 1920x1200, 390x844, 360x250,
   * 768x1024, 800x1600. Viewports outside this list may exhibit unstable live view
   * or recording behavior. If refresh_rate is not provided, it will be automatically
   * determined based on the resolution (higher resolutions use lower refresh rates
   * to keep bandwidth reasonable).
   */
  viewport?: Shared.BrowserViewport;
}

export interface BrowserPoolCreateParams {
  /**
   * Number of browsers to maintain in the pool. The maximum size is determined by
   * your organization's pooled sessions limit (the sum of all pool sizes cannot
   * exceed your limit).
   */
  size: number;

  /**
   * Custom Chrome enterprise policy overrides applied to all browsers in this pool.
   * Keys are Chrome enterprise policy names; values must match their expected types.
   * Blocked: kernel-managed policies (extensions, proxy, CDP/automation). See
   * https://chromeenterprise.google/policies/ The serialized JSON payload is capped
   * at 5 MiB.
   */
  chrome_policy?: { [key: string]: unknown };

  /**
   * List of browser extensions to load into the session. Provide each by id or name.
   */
  extensions?: Array<Shared.BrowserExtension>;

  /**
   * Percentage of the pool to fill per minute. Defaults to 10. The cap is 25 for
   * most organizations but can be raised per-organization, so only the lower bound
   * is enforced here.
   */
  fill_rate_per_minute?: number;

  /**
   * If true, launches the browser using a headless image. Defaults to false.
   */
  headless?: boolean;

  /**
   * If true, launches the browser in kiosk mode to hide address bar and tabs in live
   * view. Defaults to false.
   */
  kiosk_mode?: boolean;

  /**
   * Optional name for the browser pool. Must be unique within the project.
   */
  name?: string;

  /**
   * Profile configuration for browsers in a pool. Provide either id or name.
   * Profiles must be created beforehand. Unlike single browser sessions, pools load
   * the profile read-only and never persist changes back to it, so save_changes is
   * omitted here. Any save_changes value sent on a pool profile is silently ignored
   * rather than rejected.
   */
  profile?: BrowserPoolCreateParams.Profile;

  /**
   * Optional proxy to associate to the browser session. Must reference a proxy in
   * the same project as the browser session.
   */
  proxy_id?: string;

  /**
   * When true, flush idle browsers when the profile the pool uses is updated, so
   * pool browsers pick up the latest profile data. When a profile is provided during
   * creation, this defaults to true. Requires a profile to be set on the pool.
   */
  refresh_on_profile_update?: boolean;

  /**
   * Optional URL to navigate to when a new browser is warmed into the pool.
   * Best-effort: failures to navigate do not fail pool fill. Only applied to
   * newly-warmed browsers; browsers reused via release/acquire keep whatever URL the
   * previous lease left them on. Accepts any URL Chromium can resolve, including
   * chrome:// pages.
   */
  start_url?: string;

  /**
   * If true, launches the browser in stealth mode to reduce detection by anti-bot
   * mechanisms. Defaults to false.
   */
  stealth?: boolean;

  /**
   * Default idle timeout in seconds for browsers acquired from this pool before they
   * are destroyed. Defaults to 600 seconds. Minimum 10, maximum 259200 (72 hours).
   */
  timeout_seconds?: number;

  /**
   * Initial browser window size in pixels with optional refresh rate. If omitted,
   * image defaults apply (1920x1080@25). For GPU images, the default is
   * 1920x1080@60. Arbitrary viewport dimensions and refresh rates are accepted.
   * Known-good presets include: 2560x1440@10, 1920x1080@25, 1920x1200@25,
   * 1440x900@25, 1280x800@60, 1024x768@60, 1200x800@60, 768x1024@60, 390x844@60. For
   * GPU images, recommended presets use one of these resolutions with refresh rates
   * 60, 30, 25, or 10: 800x600, 960x720, 1024x576, 1024x768, 1152x648, 1200x800,
   * 1280x720, 1368x768, 1440x900, 1600x900, 1920x1080, 1920x1200, 390x844, 360x250,
   * 768x1024, 800x1600. Viewports outside this list may exhibit unstable live view
   * or recording behavior. If refresh_rate is not provided, it will be automatically
   * determined based on the resolution (higher resolutions use lower refresh rates
   * to keep bandwidth reasonable).
   */
  viewport?: Shared.BrowserViewport;
}

export namespace BrowserPoolCreateParams {
  /**
   * Profile configuration for browsers in a pool. Provide either id or name.
   * Profiles must be created beforehand. Unlike single browser sessions, pools load
   * the profile read-only and never persist changes back to it, so save_changes is
   * omitted here. Any save_changes value sent on a pool profile is silently ignored
   * rather than rejected.
   */
  export interface Profile {
    /**
     * Profile ID to load for browsers in this pool
     */
    id?: string;

    /**
     * Profile name to load for browsers in this pool (instead of id). Must be 1-255
     * characters, using letters, numbers, dots, underscores, or hyphens.
     */
    name?: string;
  }
}

export interface BrowserPoolUpdateParams {
  /**
   * If provided, replaces the custom Chrome enterprise policy overrides applied to
   * all browsers in this pool. Empty object clears any previously-set policy. Keys
   * are Chrome enterprise policy names; values must match their expected types.
   * Blocked: kernel-managed policies (extensions, proxy, CDP/automation). See
   * https://chromeenterprise.google/policies/ The serialized JSON payload is capped
   * at 5 MiB.
   */
  chrome_policy?: { [key: string]: unknown };

  /**
   * Whether to discard all idle browsers and rebuild them immediately with the new
   * configuration. Defaults to false. Only browsers that are idle when the update
   * runs are rebuilt. A browser that is in use during the update keeps its original
   * configuration, and if it is later released with `reuse: true` it returns to the
   * pool with that stale configuration until it is discarded (by this flag on a
   * later update, or by flushing the pool).
   */
  discard_all_idle?: boolean;

  /**
   * If provided, replaces the extension list. Empty array clears all
   * previously-selected extensions. Omit this field to leave extensions unchanged.
   */
  extensions?: Array<Shared.BrowserExtension>;

  /**
   * If provided, replaces the percentage of the pool to fill per minute. The cap is
   * 25 for most organizations but can be raised per-organization, so only the lower
   * bound is enforced here.
   */
  fill_rate_per_minute?: number;

  /**
   * If provided, replaces whether browsers launch using a headless image.
   */
  headless?: boolean;

  /**
   * If provided, replaces whether browsers launch in kiosk mode.
   */
  kiosk_mode?: boolean;

  /**
   * If provided, replaces the pool name. Empty string is a no-op; the pool name
   * cannot be cleared or reset to empty once assigned.
   */
  name?: string;

  /**
   * Profile configuration for browsers in a pool. Provide either id or name.
   * Profiles must be created beforehand. Unlike single browser sessions, pools load
   * the profile read-only and never persist changes back to it, so save_changes is
   * omitted here. Any save_changes value sent on a pool profile is silently ignored
   * rather than rejected.
   */
  profile?: BrowserPoolUpdateParams.Profile;

  /**
   * Empty string clears the previously-selected proxy. Omit this field to leave the
   * proxy unchanged.
   */
  proxy_id?: string;

  /**
   * If provided, replaces whether idle browsers are flushed when the profile the
   * pool uses is updated. When the pool's profile reference is changed (including
   * newly attached) and this field is omitted, it defaults to true. Re-sending the
   * same profile reference leaves this setting unchanged. Clearing the profile also
   * disables this setting. Requires a profile to be set on the pool.
   */
  refresh_on_profile_update?: boolean;

  /**
   * If provided, replaces the number of browsers to maintain in the pool. The
   * maximum size is determined by your organization's pooled sessions limit (the sum
   * of all pool sizes cannot exceed your limit).
   */
  size?: number;

  /**
   * If provided, replaces the URL to navigate to when a new browser is warmed into
   * the pool. Empty string clears the previously-set URL. Omit this field to leave
   * it unchanged.
   */
  start_url?: string;

  /**
   * If provided, replaces whether browsers launch in stealth mode.
   */
  stealth?: boolean;

  /**
   * If provided, replaces the default idle timeout in seconds for browsers acquired
   * from this pool before they are destroyed. Minimum 10, maximum 259200 (72 hours).
   */
  timeout_seconds?: number;

  /**
   * Initial browser window size in pixels with optional refresh rate. If omitted,
   * image defaults apply (1920x1080@25). For GPU images, the default is
   * 1920x1080@60. Arbitrary viewport dimensions and refresh rates are accepted.
   * Known-good presets include: 2560x1440@10, 1920x1080@25, 1920x1200@25,
   * 1440x900@25, 1280x800@60, 1024x768@60, 1200x800@60, 768x1024@60, 390x844@60. For
   * GPU images, recommended presets use one of these resolutions with refresh rates
   * 60, 30, 25, or 10: 800x600, 960x720, 1024x576, 1024x768, 1152x648, 1200x800,
   * 1280x720, 1368x768, 1440x900, 1600x900, 1920x1080, 1920x1200, 390x844, 360x250,
   * 768x1024, 800x1600. Viewports outside this list may exhibit unstable live view
   * or recording behavior. If refresh_rate is not provided, it will be automatically
   * determined based on the resolution (higher resolutions use lower refresh rates
   * to keep bandwidth reasonable).
   */
  viewport?: Shared.BrowserViewport;
}

export namespace BrowserPoolUpdateParams {
  /**
   * Profile configuration for browsers in a pool. Provide either id or name.
   * Profiles must be created beforehand. Unlike single browser sessions, pools load
   * the profile read-only and never persist changes back to it, so save_changes is
   * omitted here. Any save_changes value sent on a pool profile is silently ignored
   * rather than rejected.
   */
  export interface Profile {
    /**
     * Profile ID to load for browsers in this pool
     */
    id?: string;

    /**
     * Profile name to load for browsers in this pool (instead of id). Must be 1-255
     * characters, using letters, numbers, dots, underscores, or hyphens.
     */
    name?: string;
  }
}

export interface BrowserPoolListParams extends OffsetPaginationParams {
  /**
   * Exact-match filter on browser pool name using the database collation. In
   * production, matching is case- and accent-insensitive. During the default-project
   * migration, unscoped requests prefer a concrete default-project browser pool over
   * a legacy unscoped browser pool with the same name.
   */
  name?: string;

  /**
   * Case-insensitive substring match against browser pool name. IDs match by exact
   * value.
   */
  query?: string;
}

export interface BrowserPoolDeleteParams {
  /**
   * If true, force delete even if browsers are currently leased. Leased browsers
   * will be terminated.
   */
  force?: boolean;
}

export interface BrowserPoolAcquireParams {
  /**
   * Maximum number of seconds to wait for a browser to be available. Defaults to the
   * calculated time it would take to fill the pool at the currently configured fill
   * rate.
   */
  acquire_timeout_seconds?: number;

  /**
   * Optional human-readable name for the acquired browser session, used to find it
   * later in the dashboard. Must be unique among active sessions within the pool's
   * project. Applies to this lease only and is cleared when the browser is released
   * back to the pool.
   */
  name?: string;

  /**
   * Optional URL to navigate the acquired browser to. Overrides the pool's start_url
   * for this acquire only. Best-effort: failures to navigate do not fail the
   * acquire.
   */
  start_url?: string;

  /**
   * Optional user-defined key-value tags for the acquired browser session, used to
   * find and group sessions later. Applies to this lease only and are cleared when
   * the browser is released back to the pool. Up to 50 pairs.
   */
  tags?: BrowsersAPI.Tags;
}

export interface BrowserPoolReleaseParams {
  /**
   * Browser session ID to release back to the pool
   */
  session_id: string;

  /**
   * Whether to reuse the browser instance or destroy it and create a new one.
   * Defaults to true. A reused browser keeps the configuration it was created with,
   * so it does not pick up pool configuration changes made while it was in use.
   * Release with `reuse: false`, or flush the pool afterward, to rebuild it with the
   * current configuration.
   */
  reuse?: boolean;
}

export declare namespace BrowserPools {
  export {
    type BrowserPool as BrowserPool,
    type BrowserPoolAcquireResponse as BrowserPoolAcquireResponse,
    type BrowserPoolsOffsetPagination as BrowserPoolsOffsetPagination,
    type BrowserPoolCreateParams as BrowserPoolCreateParams,
    type BrowserPoolUpdateParams as BrowserPoolUpdateParams,
    type BrowserPoolListParams as BrowserPoolListParams,
    type BrowserPoolDeleteParams as BrowserPoolDeleteParams,
    type BrowserPoolAcquireParams as BrowserPoolAcquireParams,
    type BrowserPoolReleaseParams as BrowserPoolReleaseParams,
  };
}
