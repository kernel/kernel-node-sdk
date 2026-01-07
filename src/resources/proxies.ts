// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

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
   * Run a health check on the proxy to verify it's working.
   */
  check(id: string, options?: RequestOptions): APIPromise<ProxyCheckResponse> {
    return this._client.post(path`/proxies/${id}/check`, options);
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
   * Configuration specific to the selected proxy `type`.
   */
  config?:
    | ProxyCreateResponse.DatacenterProxyConfig
    | ProxyCreateResponse.IspProxyConfig
    | ProxyCreateResponse.ResidentialProxyConfig
    | ProxyCreateResponse.MobileProxyConfig
    | ProxyCreateResponse.CustomProxyConfig;

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
     * Autonomous system number. See https://bgp.potaroo.net/cidr/autnums.html
     */
    asn?: string;

    /**
     * Mobile carrier.
     */
    carrier?:
      | 'a1'
      | 'aircel'
      | 'airtel'
      | 'att'
      | 'celcom'
      | 'chinamobile'
      | 'claro'
      | 'comcast'
      | 'cox'
      | 'digi'
      | 'dt'
      | 'docomo'
      | 'dtac'
      | 'etisalat'
      | 'idea'
      | 'kyivstar'
      | 'meo'
      | 'megafon'
      | 'mtn'
      | 'mtnza'
      | 'mts'
      | 'optus'
      | 'orange'
      | 'qwest'
      | 'reliance_jio'
      | 'robi'
      | 'sprint'
      | 'telefonica'
      | 'telstra'
      | 'tmobile'
      | 'tigo'
      | 'tim'
      | 'verizon'
      | 'vimpelcom'
      | 'vodacomza'
      | 'vodafone'
      | 'vivo'
      | 'zain'
      | 'vivabo'
      | 'telenormyanmar'
      | 'kcelljsc'
      | 'swisscom'
      | 'singtel'
      | 'asiacell'
      | 'windit'
      | 'cellc'
      | 'ooredoo'
      | 'drei'
      | 'umobile'
      | 'cableone'
      | 'proximus'
      | 'tele2'
      | 'mobitel'
      | 'o2'
      | 'bouygues'
      | 'free'
      | 'sfr'
      | 'digicel';

    /**
     * City name (no spaces, e.g. `sanfrancisco`). If provided, `country` must also be
     * provided.
     */
    city?: string;

    /**
     * ISO 3166 country code
     */
    country?: string;

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
   * Configuration specific to the selected proxy `type`.
   */
  config?:
    | ProxyRetrieveResponse.DatacenterProxyConfig
    | ProxyRetrieveResponse.IspProxyConfig
    | ProxyRetrieveResponse.ResidentialProxyConfig
    | ProxyRetrieveResponse.MobileProxyConfig
    | ProxyRetrieveResponse.CustomProxyConfig;

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
     * Autonomous system number. See https://bgp.potaroo.net/cidr/autnums.html
     */
    asn?: string;

    /**
     * Mobile carrier.
     */
    carrier?:
      | 'a1'
      | 'aircel'
      | 'airtel'
      | 'att'
      | 'celcom'
      | 'chinamobile'
      | 'claro'
      | 'comcast'
      | 'cox'
      | 'digi'
      | 'dt'
      | 'docomo'
      | 'dtac'
      | 'etisalat'
      | 'idea'
      | 'kyivstar'
      | 'meo'
      | 'megafon'
      | 'mtn'
      | 'mtnza'
      | 'mts'
      | 'optus'
      | 'orange'
      | 'qwest'
      | 'reliance_jio'
      | 'robi'
      | 'sprint'
      | 'telefonica'
      | 'telstra'
      | 'tmobile'
      | 'tigo'
      | 'tim'
      | 'verizon'
      | 'vimpelcom'
      | 'vodacomza'
      | 'vodafone'
      | 'vivo'
      | 'zain'
      | 'vivabo'
      | 'telenormyanmar'
      | 'kcelljsc'
      | 'swisscom'
      | 'singtel'
      | 'asiacell'
      | 'windit'
      | 'cellc'
      | 'ooredoo'
      | 'drei'
      | 'umobile'
      | 'cableone'
      | 'proximus'
      | 'tele2'
      | 'mobitel'
      | 'o2'
      | 'bouygues'
      | 'free'
      | 'sfr'
      | 'digicel';

    /**
     * City name (no spaces, e.g. `sanfrancisco`). If provided, `country` must also be
     * provided.
     */
    city?: string;

    /**
     * ISO 3166 country code
     */
    country?: string;

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
     * Configuration specific to the selected proxy `type`.
     */
    config?:
      | ProxyListResponseItem.DatacenterProxyConfig
      | ProxyListResponseItem.IspProxyConfig
      | ProxyListResponseItem.ResidentialProxyConfig
      | ProxyListResponseItem.MobileProxyConfig
      | ProxyListResponseItem.CustomProxyConfig;

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
       * Autonomous system number. See https://bgp.potaroo.net/cidr/autnums.html
       */
      asn?: string;

      /**
       * Mobile carrier.
       */
      carrier?:
        | 'a1'
        | 'aircel'
        | 'airtel'
        | 'att'
        | 'celcom'
        | 'chinamobile'
        | 'claro'
        | 'comcast'
        | 'cox'
        | 'digi'
        | 'dt'
        | 'docomo'
        | 'dtac'
        | 'etisalat'
        | 'idea'
        | 'kyivstar'
        | 'meo'
        | 'megafon'
        | 'mtn'
        | 'mtnza'
        | 'mts'
        | 'optus'
        | 'orange'
        | 'qwest'
        | 'reliance_jio'
        | 'robi'
        | 'sprint'
        | 'telefonica'
        | 'telstra'
        | 'tmobile'
        | 'tigo'
        | 'tim'
        | 'verizon'
        | 'vimpelcom'
        | 'vodacomza'
        | 'vodafone'
        | 'vivo'
        | 'zain'
        | 'vivabo'
        | 'telenormyanmar'
        | 'kcelljsc'
        | 'swisscom'
        | 'singtel'
        | 'asiacell'
        | 'windit'
        | 'cellc'
        | 'ooredoo'
        | 'drei'
        | 'umobile'
        | 'cableone'
        | 'proximus'
        | 'tele2'
        | 'mobitel'
        | 'o2'
        | 'bouygues'
        | 'free'
        | 'sfr'
        | 'digicel';

      /**
       * City name (no spaces, e.g. `sanfrancisco`). If provided, `country` must also be
       * provided.
       */
      city?: string;

      /**
       * ISO 3166 country code
       */
      country?: string;

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
   * Configuration specific to the selected proxy `type`.
   */
  config?:
    | ProxyCheckResponse.DatacenterProxyConfig
    | ProxyCheckResponse.IspProxyConfig
    | ProxyCheckResponse.ResidentialProxyConfig
    | ProxyCheckResponse.MobileProxyConfig
    | ProxyCheckResponse.CustomProxyConfig;

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
     * Autonomous system number. See https://bgp.potaroo.net/cidr/autnums.html
     */
    asn?: string;

    /**
     * Mobile carrier.
     */
    carrier?:
      | 'a1'
      | 'aircel'
      | 'airtel'
      | 'att'
      | 'celcom'
      | 'chinamobile'
      | 'claro'
      | 'comcast'
      | 'cox'
      | 'digi'
      | 'dt'
      | 'docomo'
      | 'dtac'
      | 'etisalat'
      | 'idea'
      | 'kyivstar'
      | 'meo'
      | 'megafon'
      | 'mtn'
      | 'mtnza'
      | 'mts'
      | 'optus'
      | 'orange'
      | 'qwest'
      | 'reliance_jio'
      | 'robi'
      | 'sprint'
      | 'telefonica'
      | 'telstra'
      | 'tmobile'
      | 'tigo'
      | 'tim'
      | 'verizon'
      | 'vimpelcom'
      | 'vodacomza'
      | 'vodafone'
      | 'vivo'
      | 'zain'
      | 'vivabo'
      | 'telenormyanmar'
      | 'kcelljsc'
      | 'swisscom'
      | 'singtel'
      | 'asiacell'
      | 'windit'
      | 'cellc'
      | 'ooredoo'
      | 'drei'
      | 'umobile'
      | 'cableone'
      | 'proximus'
      | 'tele2'
      | 'mobitel'
      | 'o2'
      | 'bouygues'
      | 'free'
      | 'sfr'
      | 'digicel';

    /**
     * City name (no spaces, e.g. `sanfrancisco`). If provided, `country` must also be
     * provided.
     */
    city?: string;

    /**
     * ISO 3166 country code
     */
    country?: string;

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
     * Autonomous system number. See https://bgp.potaroo.net/cidr/autnums.html
     */
    asn?: string;

    /**
     * Mobile carrier.
     */
    carrier?:
      | 'a1'
      | 'aircel'
      | 'airtel'
      | 'att'
      | 'celcom'
      | 'chinamobile'
      | 'claro'
      | 'comcast'
      | 'cox'
      | 'digi'
      | 'dt'
      | 'docomo'
      | 'dtac'
      | 'etisalat'
      | 'idea'
      | 'kyivstar'
      | 'meo'
      | 'megafon'
      | 'mtn'
      | 'mtnza'
      | 'mts'
      | 'optus'
      | 'orange'
      | 'qwest'
      | 'reliance_jio'
      | 'robi'
      | 'sprint'
      | 'telefonica'
      | 'telstra'
      | 'tmobile'
      | 'tigo'
      | 'tim'
      | 'verizon'
      | 'vimpelcom'
      | 'vodacomza'
      | 'vodafone'
      | 'vivo'
      | 'zain'
      | 'vivabo'
      | 'telenormyanmar'
      | 'kcelljsc'
      | 'swisscom'
      | 'singtel'
      | 'asiacell'
      | 'windit'
      | 'cellc'
      | 'ooredoo'
      | 'drei'
      | 'umobile'
      | 'cableone'
      | 'proximus'
      | 'tele2'
      | 'mobitel'
      | 'o2'
      | 'bouygues'
      | 'free'
      | 'sfr'
      | 'digicel';

    /**
     * City name (no spaces, e.g. `sanfrancisco`). If provided, `country` must also be
     * provided.
     */
    city?: string;

    /**
     * ISO 3166 country code
     */
    country?: string;

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

export declare namespace Proxies {
  export {
    type ProxyCreateResponse as ProxyCreateResponse,
    type ProxyRetrieveResponse as ProxyRetrieveResponse,
    type ProxyListResponse as ProxyListResponse,
    type ProxyCheckResponse as ProxyCheckResponse,
    type ProxyCreateParams as ProxyCreateParams,
  };
}
