// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as TelemetryAPI from './telemetry';
import { APIPromise } from '../../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../../core/pagination';
import { Stream } from '../../core/streaming';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Stream live telemetry events from a browser session, and manage the destinations sessions export them to.
 */
export class Telemetry extends APIResource {
  /**
   * Reads a page of telemetry events for the browser session. To page through
   * results, pass the X-Next-Offset value from the previous response as offset and
   * repeat while X-Has-More is true. Returns an empty list when telemetry data is
   * unavailable.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const telemetryEventsResponse of client.browsers.telemetry.events(
   *   'id',
   * )) {
   *   // ...
   * }
   * ```
   */
  events(
    id: string,
    query: TelemetryEventsParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<TelemetryEventsResponsesOffsetPagination, TelemetryEventsResponse> {
    return this._client.getAPIList(
      path`/browsers/${id}/telemetry/events`,
      OffsetPagination<TelemetryEventsResponse>,
      { query, ...options },
    );
  }

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

export type TelemetryEventsResponsesOffsetPagination = OffsetPagination<TelemetryEventsResponse>;

/**
 * An agent-driven HTTP call that drives the browser, handled by the in-VM API
 * server. Calls that manage the VM instead emit platform_api_call.
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
     * Matched route's operation, named as the in-VM API names its handler (e.g.
     * ProcessExec, TakeScreenshot).
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

    /**
     * Source submitted to the Playwright code-execution endpoint, capped at 8192 bytes
     * like every other captured string. A capped value is cut on a character boundary
     * and ends in `...[truncated]`. Absent for every other operation.
     */
    code?: string;
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
 * A browser-control command a client sent over the CDP WebSocket proxy: input
 * gestures, navigation, dialog handling, file selection and screenshots.
 * Configuration commands and the DOM/Runtime traffic a client library issues on
 * the caller's behalf are not reported. One event per browser-control command that
 * reached the browser. The command stream is not sampled, coalesced or reordered.
 * An event is lost only when the method is excluded by telemetry configuration,
 * when the command's arguments do not decode, or when classification cannot keep
 * up. Exclusions are counted in `cdp_disconnect.telemetry_excluded`; the rest in
 * `cdp_disconnect.telemetry_dropped`.
 */
export interface BrowserCdpCommandEvent {
  category: 'control';

  /**
   * Per-command payload for `cdp_command` events, discriminated by `method`. Each
   * variant carries only the arguments approved for that command: values that could
   * hold a secret — typed and composition text, URLs, referrers, scripts, templates,
   * file paths, drag contents and autofill values — are replaced by a length, a
   * count, a presence flag, an enum or a URL scheme and host.
   */
  data:
    | BrowserCdpCommandEvent.BrowserCdpInputDispatchMouseEventCommandData
    | BrowserCdpCommandEvent.BrowserCdpInputDispatchKeyEventCommandData
    | BrowserCdpCommandEvent.BrowserCdpInputInsertTextCommandData
    | BrowserCdpCommandEvent.BrowserCdpInputImeSetCompositionCommandData
    | BrowserCdpCommandEvent.BrowserCdpInputDispatchTouchEventCommandData
    | BrowserCdpCommandEvent.BrowserCdpInputDispatchDragEventCommandData
    | BrowserCdpCommandEvent.BrowserCdpInputCancelDraggingCommandData
    | BrowserCdpCommandEvent.BrowserCdpInputEmulateTouchFromMouseEventCommandData
    | BrowserCdpCommandEvent.BrowserCdpInputSynthesizePinchGestureCommandData
    | BrowserCdpCommandEvent.BrowserCdpInputSynthesizeScrollGestureCommandData
    | BrowserCdpCommandEvent.BrowserCdpInputSynthesizeTapGestureCommandData
    | BrowserCdpCommandEvent.BrowserCdpDomSetFileInputFilesCommandData
    | BrowserCdpCommandEvent.BrowserCdpDomFocusCommandData
    | BrowserCdpCommandEvent.BrowserCdpDomScrollIntoViewIfNeededCommandData
    | BrowserCdpCommandEvent.BrowserCdpPageBringToFrontCommandData
    | BrowserCdpCommandEvent.BrowserCdpPageCaptureScreenshotCommandData
    | BrowserCdpCommandEvent.BrowserCdpPageCaptureSnapshotCommandData
    | BrowserCdpCommandEvent.BrowserCdpPageHandleJavaScriptDialogCommandData
    | BrowserCdpCommandEvent.BrowserCdpPageNavigateCommandData
    | BrowserCdpCommandEvent.BrowserCdpPageNavigateToHistoryEntryCommandData
    | BrowserCdpCommandEvent.BrowserCdpPageReloadCommandData
    | BrowserCdpCommandEvent.BrowserCdpPagePrintToPdfCommandData
    | BrowserCdpCommandEvent.BrowserCdpPageStartScreencastCommandData
    | BrowserCdpCommandEvent.BrowserCdpPageStopScreencastCommandData
    | BrowserCdpCommandEvent.BrowserCdpPageStopLoadingCommandData
    | BrowserCdpCommandEvent.BrowserCdpPageCloseCommandData
    | BrowserCdpCommandEvent.BrowserCdpPageSetWebLifecycleStateCommandData
    | BrowserCdpCommandEvent.BrowserCdpTargetActivateTargetCommandData
    | BrowserCdpCommandEvent.BrowserCdpTargetCloseTargetCommandData
    | BrowserCdpCommandEvent.BrowserCdpTargetCreateTargetCommandData
    | BrowserCdpCommandEvent.BrowserCdpTargetCreateBrowserContextCommandData
    | BrowserCdpCommandEvent.BrowserCdpTargetDisposeBrowserContextCommandData
    | BrowserCdpCommandEvent.BrowserCdpTargetOpenDevToolsCommandData
    | BrowserCdpCommandEvent.BrowserCdpBrowserCancelDownloadCommandData
    | BrowserCdpCommandEvent.BrowserCdpBrowserCloseCommandData
    | BrowserCdpCommandEvent.BrowserCdpBrowserSetWindowBoundsCommandData
    | BrowserCdpCommandEvent.BrowserCdpBrowserSetContentsSizeCommandData
    | BrowserCdpCommandEvent.BrowserCdpAutofillTriggerCommandData;

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'cdp_command';

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserCdpCommandEvent {
  /**
   * Sanitized `Input.dispatchMouseEvent` arguments. Canonical input:
   * `Input.dispatchMouseEvent` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpInputDispatchMouseEventCommandData {
    /**
     * Mouse event phase: `mousePressed`, `mouseReleased`, `mouseMoved` or
     * `mouseWheel`. A value the protocol does not define is reported as `other`.
     */
    event_type: 'mousePressed' | 'mouseReleased' | 'mouseMoved' | 'mouseWheel' | 'other';

    method: 'Input.dispatchMouseEvent';

    /**
     * Button named by the command (`none`, `left`, `middle`, `right`, `back`,
     * `forward`). A value the protocol does not define is reported as `other`.
     */
    button?: 'none' | 'left' | 'middle' | 'right' | 'back' | 'forward' | 'other';

    /**
     * Bit field of buttons held down. Non-zero on a `mouseMoved` means the move is a
     * drag path.
     */
    buttons?: number;

    /**
     * Number of times the button was clicked (2 is a double click).
     */
    click_count?: number;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Horizontal scroll delta, for `mouseWheel`.
     */
    delta_x?: number;

    /**
     * Vertical scroll delta, for `mouseWheel`.
     */
    delta_y?: number;

    /**
     * Normalized pressure, 0 to 1.
     */
    force?: number;

    /**
     * Bit field of held modifier keys (1=Alt, 2=Ctrl, 4=Meta, 8=Shift).
     */
    modifiers?: number;

    /**
     * Pointer that generated the event (`mouse` or `pen`). A value the protocol does
     * not define is reported as `other`.
     */
    pointer_type?: 'mouse' | 'pen' | 'other';

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;

    /**
     * Normalized tangential pressure, -1 to 1.
     */
    tangential_pressure?: number;

    /**
     * Pen tilt from the Y-Z plane, in degrees.
     */
    tilt_x?: number;

    /**
     * Pen tilt from the X-Z plane, in degrees.
     */
    tilt_y?: number;

    /**
     * Pen clockwise rotation, in degrees.
     */
    twist?: number;

    /**
     * Viewport x coordinate in CSS pixels.
     */
    x?: number;

    /**
     * Viewport y coordinate in CSS pixels.
     */
    y?: number;
  }

  /**
   * Sanitized `Input.dispatchKeyEvent` arguments. Canonical input:
   * `Input.dispatchKeyEvent` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpInputDispatchKeyEventCommandData {
    /**
     * Key event phase: `keyDown`, `keyUp`, `rawKeyDown` or `char`. A value the
     * protocol does not define is reported as `other`.
     */
    event_type: 'keyDown' | 'keyUp' | 'rawKeyDown' | 'char' | 'other';

    method: 'Input.dispatchKeyEvent';

    /**
     * Whether the event was generated by key repeat.
     */
    auto_repeat?: boolean;

    /**
     * Number of editing commands (e.g. `selectAll`) carried by the event.
     */
    command_count?: number;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Whether the key is on the numeric keypad.
     */
    is_keypad?: boolean;

    /**
     * Whether the event is a system key event.
     */
    is_system_key?: boolean;

    /**
     * Keyboard location (1=left, 2=right, 3=numpad).
     */
    location?: number;

    /**
     * Bit field of held modifier keys (1=Alt, 2=Ctrl, 4=Meta, 8=Shift).
     */
    modifiers?: number;

    /**
     * Key that commands the page rather than typing into it (e.g. `Enter`, `Tab`,
     * `ArrowDown`, `F5`). Keys that produce a character are never captured; those are
     * counted by `text_length`.
     */
    named_key?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;

    /**
     * Number of characters the command submitted. The text itself is never captured.
     */
    text_length?: number;
  }

  /**
   * Sanitized `Input.insertText` arguments. Canonical input: `Input.insertText` in
   * devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpInputInsertTextCommandData {
    method: 'Input.insertText';

    /**
     * Number of characters inserted. The text itself is never captured.
     */
    text_length: number;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Input.imeSetComposition` arguments. Canonical input:
   * `Input.imeSetComposition` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpInputImeSetCompositionCommandData {
    method: 'Input.imeSetComposition';

    /**
     * Number of characters in the composition. The text itself is never captured.
     */
    text_length: number;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Replacement range end offset.
     */
    replacement_end?: number;

    /**
     * Replacement range start offset.
     */
    replacement_start?: number;

    /**
     * Selection end offset within the composition.
     */
    selection_end?: number;

    /**
     * Selection start offset within the composition.
     */
    selection_start?: number;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Input.dispatchTouchEvent` arguments. Canonical input:
   * `Input.dispatchTouchEvent` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpInputDispatchTouchEventCommandData {
    /**
     * Touch event phase: `touchStart`, `touchEnd`, `touchMove` or `touchCancel`. A
     * value the protocol does not define is reported as `other`.
     */
    event_type: 'touchStart' | 'touchEnd' | 'touchMove' | 'touchCancel' | 'other';

    method: 'Input.dispatchTouchEvent';

    /**
     * Number of active touch points the command carried.
     */
    touch_point_count: number;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Normalized pressure of the first touch point, 0 to 1.
     */
    force?: number;

    /**
     * Bit field of held modifier keys (1=Alt, 2=Ctrl, 4=Meta, 8=Shift).
     */
    modifiers?: number;

    /**
     * Horizontal radius of the first touch point.
     */
    radius_x?: number;

    /**
     * Vertical radius of the first touch point.
     */
    radius_y?: number;

    /**
     * Rotation of the first touch point, in degrees.
     */
    rotation_angle?: number;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;

    /**
     * Normalized tangential pressure of the first touch point, -1 to 1.
     */
    tangential_pressure?: number;

    /**
     * Tilt of the first touch point from the Y-Z plane, in degrees.
     */
    tilt_x?: number;

    /**
     * Tilt of the first touch point from the X-Z plane, in degrees.
     */
    tilt_y?: number;

    /**
     * Clockwise rotation of the first touch point, in degrees.
     */
    twist?: number;

    /**
     * Viewport x coordinate of the first touch point. Touch coordinates live inside
     * `touchPoints`, so this is the primary point rather than a command-level
     * argument.
     */
    x?: number;

    /**
     * Viewport y coordinate of the first touch point.
     */
    y?: number;
  }

  /**
   * Sanitized `Input.dispatchDragEvent` arguments. Canonical input:
   * `Input.dispatchDragEvent` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpInputDispatchDragEventCommandData {
    /**
     * Drag event phase: `dragEnter`, `dragOver`, `drop` or `dragCancel`. A value the
     * protocol does not define is reported as `other`.
     */
    event_type: 'dragEnter' | 'dragOver' | 'drop' | 'dragCancel' | 'other';

    method: 'Input.dispatchDragEvent';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Number of files in the drag payload. File paths are never captured.
     */
    drag_file_count?: number;

    /**
     * Number of items in the drag payload. Item contents are never captured.
     */
    drag_item_count?: number;

    /**
     * Distinct top-level MIME categories of the drag items (e.g. `text`, `image`,
     * `application`). Subtypes and contents are never captured. A value the protocol
     * does not define is reported as `other`.
     */
    drag_mime_categories?: Array<
      | 'text'
      | 'image'
      | 'audio'
      | 'video'
      | 'application'
      | 'font'
      | 'model'
      | 'multipart'
      | 'message'
      | 'other'
    >;

    /**
     * Bit field of allowed drag operations (1=copy, 2=link, 16=move).
     */
    drag_operations_mask?: number;

    /**
     * Bit field of held modifier keys (1=Alt, 2=Ctrl, 4=Meta, 8=Shift).
     */
    modifiers?: number;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;

    /**
     * Viewport x coordinate in CSS pixels.
     */
    x?: number;

    /**
     * Viewport y coordinate in CSS pixels.
     */
    y?: number;
  }

