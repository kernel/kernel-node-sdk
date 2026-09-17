// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as DestinationsAPI from './destinations';
import {
  DestinationCreateParams,
  DestinationListParams,
  DestinationUpdateParams,
  Destinations,
  OtlpDestination,
  OtlpDestinationsOffsetPagination,
} from './destinations';

export class Telemetry extends APIResource {
  destinations: DestinationsAPI.Destinations = new DestinationsAPI.Destinations(this._client);
}

Telemetry.Destinations = Destinations;

export declare namespace Telemetry {
  export {
    Destinations as Destinations,
    type OtlpDestination as OtlpDestination,
    type OtlpDestinationsOffsetPagination as OtlpDestinationsOffsetPagination,
    type DestinationCreateParams as DestinationCreateParams,
    type DestinationUpdateParams as DestinationUpdateParams,
    type DestinationListParams as DestinationListParams,
  };
}
