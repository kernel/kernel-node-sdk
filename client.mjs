// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var _Kernel_instances, _a, _Kernel_encoder, _Kernel_baseURLOverridden;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "./internal/tslib.mjs";
import { uuid4 } from "./internal/utils/uuid.mjs";
import { validatePositiveInteger, isAbsoluteURL, safeJSON } from "./internal/utils/values.mjs";
import { sleep } from "./internal/utils/sleep.mjs";
import { castToError, isAbortError } from "./internal/errors.mjs";
import { getPlatformHeaders } from "./internal/detect-platform.mjs";
import * as Shims from "./internal/shims.mjs";
import * as Opts from "./internal/request-options.mjs";
import { stringifyQuery } from "./internal/utils/query.mjs";
import { VERSION } from "./version.mjs";
import * as Errors from "./core/error.mjs";
import * as Pagination from "./core/pagination.mjs";
import * as Uploads from "./core/uploads.mjs";
import * as API from "./resources/index.mjs";
import { APIPromise } from "./core/api-promise.mjs";
import { APIKeys, } from "./resources/api-keys.mjs";
import { Apps } from "./resources/apps.mjs";
import { BrowserRouteCache, browserRoutingSubresourcesFromEnv, createRoutingFetch, } from "./lib/browser-routing.mjs";
import { BrowserPools, } from "./resources/browser-pools.mjs";
import { CredentialProviders, } from "./resources/credential-providers.mjs";
import { Credentials, } from "./resources/credentials.mjs";
import { Deployments, } from "./resources/deployments.mjs";
import { KernelApp } from "./core/app-framework.mjs";
import { Extensions, } from "./resources/extensions.mjs";
import { Invocations, } from "./resources/invocations.mjs";
import { Profiles, } from "./resources/profiles.mjs";
import { Proxies, } from "./resources/proxies.mjs";
import { VaultProviderConfigs, } from "./resources/vault-provider-configs.mjs";
import { AuditLogs, } from "./resources/audit-logs/audit-logs.mjs";
import { Auth } from "./resources/auth/auth.mjs";
import { Browsers, } from "./resources/browsers/browsers.mjs";
import { ConfigRegistry, } from "./resources/config-registry/config-registry.mjs";
import { Organization } from "./resources/organization/organization.mjs";
import { Projects, } from "./resources/projects/projects.mjs";
import { Telemetry } from "./resources/telemetry/telemetry.mjs";
import { Vaults, } from "./resources/vaults/vaults.mjs";
import { buildHeaders } from "./internal/headers.mjs";
import { readEnv } from "./internal/utils/env.mjs";
import { formatRequestDetails, loggerFor, parseLogLevel, } from "./internal/utils/log.mjs";
import { isEmptyObj } from "./internal/utils/values.mjs";
const environments = {
    production: 'https://api.onkernel.com/',
    development: 'https://localhost:3001/',
};
/**
 * API Client for interfacing with the Kernel API.
 */
