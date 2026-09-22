// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as SearchAPI from './search';
import * as ContentsAPI from './contents';
import { ContentFetchParams, Contents as ContentsAPIContents, FetchRequest, Response } from './contents';
import * as ProvidersAPI from './providers';
import { Provider, ProviderListParams, ProviderListResponse, Providers } from './providers';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Search the web and retrieve content for selected results.
 */
export class SearchResource extends APIResource {
  contents: ContentsAPI.Contents = new ContentsAPI.Contents(this._client);
  providers: ProvidersAPI.Providers = new ProvidersAPI.Providers(this._client);

  /**
   * Returns ranked results from one serving provider. The default strategy selects a
   * provider that supports the requested options. The fallback strategy tries
   * providers in the supplied order. Results are not blended across providers.
   * Portable filters may be approximated or omitted according to provider
   * capabilities; warnings describe those outcomes unless strict_params is true.
   * Native options apply only to their selected provider.
   *
   * @example
   * ```ts
   * const search = await client.search.create({ query: 'x' });
   * ```
   */
  create(body: SearchCreateParams, options?: RequestOptions): APIPromise<Search> {
    return this._client.post('/search', { body, ...options });
  }

  /**
   * Returns the retained search resource exactly as it was returned by POST /search:
   * results, attempts, warnings, usage, and expires_at. No provider is called and
   * nothing is billed. Use it to look up a search by ID for debugging, cost review,
   * or to recover result IDs before calling the contents endpoint. Inline content
   * fetched at search time is included; content fetched later through the contents
   * endpoint is not merged in. Missing, expired, or inaccessible searches
   * return 404.
   *
   * @example
   * ```ts
   * const search = await client.search.retrieve('srch_abc123');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<Search> {
    return this._client.get(path`/search/${id}`, options);
  }
}

export interface Attempt {
  duration_ms: number;

  outcome: 'success' | 'empty' | 'error' | 'timeout';

  provider: string;

  error_code?: string;

  retryable?: boolean;
}

/**
 * Provider name paired with its typed native options.
 */
export type ProviderTarget =
  | ProviderTarget.SearchBraveTarget
  | ProviderTarget.SearchExaTarget
  | ProviderTarget.SearchPerplexityTarget
  | ProviderTarget.SearchContextTarget
  | ProviderTarget.SearchParallelTarget
  | ProviderTarget.SearchValyuTarget
  | ProviderTarget.SearchOctenTarget
  | ProviderTarget.SearchYouTarget
  | ProviderTarget.SearchTavilyTarget
  | ProviderTarget.SearchSerpAPITarget;

export namespace ProviderTarget {
  export interface SearchBraveTarget {
    provider: 'brave';

    options?: SearchBraveTarget.Options;
  }

  export namespace SearchBraveTarget {
    export interface Options {
      /**
       * Provider-native count. Lower-only alias for max_results; cannot raise the
       * effective result cap.
       */
      count?: number;

      /**
       * Request additional snippets from Brave.
       */
      extra_snippets?: boolean;

      /**
       * Goggles re-ranking definition URL.
       */
      goggles?: string;

      /**
       * @deprecated Deprecated Brave Goggle identifier. Prefer goggles.
       */
      goggles_id?: string;

      /**
       * Include Brave's fetch metadata.
       */
      include_fetch_metadata?: boolean;

      /**
       * Page offset supported by Brave.
       */
      offset?: number;

      /**
       * Brave search operators.
       */
      operators?: string;

      /**
       * Comma-separated result types to include, e.g. "web,news".
       */
      result_filter?: string;

      /**
       * Language of the search, e.g. "en".
       */
      search_lang?: string;

      /**
       * Apply Brave's query spellcheck.
       */
      spellcheck?: boolean;

      /**
       * Language for UI strings in the response.
       */
      ui_lang?: string;

      /**
       * Measurement units.
       */
      units?: 'metric' | 'imperial';
    }
  }

  export interface SearchExaTarget {
    provider: 'exa';

