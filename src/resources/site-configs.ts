// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as Shared from './shared';
import { APIPromise } from '../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

/**
 * Resolve browser and proxy recommendations for bot-protected sites.
 */
export class SiteConfigs extends APIResource {
  /**
   * Returns a project-scoped historical analysis and the recommendation outcome
   * concluded by that run. Later knowledge does not change this response.
   *
   * @example
   * ```ts
   * const siteConfigResponse =
   *   await client.siteConfigs.retrieve('id');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<SiteConfigResponse> {
    return this._client.get(path`/site-configs/${id}`, options);
  }

  /**
   * Lists analyses for the selected project, newest first.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const analysisSummary of client.siteConfigs.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: SiteConfigListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<AnalysisSummariesOffsetPagination, AnalysisSummary> {
    return this._client.getAPIList('/site-configs', OffsetPagination<AnalysisSummary>, { query, ...options });
  }

  /**
   * Lists unique domains previously analyzed by the selected project with their
   * current domain-level recommendations.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const recommendationSummary of client.siteConfigs.listRecommendations()) {
   *   // ...
   * }
   * ```
   */
  listRecommendations(
    query: SiteConfigListRecommendationsParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<RecommendationSummariesOffsetPagination, RecommendationSummary> {
    return this._client.getAPIList('/site-configs/recommendations', OffsetPagination<RecommendationSummary>, {
      query,
      ...options,
    });
  }

  /**
   * Returns current global knowledge without resolving DNS, creating an analysis, or
   * updating Site Config data.
   *
   * @example
   * ```ts
   * const lookupResponse = await client.siteConfigs.lookup({
   *   url: 'https://example.com',
   * });
   * ```
   */
  lookup(body: SiteConfigLookupParams, options?: RequestOptions): APIPromise<LookupResponse> {
    return this._client.post('/site-configs/lookup', { body, ...options });
  }

  /**
   * Explicitly starts or retries a project-scoped background analysis while
   * preserving current global knowledge when available. Use `/site-configs/lookup`
   * for side-effect-free reads.
   *
   * @example
   * ```ts
   * const siteConfigResponse = await client.siteConfigs.resolve(
   *   { url: 'https://example.com' },
   * );
   * ```
   */
  resolve(body: SiteConfigResolveParams, options?: RequestOptions): APIPromise<SiteConfigResponse> {
    return this._client.post('/site-configs/resolve', { body, ...options });
  }
}

export type AnalysisSummariesOffsetPagination = OffsetPagination<AnalysisSummary>;

export type RecommendationSummariesOffsetPagination = OffsetPagination<RecommendationSummary>;

export interface Analysis {
  /**
   * Discovery run ID used to poll analysis status.
   */
  id: string;

  /**
   * Time the analysis was created.
   */
  created_at: string;

  /**
   * Present for failed or canceled analyses. Messages contain safe retry guidance
   * rather than internal workflow errors.
   */
  failure: Shared.ErrorModel | null;

  /**
   * Time the analysis reached a terminal status. Null while it is running.
   */
  finished_at: string | null;

  /**
   * Lifecycle status of the background analysis.
   */
  status: 'running' | 'completed' | 'failed' | 'canceled';
}

export interface AnalysisSummary {
  analysis: Analysis;

  target: Target;
}

/**
 * Browser settings that can be passed directly to `POST /browsers`.
 */
export interface Browser {
  gpu: boolean;

  headless: boolean;

  stealth: boolean;

  /**
   * Initial browser window size in pixels with optional refresh rate. If omitted,
   * image defaults apply (1920x1080@25). For GPU images, the default is
   * 1920x1080@60. Arbitrary viewport dimensions and refresh rates are accepted.
   * Known-good presets include: 2560x1440@10, 1920x1080@25, 1920x1200@25,
   * 1440x900@25, 1280x800@60, 1024x768@60, 1200x800@60, 768x1024@60, 390x844@60. For
   * GPU images, recommended presets use one of these resolutions with refresh rates
   * 60, 30, 25, or 10: 800x600, 960x720, 1024x576, 1024x768, 1152x648, 1200x800,
   * 1280x720, 1368x768, 1440x900, 1600x900, 1920x1080, 1920x1200, 390x844, 360x250,
   * 768x1024, 800x1600. Viewports outside this list may exhibit unstable live view
   * or recording behavior. If refresh_rate is not provided, it will be automatically
   * determined based on the resolution (higher resolutions use lower refresh rates
   * to keep bandwidth reasonable).
   */
  viewport: Shared.BrowserViewport;
}

export interface Evidence {
  accessed: number;

  blocked: number;

  inconclusive: number;

  /**
   * Most recent contributing observation. Recommendations remain eligible regardless
   * of age and can be returned while a new analysis refreshes them.
   */
  last_observed_at: string;

