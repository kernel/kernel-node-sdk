"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const tslib_1 = require("../../internal/tslib.js");
const resource_1 = require("../../core/resource.js");
const ConnectionsAPI = tslib_1.__importStar(require("./connections.js"));
const connections_1 = require("./connections.js");
const ContextAPI = tslib_1.__importStar(require("./context.js"));
const context_1 = require("./context.js");
class Auth extends resource_1.APIResource {
    constructor() {
        super(...arguments);
        this.context = new ContextAPI.Context(this._client);
        this.connections = new ConnectionsAPI.Connections(this._client);
    }
}
exports.Auth = Auth;
Auth.Context = context_1.Context;
Auth.Connections = connections_1.Connections;
//# sourceMappingURL=auth.js.map