    options?: SearchExaTarget.Options;
  }

  export namespace SearchExaTarget {
    export interface Options {
      /**
       * Provider data-category hint.
       */
      category?: string;

      /**
       * Provider-native compliance controls. Requires support and authorization on the
       * provider account.
       */
      compliance?: string;

      /**
       * Provider-native content retrieval. Available without requesting Kernel browser
       * retrieval; may incur provider retrieval charges.
       */
      contents?: Options.Contents;

      /**
       * Provider-native cache-age control. Unlike content.max_age_hours, this retains
       * Exa semantics, including any native sentinel values. It does not imply a
       * cross-provider freshness guarantee.
       */
      maxAgeHours?: number;

      /**
       * Provider-native count. Lower-only alias for max_results.
       */
      numResults?: number;

      /**
       * Search mode supported by Exa.
       */
      type?: 'auto' | 'fast' | 'instant';
    }

    export namespace Options {
      /**
       * Provider-native content retrieval. Available without requesting Kernel browser
       * retrieval; may incur provider retrieval charges.
       */
      export interface Contents {
        /**
         * Return query-relevant provider excerpts.
         */
        highlights?: boolean;

        /**
         * Return provider page text.
         */
        text?: boolean;
      }
    }
  }

  export interface SearchPerplexityTarget {
    provider: 'perplexity';

    options?: SearchPerplexityTarget.Options;
  }

  export namespace SearchPerplexityTarget {
    export interface Options {
      /**
       * MM/DD/YYYY. Filters by last-updated date, not published date.
       */
      last_updated_after_filter?: string;

      /**
       * MM/DD/YYYY upper bound on last-updated date.
       */
      last_updated_before_filter?: string;

      /**
       * Provider-native count. Lower-only alias for max_results.
       */
      max_results?: number;

      /**
       * Values outside the documented range are rejected.
       */
      max_tokens?: number;

      /**
       * Per-page token cap.
       */
      max_tokens_per_page?: number;

      /**
       * Provider-native multi-query form, applied only to Perplexity. Other fallback
       * providers receive the top-level query. Each query may incur a separate provider
       * charge.
       */
      query?: Array<string>;

      /**
       * Provider context size supported by the selected model.
       */
      search_context_size?: 'low' | 'medium' | 'high';

      /**
       * ISO 639-1 language codes, max 20.
       */
      search_language_filter?: Array<string>;
    }
  }

  export interface SearchContextTarget {
    provider: 'context';

    options?: SearchContextTarget.Options;
  }

  export namespace SearchContextTarget {
    export interface Options {
      /**
       * ISO 3166-1 alpha-2 country code.
       */
      country?: string;

      /**
       * Blocklist of result domains.
       */
      excludeDomains?: Array<string>;

      /**
       * Restrict results to content published within this window.
       */
      freshness?: 'last_24_hours' | 'last_week' | 'last_month' | 'last_year';

      /**
       * Allowlist of result domains.
       */
      includeDomains?: Array<string>;

      markdownOptions?: Options.MarkdownOptions;

      /**
       * Number of results to request from Context.dev.
       */
      numResults?: number;

      /**
       * Expand the query into multiple parallel variants.
       */
      queryFanout?: boolean;

      /**
       * Usage tracking tags.
       */
      tags?: Array<string>;

      /**
       * Context.dev request timeout in milliseconds.
       */
      timeoutMS?: number;
    }

    export namespace Options {
      export interface MarkdownOptions {
        enabled?: boolean;

        includeFrames?: boolean;

        includeImages?: boolean;

        includeLinks?: boolean;

        maxAgeMs?: number;

        pdf?: MarkdownOptions.Pdf;

        shortenBase64Images?: boolean;

        timeoutMS?: number;

        useMainContentOnly?: boolean;

        waitForMs?: number;
      }

      export namespace MarkdownOptions {
        export interface Pdf {
          shouldParse?: boolean;
        }
      }
    }
  }

  export interface SearchParallelTarget {
    provider: 'parallel';

