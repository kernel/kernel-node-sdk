import type { HeadersInit, RequestInfo, RequestInit } from '../internal/builtin-types';
import { Kernel } from '../client';
import { KernelError } from '../core/error';
import { APIPromise } from '../core/api-promise';
import type { RequestOptions } from '../internal/request-options';
import type { FinalRequestOptions } from '../internal/request-options';
import type {
  BrowserCreateResponse,
  BrowserListResponse,
  BrowserLoadExtensionsParams,
  BrowserRetrieveResponse,
} from '../resources/browsers/browsers';
import type {
  ComputerBatchParams,
  ComputerCaptureScreenshotParams,
  ComputerClickMouseParams,
  ComputerDragMouseParams,
  ComputerGetMousePositionResponse,
  ComputerMoveMouseParams,
  ComputerPressKeyParams,
  ComputerReadClipboardResponse,
  ComputerScrollParams,
  ComputerSetCursorVisibilityParams,
  ComputerSetCursorVisibilityResponse,
  ComputerTypeTextParams,
  ComputerWriteClipboardParams,
} from '../resources/browsers/computer';
import type { LogStreamParams } from '../resources/browsers/logs';
import type { PlaywrightExecuteParams, PlaywrightExecuteResponse } from '../resources/browsers/playwright';
import type {
  ProcessExecParams,
  ProcessExecResponse,
  ProcessKillParams,
  ProcessKillResponse,
  ProcessResizeParams,
  ProcessResizeResponse,
  ProcessSpawnParams,
  ProcessSpawnResponse,
  ProcessStatusResponse,
  ProcessStdinParams,
  ProcessStdinResponse,
  ProcessStdoutStreamResponse,
} from '../resources/browsers/process';
import type {
  ReplayListResponse,
  ReplayStartParams,
  ReplayStartResponse,
} from '../resources/browsers/replays';
import type {
  FCreateDirectoryParams,
  FDeleteDirectoryParams,
  FDeleteFileParams,
  FDownloadDirZipParams,
  FFileInfoParams,
  FFileInfoResponse,
  FListFilesParams,
  FListFilesResponse,
  FMoveParams,
  FReadFileParams,
  FSetFilePermissionsParams,
  FUploadParams,
  FUploadZipParams,
  FWriteFileParams,
} from '../resources/browsers/fs/fs';
import { Stream } from '../core/streaming';
import type { LogEvent } from '../resources/shared';
import { buildHeaders } from '../internal/headers';
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
export class KernelBrowserSession {
  readonly sessionId: string;
  private readonly sessionClient: Kernel;
  private readonly transport: ResolvedBrowserTransport;

  constructor(kernel: Kernel, browser: KernelBrowserInput) {
    this.transport = resolveBrowserTransport(browser);
    this.sessionId = this.transport.sessionId;
    const baseURL = this.transport.defaultBaseURL;
    if (!baseURL) {
      throw new KernelError(
        'kernel.forBrowser requires browser.base_url from the Kernel API. Create or retrieve the browser and pass a response that includes base_url before using the browser session client.',
      );
    }
    this.sessionClient = createBrowserSessionKernel(kernel, {
      ...this.transport,
      defaultBaseURL: baseURL,
    });
  }

  private opt(options?: RequestOptions): RequestOptions | undefined {
    return options;
  }

  loadExtensions(body: BrowserLoadExtensionsParams, options?: RequestOptions): APIPromise<void> {
    return this.sessionClient.browsers.loadExtensions(this.sessionId, body, this.opt(options));
  }

