import type { RequestOptions } from '../internal/request-options';

/**
 * Resolved HTTP routing for a browser session. When {@link ResolvedBrowserTransport.defaultBaseURL}
 * is set, requests use that browser session base URL plus a per-request jwt query param.
 * A future client-wide browser-id → base_url cache can plug in by supplying an alternate
 * resolver before constructing {@link KernelBrowserSession}.
 */
export type ResolvedBrowserTransport = {
  sessionId: string;
  defaultBaseURL?: string | undefined;
  jwt?: string | undefined;
};

export type KernelBrowserLike = {
  session_id: string;
  base_url?: string | null | undefined;
  cdp_ws_url?: string | null | undefined;
  /** When set, overrides jwt parsed from cdp_ws_url */
  jwt?: string | null | undefined;
};

export function parseJwtFromCdpWsUrl(cdpWsUrl: string | null | undefined): string | undefined {
  if (!cdpWsUrl) {
    return undefined;
  }
  try {
    const u = new URL(cdpWsUrl);
    const jwt = u.searchParams.get('jwt');
    return jwt ?? undefined;
  } catch {
    return undefined;
  }
}

export function resolveBrowserTransport(browser: KernelBrowserLike): ResolvedBrowserTransport {
  const sessionId = browser.session_id;
  const rawBase = browser.base_url?.trim();
  const defaultBaseURL = rawBase && rawBase.length > 0 ? rawBase : undefined;
  const jwt =
    (typeof browser.jwt === 'string' && browser.jwt.length > 0 ? browser.jwt : undefined) ??
    parseJwtFromCdpWsUrl(browser.cdp_ws_url ?? undefined);
  return { sessionId, defaultBaseURL, jwt };
}

export function mergeBrowserScopedRequestOptions(
  transport: ResolvedBrowserTransport,
  options?: RequestOptions,
): RequestOptions | undefined {
  if (!transport.defaultBaseURL) {
    return options;
  }
  const next: RequestOptions = { ...options, defaultBaseURL: transport.defaultBaseURL };
  if (transport.jwt) {
    const prev =
      options?.query && typeof options.query === 'object' && !Array.isArray(options.query) ?
        (options.query as Record<string, unknown>)
      : {};
    next.query = { ...prev, jwt: transport.jwt };
  }
  return next;
}