    options?: SearchParallelTarget.Options;
  }

  export namespace SearchParallelTarget {
    export interface Options {
      /**
       * Explicit search settings. Unified search parameters are re-applied to
       * overlapping settings; native result counts are lower-only.
       */
      advanced_settings?: Options.AdvancedSettings;

      /**
       * Client model hint.
       */
      client_model?: string;

      /**
       * Cap total characters returned.
       */
      max_chars_total?: number;

      /**
       * Search mode. Basic is used when omitted; each mode can have different latency
       * and charges.
       */
      mode?: 'turbo' | 'fast' | 'basic' | 'advanced';

      /**
       * The goal behind the search, stated separately from the query.
       */
      objective?: string;

      /**
       * Provider-native multi-query search. Defaults to [query] for this provider.
       */
      search_queries?: Array<string>;

      /**
       * Group related searches.
       */
      session_id?: string;
    }

    export namespace Options {
      /**
       * Explicit search settings. Unified search parameters are re-applied to
       * overlapping settings; native result counts are lower-only.
       */
      export interface AdvancedSettings {
        excerpt_settings?: AdvancedSettings.ExcerptSettings;

        fetch_policy?: AdvancedSettings.FetchPolicy;

        /**
         * Native ISO 3166-1 alpha-2 location preference.
         */
        location?: string | null;

        /**
         * Native count; lower-only alias for unified max_results.
         */
        max_results?: number | null;

        source_policy?: AdvancedSettings.SourcePolicy;
      }

      export namespace AdvancedSettings {
        export interface ExcerptSettings {
          max_chars_per_result?: number | null;
        }

        export interface FetchPolicy {
          /**
           * When false, the provider may return cached content after live fetching fails.
           */
          disable_cache_fallback?: boolean;

          /**
           * Native live-fetch trigger; minimum 600 seconds. Not the unified hard-freshness
           * control.
           */
          max_age_seconds?: number | null;

          /**
           * Native live-fetch timeout, bounded by the remaining overall deadline.
           */
          timeout_seconds?: number | null;
        }

        export interface SourcePolicy {
          /**
           * Native publication-date lower bound.
           */
          after_date?: string | null;

          /**
           * Native exclusions; the provider ignores these when native include_domains is
           * non-empty.
           */
          exclude_domains?: Array<string>;

          /**
           * Native domain/path restrictions. Explicit unified domain parameters take
           * precedence. Combined include/exclude native lists cannot exceed 200 entries.
           */
          include_domains?: Array<string>;
        }
      }
    }
  }

  export interface SearchValyuTarget {
    provider: 'valyu';

    options?: SearchValyuTarget.Options;
  }

  export namespace SearchValyuTarget {
    export interface Options {
      /**
       * Trade depth for latency.
       */
      fast_mode?: boolean;

      /**
       * Allow historical cached results.
       */
      historical_cache?: boolean;

      /**
       * Include abstracts for academic sources.
       */
      include_abstracts?: boolean;

      /**
       * Natural-language retrieval guidance.
       */
      instructions?: string;

      /**
       * Mark the search as an agent tool call.
       */
      is_tool_call?: boolean;

      /**
       * Provider-native count. Lower-only alias for max_results.
       */
      max_num_results?: number;

      /**
       * Provider-native USD-per-thousand-results price ceiling. Forwarded to Valyu.
       */
      max_price?: number;

      /**
       * Provider-native minimum relevance threshold. Not a normalized cross-provider
       * score.
       */
      relevance_threshold?: number;

      /**
       * Provider result-content length preset.
       */
      response_length?: 'short' | 'medium' | 'large' | 'max';

      /**
       * Corpus selector, including all, web, proprietary, and news. Provider corpus
       * choice may change billing; Kernel does not force web-only searches.
       */
      search_type?: string;

      /**
       * Bias retrieval toward these sources.
       */
      source_biases?: Array<string>;

      /**
       * Return URLs without content.
       */
      url_only?: boolean;
    }
  }

