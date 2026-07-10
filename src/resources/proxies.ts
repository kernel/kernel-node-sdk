// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

/**
 * Create and manage proxy configurations for routing browser traffic.
 */
export class Proxies extends APIResource {
  /**
   * Create a new proxy configuration in the resolved project.
   *
   * @example
   * ```ts
   * const proxy = await client.proxies.create({
   *   type: 'datacenter',
   * });
   * ```
   */
  create(body: ProxyCreateParams, options?: RequestOptions): APIPromise<ProxyCreateResponse> {
    return this._client.post('/proxies', { body, ...options });
  }

  /**
   * Retrieve a proxy in the resolved project by ID.
   *
   * @example
   * ```ts
   * const proxy = await client.proxies.retrieve('id');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<ProxyRetrieveResponse> {
    return this._client.get(path`/proxies/${id}`, options);
  }

  /**
   * Update a proxy's name. Proxy names are not unique and are not ID-or-name
   * addressable on this endpoint; duplicate names are allowed. Name-based
   * session-create lookups can remain ambiguous until callers resolve proxies by ID
   * or the API adds a stronger uniqueness contract.
   *
   * @example
   * ```ts
   * const proxy = await client.proxies.update('id', {
   *   name: 'my-renamed-proxy',
   * });
   * ```
   */
  update(id: string, body: ProxyUpdateParams, options?: RequestOptions): APIPromise<ProxyUpdateResponse> {
    return this._client.patch(path`/proxies/${id}`, { body, ...options });
  }

  /**
   * List proxies in the resolved project.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const proxyListResponse of client.proxies.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: ProxyListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<ProxyListResponsesOffsetPagination, ProxyListResponse> {
    return this._client.getAPIList('/proxies', OffsetPagination<ProxyListResponse>, { query, ...options });
  }

  /**
   * Soft delete a proxy. Sessions referencing it are not modified.
   *
   * @example
   * ```ts
   * await client.proxies.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/proxies/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Run a health check on the proxy to verify it's working. Optionally specify a URL
   * to test reachability against a specific target. For ISP and datacenter proxies,
   * this reliably tests whether the target site is reachable from the proxy's stable
   * exit IP. For residential and mobile proxies, the exit node varies between
   * requests, so this validates proxy configuration and connectivity rather than
   * guaranteeing site-specific reachability.
   *
   * @example
   * ```ts
   * const response = await client.proxies.check('id');
   * ```
   */
  check(
    id: string,
    body: ProxyCheckParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ProxyCheckResponse> {
    return this._client.post(path`/proxies/${id}/check`, { body, ...options });
  }
}

export type ProxyListResponsesOffsetPagination = OffsetPagination<ProxyListResponse>;

/**
 * Configuration for routing traffic through a proxy.
 */
export interface ProxyCreateResponse {
  /**
   * Proxy type to use. In terms of quality for avoiding bot-detection, from best to
   * worst: `mobile` > `residential` > `isp` > `datacenter`.
   */
  type: 'datacenter' | 'isp' | 'residential' | 'mobile' | 'custom';

  id?: string;

  /**
   * Hostnames that should bypass the parent proxy and connect directly.
   */
  bypass_hosts?: Array<string>;

  /**
   * Configuration specific to the selected proxy `type`.
   */
  config?:
    | ProxyCreateResponse.DatacenterProxyConfig
    | ProxyCreateResponse.IspProxyConfig
    | ProxyCreateResponse.ResidentialProxyConfig
    | ProxyCreateResponse.MobileProxyConfig
    | ProxyCreateResponse.CustomProxyConfig;

  /**
   * IP address that the proxy uses when making requests.
   */
  ip_address?: string;

  /**
   * Timestamp of the last health check performed on this proxy.
   */
  last_checked?: string;

  /**
   * Readable name of the proxy.
   */
  name?: string;

  /**
   * Protocol to use for the proxy connection.
   */
  protocol?: 'http' | 'https';

  /**
   * Current health status of the proxy.
   */
  status?: 'available' | 'unavailable';
}

export namespace ProxyCreateResponse {
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
  export interface CustomProxyConfig {
    /**
     * Proxy host address or IP.
     */
    host: string;

    /**
     * Proxy port.
     */
    port: number;

    /**
     * Whether the proxy has a password.
     */
    has_password?: boolean;

    /**
     * Username for proxy authentication.
     */
    username?: string;
  }
}

/**
 * Configuration for routing traffic through a proxy.
 */
export interface ProxyRetrieveResponse {
  /**
   * Proxy type to use. In terms of quality for avoiding bot-detection, from best to
   * worst: `mobile` > `residential` > `isp` > `datacenter`.
   */
  type: 'datacenter' | 'isp' | 'residential' | 'mobile' | 'custom';

