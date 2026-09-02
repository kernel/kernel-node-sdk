// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { RequestInfo } from '../../internal/builtin-types';
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
  BrowserCaptchaChallengeResultEvent,
  BrowserCaptchaSolveResultEvent,
  BrowserCaptchaSolveStartedEvent,
  BrowserCdpCommandEvent,
  BrowserCdpCommandMethod,
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
  BrowserPageCrashedEvent,
  BrowserPageDomContentLoadedEvent,
  BrowserPageLayoutSettledEvent,
  BrowserPageLayoutShiftEvent,
  BrowserPageLcpEvent,
  BrowserPageLoadEvent,
  BrowserPageNavigationEvent,
  BrowserPageNavigationSettledEvent,
  BrowserPageTabOpenedEvent,
  BrowserPlatformAPICallEvent,
  BrowserProxyErrorEvent,
  BrowserServiceCrashedEvent,
  BrowserSystemOomKillEvent,
  BrowserTelemetryCategoriesConfig,
  BrowserTelemetryCategoryConfig,
  BrowserTelemetryCdpControlConfig,
  BrowserTelemetryConfig,
  BrowserTelemetryControlConfig,
  BrowserTelemetryEvent,
  BrowserTelemetryExportConfig,
  BrowserTelemetryOtlpExportConfig,
  Telemetry as TelemetryAPITelemetry,
  TelemetryEventsParams,
  TelemetryEventsResponse,
  TelemetryEventsResponsesOffsetPagination,
  TelemetryStreamParams,
  TelemetryStreamResponse,
} from './telemetry';
import * as WebmcpAPI from './webmcp';
import {
  InvocationFailure,
  InvocationResult,
  InvokeRequest,
  Tool,
  ToolAnnotations,
  ToolFrame,
  ToolSource,
  ToolsResponse,
  Webmcp,
  WebmcpInvokeToolParams,
} from './webmcp';
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
import { browserFetch, type BrowserFetchInit } from '../../lib/browser-fetch';

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
  webmcp: WebmcpAPI.Webmcp = new WebmcpAPI.Webmcp(this._client);

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
   * const response = await client.browsers.curl(
   *   'htzv5orfit78e1m2biiifpbv',
   *   { url: 'url' },
   * );
   * ```
   */
  curl(idOrName: string, body: BrowserCurlParams, options?: RequestOptions): APIPromise<BrowserCurlResponse> {
    return this._client.post(path`/browsers/${idOrName}/curl`, { body, ...options });
  }

  /**
   * Issues an HTTP request through the browser VM network stack, routing directly
   * to the browser's `base_url` using the shared browser route cache.
   */
  fetch(id: string, input: RequestInfo | URL, init?: BrowserFetchInit): Promise<Response> {
    return browserFetch(this._client, id, input, init);
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
   * Loads one or more unpacked extensions using live CDP activation when eligible.
   * Chromium restarts when enterprise policy requires it or live activation fails.
   *
   * @example
   * ```ts
   * await client.browsers.loadExtensions(
   *   'htzv5orfit78e1m2biiifpbv',
   *   {
   *     extensions: [
   *       {
   *         name: 'name',
   *         zip_file: fs.createReadStream('path/to/file'),
   *       },
   *     ],
   *   },
   * );
   * ```
   */
  loadExtensions(
    idOrName: string,
    body: BrowserLoadExtensionsParams,
    options?: RequestOptions,
  ): APIPromise<void> {
    return this._client.post(
      path`/browsers/${idOrName}/extensions`,
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
 * Memory allocated to the browser session.
 */
export type BrowserMemory = '1GiB' | '2GiB' | '6GiB' | '8GiB' | '16GiB';

/**
 * Memory requested for a headful, non-GPU browser session.
 */
export type BrowserMemoryRequest = '8GiB' | '16GiB';

/**
 * Network configuration for a browser session or browser pool.
 */
export interface BrowserNetworkConfig {
  /**
   * Destinations the browser reaches directly through the session's own network
   * instead of through Kernel-managed egress — for private hosts reachable over a
   * VPN or tunnel the session has joined (e.g. a Tailscale tailnet). By default,
   * private IP ranges already route directly: RFC1918 (10.0.0.0/8, 172.16.0.0/12,
   * 192.168.0.0/16), CGNAT/Tailscale (100.64.0.0/10), and IPv6 ULA (fc00::/7). An
   * explicitly supplied list replaces those defaults with exactly the entries given,
   * and an empty list ([]) disables them so all traffic uses Kernel-managed egress;
   * omit private_hosts to keep the defaults. Entries are hostname patterns
   * ("_.example.ts.net", "preview.internal") or IP/CIDR literals ("100.64.0.0/10",
   * "10.1.30.63"). IP and CIDR entries only match URLs written with a literal IP
   * address; they never match hostnames that resolve into the range, so private DNS
   * names need a hostname entry even when they resolve inside the default ranges.
   * CIDRs must be in canonical masked form (host bits zero), and only the private
   * ranges listed above are accepted; public, loopback, link-local, and unspecified
   * ranges are rejected. Exact IPv6 addresses must be bracketed ("[fd00::1]"); IPv6
   * CIDR ranges are unbracketed ("fd00::/8"). Wildcards are limited to one leading
   * "_." over a suffix with at least two labels that is not a public suffix (so
   * "_.co.uk" or "_.ts.net" are rejected, while "\*.example.ts.net" is accepted).
   * Hostname and IP entries may carry a port; CIDR ranges may not. Hostname entries
   * are not resolved during validation, so callers must ensure they identify private
   * destinations. Not related to a proxy's bypass_hosts, which selects between
   * upstream-proxy and Kernel-managed direct egress and cannot reach into a VPN.
   */
  private_hosts?: Array<string>;
}

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
 * Resolved proxy configuration for a browser session. Selected proxies are
 * returned by stable ID.
 */
export interface BrowserProxy {
  /**
   * Selected proxy ID.
   */
  id?: string;

  /**
   * Proxy egress mode. direct forces no proxy regardless of stealth. default uses
   * the browser's stealth-derived default: Kernel's default stealth proxy when
   * stealth=true, or direct egress when stealth=false. default is primarily useful
   * on browser update to restore the browser default after selected-proxy egress.
   */
  mode?: BrowserProxyMode;

  /**
   * Selected proxy name.
   */
  name?: string;
}

/**
 * Browser proxy configuration. Provide exactly one of mode, id, or name; an empty
 * object is invalid. Set mode to direct for no proxy regardless of stealth. Set
 * mode to default to use the browser's stealth-derived default: Kernel's default
 * stealth proxy when stealth=true, or direct egress when stealth=false. Select id
 * or name to use that proxy regardless of stealth. The selected proxy must be in
 * the same project as the browser. Names must match exactly one active proxy; use
 * id for stable references. Proxy configuration changes only egress and does not
 * change stealth or CAPTCHA solver behavior. A stealth browser using mode=direct
 * still runs in stealth mode with the CAPTCHA solver enabled. When proxy is
 * omitted on browser creation, stealth browsers use Kernel's default stealth proxy
 * and non-stealth browsers use direct egress. When omitted on update, the current
 * configuration is unchanged.
 */
export interface BrowserProxyConfig {
  /**
   * Proxy ID.
   */
  id?: string;

  /**
   * Proxy egress mode. direct forces no proxy regardless of stealth. default uses
   * the browser's stealth-derived default: Kernel's default stealth proxy when
   * stealth=true, or direct egress when stealth=false. default is primarily useful
   * on browser update to restore the browser default after selected-proxy egress.
   */
  mode?: BrowserProxyMode;

  /**
   * Proxy name. Must match exactly one active proxy in the project.
   */
  name?: string;
}

/**
 * Proxy egress mode. direct forces no proxy regardless of stealth. default uses
 * the browser's stealth-derived default: Kernel's default stealth proxy when
 * stealth=true, or direct egress when stealth=false. default is primarily useful
 * on browser update to restore the browser default after selected-proxy egress.
 */
export type BrowserProxyMode = 'direct' | 'default';

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
   * Memory allocated to the browser session.
   */
  memory: BrowserMemory;

  /**
   * Geographic region of the browser session. Fixed once the session is created.
   */
  region: 'us-east' | 'eu-west' | 'ap-southeast';

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
   * Network configuration the session was created with, if any. Omitted when the
   * session has no network configuration.
   */
  network?: BrowserNetworkConfig;

  /**
   * Browser pool this session was acquired from, if any.
   */
  pool?: BrowserPoolRef;

  /**
   * Browser profile metadata.
   */
  profile?: Profile;

  /**
   * Whether changes made during this browser session are saved back to its profile
   * when the session ends. Omitted when no profile is attached.
   */
  profile_save_changes?: boolean;

  /**
   * Resolved proxy configuration for this browser session.
   */
  proxy?: BrowserProxy;

  /**
   * @deprecated ID of the proxy associated with this browser session, if any.
   * Deprecated in favor of proxy.
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
   * Memory allocated to the browser session.
   */
  memory: BrowserMemory;

  /**
   * Geographic region of the browser session. Fixed once the session is created.
   */
  region: 'us-east' | 'eu-west' | 'ap-southeast';

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
   * Network configuration the session was created with, if any. Omitted when the
   * session has no network configuration.
   */
  network?: BrowserNetworkConfig;

  /**
   * Browser pool this session was acquired from, if any.
   */
  pool?: BrowserPoolRef;

  /**
   * Browser profile metadata.
   */
  profile?: Profile;

  /**
   * Whether changes made during this browser session are saved back to its profile
   * when the session ends. Omitted when no profile is attached.
   */
  profile_save_changes?: boolean;

  /**
   * Resolved proxy configuration for this browser session.
   */
  proxy?: BrowserProxy;

  /**
   * @deprecated ID of the proxy associated with this browser session, if any.
   * Deprecated in favor of proxy.
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
   * Memory allocated to the browser session.
   */
  memory: BrowserMemory;

  /**
   * Geographic region of the browser session. Fixed once the session is created.
   */
  region: 'us-east' | 'eu-west' | 'ap-southeast';

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
   * Network configuration the session was created with, if any. Omitted when the
   * session has no network configuration.
   */
  network?: BrowserNetworkConfig;

  /**
   * Browser pool this session was acquired from, if any.
   */
  pool?: BrowserPoolRef;

  /**
   * Browser profile metadata.
   */
  profile?: Profile;

  /**
   * Whether changes made during this browser session are saved back to its profile
   * when the session ends. Omitted when no profile is attached.
   */
  profile_save_changes?: boolean;

  /**
   * Resolved proxy configuration for this browser session.
   */
  proxy?: BrowserProxy;

  /**
   * @deprecated ID of the proxy associated with this browser session, if any.
   * Deprecated in favor of proxy.
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
   * Memory allocated to the browser session.
   */
  memory: BrowserMemory;

  /**
   * Geographic region of the browser session. Fixed once the session is created.
   */
  region: 'us-east' | 'eu-west' | 'ap-southeast';

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
   * Network configuration the session was created with, if any. Omitted when the
   * session has no network configuration.
   */
  network?: BrowserNetworkConfig;

  /**
   * Browser pool this session was acquired from, if any.
   */
  pool?: BrowserPoolRef;

  /**
   * Browser profile metadata.
   */
  profile?: Profile;

  /**
   * Whether changes made during this browser session are saved back to its profile
   * when the session ends. Omitted when no profile is attached.
   */
  profile_save_changes?: boolean;

  /**
   * Resolved proxy configuration for this browser session.
   */
  proxy?: BrowserProxy;

  /**
   * @deprecated ID of the proxy associated with this browser session, if any.
   * Deprecated in favor of proxy.
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
   * Enterprise plan, headless=false, and region=us-east.
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
   * Memory for a headful, non-GPU browser session. Defaults to 8GiB.
   */
  memory?: BrowserMemoryRequest;

  /**
   * Optional human-readable name for the browser session, used to find it later in
   * the dashboard. Must be unique among active sessions within the project. Can be
   * changed later via PATCH /browsers/{id_or_name}.
   */
  name?: string;

  /**
   * Network configuration for the browser session. Cannot be changed after creation.
   */
  network?: BrowserNetworkConfig;

  /**
   * Profile selection for the browser session. Provide either id or name. If
   * specified, the matching profile will be loaded into the browser session.
   * Profiles must be created beforehand.
   */
  profile?: Shared.BrowserProfile;

  /**
   * Proxy configuration for the browser session. Cannot be combined with proxy_id.
   * Omit to use the browser default: stealth browsers use Kernel's default stealth
   * proxy, while non-stealth browsers use direct egress. Set mode to direct to force
   * direct egress regardless of stealth. Set mode to default to explicitly use the
   * browser default: Kernel's default stealth proxy when stealth=true, or direct
   * egress when stealth=false. Select id or name to use that proxy regardless of
   * stealth. Proxy selection does not change stealth or CAPTCHA solver behavior.
   */
  proxy?: BrowserProxyConfig;

  /**
   * @deprecated Optional proxy to associate to the browser session. Must reference a
   * proxy in the same project as the browser session. Deprecated in favor of proxy.
   */
  proxy_id?: string;

  /**
   * Geographic region for the browser session. It is fixed once the session is
   * created. Region selection requires a Start-Up or Enterprise plan, defaults to
   * us-east when omitted on create.
   */
  region?: 'us-east' | 'eu-west' | 'ap-southeast';

  /**
   * Optional URL to open when the browser session is created. Navigation is
   * best-effort, so navigation failures do not prevent the session from being
   * created.
   */
  start_url?: string;

  /**
   * If true, launches the browser in stealth mode and enables the CAPTCHA solver.
   * Defaults to false. When proxy is omitted, stealth browsers use Kernel's default
   * stealth proxy and non-stealth browsers use direct egress. An explicit proxy
   * configuration changes only egress; it does not enable or disable stealth or the
   * CAPTCHA solver.
   */
  stealth?: boolean;

  /**
   * Optional user-defined key-value tags for the browser session, used to find and
   * group sessions later. Can be changed later via PATCH /browsers/{id_or_name}. Up
   * to 50 pairs.
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
     * Per-category capture flags. The operational categories (control, connection,
     * system, captcha) are captured whenever telemetry is enabled; set one to
     * enabled=false to opt out. The CDP categories (console, network, page,
     * interaction), screenshot and platform are off by default; set enabled=true to
     * opt in. On create, provided categories layer onto the default set. On update,
     * provided categories merge onto the session's current config; when no telemetry
     * is active this falls back to the default set (matching create). If browser is
     * omitted or empty, the default set is used. A browser config that disables every
     * category stops capture on update and starts no capture on create.
     */
    browser?: TelemetryAPI.BrowserTelemetryCategoriesConfig;

    /**
     * Request shortcut for browser telemetry capture. True enables capture; with no
     * browser category settings it captures the default set (control, connection,
     * system, captcha), and any browser category settings are layered onto that
     * default set. On update, enabled=true resolves the config fresh from the default
     * set plus any provided categories, replacing the session's current selection
     * rather than merging onto it; omit enabled to merge categories onto the current
     * selection instead. False stops capture on update and starts no capture on
     * create. enabled=false cannot be combined with browser category settings.
     */
    enabled?: boolean;

    /**
     * Where to export this session's captured telemetry. Omit to capture without
     * exporting.
     */
    export?: Telemetry.Export;
  }

  export namespace Telemetry {
    /**
     * Where to export this session's captured telemetry. Omit to capture without
     * exporting.
     */
    export interface Export {
      /**
       * Export captured telemetry over OTLP to one of the org's configured destinations.
       */
      otlp?: Export.Otlp;
    }

    export namespace Export {
      /**
       * Export captured telemetry over OTLP to one of the org's configured destinations.
       */
      export interface Otlp {
        /**
         * OTLP destination to export this session's captured telemetry to. Provide either
         * id or name. Requires telemetry capture to be enabled.
         */
        destination?: Otlp.Destination;

        /**
         * Whether to export captured telemetry over OTLP. Setting destination implies
         * enabled=true, so this only needs to be set explicitly to disable export
         * (enabled=false with a destination is rejected).
         */
        enabled?: boolean;
      }

      export namespace Otlp {
        /**
         * OTLP destination to export this session's captured telemetry to. Provide either
         * id or name. Requires telemetry capture to be enabled.
         */
        export interface Destination {
          /**
           * OTLP destination ID
           */
          id?: string;

          /**
           * OTLP destination name
           */
          name?: string;
        }
      }
    }
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
   * @deprecated If true, stealth browsers connect directly instead of using the
   * default stealth proxy. Deprecated in favor of proxy.mode.
   */
  disable_default_proxy?: boolean;

  /**
   * Human-readable name for the browser session. Omit to leave unchanged, set to an
   * empty string to clear the name. When set, must be unique among active sessions
   * within the project.
   */
  name?: string | null;

  /**
   * Profile to load into the browser session. Only allowed if the session does not
   * already have a profile loaded.
   */
  profile?: Shared.BrowserProfile;

  /**
   * Proxy configuration to apply. Omit to leave the current configuration unchanged.
   * Cannot be combined with proxy_id or disable_default_proxy. Set mode to direct to
   * switch to direct egress regardless of stealth. Set mode to default to restore
   * the browser default after using a selected proxy: Kernel's default stealth proxy
   * for a stealth browser, or direct egress for a non-stealth browser. Updating
   * proxy does not change stealth or CAPTCHA solver behavior.
   */
  proxy?: BrowserProxyConfig;

  /**
   * @deprecated ID of the proxy to use. Omit to leave unchanged, set to empty string
   * to remove proxy. Deprecated in favor of proxy.
   */
  proxy_id?: string | null;

  /**
   * User-defined key-value tags for the browser session. Omit to leave unchanged.
   * Provide a map to replace the entire tag set (full replace, not a merge). Set to
   * an empty object ({}) to clear all tags. Up to 50 pairs.
   */
  tags?: Tags | null;

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
     * Per-category capture flags. The operational categories (control, connection,
     * system, captcha) are captured whenever telemetry is enabled; set one to
     * enabled=false to opt out. The CDP categories (console, network, page,
     * interaction), screenshot and platform are off by default; set enabled=true to
     * opt in. On create, provided categories layer onto the default set. On update,
     * provided categories merge onto the session's current config; when no telemetry
     * is active this falls back to the default set (matching create). If browser is
     * omitted or empty, the default set is used. A browser config that disables every
     * category stops capture on update and starts no capture on create.
     */
    browser?: TelemetryAPI.BrowserTelemetryCategoriesConfig;

    /**
     * Request shortcut for browser telemetry capture. True enables capture; with no
     * browser category settings it captures the default set (control, connection,
     * system, captcha), and any browser category settings are layered onto that
     * default set. On update, enabled=true resolves the config fresh from the default
     * set plus any provided categories, replacing the session's current selection
     * rather than merging onto it; omit enabled to merge categories onto the current
     * selection instead. False stops capture on update and starts no capture on
     * create. enabled=false cannot be combined with browser category settings.
     */
    enabled?: boolean;

    /**
     * Where to export this session's captured telemetry. Omit to capture without
     * exporting.
     */
    export?: Telemetry.Export;
  }

  export namespace Telemetry {
    /**
     * Where to export this session's captured telemetry. Omit to capture without
     * exporting.
     */
    export interface Export {
      /**
       * Export captured telemetry over OTLP to one of the org's configured destinations.
       */
      otlp?: Export.Otlp;
    }

    export namespace Export {
      /**
       * Export captured telemetry over OTLP to one of the org's configured destinations.
       */
      export interface Otlp {
        /**
         * OTLP destination to export this session's captured telemetry to. Provide either
         * id or name. Requires telemetry capture to be enabled.
         */
        destination?: Otlp.Destination;

        /**
         * Whether to export captured telemetry over OTLP. Setting destination implies
         * enabled=true, so this only needs to be set explicitly to disable export
         * (enabled=false with a destination is rejected).
         */
        enabled?: boolean;
      }

      export namespace Otlp {
        /**
         * OTLP destination to export this session's captured telemetry to. Provide either
         * id or name. Requires telemetry capture to be enabled.
         */
        export interface Destination {
          /**
           * OTLP destination ID
           */
          id?: string;

          /**
           * OTLP destination name
           */
          name?: string;
        }
      }
    }
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
   * Search browsers by name, session ID, profile name or ID, proxy ID, or pool name.
   */
  query?: string;

  /**
   * Filter sessions by geographic region. Omit to list sessions in all regions.
   */
  region?: 'us-east' | 'eu-west' | 'ap-southeast';

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
Browsers.Webmcp = Webmcp;

export declare namespace Browsers {
  export {
    type BrowserMemory as BrowserMemory,
    type BrowserMemoryRequest as BrowserMemoryRequest,
    type BrowserNetworkConfig as BrowserNetworkConfig,
    type BrowserPoolRef as BrowserPoolRef,
    type BrowserProxy as BrowserProxy,
    type BrowserProxyConfig as BrowserProxyConfig,
    type BrowserProxyMode as BrowserProxyMode,
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
    type BrowserCaptchaChallengeResultEvent as BrowserCaptchaChallengeResultEvent,
    type BrowserCaptchaSolveResultEvent as BrowserCaptchaSolveResultEvent,
    type BrowserCaptchaSolveStartedEvent as BrowserCaptchaSolveStartedEvent,
    type BrowserCdpCommandEvent as BrowserCdpCommandEvent,
    type BrowserCdpCommandMethod as BrowserCdpCommandMethod,
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
    type BrowserPageCrashedEvent as BrowserPageCrashedEvent,
    type BrowserPageDomContentLoadedEvent as BrowserPageDomContentLoadedEvent,
    type BrowserPageLayoutSettledEvent as BrowserPageLayoutSettledEvent,
    type BrowserPageLayoutShiftEvent as BrowserPageLayoutShiftEvent,
    type BrowserPageLcpEvent as BrowserPageLcpEvent,
    type BrowserPageLoadEvent as BrowserPageLoadEvent,
    type BrowserPageNavigationEvent as BrowserPageNavigationEvent,
    type BrowserPageNavigationSettledEvent as BrowserPageNavigationSettledEvent,
    type BrowserPageTabOpenedEvent as BrowserPageTabOpenedEvent,
    type BrowserPlatformAPICallEvent as BrowserPlatformAPICallEvent,
    type BrowserProxyErrorEvent as BrowserProxyErrorEvent,
    type BrowserServiceCrashedEvent as BrowserServiceCrashedEvent,
    type BrowserSystemOomKillEvent as BrowserSystemOomKillEvent,
    type BrowserTelemetryCategoriesConfig as BrowserTelemetryCategoriesConfig,
    type BrowserTelemetryCategoryConfig as BrowserTelemetryCategoryConfig,
    type BrowserTelemetryCdpControlConfig as BrowserTelemetryCdpControlConfig,
    type BrowserTelemetryConfig as BrowserTelemetryConfig,
    type BrowserTelemetryControlConfig as BrowserTelemetryControlConfig,
    type BrowserTelemetryEvent as BrowserTelemetryEvent,
    type BrowserTelemetryExportConfig as BrowserTelemetryExportConfig,
    type BrowserTelemetryOtlpExportConfig as BrowserTelemetryOtlpExportConfig,
    type TelemetryEventsResponse as TelemetryEventsResponse,
    type TelemetryStreamResponse as TelemetryStreamResponse,
    type TelemetryEventsResponsesOffsetPagination as TelemetryEventsResponsesOffsetPagination,
    type TelemetryEventsParams as TelemetryEventsParams,
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

  export {
    Webmcp as Webmcp,
    type InvocationFailure as InvocationFailure,
    type InvocationResult as InvocationResult,
    type InvokeRequest as InvokeRequest,
    type Tool as Tool,
    type ToolAnnotations as ToolAnnotations,
    type ToolFrame as ToolFrame,
    type ToolSource as ToolSource,
    type ToolsResponse as ToolsResponse,
    type WebmcpInvokeToolParams as WebmcpInvokeToolParams,
  };
}
