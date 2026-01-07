// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

/**
 * An action available on the app
 */
export interface AppAction {
  /**
   * Name of the action
   */
  name: string;
}

/**
 * Extension selection for the browser session. Provide either id or name of an
 * extension uploaded to Kernel.
 */
export interface BrowserExtension {
  /**
   * Extension ID to load for this browser session
   */
  id?: string;

  /**
   * Extension name to load for this browser session (instead of id). Must be 1-255
   * characters, using letters, numbers, dots, underscores, or hyphens.
   */
  name?: string;
}

/**
 * Profile selection for the browser session. Provide either id or name. If
 * specified, the matching profile will be loaded into the browser session.
 * Profiles must be created beforehand.
 */
export interface BrowserProfile {
  /**
   * Profile ID to load for this browser session
   */
  id?: string;

  /**
   * Profile name to load for this browser session (instead of id). Must be 1-255
   * characters, using letters, numbers, dots, underscores, or hyphens.
   */
  name?: string;

  /**
   * If true, save changes made during the session back to the profile when the
   * session ends.
   */
  save_changes?: boolean;
}

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
export interface BrowserViewport {
  /**
   * Browser window height in pixels.
   */
  height: number;

  /**
   * Browser window width in pixels.
   */
  width: number;

  /**
   * Display refresh rate in Hz. If omitted, automatically determined from width and
   * height.
   */
  refresh_rate?: number;
}

export interface ErrorDetail {
  /**
   * Lower-level error code providing more specific detail
   */
  code?: string;

  /**
   * Further detail about the error
   */
  message?: string;
}

/**
 * An error event from the application.
 */
export interface ErrorEvent {
  error: ErrorModel;

  /**
   * Event type identifier (always "error").
   */
  event: 'error';

  /**
   * Time the error occurred.
   */
  timestamp: string;
}

export interface ErrorModel {
  /**
   * Application-specific error code (machine-readable)
   */
  code: string;

  /**
   * Human-readable error description for debugging
   */
  message: string;

  /**
   * Additional error details (for multiple errors)
   */
  details?: Array<ErrorDetail>;

  inner_error?: ErrorDetail;
}

/**
 * Heartbeat event sent periodically to keep SSE connection alive.
 */
export interface HeartbeatEvent {
  /**
   * Event type identifier (always "sse_heartbeat").
   */
  event: 'sse_heartbeat';

  /**
   * Time the heartbeat was sent.
   */
  timestamp: string;
}

/**
 * A log entry from the application.
 */
export interface LogEvent {
  /**
   * Event type identifier (always "log").
   */
  event: 'log';

  /**
   * Log message text.
   */
  message: string;

  /**
   * Time the log entry was produced.
   */
  timestamp: string;
}
