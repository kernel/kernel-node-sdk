import { FinalRequestOptions } from "../internal/request-options.mjs";
import { type Kernel } from "../client.mjs";
import { APIPromise } from "./api-promise.mjs";
import { type APIResponseProps } from "../internal/parse.mjs";
export type PageRequestOptions = Pick<FinalRequestOptions, 'query' | 'headers' | 'body' | 'path' | 'method'>;
export declare abstract class AbstractPage<Item> implements AsyncIterable<Item> {
    #private;
    protected options: FinalRequestOptions;
    protected response: Response;
    protected body: unknown;
    constructor(client: Kernel, response: Response, body: unknown, options: FinalRequestOptions);
    abstract nextPageRequestOptions(): PageRequestOptions | null;
    abstract getPaginatedItems(): Item[];
    hasNextPage(): boolean;
    getNextPage(): Promise<this>;
    iterPages(): AsyncGenerator<this>;
    [Symbol.asyncIterator](): AsyncGenerator<Item>;
}
/**
 * This subclass of Promise will resolve to an instantiated Page once the request completes.
 *
 * It also implements AsyncIterable to allow auto-paginating iteration on an unawaited list call, eg:
 *
 *    for await (const item of client.items.list()) {
 *      console.log(item)
 *    }
 */
export declare class PagePromise<PageClass extends AbstractPage<Item>, Item = ReturnType<PageClass['getPaginatedItems']>[number]> extends APIPromise<PageClass> implements AsyncIterable<Item> {
    constructor(client: Kernel, request: Promise<APIResponseProps>, Page: new (...args: ConstructorParameters<typeof AbstractPage>) => PageClass);
    /**
     * Allow auto-paginating iteration on an unawaited list call, eg:
     *
     *    for await (const item of client.items.list()) {
     *      console.log(item)
     *    }
     */
    [Symbol.asyncIterator](): AsyncGenerator<Item>;
}
export type PageTokenPaginationResponse<Item> = Item[];
export interface PageTokenPaginationParams {
    page_token?: string;
    limit?: number;
}
export declare class PageTokenPagination<Item> extends AbstractPage<Item> {
    items: Array<Item>;
    next_page_token: string | null;
    has_more: boolean | null;
    constructor(client: Kernel, response: Response, body: PageTokenPaginationResponse<Item>, options: FinalRequestOptions);
    getPaginatedItems(): Item[];
    hasNextPage(): boolean;
    nextPageRequestOptions(): PageRequestOptions | null;
}
export type OffsetPaginationResponse<Item> = Item[];
export interface OffsetPaginationParams {
    offset?: number;
    limit?: number;
}
export declare class OffsetPagination<Item> extends AbstractPage<Item> {
    items: Array<Item>;
    has_more: boolean | null;
    next_offset: number | null;
    constructor(client: Kernel, response: Response, body: OffsetPaginationResponse<Item>, options: FinalRequestOptions);
    getPaginatedItems(): Item[];
    hasNextPage(): boolean;
    nextPageRequestOptions(): PageRequestOptions | null;
}
//# sourceMappingURL=pagination.d.mts.map