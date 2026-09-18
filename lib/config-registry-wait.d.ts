import type { RequestOptions } from "../internal/request-options.js";
import type { ConfigRegistryResponse } from "../resources/config-registry/config-registry.js";
export type ConfigRegistryAnalysisWaitOptions = Pick<RequestOptions, 'headers' | 'maxRetries' | 'timeout' | 'fetchOptions' | 'signal' | 'defaultBaseURL'> & {
    pollIntervalMs?: number;
    maxWaitMs?: number | null;
};
type AnalysisRetriever = {
    retrieve(id: string, options?: RequestOptions): Promise<ConfigRegistryResponse>;
};
export declare function waitForConfigRegistryAnalysis(resource: AnalysisRetriever, id: string, options?: ConfigRegistryAnalysisWaitOptions): Promise<ConfigRegistryResponse>;
export {};
//# sourceMappingURL=config-registry-wait.d.ts.map