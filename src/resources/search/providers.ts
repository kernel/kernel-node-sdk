// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

/**
 * Search the web and retrieve content for selected results.
 */
export class Providers extends APIResource {
  /**
   * Lists providers, capabilities, and machine-readable native-option schemas. Auto
   * and fallback are strategies, not provider entries. The list is not paginated and
   * contains no latency benchmarks. X-Request-Id identifies the request.
   *
   * @example
   * ```ts
   * const providers = await client.search.providers.list();
   * ```
   */
  list(
    query: ProviderListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ProviderListResponse> {
    return this._client.get('/search/providers', { query, ...options });
  }
}

export interface Provider {
  content: Provider.Content;

  max_results_cap: number;

  params: Provider.Params;

  provider_options: Provider.ProviderOptions;

  slug: string;

  /**
   * Provider-specific limitations, conditional filter support, and warnings about
   * search modes.
   */
  notes?: Array<string>;
}

export namespace Provider {
  export interface Content {
    /**
     * Can enforce the requested maximum content age.
     */
    freshness_control: boolean;

    /**
     * Supports content retrieval with the search request.
     */
    inline: boolean;

    /**
     * Supports content retrieval after the search completes.
     */
    post_hoc: boolean;
  }

  export interface Params {
    country: Params.Country;

    end_date: Params.EndDate;

    exclude_domains: Params.ExcludeDomains;

    include_domains: Params.IncludeDomains;

    language: Params.Language;

    recency: Params.Recency;

    safe_search: Params.SafeSearch;

    start_date: Params.StartDate;
  }

  export namespace Params {
    export interface Country {
      support: 'native' | 'emulated' | 'unsupported';

      /**
       * Translation behavior, limitations, and precision.
       */
      notes?: string;
    }

    export interface EndDate {
      support: 'native' | 'emulated' | 'unsupported';

      /**
       * Translation behavior, limitations, and precision.
       */
      notes?: string;
    }

    export interface ExcludeDomains {
      support: 'native' | 'emulated' | 'unsupported';

      /**
       * Translation behavior, limitations, and precision.
       */
      notes?: string;
    }

    export interface IncludeDomains {
      support: 'native' | 'emulated' | 'unsupported';

      /**
       * Translation behavior, limitations, and precision.
       */
      notes?: string;
    }

    export interface Language {
      support: 'native' | 'emulated' | 'unsupported';

      /**
       * Translation behavior, limitations, and precision.
       */
      notes?: string;
    }

    export interface Recency {
      support: 'native' | 'emulated' | 'unsupported';

      /**
       * Translation behavior, limitations, and precision.
       */
      notes?: string;
    }

    export interface SafeSearch {
      support: 'native' | 'emulated' | 'unsupported';

      /**
       * Translation behavior, limitations, and precision.
       */
      notes?: string;
    }

    export interface StartDate {
      support: 'native' | 'emulated' | 'unsupported';

      /**
       * Translation behavior, limitations, and precision.
       */
      notes?: string;
    }
  }

  export interface ProviderOptions {
    /**
     * JSON Schema for the provider-native options accepted by POST /search.
     */
    schema: { [key: string]: unknown };

    /**
     * OpenAPI component name for the matching typed provider-options schema.
     */
    schema_ref: string;

    examples?: Array<{ [key: string]: unknown }>;
  }
}

export type ProviderListResponse = Array<Provider>;

export interface ProviderListParams {
  /**
   * Optional concrete provider slug filter. Omit to list every provider. A slug that
   * is not listed returns an empty array.
   */
  slug?:
    | 'brave'
    | 'exa'
    | 'perplexity'
    | 'context'
    | 'parallel'
    | 'valyu'
    | 'octen'
    | 'you'
    | 'tavily'
    | 'serpapi';
}

export declare namespace Providers {
  export {
    type Provider as Provider,
    type ProviderListResponse as ProviderListResponse,
    type ProviderListParams as ProviderListParams,
  };
}
