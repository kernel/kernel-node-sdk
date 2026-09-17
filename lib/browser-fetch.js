"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.browserFetch = browserFetch;
const error_1 = require("../core/error.js");
const headers_1 = require("../internal/headers.js");
const join_url_1 = require("./join-url.js");
async function browserFetch(client, sessionId, input, init) {
    const route = client.browserRouteCache.get(sessionId);
    if (!route) {
        throw new error_1.KernelError(`browser route cache does not contain session ${sessionId}; create, retrieve, or list the browser before calling browser.fetch`);
    }
    const { url: targetURL, method, headers, body, signal, duplex, timeout_ms } = splitFetchArgs(input, init);
    assertHTTPURL(targetURL);
    const query = { url: targetURL, jwt: route.jwt };
    if (timeout_ms !== undefined) {
        query['timeout_ms'] = timeout_ms;
    }
    const accept = headers.get('accept');
    const requestOptions = {
        method: normalizeMethod(method),
        path: (0, join_url_1.joinURL)(route.baseURL, '/curl/raw'),
        query,
        body: body,
        headers: (0, headers_1.buildHeaders)([
            { Authorization: null },
            accept ? { Accept: accept } : { Accept: '*/*' },
            headersToRequestOptionsHeaders(headers),
        ]),
        signal: signal ?? null,
        __binaryResponse: true,
    };
    if (duplex) {
        requestOptions.fetchOptions = { duplex };
    }
    return client.request(requestOptions).asResponse();
}
function normalizeMethod(method) {
    const methodLower = method.toLowerCase();
    const allowed = new Set(['get', 'post', 'put', 'patch', 'delete']);
    if (!allowed.has(methodLower)) {
        throw new error_1.KernelError(`browser.fetch unsupported HTTP method: ${method}`);
    }
    return methodLower;
}
function splitFetchArgs(input, init) {
    const timeoutFromInit = init && 'timeout_ms' in init ? init['timeout_ms'] : undefined;
    if (input instanceof Request) {
        const headers = new Headers(input.headers);
        if (init?.headers) {
            const extra = new Headers(init.headers);
            extra.forEach((value, key) => {
                headers.set(key, value);
            });
        }
        const out = {
            url: input.url,
            method: (init?.method ?? input.method)?.toUpperCase() || 'GET',
            headers,
        };
        const body = init?.body ?? input.body;
        if (body !== undefined && body !== null) {
            out.body = body;
        }
        const signal = init?.signal ?? input.signal;
        if (signal !== undefined) {
            out.signal = signal;
        }
        if (init?.duplex !== undefined) {
            out.duplex = init.duplex;
        }
        if (timeoutFromInit !== undefined) {
            out.timeout_ms = timeoutFromInit;
        }
        return out;
    }
    const out = {
        url: input instanceof URL ? input.href : String(input),
        method: (init?.method ?? 'GET').toUpperCase(),
        headers: new Headers(init?.headers),
    };
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
function assertHTTPURL(url) {
    let parsed;
    try {
        parsed = new URL(url);
    }
    catch {
        throw new error_1.KernelError(`browser.fetch target must be an absolute URL; received: ${url}`);
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new error_1.KernelError(`browser.fetch only supports http(s) URLs; received: ${parsed.protocol}`);
    }
}
function headersToRequestOptionsHeaders(headers) {
    const out = {};
    headers.forEach((value, key) => {
        switch (key.toLowerCase()) {
            case 'accept':
            case 'content-length':
            case 'connection':
            case 'keep-alive':
            case 'proxy-authenticate':
            case 'proxy-authorization':
            case 'te':
            case 'trailers':
            case 'transfer-encoding':
            case 'upgrade':
                return;
            default:
                out[key] = value;
        }
    });
    return out;
}
//# sourceMappingURL=browser-fetch.js.map