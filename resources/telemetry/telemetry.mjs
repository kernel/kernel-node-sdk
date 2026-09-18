// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import * as DestinationsAPI from "./destinations.mjs";
import { Destinations, } from "./destinations.mjs";
export class Telemetry extends APIResource {
    constructor() {
        super(...arguments);
        this.destinations = new DestinationsAPI.Destinations(this._client);
    }
}
Telemetry.Destinations = Destinations;
//# sourceMappingURL=telemetry.mjs.map