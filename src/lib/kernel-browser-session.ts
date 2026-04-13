import type { HeadersInit, RequestInfo, RequestInit } from '../internal/builtin-types';
import { Kernel } from '../client';
import { KernelError } from '../core/error';
import type { FinalRequestOptions, RequestOptions } from '../internal/request-options';
import type {
  BrowserCreateResponse,
  BrowserListResponse,
  BrowserRetrieveResponse,
} from '../resources/browsers/browsers';
import { buildHeaders } from '../internal/headers';
import { GeneratedBrowserSessionBindings } from './generated/browser-session-bindings';
import {
  resolveBrowserTransport,
  type KernelBrowserLike,
  type ResolvedBrowserTransport,
} from './browser-transport';

export type KernelBrowserInput =
  | KernelBrowserLike
  | BrowserCreateResponse
  | BrowserRetrieveResponse
  | BrowserListResponse;

export interface BrowserFetchInit extends RequestInit {
  /** Passed to the upstream /curl/raw handler as timeout_ms when set. */
  timeout_ms?: number;
}

/**
 * Browser-scoped API view: subresources omit the browser session id and are routed
 * through {@link BrowserCreateResponse.base_url} (browser session HTTP base URL for
 * the browser VM edge) with jwt query authentication.
 */
export class KernelBrowserSession extends GeneratedBrowserSessionBindings {
  protected override readonly sessionClient: Kernel;
  private readonly transport: ResolvedBrowserTransport;

  constructor(kernel: Kernel, browser: KernelBrowserInput) {
    const transport = resolveBrowserTransport(browser);
    const sessionId = transport.sessionId;
    const baseURL = transport.defaultBaseURL;
    if (!baseURL) {
      throw new KernelError(
        'kernel.forBrowser requires browser.base_url from the Kernel API. Create or retrieve the browser and pass a response that includes base_url before using the browser session client.',
      );
    }

    const sessionClient = createBrowserSessionKernel(kernel, {
      ...transport,
      defaultBaseURL: baseURL,
    });
    super(sessionClient, sessionId);
    this.sessionClient = sessionClient;
    this.transport = transport;
  }

  /**
   * Issue an HTTP request through the browser VM network stack (Chrome), returning
   * the upstream response as a standard Fetch {@link Response}. Implemented via
   * the browser session base URL and POST /curl/raw (internal).
   */
  async fetch(input: RequestInfo | URL, init?: BrowserFetchInit): Promise<Response> {
    if (!this.transport.jwt) {
      throw new KernelError(
        'browser.fetch requires a browser session jwt (parsed from cdp_ws_url, or pass jwt on the browser object).',
      );
    }

    const { url: targetUrl, method, headers, body, signal, duplex, timeout_ms } = splitFetchArgs(input, init);
    assertHttpTargetUrl(targetUrl);

    const query: Record<string, unknown> = {
      url: targetUrl,
      jwt: this.transport.jwt,
    };
    if (timeout_ms !== undefined) {
      query['timeout_ms'] = timeout_ms;
    }

    const accept = headers.get('accept');
    const headerPairs = headersToRequestOptionsHeaders(headers);

    const methodLower = method.toLowerCase();
    const allowed = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options']);
    if (!allowed.has(methodLower)) {
      throw new KernelError(`browser.fetch unsupported HTTP method: ${method}`);
    }

    return this.sessionClient
      .request({
        method: methodLower,
        path: '/curl/raw',
        query,
        body: body as RequestOptions['body'],
        headers: buildHeaders([accept ? { Accept: accept } : { Accept: '*/*' }, headerPairs]),
        signal: signal ?? null,
        ...(duplex ? { fetchOptions: { duplex } as RequestOptions['fetchOptions'] } : {}),
        __binaryResponse: true,
      } as any)
      .asResponse();
  }
}

