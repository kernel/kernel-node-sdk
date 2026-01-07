// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { KernelError } from './error';
import { FinalRequestOptions } from '../internal/request-options';
import { defaultParseResponse } from '../internal/parse';
import { type Kernel } from '../client';
import { APIPromise } from './api-promise';
import { type APIResponseProps } from '../internal/parse';
import { maybeCoerceBoolean, maybeCoerceInteger, maybeObj } from '../internal/utils/values';

export type PageRequestOptions = Pick<FinalRequestOptions, 'query' | 'headers' | 'body' | 'path' | 'method'>;

export abstract class AbstractPage<Item> implements AsyncIterable<Item> {
  #client: Kernel;
  protected options: FinalRequestOptions;

  protected response: Response;
  protected body: unknown;

  constructor(client: Kernel, response: Response, body: unknown, options: FinalRequestOptions) {
    this.#client = client;
    this.options = options;
    this.response = response;
    this.body = body;
  }

  abstract nextPageRequestOptions(): PageRequestOptions | null;

  abstract getPaginatedItems(): Item[];

  hasNextPage(): boolean {
    const items = this.getPaginatedItems();
    if (!items.length) return false;
    return this.nextPageRequestOptions() != null;
  }

  async getNextPage(): Promise<this> {
    const nextOptions = this.nextPageRequestOptions();
    if (!nextOptions) {
      throw new KernelError(
        'No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.',
      );
    }

    return await this.#client.requestAPIList(this.constructor as any, nextOptions);
  }

  async *iterPages(): AsyncGenerator<this> {
    let page: this = this;
    yield page;
    while (page.hasNextPage()) {
      page = await page.getNextPage();
      yield page;
    }
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<Item> {
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
export class PagePromise<
    PageClass extends AbstractPage<Item>,
    Item = ReturnType<PageClass['getPaginatedItems']>[number],
  >
  extends APIPromise<PageClass>
  implements AsyncIterable<Item>
{
  constructor(
    client: Kernel,
    request: Promise<APIResponseProps>,
    Page: new (...args: ConstructorParameters<typeof AbstractPage>) => PageClass,
  ) {
    super(
      client,
      request,
      async (client, props) =>
        new Page(client, props.response, await defaultParseResponse(client, props), props.options),
    );
  }

  /**
   * Allow auto-paginating iteration on an unawaited list call, eg:
   *
   *    for await (const item of client.items.list()) {
   *      console.log(item)
   *    }
   */
  async *[Symbol.asyncIterator](): AsyncGenerator<Item> {
    const page = await this;
    for await (const item of page) {
      yield item;
    }
  }
}

export type OffsetPaginationResponse<Item> = Item[];

export interface OffsetPaginationParams {
  offset?: number;

  limit?: number;
}

export class OffsetPagination<Item> extends AbstractPage<Item> {
  items: Array<Item>;

  has_more: boolean | null;

  next_offset: number | null;

  constructor(
    client: Kernel,
    response: Response,
    body: OffsetPaginationResponse<Item>,
    options: FinalRequestOptions,
  ) {
    super(client, response, body, options);

    this.items = body || [];
    this.has_more = maybeCoerceBoolean(this.response.headers.get('x-has-more')) ?? null;
    this.next_offset = maybeCoerceInteger(this.response.headers.get('x-next-offset')) ?? null;
  }

  getPaginatedItems(): Item[] {
    return this.items ?? [];
  }

  override hasNextPage(): boolean {
    if (this.has_more === false) {
      return false;
    }

    return super.hasNextPage();
  }

  nextPageRequestOptions(): PageRequestOptions | null {
    const offset = this.next_offset ?? 0;
    const length = this.getPaginatedItems().length;
    const currentCount = offset + length;

    return {
      ...this.options,
      query: {
        ...maybeObj(this.options.query),
        offset: currentCount,
      },
    };
  }
}