  readonly process = {
    exec: (body: ProcessExecParams, options?: RequestOptions): APIPromise<ProcessExecResponse> => {
      return this.sessionClient.browsers.process.exec(this.sessionId, body, this.opt(options));
    },
    kill: (
      processID: string,
      params: Omit<ProcessKillParams, 'id'>,
      options?: RequestOptions,
    ): APIPromise<ProcessKillResponse> => {
      return this.sessionClient.browsers.process.kill(
        processID,
        { ...params, id: this.sessionId },
        this.opt(options),
      );
    },
    resize: (
      processID: string,
      params: Omit<ProcessResizeParams, 'id'>,
      options?: RequestOptions,
    ): APIPromise<ProcessResizeResponse> => {
      return this.sessionClient.browsers.process.resize(
        processID,
        { ...params, id: this.sessionId },
        this.opt(options),
      );
    },
    spawn: (body: ProcessSpawnParams, options?: RequestOptions): APIPromise<ProcessSpawnResponse> => {
      return this.sessionClient.browsers.process.spawn(this.sessionId, body, this.opt(options));
    },
    status: (processID: string, options?: RequestOptions): APIPromise<ProcessStatusResponse> => {
      return this.sessionClient.browsers.process.status(processID, { id: this.sessionId }, this.opt(options));
    },
    stdin: (
      processID: string,
      params: Omit<ProcessStdinParams, 'id'>,
      options?: RequestOptions,
    ): APIPromise<ProcessStdinResponse> => {
      return this.sessionClient.browsers.process.stdin(
        processID,
        { ...params, id: this.sessionId },
        this.opt(options),
      );
    },
    stdoutStream: (
      processID: string,
      options?: RequestOptions,
    ): APIPromise<Stream<ProcessStdoutStreamResponse>> => {
      return this.sessionClient.browsers.process.stdoutStream(
        processID,
        { id: this.sessionId },
        this.opt(options),
      );
    },
  };

  readonly computer = {
    batch: (body: ComputerBatchParams, options?: RequestOptions): APIPromise<void> => {
      return this.sessionClient.browsers.computer.batch(this.sessionId, body, this.opt(options));
    },
    captureScreenshot: (
      body: ComputerCaptureScreenshotParams | null | undefined,
      options?: RequestOptions,
    ): APIPromise<Response> => {
      return this.sessionClient.browsers.computer.captureScreenshot(
        this.sessionId,
        body ?? {},
        this.opt(options),
      );
    },
    clickMouse: (body: ComputerClickMouseParams, options?: RequestOptions): APIPromise<void> => {
      return this.sessionClient.browsers.computer.clickMouse(this.sessionId, body, this.opt(options));
    },
    dragMouse: (body: ComputerDragMouseParams, options?: RequestOptions): APIPromise<void> => {
      return this.sessionClient.browsers.computer.dragMouse(this.sessionId, body, this.opt(options));
    },
    getMousePosition: (options?: RequestOptions): APIPromise<ComputerGetMousePositionResponse> => {
      return this.sessionClient.browsers.computer.getMousePosition(this.sessionId, this.opt(options));
    },
    moveMouse: (body: ComputerMoveMouseParams, options?: RequestOptions): APIPromise<void> => {
      return this.sessionClient.browsers.computer.moveMouse(this.sessionId, body, this.opt(options));
    },
    pressKey: (body: ComputerPressKeyParams, options?: RequestOptions): APIPromise<void> => {
      return this.sessionClient.browsers.computer.pressKey(this.sessionId, body, this.opt(options));
    },
    readClipboard: (options?: RequestOptions): APIPromise<ComputerReadClipboardResponse> => {
      return this.sessionClient.browsers.computer.readClipboard(this.sessionId, this.opt(options));
    },
    scroll: (body: ComputerScrollParams, options?: RequestOptions): APIPromise<void> => {
      return this.sessionClient.browsers.computer.scroll(this.sessionId, body, this.opt(options));
    },
    setCursorVisibility: (
      body: ComputerSetCursorVisibilityParams,
      options?: RequestOptions,
    ): APIPromise<ComputerSetCursorVisibilityResponse> => {
      return this.sessionClient.browsers.computer.setCursorVisibility(
        this.sessionId,
        body,
        this.opt(options),
      );
    },
    typeText: (body: ComputerTypeTextParams, options?: RequestOptions): APIPromise<void> => {
      return this.sessionClient.browsers.computer.typeText(this.sessionId, body, this.opt(options));
    },
    writeClipboard: (body: ComputerWriteClipboardParams, options?: RequestOptions): APIPromise<void> => {
      return this.sessionClient.browsers.computer.writeClipboard(this.sessionId, body, this.opt(options));
    },
  };

