// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Computer extends APIResource {
  /**
   * Capture a screenshot of the browser instance
   *
   * @example
   * ```ts
   * const response =
   *   await client.browsers.computer.captureScreenshot('id');
   *
   * const content = await response.blob();
   * console.log(content);
   * ```
   */
  captureScreenshot(
    id: string,
    body: ComputerCaptureScreenshotParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<Response> {
    return this._client.post(path`/browsers/${id}/computer/screenshot`, {
      body,
      ...options,
      headers: buildHeaders([{ Accept: 'image/png' }, options?.headers]),
      __binaryResponse: true,
    });
  }

  /**
   * Simulate a mouse click action on the browser instance
   *
   * @example
   * ```ts
   * await client.browsers.computer.clickMouse('id', {
   *   x: 0,
   *   y: 0,
   * });
   * ```
   */
  clickMouse(id: string, body: ComputerClickMouseParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post(path`/browsers/${id}/computer/click_mouse`, {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Drag the mouse along a path
   *
   * @example
   * ```ts
   * await client.browsers.computer.dragMouse('id', {
   *   path: [
   *     [0, 0],
   *     [0, 0],
   *   ],
   * });
   * ```
   */
  dragMouse(id: string, body: ComputerDragMouseParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post(path`/browsers/${id}/computer/drag_mouse`, {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Move the mouse cursor to the specified coordinates on the browser instance
   *
   * @example
   * ```ts
   * await client.browsers.computer.moveMouse('id', {
   *   x: 0,
   *   y: 0,
   * });
   * ```
   */
  moveMouse(id: string, body: ComputerMoveMouseParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post(path`/browsers/${id}/computer/move_mouse`, {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Press one or more keys on the host computer
   *
   * @example
   * ```ts
   * await client.browsers.computer.pressKey('id', {
   *   keys: ['string'],
   * });
   * ```
   */
  pressKey(id: string, body: ComputerPressKeyParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post(path`/browsers/${id}/computer/press_key`, {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Scroll the mouse wheel at a position on the host computer
   *
   * @example
   * ```ts
   * await client.browsers.computer.scroll('id', { x: 0, y: 0 });
   * ```
   */
  scroll(id: string, body: ComputerScrollParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post(path`/browsers/${id}/computer/scroll`, {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Set cursor visibility
   *
   * @example
   * ```ts
   * const response =
   *   await client.browsers.computer.setCursorVisibility('id', {
   *     hidden: true,
   *   });
   * ```
   */
  setCursorVisibility(
    id: string,
    body: ComputerSetCursorVisibilityParams,
    options?: RequestOptions,
  ): APIPromise<ComputerSetCursorVisibilityResponse> {
    return this._client.post(path`/browsers/${id}/computer/cursor`, { body, ...options });
  }

  /**
   * Type text on the browser instance
   *
   * @example
   * ```ts
   * await client.browsers.computer.typeText('id', {
   *   text: 'text',
   * });
   * ```
   */
  typeText(id: string, body: ComputerTypeTextParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post(path`/browsers/${id}/computer/type`, {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

/**
 * Generic OK response.
 */
export interface ComputerSetCursorVisibilityResponse {
  /**
   * Indicates success.
   */
  ok: boolean;
}

export interface ComputerCaptureScreenshotParams {
  region?: ComputerCaptureScreenshotParams.Region;
}

export namespace ComputerCaptureScreenshotParams {
  export interface Region {
    /**
     * Height of the region in pixels
     */
    height: number;

    /**
     * Width of the region in pixels
     */
    width: number;

    /**
     * X coordinate of the region's top-left corner
     */
    x: number;

    /**
     * Y coordinate of the region's top-left corner
     */
    y: number;
  }
}

export interface ComputerClickMouseParams {
  /**
   * X coordinate of the click position
   */
  x: number;

  /**
   * Y coordinate of the click position
   */
  y: number;

  /**
   * Mouse button to interact with
   */
  button?: 'left' | 'right' | 'middle' | 'back' | 'forward';

  /**
   * Type of click action
   */
  click_type?: 'down' | 'up' | 'click';

  /**
   * Modifier keys to hold during the click
   */
  hold_keys?: Array<string>;

  /**
   * Number of times to repeat the click
   */
  num_clicks?: number;
}

export interface ComputerDragMouseParams {
  /**
   * Ordered list of [x, y] coordinate pairs to move through while dragging. Must
   * contain at least 2 points.
   */
  path: Array<Array<number>>;

  /**
   * Mouse button to drag with
   */
  button?: 'left' | 'middle' | 'right';

  /**
   * Delay in milliseconds between button down and starting to move along the path.
   */
  delay?: number;

  /**
   * Modifier keys to hold during the drag
   */
  hold_keys?: Array<string>;

  /**
   * Delay in milliseconds between relative steps while dragging (not the initial
   * delay).
   */
  step_delay_ms?: number;

  /**
   * Number of relative move steps per segment in the path. Minimum 1.
   */
  steps_per_segment?: number;
}

export interface ComputerMoveMouseParams {
  /**
   * X coordinate to move the cursor to
   */
  x: number;

  /**
   * Y coordinate to move the cursor to
   */
  y: number;

  /**
   * Modifier keys to hold during the move
   */
  hold_keys?: Array<string>;
}

export interface ComputerPressKeyParams {
  /**
   * List of key symbols to press. Each item should be a key symbol supported by
   * xdotool (see X11 keysym definitions). Examples include "Return", "Shift",
   * "Ctrl", "Alt", "F5". Items in this list could also be combinations, e.g.
   * "Ctrl+t" or "Ctrl+Shift+Tab".
   */
  keys: Array<string>;

  /**
   * Duration to hold the keys down in milliseconds. If omitted or 0, keys are
   * tapped.
   */
  duration?: number;

  /**
   * Optional modifier keys to hold during the key press sequence.
   */
  hold_keys?: Array<string>;
}

export interface ComputerScrollParams {
  /**
   * X coordinate at which to perform the scroll
   */
  x: number;

  /**
   * Y coordinate at which to perform the scroll
   */
  y: number;

  /**
   * Horizontal scroll amount. Positive scrolls right, negative scrolls left.
   */
  delta_x?: number;

  /**
   * Vertical scroll amount. Positive scrolls down, negative scrolls up.
   */
  delta_y?: number;

  /**
   * Modifier keys to hold during the scroll
   */
  hold_keys?: Array<string>;
}

export interface ComputerSetCursorVisibilityParams {
  /**
   * Whether the cursor should be hidden or visible
   */
  hidden: boolean;
}

export interface ComputerTypeTextParams {
  /**
   * Text to type on the browser instance
   */
  text: string;

  /**
   * Delay in milliseconds between keystrokes
   */
  delay?: number;
}

export declare namespace Computer {
  export {
    type ComputerSetCursorVisibilityResponse as ComputerSetCursorVisibilityResponse,
    type ComputerCaptureScreenshotParams as ComputerCaptureScreenshotParams,
    type ComputerClickMouseParams as ComputerClickMouseParams,
    type ComputerDragMouseParams as ComputerDragMouseParams,
    type ComputerMoveMouseParams as ComputerMoveMouseParams,
    type ComputerPressKeyParams as ComputerPressKeyParams,
    type ComputerScrollParams as ComputerScrollParams,
    type ComputerSetCursorVisibilityParams as ComputerSetCursorVisibilityParams,
    type ComputerTypeTextParams as ComputerTypeTextParams,
  };
}
