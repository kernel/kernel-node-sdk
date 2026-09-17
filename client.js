"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var _Kernel_instances, _a, _Kernel_encoder, _Kernel_baseURLOverridden;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kernel = void 0;
const tslib_1 = require("./internal/tslib.js");
const uuid_1 = require("./internal/utils/uuid.js");
const values_1 = require("./internal/utils/values.js");
const sleep_1 = require("./internal/utils/sleep.js");
const errors_1 = require("./internal/errors.js");
const detect_platform_1 = require("./internal/detect-platform.js");
const Shims = tslib_1.__importStar(require("./internal/shims.js"));
const Opts = tslib_1.__importStar(require("./internal/request-options.js"));
const query_1 = require("./internal/utils/query.js");
const version_1 = require("./version.js");
const Errors = tslib_1.__importStar(require("./core/error.js"));
const Pagination = tslib_1.__importStar(require("./core/pagination.js"));
const Uploads = tslib_1.__importStar(require("./core/uploads.js"));
const API = tslib_1.__importStar(require("./resources/index.js"));
const api_promise_1 = require("./core/api-promise.js");
const api_keys_1 = require("./resources/api-keys.js");
const apps_1 = require("./resources/apps.js");
const browser_routing_1 = require("./lib/browser-routing.js");
const browser_pools_1 = require("./resources/browser-pools.js");
const credential_providers_1 = require("./resources/credential-providers.js");
const credentials_1 = require("./resources/credentials.js");
const deployments_1 = require("./resources/deployments.js");
const app_framework_1 = require("./core/app-framework.js");
const extensions_1 = require("./resources/extensions.js");
const invocations_1 = require("./resources/invocations.js");
const profiles_1 = require("./resources/profiles.js");
const proxies_1 = require("./resources/proxies.js");
const vault_provider_configs_1 = require("./resources/vault-provider-configs.js");
const audit_logs_1 = require("./resources/audit-logs/audit-logs.js");
const auth_1 = require("./resources/auth/auth.js");
const browsers_1 = require("./resources/browsers/browsers.js");
const config_registry_1 = require("./resources/config-registry/config-registry.js");
const organization_1 = require("./resources/organization/organization.js");
const projects_1 = require("./resources/projects/projects.js");
const telemetry_1 = require("./resources/telemetry/telemetry.js");
const vaults_1 = require("./resources/vaults/vaults.js");
const headers_1 = require("./internal/headers.js");
const env_1 = require("./internal/utils/env.js");
const log_1 = require("./internal/utils/log.js");
const values_2 = require("./internal/utils/values.js");
const environments = {
    production: 'https://api.onkernel.com/',
    development: 'https://localhost:3001/',
};
/**
 * API Client for interfacing with the Kernel API.
 */
