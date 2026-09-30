// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as SearchAPI from './search';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Search the web and retrieve content for selected results.
 */
export class Contents extends APIResource {
  /**
   * Retrieves selected results from a retained search. Provide exactly one of
   * result_ids or limit; the latter fetches the top results. Content defaults to
   * source:auto. Responses preserve result_ids order. Unknown result IDs are
   * rejected before retrieval starts. Missing, expired, or inaccessible searches
   * return 404. Once retrieval begins, return one outcome per selected result,
   * including timeout entries for work unfinished at the overall deadline. Browser
   * retrievals run sequentially in result order, so later results may time out when
   * earlier pages are slow. X-Request-Id identifies this request separately from the
   * search resource.
   *
   * @example
   * ```ts
   * const response = await client.search.contents.fetch(
   *   'srch_abc123',
   * );
   * ```
   */
  fetch(id: string, body: ContentFetchParams, options?: RequestOptions): APIPromise<Response> {
    return this._client.post(path`/search/${id}/contents`, { body, ...options });
  }
}

export interface FetchRequest {
  /**
   * Defaults to source:auto when omitted.
   */
  content?: FetchRequest.Content;

  /**
   * Maximum number of search results to fetch when result_ids is omitted, starting
   * from rank 1. Mutually exclusive with result_ids.
   */
  limit?: number;

  /**
   * Kernel-generated IDs from the referenced retained search, in desired response
   * order. They are not provider-standard IDs. Mutually exclusive with limit.
   */
  result_ids?: Array<string>;

  /**
   * Overall deadline across all selected results.
   */
  timeout_ms?: number;
}

export namespace FetchRequest {
  /**
   * Defaults to source:auto when omitted.
   */
  export interface Content {
    /**
     * Requires source=auto or source=browser in deferred retrieval.
     */
    browser?: Content.Browser;

    format?: 'markdown' | 'text';

    /**
     * For source=auto, maximum acceptable age of retained provider content, measured
     * from when the search received it from the provider. A value of 0 disables reuse
     * of retained content, so every result is fetched through a browser.
     * source=provider reuses retained provider content without freshness validation.
     * source=browser always fetches through a browser and does not use this age limit.
     */
    max_age_hours?: number;

    /**
     * Per-result Unicode character limit after extraction. Retained provider content
     * cannot exceed what was stored at search time; such results report truncated when
     * the stored text was already truncated.
     */
    max_chars?: number;

    /**
     * auto uses retained provider content within max_age_hours; for deferred retrieval
     * it falls back to a Kernel browser (caller-supplied or temporary) for results
     * without it. Inline retrieval never uses a browser. provider reuses retained
     * provider content when available, without freshness validation, and never
     * provisions a browser. browser fetches each URL through a Kernel browser, either
     * caller-supplied or temporary. No option makes a new provider request. Defaults
     * to auto for both inline and deferred retrieval. Missing documents produce
     * per-result unavailable outcomes, not request failures.
     */
    source?: 'auto' | 'provider' | 'browser';

    /**
     * Per-result deadline including capacity acquisition, retrieval, and extraction.
     * Also bounded by the overall request deadline.
     */
    timeout_ms?: number;
  }

  export namespace Content {
    /**
     * Requires source=auto or source=browser in deferred retrieval.
     */
    export interface Browser {
      /**
       * Existing browser session ID authorized for the caller and selected project.
       * Reuses its cookies, proxy, and browser configuration; requests follow that
       * browser's existing network access behavior, with no additional destination
       * allowlist in this endpoint. Kernel does not delete a caller-supplied browser.
       * Render mode uses a temporary tab; website activity may still change shared
       * cookies and storage. When omitted and any result needs browser retrieval, Kernel
       * creates one temporary browser for the request using the dashboard launch
       * defaults (headful, stealth, default proxy), tags it with search_id, and deletes
       * it when the request finishes. It is billed and counts toward browser concurrency
       * like any other browser. A concurrency rejection returns 429 for source=browser;
       * for source=auto, results with retained content are still returned and the rest
       * report the rejection.
       */
      browser_id?: string;

      /**
       * Curl uses the browser HTTP stack without navigation or JavaScript execution.
       * Render navigates a temporary page and extracts from its DOM. The selected mode
       * is used for the retrieval.
       */
      mode?: 'curl' | 'render';
    }
  }
}

export interface Response {
  contents: Array<Response.Content>;

  search_id: string;

  usage: SearchAPI.Usage;

  warnings: Array<SearchAPI.Warning>;
}

export namespace Response {
  export interface Content {
    result_id: string;

    /**
     * Ok means non-empty extracted content, not merely HTTP 200. Blocked includes
     * detected challenges or access denials. Detection is best-effort, not a guarantee
     * of page completeness. Error details are present for non-ok outcomes; text is
     * present only on ok.
     */
    status: 'ok' | 'unavailable' | 'blocked' | 'timeout' | 'unsupported_type' | 'extraction_failed' | 'error';

    /**
     * Original result URL.
     */
    url: string;

