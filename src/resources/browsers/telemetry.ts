// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as TelemetryAPI from './telemetry';
import { APIPromise } from '../../core/api-promise';
import { Stream } from '../../core/streaming';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Stream live telemetry events from a browser session.
 */
export class Telemetry extends APIResource {
  /**
   * Streams browser telemetry events as a server-sent events (SSE) stream. The
   * stream closes when the browser session terminates. Each event frame includes an
   * id: field containing a monotonically increasing sequence number; pass it as
   * Last-Event-ID on reconnect to resume without gaps. The event: field is never
   * set; all frames carry JSON in the data: field. A keepalive comment frame is sent
   * every 15 seconds when no events arrive. Returns 404 if the browser session does
   * not exist. If telemetry was not enabled on the session, the stream opens but no
   * events are delivered. Fresh connections only see new events; pass replay=all to
   * start from the oldest retained event instead.
   *
   * @example
   * ```ts
   * const response = await client.browsers.telemetry.stream(
   *   'id',
   * );
   * ```
   */
  stream(
    id: string,
    params: TelemetryStreamParams | undefined = {},
    options?: RequestOptions,
  ): APIPromise<Stream<TelemetryStreamResponse>> {
    const { 'Last-Event-ID': lastEventID, ...query } = params ?? {};
    return this._client.get(path`/browsers/${id}/telemetry/stream`, {
      query,
      ...options,
      headers: buildHeaders([
        {
          Accept: 'text/event-stream',
          ...(lastEventID != null ? { 'Last-Event-ID': lastEventID } : undefined),
        },
        options?.headers,
      ]),
      stream: true,
    }) as APIPromise<Stream<TelemetryStreamResponse>>;
  }
}

/**
 * An agent-driven HTTP call handled by the in-VM API server.
 */
export interface BrowserAPICallEvent {
  category: 'control';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'api_call';

  data?: BrowserAPICallEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserAPICallEvent {
  export interface Data {
    /**
     * Wall-clock duration of the handler in milliseconds.
     */
    duration_ms: number;

    /**
     * OpenAPI operationId of the matched route (e.g. processExec, takeScreenshot).
     */
    operation_id: string;

    /**
     * Per-request identifier from the in-VM API request middleware.
     */
    request_id: string;

    /**
     * HTTP response status code.
     */
    status: number;
  }
}

/**
 * CDP Runtime.StackTrace representing the JavaScript call stack at the time of an
 * event. Fields use CDP naming conventions rather than snake_case to match the
 * Chrome DevTools Protocol wire format.
 */
export interface BrowserCallStack {
  /**
   * Ordered list of call frames, outermost first.
   */
  callFrames: Array<BrowserCallStack.CallFrame>;

  /**
   * Optional label for the stack trace (e.g. async cause).
   */
  description?: string;

  /**
   * Parent stack trace for async stacks.
   */
  parent?: BrowserCallStack;
}

export namespace BrowserCallStack {
  export interface CallFrame {
    /**
     * Zero-based column number within the line.
     */
    columnNumber: number;

    /**
     * JavaScript function name, or empty string for anonymous functions.
     */
    functionName: string;

    /**
     * Zero-based line number within the script.
     */
    lineNumber: number;

    /**
     * CDP script identifier.
     */
    scriptId: string;

    /**
     * URL or name of the script file.
     */
    url: string;
  }
}

/**
 * A captcha solve attempt reached a terminal outcome.
 */
export interface BrowserCaptchaSolveResultEvent {
  category: 'captcha';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'captcha_solve_result';

  data?: BrowserCaptchaSolveResultEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserCaptchaSolveResultEvent {
  export interface Data {
    /**
     * Captcha vendor family. Provider-specific task names are normalized into this
     * set; anything not covered is reported as other.
     */
    captcha_type: 'hcaptcha' | 'recaptcha_v2' | 'recaptcha_v3' | 'turnstile' | 'geetest' | 'other';

    /**
     * Wall-clock duration from solve start to terminal outcome.
     */
    duration_ms: number;

    /**
     * Terminal outcome. success: solver returned a usable solution. failure: solver
     * returned an error (see error_code). timeout: solver did not return within the
     * caller's wait budget. abandoned: caller cancelled or the page navigated away
     * mid-solve.
     */
    status: 'success' | 'failure' | 'timeout' | 'abandoned';

    /**
     * Solver-specific error code on failure (e.g. ERROR_CAPTCHA_UNSOLVABLE). Absent on
     * success.
     */
    error_code?: string;

    /**
     * Solver-assigned identifier. Opaque, useful for support cross-references.
     */
    task_id?: string;

    /**
     * Host of the page where the captcha was solved.
     */
    website_host?: string;

    /**
     * Path of the page where the captcha was solved. Query string excluded.
     */
    website_path?: string;
  }
}

/**
 * An external client (e.g. customer SDK, Playwright, Puppeteer) connected to the
 * CDP WebSocket proxy on this VM.
 */
export interface BrowserCdpConnectEvent {
  category: 'connection';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'cdp_connect';

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

/**
 * An external client disconnected from the CDP WebSocket proxy on this VM. Pair
 * with the immediately preceding cdp_connect on the same stream.
 */
export interface BrowserCdpDisconnectEvent {
  category: 'connection';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'cdp_disconnect';

  data?: BrowserCdpDisconnectEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserCdpDisconnectEvent {
  export interface Data {
    /**
     * Wall-clock duration of the connection in milliseconds.
     */
    duration_ms: number;

    /**
     * Number of CDP messages relayed across the connection in either direction.
     */
    message_count: number;

    /**
     * Why the connection ended. client_close: the client initiated the close.
     * upstream_changed: Chromium restarted mid-session and the proxy tore down so the
     * client could reconnect against the new upstream. upstream_error: upstream dial
     * or message pump errored. context_cancelled: the request context was cancelled
     * (typically server shutdown).
     */
    reason: 'client_close' | 'upstream_changed' | 'upstream_error' | 'context_cancelled';
  }
}

/**
 * A browser console error or uncaught JavaScript exception event. Emitted from two
 * distinct CDP sources with different data shapes. Runtime.consoleAPICalled
 * (console.error calls) produces level, text, args, and stack_trace.
 * Runtime.exceptionThrown (uncaught exceptions) produces text, line, column,
 * source_url, and stack_trace. Fields not applicable to the source are absent.
 */
export interface BrowserConsoleErrorEvent {
  category: 'console';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'console_error';

  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  data?: BrowserConsoleErrorEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserConsoleErrorEvent {
  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  export interface Data extends TelemetryAPI.BrowserEventContext {
    /**
     * Error message text. Present in both source paths.
     */
    text: string;

    /**
     * All console arguments coerced to strings. Present only when sourced from
     * Runtime.consoleAPICalled.
     */
    args?: Array<string>;

    /**
     * Column number in the script where the exception was thrown. Present only when
     * sourced from Runtime.exceptionThrown.
     */
    column?: number;

    /**
     * CDP console type value, always "error". Present only when sourced from
     * Runtime.consoleAPICalled.
     */
    level?: string;

    /**
     * Line number in the script where the exception was thrown. Present only when
     * sourced from Runtime.exceptionThrown.
     */
    line?: number;

    /**
     * URL of the script file that threw the exception. Present only when sourced from
     * Runtime.exceptionThrown.
     */
    source_url?: string;

    /**
     * CDP Runtime.StackTrace representing the JavaScript call stack at the time of an
     * event. Fields use CDP naming conventions rather than snake_case to match the
     * Chrome DevTools Protocol wire format.
     */
    stack_trace?: TelemetryAPI.BrowserCallStack;
  }
}

/**
 * A browser console log event (console.log, console.info, console.warn, etc.).
 */
export interface BrowserConsoleLogEvent {
  category: 'console';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'console_log';

  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  data?: BrowserConsoleLogEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserConsoleLogEvent {
  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  export interface Data extends TelemetryAPI.BrowserEventContext {
    /**
     * All console arguments coerced to strings.
     */
    args?: Array<string>;

    /**
     * CDP Runtime.consoleAPICalled type, passed through unfiltered from Chrome. error
     * is routed to console_error events instead; all other CDP console types appear
     * here. See CDP spec for the full enum.
     */
    level?: string;

    /**
     * CDP Runtime.StackTrace representing the JavaScript call stack at the time of an
     * event. Fields use CDP naming conventions rather than snake_case to match the
     * Chrome DevTools Protocol wire format.
     */
    stack_trace?: TelemetryAPI.BrowserCallStack;

    /**
     * First console argument coerced to string.
     */
    text?: string;
  }
}

/**
 * Browser event context stamped by the browser monitor onto all CDP-sourced
 * events. Identifies the target, frame, and navigation epoch in which the event
 * occurred.
 */
export interface BrowserEventContext {
  /**
   * CDP frame identifier within the target.
   */
  frame_id?: string;

  /**
   * CDP document loader identifier, reset on each navigation.
   */
  loader_id?: string;

  /**
   * Monotonically increasing navigation sequence number, incremented on each
   * top-level navigation within the target.
   */
  nav_seq?: number;

