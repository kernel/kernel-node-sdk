"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Browsers = void 0;
const tslib_1 = require("../../internal/tslib.js");
const resource_1 = require("../../core/resource.js");
const ComputerAPI = tslib_1.__importStar(require("./computer.js"));
const computer_1 = require("./computer.js");
const LogsAPI = tslib_1.__importStar(require("./logs.js"));
const logs_1 = require("./logs.js");
const PlaywrightAPI = tslib_1.__importStar(require("./playwright.js"));
const playwright_1 = require("./playwright.js");
const ProcessAPI = tslib_1.__importStar(require("./process.js"));
const process_1 = require("./process.js");
const ReplaysAPI = tslib_1.__importStar(require("./replays.js"));
const replays_1 = require("./replays.js");
const TelemetryAPI = tslib_1.__importStar(require("./telemetry.js"));
const telemetry_1 = require("./telemetry.js");
const WebmcpAPI = tslib_1.__importStar(require("./webmcp.js"));
const webmcp_1 = require("./webmcp.js");
const FsAPI = tslib_1.__importStar(require("./fs/fs.js"));
const fs_1 = require("./fs/fs.js");
const pagination_1 = require("../../core/pagination.js");
const headers_1 = require("../../internal/headers.js");
const uploads_1 = require("../../internal/uploads.js");
const path_1 = require("../../internal/utils/path.js");
const browser_fetch_1 = require("../../lib/browser-fetch.js");
class Browsers extends resource_1.APIResource {
    constructor() {
        super(...arguments);
        this.telemetry = new TelemetryAPI.Telemetry(this._client);
        this.replays = new ReplaysAPI.Replays(this._client);
        this.fs = new FsAPI.Fs(this._client);
        this.process = new ProcessAPI.Process(this._client);
        this.logs = new LogsAPI.Logs(this._client);
        this.computer = new ComputerAPI.Computer(this._client);
        this.playwright = new PlaywrightAPI.Playwright(this._client);
        this.webmcp = new WebmcpAPI.Webmcp(this._client);
    }
    /**
     * Create a new browser session from within an action.
     *
     * @example
     * ```ts
     * const browser = await client.browsers.create();
     * ```
     */
    create(body = {}, options) {
        return this._client.post('/browsers', { body, ...options });
    }
    /**
     * Get information about a browser session.
     *
     * @example
     * ```ts
     * const browser = await client.browsers.retrieve(
     *   'htzv5orfit78e1m2biiifpbv',
     * );
     * ```
     */
    retrieve(idOrName, query = {}, options) {
        return this._client.get((0, path_1.path) `/browsers/${idOrName}`, { query, ...options });
    }
    /**
     * Update a browser session.
     *
     * @example
     * ```ts
     * const browser = await client.browsers.update(
     *   'htzv5orfit78e1m2biiifpbv',
     * );
     * ```
     */
    update(idOrName, body, options) {
        return this._client.patch((0, path_1.path) `/browsers/${idOrName}`, { body, ...options });
    }
    /**
     * List all browser sessions with pagination support. Use status parameter to
     * filter by session state.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const browserListResponse of client.browsers.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/browsers', (pagination_1.OffsetPagination), { query, ...options });
    }
    /**
     * Sends an HTTP request through Chrome's HTTP request stack, inheriting the
     * browser's TLS fingerprint, cookies, proxy configuration, and headers. Returns a
     * structured JSON response with status, headers, body, and timing.
     *
     * @example
     * ```ts
     * const response = await client.browsers.curl(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { url: 'url' },
     * );
     * ```
     */
    curl(idOrName, body, options) {
        return this._client.post((0, path_1.path) `/browsers/${idOrName}/curl`, { body, ...options });
    }
    /**
     * Issues an HTTP request through the browser VM network stack, routing directly
     * to the browser's `base_url` using the shared browser route cache.
     */
    fetch(id, input, init) {
        return (0, browser_fetch_1.browserFetch)(this._client, id, input, init);
    }
    /**
     * Delete a browser session by ID or name
     *
     * @example
     * ```ts
     * await client.browsers.deleteByID(
     *   'htzv5orfit78e1m2biiifpbv',
     * );
     * ```
     */
    deleteByID(idOrName, options) {
        return this._client.delete((0, path_1.path) `/browsers/${idOrName}`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: '*/*' }, options?.headers]),
        });
    }
    /**
     * Loads one or more unpacked extensions using live CDP activation when eligible.
     * Chromium restarts when enterprise policy requires it or live activation fails.
     *
     * @example
     * ```ts
     * await client.browsers.loadExtensions(
     *   'htzv5orfit78e1m2biiifpbv',
     *   {
     *     extensions: [
     *       {
     *         name: 'name',
     *         zip_file: fs.createReadStream('path/to/file'),
     *       },
     *     ],
     *   },
     * );
     * ```
     */
    loadExtensions(idOrName, body, options) {
        return this._client.post((0, path_1.path) `/browsers/${idOrName}/extensions`, (0, uploads_1.multipartFormRequestOptions)({ body, ...options, headers: (0, headers_1.buildHeaders)([{ Accept: '*/*' }, options?.headers]) }, this._client));
    }
    /**
     * Execute JavaScript in a persistent Node.js runtime inside the browser VM.
     * Top-level bindings, closures, mutations, and dynamically imported modules
     * persist across calls until the REPL is reset or replaced. Start with
     * `repl.help()` to list available methods, or call `repl.help("click")` for
     * detailed help.
     *
     * Expression values are ignored. Emit ordered text or image output with
     * `repl.write(...)`, console methods, or `repl.emitImage(...)`. The runtime also
     * exposes browser-control helpers, WebMCP, Patchright, Playwright, and raw CDP.
     *
     * Executions are serialized. A timeout, crash, OOM, or protocol failure terminates
     * the REPL and changes its `repl_id`. This is unrestricted code execution inside
     * the browser VM and is not sandboxed.
     *
     * @example
     * ```ts
     * const browserReplResult = await client.browsers.repl(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { code: 'code' },
     * );
     * ```
     */
    repl(idOrName, body, options) {
        return this._client.post((0, path_1.path) `/browsers/${idOrName}/repl`, { body, ...options });
    }
}
exports.Browsers = Browsers;
Browsers.Telemetry = telemetry_1.Telemetry;
Browsers.Replays = replays_1.Replays;
Browsers.Fs = fs_1.Fs;
Browsers.Process = process_1.Process;
Browsers.Logs = logs_1.Logs;
Browsers.Computer = computer_1.Computer;
Browsers.Playwright = playwright_1.Playwright;
Browsers.Webmcp = webmcp_1.Webmcp;
//# sourceMappingURL=browsers.js.map