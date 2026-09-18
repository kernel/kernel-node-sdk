import type { RequestInfo, RequestInit } from "../internal/builtin-types.js";
import type { Kernel } from "../client.js";
export interface BrowserFetchInit extends RequestInit {
    timeout_ms?: number;
}
export declare function browserFetch(client: Kernel, sessionId: string, input: RequestInfo | URL, init?: BrowserFetchInit): Promise<Response>;
//# sourceMappingURL=browser-fetch.d.ts.map