  run_count: number;

  /**
   * Number of judged trials.
   */
  sample_size: number;

  /**
   * Accessed trials divided by judged trials. Inconclusive trials are excluded.
   */
  success_rate: number;

  /**
   * Most recent contributing run where this config met the success threshold.
   * Omitted for knowledge assembled from runs that did not independently meet the
   * threshold.
   */
  last_verified_at?: string | null;
}

export interface LookupRequest {
  /**
   * Public HTTP(S) URL to look up.
   */
  url: string;

  /**
   * ISO 3166 country codes Kernel may use when returning a proxy configuration. When
   * omitted, Kernel uses its default country selection.
   */
  allowed_proxy_countries?: Array<string>;
}

export interface LookupResponse {
  recommendation: Recommendation | null;

  target: Target;
}

export interface NoRecommendation {
  /**
   * Machine-readable reason Kernel cannot currently provide a Site Config
   * recommendation.
   */
  code: 'proxy_restricted' | 'no_working_configuration' | 'inconclusive';

  /**
   * Human-readable explanation suitable for display.
   */
  message: string;

  type: 'no_recommendation';
}

/**
 * Proxy recipe for the recommended browser.
 */
export type Proxy = Proxy.SiteConfigDirectProxy | Proxy.SiteConfigManagedProxy;

export namespace Proxy {
  /**
   * Direct egress recipe. Pass `{ "mode": "direct" }` as the browser's `proxy`.
   */
  export interface SiteConfigDirectProxy {
    mode: 'direct';
  }

  /**
   * Managed proxy recipe. `create` is a non-idempotent `POST /proxies` payload:
   * create the resource once, retain its ID, and reuse that ID as the browser's
   * `proxy.id`. Do not submit this recipe before every browser session.
   */
  export interface SiteConfigManagedProxy {
    /**
     * Configuration for routing traffic through a proxy.
     */
    create: SiteConfigManagedProxy.Create;

    mode: 'managed';
  }

  export namespace SiteConfigManagedProxy {
    /**
     * Configuration for routing traffic through a proxy.
     */
    export interface Create {
      /**
       * Proxy type to use. In terms of quality for avoiding bot-detection, from best to
       * worst: `mobile` > `residential` > `isp` > `datacenter`.
       */
      type: 'datacenter' | 'isp' | 'residential' | 'mobile' | 'custom';

      /**
       * Hostnames that should bypass the parent proxy and connect directly.
       */
      bypass_hosts?: Array<string>;

      /**
       * Configuration specific to the selected proxy `type`.
       */
      config?:
        | Create.DatacenterProxyConfig
        | Create.IspProxyConfig
        | Create.ResidentialProxyConfig
        | Create.MobileProxyConfig
        | Create.CreateCustomProxyConfig;

      /**
       * Readable name of the proxy.
       */
      name?: string;

      /**
       * Protocol to use for the proxy connection.
       */
      protocol?: 'http' | 'https';
    }

    export namespace Create {
      /**
       * Configuration for a datacenter proxy.
       */
      export interface DatacenterProxyConfig {
        /**
         * ISO 3166 country code. Defaults to US if not provided.
         */
        country?: string;
      }

      /**
       * Configuration for an ISP proxy.
       */
      export interface IspProxyConfig {
        /**
         * ISO 3166 country code. Defaults to US if not provided.
         */
        country?: string;
      }

      /**
       * Configuration for residential proxies.
       */
      export interface ResidentialProxyConfig {
        /**
         * Autonomous system number. See https://bgp.potaroo.net/cidr/autnums.html
         */
        asn?: string;

        /**
         * City name (no spaces, e.g. `sanfrancisco`). If provided, `country` must also be
         * provided.
         */
        city?: string;

        /**
         * ISO 3166 country code.
         */
        country?: string;

        /**
         * @deprecated Operating system of the residential device.
         */
        os?: 'windows' | 'macos' | 'android';

        /**
         * Two-letter state code.
         */
        state?: string;

        /**
         * US ZIP code.
         */
        zip?: string;
      }

      /**
       * Configuration for mobile proxies.
       */
      export interface MobileProxyConfig {
        /**
         * Provider city alias. Mobile carrier routing can make observed geo vary.
         */
        city?: string;

        /**
         * ISO 3166 country code
         */
        country?: string;

        /**
         * US-only state code. Mobile carrier routing can make observed geo vary.
         */
        state?: string;
      }

      /**
       * Configuration for a custom proxy (e.g., private proxy server).
       */
      export interface CreateCustomProxyConfig {
        /**
         * Proxy host address or IP.
         */
        host: string;

        /**
         * Proxy port.
         */
        port: number;