export class Kernel {
    /**
     * API Client for interfacing with the Kernel API.
     *
     * @param {string | undefined} [opts.apiKey=process.env['KERNEL_API_KEY'] ?? undefined]
     * @param {string | null | undefined} [opts.projectID]
     * @param {string | null | undefined} [opts.project]
     * @param {Environment} [opts.environment=production] - Specifies the environment URL to use for the API.
     * @param {string} [opts.baseURL=process.env['KERNEL_BASE_URL'] ?? https://api.onkernel.com/] - Override the default base URL for the API.
     * @param {number} [opts.timeout=1 minute] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
     * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
     * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
     * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
     * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
     * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
     */
    constructor({ baseURL = readEnv('KERNEL_BASE_URL'), apiKey = readEnv('KERNEL_API_KEY'), projectID = null, project = null, ...opts } = {}) {
        _Kernel_instances.add(this);
        _Kernel_encoder.set(this, void 0);
        /**
         * Create and manage app deployments and stream deployment events.
         */
        this.deployments = new API.Deployments(this);
        /**
         * List applications and versions.
         */
        this.apps = new API.Apps(this);
        /**
         * Invoke actions and stream or query invocation status and events.
         */
        this.invocations = new API.Invocations(this);
        /**
         * Resolve browser and proxy recommendations for bot-protected sites.
         */
        this.configRegistry = new API.ConfigRegistry(this);
        this.browsers = new API.Browsers(this);
        /**
         * Create, list, retrieve, and delete browser profiles.
         */
        this.profiles = new API.Profiles(this);
        this.auth = new API.Auth(this);
        this.telemetry = new API.Telemetry(this);
        /**
         * Create and manage proxy configurations for routing browser traffic.
         */
        this.proxies = new API.Proxies(this);
        /**
         * Create, list, retrieve, and delete browser extensions.
         */
        this.extensions = new API.Extensions(this);
        /**
         * Create and manage browser pools for acquiring and releasing browsers.
         */
        this.browserPools = new API.BrowserPools(this);
        this.vaultProviderConfigs = new API.VaultProviderConfigs(this);
        this.vaults = new API.Vaults(this);
        /**
         * Create and manage credentials for authentication.
         */
        this.credentials = new API.Credentials(this);
        /**
         * Create and manage projects for resource isolation within an organization.
         * When projects are disabled for the organization, project operations return
         * `404` with code `projects_disabled`.
         *
         */
        this.projects = new API.Projects(this);
        this.organization = new API.Organization(this);
        /**
         * Read audit log records for the authenticated organization.
         */
        this.auditLogs = new API.AuditLogs(this);
        /**
         * Create and manage API keys for organization and project-scoped access.
         */
        this.apiKeys = new API.APIKeys(this);
        /**
         * Configure external credential providers like 1Password.
         */
        this.credentialProviders = new API.CredentialProviders(this);
        // Check for Bun runtime in a way that avoids type errors if Bun is not defined
        if (typeof globalThis !== 'undefined' &&
            typeof globalThis.Bun !== 'undefined' &&
            globalThis.Bun.version &&
            !readEnv('KERNEL_SUPPRESS_BUN_WARNING')) {
            loggerFor(this).warn('The Bun runtime was detected. Playwright may have CDP connection issues, proceed with caution. Suppress this warning by setting the KERNEL_SUPPRESS_BUN_WARNING environment variable to true');
        }
        if (apiKey === undefined) {
            throw new Errors.KernelError("The KERNEL_API_KEY environment variable is missing or empty; either provide it, or instantiate the Kernel client with an apiKey option, like new Kernel({ apiKey: 'My API Key' }).");
        }
        const options = {
            apiKey,
            projectID,
            project,
            ...opts,
            baseURL,
            environment: opts.environment ?? 'production',
        };
        if (baseURL && opts.environment) {
            throw new Errors.KernelError('Ambiguous URL; The `baseURL` option (or KERNEL_BASE_URL env var) and the `environment` option are given. If you want to use the environment you must pass baseURL: null');
        }
        this.baseURL = options.baseURL || environments[options.environment || 'production'];
        this.timeout = options.timeout ?? _a.DEFAULT_TIMEOUT /* 1 minute */;
        this.logger = options.logger ?? console;
        const defaultLogLevel = 'warn';
        // Set default logLevel early so that we can log a warning in parseLogLevel.
        this.logLevel = defaultLogLevel;
        this.logLevel =
            parseLogLevel(options.logLevel, 'ClientOptions.logLevel', this) ??
                parseLogLevel(readEnv('KERNEL_LOG'), "process.env['KERNEL_LOG']", this) ??
                defaultLogLevel;
        this.fetchOptions = options.fetchOptions;
        this.maxRetries = options.maxRetries ?? 2;
        this.rawFetch = options.fetch ?? Shims.getDefaultFetch();
        this.browserRouteCache = new BrowserRouteCache();
        this.fetch = createRoutingFetch(this.rawFetch, {
            apiBaseURL: this.baseURL,
            subresources: browserRoutingSubresourcesFromEnv(),
            cache: this.browserRouteCache,
        });
        __classPrivateFieldSet(this, _Kernel_encoder, Opts.FallbackEncoder, "f");
        const customHeadersEnv = readEnv('KERNEL_CUSTOM_HEADERS');
        if (customHeadersEnv) {
            const parsed = {};
            for (const line of customHeadersEnv.split('\n')) {
                const colon = line.indexOf(':');
                if (colon >= 0) {
                    parsed[line.substring(0, colon).trim()] = line.substring(colon + 1).trim();
                }
            }
            options.defaultHeaders = { ...parsed, ...options.defaultHeaders };
        }
        this._options = options;
        this.apiKey = apiKey;
        this.projectID = projectID;
        this.project = project;
    }
    /**
     * Create a new client instance re-using the same options given to the current client with optional overriding.
     */
    withOptions(options) {
        const client = new this.constructor({
            ...this._options,
            environment: options.environment ? options.environment : undefined,
            baseURL: options.environment ? undefined : this.baseURL,
            maxRetries: this.maxRetries,
            timeout: this.timeout,
            logger: this.logger,
            logLevel: this.logLevel,
            fetch: this.rawFetch,
            fetchOptions: this.fetchOptions,
            apiKey: this.apiKey,
            projectID: this.projectID,
            project: this.project,
            ...options,
        });
        client.browserRouteCache = this.browserRouteCache;
        client.fetch = createRoutingFetch(client.rawFetch, {
            apiBaseURL: client.baseURL,
            subresources: browserRoutingSubresourcesFromEnv(),
            cache: client.browserRouteCache,
        });
        return client;
    }
    defaultQuery() {
        return this._options.defaultQuery;
    }
    validateHeaders({ values, nulls }) {
        return;
    }
    async authHeaders(opts) {
        return buildHeaders([{ Authorization: `Bearer ${this.apiKey}` }]);
    }
    stringifyQuery(query) {
        return stringifyQuery(query);
    }
    getUserAgent() {
        return `${this.constructor.name}/JS ${VERSION}`;
    }
    defaultIdempotencyKey() {
        return `stainless-node-retry-${uuid4()}`;
    }
    makeStatusError(status, error, message, headers) {
        return Errors.APIError.generate(status, error, message, headers);
    }
    buildURL(path, query, defaultBaseURL) {
        const baseURL = (!__classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_baseURLOverridden).call(this) && defaultBaseURL) || this.baseURL;
        const url = isAbsoluteURL(path) ?
            new URL(path)
            : new URL(baseURL + (baseURL.endsWith('/') && path.startsWith('/') ? path.slice(1) : path));
        const defaultQuery = this.defaultQuery();
        const pathQuery = Object.fromEntries(url.searchParams);
        if (!isEmptyObj(defaultQuery) || !isEmptyObj(pathQuery)) {
            query = { ...pathQuery, ...defaultQuery, ...query };
        }
        if (typeof query === 'object' && query && !Array.isArray(query)) {
            url.search = this.stringifyQuery(query);
        }
        return url.toString();
    }
    /**
     * Used as a callback for mutating the given `FinalRequestOptions` object.
     */
    async prepareOptions(options) { }
    /**
     * Used as a callback for mutating the given `RequestInit` object.
     *
     * This is useful for cases where you want to add certain headers based off of
     * the request properties, e.g. `method` or `url`.
     */
    async prepareRequest(request, { url, options }) { }
    get(path, opts) {
        return this.methodRequest('get', path, opts);
    }
    post(path, opts) {
        return this.methodRequest('post', path, opts);
    }
    patch(path, opts) {
        return this.methodRequest('patch', path, opts);
    }
    put(path, opts) {
        return this.methodRequest('put', path, opts);
    }
    delete(path, opts) {
        return this.methodRequest('delete', path, opts);
    }
    methodRequest(method, path, opts) {
        return this.request(Promise.resolve(opts).then((opts) => {
            return { method, path, ...opts };
        }));
    }
    request(options, remainingRetries = null) {
        return new APIPromise(this, this.makeRequest(options, remainingRetries, undefined));
    }
    async makeRequest(optionsInput, retriesRemaining, retryOfRequestLogID) {
        const options = await optionsInput;
        const maxRetries = options.maxRetries ?? this.maxRetries;
        if (retriesRemaining == null) {
            retriesRemaining = maxRetries;
        }
        await this.prepareOptions(options);
        const { req, url, timeout } = await this.buildRequest(options, {
            retryCount: maxRetries - retriesRemaining,
        });
        await this.prepareRequest(req, { url, options });
        /** Not an API request ID, just for correlating local log entries. */
        const requestLogID = 'log_' + ((Math.random() * (1 << 24)) | 0).toString(16).padStart(6, '0');
        const retryLogStr = retryOfRequestLogID === undefined ? '' : `, retryOf: ${retryOfRequestLogID}`;
        const startTime = Date.now();
        loggerFor(this).debug(`[${requestLogID}] sending request`, formatRequestDetails({
            retryOfRequestLogID,
            method: options.method,
            url,
            options,
            headers: req.headers,
        }));
        if (options.signal?.aborted) {
            throw new Errors.APIUserAbortError();
        }
        const controller = new AbortController();
        const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
        const headersTime = Date.now();
        if (response instanceof globalThis.Error) {
            const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
            if (options.signal?.aborted) {
                throw new Errors.APIUserAbortError();
            }
            // detect native connection timeout errors
            // deno throws "TypeError: error sending request for url (https://example/): client error (Connect): tcp connect error: Operation timed out (os error 60): Operation timed out (os error 60)"
            // undici throws "TypeError: fetch failed" with cause "ConnectTimeoutError: Connect Timeout Error (attempted address: example:443, timeout: 1ms)"
            // others do not provide enough information to distinguish timeouts from other connection errors
            const isTimeout = isAbortError(response) ||
                /timed? ?out/i.test(String(response) + ('cause' in response ? String(response.cause) : ''));
            if (retriesRemaining) {
                loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - ${retryMessage}`);
                loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (${retryMessage})`, formatRequestDetails({
                    retryOfRequestLogID,
                    url,
                    durationMs: headersTime - startTime,
                    message: response.message,
                }));
                return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
            }
            loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - error; no more retries left`);
            loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (error; no more retries left)`, formatRequestDetails({
                retryOfRequestLogID,
                url,
                durationMs: headersTime - startTime,
                message: response.message,
            }));
            if (isTimeout) {
                throw new Errors.APIConnectionTimeoutError();
            }
            throw new Errors.APIConnectionError({ cause: response });
        }
        const responseInfo = `[${requestLogID}${retryLogStr}] ${req.method} ${url} ${response.ok ? 'succeeded' : 'failed'} with status ${response.status} in ${headersTime - startTime}ms`;
        if (!response.ok) {
            const shouldRetry = await this.shouldRetry(response);
            if (retriesRemaining && shouldRetry) {
                const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
                // We don't need the body of this response.
                await Shims.CancelReadableStream(response.body);
                loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
                loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
                    retryOfRequestLogID,
                    url: response.url,
                    status: response.status,
                    headers: response.headers,
                    durationMs: headersTime - startTime,
                }));
                return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID, response.headers);
            }
            const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;
            loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
            const errText = await response.text().catch((err) => castToError(err).message);
            const errJSON = safeJSON(errText);
            const errMessage = errJSON ? undefined : errText;
            loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
                retryOfRequestLogID,
                url: response.url,
                status: response.status,
                headers: response.headers,
                message: errMessage,
                durationMs: Date.now() - startTime,
            }));
            const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
            throw err;
        }
        loggerFor(this).info(responseInfo);
        loggerFor(this).debug(`[${requestLogID}] response start`, formatRequestDetails({
            retryOfRequestLogID,
            url: response.url,
            status: response.status,
            headers: response.headers,
            durationMs: headersTime - startTime,
        }));
        return { response, options, controller, requestLogID, retryOfRequestLogID, startTime };
    }
    getAPIList(path, Page, opts) {
        return this.requestAPIList(Page, opts && 'then' in opts ?
            opts.then((opts) => ({ method: 'get', path, ...opts }))
            : { method: 'get', path, ...opts });
    }
    requestAPIList(Page, options) {
        const request = this.makeRequest(options, null, undefined);
        return new Pagination.PagePromise(this, request, Page);
    }
    async fetchWithTimeout(url, init, ms, controller) {
        const { signal, method, ...options } = init || {};
        const abort = this._makeAbort(controller);
        if (signal)
            signal.addEventListener('abort', abort, { once: true });
        const timeout = setTimeout(abort, ms);
        const isReadableBody = (globalThis.ReadableStream && options.body instanceof globalThis.ReadableStream) ||
            (typeof options.body === 'object' && options.body !== null && Symbol.asyncIterator in options.body);
        const fetchOptions = {
            signal: controller.signal,
            ...(isReadableBody ? { duplex: 'half' } : {}),
            method: 'GET',
            ...options,
        };
        if (method) {
            // Custom methods like 'patch' need to be uppercased
            // See https://github.com/nodejs/undici/issues/2294
            fetchOptions.method = method.toUpperCase();
        }
        try {
            // use undefined this binding; fetch errors if bound to something else in browser/cloudflare
            return await this.fetch.call(undefined, url, fetchOptions);
        }
        finally {
            clearTimeout(timeout);
        }
    }
    async shouldRetry(response) {
        // Note this is not a standard header.
        const shouldRetryHeader = response.headers.get('x-should-retry');
        // If the server explicitly says whether or not to retry, obey.
        if (shouldRetryHeader === 'true')
            return true;
        if (shouldRetryHeader === 'false')
            return false;
        // Retry on request timeouts.
        if (response.status === 408)
            return true;
        // Retry on lock timeouts.
        if (response.status === 409)
            return true;
        // Retry on rate limits.
        if (response.status === 429)
            return true;
        // Retry internal errors.
        if (response.status >= 500)
            return true;
        return false;
    }
    async retryRequest(options, retriesRemaining, requestLogID, responseHeaders) {
        let timeoutMillis;
        // Note the `retry-after-ms` header may not be standard, but is a good idea and we'd like proactive support for it.
        const retryAfterMillisHeader = responseHeaders?.get('retry-after-ms');
        if (retryAfterMillisHeader) {
            const timeoutMs = parseFloat(retryAfterMillisHeader);
            if (!Number.isNaN(timeoutMs)) {
                timeoutMillis = timeoutMs;
            }
        }
        // About the Retry-After header: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After
        const retryAfterHeader = responseHeaders?.get('retry-after');
        if (retryAfterHeader && !timeoutMillis) {
            const timeoutSeconds = parseFloat(retryAfterHeader);
            if (!Number.isNaN(timeoutSeconds)) {
                timeoutMillis = timeoutSeconds * 1000;
            }
            else {
                timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
            }
        }
        // If the API asks us to wait a certain amount of time, just do what it
        // says, but otherwise calculate a default
        if (timeoutMillis === undefined) {
            const maxRetries = options.maxRetries ?? this.maxRetries;
            timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
        }
        await sleep(timeoutMillis);
        return this.makeRequest(options, retriesRemaining - 1, requestLogID);
    }
    calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
        const initialRetryDelay = 0.5;
        const maxRetryDelay = 8.0;
        const numRetries = maxRetries - retriesRemaining;
        // Apply exponential backoff, but not more than the max.
        const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
        // Apply some jitter, take up to at most 25 percent of the retry time.
        const jitter = 1 - Math.random() * 0.25;
        return sleepSeconds * jitter * 1000;
    }
    async buildRequest(inputOptions, { retryCount = 0 } = {}) {
        const options = { ...inputOptions };
        const { method, path, query, defaultBaseURL } = options;
        const url = this.buildURL(path, query, defaultBaseURL);
        if ('timeout' in options)
            validatePositiveInteger('timeout', options.timeout);
        options.timeout = options.timeout ?? this.timeout;
        const { bodyHeaders, body } = this.buildBody({ options });
        const reqHeaders = await this.buildHeaders({ options: inputOptions, method, bodyHeaders, retryCount });
        const req = {
            method,
            headers: reqHeaders,
            ...(options.signal && { signal: options.signal }),
            ...(globalThis.ReadableStream &&
                body instanceof globalThis.ReadableStream && { duplex: 'half' }),
            ...(body && { body }),
            ...(this.fetchOptions ?? {}),
            ...(options.fetchOptions ?? {}),
        };
        return { req, url, timeout: options.timeout };
    }
    async buildHeaders({ options, method, bodyHeaders, retryCount, }) {
        let idempotencyHeaders = {};
        if (this.idempotencyHeader && method !== 'get') {
            if (!options.idempotencyKey)
                options.idempotencyKey = this.defaultIdempotencyKey();
            idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
        }
        const headers = buildHeaders([
            idempotencyHeaders,
            {
                Accept: 'application/json',
                'User-Agent': this.getUserAgent(),
                'X-Stainless-Retry-Count': String(retryCount),
                ...(options.timeout ? { 'X-Stainless-Timeout': String(Math.trunc(options.timeout / 1000)) } : {}),
                ...getPlatformHeaders(),
                'X-Kernel-Project-Id': this.projectID,
                'X-Kernel-Project': this.project,
            },
            await this.authHeaders(options),
            this._options.defaultHeaders,
            bodyHeaders,
            options.headers,
        ]);
        this.validateHeaders(headers);
        return headers.values;
    }
    _makeAbort(controller) {
        // note: we can't just inline this method inside `fetchWithTimeout()` because then the closure
        //       would capture all request options, and cause a memory leak.
        return () => controller.abort();
    }
    buildBody({ options }) {
        const { body, headers: rawHeaders } = options;
        if (!body) {
            // A resource method always passes a `body` key when its operation defines a
            // request body, even if the caller omitted an optional body param. Keep the
            // content-type for those, and only elide it for operations with no body at
            // all (e.g. GET/DELETE).
            if (body == null && 'body' in options) {
                return __classPrivateFieldGet(this, _Kernel_encoder, "f").call(this, { body, headers: buildHeaders([rawHeaders]) });
            }
            return { bodyHeaders: undefined, body: undefined };
        }
        const headers = buildHeaders([rawHeaders]);
        if (
        // Pass raw type verbatim
        ArrayBuffer.isView(body) ||
            body instanceof ArrayBuffer ||
            body instanceof DataView ||
            (typeof body === 'string' &&
                // Preserve legacy string encoding behavior for now
                headers.values.has('content-type')) ||
            // `Blob` is superset of `File`
            (globalThis.Blob && body instanceof globalThis.Blob) ||
            // `FormData` -> `multipart/form-data`
            body instanceof FormData ||
            // `URLSearchParams` -> `application/x-www-form-urlencoded`
            body instanceof URLSearchParams ||
            // Send chunked stream (each chunk has own `length`)
            (globalThis.ReadableStream && body instanceof globalThis.ReadableStream)) {
            return { bodyHeaders: undefined, body: body };
        }
        else if (typeof body === 'object' &&
            (Symbol.asyncIterator in body ||
                (Symbol.iterator in body && 'next' in body && typeof body.next === 'function'))) {
            return { bodyHeaders: undefined, body: Shims.ReadableStreamFrom(body) };
        }
        else if (typeof body === 'object' &&
            headers.values.get('content-type') === 'application/x-www-form-urlencoded') {
            return {
                bodyHeaders: { 'content-type': 'application/x-www-form-urlencoded' },
                body: this.stringifyQuery(body),
            };
        }
        else {
            return __classPrivateFieldGet(this, _Kernel_encoder, "f").call(this, { body, headers });
        }
    }
    /**
     * Create a new KernelApp instance.
     *
     * @param name - The name of the app to create.
     * @returns A new KernelApp instance you can attach actions to.
     */
    app(name) {
        return new KernelApp(name);
    }
}
_a = Kernel, _Kernel_encoder = new WeakMap(), _Kernel_instances = new WeakSet(), _Kernel_baseURLOverridden = function _Kernel_baseURLOverridden() {
    return this.baseURL !== environments[this._options.environment || 'production'];
};
Kernel.Kernel = _a;
Kernel.DEFAULT_TIMEOUT = 60000; // 1 minute
Kernel.KernelError = Errors.KernelError;
Kernel.APIError = Errors.APIError;
Kernel.APIConnectionError = Errors.APIConnectionError;
Kernel.APIConnectionTimeoutError = Errors.APIConnectionTimeoutError;
Kernel.APIUserAbortError = Errors.APIUserAbortError;
Kernel.NotFoundError = Errors.NotFoundError;
Kernel.ConflictError = Errors.ConflictError;
Kernel.RateLimitError = Errors.RateLimitError;
Kernel.BadRequestError = Errors.BadRequestError;
Kernel.AuthenticationError = Errors.AuthenticationError;
Kernel.InternalServerError = Errors.InternalServerError;
Kernel.PermissionDeniedError = Errors.PermissionDeniedError;
Kernel.UnprocessableEntityError = Errors.UnprocessableEntityError;
Kernel.toFile = Uploads.toFile;
Kernel.Deployments = Deployments;
Kernel.Apps = Apps;
Kernel.Invocations = Invocations;
Kernel.ConfigRegistry = ConfigRegistry;
Kernel.Browsers = Browsers;
Kernel.Profiles = Profiles;
Kernel.Auth = Auth;
Kernel.Telemetry = Telemetry;
Kernel.Proxies = Proxies;
Kernel.Extensions = Extensions;
Kernel.BrowserPools = BrowserPools;
Kernel.VaultProviderConfigs = VaultProviderConfigs;
Kernel.Vaults = Vaults;
Kernel.Credentials = Credentials;
Kernel.Projects = Projects;
Kernel.Organization = Organization;
Kernel.AuditLogs = AuditLogs;
Kernel.APIKeys = APIKeys;
Kernel.CredentialProviders = CredentialProviders;
//# sourceMappingURL=client.mjs.map