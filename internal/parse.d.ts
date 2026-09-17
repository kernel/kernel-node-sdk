import type { FinalRequestOptions } from "./request-options.js";
import { type Kernel } from "../client.js";
export type APIResponseProps = {
    response: Response;
    options: FinalRequestOptions;
    controller: AbortController;
    requestLogID: string;
    retryOfRequestLogID: string | undefined;
    startTime: number;
};
export declare function defaultParseResponse<T>(client: Kernel, props: APIResponseProps): Promise<T>;
//# sourceMappingURL=parse.d.ts.map