  id?: string;

  /**
   * Hostnames that should bypass the parent proxy and connect directly.
   */
  bypass_hosts?: Array<string>;

  /**
   * Configuration specific to the selected proxy `type`.
   */
  config?:
    | ProxyRetrieveResponse.DatacenterProxyConfig
    | ProxyRetrieveResponse.IspProxyConfig
    | ProxyRetrieveResponse.ResidentialProxyConfig
    | ProxyRetrieveResponse.MobileProxyConfig
    | ProxyRetrieveResponse.CustomProxyConfig;

  /**
   * IP address that the proxy uses when making requests.
   */
  ip_address?: string;

  /**
   * Timestamp of the last health check performed on this proxy.
   */
  last_checked?: string;

  /**
   * Readable name of the proxy.
   */
  name?: string;

  /**
   * Protocol to use for the proxy connection.
   */
  protocol?: 'http' | 'https';

  /**
   * Current health status of the proxy.
   */
  status?: 'available' | 'unavailable';
}

export namespace ProxyRetrieveResponse {
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
  export interface CustomProxyConfig {
    /**
     * Proxy host address or IP.
     */
    host: string;

    /**
     * Proxy port.
     */
    port: number;

    /**
     * Whether the proxy has a password.
     */
    has_password?: boolean;

    /**
     * Username for proxy authentication.
     */
    username?: string;
  }
}

/**
 * Configuration for routing traffic through a proxy.
 */
export interface ProxyUpdateResponse {
  /**
   * Proxy type to use. In terms of quality for avoiding bot-detection, from best to
   * worst: `mobile` > `residential` > `isp` > `datacenter`.
   */
  type: 'datacenter' | 'isp' | 'residential' | 'mobile' | 'custom';

  id?: string;

  /**
   * Hostnames that should bypass the parent proxy and connect directly.
   */
  bypass_hosts?: Array<string>;

  /**
   * Configuration specific to the selected proxy `type`.
   */
  config?:
    | ProxyUpdateResponse.DatacenterProxyConfig
    | ProxyUpdateResponse.IspProxyConfig
    | ProxyUpdateResponse.ResidentialProxyConfig
    | ProxyUpdateResponse.MobileProxyConfig
    | ProxyUpdateResponse.CustomProxyConfig;

  /**
   * IP address that the proxy uses when making requests.
   */
  ip_address?: string;

  /**
   * Timestamp of the last health check performed on this proxy.
   */
  last_checked?: string;

  /**
   * Readable name of the proxy.
   */
  name?: string;

  /**
   * Protocol to use for the proxy connection.
   */
  protocol?: 'http' | 'https';

  /**
   * Current health status of the proxy.
   */
  status?: 'available' | 'unavailable';
}

export namespace ProxyUpdateResponse {
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
  export interface CustomProxyConfig {
    /**
     * Proxy host address or IP.
     */
    host: string;

    /**
     * Proxy port.
     */
    port: number;

    /**
     * Whether the proxy has a password.
     */
    has_password?: boolean;

    /**
     * Username for proxy authentication.
     */
    username?: string;
  }
}

/**
 * Configuration for routing traffic through a proxy.
 */
export interface ProxyListResponse {
  /**
   * Proxy type to use. In terms of quality for avoiding bot-detection, from best to
   * worst: `mobile` > `residential` > `isp` > `datacenter`.
   */
  type: 'datacenter' | 'isp' | 'residential' | 'mobile' | 'custom';

  id?: string;

  /**
   * Hostnames that should bypass the parent proxy and connect directly.
   */
  bypass_hosts?: Array<string>;

  /**
   * Configuration specific to the selected proxy `type`.
   */
  config?:
    | ProxyListResponse.DatacenterProxyConfig
    | ProxyListResponse.IspProxyConfig
    | ProxyListResponse.ResidentialProxyConfig
    | ProxyListResponse.MobileProxyConfig
    | ProxyListResponse.CustomProxyConfig;

  /**
   * IP address that the proxy uses when making requests.
   */
  ip_address?: string;

  /**
   * Timestamp of the last health check performed on this proxy.
   */
  last_checked?: string;

  /**
   * Readable name of the proxy.
   */
  name?: string;

  /**
   * Protocol to use for the proxy connection.
   */
  protocol?: 'http' | 'https';

  /**
   * Current health status of the proxy.
   */
  status?: 'available' | 'unavailable';
}

export namespace ProxyListResponse {
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
  export interface CustomProxyConfig {
    /**
     * Proxy host address or IP.
     */
    host: string;

    /**
     * Proxy port.
     */
    port: number;

