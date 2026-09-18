// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import { buildHeaders } from "../../internal/headers.mjs";
import { path } from "../../internal/utils/path.mjs";
/**
 * Control mouse, keyboard, and screen on the browser instance.
 */
export class Computer extends APIResource {
    /**
     * Send an array of computer actions to execute in order on the browser instance.
     * Execution stops on the first error. This reduces network latency compared to
     * sending individual action requests.
     *
     * @example
     * ```ts
     * await client.browsers.computer.batch(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { actions: [{ type: 'click_mouse' }] },
     * );
     * ```
     */
    batch(idOrName, body, options) {
        return this._client.post(path `/browsers/${idOrName}/computer/batch`, {
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
     *   await client.browsers.computer.captureScreenshot(
     *     'htzv5orfit78e1m2biiifpbv',
     *   );
     *
     * const content = await response.blob();
     * console.log(content);
     * ```
     */
    captureScreenshot(idOrName, body = {}, options) {
        return this._client.post(path `/browsers/${idOrName}/computer/screenshot`, {
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
     * await client.browsers.computer.clickMouse(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { x: 0, y: 0 },
     * );
     * ```
     */
    clickMouse(idOrName, body, options) {
        return this._client.post(path `/browsers/${idOrName}/computer/click_mouse`, {
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
     * await client.browsers.computer.dragMouse(
     *   'htzv5orfit78e1m2biiifpbv',
     *   {
     *     path: [
     *       [0, 0],
     *       [0, 0],
     *     ],
     *   },
     * );
     * ```
     */
    dragMouse(idOrName, body, options) {
        return this._client.post(path `/browsers/${idOrName}/computer/drag_mouse`, {
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
     *   await client.browsers.computer.getMousePosition(
     *     'htzv5orfit78e1m2biiifpbv',
     *   );
     * ```
     */
    getMousePosition(idOrName, options) {
        return this._client.post(path `/browsers/${idOrName}/computer/get_mouse_position`, options);
    }
    /**
     * Move the mouse cursor to the specified coordinates on the browser instance
     *
     * @example
     * ```ts
     * await client.browsers.computer.moveMouse(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { x: 0, y: 0 },
     * );
     * ```
     */
    moveMouse(idOrName, body, options) {
        return this._client.post(path `/browsers/${idOrName}/computer/move_mouse`, {
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
     * await client.browsers.computer.pressKey(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { keys: ['string'] },
     * );
     * ```
     */
    pressKey(idOrName, body, options) {
        return this._client.post(path `/browsers/${idOrName}/computer/press_key`, {
            body,
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
    /**
     * Read text from the clipboard on the browser instance
     *
     * @example
     * ```ts
     * const response =
     *   await client.browsers.computer.readClipboard(
     *     'htzv5orfit78e1m2biiifpbv',
     *   );
     * ```
     */
    readClipboard(idOrName, options) {
        return this._client.post(path `/browsers/${idOrName}/computer/clipboard/read`, options);
    }
    /**
     * Scroll the mouse wheel at a position on the host computer
     *
     * @example
     * ```ts
     * await client.browsers.computer.scroll(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { x: 0, y: 0 },
     * );
     * ```
     */
    scroll(idOrName, body, options) {
        return this._client.post(path `/browsers/${idOrName}/computer/scroll`, {
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
     *   await client.browsers.computer.setCursorVisibility(
     *     'htzv5orfit78e1m2biiifpbv',
     *     { hidden: true },
     *   );
     * ```
     */
    setCursorVisibility(idOrName, body, options) {
        return this._client.post(path `/browsers/${idOrName}/computer/cursor`, { body, ...options });
    }
    /**
     * Type text on the browser instance
     *
     * @example
     * ```ts
     * await client.browsers.computer.typeText(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { text: 'text' },
     * );
     * ```
     */
    typeText(idOrName, body, options) {
        return this._client.post(path `/browsers/${idOrName}/computer/type`, {
            body,
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
    /**
     * Write text to the clipboard on the browser instance
     *
     * @example
     * ```ts
     * await client.browsers.computer.writeClipboard(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { text: 'text' },
     * );
     * ```
     */
    writeClipboard(idOrName, body, options) {
        return this._client.post(path `/browsers/${idOrName}/computer/clipboard/write`, {
            body,
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
}
//# sourceMappingURL=computer.mjs.map