  readonly logs = {
    stream: (query: LogStreamParams, options?: RequestOptions): APIPromise<Stream<LogEvent>> => {
      return this.sessionClient.browsers.logs.stream(this.sessionId, query, this.opt(options));
    },
  };

  readonly playwright = {
    execute: (
      body: PlaywrightExecuteParams,
      options?: RequestOptions,
    ): APIPromise<PlaywrightExecuteResponse> => {
      return this.sessionClient.browsers.playwright.execute(this.sessionId, body, this.opt(options));
    },
  };

  readonly replays = {
    list: (options?: RequestOptions): APIPromise<ReplayListResponse> => {
      return this.sessionClient.browsers.replays.list(this.sessionId, this.opt(options));
    },
    download: (replayID: string, options?: RequestOptions): APIPromise<Response> => {
      return this.sessionClient.browsers.replays.download(
        replayID,
        { id: this.sessionId },
        this.opt(options),
      );
    },
    start: (
      body: ReplayStartParams | null | undefined,
      options?: RequestOptions,
    ): APIPromise<ReplayStartResponse> => {
      return this.sessionClient.browsers.replays.start(this.sessionId, body ?? {}, this.opt(options));
    },
    stop: (replayID: string, options?: RequestOptions): APIPromise<void> => {
      return this.sessionClient.browsers.replays.stop(replayID, { id: this.sessionId }, this.opt(options));
    },
  };

  readonly fs = {
    createDirectory: (body: FCreateDirectoryParams, options?: RequestOptions): APIPromise<void> => {
      return this.sessionClient.browsers.fs.createDirectory(this.sessionId, body, this.opt(options));
    },
    deleteDirectory: (body: FDeleteDirectoryParams, options?: RequestOptions): APIPromise<void> => {
      return this.sessionClient.browsers.fs.deleteDirectory(this.sessionId, body, this.opt(options));
    },
    deleteFile: (body: FDeleteFileParams, options?: RequestOptions): APIPromise<void> => {
      return this.sessionClient.browsers.fs.deleteFile(this.sessionId, body, this.opt(options));
    },
    downloadDirZip: (query: FDownloadDirZipParams, options?: RequestOptions): APIPromise<Response> => {
      return this.sessionClient.browsers.fs.downloadDirZip(this.sessionId, query, this.opt(options));
    },
    fileInfo: (query: FFileInfoParams, options?: RequestOptions): APIPromise<FFileInfoResponse> => {
      return this.sessionClient.browsers.fs.fileInfo(this.sessionId, query, this.opt(options));
    },
    listFiles: (query: FListFilesParams, options?: RequestOptions): APIPromise<FListFilesResponse> => {
      return this.sessionClient.browsers.fs.listFiles(this.sessionId, query, this.opt(options));
    },
    move: (body: FMoveParams, options?: RequestOptions): APIPromise<void> => {
      return this.sessionClient.browsers.fs.move(this.sessionId, body, this.opt(options));
    },
    readFile: (query: FReadFileParams, options?: RequestOptions): APIPromise<Response> => {
      return this.sessionClient.browsers.fs.readFile(this.sessionId, query, this.opt(options));
    },
    setFilePermissions: (body: FSetFilePermissionsParams, options?: RequestOptions): APIPromise<void> => {
      return this.sessionClient.browsers.fs.setFilePermissions(this.sessionId, body, this.opt(options));
    },
    upload: (body: FUploadParams, options?: RequestOptions): APIPromise<void> => {
      return this.sessionClient.browsers.fs.upload(this.sessionId, body, this.opt(options));
    },
    uploadZip: (body: FUploadZipParams, options?: RequestOptions): APIPromise<void> => {
      return this.sessionClient.browsers.fs.uploadZip(this.sessionId, body, this.opt(options));
    },
    writeFile: (
      contents: string | ArrayBuffer | ArrayBufferView | Blob | DataView,
      params: FWriteFileParams,
      options?: RequestOptions,
    ): APIPromise<void> => {
      return this.sessionClient.browsers.fs.writeFile(this.sessionId, contents, params, this.opt(options));
    },
  };

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