  /**
   * Sanitized `Input.cancelDragging` arguments. Canonical input:
   * `Input.cancelDragging` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpInputCancelDraggingCommandData {
    method: 'Input.cancelDragging';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Input.emulateTouchFromMouseEvent` arguments. Canonical input:
   * `Input.emulateTouchFromMouseEvent` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpInputEmulateTouchFromMouseEventCommandData {
    /**
     * Mouse event phase being emulated as touch. A value the protocol does not define
     * is reported as `other`.
     */
    event_type: 'mousePressed' | 'mouseReleased' | 'mouseMoved' | 'mouseWheel' | 'other';

    method: 'Input.emulateTouchFromMouseEvent';

    /**
     * Button named by the command. A value the protocol does not define is reported as
     * `other`.
     */
    button?: 'none' | 'left' | 'middle' | 'right' | 'back' | 'forward' | 'other';

    /**
     * Number of times the button was clicked.
     */
    click_count?: number;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Horizontal scroll delta.
     */
    delta_x?: number;

    /**
     * Vertical scroll delta.
     */
    delta_y?: number;

    /**
     * Bit field of held modifier keys (1=Alt, 2=Ctrl, 4=Meta, 8=Shift).
     */
    modifiers?: number;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;

    /**
     * Viewport x coordinate in CSS pixels.
     */
    x?: number;

