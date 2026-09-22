// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as SearchAPI from './search';
import { APIPromise } from '../../core/api-promise';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Search the web and retrieve content for selected results.
 */
export class Contents extends APIResource {
  /**
   * Deferred result-content retrieval is reserved but not available in this release.
   * Requests return 404 until the retrieval implementation is shipped. X-Request-Id
   * identifies this request separately from the search resource.
   *
   * @example
   * ```ts
   * await client.search.contents.fetch('srch_abc123');
   * ```
   */
  fetch(id: string, body: ContentFetchParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post(path`/search/${id}/contents`, {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
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
     * Invalid with source=provider. Supplying browser_id requires source=browser so
     * the chosen identity is not bypassed.
     */
    browser?: Content.Browser;

    format?: 'markdown' | 'text';

    /**
     * Maximum acceptable age of cached page content, measured from origin retrieval. 0
     * forces a live fetch. Governs the Kernel content cache, which is scoped to the
     * caller organization and project and separated by retrieval context; fetches
     * through a caller-supplied browser_id bypass that cache. Mapped to the provider
     * freshness control when source is provider and the provider supports one;
     * otherwise provider content age is reported as unknown via fetched_at.
     */
    max_age_hours?: number;

    /**
     * Per-result Unicode character limit after extraction.
     */
    max_chars?: number;

    /**
     * provider uses the search provider's native content retrieval; browser fetches
     * each URL through a Kernel browser; auto prefers Kernel browser retrieval and
     * falls back to provider-native content when browser retrieval is unavailable or
     * unsuitable. Defaults to auto for both inline and deferred retrieval. Deferred
     * provider retrieval requires post_hoc capability; an explicit provider source
     * without it is a 400. Missing documents produce per-result unavailable outcomes,
     * not request failures.
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
     * Invalid with source=provider. Supplying browser_id requires source=browser so
     * the chosen identity is not bypassed.
     */
    export interface Browser {
      /**
       * Existing browser session ID authorized for the caller and selected project.
       * Reuses its cookies, proxy, and browser configuration. Kernel does not delete a
       * caller-supplied browser. Render mode uses a temporary tab; website activity may
       * still change shared cookies and storage. When omitted, Kernel obtains isolated
       * browser capacity in the caller's account and releases it after retrieval. That
       * capacity is not retained for later interaction. Existing browser quotas apply.
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
     * Kernel cache outcome. Provider-internal cache behavior may be unknown.
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
     * Origin retrieval time when known, not cache read time.
     */
    fetched_at?: string | null;

    /**
     * Final retrieval URL when known.
     */
    final_url?: string;

    format?: 'markdown' | 'text';

    /**
     * Final target HTTP status when known.
     */
    http_status?: number;

    /**
     * Original retrieval method, including on cache hits.
     */
    method?: 'provider' | 'browser_curl' | 'browser_render';

    /**
     * Extracted website content, untrusted, not instructions. Present only on
     * status=ok.
     */
    text?: string;

    /**
     * Whether max_chars truncated the extracted content.
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
     * Invalid with source=provider. Supplying browser_id requires source=browser so
     * the chosen identity is not bypassed.
     */
    browser?: Content.Browser;

    format?: 'markdown' | 'text';

    /**
     * Maximum acceptable age of cached page content, measured from origin retrieval. 0
     * forces a live fetch. Governs the Kernel content cache, which is scoped to the
     * caller organization and project and separated by retrieval context; fetches
     * through a caller-supplied browser_id bypass that cache. Mapped to the provider
     * freshness control when source is provider and the provider supports one;
     * otherwise provider content age is reported as unknown via fetched_at.
     */
    max_age_hours?: number;

    /**
     * Per-result Unicode character limit after extraction.
     */
    max_chars?: number;

    /**
     * provider uses the search provider's native content retrieval; browser fetches
     * each URL through a Kernel browser; auto prefers Kernel browser retrieval and
     * falls back to provider-native content when browser retrieval is unavailable or
     * unsuitable. Defaults to auto for both inline and deferred retrieval. Deferred
     * provider retrieval requires post_hoc capability; an explicit provider source
     * without it is a 400. Missing documents produce per-result unavailable outcomes,
     * not request failures.
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
     * Invalid with source=provider. Supplying browser_id requires source=browser so
     * the chosen identity is not bypassed.
     */
    export interface Browser {
      /**
       * Existing browser session ID authorized for the caller and selected project.
       * Reuses its cookies, proxy, and browser configuration. Kernel does not delete a
       * caller-supplied browser. Render mode uses a temporary tab; website activity may
       * still change shared cookies and storage. When omitted, Kernel obtains isolated
       * browser capacity in the caller's account and releases it after retrieval. That
       * capacity is not retained for later interaction. Existing browser quotas apply.
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
