// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as Shared from './shared';
import * as BrowsersAPI from './browsers/browsers';
import { APIPromise } from '../core/api-promise';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class BrowserPools extends APIResource {
  /**
   * Create a new browser pool with the specified configuration and size.
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
   * Updates the configuration used to create browsers in the pool.
   *
   * @example
   * ```ts
   * const browserPool = await client.browserPools.update(
   *   'id_or_name',
   *   { size: 10 },
   * );
   * ```
   */
  update(idOrName: string, body: BrowserPoolUpdateParams, options?: RequestOptions): APIPromise<BrowserPool> {
    return this._client.patch(path`/browser_pools/${idOrName}`, { body, ...options });
  }

  /**
   * List browser pools owned by the caller's organization.
   *
   * @example
   * ```ts
   * const browserPools = await client.browserPools.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<BrowserPoolListResponse> {
    return this._client.get('/browser_pools', options);
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
   * Browser pool name, if set
   */
  name?: string;
}

export namespace BrowserPool {
  /**
   * Configuration used to create all browsers in this pool
   */
  export interface BrowserPoolConfig {
    /**
     * Number of browsers to create in the pool
     */
    size: number;

    /**
     * List of browser extensions to load into the session. Provide each by id or name.
     */
    extensions?: Array<Shared.BrowserExtension>;

    /**
     * Percentage of the pool to fill per minute. Defaults to 10%.
     */
    fill_rate_per_minute?: number;

    /**
     * If true, launches the browser using a headless image. Defaults to false.
     */
    headless?: boolean;

    /**
     * If true, launches the browser in kiosk mode to hide address bar and tabs in live
     * view.
     */
    kiosk_mode?: boolean;

    /**
     * Optional name for the browser pool. Must be unique within the organization.
     */
    name?: string;

    /**
     * Profile selection for the browser session. Provide either id or name. If
     * specified, the matching profile will be loaded into the browser session.
     * Profiles must be created beforehand.
     */
    profile?: Shared.BrowserProfile;

    /**
     * Optional proxy to associate to the browser session. Must reference a proxy
     * belonging to the caller's org.
     */
    proxy_id?: string;

    /**
     * If true, launches the browser in stealth mode to reduce detection by anti-bot
     * mechanisms.
     */
    stealth?: boolean;

    /**
     * Default idle timeout in seconds for browsers acquired from this pool before they
     * are destroyed. Defaults to 600 seconds if not specified
     */
    timeout_seconds?: number;

    /**
     * Initial browser window size in pixels with optional refresh rate. If omitted,
     * image defaults apply (1920x1080@25). Only specific viewport configurations are
     * supported. The server will reject unsupported combinations. Supported
     * resolutions are: 2560x1440@10, 1920x1080@25, 1920x1200@25, 1440x900@25,
     * 1024x768@60, 1200x800@60 If refresh_rate is not provided, it will be
     * automatically determined from the width and height if they match a supported
     * configuration exactly. Note: Higher resolutions may affect the responsiveness of
     * live view browser
     */
    viewport?: Shared.BrowserViewport;
  }
}

export type BrowserPoolListResponse = Array<BrowserPool>;

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
   * Remote URL for live viewing the browser session. Only available for non-headless
   * browsers.
   */
  browser_live_view_url?: string;

  /**
   * When the browser session was soft-deleted. Only present for deleted sessions.
   */
  deleted_at?: string;

  /**
   * Whether the browser session is running in kiosk mode.
   */
  kiosk_mode?: boolean;

  /**
   * @deprecated DEPRECATED: Use timeout_seconds (up to 72 hours) and Profiles
   * instead.
   */
  persistence?: BrowsersAPI.BrowserPersistence;

  /**
   * Browser profile metadata.
   */
  profile?: BrowsersAPI.Profile;

  /**
   * ID of the proxy associated with this browser session, if any.
   */
  proxy_id?: string;

  /**
   * Initial browser window size in pixels with optional refresh rate. If omitted,
   * image defaults apply (1920x1080@25). Only specific viewport configurations are
   * supported. The server will reject unsupported combinations. Supported
   * resolutions are: 2560x1440@10, 1920x1080@25, 1920x1200@25, 1440x900@25,
   * 1024x768@60, 1200x800@60 If refresh_rate is not provided, it will be
   * automatically determined from the width and height if they match a supported
   * configuration exactly. Note: Higher resolutions may affect the responsiveness of
   * live view browser
   */
  viewport?: Shared.BrowserViewport;
}

export interface BrowserPoolCreateParams {
  /**
   * Number of browsers to create in the pool
   */
  size: number;

  /**
   * List of browser extensions to load into the session. Provide each by id or name.
   */
  extensions?: Array<Shared.BrowserExtension>;