  export interface SearchOctenTarget {
    provider: 'octen';

    options?: SearchOctenTarget.Options;
  }

  export namespace SearchOctenTarget {
    export interface Options {
      count?: number;

      end_time?: string;

      exclude_domains?: Array<string>;

      exclude_text?: Array<string>;

      format?: 'markdown' | 'text';

      full_content?: Options.FullContent;

      highlight?: Options.Highlight;

      include_domains?: Array<string>;

      include_images?: boolean;

      include_text?: Array<string>;

      language?: Array<string>;

      safesearch?: 'off' | 'strict';

      start_time?: string;

      time_basis?: 'auto' | 'published' | 'crawled';

      time_range?: 'day' | 'week' | 'month' | 'year' | 'd' | 'w' | 'm' | 'y';

      topic?: 'general' | 'news';
    }

    export namespace Options {
      export interface FullContent {
        enable?: boolean;

        max_tokens?: number;
      }

      export interface Highlight {
        enable?: boolean;

        max_tokens?: number;
      }
    }
  }

  export interface SearchYouTarget {
    provider: 'you';

    options?: SearchYouTarget.Options;
  }

  export namespace SearchYouTarget {
    export interface Options {
      /**
       * Prefer these domains without excluding others. Cannot be combined with
       * include_domains if the provider does not accept the combination.
       */
      boost_domains?: Array<string>;

      /**
       * Provider-native per-section count. Lower-only alias for max_results. Web and
       * news sections may produce more rows than Kernel returns.
       */
      count?: number;

      /**
       * Native extraction timeout in seconds, bounded by the remaining Kernel request
       * deadline.
       */
      crawl_timeout?: number;

      /**
       * Provider-native page extraction. Both modes may incur per-row charges; full_page
       * may retrieve web and news rows.
       */
      extraction?: Options.Extraction;

      /**
       * Request licensed-data output. URL-less knowledge entries are not converted into
       * web results; include_raw exposes the full provider response separately.
       */
      knowledge?: 'core';

      /**
       * BCP 47 result language from You.com's 51-value enum, e.g. "EN", "JA". Default
       * EN.
       */
      language?: string;

      /**
       * Page offset supported by You.com.
       */
      offset?: number;
    }

    export namespace Options {
      /**
       * Provider-native page extraction. Both modes may incur per-row charges; full_page
       * may retrieve web and news rows.
       */
      export interface Extraction {
        extraction_mode: 'highlights' | 'full_page';

        full_page?: Extraction.FullPage;
      }

      export namespace Extraction {
        export interface FullPage {
          extraction_formats?: Array<'html' | 'markdown'>;
        }
      }
    }
  }

  export interface SearchTavilyTarget {
    provider: 'tavily';

    options?: SearchTavilyTarget.Options;
  }

  export namespace SearchTavilyTarget {
    export interface Options {
      /**
       * Allow the provider to choose search parameters. May select a different billing
       * tier; explicit caller values retain provider-native precedence.
       */
      auto_parameters?: boolean;

      /**
       * Provider excerpts per source, up to 500 characters each.
       */
      chunks_per_source?: number;

      /**
       * Require the quoted phrases in the query verbatim, bypassing semantic matches.
       */
      exact_match?: boolean;

      /**
       * Strictly filter non-matching languages. Requires `language`.
       */
      filter_by_language?: boolean;

      /**
       * Request the provider's generated answer. Returned as answer on the search
       * response, independently of include_raw.
       */
      include_answer?: boolean | 'basic' | 'advanced';

      /**
       * Native filter versus ranking boost semantics. Boost influences ranking rather
       * than restricting results to the listed domains. Requires include_domains.
       */
      include_domains_mode?: 'filter' | 'boost';

      /**
       * Favicon URL per result.
       */
      include_favicon?: boolean;

      /**
       * Describe each image. Needs include_images.
       */
      include_image_descriptions?: boolean;

      /**
       * Query-related images plus per-result images.
       */
      include_images?: boolean;

