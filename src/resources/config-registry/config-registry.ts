// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as Shared from '../shared';
import * as AnalysesAPI from './analyses';
import { Analyses, AnalysisListParams } from './analyses';
import { APIPromise } from '../../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../../core/pagination';
import { RequestOptions } from '../../internal/request-options';

/**
 * Resolve browser and proxy recommendations for bot-protected sites.
 */
export class ConfigRegistry extends APIResource {
  analyses: AnalysesAPI.Analyses = new AnalysesAPI.Analyses(this._client);

  /**
   * Lists unique exact targets previously analyzed by the selected project with the
   * recommendation produced by each target's latest analysis.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const recommendationSummary of client.configRegistry.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: ConfigRegistryListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<RecommendationSummariesOffsetPagination, RecommendationSummary> {
    return this._client.getAPIList('/config-registry', OffsetPagination<RecommendationSummary>, {
      query,
      ...options,
    });
  }

  /**
   * Returns current global knowledge without resolving DNS, creating an analysis, or
   * updating config registry data.
   *
   * @example
   * ```ts
   * const lookupResponse = await client.configRegistry.lookup({
   *   url: 'https://example.com',
   * });
   * ```
   */
  lookup(body: ConfigRegistryLookupParams, options?: RequestOptions): APIPromise<LookupResponse> {
    return this._client.post('/config-registry/lookup', { body, ...options });
  }

  /**
   * Explicitly starts or retries a project-scoped background analysis while
   * preserving current global knowledge when available. Use
   * `/config-registry/lookup` for side-effect-free reads.
   *
   * @example
   * ```ts
   * const configRegistryResponse =
   *   await client.configRegistry.resolve({
   *     url: 'https://example.com',
   *   });
   * ```
   */
  resolve(body: ConfigRegistryResolveParams, options?: RequestOptions): APIPromise<ConfigRegistryResponse> {
    return this._client.post('/config-registry/resolve', { body, ...options });
  }
}

export type RecommendationSummariesOffsetPagination = OffsetPagination<RecommendationSummary>;

export type AnalysisSummariesOffsetPagination = OffsetPagination<AnalysisSummary>;

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
   * Deadline after which a still-running analysis becomes expired.
   */
  expires_at: string;

  /**
   * Present for failed, canceled, or expired analyses. Messages contain safe retry
   * guidance rather than internal workflow errors.
   */
  failure: Shared.ErrorModel | null;

  /**
   * Time the analysis reached a terminal status. Null while it is running.
   */
  finished_at: string | null;

  /**
   * Lifecycle status of a background analysis.
   */
  status: 'running' | 'completed' | 'failed' | 'canceled' | 'expired';

  /**
   * The workload description supplied for this analysis. Null when the analysis only
   * tested connectivity.
   */
  intent?: string | null;
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

export interface ConfigRegistryResponse {
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

  /**
   * Working configurations for the target, ordered with the recommended
   * configuration first.
   */
  working_configurations: Array<Recommendation>;

  /**
   * Short advisory markdown to facilitate navigating this target. Returned even when
   * no configuration reached the target, since knowing what prevented success is
   * useful without a configuration. Not verified against this target. Null when
   * nothing applicable was observed or no notes exist.
   */
  guidance?: string | null;

  /**
   * How far the workload pass got, when an intent was supplied and a pass ran. A run
   * outcome rather than advice, so it is reported whether or not any guidance could
   * be assembled. Null when no intent was supplied or no pass ran.
   */
  workload_outcome?:
    | 'completed'
    | 'turn_limit'
    | 'auth_required'
    | 'payment_required'
    | 'blocked'
    | 'error'
    | null;
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
   * Most recent contributing run whose evidence supported recommending this
   * configuration. Omitted when no individual run independently met the
   * recommendation threshold.
   */
  last_supported_at?: string | null;
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
  /**
   * A recommendation or a structured no-recommendation result.
   */
  recommendation: RecommendationResult | null;

  target: Target;

  /**
   * Working configurations for the target, ordered with the recommended
   * configuration first.
   */
  working_configurations: Array<Recommendation>;

  /**
   * Short advisory markdown to facilitate navigating this target. Returned even when
   * no configuration reached the target, since knowing what prevented success is
   * useful without a configuration. Not verified against this target. Null when
   * nothing applicable was observed or no notes exist.
   */
  guidance?: string | null;
}

export interface NoRecommendation {
  /**
   * Machine-readable reason Kernel cannot currently provide a config recommendation.
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
export type Proxy = Proxy.ConfigRegistryDirectProxy | Proxy.ConfigRegistryManagedProxy;

export namespace Proxy {
  /**
   * Direct egress recipe. Pass `{ "mode": "direct" }` as the browser's `proxy`.
   */
  export interface ConfigRegistryDirectProxy {
    mode: 'direct';
  }

