import type { RequestInfo, RequestInit } from "../internal/builtin-types.mjs";
import type { Kernel } from "../client.mjs";
export interface BrowserFetchInit extends RequestInit {
    timeout_ms?: number;
}
export declare function browserFetch(client: Kernel, sessionId: string, input: RequestInfo | URL, init?: BrowserFetchInit): Promise<Response>;
//# sourceMappingURL=browser-fetch.d.mts.map