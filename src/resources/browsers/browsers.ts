// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as Shared from '../shared';
import * as ComputerAPI from './computer';
import {
  Computer,
  ComputerBatchParams,
  ComputerCaptureScreenshotParams,
  ComputerClickMouseParams,
  ComputerDragMouseParams,
  ComputerGetMousePositionResponse,
  ComputerMoveMouseParams,
  ComputerPressKeyParams,
  ComputerReadClipboardResponse,
  ComputerScrollParams,
  ComputerSetCursorVisibilityParams,
  ComputerSetCursorVisibilityResponse,
  ComputerTypeTextParams,
  ComputerWriteClipboardParams,
} from './computer';
import * as LogsAPI from './logs';
import { LogStreamParams, Logs } from './logs';
import * as PlaywrightAPI from './playwright';
import { Playwright, PlaywrightExecuteParams, PlaywrightExecuteResponse } from './playwright';
import * as ProcessAPI from './process';
import {
  Process,
  ProcessExecParams,
  ProcessExecResponse,
  ProcessKillParams,
  ProcessKillResponse,
  ProcessResizeParams,
  ProcessResizeResponse,
  ProcessSpawnParams,
  ProcessSpawnResponse,
  ProcessStatusParams,
  ProcessStatusResponse,
  ProcessStdinParams,
  ProcessStdinResponse,
  ProcessStdoutStreamParams,
  ProcessStdoutStreamResponse,
} from './process';
import * as ReplaysAPI from './replays';
import {
  ReplayDownloadParams,
  ReplayListResponse,
  ReplayStartParams,
  ReplayStartResponse,
  ReplayStopParams,
  Replays,
} from './replays';
import * as TelemetryAPI from './telemetry';
import {
  BrowserAPICallEvent,
  BrowserCallStack,
  BrowserCaptchaSolveResultEvent,
  BrowserCdpConnectEvent,
  BrowserCdpDisconnectEvent,
  BrowserConsoleErrorEvent,
  BrowserConsoleLogEvent,
  BrowserEventContext,
  BrowserEventSource,
  BrowserHTTPHeaders,
  BrowserInteractionClickEvent,
  BrowserInteractionKeyEvent,
  BrowserInteractionScrollSettledEvent,
  BrowserLiveViewConnectEvent,
  BrowserLiveViewDisconnectEvent,
  BrowserMonitorDisconnectedEvent,
  BrowserMonitorInitFailedEvent,
  BrowserMonitorReconnectFailedEvent,
  BrowserMonitorReconnectedEvent,
  BrowserMonitorScreenshotEvent,
  BrowserNetworkIdleEvent,
  BrowserNetworkLoadingFailedEvent,
  BrowserNetworkRequestEvent,
  BrowserNetworkResponseEvent,
  BrowserPageDomContentLoadedEvent,
  BrowserPageLayoutSettledEvent,
  BrowserPageLayoutShiftEvent,
  BrowserPageLcpEvent,
  BrowserPageLoadEvent,
  BrowserPageNavigationEvent,
  BrowserPageNavigationSettledEvent,
  BrowserPageTabOpenedEvent,
  BrowserServiceCrashedEvent,
  BrowserSystemOomKillEvent,
  BrowserTelemetryCategoriesConfig,
  BrowserTelemetryCategoryConfig,
  BrowserTelemetryConfig,
  BrowserTelemetryEvent,
  Telemetry as TelemetryAPITelemetry,
  TelemetryStreamParams,
  TelemetryStreamResponse,
} from './telemetry';
import * as FsAPI from './fs/fs';
import {
  FCreateDirectoryParams,
  FDeleteDirectoryParams,
  FDeleteFileParams,
  FDownloadDirZipParams,
  FFileInfoParams,
  FFileInfoResponse,
  FListFilesParams,
  FListFilesResponse,
  FMoveParams,
  FReadFileParams,
  FSetFilePermissionsParams,
  FUploadParams,
  FUploadZipParams,
  FWriteFileParams,
  Fs,
} from './fs/fs';
import { APIPromise } from '../../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../../core/pagination';
import { type Uploadable } from '../../core/uploads';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { multipartFormRequestOptions } from '../../internal/uploads';
import { path } from '../../internal/utils/path';