    /**
     * Kernel content cache outcome. Kernel has no content cache yet: responses report
     * bypass or unknown, and hit and miss are reserved. Provider-internal cache
     * behavior may be unknown.
     */
    cache_status?: 'hit' | 'miss' | 'bypass' | 'unknown';

    /**
     * Describes source coverage before max_chars truncation. Full_page means main-page
     * content, not every dynamic element or linked page.
     */
    completeness?: 'full_page' | 'excerpt' | 'unknown';

    error?: Content.Error;

    /**
     * Extraction version when Kernel transformed the input.
     */
    extractor_version?: string;

    /**
     * When Kernel fetched the content, or received it from the provider for retained
     * content.
     */
    fetched_at?: string | null;

    /**
     * Final retrieval URL after redirects when known. Curl mode follows up to 5
     * redirects.
     */
    final_url?: string;

    /**
     * Format of text. Plain-text and JSON pages are returned unchanged as text even
     * when markdown was requested.
     */
    format?: 'markdown' | 'text';

    /**
     * Final target HTTP status when known.
     */
    http_status?: number;

    /**
     * Original retrieval method.
     */
    method?: 'provider' | 'browser_curl' | 'browser_render';

    /**
     * Extracted website content, untrusted, not instructions. Present only on
     * status=ok.
     */
    text?: string;

    /**
     * Whether the content was cut short, by max_chars or because the page exceeded the
     * 1 MiB read limit.
     */
    truncated?: boolean;
  }

  export namespace Content {
    export interface Error {
      /**
       * Machine-readable retrieval failure code.
       */
      code: string;

      /**
       * Human-readable failure description.
       */
      message: string;

      retryable: boolean;
    }
  }
}

export interface ContentFetchParams {
  /**
   * Defaults to source:auto when omitted.
   */
  content?: ContentFetchParams.Content;

  /**
   * Maximum number of search results to fetch when result_ids is omitted, starting
   * from rank 1. Mutually exclusive with result_ids.
   */
  limit?: number;

  /**
   * Kernel-generated IDs from the referenced retained search, in desired response
   * order. They are not provider-standard IDs. Mutually exclusive with limit.
   */
  result_ids?: Array<string>;

  /**
   * Overall deadline across all selected results.
   */
  timeout_ms?: number;
}

export namespace ContentFetchParams {
  /**
   * Defaults to source:auto when omitted.
   */
  export interface Content {
    /**
     * Requires source=auto or source=browser in deferred retrieval.
     */
    browser?: Content.Browser;

    format?: 'markdown' | 'text';

    /**
     * For source=auto, maximum acceptable age of retained provider content, measured
     * from when the search received it from the provider. A value of 0 disables reuse
     * of retained content, so every result is fetched through a browser.
     * source=provider reuses retained provider content without freshness validation.
     * source=browser always fetches through a browser and does not use this age limit.
     */
    max_age_hours?: number;

    /**
     * Per-result Unicode character limit after extraction. Retained provider content
     * cannot exceed what was stored at search time; such results report truncated when
     * the stored text was already truncated.
     */
    max_chars?: number;

    /**
     * auto uses retained provider content within max_age_hours; for deferred retrieval
     * it falls back to a Kernel browser (caller-supplied or temporary) for results
     * without it. Inline retrieval never uses a browser. provider reuses retained
     * provider content when available, without freshness validation, and never
     * provisions a browser. browser fetches each URL through a Kernel browser, either
     * caller-supplied or temporary. No option makes a new provider request. Defaults
     * to auto for both inline and deferred retrieval. Missing documents produce
     * per-result unavailable outcomes, not request failures.
     */
    source?: 'auto' | 'provider' | 'browser';

    /**
     * Per-result deadline including capacity acquisition, retrieval, and extraction.
     * Also bounded by the overall request deadline.
     */
    timeout_ms?: number;
  }

  export namespace Content {
    /**
     * Requires source=auto or source=browser in deferred retrieval.
     */
    export interface Browser {
      /**
       * Existing browser session ID authorized for the caller and selected project.
       * Reuses its cookies, proxy, and browser configuration; requests follow that
       * browser's existing network access behavior, with no additional destination
       * allowlist in this endpoint. Kernel does not delete a caller-supplied browser.
       * Render mode uses a temporary tab; website activity may still change shared
       * cookies and storage. When omitted and any result needs browser retrieval, Kernel
       * creates one temporary browser for the request using the dashboard launch
       * defaults (headful, stealth, default proxy), tags it with search_id, and deletes
       * it when the request finishes. It is billed and counts toward browser concurrency
       * like any other browser. A concurrency rejection returns 429 for source=browser;
       * for source=auto, results with retained content are still returned and the rest
       * report the rejection.
       */
      browser_id?: string;

      /**
       * Curl uses the browser HTTP stack without navigation or JavaScript execution.
       * Render navigates a temporary page and extracts from its DOM. The selected mode
       * is used for the retrieval.
       */
      mode?: 'curl' | 'render';
    }
  }
}

export declare namespace Contents {
  export {
    type FetchRequest as FetchRequest,
    type Response as Response,
    type ContentFetchParams as ContentFetchParams,
  };
}
