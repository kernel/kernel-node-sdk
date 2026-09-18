import type { RequestOptions } from "../internal/request-options.mjs";
import type { ConfigRegistryResponse } from "../resources/config-registry/config-registry.mjs";
export type ConfigRegistryAnalysisWaitOptions = Pick<RequestOptions, 'headers' | 'maxRetries' | 'timeout' | 'fetchOptions' | 'signal' | 'defaultBaseURL'> & {
    pollIntervalMs?: number;
    maxWaitMs?: number | null;
};
type AnalysisRetriever = {
    retrieve(id: string, options?: RequestOptions): Promise<ConfigRegistryResponse>;
};
export declare function waitForConfigRegistryAnalysis(resource: AnalysisRetriever, id: string, options?: ConfigRegistryAnalysisWaitOptions): Promise<ConfigRegistryResponse>;
export {};
//# sourceMappingURL=config-registry-wait.d.mts.map