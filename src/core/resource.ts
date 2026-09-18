// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { Kernel } from '../client';

export abstract class APIResource {
  protected _client: Kernel;

  constructor(client: Kernel) {
    this._client = client;
  }
}
