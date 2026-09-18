// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import { OffsetPagination } from "../../core/pagination.mjs";
import { buildHeaders } from "../../internal/headers.mjs";
import { path } from "../../internal/utils/path.mjs";
/**
 * Stream live telemetry events from a browser session, and manage the destinations sessions export them to.
 */
export class Destinations extends APIResource {
    /**
     * Create an OTLP export destination in the authenticated organization. Names must
     * be unique within the organization. Requires an organization-scoped credential or
     * dashboard authentication; project-scoped credentials receive a 403.
     */
    create(body, options) {
        return this._client.post('/telemetry/destinations', { body, ...options });
    }
    /**
     * Retrieve a customer-visible OTLP destination in the authenticated organization
     * by its ID or name. Project-scoped credentials can retrieve these destinations
     * for selection by workloads in their project. Non-dashboard reads return header
     * values redacted.
     */
    retrieve(idOrName, options) {
        return this._client.get(path `/telemetry/destinations/${idOrName}`, options);
    }
    /**
     * Update an OTLP destination. Sessions already exporting to it pick up the new
     * values without restarting, which makes this the way to rotate credentials
     * without interrupting export.
     *
     * Names must be unique within the organization. Renaming is refused with a 409
     * while a managed auth connection selects this destination by name, since that
     * connection resolves the name on every login. Every other field, including
     * `headers`, stays editable. Requires an organization-scoped credential or
     * dashboard authentication; project-scoped credentials receive a 403.
     */
    update(idOrName, body, options) {
        return this._client.patch(path `/telemetry/destinations/${idOrName}`, { body, ...options });
    }
    /**
     * List customer-visible OTLP export destinations in the authenticated
     * organization. Project-scoped credentials can list these destinations for
     * selection by workloads in their project. Non-dashboard reads return header
     * values redacted.
     */
    list(query = {}, options) {
        return this._client.getAPIList('/telemetry/destinations', (OffsetPagination), {
            query,
            ...options,
        });
    }
    /**
     * Delete an OTLP destination. Sessions bound to it are still exporting, so the
     * delete is refused with a 409 while any exist; either wait for those sessions to
     * end or delete them first. It is refused the same way while a managed auth
     * connection still selects it, because that connection re-resolves the destination
     * on every login, and while a managed auth login using it is still in progress.
     * Requires an organization-scoped credential or dashboard authentication;
     * project-scoped credentials receive a 403.
     */
    delete(idOrName, options) {
        return this._client.delete(path `/telemetry/destinations/${idOrName}`, {
            ...options,
            headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
        });
    }
}
//# sourceMappingURL=destinations.mjs.map