      /**
       * Request native full-page content. Defaults to markdown when omitted for this
       * provider, False disables that native retrieval; it does not disable explicitly
       * requested Kernel browser retrieval.
       */
      include_raw_content?: boolean | 'markdown' | 'text';

      /**
       * ISO 639-1 code or English language name. Ranking boost unless
       * filter_by_language.
       */
      language?: string;

      /**
       * Provider-native count. Lower-only alias for max_results.
       */
      max_results?: number;

      /**
       * Provider relevance and latency tier. Some tiers cannot be combined with native
       * safe search; conflicts are described in warnings.
       */
      search_depth?: 'advanced' | 'basic' | 'fast' | 'ultra-fast';

      /**
       * Provider corpus selector. Publication metadata depends on the selected topic.
       */
      topic?: 'general' | 'news' | 'finance';
    }
  }

  export interface SearchSerpAPITarget {
    provider: 'serpapi';

    options?: SearchSerpAPITarget.Options;
  }

  export namespace SearchSerpAPITarget {
    export interface Options {
      /**
       * SerpApi engine identifier. The Kernel integration currently supports google
       * only.
       */
      engine: string;

      /**
       * Device profile used for the search.
       */
      device?: 'desktop' | 'mobile' | 'tablet';

      /**
       * Google duplicate-content filter.
       */
      filter?: 0 | 1;

      /**
       * Two-letter Google country code.
       */
      gl?: string;

      /**
       * Google domain to search when using the google engine.
       */
      google_domain?: string;

      /**
       * Interface language code.
       */
      hl?: string;

      /**
       * Free-form geographic location used for localized results.
       */
      location?: string;

      /**
       * Google auto-correction filter.
       */
      nfpr?: 0 | 1;

      /**
       * When true, bypass SerpApi cached results when supported.
       */
      no_cache?: boolean;

      /**
       * Number of results requested from the search engine.
       */
      num?: number;

      /**
       * Safe-search setting for engines that support it.
       */
      safe?: 'active' | 'off';

      /**
       * Zero-based result offset for pagination.
       */
      start?: number;

      /**
       * Google vertical search selector, such as images, video, news, or shopping.
       */
      tbm?: string;

      /**
       * Google time and search modifiers, including freshness filters.
       */
      tbs?: string;
    }
  }
}

export interface Request {
  /**
   * Primary search query. A provider-native multi-query option applies only to that
   * provider; other providers in a fallback chain receive this query.
   */
  query: string;

  /**
   * Optional portable content retrieval. Pass true for defaults or an options
   * object. Omission never starts Kernel browser work; provider-supplied content is
   * still returned when available, including when requested through native options.
   * Both inline and deferred retrieval use the same options schema.
   */
  content?: true | Request.SearchContentOptions;

  /**
   * ISO 3166-1 alpha-2 search locale preference.
   */
  country?: string;

  /**
   * Inclusive publication-date upper bound; must not precede start_date. If recency
   * is also supplied, recency takes precedence with a warning. Unsupported or
   * approximated filtering is reported, or rejected under strict_params.
   */
  end_date?: string;

  /**
   * Hostname exclusions, with the same best-effort/strict behavior as
   * include_domains. Provider-specific combinations that cannot be represented are
   * reported via warnings or rejected in strict mode.
   */
  exclude_domains?: Array<string>;

  /**
   * Hostname inclusion preference, matching a hostname and its subdomains. Empty
   * means unrestricted. Translated, emulated, or dropped with a warning according to
   * provider capability unless strict_params is true. Native boost modes remain
   * advisory and are identified in warnings.
   */
  include_domains?: Array<string>;

  /**
   * Include untouched per-result payloads and the full serving-provider response in
   * raw fields. Off by default; native top-level outputs such as answer remain
   * available without it.
   */
  include_raw?: boolean;

  /**
   * BCP 47 search language preference.
   */
  language?: string;

