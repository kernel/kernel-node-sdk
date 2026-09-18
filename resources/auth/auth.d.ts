import { APIResource } from "../../core/resource.js";
import * as ConnectionsAPI from "./connections.js";
import { ConnectionCreateParams, ConnectionFollowResponse, ConnectionListParams, ConnectionLoginParams, ConnectionSubmitParams, ConnectionTimelineParams, ConnectionUpdateParams, Connections, LoginResponse, ManagedAuth, ManagedAuthBrowserConfig, ManagedAuthCreateRequest, ManagedAuthTimelineEvent, ManagedAuthTimelineEventsOffsetPagination, ManagedAuthUpdateRequest, ManagedAuthsOffsetPagination, SubmitFieldsRequest, SubmitFieldsResponse } from "./connections.js";
import * as ContextAPI from "./context.js";
import { AuthContext, Context } from "./context.js";
export declare class Auth extends APIResource {
    context: ContextAPI.Context;
    connections: ConnectionsAPI.Connections;
}
export declare namespace Auth {
    export { Context as Context, type AuthContext as AuthContext };
    export { Connections as Connections, type LoginResponse as LoginResponse, type ManagedAuth as ManagedAuth, type ManagedAuthBrowserConfig as ManagedAuthBrowserConfig, type ManagedAuthCreateRequest as ManagedAuthCreateRequest, type ManagedAuthTimelineEvent as ManagedAuthTimelineEvent, type ManagedAuthUpdateRequest as ManagedAuthUpdateRequest, type SubmitFieldsRequest as SubmitFieldsRequest, type SubmitFieldsResponse as SubmitFieldsResponse, type ConnectionFollowResponse as ConnectionFollowResponse, type ManagedAuthsOffsetPagination as ManagedAuthsOffsetPagination, type ManagedAuthTimelineEventsOffsetPagination as ManagedAuthTimelineEventsOffsetPagination, type ConnectionCreateParams as ConnectionCreateParams, type ConnectionUpdateParams as ConnectionUpdateParams, type ConnectionListParams as ConnectionListParams, type ConnectionLoginParams as ConnectionLoginParams, type ConnectionSubmitParams as ConnectionSubmitParams, type ConnectionTimelineParams as ConnectionTimelineParams, };
}
//# sourceMappingURL=auth.d.ts.map