function createBrowserSessionKernel(
  parent: Kernel,
  transport: ResolvedBrowserTransport & { defaultBaseURL: string },
): Kernel {
  const defaultQuery =
    transport.jwt ?
      {
        ...(((parent as any)._options?.defaultQuery as Record<string, unknown> | undefined) ?? {}),
        jwt: transport.jwt,
      }
    : (parent as any)._options?.defaultQuery ?? undefined;

  const sessionClient = parent.withOptions({
    baseURL: transport.defaultBaseURL,
    defaultQuery: defaultQuery as Record<string, string | undefined> | undefined,
  }) as Kernel;

  const originalPrepareOptions = (
    (sessionClient as any).prepareOptions as ((options: FinalRequestOptions) => Promise<void>) | undefined
  )?.bind(sessionClient);

  (sessionClient as any).authHeaders = async () => undefined;
  (sessionClient as any).prepareOptions = async (options: FinalRequestOptions) => {
    if (originalPrepareOptions) {
      await originalPrepareOptions(options);
    }
    const prefix = `/browsers/${transport.sessionId}/`;
    if (options.path.startsWith(prefix)) {
      const rest = options.path.slice(prefix.length);
      options.path = rest.startsWith('/') ? rest : `/${rest}`;
    }
  };

  return sessionClient;
}

function splitFetchArgs(
  input: RequestInfo | URL,
  init?: BrowserFetchInit,
): {
  url: string;
  method: string;
  headers: Headers;
  body?: RequestInit['body'];
  signal?: AbortSignal | null;
  duplex?: RequestInit['duplex'];
  timeout_ms?: number;
} {
  const timeoutFromInit = init && 'timeout_ms' in init ? init['timeout_ms'] : undefined;

  if (input instanceof Request) {
    const merged = new Headers(input.headers);
    if (init?.headers) {
      const extra = new Headers(init.headers as HeadersInit);
      extra.forEach((value, key) => {
        merged.set(key, value);
      });
    }
    const out: {
      url: string;
      method: string;
      headers: Headers;
      body?: RequestInit['body'];
      signal?: AbortSignal | null;
      duplex?: RequestInit['duplex'];
      timeout_ms?: number;
    } = {
      url: input.url,
      method: (init?.method ?? input.method)?.toUpperCase() || 'GET',
      headers: merged,
    };
    const mergedBody = init?.body ?? input.body;
    if (mergedBody !== undefined && mergedBody !== null) {
      out.body = mergedBody;
    }
    const mergedSignal = init?.signal ?? input.signal;
    if (mergedSignal !== undefined) {
      out.signal = mergedSignal;
    }
    if (init?.duplex !== undefined) {
      out.duplex = init.duplex;
    }
    if (timeoutFromInit !== undefined) {
      out.timeout_ms = timeoutFromInit;
    }
    return out;
  }

  const url = input instanceof URL ? input.href : String(input);
  const method = (init?.method ?? 'GET').toUpperCase();
  const headers = new Headers(init?.headers as HeadersInit | undefined);
  const out: {
    url: string;
    method: string;
    headers: Headers;
    body?: RequestInit['body'];
    signal?: AbortSignal | null;
    duplex?: RequestInit['duplex'];
    timeout_ms?: number;
  } = { url, method, headers };
  if (init?.body !== undefined) {
    out.body = init.body;
  }
  if (init?.signal !== undefined) {
    out.signal = init.signal;
  }
  if (init?.duplex !== undefined) {
    out.duplex = init.duplex;
  }
  if (timeoutFromInit !== undefined) {
    out.timeout_ms = timeoutFromInit;
  }
  return out;
}

function assertHttpTargetUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new KernelError(`browser.fetch target must be an absolute URL; received: ${url}`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new KernelError(`browser.fetch only supports http(s) URLs; received: ${parsed.protocol}`);
  }
}

function headersToRequestOptionsHeaders(headers: Headers): Record<string, string | null | undefined> {
  const out: Record<string, string | null | undefined> = {};
  headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower === 'accept' ||
      lower === 'content-length' ||
      lower === 'connection' ||
      lower === 'keep-alive' ||
      lower === 'proxy-authenticate' ||
      lower === 'proxy-authorization' ||
      lower === 'te' ||
      lower === 'trailers' ||
      lower === 'transfer-encoding' ||
      lower === 'upgrade'
    ) {
      return;
    }
    out[key] = value;
  });
  return out;
}
