// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Computer extends APIResource {
  /**
   * Send an array of computer actions to execute in order on the browser instance.
   * Execution stops on the first error. This reduces network latency compared to
   * sending individual action requests.
   *
   * @example
   * ```ts
   * await client.browsers.computer.batch('id', {
   *   actions: [{ type: 'click_mouse' }],
   * });
   * ```
   */
  batch(id: string, body: ComputerBatchParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post(path`/browsers/${id}/computer/batch`, {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

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
   * Get the current mouse cursor position on the browser instance
   *
   * @example
   * ```ts
   * const response =
   *   await client.browsers.computer.getMousePosition('id');
   * ```
   */
  getMousePosition(id: string, options?: RequestOptions): APIPromise<ComputerGetMousePositionResponse> {
    return this._client.post(path`/browsers/${id}/computer/get_mouse_position`, options);
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

export interface ComputerGetMousePositionResponse {
  /**
   * X coordinate of the cursor
   */
  x: number;

  /**
   * Y coordinate of the cursor
   */
  y: number;
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

export interface ComputerBatchParams {
  /**
   * Ordered list of actions to execute. Execution stops on the first error.
   */
  actions: Array<ComputerBatchParams.Action>;
}

export namespace ComputerBatchParams {
  /**
   * A single computer action to execute as part of a batch. The `type` field selects
   * which action to perform, and the corresponding field contains the action
   * parameters. Exactly one action field matching the type must be provided.
   */
  export interface Action {
    /**
     * The type of action to perform.
     */
    type:
      | 'click_mouse'
      | 'move_mouse'
      | 'type_text'
      | 'press_key'
      | 'scroll'
      | 'drag_mouse'
      | 'set_cursor'
      | 'sleep';

    click_mouse?: Action.ClickMouse;

    drag_mouse?: Action.DragMouse;

    move_mouse?: Action.MoveMouse;

    press_key?: Action.PressKey;

    scroll?: Action.Scroll;

    set_cursor?: Action.SetCursor;

    /**
     * Pause execution for a specified duration.
     */
    sleep?: Action.Sleep;

    type_text?: Action.TypeText;
  }

  export namespace Action {
    export interface ClickMouse {
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

    export interface DragMouse {
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

    export interface MoveMouse {
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

    export interface PressKey {
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

    export interface Scroll {
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

    export interface SetCursor {
      /**
       * Whether the cursor should be hidden or visible
       */
      hidden: boolean;
    }

    /**
     * Pause execution for a specified duration.
     */
    export interface Sleep {
      /**
       * Duration to sleep in milliseconds.
       */
      duration_ms: number;
    }

    export interface TypeText {
      /**
       * Text to type on the browser instance
       */
      text: string;

      /**
       * Delay in milliseconds between keystrokes
       */
      delay?: number;
    }
  }
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
    type ComputerGetMousePositionResponse as ComputerGetMousePositionResponse,
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
  };
}