  /**
   * Requested result count from 1 through 100. The effective count is clamped to the
   * serving provider's cap with a warning. Effective native counts are the lower of
   * this limit and supplied provider-native count aliases. Strict mode rejects
   * unsupported counts.
   */
  max_results?: number;

  /**
   * Relative search window. Takes precedence over start_date/end_date with a warning
   * if both are set. Provider-native recency behavior is retained, including
   * documented hour-to-day widening. Unsupported filters are rejected only in strict
   * mode.
   */
  recency?: 'hour' | 'day' | 'week' | 'month' | 'year';

  /**
   * Optional safety preference. Omit to use provider defaults. Unsupported values
   * are dropped with a warning unless strict_params is true. A search filter is not
   * an authorization boundary.
   */
  safe_search?: 'off' | 'moderate' | 'strict';

  /**
   * Inclusive publication-date lower bound. If recency is also supplied, recency
   * takes precedence with a warning. Provider date semantics, precision, and
   * unsupported filters are reported; unknown source dates are not fabricated or
   * universally post-filtered.
   */
  start_date?: string;

  /**
   * Omitted strategy defaults to auto.
   */
  strategy?: Strategy;

  /**
   * When false, unsupported portable parameters are omitted and approximations are
   * described in warnings. When true, every supplied portable parameter must be
   * honored exactly. Requests that cannot be served with those parameters are
   * rejected. This does not guarantee identical rankings or document timestamps
   * across indexes. Authentication and project isolation are always enforced.
   */
  strict_params?: boolean;

  /**
   * Overall deadline across search attempts and inline retrieval. No new attempt
   * starts after the deadline. Completed search results survive inline retrieval
   * timeouts.
   */
  timeout_ms?: number;
}

export namespace Request {
  export interface SearchContentOptions {
    /**
     * Invalid with source=provider. Supplying browser_id requires source=browser so
     * the chosen identity is not bypassed.
     */
    browser?: SearchContentOptions.Browser;

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

  export namespace SearchContentOptions {
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

export interface Result {
  /**
   * Kernel-generated identifier for this result. Stable only within the retained
   * search; not standardized across providers. Provider-native IDs, when available,
   * remain provider-specific raw fields.
   */
  id: string;

  /**
   * One-based position in the returned ranking.
   */
  rank: number;

  /**
   * Provider-returned URL, not assumed canonical.
   */
  url: string;

  additional_snippets?: Array<string>;

  /**
   * Portable retrieval outcome, or native content supplied by the search provider.
   * Identity fields remain on the enclosing result. Native excerpts are labeled
   * excerpt rather than full_page. Omission never triggers browser retrieval.
   */
  content?: Result.Content;

  /**
   * Provider-supplied date or timestamp, preserving available precision. No
   * publication date is fabricated. Retains the published field name.
   */
  published_date?: string | null;

  /**
   * Original provider result, included only with include_raw=true. Provider
   * relevance scores are not normalized. Top-level provider data is available in
   * Search.raw.
   */
  raw?: unknown;

  snippet?: string | null;

  /**
   * Provider source name or result URL hostname, when available.
   */
  source?: string | null;

  title?: string | null;
}

export namespace Result {
  /**
   * Portable retrieval outcome, or native content supplied by the search provider.
   * Identity fields remain on the enclosing result. Native excerpts are labeled
   * excerpt rather than full_page. Omission never triggers browser retrieval.
   */
  export interface Content {
    /**
     * Ok means non-empty extracted content, not merely HTTP 200. Blocked includes
     * detected challenges or access denials. Detection is best-effort, not a guarantee
     * of page completeness. Error details are present for non-ok outcomes; text is
     * present only on ok.
     */
    status: 'ok' | 'unavailable' | 'blocked' | 'timeout' | 'unsupported_type' | 'extraction_failed' | 'error';

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

/**
 * Retained search results and provider attempt history.
 */
export interface Search {
  /**
   * Search resource ID. Request tracing uses X-Request-Id.
   */
  id: string;

  attempts: Array<Attempt>;

