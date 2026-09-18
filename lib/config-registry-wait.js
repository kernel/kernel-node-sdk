"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForConfigRegistryAnalysis = waitForConfigRegistryAnalysis;
const error_1 = require("../core/error.js");
const headers_1 = require("../internal/headers.js");
const defaultPollIntervalMs = 5000;
const terminalStatuses = new Set(['completed', 'failed', 'canceled', 'expired']);
const timeoutError = (id, polls, lastStatus, startedAt) => new error_1.APIConnectionTimeoutError({
    message: `Timed out waiting for config registry analysis ${JSON.stringify(id)} after ${(performance.now() - startedAt).toFixed(0)}ms and ${polls} polls; last status was ${JSON.stringify(lastStatus)}`,
});
const wait = (ms, signal) => {
    if (signal?.aborted) {
        return Promise.reject(new error_1.APIUserAbortError());
    }
    return new Promise((resolve, reject) => {
        let settled = false;
        const finish = (error) => {
            if (settled)
                return;
            settled = true;
            clearTimeout(timer);
            signal?.removeEventListener('abort', onAbort);
            if (error)
                reject(error);
            else
                resolve();
        };
        const onAbort = () => finish(new error_1.APIUserAbortError());
        const timer = setTimeout(() => finish(), ms);
        signal?.addEventListener('abort', onAbort, { once: true });
        if (signal?.aborted)
            onAbort();
    });
};
const analysisFinished = (response, requestedID) => {
    const analysis = response.analysis;
    if (!analysis || typeof analysis !== 'object') {
        throw new error_1.KernelError(`Config registry response for ${JSON.stringify(requestedID)} is missing an analysis`);
    }
    if (typeof analysis.id !== 'string' || !analysis.id) {
        throw new error_1.KernelError(`Config registry response for ${JSON.stringify(requestedID)} has no valid analysis ID`);
    }
    if (analysis.id !== requestedID) {
        throw new error_1.KernelError(`Config registry response for ${JSON.stringify(requestedID)} returned analysis ${JSON.stringify(analysis.id)}`);
    }
    if (typeof analysis.status !== 'string' || !analysis.status) {
        throw new error_1.KernelError(`Config registry analysis ${JSON.stringify(requestedID)} has no valid status`);
    }
    if (!Object.prototype.hasOwnProperty.call(analysis, 'finished_at')) {
        throw new error_1.KernelError(`Config registry analysis ${JSON.stringify(requestedID)} is missing finished_at`);
    }
    if (analysis.finished_at !== null &&
        (typeof analysis.finished_at !== 'string' || Number.isNaN(Date.parse(analysis.finished_at)))) {
        throw new error_1.KernelError(`Config registry analysis ${JSON.stringify(requestedID)} has an invalid finished_at`);
    }
    return [analysis.finished_at !== null || terminalStatuses.has(analysis.status), analysis.status];
};
async function waitForConfigRegistryAnalysis(resource, id, options = {}) {
    if (!id) {
        throw new TypeError('id must be non-empty');
    }
    const { pollIntervalMs = defaultPollIntervalMs, maxWaitMs, ...requestOptions } = options;
    if (!Number.isFinite(pollIntervalMs) || pollIntervalMs <= 0) {
        throw new RangeError('pollIntervalMs must be finite and positive');
    }
    if (maxWaitMs != null && (!Number.isFinite(maxWaitMs) || maxWaitMs < 0)) {
        throw new RangeError('maxWaitMs must be finite and non-negative');
    }
    const startedAt = performance.now();
    const deadline = maxWaitMs == null ? undefined : startedAt + maxWaitMs;
    const retrieveOptions = {
        ...requestOptions,
        headers: (0, headers_1.buildHeaders)([requestOptions.headers, { 'X-Stainless-Poll-Helper': 'true' }]),
    };
    let polls = 0;
    let lastStatus;
    while (true) {
        if (polls > 0 && deadline !== undefined && performance.now() >= deadline) {
            throw timeoutError(id, polls, lastStatus, startedAt);
        }
        // oxlint-disable-next-line no-await-in-loop -- each retrieval determines whether another poll is needed.
        const response = await resource.retrieve(id, retrieveOptions);
        polls += 1;
        const [finished, status] = analysisFinished(response, id);
        lastStatus = status;
        if (finished)
            return response;
        let delay = pollIntervalMs * (0.9 + Math.random() * 0.2);
        if (deadline !== undefined) {
            const remaining = deadline - performance.now();
            if (remaining <= 0)
                throw timeoutError(id, polls, lastStatus, startedAt);
            delay = Math.min(delay, remaining);
        }
        // oxlint-disable-next-line no-await-in-loop -- cancellation and the polling deadline must cover the delay.
        await wait(delay, requestOptions.signal);
    }
}
//# sourceMappingURL=config-registry-wait.js.map