        /**
         * PEM-encoded CA certificate bundle the proxy re-signs upstream TLS with. Provide
         * when the proxy terminates TLS (MITM) so the browser trusts its certificates. May
         * contain multiple concatenated certificates.
         */
        ca_bundle?: string;

        /**
         * Password for proxy authentication.
         */
        password?: string;

        /**
         * Username for proxy authentication.
         */
        username?: string;
      }
    }
  }
}

export interface Recommendation {
  /**
   * Browser settings that can be passed directly to `POST /browsers`.
   */
  browser: Browser;

  evidence: Evidence;

  /**
   * Specificity of knowledge matched for this recommendation.
   */
  match_scope: 'exact' | 'host' | 'domain';

  /**
   * Target value that supplied the recommendation.
   */
  matched_target: string;

  /**
   * Proxy recipe for the recommended browser.
   */
  proxy: Proxy;

  type: 'recommendation';

  /**
   * Exact matches meet the evidence threshold; host and domain fallbacks are
   * inferred. Check evidence.last_verified_at for successful verification age and
   * last_observed_at for the latest evidence.
   */
  verification: 'verified' | 'inferred';
}

/**
 * A recommendation or a structured no-recommendation result.
 */
export type RecommendationResult = Recommendation | NoRecommendation;

export interface RecommendationSummary {
  /**
   * Most recent time the selected project requested an analysis for this domain.
   */
  last_requested_at: string;

  /**
   * Current domain-level recommendation. Null when no eligible knowledge exists.
   */
  recommendation: Recommendation | null;

  /**
   * Display label for the recommended browser configuration.
   */
  recommended_config_label: string | null;

  /**
   * Success rate for the recommended configuration. Null when no eligible knowledge
   * exists.
   */
  success_rate: number | null;

  /**
   * Registrable domain previously analyzed by the selected project.
   */
  target: string;
}

export interface ResolveRequest {
  /**
   * Public HTTP(S) URL to refresh.
   */
  url: string;

  /**
   * ISO 3166 country codes Kernel may use when searching for or returning a proxy
   * configuration. Kernel may test a subset of allowed countries. When omitted,
   * Kernel uses its default country selection.
   */
  allowed_proxy_countries?: Array<string>;
}

export interface SiteConfigResponse {
  /**
   * Pollable analysis after workflow submission is acknowledged. Null when no
   * refresh was submitted.
   */
  analysis: Analysis | null;

  /**
   * A recommendation or a structured no-recommendation result.
   */
  recommendation: RecommendationResult | null;

  target: Target;
}

export interface Target {
  /**
   * Registrable domain.
   */
  domain: string;

  /**
   * Full hostname, including subdomain.
   */
  host: string;

  /**
   * Exact normalized scheme, host, port, and path used for lookup.
   */
  normalized: string;
}

export interface SiteConfigListParams extends OffsetPaginationParams {}

export interface SiteConfigListRecommendationsParams extends OffsetPaginationParams {
  sort_by?: 'target' | 'recommended_config' | 'last_requested_at' | 'success_rate';

  sort_order?: 'asc' | 'desc';
}

export interface SiteConfigLookupParams {
  /**
   * Public HTTP(S) URL to look up.
   */
  url: string;

  /**
   * ISO 3166 country codes Kernel may use when returning a proxy configuration. When
   * omitted, Kernel uses its default country selection.
   */
  allowed_proxy_countries?: Array<string>;
}

export interface SiteConfigResolveParams {
  /**
   * Public HTTP(S) URL to refresh.
   */
  url: string;

  /**
   * ISO 3166 country codes Kernel may use when searching for or returning a proxy
   * configuration. Kernel may test a subset of allowed countries. When omitted,
   * Kernel uses its default country selection.
   */
  allowed_proxy_countries?: Array<string>;
}

export declare namespace SiteConfigs {
  export {
    type Analysis as Analysis,
    type AnalysisSummary as AnalysisSummary,
    type Browser as Browser,
    type Evidence as Evidence,
    type LookupRequest as LookupRequest,
    type LookupResponse as LookupResponse,
    type NoRecommendation as NoRecommendation,
    type Proxy as Proxy,
    type Recommendation as Recommendation,
    type RecommendationResult as RecommendationResult,
    type RecommendationSummary as RecommendationSummary,
    type ResolveRequest as ResolveRequest,
    type SiteConfigResponse as SiteConfigResponse,
    type Target as Target,
    type AnalysisSummariesOffsetPagination as AnalysisSummariesOffsetPagination,
    type RecommendationSummariesOffsetPagination as RecommendationSummariesOffsetPagination,
    type SiteConfigListParams as SiteConfigListParams,
    type SiteConfigListRecommendationsParams as SiteConfigListRecommendationsParams,
    type SiteConfigLookupParams as SiteConfigLookupParams,
    type SiteConfigResolveParams as SiteConfigResolveParams,
  };
}
