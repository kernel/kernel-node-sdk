import type { Fetch } from "../internal/builtin-types.js";
export type BrowserRoute = {
    sessionId: string;
    baseURL: string;
    jwt: string;
};
export declare class BrowserRouteCache {
    private entries;
    get(sessionId: string): BrowserRoute | undefined;
    set(route: BrowserRoute): void;
    delete(sessionId: string): void;
    deleteIfJwt(sessionId: string, jwt: string): boolean;
    clear(): void;
}
export declare function browserRoutingSubresourcesFromEnv(): string[];
export declare function createRoutingFetch(innerFetch: Fetch, { apiBaseURL, subresources, cache, }: {
    apiBaseURL: string;
    subresources: Iterable<string>;
    cache: BrowserRouteCache;
}): Fetch;
export declare function matchesDirectVMPrefix(tail: string, prefixes: readonly string[]): boolean;
//# sourceMappingURL=browser-routing.d.ts.map