  /**
   * Expiration of result IDs for deferred retrieval. Results expire 24 hours after
   * search completion.
   */
  expires_at: string;

  /**
   * Concrete serving provider, never auto or fallback.
   */
  provider: string;

  /**
   * Echo of the query. Native multi-query inputs are visible in the selected
   * strategy target and the optional raw response.
   */
  query: string;

  results: Array<Result>;

  usage: Usage;

  warnings: Array<Warning>;

  /**
   * Provider-generated answer when requested (e.g. via Tavily include_answer or
   * Perplexity). Preserved independently of include_raw.
   */
  answer?: string;

  /**
   * Full serving-provider response, including top-level metadata that does not
   * belong to a result. Present only with include_raw=true; untrusted provider data.
   */
  raw?: unknown;
}

/**
 * Typed provider selection and routing strategy.
 */
export type Strategy =
  | Strategy.SearchAutoStrategy
  | Strategy.SearchPinnedStrategy
  | Strategy.SearchFallbackStrategy;

export namespace Strategy {
  export interface SearchAutoStrategy {
    /**
     * Let Kernel choose an eligible provider by capability fit.
     */
    type: 'auto';

    /**
     * Conditions that advance to the next provider under auto routing or an explicit
     * providers chain. Ignored when provider pins a single provider. error means a
     * retryable provider failure, including rate limiting, not invalid caller input or
     * caller quotas. empty means zero results after required filtering. An empty list
     * disables fallback. If every attempt is empty or fails, the response is the first
     * valid empty response with the full attempt trail, or a 502 if none succeeded.
     */
    fallback_on?: Array<'error' | 'timeout' | 'empty'>;

    /**
     * Provider targets available to auto routing, each paired with typed native
     * options. Provider names must be unique.
     */
    provider_options?: Array<SearchAPI.ProviderTarget>;
  }

  export interface SearchPinnedStrategy {
    /**
     * Provider name paired with its typed native options.
     */
    provider: SearchAPI.ProviderTarget;

    /**
     * Use exactly the selected provider with no cross-provider fallback.
     */
    type: 'pinned';
  }

  export interface SearchFallbackStrategy {
    /**
     * Ordered provider targets. Provider names must be unique.
     */
    providers: Array<SearchAPI.ProviderTarget>;

    /**
     * Try providers in order and advance when fallback_on matches the outcome.
     */
    type: 'fallback';

    /**
     * Conditions that advance to the next provider under auto routing or an explicit
     * providers chain. Ignored when provider pins a single provider. error means a
     * retryable provider failure, including rate limiting, not invalid caller input or
     * caller quotas. empty means zero results after required filtering. An empty list
     * disables fallback. If every attempt is empty or fails, the response is the first
     * valid empty response with the full attempt trail, or a 502 if none succeeded.
     */
    fallback_on?: Array<'error' | 'timeout' | 'empty'>;
  }
}

export interface Usage {
  /**
   * Number of result URLs for which a Kernel browser retrieval was attempted,
   * excluding cache-only hits.
   */
  content_fetches: number;

  /**
   * Number of result entries returned, including failed entries on the contents
   * endpoint.
   */
  results_count: number;

  /**
   * Total customer charge in USD when billing data is available.
   */
  cost?: number;
}

export interface Warning {
  /**
   * Examples: param_unsupported, preference_unsupported, max_results_clamped,
   * domains_truncated, recency_emulated, filter_emulated, date_filter_overridden,
   * provider_ineligible, fallback_failed, content_partial.
   */
  code: string;

  message: string;

  param?: string;

  provider?: string;

  result_id?: string;
}

export interface SearchCreateParams {
  /**
   * Primary search query. A provider-native multi-query option applies only to that
   * provider; other providers in a fallback chain receive this query.
   */
  query: string;

  /**
   * Optional portable content retrieval. Pass true for defaults or an options
   * object. Omission never starts Kernel browser work; provider-supplied content is
   * still returned when available, including when requested through native options.
   * Both inline and deferred retrieval use the same options schema.
   */
  content?: true | SearchCreateParams.SearchContentOptions;

