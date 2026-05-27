// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

/**
 * Create and manage proxy configurations for routing browser traffic.
 */
export class Proxies extends APIResource {
  /**
   * Create a new proxy configuration for the caller's organization.
   */
  create(body: ProxyCreateParams, options?: RequestOptions): APIPromise<ProxyCreateResponse> {
    return this._client.post('/proxies', { body, ...options });
  }

  /**
   * Retrieve a proxy belonging to the caller's organization by ID.
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<ProxyRetrieveResponse> {
    return this._client.get(path`/proxies/${id}`, options);
  }

  /**
   * List proxies owned by the caller's organization.
   */
  list(options?: RequestOptions): APIPromise<ProxyListResponse> {
    return this._client.get('/proxies', options);
  }

  /**
   * Soft delete a proxy. Sessions referencing it are not modified.
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
   */
  check(
    id: string,
    body: ProxyCheckParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ProxyCheckResponse> {
    return this._client.post(path`/proxies/${id}/check`, { body, ...options });
  }
}

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

export type ProxyListResponse = Array<ProxyListResponse.ProxyListResponseItem>;

export namespace ProxyListResponse {
  /**
   * Configuration for routing traffic through a proxy.
   */
  export interface ProxyListResponseItem {
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
      | ProxyListResponseItem.DatacenterProxyConfig
      | ProxyListResponseItem.IspProxyConfig
      | ProxyListResponseItem.ResidentialProxyConfig
      | ProxyListResponseItem.MobileProxyConfig
      | ProxyListResponseItem.CustomProxyConfig;

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

  export namespace ProxyListResponseItem {
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
    type ProxyListResponse as ProxyListResponse,
    type ProxyCheckResponse as ProxyCheckResponse,
    type ProxyCreateParams as ProxyCreateParams,
    type ProxyCheckParams as ProxyCheckParams,
  };
}