  /**
   * CDP session identifier for the target connection.
   */
  session_id?: string;

  /**
   * Browser target identifier (stable across navigations within a tab).
   */
  target_id?: string;

  /**
   * CDP target type of the page that produced the event.
   */
  target_type?: 'page' | 'background_page' | 'service_worker' | 'shared_worker' | 'other';

  /**
   * URL relevant to this event — page URL for navigation and page events, request
   * URL for network events.
   */
  url?: string;
}

/**
 * Provenance metadata identifying which producer emitted the event.
 */
export interface BrowserEventSource {
  /**
   * Event producer. cdp: Chrome DevTools Protocol events from the browser.
   * kernel_api: Kernel API server. extension: injected Chrome extension.
   * local_process: system process running alongside the browser.
   */
  kind: 'cdp' | 'kernel_api' | 'extension' | 'local_process';

  /**
   * Producer-specific event name (e.g. Runtime.consoleAPICalled for CDP-sourced
   * console events, Runtime.exceptionThrown for uncaught exceptions).
   */
  event?: string;

  /**
   * Producer-specific context (e.g. CDP target/session/frame IDs).
   */
  metadata?: { [key: string]: string };
}

/**
 * HTTP headers map forwarded as-is from CDP without normalization. Values are
 * typically strings but may be any JSON type.
 */
export type BrowserHTTPHeaders = { [key: string]: unknown };

/**
 * A browser user click event captured via injected page script.
 */
export interface BrowserInteractionClickEvent {
  category: 'interaction';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'interaction_click';

  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  data?: BrowserInteractionClickEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserInteractionClickEvent {
  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  export interface Data extends TelemetryAPI.BrowserEventContext {
    /**
     * CSS selector path to the clicked element.
     */
    selector?: string;

    /**
     * HTML tag name of the clicked element in uppercase (e.g. BUTTON, A, DIV).
     */
    tag?: string;

    /**
     * Visible text content of the clicked element, trimmed.
     */
    text?: string;

    /**
     * Viewport x-coordinate of the click in CSS pixels.
     */
    x?: number;

    /**
     * Viewport y-coordinate of the click in CSS pixels.
     */
    y?: number;
  }
}

/**
 * A browser keyboard event captured via injected page script.
 */
export interface BrowserInteractionKeyEvent {
  category: 'interaction';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'interaction_key';

  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  data?: BrowserInteractionKeyEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserInteractionKeyEvent {
  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  export interface Data extends TelemetryAPI.BrowserEventContext {
    /**
     * Key value from the KeyboardEvent (e.g. Enter, Backspace, a).
     */
    key?: string;

    /**
     * CSS selector path to the element that had focus when the key was pressed.
     */
    selector?: string;

    /**
     * HTML tag name of the focused element in uppercase (e.g. INPUT, TEXTAREA, DIV).
     */
    tag?: string;
  }
}

/**
 * A browser scroll settled event emitted after scroll position stops changing,
 * captured via injected page script.
 */
export interface BrowserInteractionScrollSettledEvent {
  category: 'interaction';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'interaction_scroll_settled';

  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  data?: BrowserInteractionScrollSettledEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserInteractionScrollSettledEvent {
  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  export interface Data extends TelemetryAPI.BrowserEventContext {
    /**
     * Scroll x-position at the start of the scroll gesture in CSS pixels.
     */
    from_x?: number;

    /**
     * Scroll y-position at the start of the scroll gesture in CSS pixels.
     */
    from_y?: number;

    /**
     * CSS selector path to the scrolled element.
     */
    target_selector?: string;

    /**
     * Final scroll x-position after the gesture settled in CSS pixels.
     */
    to_x?: number;

    /**
     * Final scroll y-position after the gesture settled in CSS pixels.
     */
    to_y?: number;
  }
}

/**
 * A live view client connected to the headful browser's WebRTC server. Headful
 * only; not emitted for headless images.
 */
export interface BrowserLiveViewConnectEvent {
  category: 'connection';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'live_view_connect';

  data?: BrowserLiveViewConnectEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserLiveViewConnectEvent {
  export interface Data {
    /**
     * Live view session identifier. Stable across reconnects, so a transient network
     * blip can emit two events with the same session_id.
     */
    session_id: string;
  }
}

/**
 * A live view client disconnected from the headful browser's WebRTC server. Pair
 * with live_view_connect by session_id.
 */
export interface BrowserLiveViewDisconnectEvent {
  category: 'connection';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'live_view_disconnect';

  data?: BrowserLiveViewDisconnectEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserLiveViewDisconnectEvent {
  export interface Data {
    /**
     * Wall-clock duration of the connection in milliseconds.
     */
    duration_ms: number;

    /**
     * Live view session identifier; matches the corresponding live_view_connect event.
     */
    session_id: string;
  }
}

/**
 * The CDP connection to Chrome was lost. Telemetry events may be dropped until
 * monitor_reconnected arrives. Treat any in-progress computed state (network_idle,
 * page_layout_settled) as unreliable until then.
 */
export interface BrowserMonitorDisconnectedEvent {
  category: 'monitor';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'monitor_disconnected';

  data?: BrowserMonitorDisconnectedEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserMonitorDisconnectedEvent {
  export interface Data {
    /**
     * Reason for the disconnection. chrome_restarted: Chrome process restarted.
     */
    reason?: 'chrome_restarted';
  }
}

/**
 * The CDP session could not be initialized.
 */
export interface BrowserMonitorInitFailedEvent {
  category: 'monitor';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'monitor_init_failed';

  data?: BrowserMonitorInitFailedEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserMonitorInitFailedEvent {
  export interface Data {
    /**
     * The CDP method or initialization step that failed (e.g. Target.setAutoAttach).
     */
    step?: string;
  }
}

/**
 * The CDP connection to Chrome could not be re-established after exhausting all
 * reconnection attempts. No further telemetry events will arrive on this session.
 */
export interface BrowserMonitorReconnectFailedEvent {
  category: 'monitor';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'monitor_reconnect_failed';

  data?: BrowserMonitorReconnectFailedEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserMonitorReconnectFailedEvent {
  export interface Data {
    /**
     * Reason for the reconnection failure. reconnect_exhausted: all retry attempts
     * were used up without successfully restoring the CDP connection.
     */
    reason?: 'reconnect_exhausted';
  }
}

/**
 * The CDP connection to Chrome was successfully re-established after a
 * disconnection. Events emitted during the gap are lost. Computed state is reset,
 * so navigation and network tracking restart fresh from this point.
 */
export interface BrowserMonitorReconnectedEvent {
  category: 'monitor';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'monitor_reconnected';

  data?: BrowserMonitorReconnectedEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserMonitorReconnectedEvent {
  export interface Data {
    /**
     * Wall-clock time in milliseconds taken to reconnect after the disconnection.
     */
    reconnect_duration_ms?: number;
  }
}

/**
 * A periodic screenshot of the browser viewport.
 */
export interface BrowserMonitorScreenshotEvent {
  category: 'screenshot';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'monitor_screenshot';

  data?: BrowserMonitorScreenshotEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserMonitorScreenshotEvent {
  export interface Data {
    /**
     * Base64-encoded PNG screenshot of the browser viewport.
     */
    png?: string;
  }
}

/**
 * A browser network idle event emitted after a 500ms quiet period with no
 * in-flight HTTP requests.
 */
export interface BrowserNetworkIdleEvent {
  category: 'network';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'network_idle';

  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  data?: BrowserEventContext;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

/**
 * A browser network loading failed event. If the request was already in flight
 * when CDP attached (no prior network_request was emitted for it), url, frame_id,
 * loader_id, and resource_type are absent; BrowserEventContext is partially
 * populated in that case.
 */
export interface BrowserNetworkLoadingFailedEvent {
  category: 'network';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'network_loading_failed';

  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  data?: BrowserNetworkLoadingFailedEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserNetworkLoadingFailedEvent {
  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  export interface Data extends TelemetryAPI.BrowserEventContext {
    /**
     * True if the request was canceled by the browser or page script.
     */
    canceled?: boolean;

    /**
     * Network error description (e.g. net::ERR_CONNECTION_REFUSED).
     */
    error_text?: string;

    /**
     * CDP request identifier matching the originating network_request event.
     */
    request_id?: string;

    /**
     * CDP Network.ResourceType for the request, passed through as-is from Chrome.
     * Known values include Document, Fetch, XHR, Script, Stylesheet, Image, Media,
     * Font, TextTrack, EventSource, WebSocket, Manifest, Prefetch, Other, and more.
     */
    resource_type?: string;
  }
}

/**
 * A browser network request sent event.
 */
export interface BrowserNetworkRequestEvent {
  category: 'network';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'network_request';

  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  data?: BrowserNetworkRequestEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserNetworkRequestEvent {
  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  export interface Data extends TelemetryAPI.BrowserEventContext {
    /**
     * URL of the document that initiated the request.
     */
    document_url?: string;

    /**
     * Request headers.
     */
    headers?: TelemetryAPI.BrowserHTTPHeaders;

    /**
     * CDP Initiator.type indicating what caused the request, passed through as-is from
     * Chrome. Known values include script, parser, preload, and other.
     */
    initiator_type?: string;

    /**
     * True if this request is the result of a redirect.
     */
    is_redirect?: boolean;

    /**
     * HTTP method as sent on the wire (e.g. GET, POST).
     */
    method?: string;

    /**
     * Request body for POST/PUT requests, if available.
     */
    post_data?: string;

    /**
     * Original URL before the redirect, present when is_redirect is true.
     */
    redirect_url?: string;

    /**
     * CDP request identifier, unique within the session.
     */
    request_id?: string;

    /**
     * CDP Network.ResourceType for the request, passed through as-is from Chrome.
     * Known values include Document, Fetch, XHR, Script, Stylesheet, Image, Media,
     * Font, TextTrack, EventSource, WebSocket, Manifest, Prefetch, Other, and more.
     */
    resource_type?: string;
  }
}

/**
 * A browser network response received event. Fired after the response body is
 * fully received, not when headers arrive.
 */
export interface BrowserNetworkResponseEvent {
  category: 'network';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'network_response';

  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  data?: BrowserNetworkResponseEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserNetworkResponseEvent {
  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  export interface Data extends TelemetryAPI.BrowserEventContext {
    /**
     * Truncated response body, present only for text MIME types.
     */
    body?: string;

    /**
     * Response headers.
     */
    headers?: TelemetryAPI.BrowserHTTPHeaders;

    /**
     * HTTP method of the original request.
     */
    method?: string;

    /**
     * MIME type of the response (e.g. text/html, application/json).
     */
    mime_type?: string;

    /**
     * CDP request identifier matching the originating network_request event.
     */
    request_id?: string;

    /**
     * CDP Network.ResourceType for the request, passed through as-is from Chrome.
     * Known values include Document, Fetch, XHR, Script, Stylesheet, Image, Media,
     * Font, TextTrack, EventSource, WebSocket, Manifest, Prefetch, Other, and more.
     */
    resource_type?: string;

    /**
     * HTTP response status code.
     */
    status?: number;

    /**
     * HTTP response status text (e.g. OK, Not Found).
     */
    status_text?: string;
  }
}

/**
 * A browser DOMContentLoaded event (CDP Page.domContentEventFired).
 */
export interface BrowserPageDomContentLoadedEvent {
  category: 'page';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'page_dom_content_loaded';

  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  data?: BrowserPageDomContentLoadedEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserPageDomContentLoadedEvent {
  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  export interface Data extends TelemetryAPI.BrowserEventContext {
    /**
     * Chrome monotonic clock value in seconds at which DOMContentLoaded fired,
     * relative to browser process start (not Unix epoch). Use ts for wall-clock time.
     */
    cdp_timestamp?: number;
  }
}

/**
 * A browser layout settled event emitted 1 second after page load with no
 * intervening layout shifts, indicating visual stability. Each layout shift resets
 * the 1-second timer.
 */
export interface BrowserPageLayoutSettledEvent {
  category: 'page';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'page_layout_settled';

  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  data?: BrowserEventContext;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

/**
 * A browser cumulative layout shift (CLS) event from the Performance Timeline API.
 */
export interface BrowserPageLayoutShiftEvent {
  category: 'page';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'page_layout_shift';

  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  data?: BrowserPageLayoutShiftEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserPageLayoutShiftEvent {
  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  export interface Data extends TelemetryAPI.BrowserEventContext {
    /**
     * Duration of the layout shift entry in milliseconds (always 0 for layout shifts
     * per spec).
     */
    duration?: number;

    /**
     * PerformanceLayoutShift attributes from the Performance Timeline entry.
     */
    layout_shift_details?: Data.LayoutShiftDetails;

    /**
     * CDP frame identifier of the frame where the layout shift occurred.
     */
    source_frame_id?: string;

    /**
     * Performance Timeline timestamp of the layout shift in milliseconds.
     */
    time?: number;
  }

  export namespace Data {
    /**
     * PerformanceLayoutShift attributes from the Performance Timeline entry.
     */
    export interface LayoutShiftDetails {
      /**
       * True if the layout shift was preceded by user input within 500ms, excluding it
       * from CLS.
       */
      had_recent_input?: boolean;

      /**
       * Layout shift score for this entry (contribution to CLS).
       */
      value?: number;
    }
  }
}

/**
 * A browser Largest Contentful Paint (LCP) event from the Performance Timeline
 * API.
 */
export interface BrowserPageLcpEvent {
  category: 'page';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'page_lcp';

  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  data?: BrowserPageLcpEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserPageLcpEvent {
  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  export interface Data extends TelemetryAPI.BrowserEventContext {
    /**
     * LargestContentfulPaint attributes from the Performance Timeline entry.
     */
    lcp_details?: Data.LcpDetails;

    /**
     * CDP frame identifier of the frame where the LCP element was rendered.
     */
    source_frame_id?: string;

    /**
     * Performance Timeline timestamp of the LCP entry in milliseconds.
     */
    time?: number;
  }

  export namespace Data {
    /**
     * LargestContentfulPaint attributes from the Performance Timeline entry.
     */
    export interface LcpDetails {
      /**
       * id attribute of the LCP element, if present.
       */
      element_id?: string;

      /**
       * Load time of the LCP element in milliseconds.
       */
      load_time?: number;

      /**
       * CDP DOM node identifier of the LCP element.
       */
      node_id?: number;

      /**
       * Render time of the LCP element in milliseconds; 0 for cross-origin images
       * without Timing-Allow-Origin.
       */
      render_time?: number;

      /**
       * Visible area of the LCP element in pixels squared.
       */
      size?: number;

      /**
       * URL of the LCP element for image or video elements.
       */
      url?: string;
    }
  }
}

/**
 * A browser page load event (CDP Page.loadEventFired).
 */
export interface BrowserPageLoadEvent {
  category: 'page';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'page_load';

  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  data?: BrowserPageLoadEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserPageLoadEvent {
  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  export interface Data extends TelemetryAPI.BrowserEventContext {
    /**
     * Chrome monotonic clock value in seconds at which the load event fired, relative
     * to browser process start (not Unix epoch). Use ts for wall-clock time.
     */
    cdp_timestamp?: number;
  }
}

/**
 * A browser page navigation started event (CDP Page.frameNavigated). Carries nav
 * context fields inline but not nav_seq, as this event resets the navigation
 * epoch.
 */
export interface BrowserPageNavigationEvent {
  category: 'page';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'page_navigation';

