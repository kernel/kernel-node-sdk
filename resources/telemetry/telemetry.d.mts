import { APIResource } from "../../core/resource.mjs";
import * as DestinationsAPI from "./destinations.mjs";
import { DestinationCreateParams, DestinationListParams, DestinationUpdateParams, Destinations, OtlpDestination, OtlpDestinationsOffsetPagination } from "./destinations.mjs";
export declare class Telemetry extends APIResource {
    destinations: DestinationsAPI.Destinations;
}
export declare namespace Telemetry {
    export { Destinations as Destinations, type OtlpDestination as OtlpDestination, type OtlpDestinationsOffsetPagination as OtlpDestinationsOffsetPagination, type DestinationCreateParams as DestinationCreateParams, type DestinationUpdateParams as DestinationUpdateParams, type DestinationListParams as DestinationListParams, };
}
//# sourceMappingURL=telemetry.d.mts.map