  /**
   * Percentage of the pool to fill per minute. Defaults to 10%.
   */
  fill_rate_per_minute?: number;

  /**
   * If true, launches the browser using a headless image. Defaults to false.
   */
  headless?: boolean;

  /**
   * If true, launches the browser in kiosk mode to hide address bar and tabs in live
   * view.
   */
  kiosk_mode?: boolean;

  /**
   * Optional name for the browser pool. Must be unique within the organization.
   */
  name?: string;

  /**
   * Profile selection for the browser session. Provide either id or name. If
   * specified, the matching profile will be loaded into the browser session.
   * Profiles must be created beforehand.
   */
  profile?: Shared.BrowserProfile;

  /**
   * Optional proxy to associate to the browser session. Must reference a proxy
   * belonging to the caller's org.
   */
  proxy_id?: string;

  /**
   * If true, launches the browser in stealth mode to reduce detection by anti-bot
   * mechanisms.
   */
  stealth?: boolean;

  /**
   * Default idle timeout in seconds for browsers acquired from this pool before they
   * are destroyed. Defaults to 600 seconds if not specified
   */
  timeout_seconds?: number;

  /**
   * Initial browser window size in pixels with optional refresh rate. If omitted,
   * image defaults apply (1920x1080@25). Only specific viewport configurations are
   * supported. The server will reject unsupported combinations. Supported
   * resolutions are: 2560x1440@10, 1920x1080@25, 1920x1200@25, 1440x900@25,
   * 1024x768@60, 1200x800@60 If refresh_rate is not provided, it will be
   * automatically determined from the width and height if they match a supported
   * configuration exactly. Note: Higher resolutions may affect the responsiveness of
   * live view browser
   */
  viewport?: Shared.BrowserViewport;
}

export interface BrowserPoolUpdateParams {
  /**
   * Number of browsers to create in the pool
   */
  size: number;

  /**
   * Whether to discard all idle browsers and rebuild the pool immediately. Defaults
   * to false.
   */
  discard_all_idle?: boolean;

  /**
   * List of browser extensions to load into the session. Provide each by id or name.
   */
  extensions?: Array<Shared.BrowserExtension>;

  /**
   * Percentage of the pool to fill per minute. Defaults to 10%.
   */
  fill_rate_per_minute?: number;

  /**
   * If true, launches the browser using a headless image. Defaults to false.
   */
  headless?: boolean;

  /**
   * If true, launches the browser in kiosk mode to hide address bar and tabs in live
   * view.
   */
  kiosk_mode?: boolean;

  /**
   * Optional name for the browser pool. Must be unique within the organization.
   */
  name?: string;

  /**
   * Profile selection for the browser session. Provide either id or name. If
   * specified, the matching profile will be loaded into the browser session.
   * Profiles must be created beforehand.
   */
  profile?: Shared.BrowserProfile;

  /**
   * Optional proxy to associate to the browser session. Must reference a proxy
   * belonging to the caller's org.
   */
  proxy_id?: string;

  /**
   * If true, launches the browser in stealth mode to reduce detection by anti-bot
   * mechanisms.
   */
  stealth?: boolean;

  /**
   * Default idle timeout in seconds for browsers acquired from this pool before they
   * are destroyed. Defaults to 600 seconds if not specified
   */
  timeout_seconds?: number;

  /**
   * Initial browser window size in pixels with optional refresh rate. If omitted,
   * image defaults apply (1920x1080@25). Only specific viewport configurations are
   * supported. The server will reject unsupported combinations. Supported
   * resolutions are: 2560x1440@10, 1920x1080@25, 1920x1200@25, 1440x900@25,
   * 1024x768@60, 1200x800@60 If refresh_rate is not provided, it will be
   * automatically determined from the width and height if they match a supported
   * configuration exactly. Note: Higher resolutions may affect the responsiveness of
   * live view browser
   */
  viewport?: Shared.BrowserViewport;
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
}

export interface BrowserPoolReleaseParams {
  /**
   * Browser session ID to release back to the pool
   */
  session_id: string;

  /**
   * Whether to reuse the browser instance or destroy it and create a new one.
   * Defaults to true.
   */
  reuse?: boolean;
}

export declare namespace BrowserPools {
  export {
    type BrowserPool as BrowserPool,
    type BrowserPoolListResponse as BrowserPoolListResponse,
    type BrowserPoolAcquireResponse as BrowserPoolAcquireResponse,
    type BrowserPoolCreateParams as BrowserPoolCreateParams,
    type BrowserPoolUpdateParams as BrowserPoolUpdateParams,
    type BrowserPoolDeleteParams as BrowserPoolDeleteParams,
    type BrowserPoolAcquireParams as BrowserPoolAcquireParams,
    type BrowserPoolReleaseParams as BrowserPoolReleaseParams,
  };
}