  data?: BrowserPageNavigationEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserPageNavigationEvent {
  export interface Data {
    /**
     * CDP frame identifier of the navigated frame.
     */
    frame_id?: string;

    /**
     * New CDP document loader identifier assigned for this navigation.
     */
    loader_id?: string;

    /**
     * Parent frame identifier for subframe navigations; absent for top-level
     * navigations.
     */
    parent_frame_id?: string;

    /**
     * CDP session identifier.
     */
    session_id?: string;

    /**
     * Browser target identifier.
     */
    target_id?: string;

    /**
     * CDP target type of the page that produced the event.
     */
    target_type?: 'page' | 'background_page' | 'service_worker' | 'shared_worker' | 'other';

    /**
     * URL navigated to.
     */
    url?: string;
  }
}

/**
 * Emitted when page_dom_content_loaded and page_layout_settled have both fired for
 * the same navigation, indicating the page is loaded and visually stable.
 * Independent of network_idle; a single pending request does not block it.
 */
export interface BrowserPageNavigationSettledEvent {
  category: 'page';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'page_navigation_settled';

  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  data?: BrowserEventContext;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

/**
 * A new browser tab or target was opened (CDP Target.attachedToTarget for page
 * targets). Fires before a CDP session is attached to the new target, so
 * session_id, frame_id, loader_id, and nav_seq are absent; this event does not
 * compose BrowserEventContext. Consumers reading context fields generically should
 * treat it as a special case.
 */
export interface BrowserPageTabOpenedEvent {
  category: 'page';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'page_tab_opened';

  data?: BrowserPageTabOpenedEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserPageTabOpenedEvent {
  export interface Data {
    /**
     * Target identifier of the tab that opened this one, if any.
     */
    opener_id?: string;

    /**
     * CDP target identifier for the newly opened tab.
     */
    target_id?: string;

    /**
     * CDP target type of the page that produced the event.
     */
    target_type?: 'page' | 'background_page' | 'service_worker' | 'shared_worker' | 'other';

    /**
     * Initial page title of the new tab.
     */
    title?: string;

    /**
     * Initial URL of the new tab.
     */
    url?: string;
  }
}

/**
 * A managed service exited unexpectedly. Intentional stops do not produce this
 * event; only unexpected exits and terminal restart-give-up transitions do.
 */
export interface BrowserServiceCrashedEvent {
  category: 'system';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'service_crashed';

