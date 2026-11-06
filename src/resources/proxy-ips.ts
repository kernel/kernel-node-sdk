// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

/**
 * Create and manage proxy configurations for routing browser traffic.
 */
export class ProxyIPs extends APIResource {
  /**
   * Retrieve one reserved IP with the ISP proxies using it as their primary exit.
   * proxy_count spans the organization; proxies lists only those in the current
   * project. Returns 404 when the IP is not in the organization's allocation and 403
   * with code reserved_isp_not_enabled when the organization has none. Scoped API
   * keys require proxies:read on the whole project or organization, not on
   * individual proxies; otherwise the operation returns 403 with code
   * insufficient_scope.
   */
  retrieve(ipAddress: string, options?: RequestOptions): APIPromise<ProxyIPDetail> {
    return this._client.get(path`/proxy_ips/${ipAddress}`, options);
  }

  /**
   * List the IP addresses reserved for the organization's ISP proxies, with each
   * IP's country and whether it can currently be assigned. Available only to
   * organizations with a reserved ISP allocation; others receive a 403 with code
   * reserved_isp_not_enabled. Served from the allocation itself, so IPs appear
   * whether or not a proxy uses them. Scoped API keys require proxies:read on the
   * whole project or organization, not on individual proxies; otherwise the
   * operation returns 403 with code insufficient_scope.
   */
  list(
    query: ProxyIPListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<ProxyIPsOffsetPagination, ProxyIP> {
    return this._client.getAPIList('/proxy_ips', OffsetPagination<ProxyIP>, { query, ...options });
  }
}

export type ProxyIPsOffsetPagination = OffsetPagination<ProxyIP>;

/**
 * One IP address reserved for the organization's ISP proxies.
 */
export interface ProxyIP {
  /**
   * ISO 3166 country code of the IP.
   */
  country: string;

  /**
   * Reserved exit IP address.
   */
  ip_address: string;

  /**
   * Whether the IP can currently be assigned. An excluded IP is listed but cannot be
   * pinned or moved to; proxies already on it keep working.
   */
  status: 'active' | 'excluded';
}

/**
 * A reserved IP with the ISP proxies using it as their primary exit. Reservations
 * are organization-wide, so proxy_count covers every project while proxies lists
 * only those in the current project.
 */
export interface ProxyIPDetail {
  /**
   * ISO 3166 country code of the IP.
   */
  country: string;

  /**
   * Reserved exit IP address.
   */
  ip_address: string;

  /**
   * ISP proxies in the current project whose primary exit IP is this address.
   */
  proxies: Array<ProxyIPDetail.Proxy>;

  /**
   * Number of ISP proxies across the organization whose primary exit IP is this
   * address.
   */
  proxy_count: number;

  /**
   * Whether the IP can currently be assigned. An excluded IP is listed but cannot be
   * pinned or moved to; proxies already on it keep working.
   */
  status: 'active' | 'excluded';
}

export namespace ProxyIPDetail {
  /**
   * An ISP proxy whose primary exit is the reserved IP.
   */
  export interface Proxy {
    id: string;

    name?: string;
  }
}

export interface ProxyIPListParams extends OffsetPaginationParams {
  /**
   * ISO 3166 country code to filter by. Must be a country ISP proxies support.
   */
  country?: string;

  /**
   * Filter by whether the IP can currently be assigned.
   */
  status?: 'active' | 'excluded';
}

export declare namespace ProxyIPs {
  export {
    type ProxyIP as ProxyIP,
    type ProxyIPDetail as ProxyIPDetail,
    type ProxyIPsOffsetPagination as ProxyIPsOffsetPagination,
    type ProxyIPListParams as ProxyIPListParams,
  };
}
