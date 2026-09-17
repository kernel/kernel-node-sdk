// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import { buildHeaders } from "../../internal/headers.mjs";
import { path } from "../../internal/utils/path.mjs";
/**
 * Execute and manage processes on the browser instance.
 */
export class Process extends APIResource {
    /**
     * Execute a command synchronously
     *
     * @example
     * ```ts
     * const response = await client.browsers.process.exec(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { command: 'command' },
     * );
     * ```
     */
    exec(idOrName, body, options) {
        return this._client.post(path `/browsers/${idOrName}/process/exec`, { body, ...options });
    }
    /**
     * Send signal to process
     *
     * @example
     * ```ts
     * const response = await client.browsers.process.kill(
     *   '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
     *   {
     *     id_or_name: 'htzv5orfit78e1m2biiifpbv',
     *     signal: 'TERM',
     *   },
     * );
     * ```
     */
    kill(processID, params, options) {
        const { id_or_name, ...body } = params;
        return this._client.post(path `/browsers/${id_or_name}/process/${processID}/kill`, { body, ...options });
    }
    /**
     * Resize a PTY-backed process terminal
     *
     * @example
     * ```ts
     * const response = await client.browsers.process.resize(
     *   '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
     *   {
     *     id_or_name: 'htzv5orfit78e1m2biiifpbv',
     *     cols: 1,
     *     rows: 1,
     *   },
     * );
     * ```
     */
    resize(processID, params, options) {
        const { id_or_name, ...body } = params;
        return this._client.post(path `/browsers/${id_or_name}/process/${processID}/resize`, { body, ...options });
    }
    /**
     * Execute a command asynchronously
     *
     * @example
     * ```ts
     * const response = await client.browsers.process.spawn(
     *   'htzv5orfit78e1m2biiifpbv',
     *   { command: 'command' },
     * );
     * ```
     */
    spawn(idOrName, body, options) {
        return this._client.post(path `/browsers/${idOrName}/process/spawn`, { body, ...options });
    }
    /**
     * Get process status
     *
     * @example
     * ```ts
     * const response = await client.browsers.process.status(
     *   '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
     *   { id_or_name: 'htzv5orfit78e1m2biiifpbv' },
     * );
     * ```
     */
    status(processID, params, options) {
        const { id_or_name } = params;
        return this._client.get(path `/browsers/${id_or_name}/process/${processID}/status`, options);
    }
    /**
     * Write to process stdin
     *
     * @example
     * ```ts
     * const response = await client.browsers.process.stdin(
     *   '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
     *   {
     *     id_or_name: 'htzv5orfit78e1m2biiifpbv',
     *     data_b64: 'data_b64',
     *   },
     * );
     * ```
     */
    stdin(processID, params, options) {
        const { id_or_name, ...body } = params;
        return this._client.post(path `/browsers/${id_or_name}/process/${processID}/stdin`, { body, ...options });
    }
    /**
     * Stream process stdout via SSE
     *
     * @example
     * ```ts
     * const response = await client.browsers.process.stdoutStream(
     *   '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
     *   { id_or_name: 'htzv5orfit78e1m2biiifpbv' },
     * );
     * ```
     */
    stdoutStream(processID, params, options) {
        const { id_or_name } = params;
        return this._client.get(path `/browsers/${id_or_name}/process/${processID}/stdout/stream`, {
            ...options,
            headers: buildHeaders([{ Accept: 'text/event-stream' }, options?.headers]),
            stream: true,
        });
    }
}
//# sourceMappingURL=process.mjs.map