    /**
     * Viewport y coordinate in CSS pixels.
     */
    y?: number;
  }

  /**
   * Sanitized `Input.synthesizePinchGesture` arguments. Canonical input:
   * `Input.synthesizePinchGesture` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpInputSynthesizePinchGestureCommandData {
    method: 'Input.synthesizePinchGesture';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Input source the synthesized gesture emulates. A value the protocol does not
     * define is reported as `other`.
     */
    gesture_source_type?: 'default' | 'touch' | 'mouse' | 'other';

    /**
     * Relative pointer speed, in pixels per second.
     */
    relative_speed?: number;

    /**
     * Relative scale of the pinch (>1 zooms in).
     */
    scale_factor?: number;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;

    /**
     * Viewport x coordinate in CSS pixels.
     */
    x?: number;

    /**
     * Viewport y coordinate in CSS pixels.
     */
    y?: number;
  }

  /**
   * Sanitized `Input.synthesizeScrollGesture` arguments. Canonical input:
   * `Input.synthesizeScrollGesture` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpInputSynthesizeScrollGestureCommandData {
    method: 'Input.synthesizeScrollGesture';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Input source the synthesized gesture emulates. A value the protocol does not
     * define is reported as `other`.
     */
    gesture_source_type?: 'default' | 'touch' | 'mouse' | 'other';

    /**
     * Whether fling was suppressed.
     */
    prevent_fling?: boolean;

    /**
     * Number of additional repeats of the scroll.
     */
    repeat_count?: number;

    /**
     * Delay between repeats, in milliseconds.
     */
    repeat_delay_ms?: number;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;

    /**
     * Swipe speed in pixels per second.
     */
    speed?: number;

    /**
     * Viewport x coordinate in CSS pixels.
     */
    x?: number;

    /**
     * Horizontal scroll distance in CSS pixels; positive scrolls left.
     */
    x_distance?: number;

    /**
     * Additional horizontal distance scrolled past the end.
     */
    x_overscroll?: number;

    /**
     * Viewport y coordinate in CSS pixels.
     */
    y?: number;

    /**
     * Vertical scroll distance in CSS pixels; positive scrolls up.
     */
    y_distance?: number;

    /**
     * Additional vertical distance scrolled past the end.
     */
    y_overscroll?: number;
  }

  /**
   * Sanitized `Input.synthesizeTapGesture` arguments. Canonical input:
   * `Input.synthesizeTapGesture` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpInputSynthesizeTapGestureCommandData {
    method: 'Input.synthesizeTapGesture';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Duration between touchdown and touchup, in milliseconds.
     */
    duration?: number;

    /**
     * Input source the synthesized gesture emulates. A value the protocol does not
     * define is reported as `other`.
     */
    gesture_source_type?: 'default' | 'touch' | 'mouse' | 'other';

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;

    /**
     * Number of times to tap (2 is a double tap).
     */
    tap_count?: number;

    /**
     * Viewport x coordinate in CSS pixels.
     */
    x?: number;

    /**
     * Viewport y coordinate in CSS pixels.
     */
    y?: number;
  }

  /**
   * Sanitized `DOM.setFileInputFiles` arguments. Canonical input:
   * `DOM.setFileInputFiles` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpDomSetFileInputFilesCommandData {
    /**
     * Number of files handed to the input. File paths are never captured.
     */
    file_count: number;

    method: 'DOM.setFileInputFiles';

    /**
     * Opaque backend DOM node identifier the command targeted.
     */
    backend_node_id?: number;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Opaque DOM node identifier the command targeted.
     */
    node_id?: number;

    /**
     * Opaque Runtime remote object identifier the command targeted. Clipped to 128
     * characters; a longer value is not a real identifier.
     */
    object_id?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `DOM.focus` arguments. Canonical input: `DOM.focus` in
   * devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpDomFocusCommandData {
    method: 'DOM.focus';

    /**
     * Opaque backend DOM node identifier the command targeted.
     */
    backend_node_id?: number;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Opaque DOM node identifier the command targeted.
     */
    node_id?: number;

    /**
     * Opaque Runtime remote object identifier the command targeted. Clipped to 128
     * characters; a longer value is not a real identifier.
     */
    object_id?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `DOM.scrollIntoViewIfNeeded` arguments. Canonical input:
   * `DOM.scrollIntoViewIfNeeded` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpDomScrollIntoViewIfNeededCommandData {
    method: 'DOM.scrollIntoViewIfNeeded';

    /**
     * Opaque backend DOM node identifier the command targeted.
     */
    backend_node_id?: number;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Opaque DOM node identifier the command targeted.
     */
    node_id?: number;

    /**
     * Opaque Runtime remote object identifier the command targeted. Clipped to 128
     * characters; a longer value is not a real identifier.
     */
    object_id?: string;

    /**
     * Height of the rect the command scrolled to.
     */
    rect_height?: number;

    /**
     * Width of the rect the command scrolled to.
     */
    rect_width?: number;

    /**
     * X offset of the rect the command scrolled to, relative to the node.
     */
    rect_x?: number;

    /**
     * Y offset of the rect the command scrolled to, relative to the node.
     */
    rect_y?: number;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Page.bringToFront` arguments. Canonical input: `Page.bringToFront` in
   * devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpPageBringToFrontCommandData {
    method: 'Page.bringToFront';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Page.captureScreenshot` arguments. Canonical input:
   * `Page.captureScreenshot` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpPageCaptureScreenshotCommandData {
    method: 'Page.captureScreenshot';

    /**
     * Whether the capture extended past the viewport.
     */
    capture_beyond_viewport?: boolean;

    /**
     * Clip region height in CSS pixels.
     */
    clip_height?: number;

    /**
     * Clip region page scale factor.
     */
    clip_scale?: number;

    /**
     * Clip region width in CSS pixels.
     */
    clip_width?: number;

    /**
     * Clip region x offset in CSS pixels.
     */
    clip_x?: number;

    /**
     * Clip region y offset in CSS pixels.
     */
    clip_y?: number;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Image format requested (`jpeg`, `png` or `webp`). A value the protocol does not
     * define is reported as `other`.
     */
    format?: 'jpeg' | 'png' | 'webp' | 'other';

    /**
     * Whether the capture was taken from the surface rather than the view.
     */
    from_surface?: boolean;

    /**
     * Whether encoding favored speed over size.
     */
    optimize_for_speed?: boolean;

    /**
     * Compression quality, 0 to 100, for lossy formats.
     */
    quality?: number;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Page.captureSnapshot` arguments. Canonical input:
   * `Page.captureSnapshot` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpPageCaptureSnapshotCommandData {
    method: 'Page.captureSnapshot';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Snapshot format requested (`mhtml`). A value the protocol does not define is
     * reported as `other`.
     */
    format?: 'mhtml' | 'other';

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Page.handleJavaScriptDialog` arguments. Canonical input:
   * `Page.handleJavaScriptDialog` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpPageHandleJavaScriptDialogCommandData {
    /**
     * Whether the dialog was accepted or dismissed.
     */
    accept: boolean;

    method: 'Page.handleJavaScriptDialog';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Number of characters entered into a prompt dialog. The text itself is never
     * captured.
     */
    prompt_text_length?: number;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Page.navigate` arguments. Canonical input: `Page.navigate` in
   * devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpPageNavigateCommandData {
    method: 'Page.navigate';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Opaque frame identifier. Clipped to 128 characters; a longer value is not a real
     * identifier.
     */
    frame_id?: string;

    /**
     * Referrer policy named by the command. A value the protocol does not define is
     * reported as `other`.
     */
    referrer_policy?:
      | 'noReferrer'
      | 'noReferrerWhenDowngrade'
      | 'origin'
      | 'originWhenCrossOrigin'
      | 'sameOrigin'
      | 'strictOrigin'
      | 'strictOriginWhenCrossOrigin'
      | 'unsafeUrl'
      | 'other';

    /**
     * Whether the command carried a referrer. The referrer itself is never captured.
     */
    referrer_present?: boolean;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;

    /**
     * Navigation reason reported by the caller (e.g. `link`, `typed`, `reload`). A
     * value the protocol does not define is reported as `other`.
     */
    transition_type?:
      | 'link'
      | 'typed'
      | 'address_bar'
      | 'auto_bookmark'
      | 'auto_subframe'
      | 'manual_subframe'
      | 'generated'
      | 'auto_toplevel'
      | 'form_submit'
      | 'reload'
      | 'keyword'
      | 'keyword_generated'
      | 'other';

    /**
     * Scheme of the destination URL (e.g. `https`, `about`, `data`). The rest of the
     * URL is never captured.
     */
    url_scheme?: string;
  }

  /**
   * Sanitized `Page.navigateToHistoryEntry` arguments. Canonical input:
   * `Page.navigateToHistoryEntry` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpPageNavigateToHistoryEntryCommandData {
    /**
     * History entry the command navigated to.
     */
    entry_id: number;

    method: 'Page.navigateToHistoryEntry';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Page.reload` arguments. Canonical input: `Page.reload` in
   * devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpPageReloadCommandData {
    method: 'Page.reload';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Whether the reload bypassed the cache.
     */
    ignore_cache?: boolean;

    /**
     * Opaque document loader identifier. Clipped to 128 characters; a longer value is
     * not a real identifier.
     */
    loader_id?: string;

    /**
     * Number of characters in the injected script.
     */
    script_length?: number;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Page.printToPDF` arguments. Canonical input: `Page.printToPDF` in
   * devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpPagePrintToPdfCommandData {
    method: 'Page.printToPDF';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Whether a header and footer were rendered.
     */
    display_header_footer?: boolean;

    /**
     * Whether a footer template was supplied. The template itself is never captured.
     */
    footer_template_present?: boolean;

    /**
     * Whether a document outline was embedded.
     */
    generate_document_outline?: boolean;

    /**
     * Whether a tagged (accessible) PDF was requested.
     */
    generate_tagged_pdf?: boolean;

    /**
     * Whether a header template was supplied. The template itself is never captured.
     */
    header_template_present?: boolean;

    /**
     * Whether the page was laid out in landscape.
     */
    landscape?: boolean;

    /**
     * Bottom margin in inches.
     */
    margin_bottom?: number;

    /**
     * Left margin in inches.
     */
    margin_left?: number;

    /**
     * Right margin in inches.
     */
    margin_right?: number;

    /**
     * Top margin in inches.
     */
    margin_top?: number;

    /**
     * Whether a page range was supplied.
     */
    page_ranges_present?: boolean;

    /**
     * Paper height in inches.
     */
    paper_height?: number;

    /**
     * Paper width in inches.
     */
    paper_width?: number;

    /**
     * Whether the CSS page size was preferred over the paper size.
     */
    prefer_css_page_size?: boolean;

    /**
     * Whether background graphics were printed.
     */
    print_background?: boolean;

    /**
     * Page render scale.
     */
    scale?: number;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;

    /**
     * How the PDF was returned (`ReturnAsBase64` or `ReturnAsStream`). A value the
     * protocol does not define is reported as `other`.
     */
    transfer_mode?: 'ReturnAsBase64' | 'ReturnAsStream' | 'other';
  }

  /**
   * Sanitized `Page.startScreencast` arguments. Canonical input:
   * `Page.startScreencast` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpPageStartScreencastCommandData {
    method: 'Page.startScreencast';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Frame sampling interval.
     */
    every_nth_frame?: number;

    /**
     * Frame format requested (`jpeg` or `png`). A value the protocol does not define
     * is reported as `other`.
     */
    format?: 'jpeg' | 'png' | 'other';

    /**
     * Maximum frame height in pixels.
     */
    max_height?: number;

    /**
     * Maximum frame width in pixels.
     */
    max_width?: number;

    /**
     * Compression quality, 0 to 100.
     */
    quality?: number;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Page.stopScreencast` arguments. Canonical input:
   * `Page.stopScreencast` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpPageStopScreencastCommandData {
    method: 'Page.stopScreencast';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Page.stopLoading` arguments. Canonical input: `Page.stopLoading` in
   * devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpPageStopLoadingCommandData {
    method: 'Page.stopLoading';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Page.close` arguments. Canonical input: `Page.close` in
   * devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpPageCloseCommandData {
    method: 'Page.close';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Page.setWebLifecycleState` arguments. Canonical input:
   * `Page.setWebLifecycleState` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpPageSetWebLifecycleStateCommandData {
    method: 'Page.setWebLifecycleState';

    /**
     * Lifecycle state applied (`frozen` or `active`). A value the protocol does not
     * define is reported as `other`.
     */
    state: 'frozen' | 'active' | 'other';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Target.activateTarget` arguments. Canonical input:
   * `Target.activateTarget` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpTargetActivateTargetCommandData {
    method: 'Target.activateTarget';

    /**
     * Opaque target identifier. Clipped to 128 characters; a longer value is not a
     * real identifier.
     */
    target_id: string;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Target.closeTarget` arguments. Canonical input: `Target.closeTarget`
   * in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpTargetCloseTargetCommandData {
    method: 'Target.closeTarget';

    /**
     * Opaque target identifier. Clipped to 128 characters; a longer value is not a
     * real identifier.
     */
    target_id: string;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Target.createTarget` arguments. Canonical input:
   * `Target.createTarget` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpTargetCreateTargetCommandData {
    method: 'Target.createTarget';

    /**
     * Whether the target was created in the background.
     */
    background?: boolean;

    /**
     * Opaque browser context identifier. Clipped to 128 characters; a longer value is
     * not a real identifier.
     */
    browser_context_id?: string;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Whether BeginFrame control was enabled (headless only).
     */
    enable_begin_frame_control?: boolean;

    /**
     * Whether the new target was focused.
     */
    focus?: boolean;

    /**
     * Whether a tab target rather than a page target was created.
     */
    for_tab?: boolean;

    /**
     * Window height in DIP.
     */
    height?: number;

    /**
     * Whether the target was created hidden.
     */
    hidden?: boolean;

    /**
     * Window x position in screen coordinates.
     */
    left?: number;

    /**
     * Whether a new window was requested.
     */
    new_window?: boolean;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;

    /**
     * Window y position in screen coordinates.
     */
    top?: number;

    /**
     * Scheme of the destination URL (e.g. `https`, `about`, `data`). The rest of the
     * URL is never captured.
     */
    url_scheme?: string;

    /**
     * Window width in DIP.
     */
    width?: number;

    /**
     * Window state requested (`normal`, `minimized`, `maximized`, `fullscreen`). A
     * value the protocol does not define is reported as `other`.
     */
    window_state?: 'normal' | 'minimized' | 'maximized' | 'fullscreen' | 'other';
  }

  /**
   * Sanitized `Target.createBrowserContext` arguments. Canonical input:
   * `Target.createBrowserContext` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpTargetCreateBrowserContextCommandData {
    method: 'Target.createBrowserContext';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Whether the context is disposed when the debugging session detaches.
     */
    dispose_on_detach?: boolean;

    /**
     * Whether a proxy bypass list was configured.
     */
    proxy_bypass_list_present?: boolean;

    /**
     * Whether a proxy was configured. The proxy address is never captured.
     */
    proxy_server_present?: boolean;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;

    /**
     * Number of origins granted universal network access. The origins themselves are
     * never captured.
     */
    universal_network_access_origin_count?: number;
  }

  /**
   * Sanitized `Target.disposeBrowserContext` arguments. Canonical input:
   * `Target.disposeBrowserContext` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpTargetDisposeBrowserContextCommandData {
    /**
     * Opaque browser context identifier. Clipped to 128 characters; a longer value is
     * not a real identifier.
     */
    browser_context_id: string;

    method: 'Target.disposeBrowserContext';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Target.openDevTools` arguments. Canonical input:
   * `Target.openDevTools` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpTargetOpenDevToolsCommandData {
    method: 'Target.openDevTools';

    /**
     * Opaque target identifier. Clipped to 128 characters; a longer value is not a
     * real identifier.
     */
    target_id: string;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * DevTools panel opened. Clipped to 128 characters; a longer value is not a real
     * identifier.
     */
    panel_id?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Browser.cancelDownload` arguments. Canonical input:
   * `Browser.cancelDownload` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpBrowserCancelDownloadCommandData {
    /**
     * Opaque identifier of the download that was cancelled. Clipped to 128 characters;
     * a longer value is not a real identifier.
     */
    download_guid: string;

    method: 'Browser.cancelDownload';

    /**
     * Opaque browser context identifier. Clipped to 128 characters; a longer value is
     * not a real identifier.
     */
    browser_context_id?: string;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Browser.close` arguments. Canonical input: `Browser.close` in
   * devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpBrowserCloseCommandData {
    method: 'Browser.close';

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }

  /**
   * Sanitized `Browser.setWindowBounds` arguments. Canonical input:
   * `Browser.setWindowBounds` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpBrowserSetWindowBoundsCommandData {
    method: 'Browser.setWindowBounds';

    /**
     * Browser window identifier.
     */
    window_id: number;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Window height in DIP.
     */
    height?: number;

    /**
     * Window x position in screen coordinates.
     */
    left?: number;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;

    /**
     * Window y position in screen coordinates.
     */
    top?: number;

    /**
     * Window width in DIP.
     */
    width?: number;

    /**
     * Window state requested (`normal`, `minimized`, `maximized`, `fullscreen`). A
     * value the protocol does not define is reported as `other`.
     */
    window_state?: 'normal' | 'minimized' | 'maximized' | 'fullscreen' | 'other';
  }

  /**
   * Sanitized `Browser.setContentsSize` arguments. Canonical input:
   * `Browser.setContentsSize` in devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpBrowserSetContentsSizeCommandData {
    method: 'Browser.setContentsSize';

    /**
     * Browser window identifier.
     */
    window_id: number;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Contents height in DIP.
     */
    height?: number;

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;

    /**
     * Contents width in DIP.
     */
    width?: number;
  }

  /**
   * Sanitized `Autofill.trigger` arguments. Canonical input: `Autofill.trigger` in
   * devtools-protocol@2d019e73, pinned at
   * https://github.com/ChromeDevTools/devtools-protocol/blob/2d019e73eb371d1d6985d26d395d78bd8f8a22ba/json/browser_protocol.json.
   * Every argument of this command has a retained or redacted decision in
   * lib/devtoolsproxy/testdata/cdp_arguments.yaml.
   */
  export interface BrowserCdpAutofillTriggerCommandData {
    /**
     * Opaque backend node identifier of the field that was autofilled.
     */
    field_id: number;

    method: 'Autofill.trigger';

    /**
     * Number of address fields the command filled. Their names and values are never
     * captured.
     */
    address_field_count?: number;

    /**
     * The command's JSON-RPC id, so the command can be joined to the result the
     * browser returned for it. Absent when the client sent none.
     */
    command_id?: number;

    /**
     * Identifies the CDP proxy connection the command arrived on, matching
     * `cdp_connect` and `cdp_disconnect`. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Opaque frame identifier. Clipped to 128 characters; a longer value is not a real
     * identifier.
     */
    frame_id?: string;

    /**
     * What was filled: `card` or `address`. The values themselves are never captured.
     */
    mode?: 'card' | 'address';

    /**
     * CDP session identifier the command was addressed to. Absent for browser-level
     * commands. Clipped to 128 characters.
     */
    session_id?: string;
  }
}

/**
 * A browser-control CDP method the proxy reports. The set covers the commands an
 * agent drives the browser with; configuration, DOM and Runtime bookkeeping, and
 * Chrome-specific UI commands are outside it. Canonical definitions:
 * devtools-protocol@2d019e73.
 */
export type BrowserCdpCommandMethod =
  | 'Input.dispatchMouseEvent'
  | 'Input.dispatchKeyEvent'
  | 'Input.insertText'
  | 'Input.imeSetComposition'
  | 'Input.dispatchTouchEvent'
  | 'Input.dispatchDragEvent'
  | 'Input.cancelDragging'
  | 'Input.emulateTouchFromMouseEvent'
  | 'Input.synthesizePinchGesture'
  | 'Input.synthesizeScrollGesture'
  | 'Input.synthesizeTapGesture'
  | 'DOM.setFileInputFiles'
  | 'DOM.focus'
  | 'DOM.scrollIntoViewIfNeeded'
  | 'Page.bringToFront'
  | 'Page.captureScreenshot'
  | 'Page.captureSnapshot'
  | 'Page.handleJavaScriptDialog'
  | 'Page.navigate'
  | 'Page.navigateToHistoryEntry'
  | 'Page.reload'
  | 'Page.printToPDF'
  | 'Page.startScreencast'
  | 'Page.stopScreencast'
  | 'Page.stopLoading'
  | 'Page.close'
  | 'Page.setWebLifecycleState'
  | 'Target.activateTarget'
  | 'Target.closeTarget'
  | 'Target.createTarget'
  | 'Target.createBrowserContext'
  | 'Target.disposeBrowserContext'
  | 'Target.openDevTools'
  | 'Browser.cancelDownload'
  | 'Browser.close'
  | 'Browser.setWindowBounds'
  | 'Browser.setContentsSize'
  | 'Autofill.trigger';

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

  data?: BrowserCdpConnectEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserCdpConnectEvent {
  export interface Data {
    /**
     * Identifies this CDP proxy connection, matching the connection_id on the
     * cdp_command events that arrived on it. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;
  }
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

    /**
     * Identifies this CDP proxy connection, matching the connection_id on the
     * cdp_command events that arrived on it. Two clients driving the same browser are
     * told apart by this.
     */
    connection_id?: string;

    /**
     * Number of forwarded client frames the classifier never saw, because it could not
     * keep up or because classification failed. An upper bound on lost commands rather
     * than a count: a saturated queue turns away whatever arrives next, which may be
     * library traffic that would have produced no event. Telemetry loss only; every
     * command was still relayed to the browser. Absent on events from a browser image
     * predating the field, which is not the same as zero.
     */
    telemetry_dropped?: number;

    /**
     * Number of forwarded client commands that produced no cdp_command event because
     * their method is listed in control.cdp.excluded_methods. Configuration rather
     * than loss, so it is counted apart from telemetry_dropped.
     */
    telemetry_excluded?: number;
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
     * Human-readable error text, as the browser console would display it. For
     * console.error() calls, the first argument coerced to a string. For uncaught
     * exceptions, the prefix and error message, e.g. "Uncaught Error: boom" or
     * "Uncaught (in promise) TypeError: x is not a function".
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
 * A page's renderer process crashed (an "Aw, Snap!" failure) while the browser
 * process itself stayed alive. Reported on the crashed page's session, with the
 * session and target ids on `source.metadata`. Captured only while the `page`
 * category is enabled.
 */
export interface BrowserPageCrashedEvent {
  category: 'page';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'page_crashed';

  data?: BrowserPageCrashedEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserPageCrashedEvent {
  export interface Data {
    /**
     * CDP target identifier of the crashed page.
     */
    target_id: string;

    /**
     * CDP target type of the page that produced the event.
     */
    target_type: 'page' | 'background_page' | 'service_worker' | 'shared_worker' | 'other';

    /**
     * URL the page was on when its renderer process crashed.
     */
    url: string;
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
 * An HTTP call that manages the browser VM rather than driving the browser,
 * handled by the in-VM API server — recording lifecycle, filesystem and process
 * management, telemetry and browser configuration. Mostly platform-induced (e.g.
 * profile save, replay capture) rather than agent actions.
 */
export interface BrowserPlatformAPICallEvent {
  category: 'platform';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'platform_api_call';

  data?: BrowserPlatformAPICallEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserPlatformAPICallEvent {
  export interface Data {
    /**
     * Wall-clock duration of the handler in milliseconds.
     */
    duration_ms: number;

    /**
     * Matched route's operation, named as the in-VM API names its handler (e.g.
     * ProcessExec, StartRecording).
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
 * A branded proxy-layer failure observed by the browser. Emitted when the metro
 * egress host-proxy serves a branded 5xx error page whose response carries the
 * X-Kernel-Proxy-Error header. Low-volume and carries a typed code. Its value is
 * per-session and per-URL attribution for sessions that already capture the
 * network stream: proxy failures are only observable while the CDP network
 * collector is running, so this is an opt-in refinement of the raw network events
 * rather than a default-on alerting signal.
 */
export interface BrowserProxyErrorEvent {
  category: 'network';

  /**
   * Provenance metadata identifying which producer emitted the event.
   */
  source: BrowserEventSource;

  /**
   * Event timestamp in Unix microseconds.
   */
  ts: number;

  type: 'proxy_error';

  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  data?: BrowserProxyErrorEvent.Data;

  /**
   * True if the data field was truncated due to size limits.
   */
  truncated?: boolean;
}

export namespace BrowserProxyErrorEvent {
  /**
   * Browser event context stamped by the browser monitor onto all CDP-sourced
   * events. Identifies the target, frame, and navigation epoch in which the event
   * occurred.
   */
  export interface Data extends TelemetryAPI.BrowserEventContext {
    /**
     * Proxy-layer error code: the X-Kernel-Proxy-Error response header value from a
     * branded 5xx error page served by the metro egress host-proxy. Values mirror what
     * the proxy emits: destination_blocked, provider_blacklisted,
     * provider_unreachable, proxy_unavailable, upstream_timeout, upstream_dns_failure,
     * upstream_connect_failed. Unknown header values are dropped.
     */
    code:
      | 'destination_blocked'
      | 'provider_blacklisted'
      | 'provider_unreachable'
      | 'proxy_unavailable'
      | 'upstream_timeout'
      | 'upstream_dns_failure'
      | 'upstream_connect_failed';

    /**
     * CDP request identifier matching the originating request.
     */
    request_id: string;

    /**
     * HTTP response status of the branded error page (502).
     */
    status: number;

    /**
     * HTTP method of the failed request, when known.
     */
    method?: string;

    /**
     * CDP Network.ResourceType for the request, when known.
     */
    resource_type?: string;
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
 * Per-category telemetry capture settings layered onto the default set. The
 * operational signals (control, connection, system, captcha) are on by default and
 * are opt-out: set one to enabled=false to stop capturing it. The CDP categories
 * (console, network, page, interaction), screenshot and platform are off by
 * default and are opt-in: set enabled=true to capture them.
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
   * Agent-driven actions against the browser — computer-control calls, Playwright
   * code execution, screenshots, clipboard access, and browser-control commands sent
   * over the CDP proxy. On by default.
   */
  control?: BrowserTelemetryControlConfig;

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
   * In-VM API calls that manage the browser VM rather than drive the browser
   * (recording, filesystem, process, telemetry and browser configuration). Mostly
   * platform-induced; off by default and must be opted into.
   */
  platform?: BrowserTelemetryCategoryConfig;

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
   * Whether this category is captured. Operational categories (control, connection,
   * system, captcha) default to true; set false to opt out. CDP categories (console,
   * network, page, interaction), screenshot and platform default to false; set true
   * to opt in.
   */
  enabled?: boolean;
}

/**
 * Settings for the cdp_command events the CDP proxy reports.
 */
export interface BrowserTelemetryCdpControlConfig {
  /**
   * Methods to leave out of the cdp_command stream. Omit the list to keep the
   * current one; send an empty list to report every supported method again.
   * Exclusion is a telemetry setting only: an excluded command is still relayed to
   * the browser unchanged, it simply produces no event. Use it to drop the
   * highest-volume methods — Input.dispatchMouseEvent during a humanized cursor
   * path, or Page.captureScreenshot under a screencast — without turning the whole
   * category off. Excluded commands are counted in
   * cdp_disconnect.telemetry_excluded.
   */
  excluded_methods?: Array<BrowserCdpCommandMethod>;
}

/**
 * Active telemetry configuration for a browser session.
 */
export interface BrowserTelemetryConfig {
  /**
   * Per-category enable/disable flags.
   */
  browser?: BrowserTelemetryCategoriesConfig;

  /**
   * Where the session's captured telemetry is being exported. Omitted when the
   * export state is unknown.
   */
  export?: BrowserTelemetryExportConfig;
}

/**
 * Configuration for the control category. Same enabled semantics as any other
 * category, plus settings for the browser-control commands the CDP proxy reports.
 */
export interface BrowserTelemetryControlConfig {
  /**
   * Settings for the cdp_command events the CDP proxy reports. Merged independently
   * of enabled, so a later update that only sets enabled keeps the current exclusion
   * list.
   */
  cdp?: BrowserTelemetryCdpControlConfig;

  /**
   * Whether this category is captured. Control is on by default; set false to opt
   * out.
   */
  enabled?: boolean;
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
  | BrowserProxyErrorEvent
  | BrowserPageNavigationEvent
  | BrowserPageDomContentLoadedEvent
  | BrowserPageLoadEvent
  | BrowserPageTabOpenedEvent
  | BrowserPageCrashedEvent
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
  | BrowserPlatformAPICallEvent
  | BrowserCdpCommandEvent
  | BrowserCdpConnectEvent
  | BrowserCdpDisconnectEvent
  | BrowserLiveViewConnectEvent
  | BrowserLiveViewDisconnectEvent
  | BrowserCaptchaSolveResultEvent
  | BrowserSystemOomKillEvent
  | BrowserServiceCrashedEvent;

/**
 * Active export state for a session's captured telemetry, by protocol.
 */
export interface BrowserTelemetryExportConfig {
  /**
   * Active OTLP export state.
   */
  otlp?: BrowserTelemetryOtlpExportConfig;
}

/**
 * Active OTLP export state for a browser session.
 */
export interface BrowserTelemetryOtlpExportConfig {
  /**
   * ID of the OTLP destination the session is bound to. Omitted when the session is
   * not exporting.
   */
  destination?: string;

  /**
   * Whether the session is exporting captured telemetry over OTLP.
   */
  enabled?: boolean;
}

/**
 * Envelope wrapping a browser telemetry event with its monotonic sequence number.
 * Each SSE data: frame carries one envelope as JSON. The seq value is also emitted
 * as the SSE id: field so clients can pass it as Last-Event-ID on reconnect.
 */
export interface TelemetryEventsResponse {
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

export interface TelemetryEventsParams extends OffsetPaginationParams {
  /**
   * Restrict results to these event categories. Repeat the parameter for multiple
   * values.
   */
  category?: Array<
    | 'console'
    | 'network'
    | 'page'
    | 'interaction'
    | 'control'
    | 'platform'
    | 'connection'
    | 'system'
    | 'screenshot'
    | 'captcha'
    | 'monitor'
  >;

  /**
   * Read direction. asc (default) reads oldest first, starting from since or the
   * offset cursor. desc reads newest first: each request returns one page of up to
   * limit records ending at the offset cursor (or until, or the newest archived
   * event); combining desc with since is rejected with a 400. In either direction
   * the category filter applies within the page, so a filtered page may be empty
   * while X-Has-More is true.
   */
  order?: string;

  /**
   * Start of the window: an RFC-3339 timestamp, or a duration like 5m meaning that
   * long ago. Defaults to 5m. Ignored when offset is set.
   */
  since?: string;

  /**
   * End of the window (exclusive): an RFC-3339 timestamp, or a duration like 5m
   * meaning that long ago.
   */
  until?: string;
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
}
