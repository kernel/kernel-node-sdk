// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as Shared from './shared';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';

export class Apps extends APIResource {
  /**
   * List applications. Optionally filter by app name and/or version label.
   */
  list(
    query: AppListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<AppListResponsesOffsetPagination, AppListResponse> {
    return this._client.getAPIList('/apps', OffsetPagination<AppListResponse>, { query, ...options });
  }
}

export type AppListResponsesOffsetPagination = OffsetPagination<AppListResponse>;

/**
 * Summary of an application version.
 */
export interface AppListResponse {
  /**
   * Unique identifier for the app version
   */
  id: string;

  /**
   * List of actions available on the app
   */
  actions: Array<Shared.AppAction>;

  /**
   * Name of the application
   */
  app_name: string;

  /**
   * Deployment ID
   */
  deployment: string;

  /**
   * Environment variables configured for this app version
   */
  env_vars: { [key: string]: string };

  /**
   * Deployment region code
   */
  region: 'aws.us-east-1a';

  /**
   * Version label for the application
   */
  version: string;
}

export interface AppListParams extends OffsetPaginationParams {
  /**
   * Filter results by application name.
   */
  app_name?: string;

  /**
   * Filter results by version label.
   */
  version?: string;
}

export declare namespace Apps {
  export {
    type AppListResponse as AppListResponse,
    type AppListResponsesOffsetPagination as AppListResponsesOffsetPagination,
    type AppListParams as AppListParams,
  };
}