    /**
     * Whether the proxy has a password.
     */
    has_password?: boolean;

    /**
     * Username for proxy authentication.
     */
    username?: string;
  }
}

/**
 * Configuration for routing traffic through a proxy.
 */
export interface ProxyCheckResponse {
  /**
   * Proxy type to use. In terms of quality for avoiding bot-detection, from best to
   * worst: `mobile` > `residential` > `isp` > `datacenter`.
   */
  type: 'datacenter' | 'isp' | 'residential' | 'mobile' | 'custom';

  id?: string;

  /**
   * Hostnames that should bypass the parent proxy and connect directly.
   */
  bypass_hosts?: Array<string>;

  /**
   * Configuration specific to the selected proxy `type`.
   */
  config?:
    | ProxyCheckResponse.DatacenterProxyConfig
    | ProxyCheckResponse.IspProxyConfig
    | ProxyCheckResponse.ResidentialProxyConfig
    | ProxyCheckResponse.MobileProxyConfig
    | ProxyCheckResponse.CustomProxyConfig;

  /**
   * IP address that the proxy uses when making requests.
   */
  ip_address?: string;

  /**
   * Timestamp of the last health check performed on this proxy.
   */
  last_checked?: string;

  /**
   * Readable name of the proxy.
   */
  name?: string;

  /**
   * Protocol to use for the proxy connection.
   */
  protocol?: 'http' | 'https';

  /**
   * Current health status of the proxy.
   */
  status?: 'available' | 'unavailable';
}

export namespace ProxyCheckResponse {
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
  export interface CustomProxyConfig {
    /**
     * Proxy host address or IP.
     */
    host: string;

    /**
     * Proxy port.
     */
    port: number;

    /**
     * Whether the proxy has a password.
     */
    has_password?: boolean;

    /**
     * Username for proxy authentication.
     */
    username?: string;
  }
}

export interface ProxyCreateParams {
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
    | ProxyCreateParams.DatacenterProxyConfig
    | ProxyCreateParams.IspProxyConfig
    | ProxyCreateParams.ResidentialProxyConfig
    | ProxyCreateParams.MobileProxyConfig
    | ProxyCreateParams.CreateCustomProxyConfig;

  /**
   * Readable name of the proxy.
   */
  name?: string;

  /**
   * Protocol to use for the proxy connection.
   */
  protocol?: 'http' | 'https';
}

export namespace ProxyCreateParams {
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
     * Password for proxy authentication.
     */
    password?: string;

    /**
     * Username for proxy authentication.
     */
    username?: string;
  }
}

export interface ProxyUpdateParams {
  /**
   * New proxy name. Proxy names are trimmed and length-checked only; duplicates are
   * allowed because proxies are updated by ID, not by name.
   */
  name: string;
}

export interface ProxyListParams extends OffsetPaginationParams {
  /**
   * Exact-match filter on proxy name using the database collation. In production,
   * matching is case- and accent-insensitive. Names are not required to be unique,
   * so multiple proxies may match.
   */
  name?: string;

  /**
   * Case-insensitive substring match against proxy name, host, or IP address. IDs
   * match by exact value.
   */
  query?: string;
}

export interface ProxyCheckParams {
  /**
   * An optional URL to test reachability against. If provided, the proxy check will
   * test connectivity to this URL instead of the default test URLs. Only HTTP and
   * HTTPS schemes are allowed, and the URL must resolve to a public IP address. For
   * ISP and datacenter proxies, the exit IP is stable, so a successful check
   * reliably indicates that subsequent browser sessions will reach the target site
   * with the same IP. For residential and mobile proxies, the exit node changes
   * between requests, so a successful check validates proxy configuration but does
   * not guarantee that a subsequent browser session will use the same exit IP or
   * reach the same site — it is useful for verifying credentials and connectivity,
   * not for predicting site-specific behavior. When provided, the check result does
   * not update the proxy's health status, since a failure may indicate a problem
   * with the target site rather than the proxy itself.
   */
  url?: string;
}

export declare namespace Proxies {
  export {
    type ProxyCreateResponse as ProxyCreateResponse,
    type ProxyRetrieveResponse as ProxyRetrieveResponse,
    type ProxyUpdateResponse as ProxyUpdateResponse,
    type ProxyListResponse as ProxyListResponse,
    type ProxyCheckResponse as ProxyCheckResponse,
    type ProxyListResponsesOffsetPagination as ProxyListResponsesOffsetPagination,
    type ProxyCreateParams as ProxyCreateParams,
    type ProxyUpdateParams as ProxyUpdateParams,
    type ProxyListParams as ProxyListParams,
    type ProxyCheckParams as ProxyCheckParams,
  };
}
