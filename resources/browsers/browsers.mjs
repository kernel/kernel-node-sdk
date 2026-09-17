// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import * as ComputerAPI from "./computer.mjs";
import { Computer, } from "./computer.mjs";
import * as LogsAPI from "./logs.mjs";
import { Logs } from "./logs.mjs";
import * as PlaywrightAPI from "./playwright.mjs";
import { Playwright } from "./playwright.mjs";
import * as ProcessAPI from "./process.mjs";
import { Process, } from "./process.mjs";
import * as ReplaysAPI from "./replays.mjs";
import { Replays, } from "./replays.mjs";
import * as TelemetryAPI from "./telemetry.mjs";
import { Telemetry as TelemetryAPITelemetry, } from "./telemetry.mjs";
import * as WebmcpAPI from "./webmcp.mjs";
import { Webmcp, } from "./webmcp.mjs";
import * as FsAPI from "./fs/fs.mjs";
import { Fs, } from "./fs/fs.mjs";
import { OffsetPagination } from "../../core/pagination.mjs";
import { buildHeaders } from "../../internal/headers.mjs";
import { multipartFormRequestOptions } from "../../internal/uploads.mjs";
import { path } from "../../internal/utils/path.mjs";
import { browserFetch } from "../../lib/browser-fetch.mjs";
export class Browsers extends APIResource {
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
        return this._client.get(path `/browsers/${idOrName}`, { query, ...options });
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
        return this._client.patch(path `/browsers/${idOrName}`, { body, ...options });
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
        return this._client.getAPIList('/browsers', (OffsetPagination), { query, ...options });
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
        return this._client.post(path `/browsers/${idOrName}/curl`, { body, ...options });
    }
    /**
     * Issues an HTTP request through the browser VM network stack, routing directly
     * to the browser's `base_url` using the shared browser route cache.
     */
    fetch(id, input, init) {
        return browserFetch(this._client, id, input, init);
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
        return this._client.delete(path `/browsers/${idOrName}`, {
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
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
        return this._client.post(path `/browsers/${idOrName}/extensions`, multipartFormRequestOptions({ body, ...options, headers: buildHeaders([{ Accept: '*/*' }, options?.headers]) }, this._client));
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
        return this._client.post(path `/browsers/${idOrName}/repl`, { body, ...options });
    }
}
Browsers.Telemetry = TelemetryAPITelemetry;
Browsers.Replays = Replays;
Browsers.Fs = Fs;
Browsers.Process = Process;
Browsers.Logs = Logs;
Browsers.Computer = Computer;
Browsers.Playwright = Playwright;
Browsers.Webmcp = Webmcp;
//# sourceMappingURL=browsers.mjs.map