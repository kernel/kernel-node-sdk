// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Create and manage browser sessions.
 */
export class LiveView extends APIResource {
  /**
   * Creates a live view URL for a headful browser that grants either read-only or
   * control access. The URL works only for the live view: it cannot connect to CDP,
   * WebDriver, or any other browser endpoint. A read-only URL shows the browser but
   * cannot send input, regardless of query parameters. The URL stays valid until the
   * browser is deleted, or until `ttl_seconds` elapse when set. For a browser
   * acquired from a pool, it stops working when the browser is released. Nothing is
   * stored, so a URL cannot be revoked before then.
   *
   * @example
   * ```ts
   * const browserLiveView =
   *   await client.browsers.liveView.create(
   *     'htzv5orfit78e1m2biiifpbv',
   *   );
   * ```
   */
  create(
    idOrName: string,
    body: LiveViewCreateParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<BrowserLiveView> {
    return this._client.post(path`/browsers/${idOrName}/live_view`, { body, ...options });
  }
}

export interface BrowserLiveView {
  /**
   * `read` shows the browser without accepting input. `control` also lets the viewer
   * drive the browser through the live view.
   */
  scope: BrowserLiveViewScope;

  /**
   * Live view URL. Treat it as a credential.
   */
  url: string;

  /**
   * When the URL expires. Absent when it stays valid until the browser is deleted.
   */
  expires_at?: string;
}

export interface BrowserLiveViewRequest {
  /**
   * `read` shows the browser without accepting input. `control` also lets the viewer
   * drive the browser through the live view.
   */
  scope?: BrowserLiveViewScope;

  /**
   * Seconds until the URL expires. Omit to keep it valid until the browser is
   * deleted.
   */
  ttl_seconds?: number;
}

/**
 * `read` shows the browser without accepting input. `control` also lets the viewer
 * drive the browser through the live view.
 */
export type BrowserLiveViewScope = 'read' | 'control';

export interface LiveViewCreateParams {
  /**
   * `read` shows the browser without accepting input. `control` also lets the viewer
   * drive the browser through the live view.
   */
  scope?: BrowserLiveViewScope;

  /**
   * Seconds until the URL expires. Omit to keep it valid until the browser is
   * deleted.
   */
  ttl_seconds?: number;
}

export declare namespace LiveView {
  export {
    type BrowserLiveView as BrowserLiveView,
    type BrowserLiveViewRequest as BrowserLiveViewRequest,
    type BrowserLiveViewScope as BrowserLiveViewScope,
    type LiveViewCreateParams as LiveViewCreateParams,
  };
}