/**
 * Create and manage browser sessions.
 */
export class Browsers extends APIResource {
  telemetry: TelemetryAPI.Telemetry = new TelemetryAPI.Telemetry(this._client);
  replays: ReplaysAPI.Replays = new ReplaysAPI.Replays(this._client);
  fs: FsAPI.Fs = new FsAPI.Fs(this._client);
  process: ProcessAPI.Process = new ProcessAPI.Process(this._client);
  logs: LogsAPI.Logs = new LogsAPI.Logs(this._client);
  computer: ComputerAPI.Computer = new ComputerAPI.Computer(this._client);
  playwright: PlaywrightAPI.Playwright = new PlaywrightAPI.Playwright(this._client);

  /**
   * Create a new browser session from within an action.
   *
   * @example
   * ```ts
   * const browser = await client.browsers.create();
   * ```
   */
  create(
    body: BrowserCreateParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<BrowserCreateResponse> {
    return this._client.post('/browsers', { body, ...options });
  }

  /**
   * Get information about a browser session.
   *
   * @example
   * ```ts
   * const browser = await client.browsers.retrieve(
   *   'htzv5orfit78e1m2biiifpbv',
   * );
   * ```
   */
  retrieve(
    idOrName: string,
    query: BrowserRetrieveParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<BrowserRetrieveResponse> {
    return this._client.get(path`/browsers/${idOrName}`, { query, ...options });
  }

  /**
   * Update a browser session.
   *
   * @example
   * ```ts
   * const browser = await client.browsers.update(
   *   'htzv5orfit78e1m2biiifpbv',
   * );
   * ```
   */
  update(
    idOrName: string,
    body: BrowserUpdateParams,
    options?: RequestOptions,
  ): APIPromise<BrowserUpdateResponse> {
    return this._client.patch(path`/browsers/${idOrName}`, { body, ...options });
  }

  /**
   * List all browser sessions with pagination support. Use status parameter to
   * filter by session state.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const browserListResponse of client.browsers.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: BrowserListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<BrowserListResponsesOffsetPagination, BrowserListResponse> {
    return this._client.getAPIList('/browsers', OffsetPagination<BrowserListResponse>, { query, ...options });
  }

  /**
   * Sends an HTTP request through Chrome's HTTP request stack, inheriting the
   * browser's TLS fingerprint, cookies, proxy configuration, and headers. Returns a
   * structured JSON response with status, headers, body, and timing.
   *
   * @example
   * ```ts
   * const response = await client.browsers.curl('id', {
   *   url: 'url',
   * });
   * ```
   */
  curl(id: string, body: BrowserCurlParams, options?: RequestOptions): APIPromise<BrowserCurlResponse> {
    return this._client.post(path`/browsers/${id}/curl`, { body, ...options });
  }

  /**
   * Delete a browser session by ID or name
   *
   * @example
   * ```ts
   * await client.browsers.deleteByID(
   *   'htzv5orfit78e1m2biiifpbv',
   * );
   * ```
   */
  deleteByID(idOrName: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/browsers/${idOrName}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Loads one or more unpacked extensions and restarts Chromium on the browser
   * instance.
   *
   * @example
   * ```ts
   * await client.browsers.loadExtensions('id', {
   *   extensions: [
   *     {
   *       name: 'name',
   *       zip_file: fs.createReadStream('path/to/file'),
   *     },
   *   ],
   * });
   * ```
   */
  loadExtensions(id: string, body: BrowserLoadExtensionsParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post(
      path`/browsers/${id}/extensions`,
      multipartFormRequestOptions(
        { body, ...options, headers: buildHeaders([{ Accept: '*/*' }, options?.headers]) },
        this._client,
      ),
    );
  }
}

export type BrowserListResponsesOffsetPagination = OffsetPagination<BrowserListResponse>;

export type ProfilesOffsetPagination = OffsetPagination<Profile>;

/**
 * Browser pool this session was acquired from, if any.
 */
export interface BrowserPoolRef {
  /**
   * Browser pool ID
   */
  id: string;

  /**
   * Browser pool name, if set
   */
  name?: string;
}

/**
 * Session usage metrics.
 */
export interface BrowserUsage {
  /**
   * Time in milliseconds the session was actively running.
   */
  uptime_ms: number;
}

/**
 * Browser profile metadata.
 */
export interface Profile {
  /**
   * Unique identifier for the profile
   */
  id: string;

  /**
   * Timestamp when the profile was created
   */
  created_at: string;

  /**
   * Timestamp when the profile was last used
   */
  last_used_at?: string;

  /**
   * Optional, easier-to-reference name for the profile
   */
  name?: string | null;

  /**
   * Timestamp when the profile was last updated
   */
  updated_at?: string;
}

/**
 * User-defined key-value tags.
 */
export type Tags = { [key: string]: string };

export interface BrowserCreateResponse {
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
  pool?: BrowserPoolRef;

  /**
   * Browser profile metadata.
   */
  profile?: Profile;

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
  tags?: Tags;

  /**
   * Active telemetry configuration for the session, if any.
   */
  telemetry?: TelemetryAPI.BrowserTelemetryConfig | null;

  /**
   * Session usage metrics.
   */
  usage?: BrowserUsage;

  /**
   * Initial browser window size in pixels with optional refresh rate. If omitted,
   * image defaults apply (1920x1080@25). For GPU images, the default is
   * 1920x1080@60. Arbitrary viewport dimensions and refresh rates are accepted.
   * Known-good presets include: 2560x1440@10, 1920x1080@25, 1920x1200@25,
   * 1440x900@25, 1280x800@60, 1024x768@60, 1200x800@60. For GPU images, recommended
   * presets use one of these resolutions with refresh rates 60, 30, 25, or 10:
   * 800x600, 960x720, 1024x576, 1024x768, 1152x648, 1200x800, 1280x720, 1368x768,
   * 1440x900, 1600x900, 1920x1080, 1920x1200, 390x844, 360x250, 768x1024, 800x1600.
   * Viewports outside this list may exhibit unstable live view or recording
   * behavior. If refresh_rate is not provided, it will be automatically determined
   * based on the resolution (higher resolutions use lower refresh rates to keep
   * bandwidth reasonable).
   */
  viewport?: Shared.BrowserViewport;
}

export interface BrowserRetrieveResponse {
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
  pool?: BrowserPoolRef;

  /**
   * Browser profile metadata.
   */
  profile?: Profile;

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
  tags?: Tags;

  /**
   * Active telemetry configuration for the session, if any.
   */
  telemetry?: TelemetryAPI.BrowserTelemetryConfig | null;

  /**
   * Session usage metrics.
   */
  usage?: BrowserUsage;

  /**
   * Initial browser window size in pixels with optional refresh rate. If omitted,
   * image defaults apply (1920x1080@25). For GPU images, the default is
   * 1920x1080@60. Arbitrary viewport dimensions and refresh rates are accepted.
   * Known-good presets include: 2560x1440@10, 1920x1080@25, 1920x1200@25,
   * 1440x900@25, 1280x800@60, 1024x768@60, 1200x800@60. For GPU images, recommended
   * presets use one of these resolutions with refresh rates 60, 30, 25, or 10:
   * 800x600, 960x720, 1024x576, 1024x768, 1152x648, 1200x800, 1280x720, 1368x768,
   * 1440x900, 1600x900, 1920x1080, 1920x1200, 390x844, 360x250, 768x1024, 800x1600.
   * Viewports outside this list may exhibit unstable live view or recording
   * behavior. If refresh_rate is not provided, it will be automatically determined
   * based on the resolution (higher resolutions use lower refresh rates to keep
   * bandwidth reasonable).
   */
  viewport?: Shared.BrowserViewport;
}

export interface BrowserUpdateResponse {
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
  pool?: BrowserPoolRef;

  /**
   * Browser profile metadata.
   */
  profile?: Profile;

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
  tags?: Tags;

  /**
   * Active telemetry configuration for the session, if any.
   */
  telemetry?: TelemetryAPI.BrowserTelemetryConfig | null;

  /**
   * Session usage metrics.
   */
  usage?: BrowserUsage;

  /**
   * Initial browser window size in pixels with optional refresh rate. If omitted,
   * image defaults apply (1920x1080@25). For GPU images, the default is
   * 1920x1080@60. Arbitrary viewport dimensions and refresh rates are accepted.
   * Known-good presets include: 2560x1440@10, 1920x1080@25, 1920x1200@25,
   * 1440x900@25, 1280x800@60, 1024x768@60, 1200x800@60. For GPU images, recommended
   * presets use one of these resolutions with refresh rates 60, 30, 25, or 10:
   * 800x600, 960x720, 1024x576, 1024x768, 1152x648, 1200x800, 1280x720, 1368x768,
   * 1440x900, 1600x900, 1920x1080, 1920x1200, 390x844, 360x250, 768x1024, 800x1600.
   * Viewports outside this list may exhibit unstable live view or recording
   * behavior. If refresh_rate is not provided, it will be automatically determined
   * based on the resolution (higher resolutions use lower refresh rates to keep
   * bandwidth reasonable).
   */
  viewport?: Shared.BrowserViewport;
}

export interface BrowserListResponse {
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
  pool?: BrowserPoolRef;

  /**
   * Browser profile metadata.
   */
  profile?: Profile;

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
  tags?: Tags;

  /**
   * Active telemetry configuration for the session, if any.
   */
  telemetry?: TelemetryAPI.BrowserTelemetryConfig | null;

  /**
   * Session usage metrics.
   */
  usage?: BrowserUsage;

  /**
   * Initial browser window size in pixels with optional refresh rate. If omitted,
   * image defaults apply (1920x1080@25). For GPU images, the default is
   * 1920x1080@60. Arbitrary viewport dimensions and refresh rates are accepted.
   * Known-good presets include: 2560x1440@10, 1920x1080@25, 1920x1200@25,
   * 1440x900@25, 1280x800@60, 1024x768@60, 1200x800@60. For GPU images, recommended
   * presets use one of these resolutions with refresh rates 60, 30, 25, or 10:
   * 800x600, 960x720, 1024x576, 1024x768, 1152x648, 1200x800, 1280x720, 1368x768,
   * 1440x900, 1600x900, 1920x1080, 1920x1200, 390x844, 360x250, 768x1024, 800x1600.
   * Viewports outside this list may exhibit unstable live view or recording
   * behavior. If refresh_rate is not provided, it will be automatically determined
   * based on the resolution (higher resolutions use lower refresh rates to keep
   * bandwidth reasonable).
   */
  viewport?: Shared.BrowserViewport;
}

/**
 * Structured response from the browser curl request.
 */
export interface BrowserCurlResponse {
  /**
   * Response body (UTF-8 string or base64 depending on request).
   */
  body: string;

  /**
   * Total request duration in milliseconds.
   */
  duration_ms: number;

  /**
   * Response headers (multi-value).
   */
  headers: { [key: string]: Array<string> };

  /**
   * HTTP status code from target.
   */
  status: number;
}

export interface BrowserCreateParams {
  /**
   * Custom Chrome enterprise policy overrides applied to this browser session. Keys
   * are Chrome enterprise policy names; values must match their expected types.
   * Blocked: kernel-managed policies (extensions, proxy, CDP/automation). See
   * https://chromeenterprise.google/policies/
   */
  chrome_policy?: { [key: string]: unknown };

  /**
   * List of browser extensions to load into the session. Provide each by id or name.
   */
  extensions?: Array<Shared.BrowserExtension>;

  /**
   * If true, enables GPU acceleration for the browser session. Requires Start-Up or
   * Enterprise plan and headless=false.
   */
  gpu?: boolean;

  /**
   * If true, launches the browser using a headless image (no VNC/GUI). Defaults to
   * false.
   */
  headless?: boolean;

  /**
   * action invocation ID
   */
  invocation_id?: string;

  /**
   * If true, launches the browser in kiosk mode to hide address bar and tabs in live
   * view.
   */
  kiosk_mode?: boolean;

  /**
   * Optional human-readable name for the browser session, used to find it later in
   * the dashboard. Must be unique among active sessions within the project. Set at
   * creation time only.
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
   * Optional URL to open when the browser session is created. Navigation is
   * best-effort, so navigation failures do not prevent the session from being
   * created.
   */
  start_url?: string;

  /**
   * If true, launches the browser in stealth mode to reduce detection by anti-bot
   * mechanisms.
   */
  stealth?: boolean;

  /**
   * Optional user-defined key-value tags for the browser session, used to find and
   * group sessions later. Set at creation time only. Up to 50 pairs.
   */
  tags?: Tags;

  /**
   * Telemetry configuration for the browser session. Set enabled to true to start
   * capture using VM defaults, or provide browser category settings. If omitted,
   * null, set to an empty object ({}), set to enabled: false without browser
   * category settings, or all four categories are explicitly disabled, capture is
   * not started.
   */
  telemetry?: BrowserCreateParams.Telemetry | null;

  /**
   * The number of seconds of inactivity before the browser session is terminated.
   * Activity includes CDP connections and live view connections. Defaults to 60
   * seconds. Minimum allowed is 10 seconds. Maximum allowed is 259200 (72 hours). We
   * check for inactivity every 5 seconds, so the actual timeout behavior you will
   * see is +/- 5 seconds around the specified value.
   */
  timeout_seconds?: number;

  /**
   * Initial browser window size in pixels with optional refresh rate. If omitted,
   * image defaults apply (1920x1080@25). For GPU images, the default is
   * 1920x1080@60. Arbitrary viewport dimensions and refresh rates are accepted.
   * Known-good presets include: 2560x1440@10, 1920x1080@25, 1920x1200@25,
   * 1440x900@25, 1280x800@60, 1024x768@60, 1200x800@60. For GPU images, recommended
   * presets use one of these resolutions with refresh rates 60, 30, 25, or 10:
   * 800x600, 960x720, 1024x576, 1024x768, 1152x648, 1200x800, 1280x720, 1368x768,
   * 1440x900, 1600x900, 1920x1080, 1920x1200, 390x844, 360x250, 768x1024, 800x1600.
   * Viewports outside this list may exhibit unstable live view or recording
   * behavior. If refresh_rate is not provided, it will be automatically determined
   * based on the resolution (higher resolutions use lower refresh rates to keep
   * bandwidth reasonable).
   */
  viewport?: Shared.BrowserViewport;
}

export namespace BrowserCreateParams {
  /**
   * Telemetry configuration for the browser session. Set enabled to true to start
   * capture using VM defaults, or provide browser category settings. If omitted,
   * null, set to an empty object ({}), set to enabled: false without browser
   * category settings, or all four categories are explicitly disabled, capture is
   * not started.
   */
  export interface Telemetry {
    /**
     * Per-category capture flags. Selection is opt-in: only the categories set to
     * enabled=true are captured; anything omitted is off. If enabled is true and
     * browser is omitted or empty, the default category set is used. A browser config
     * that enables nothing stops capture on update and starts no capture on create.
     */
    browser?: TelemetryAPI.BrowserTelemetryCategoriesConfig;

    /**
     * Request shortcut for browser telemetry capture. True enables capture using the
     * default category set unless browser category settings are provided. False stops
     * capture on update and starts no capture on create. enabled=false cannot be
     * combined with browser category settings.
     */
    enabled?: boolean;
  }
}

export interface BrowserRetrieveParams {
  /**
   * When true, includes soft-deleted browser sessions in the lookup.
   */
  include_deleted?: boolean;
}

export interface BrowserUpdateParams {
  /**
   * If true, stealth browsers connect directly instead of using the default stealth
   * proxy.
   */
  disable_default_proxy?: boolean;

  /**
   * Profile to load into the browser session. Only allowed if the session does not
   * already have a profile loaded.
   */
  profile?: Shared.BrowserProfile;

  /**
   * ID of the proxy to use. Omit to leave unchanged, set to empty string to remove
   * proxy.
   */
  proxy_id?: string | null;

  /**
   * Telemetry configuration. Omit, set to null, or set to an empty object ({}) to
   * leave the existing configuration unchanged. Set enabled to true to enable
   * capture using VM defaults. Set enabled to false to stop capture. Provide browser
   * category settings for per-category updates. Explicitly disabling all four
   * categories also stops capture.
   */
  telemetry?: BrowserUpdateParams.Telemetry | null;

  /**
   * Viewport configuration to apply to the browser session.
   */
  viewport?: BrowserUpdateParams.Viewport;
}

export namespace BrowserUpdateParams {
  /**
   * Telemetry configuration. Omit, set to null, or set to an empty object ({}) to
   * leave the existing configuration unchanged. Set enabled to true to enable
   * capture using VM defaults. Set enabled to false to stop capture. Provide browser
   * category settings for per-category updates. Explicitly disabling all four
   * categories also stops capture.
   */
  export interface Telemetry {
    /**
     * Per-category capture flags. Selection is opt-in: only the categories set to
     * enabled=true are captured; anything omitted is off. If enabled is true and
     * browser is omitted or empty, the default category set is used. A browser config
     * that enables nothing stops capture on update and starts no capture on create.
     */
    browser?: TelemetryAPI.BrowserTelemetryCategoriesConfig;

    /**
     * Request shortcut for browser telemetry capture. True enables capture using the
     * default category set unless browser category settings are provided. False stops
     * capture on update and starts no capture on create. enabled=false cannot be
     * combined with browser category settings.
     */
    enabled?: boolean;
  }

  /**
   * Viewport configuration to apply to the browser session.
   */
  export interface Viewport extends Shared.BrowserViewport {
    /**
     * If true, allow the viewport change even when a live view or recording/replay is
     * active. Active recordings will be gracefully stopped and restarted at the new
     * resolution as separate segments. If false (default), the resize is refused when
     * a live view or recording is active.
     */
    force?: boolean;
  }
}

export interface BrowserListParams extends OffsetPaginationParams {
  /**
   * Deprecated: Use status=all instead. When true, includes soft-deleted browser
   * sessions in the results alongside active sessions.
   */
  include_deleted?: boolean;

  /**
   * Search browsers by name, session ID, profile ID, proxy ID, or pool name.
   */
  query?: string;

  /**
   * Filter sessions by status. "active" returns only active sessions (default),
   * "deleted" returns only soft-deleted sessions, "all" returns both.
   */
  status?: 'active' | 'deleted' | 'all';

  /**
   * Filter sessions by tag key-value pairs using deepObject style, e.g.
   * ?tags[team]=backend&tags[env]=staging. Multiple pairs are ANDed: a session must
   * match every supplied pair exactly.
   */
  tags?: { [key: string]: string };
}

export interface BrowserCurlParams {
  /**
   * Target URL (must be http or https).
   */
  url: string;

  /**
   * Request body (for POST/PUT/PATCH).
   */
  body?: string;

  /**
   * Custom headers merged with browser defaults.
   */
  headers?: { [key: string]: string };

  /**
   * HTTP method.
   */
  method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

  /**
   * Encoding for the response body. Use base64 for binary content.
   */
  response_encoding?: 'utf8' | 'base64';

  /**
   * Request timeout in milliseconds.
   */
  timeout_ms?: number;
}

export interface BrowserLoadExtensionsParams {
  /**
   * List of extensions to upload and activate
   */
  extensions: Array<BrowserLoadExtensionsParams.Extension>;
}

export namespace BrowserLoadExtensionsParams {
  export interface Extension {
    /**
     * Folder name to place the extension under /home/kernel/extensions/<name>
     */
    name: string;

    /**
     * Zip archive containing an unpacked Chromium extension (must include
     * manifest.json)
     */
    zip_file: Uploadable;
  }
}

Browsers.Telemetry = TelemetryAPITelemetry;
Browsers.Replays = Replays;
Browsers.Fs = Fs;
Browsers.Process = Process;
Browsers.Logs = Logs;
Browsers.Computer = Computer;
Browsers.Playwright = Playwright;

export declare namespace Browsers {
  export {
    type BrowserPoolRef as BrowserPoolRef,
    type BrowserUsage as BrowserUsage,
    type Profile as Profile,
    type Tags as Tags,
    type BrowserCreateResponse as BrowserCreateResponse,
    type BrowserRetrieveResponse as BrowserRetrieveResponse,
    type BrowserUpdateResponse as BrowserUpdateResponse,
    type BrowserListResponse as BrowserListResponse,
    type BrowserCurlResponse as BrowserCurlResponse,
    type BrowserListResponsesOffsetPagination as BrowserListResponsesOffsetPagination,
    type BrowserCreateParams as BrowserCreateParams,
    type BrowserRetrieveParams as BrowserRetrieveParams,
    type BrowserUpdateParams as BrowserUpdateParams,
    type BrowserListParams as BrowserListParams,
    type BrowserCurlParams as BrowserCurlParams,
    type BrowserLoadExtensionsParams as BrowserLoadExtensionsParams,
  };

  export {
    TelemetryAPITelemetry as Telemetry,
    type BrowserAPICallEvent as BrowserAPICallEvent,
    type BrowserCallStack as BrowserCallStack,
    type BrowserCaptchaSolveResultEvent as BrowserCaptchaSolveResultEvent,
    type BrowserCdpConnectEvent as BrowserCdpConnectEvent,
    type BrowserCdpDisconnectEvent as BrowserCdpDisconnectEvent,
    type BrowserConsoleErrorEvent as BrowserConsoleErrorEvent,
    type BrowserConsoleLogEvent as BrowserConsoleLogEvent,
    type BrowserEventContext as BrowserEventContext,
    type BrowserEventSource as BrowserEventSource,
    type BrowserHTTPHeaders as BrowserHTTPHeaders,
    type BrowserInteractionClickEvent as BrowserInteractionClickEvent,
    type BrowserInteractionKeyEvent as BrowserInteractionKeyEvent,
    type BrowserInteractionScrollSettledEvent as BrowserInteractionScrollSettledEvent,
    type BrowserLiveViewConnectEvent as BrowserLiveViewConnectEvent,
    type BrowserLiveViewDisconnectEvent as BrowserLiveViewDisconnectEvent,
    type BrowserMonitorDisconnectedEvent as BrowserMonitorDisconnectedEvent,
    type BrowserMonitorInitFailedEvent as BrowserMonitorInitFailedEvent,
    type BrowserMonitorReconnectFailedEvent as BrowserMonitorReconnectFailedEvent,
    type BrowserMonitorReconnectedEvent as BrowserMonitorReconnectedEvent,
    type BrowserMonitorScreenshotEvent as BrowserMonitorScreenshotEvent,
    type BrowserNetworkIdleEvent as BrowserNetworkIdleEvent,
    type BrowserNetworkLoadingFailedEvent as BrowserNetworkLoadingFailedEvent,
    type BrowserNetworkRequestEvent as BrowserNetworkRequestEvent,
    type BrowserNetworkResponseEvent as BrowserNetworkResponseEvent,
    type BrowserPageDomContentLoadedEvent as BrowserPageDomContentLoadedEvent,
    type BrowserPageLayoutSettledEvent as BrowserPageLayoutSettledEvent,
    type BrowserPageLayoutShiftEvent as BrowserPageLayoutShiftEvent,
    type BrowserPageLcpEvent as BrowserPageLcpEvent,
    type BrowserPageLoadEvent as BrowserPageLoadEvent,
    type BrowserPageNavigationEvent as BrowserPageNavigationEvent,
    type BrowserPageNavigationSettledEvent as BrowserPageNavigationSettledEvent,
    type BrowserPageTabOpenedEvent as BrowserPageTabOpenedEvent,
    type BrowserServiceCrashedEvent as BrowserServiceCrashedEvent,
    type BrowserSystemOomKillEvent as BrowserSystemOomKillEvent,
    type BrowserTelemetryCategoriesConfig as BrowserTelemetryCategoriesConfig,
    type BrowserTelemetryCategoryConfig as BrowserTelemetryCategoryConfig,
    type BrowserTelemetryConfig as BrowserTelemetryConfig,
    type BrowserTelemetryEvent as BrowserTelemetryEvent,
    type TelemetryStreamResponse as TelemetryStreamResponse,
    type TelemetryStreamParams as TelemetryStreamParams,
  };

  export {
    Replays as Replays,
    type ReplayListResponse as ReplayListResponse,
    type ReplayStartResponse as ReplayStartResponse,
    type ReplayDownloadParams as ReplayDownloadParams,
    type ReplayStartParams as ReplayStartParams,
    type ReplayStopParams as ReplayStopParams,
  };

  export {
    Fs as Fs,
    type FFileInfoResponse as FFileInfoResponse,
    type FListFilesResponse as FListFilesResponse,
    type FCreateDirectoryParams as FCreateDirectoryParams,
    type FDeleteDirectoryParams as FDeleteDirectoryParams,
    type FDeleteFileParams as FDeleteFileParams,
    type FDownloadDirZipParams as FDownloadDirZipParams,
    type FFileInfoParams as FFileInfoParams,
    type FListFilesParams as FListFilesParams,
    type FMoveParams as FMoveParams,
    type FReadFileParams as FReadFileParams,
    type FSetFilePermissionsParams as FSetFilePermissionsParams,
    type FUploadParams as FUploadParams,
    type FUploadZipParams as FUploadZipParams,
    type FWriteFileParams as FWriteFileParams,
  };

  export {
    Process as Process,
    type ProcessExecResponse as ProcessExecResponse,
    type ProcessKillResponse as ProcessKillResponse,
    type ProcessResizeResponse as ProcessResizeResponse,
    type ProcessSpawnResponse as ProcessSpawnResponse,
    type ProcessStatusResponse as ProcessStatusResponse,
    type ProcessStdinResponse as ProcessStdinResponse,
    type ProcessStdoutStreamResponse as ProcessStdoutStreamResponse,
    type ProcessExecParams as ProcessExecParams,
    type ProcessKillParams as ProcessKillParams,
    type ProcessResizeParams as ProcessResizeParams,
    type ProcessSpawnParams as ProcessSpawnParams,
    type ProcessStatusParams as ProcessStatusParams,
    type ProcessStdinParams as ProcessStdinParams,
    type ProcessStdoutStreamParams as ProcessStdoutStreamParams,
  };

  export { Logs as Logs, type LogStreamParams as LogStreamParams };

  export {
    Computer as Computer,
    type ComputerGetMousePositionResponse as ComputerGetMousePositionResponse,
    type ComputerReadClipboardResponse as ComputerReadClipboardResponse,
    type ComputerSetCursorVisibilityResponse as ComputerSetCursorVisibilityResponse,
    type ComputerBatchParams as ComputerBatchParams,
    type ComputerCaptureScreenshotParams as ComputerCaptureScreenshotParams,
    type ComputerClickMouseParams as ComputerClickMouseParams,
    type ComputerDragMouseParams as ComputerDragMouseParams,
    type ComputerMoveMouseParams as ComputerMoveMouseParams,
    type ComputerPressKeyParams as ComputerPressKeyParams,
    type ComputerScrollParams as ComputerScrollParams,
    type ComputerSetCursorVisibilityParams as ComputerSetCursorVisibilityParams,
    type ComputerTypeTextParams as ComputerTypeTextParams,
    type ComputerWriteClipboardParams as ComputerWriteClipboardParams,
  };

  export {
    Playwright as Playwright,
    type PlaywrightExecuteResponse as PlaywrightExecuteResponse,
    type PlaywrightExecuteParams as PlaywrightExecuteParams,
  };
}