class Kernel {
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
    constructor({ baseURL = (0, env_1.readEnv)('KERNEL_BASE_URL'), apiKey = (0, env_1.readEnv)('KERNEL_API_KEY'), projectID = null, project = null, ...opts } = {}) {
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
            !(0, env_1.readEnv)('KERNEL_SUPPRESS_BUN_WARNING')) {
            (0, log_1.loggerFor)(this).warn('The Bun runtime was detected. Playwright may have CDP connection issues, proceed with caution. Suppress this warning by setting the KERNEL_SUPPRESS_BUN_WARNING environment variable to true');
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
            (0, log_1.parseLogLevel)(options.logLevel, 'ClientOptions.logLevel', this) ??
                (0, log_1.parseLogLevel)((0, env_1.readEnv)('KERNEL_LOG'), "process.env['KERNEL_LOG']", this) ??
                defaultLogLevel;
        this.fetchOptions = options.fetchOptions;
        this.maxRetries = options.maxRetries ?? 2;
        this.rawFetch = options.fetch ?? Shims.getDefaultFetch();
        this.browserRouteCache = new browser_routing_1.BrowserRouteCache();
        this.fetch = (0, browser_routing_1.createRoutingFetch)(this.rawFetch, {
            apiBaseURL: this.baseURL,
            subresources: (0, browser_routing_1.browserRoutingSubresourcesFromEnv)(),
            cache: this.browserRouteCache,
        });
        tslib_1.__classPrivateFieldSet(this, _Kernel_encoder, Opts.FallbackEncoder, "f");
        const customHeadersEnv = (0, env_1.readEnv)('KERNEL_CUSTOM_HEADERS');
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
        client.fetch = (0, browser_routing_1.createRoutingFetch)(client.rawFetch, {
            apiBaseURL: client.baseURL,
            subresources: (0, browser_routing_1.browserRoutingSubresourcesFromEnv)(),
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
        return (0, headers_1.buildHeaders)([{ Authorization: `Bearer ${this.apiKey}` }]);
    }
    stringifyQuery(query) {
        return (0, query_1.stringifyQuery)(query);
    }
    getUserAgent() {
        return `${this.constructor.name}/JS ${version_1.VERSION}`;
    }
    defaultIdempotencyKey() {
        return `stainless-node-retry-${(0, uuid_1.uuid4)()}`;
    }
    makeStatusError(status, error, message, headers) {
        return Errors.APIError.generate(status, error, message, headers);
    }
    buildURL(path, query, defaultBaseURL) {
        const baseURL = (!tslib_1.__classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_baseURLOverridden).call(this) && defaultBaseURL) || this.baseURL;
        const url = (0, values_1.isAbsoluteURL)(path) ?
            new URL(path)
            : new URL(baseURL + (baseURL.endsWith('/') && path.startsWith('/') ? path.slice(1) : path));
        const defaultQuery = this.defaultQuery();
        const pathQuery = Object.fromEntries(url.searchParams);
        if (!(0, values_2.isEmptyObj)(defaultQuery) || !(0, values_2.isEmptyObj)(pathQuery)) {
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
        return new api_promise_1.APIPromise(this, this.makeRequest(options, remainingRetries, undefined));
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
        (0, log_1.loggerFor)(this).debug(`[${requestLogID}] sending request`, (0, log_1.formatRequestDetails)({
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
        const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(errors_1.castToError);
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
            const isTimeout = (0, errors_1.isAbortError)(response) ||
                /timed? ?out/i.test(String(response) + ('cause' in response ? String(response.cause) : ''));
            if (retriesRemaining) {
                (0, log_1.loggerFor)(this).info(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - ${retryMessage}`);
                (0, log_1.loggerFor)(this).debug(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (${retryMessage})`, (0, log_1.formatRequestDetails)({
                    retryOfRequestLogID,
                    url,
                    durationMs: headersTime - startTime,
                    message: response.message,
                }));
                return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
            }
            (0, log_1.loggerFor)(this).info(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - error; no more retries left`);
            (0, log_1.loggerFor)(this).debug(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (error; no more retries left)`, (0, log_1.formatRequestDetails)({
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
                (0, log_1.loggerFor)(this).info(`${responseInfo} - ${retryMessage}`);
                (0, log_1.loggerFor)(this).debug(`[${requestLogID}] response error (${retryMessage})`, (0, log_1.formatRequestDetails)({
                    retryOfRequestLogID,
                    url: response.url,
                    status: response.status,
                    headers: response.headers,
                    durationMs: headersTime - startTime,
                }));
                return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID, response.headers);
            }
            const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;
            (0, log_1.loggerFor)(this).info(`${responseInfo} - ${retryMessage}`);
            const errText = await response.text().catch((err) => (0, errors_1.castToError)(err).message);
            const errJSON = (0, values_1.safeJSON)(errText);
            const errMessage = errJSON ? undefined : errText;
            (0, log_1.loggerFor)(this).debug(`[${requestLogID}] response error (${retryMessage})`, (0, log_1.formatRequestDetails)({
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
        (0, log_1.loggerFor)(this).info(responseInfo);
        (0, log_1.loggerFor)(this).debug(`[${requestLogID}] response start`, (0, log_1.formatRequestDetails)({
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
        await (0, sleep_1.sleep)(timeoutMillis);
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
            (0, values_1.validatePositiveInteger)('timeout', options.timeout);
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
        const headers = (0, headers_1.buildHeaders)([
            idempotencyHeaders,
            {
                Accept: 'application/json',
                'User-Agent': this.getUserAgent(),
                'X-Stainless-Retry-Count': String(retryCount),
                ...(options.timeout ? { 'X-Stainless-Timeout': String(Math.trunc(options.timeout / 1000)) } : {}),
                ...(0, detect_platform_1.getPlatformHeaders)(),
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
                return tslib_1.__classPrivateFieldGet(this, _Kernel_encoder, "f").call(this, { body, headers: (0, headers_1.buildHeaders)([rawHeaders]) });
            }
            return { bodyHeaders: undefined, body: undefined };
        }
        const headers = (0, headers_1.buildHeaders)([rawHeaders]);
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
            return tslib_1.__classPrivateFieldGet(this, _Kernel_encoder, "f").call(this, { body, headers });
        }
    }
    /**
     * Create a new KernelApp instance.
     *
     * @param name - The name of the app to create.
     * @returns A new KernelApp instance you can attach actions to.
     */
    app(name) {
        return new app_framework_1.KernelApp(name);
    }
}
exports.Kernel = Kernel;
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
Kernel.Deployments = deployments_1.Deployments;
Kernel.Apps = apps_1.Apps;
Kernel.Invocations = invocations_1.Invocations;
Kernel.ConfigRegistry = config_registry_1.ConfigRegistry;
Kernel.Browsers = browsers_1.Browsers;
Kernel.Profiles = profiles_1.Profiles;
Kernel.Auth = auth_1.Auth;
Kernel.Telemetry = telemetry_1.Telemetry;
Kernel.Proxies = proxies_1.Proxies;
Kernel.Extensions = extensions_1.Extensions;
Kernel.BrowserPools = browser_pools_1.BrowserPools;
Kernel.VaultProviderConfigs = vault_provider_configs_1.VaultProviderConfigs;
Kernel.Vaults = vaults_1.Vaults;
Kernel.Credentials = credentials_1.Credentials;
Kernel.Projects = projects_1.Projects;
Kernel.Organization = organization_1.Organization;
Kernel.AuditLogs = audit_logs_1.AuditLogs;
Kernel.APIKeys = api_keys_1.APIKeys;
Kernel.CredentialProviders = credential_providers_1.CredentialProviders;
//# sourceMappingURL=client.js.map