  data?: BrowserServiceCrashedEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserServiceCrashedEvent {
  export interface Data {
    /**
     * Lifecycle phase the crash occurred in. startup: the process died before reaching
     * a healthy running state. running: a previously healthy process died
     * unexpectedly. gave_up: the process manager exhausted its restart attempts and
     * stopped trying.
     */
    phase: 'startup' | 'running' | 'gave_up';

    /**
     * Program name of the crashed service (e.g. chromium, mutter, kernel-images-api).
     */
    service_name: string;

    /**
     * PID of the crashed process. Absent when the process manager gave up after
     * exhausting restart attempts.
     */
    pid?: number;
  }
}

/**
 * The Linux kernel OOM-killer terminated a process inside the VM. Fires for any
 * process killed by the kernel due to memory exhaustion, including Chrome renderer
 * subprocesses that are not supervised.
 */
export interface BrowserSystemOomKillEvent {
  category: 'system';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'system_oom_kill';

  data?: BrowserSystemOomKillEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserSystemOomKillEvent {
  export interface Data {
    /**
     * PID of the killed process.
     */
    pid: number;

    /**
     * Comm of the killed process as reported by the kernel (max 15 chars, truncated by
     * the kernel).
     */
    process_name: string;

    /**
     * Resident set size of the killed process in KiB (sum of anon-rss, file-rss, and
     * shmem-rss).
     */
    rss_kb: number;

    /**
     * Why the kernel decided to OOM-kill. none means global memory exhaustion; memcg
     * means a cgroup memory limit was hit; cpuset / memory_policy are
     * NUMA/policy-driven kills. Absent on kernels older than 5.0.
     */
    constraint?: 'none' | 'memcg' | 'cpuset' | 'memory_policy';

    /**
     * Free system memory in KiB at the time of the kill. Assumes a 4 KiB page size.
     * Does not include reclaimable caches. Absent if the kernel did not emit a
     * parseable Mem-Info section.
     */
    mem_free_kb?: number;

    /**
     * Total system memory in KiB at the time of the kill. Assumes a 4 KiB page size.
     * Absent if the kernel did not emit a parseable Mem-Info section.
     */
    mem_total_kb?: number;

    /**
     * Top processes by resident-set-size at the moment of the kill, sorted descending.
     * Empty if the kernel did not emit the Tasks state table. Capped at 5 entries.
     */
    top_tasks?: Array<Data.TopTask>;

    /**
     * PID of the triggering process. Absent if the kernel did not emit the standard
     * header line.
     */
    trigger_pid?: number;

    /**
     * Comm of the process whose allocation request caused the kernel to invoke the
     * OOM-killer. Often the same as process_name but can differ. Max 15 chars.
     */
    trigger_process_name?: string;
  }

  export namespace Data {
    export interface TopTask {
      /**
       * Comm of the process (max 15 chars, truncated by the kernel).
       */
      name: string;

      /**
       * PID of the process.
       */
      pid: number;

      /**
       * Resident set size in KiB at the moment of the kill.
       */
      rss_kb: number;
    }
  }
}

/**
 * Per-category telemetry capture settings. Selection is opt-in: set a category to
 * enabled=true to capture it; anything omitted is off. The default set (used by
 * enabled=true with no per-category settings) is the lightweight operational
 * signals: control, connection, system, captcha. The CDP categories (console,
 * network, page, interaction) and screenshot are off by default and must be opted
 * into.
 */
export interface BrowserTelemetryCategoriesConfig {
  /**
   * Captcha solve attempt outcomes. On by default.
   */
  captcha?: BrowserTelemetryCategoryConfig;

  /**
   * Client attach/detach lifecycle for the CDP proxy and live view. On by default.
   */
  connection?: BrowserTelemetryCategoryConfig;

  /**
   * Console output (log, warn, error) and uncaught exceptions. CDP category; off by
   * default.
   */
  console?: BrowserTelemetryCategoryConfig;

  /**
   * Agent-driven actions against the browser, such as inbound calls to the in-VM
   * API. On by default.
   */
  control?: BrowserTelemetryCategoryConfig;

  /**
   * User interaction events including clicks, keydowns, and scroll-settled events.
   * CDP category; off by default.
   */
  interaction?: BrowserTelemetryCategoryConfig;

  /**
   * HTTP request and response metadata including URL, method, status code, and
   * timing. Request post data is forwarded as-is from CDP. Text response bodies are
   * truncated at 8 KB for structured types (JSON, XML, form data) and 4 KB for other
   * text types. Binary responses (images, fonts, media) are excluded. CDP category;
   * off by default.
   */
  network?: BrowserTelemetryCategoryConfig;

