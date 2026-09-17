// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import * as ConnectionsAPI from "./connections.mjs";
import { Connections, } from "./connections.mjs";
import * as ContextAPI from "./context.mjs";
import { Context } from "./context.mjs";
export class Auth extends APIResource {
    constructor() {
        super(...arguments);
        this.context = new ContextAPI.Context(this._client);
        this.connections = new ConnectionsAPI.Connections(this._client);
    }
}
Auth.Context = Context;
Auth.Connections = Connections;
//# sourceMappingURL=auth.mjs.map