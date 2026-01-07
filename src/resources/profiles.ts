// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as BrowsersAPI from './browsers/browsers';
import { APIPromise } from '../core/api-promise';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Profiles extends APIResource {
  /**
   * Create a browser profile that can be used to load state into future browser
   * sessions.
   */
  create(body: ProfileCreateParams, options?: RequestOptions): APIPromise<BrowsersAPI.Profile> {
    return this._client.post('/profiles', { body, ...options });
  }

  /**
   * Retrieve details for a single profile by its ID or name.
   */
  retrieve(idOrName: string, options?: RequestOptions): APIPromise<BrowsersAPI.Profile> {
    return this._client.get(path`/profiles/${idOrName}`, options);
  }

  /**
   * List profiles with optional filtering and pagination.
   */
  list(options?: RequestOptions): APIPromise<ProfileListResponse> {
    return this._client.get('/profiles', options);
  }

  /**
   * Delete a profile by its ID or by its name.
   */
  delete(idOrName: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/profiles/${idOrName}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Download the profile. Profiles are JSON files containing the pieces of state
   * that we save.
   */
  download(idOrName: string, options?: RequestOptions): APIPromise<Response> {
    return this._client.get(path`/profiles/${idOrName}/download`, {
      ...options,
      headers: buildHeaders([{ Accept: 'application/octet-stream' }, options?.headers]),
      __binaryResponse: true,
    });
  }
}

export type ProfileListResponse = Array<BrowsersAPI.Profile>;

export interface ProfileCreateParams {
  /**
   * Optional name of the profile. Must be unique within the organization.
   */
  name?: string;
}

export declare namespace Profiles {
  export { type ProfileListResponse as ProfileListResponse, type ProfileCreateParams as ProfileCreateParams };
}
