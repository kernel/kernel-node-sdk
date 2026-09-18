"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogs = void 0;
const tslib_1 = require("../../internal/tslib.js");
const resource_1 = require("../../core/resource.js");
const ExportDestinationsAPI = tslib_1.__importStar(require("./export-destinations.js"));
const export_destinations_1 = require("./export-destinations.js");
const pagination_1 = require("../../core/pagination.js");
const headers_1 = require("../../internal/headers.js");
const audit_log_download_1 = require("../../lib/audit-log-download.js");
/**
 * Read audit log records for the authenticated organization.
 */
class AuditLogs extends resource_1.APIResource {
    constructor() {
        super(...arguments);
        this.exportDestinations = new ExportDestinationsAPI.ExportDestinations(this._client);
    }
    /**
     * API for searching audit logs. Limited to at most 30 day search, returns up to
     * 100 records per page. Not recommended for bulk export.
     */
    list(query, options) {
        return this._client.getAPIList('/audit-logs', (pagination_1.PageTokenPagination), { query, ...options });
    }
    /**
     * Download an organization's audit log records for a time range as a file, for
     * archival, compliance, or offline analysis. For interactive browsing, use GET
     * /audit-logs.
     */
    exportChunk(query, options) {
        return this._client.get('/audit-logs/export/chunk', {
            query,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: 'application/octet-stream' }, options?.headers]),
            __binaryResponse: true,
        });
    }
    /**
     * Download a complete gzip-compressed JSON Lines audit log export to a writable
     * destination. The SDK verifies every chunk and retries transient transfer
     * failures. It does not close the destination. If the download fails, the
     * destination may contain a partial export; use a temporary file and atomic
     * rename when the completed export must be published atomically.
     */
    download(query, destination, options) {
        return (0, audit_log_download_1.downloadAuditLogs)((chunkQuery, chunkOptions) => this.exportChunk(chunkQuery, chunkOptions), query, destination, this._client.timeout, options);
    }
}
exports.AuditLogs = AuditLogs;
AuditLogs.ExportDestinations = export_destinations_1.ExportDestinations;
//# sourceMappingURL=audit-logs.js.map