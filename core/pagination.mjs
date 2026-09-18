// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var _AbstractPage_client;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "../internal/tslib.mjs";
import { KernelError } from "./error.mjs";
import { defaultParseResponse } from "../internal/parse.mjs";
import { APIPromise } from "./api-promise.mjs";
import { maybeCoerceBoolean, maybeCoerceInteger, maybeObj } from "../internal/utils/values.mjs";
export class AbstractPage {
    constructor(client, response, body, options) {
        _AbstractPage_client.set(this, void 0);
        __classPrivateFieldSet(this, _AbstractPage_client, client, "f");
        this.options = options;
        this.response = response;
        this.body = body;
    }
    hasNextPage() {
        const items = this.getPaginatedItems();
        if (!items.length)
            return false;
        return this.nextPageRequestOptions() != null;
    }
    async getNextPage() {
        const nextOptions = this.nextPageRequestOptions();
        if (!nextOptions) {
            throw new KernelError('No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.');
        }
        return await __classPrivateFieldGet(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
    }
    async *iterPages() {
        let page = this;
        yield page;
        while (page.hasNextPage()) {
            page = await page.getNextPage();
            yield page;
        }
    }
    async *[(_AbstractPage_client = new WeakMap(), Symbol.asyncIterator)]() {
        for await (const page of this.iterPages()) {
            for (const item of page.getPaginatedItems()) {
                yield item;
            }
        }
    }
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
export class PagePromise extends APIPromise {
    constructor(client, request, Page) {
        super(client, request, async (client, props) => new Page(client, props.response, await defaultParseResponse(client, props), props.options));
    }
    /**
     * Allow auto-paginating iteration on an unawaited list call, eg:
     *
     *    for await (const item of client.items.list()) {
     *      console.log(item)
     *    }
     */
    async *[Symbol.asyncIterator]() {
        const page = await this;
        for await (const item of page) {
            yield item;
        }
    }
}
export class PageTokenPagination extends AbstractPage {
    constructor(client, response, body, options) {
        super(client, response, body, options);
        this.items = body || [];
        this.next_page_token = this.response.headers.get('x-next-page-token') ?? null;
        this.has_more = maybeCoerceBoolean(this.response.headers.get('x-has-more')) ?? null;
    }
    getPaginatedItems() {
        return this.items ?? [];
    }
    hasNextPage() {
        if (this.has_more === false) {
            return false;
        }
        return super.hasNextPage();
    }
    nextPageRequestOptions() {
        const cursor = this.next_page_token;
        if (!cursor) {
            return null;
        }
        return {
            ...this.options,
            query: {
                ...maybeObj(this.options.query),
                page_token: cursor,
            },
        };
    }
}
export class OffsetPagination extends AbstractPage {
    constructor(client, response, body, options) {
        super(client, response, body, options);
        this.items = body || [];
        this.has_more = maybeCoerceBoolean(this.response.headers.get('x-has-more')) ?? null;
        this.next_offset = maybeCoerceInteger(this.response.headers.get('x-next-offset')) ?? null;
    }
    getPaginatedItems() {
        return this.items ?? [];
    }
    hasNextPage() {
        if (this.has_more === false) {
            return false;
        }
        return super.hasNextPage();
    }
    nextPageRequestOptions() {
        // X-Next-Offset is the absolute start of the next page, or 0 on the last
        // page (the API's stop sentinel). The old code added the current page
        // length on top, skipping a full page per iteration. Only a positive
        // offset advances; 0 is a value the server affirmatively sent to mean
        // "no more", so we stop on it (matching the Go SDK pager).
        const offset = this.next_offset;
        if (offset == null) {
            if (this.has_more) {
                throw new KernelError('Server reported X-Has-More: true without an X-Next-Offset header; refusing to silently truncate pagination');
            }
            return null;
        }
        if (offset === 0) {
            return null;
        }
        return {
            ...this.options,
            query: {
                ...maybeObj(this.options.query),
                offset,
            },
        };
    }
}
//# sourceMappingURL=pagination.mjs.map