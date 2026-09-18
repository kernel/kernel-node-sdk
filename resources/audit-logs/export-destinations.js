"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportDestinations = void 0;
const resource_1 = require("../../core/resource.js");
const pagination_1 = require("../../core/pagination.js");
const headers_1 = require("../../internal/headers.js");
const path_1 = require("../../internal/utils/path.js");
/**
 * Read audit log records for the authenticated organization.
 */
class ExportDestinations extends resource_1.APIResource {
    /**
     * Create a paused destination. Activate it with a status update once the
     * destination test passes. Requires an active Enterprise plan.
     */
    create(body, options) {
        return this._client.post('/audit-logs/export/destinations', { body, ...options });
    }
    /**
     * Retrieve details for a single audit log export destination by its ID.
     */
    retrieve(id, options) {
        return this._client.get((0, path_1.path) `/audit-logs/export/destinations/${id}`, options);
    }
    /**
     * Apply a partial update to a destination. Requires an active Enterprise plan.
     * Returns 409 when the destination was changed concurrently, because the merged
     * configuration this request validated is no longer the one that would be stored;
     * retry against fresh state. Pausing prevents new delivery attempts, but an S3
     * upload already in progress may complete after the response.
     */
    update(id, body, options) {
        return this._client.patch((0, path_1.path) `/audit-logs/export/destinations/${id}`, { body, ...options });
    }
    /**
     * List audit log export destinations for the organization with pagination support.
     */
    list(query = {}, options) {
        return this._client.getAPIList('/audit-logs/export/destinations', (pagination_1.OffsetPagination), { query, ...options });
    }
    /**
     * Soft delete the destination and prevent new delivery attempts. An S3 upload
     * already in progress may complete after the response.
     */
    delete(id, options) {
        return this._client.delete((0, path_1.path) `/audit-logs/export/destinations/${id}`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: '*/*' }, options?.headers]),
        });
    }
    /**
     * Verify the destination is writable by assuming the configured role and uploading
     * a temporary probe object with the same request metadata as a real delivery.
     * Requires an active Enterprise plan.
     */
    test(id, options) {
        return this._client.post((0, path_1.path) `/audit-logs/export/destinations/${id}/test`, options);
    }
}
exports.ExportDestinations = ExportDestinations;
//# sourceMappingURL=export-destinations.js.map