  /**
   * Page lifecycle events including navigation, DOMContentLoaded, load, layout
   * shifts, and LCP. CDP category; off by default.
   */
  page?: BrowserTelemetryCategoryConfig;

  /**
   * Periodic base64-encoded viewport screenshots. High volume; off by default and
   * must be opted into.
   */
  screenshot?: BrowserTelemetryCategoryConfig;

  /**
   * Browser VM health, such as out-of-memory kills and managed-service crashes. On
   * by default.
   */
  system?: BrowserTelemetryCategoryConfig;
}

/**
 * Per-category telemetry configuration.
 */
export interface BrowserTelemetryCategoryConfig {
  /**
   * Whether this category is captured. Selection is opt-in, so an omitted category
   * is not captured.
   */
  enabled?: boolean;
}

/**
 * Active telemetry configuration for a browser session.
 */
export interface BrowserTelemetryConfig {
  /**
   * Per-category enable/disable flags.
   */
  browser?: BrowserTelemetryCategoriesConfig;
}

/**
 * Union type representing any browser telemetry event. Discriminated on `type`.
 * Each event's `category` determines when it is captured. The CDP collector-health
 * events (monitor_disconnected, monitor_reconnected, monitor_reconnect_failed,
 * monitor_init_failed) use the `monitor` category, which is not user-configurable:
 * it flows automatically whenever any CDP category (console, network, page,
 * interaction) is captured, and is silent otherwise. monitor_screenshot uses the
 * opt-in `screenshot` category. All other event types are controlled by their
 * per-category enable/disable flags.
 */
export type BrowserTelemetryEvent =
  | BrowserConsoleLogEvent
  | BrowserConsoleErrorEvent
  | BrowserNetworkRequestEvent
  | BrowserNetworkResponseEvent
  | BrowserNetworkLoadingFailedEvent
  | BrowserNetworkIdleEvent
  | BrowserPageNavigationEvent
  | BrowserPageDomContentLoadedEvent
  | BrowserPageLoadEvent
  | BrowserPageTabOpenedEvent
  | BrowserPageLayoutShiftEvent
  | BrowserPageLcpEvent
  | BrowserPageLayoutSettledEvent
  | BrowserPageNavigationSettledEvent
  | BrowserInteractionClickEvent
  | BrowserInteractionKeyEvent
  | BrowserInteractionScrollSettledEvent
  | BrowserMonitorScreenshotEvent
  | BrowserMonitorDisconnectedEvent
  | BrowserMonitorReconnectedEvent
  | BrowserMonitorReconnectFailedEvent
  | BrowserMonitorInitFailedEvent
  | BrowserAPICallEvent
  | BrowserCdpConnectEvent
  | BrowserCdpDisconnectEvent
  | BrowserLiveViewConnectEvent
  | BrowserLiveViewDisconnectEvent
  | BrowserCaptchaSolveResultEvent
  | BrowserSystemOomKillEvent
  | BrowserServiceCrashedEvent;

/**
 * Envelope wrapping a browser telemetry event with its monotonic sequence number.
 * Each SSE data: frame carries one envelope as JSON. The seq value is also emitted
 * as the SSE id: field so clients can pass it as Last-Event-ID on reconnect.
 */
export interface TelemetryStreamResponse {
  /**
   * Union type representing any browser telemetry event. Discriminated on `type`.
   * Each event's `category` determines when it is captured. The CDP collector-health
   * events (monitor_disconnected, monitor_reconnected, monitor_reconnect_failed,
   * monitor_init_failed) use the `monitor` category, which is not user-configurable:
   * it flows automatically whenever any CDP category (console, network, page,
   * interaction) is captured, and is silent otherwise. monitor_screenshot uses the
   * opt-in `screenshot` category. All other event types are controlled by their
   * per-category enable/disable flags.
   */
  event: BrowserTelemetryEvent;

  /**
   * Process-monotonic sequence number assigned by the browser VM. Pass as
   * Last-Event-ID on reconnect to resume without gaps. Gaps in received seq values
   * indicate dropped events.
   */
  seq: number;
}

export interface TelemetryStreamParams {
  /**
   * Query param: Pass `all` to start from the oldest retained event instead of only
   * new events; any other value is treated as from-now. The buffer is bounded, so
   * the first event id may be greater than 1 if older events were evicted.
   */
  replay?: string;

  /**
   * Header param: Last event sequence number for SSE reconnection (sent by SSE
   * clients on reconnect). Takes precedence over replay when both are present, so
   * reconnect resumes instead of re-replaying.
   */
  'Last-Event-ID'?: string;
}

export declare namespace Telemetry {
  export {
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
}
