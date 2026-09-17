// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import * as ExportDestinationsAPI from "./export-destinations.mjs";
import { ExportDestinations, } from "./export-destinations.mjs";
import { PageTokenPagination } from "../../core/pagination.mjs";
import { buildHeaders } from "../../internal/headers.mjs";
import { downloadAuditLogs, } from "../../lib/audit-log-download.mjs";
/**
 * Read audit log records for the authenticated organization.
 */
export class AuditLogs extends APIResource {
    constructor() {
        super(...arguments);
        this.exportDestinations = new ExportDestinationsAPI.ExportDestinations(this._client);
    }
    /**
     * API for searching audit logs. Limited to at most 30 day search, returns up to
     * 100 records per page. Not recommended for bulk export.
     */
    list(query, options) {
        return this._client.getAPIList('/audit-logs', (PageTokenPagination), { query, ...options });
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
            headers: buildHeaders([{ Accept: 'application/octet-stream' }, options?.headers]),
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
        return downloadAuditLogs((chunkQuery, chunkOptions) => this.exportChunk(chunkQuery, chunkOptions), query, destination, this._client.timeout, options);
    }
}
AuditLogs.ExportDestinations = ExportDestinations;
//# sourceMappingURL=audit-logs.mjs.map