  /**
   * Managed proxy recipe. `create` is a non-idempotent `POST /proxies` payload:
   * create the resource once, retain its ID, and reuse that ID as the browser's
   * `proxy.id`. Do not submit this recipe before every browser session.
   */
  export interface ConfigRegistryManagedProxy {
    /**
     * Configuration for routing traffic through a proxy.
     */
    create: ConfigRegistryManagedProxy.Create;

    mode: 'managed';
  }

  export namespace ConfigRegistryManagedProxy {
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
         * ISO 3166 country code. Supported countries are US, GB, FR, DE, and SG. Defaults
         * to US if not provided.
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
         * ISO 3166 country code. If omitted, the proxy uses the global pool without
         * country targeting.
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
         * ISO 3166 country code. If omitted, the proxy uses the global pool without
         * country targeting.
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
   * Specificity of knowledge matched for this recommendation. Exact matches use
   * knowledge for the requested target; host and domain matches use broader fallback
   * knowledge.
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
}

/**
 * A recommendation or a structured no-recommendation result.
 */
export type RecommendationResult = Recommendation | NoRecommendation;

export interface RecommendationSummary {
  /**
   * ID of the most recently requested analysis for this exact target.
   */
  analysis_id: string;

  /**
   * Lifecycle status of the most recently requested analysis for this exact target.
   */
  analysis_status: 'running' | 'completed' | 'failed' | 'canceled' | 'expired';

  /**
   * Most recent time the selected project requested an analysis for this exact
   * target.
   */
  last_requested_at: string;

  /**
   * Recommendation produced by the latest analysis. Null when that analysis did not
   * produce one.
   */
  recommendation: Recommendation | null;

  /**
   * Display label for the recommended browser configuration.
   */
  recommended_config_label: string | null;

  /**
   * Success rate for the recommended configuration. Null when the latest analysis
   * did not produce one.
   */
  success_rate: number | null;

  /**
   * Normalized exact target previously analyzed by the selected project, including
   * scheme, host, port, and path.
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

  /**
   * Plain-language description of the workload you intend to run against this
   * target, in a sentence or two. Requires an https target, because the pass treats
   * any non-HTTPS destination as off-site and will not drive an http one. Kernel
   * uses it to drive the browser further into the site, where it can observe
   * protections that only appear once a session interacts. When this target already
   * has a recommended configuration, the run confirms that one instead of
   * re-deriving the whole matrix, so supplying an intent narrows what can be
   * recommended.
   */
  intent?: string;
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

export interface ConfigRegistryListParams extends OffsetPaginationParams {
  /**
   * Case-insensitive substring search over normalized targets, including domain,
   * subdomain, and path.
   */
  search?: string;

  sort_by?: 'target' | 'analysis_status' | 'recommended_config' | 'last_requested_at' | 'success_rate';

  sort_order?: 'asc' | 'desc';
}

export interface ConfigRegistryLookupParams {
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

export interface ConfigRegistryResolveParams {
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

  /**
   * Plain-language description of the workload you intend to run against this
   * target, in a sentence or two. Requires an https target, because the pass treats
   * any non-HTTPS destination as off-site and will not drive an http one. Kernel
   * uses it to drive the browser further into the site, where it can observe
   * protections that only appear once a session interacts. When this target already
   * has a recommended configuration, the run confirms that one instead of
   * re-deriving the whole matrix, so supplying an intent narrows what can be
   * recommended.
   */
  intent?: string;
}

ConfigRegistry.Analyses = Analyses;

export declare namespace ConfigRegistry {
  export {
    type Analysis as Analysis,
    type AnalysisSummary as AnalysisSummary,
    type Browser as Browser,
    type ConfigRegistryResponse as ConfigRegistryResponse,
    type Evidence as Evidence,
    type LookupRequest as LookupRequest,
    type LookupResponse as LookupResponse,
    type NoRecommendation as NoRecommendation,
    type Proxy as Proxy,
    type Recommendation as Recommendation,
    type RecommendationResult as RecommendationResult,
    type RecommendationSummary as RecommendationSummary,
    type ResolveRequest as ResolveRequest,
    type Target as Target,
    type RecommendationSummariesOffsetPagination as RecommendationSummariesOffsetPagination,
    type ConfigRegistryListParams as ConfigRegistryListParams,
    type ConfigRegistryLookupParams as ConfigRegistryLookupParams,
    type ConfigRegistryResolveParams as ConfigRegistryResolveParams,
  };

  export { Analyses as Analyses, type AnalysisListParams as AnalysisListParams };
}