  /**
   * ISO 3166-1 alpha-2 search locale preference.
   */
  country?: string;

  /**
   * Inclusive publication-date upper bound; must not precede start_date. If recency
   * is also supplied, recency takes precedence with a warning. Unsupported or
   * approximated filtering is reported, or rejected under strict_params.
   */
  end_date?: string;

  /**
   * Hostname exclusions, with the same best-effort/strict behavior as
   * include_domains. Provider-specific combinations that cannot be represented are
   * reported via warnings or rejected in strict mode.
   */
  exclude_domains?: Array<string>;

  /**
   * Hostname inclusion preference, matching a hostname and its subdomains. Empty
   * means unrestricted. Translated, emulated, or dropped with a warning according to
   * provider capability unless strict_params is true. Native boost modes remain
   * advisory and are identified in warnings.
   */
  include_domains?: Array<string>;

  /**
   * Include untouched per-result payloads and the full serving-provider response in
   * raw fields. Off by default; native top-level outputs such as answer remain
   * available without it.
   */
  include_raw?: boolean;

  /**
   * BCP 47 search language preference.
   */
  language?: string;

  /**
   * Requested result count from 1 through 100. The effective count is clamped to the
   * serving provider's cap with a warning. Effective native counts are the lower of
   * this limit and supplied provider-native count aliases. Strict mode rejects
   * unsupported counts.
   */
  max_results?: number;

  /**
   * Relative search window. Takes precedence over start_date/end_date with a warning
   * if both are set. Provider-native recency behavior is retained, including
   * documented hour-to-day widening. Unsupported filters are rejected only in strict
   * mode.
   */
  recency?: 'hour' | 'day' | 'week' | 'month' | 'year';

  /**
   * Optional safety preference. Omit to use provider defaults. Unsupported values
   * are dropped with a warning unless strict_params is true. A search filter is not
   * an authorization boundary.
   */
  safe_search?: 'off' | 'moderate' | 'strict';

  /**
   * Inclusive publication-date lower bound. If recency is also supplied, recency
   * takes precedence with a warning. Provider date semantics, precision, and
   * unsupported filters are reported; unknown source dates are not fabricated or
   * universally post-filtered.
   */
  start_date?: string;

  /**
   * Omitted strategy defaults to auto.
   */
  strategy?: Strategy;

  /**
   * When false, unsupported portable parameters are omitted and approximations are
   * described in warnings. When true, every supplied portable parameter must be
   * honored exactly. Requests that cannot be served with those parameters are
   * rejected. This does not guarantee identical rankings or document timestamps
   * across indexes. Authentication and project isolation are always enforced.
   */
  strict_params?: boolean;

  /**
   * Overall deadline across search attempts and inline retrieval. No new attempt
   * starts after the deadline. Completed search results survive inline retrieval
   * timeouts.
   */
  timeout_ms?: number;
}

export namespace SearchCreateParams {
  export interface SearchContentOptions {
    /**
     * Invalid with source=provider. Supplying browser_id requires source=browser so
     * the chosen identity is not bypassed.
     */
    browser?: SearchContentOptions.Browser;

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

  export namespace SearchContentOptions {
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

SearchResource.Contents = ContentsAPIContents;
SearchResource.Providers = Providers;

export declare namespace SearchResource {
  export {
    type Attempt as Attempt,
    type ProviderTarget as ProviderTarget,
    type Request as Request,
    type Result as Result,
    type Search as Search,
    type Strategy as Strategy,
    type Usage as Usage,
    type Warning as Warning,
    type SearchCreateParams as SearchCreateParams,
  };

  export {
    ContentsAPIContents as Contents,
    type FetchRequest as FetchRequest,
    type Response as Response,
    type ContentFetchParams as ContentFetchParams,
  };

  export {
    Providers as Providers,
    type Provider as Provider,
    type ProviderListResponse as ProviderListResponse,
    type ProviderListParams as ProviderListParams,
  };
}
