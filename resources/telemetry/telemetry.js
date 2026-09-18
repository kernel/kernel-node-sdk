"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Telemetry = void 0;
const tslib_1 = require("../../internal/tslib.js");
const resource_1 = require("../../core/resource.js");
const DestinationsAPI = tslib_1.__importStar(require("./destinations.js"));
const destinations_1 = require("./destinations.js");
class Telemetry extends resource_1.APIResource {
    constructor() {
        super(...arguments);
        this.destinations = new DestinationsAPI.Destinations(this._client);
    }
}
exports.Telemetry = Telemetry;
Telemetry.Destinations = destinations_1.Destinations;
//# sourceMappingURL=telemetry.js.map