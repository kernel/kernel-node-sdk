import type { RequestInit, RequestInfo } from "./internal/builtin-types.js";
import type { PromiseOrValue, MergedRequestInit, FinalizedRequestInit } from "./internal/types.js";
export type { Logger, LogLevel } from "./internal/utils/log.js";
import * as Opts from "./internal/request-options.js";
import * as Errors from "./core/error.js";
import * as Pagination from "./core/pagination.js";
import { type OffsetPaginationParams, OffsetPaginationResponse, type PageTokenPaginationParams, PageTokenPaginationResponse } from "./core/pagination.js";
import * as Uploads from "./core/uploads.js";
import * as API from "./resources/index.js";
import { APIPromise } from "./core/api-promise.js";
import { APIKey, APIKeyCreateParams, APIKeyListParams, APIKeyRetrieveParams, APIKeyRotateParams, APIKeyUpdateParams, APIKeys, APIKeysOffsetPagination, CreatedAPIKey } from "./resources/api-keys.js";
import { AppListParams, AppListResponse, AppListResponsesOffsetPagination, Apps } from "./resources/apps.js";
import { BrowserRouteCache } from "./lib/browser-routing.js";
import { BrowserPool, BrowserPoolAcquireParams, BrowserPoolAcquireResponse, BrowserPoolCreateParams, BrowserPoolDeleteParams, BrowserPoolListParams, BrowserPoolReleaseParams, BrowserPoolUpdateParams, BrowserPools, BrowserPoolsOffsetPagination } from "./resources/browser-pools.js";
import { CreateCredentialProviderRequest, CredentialProvider, CredentialProviderCreateParams, CredentialProviderItem, CredentialProviderListItemsResponse, CredentialProviderListParams, CredentialProviderTestResult, CredentialProviderUpdateParams, CredentialProviders, CredentialProvidersOffsetPagination, UpdateCredentialProviderRequest } from "./resources/credential-providers.js";
import { CreateCredentialRequest, Credential, CredentialCreateParams, CredentialListParams, CredentialTotpCodeResponse, CredentialUpdateParams, Credentials, CredentialsOffsetPagination, UpdateCredentialRequest } from "./resources/credentials.js";
import { DeploymentCreateParams, DeploymentCreateResponse, DeploymentFollowParams, DeploymentFollowResponse, DeploymentListParams, DeploymentListResponse, DeploymentListResponsesOffsetPagination, DeploymentRetrieveResponse, DeploymentStateEvent, Deployments } from "./resources/deployments.js";
import { KernelApp } from "./core/app-framework.js";
import { ExtensionDownloadFromChromeStoreParams, ExtensionGetResponse, ExtensionListParams, ExtensionListResponse, ExtensionListResponsesOffsetPagination, ExtensionUploadParams, ExtensionUploadResponse, Extensions } from "./resources/extensions.js";
import { InvocationCreateParams, InvocationCreateResponse, InvocationFollowParams, InvocationFollowResponse, InvocationListBrowsersResponse, InvocationListParams, InvocationListResponse, InvocationListResponsesOffsetPagination, InvocationRetrieveResponse, InvocationStateEvent, InvocationUpdateParams, InvocationUpdateResponse, Invocations } from "./resources/invocations.js";
import { ProfileCreateParams, ProfileDownloadParams, ProfileListParams, ProfileUpdateParams, Profiles } from "./resources/profiles.js";
import { Proxies, ProxyCheckParams, ProxyCheckResponse, ProxyCreateParams, ProxyCreateResponse, ProxyListParams, ProxyListResponse, ProxyListResponsesOffsetPagination, ProxyRetrieveResponse, ProxyUpdateParams, ProxyUpdateResponse } from "./resources/proxies.js";
import { VaultProviderConfig, VaultProviderConfigCreateParams, VaultProviderConfigListParams, VaultProviderConfigUpdateParams, VaultProviderConfigs, VaultProviderConfigsOffsetPagination } from "./resources/vault-provider-configs.js";
import { AuditLogEntriesPageTokenPagination, AuditLogEntry, AuditLogExportChunkParams, AuditLogListParams, AuditLogs } from "./resources/audit-logs/audit-logs.js";
import { Auth } from "./resources/auth/auth.js";
import { BrowserCreateParams, BrowserCreateResponse, BrowserCurlParams, BrowserCurlResponse, BrowserListParams, BrowserListResponse, BrowserListResponsesOffsetPagination, BrowserLoadExtensionsParams, BrowserMemory, BrowserMemoryRequest, BrowserNetworkConfig, BrowserPoolRef, BrowserProxy, BrowserProxyConfig, BrowserProxyMode, BrowserReplContent, BrowserReplImageContent, BrowserReplParams, BrowserReplRequest, BrowserReplResult, BrowserReplTextContent, BrowserRetrieveParams, BrowserRetrieveResponse, BrowserUpdateParams, BrowserUpdateResponse, BrowserUsage, Browsers, Profile, Tags, VaultReference } from "./resources/browsers/browsers.js";
import { Analysis, AnalysisSummary, Browser, ConfigRegistry, ConfigRegistryListParams, ConfigRegistryLookupParams, ConfigRegistryResolveParams, ConfigRegistryResponse, Evidence, LookupRequest, LookupResponse, NoRecommendation, Proxy, Recommendation, RecommendationResult, RecommendationSummariesOffsetPagination, RecommendationSummary, ResolveRequest, Target } from "./resources/config-registry/config-registry.js";
import { Organization } from "./resources/organization/organization.js";
import { CreateProjectRequest, Project, ProjectCreateParams, ProjectListParams, ProjectUpdateParams, Projects, ProjectsOffsetPagination, UpdateProjectRequest } from "./resources/projects/projects.js";
import { Telemetry } from "./resources/telemetry/telemetry.js";
import { Vault, VaultListParams, VaultUpsertParams, Vaults, VaultsOffsetPagination } from "./resources/vaults/vaults.js";
import { type Fetch } from "./internal/builtin-types.js";
import { HeadersLike, NullableHeaders } from "./internal/headers.js";
import { FinalRequestOptions, RequestOptions } from "./internal/request-options.js";
import { type LogLevel, type Logger } from "./internal/utils/log.js";
declare const environments: {
    production: string;
    development: string;
};
type Environment = keyof typeof environments;
export interface ClientOptions {
    /**
     * Defaults to process.env['KERNEL_API_KEY'].
     */
    apiKey?: string | undefined;
    projectID?: string | null | undefined;
    project?: string | null | undefined;
    /**
     * Specifies the environment to use for the API.
     *
     * Each environment maps to a different base URL:
     * - `production` corresponds to `https://api.onkernel.com/`
     * - `development` corresponds to `https://localhost:3001/`
     */
    environment?: Environment | undefined;
    /**
     * Override the default base URL for the API, e.g., "https://api.example.com/v2/"
     *
     * Defaults to process.env['KERNEL_BASE_URL'].
     */
    baseURL?: string | null | undefined;
    /**
     * The maximum amount of time (in milliseconds) that the client should wait for a response
     * from the server before timing out a single request.
     *
     * Note that request timeouts are retried by default, so in a worst-case scenario you may wait
     * much longer than this timeout before the promise succeeds or fails.
     *
     * @unit milliseconds
     */
    timeout?: number | undefined;
    /**
     * Additional `RequestInit` options to be passed to `fetch` calls.
     * Properties will be overridden by per-request `fetchOptions`.
     */
    fetchOptions?: MergedRequestInit | undefined;
    /**
     * Specify a custom `fetch` function implementation.
     *
     * If not provided, we expect that `fetch` is defined globally.
     */
    fetch?: Fetch | undefined;
    /**
     * The maximum number of times that the client will retry a request in case of a
     * temporary failure, like a network error or a 5XX error from the server.
     *
     * @default 2
     */
    maxRetries?: number | undefined;
    /**
     * Default headers to include with every request to the API.
     *
     * These can be removed in individual requests by explicitly setting the
     * header to `null` in request options.
     */
    defaultHeaders?: HeadersLike | undefined;
    /**
     * Default query parameters to include with every request to the API.
     *
     * These can be removed in individual requests by explicitly setting the
     * param to `undefined` in request options.
     */
    defaultQuery?: Record<string, string | undefined> | undefined;
    /**
     * Set the log level.
     *
     * Defaults to process.env['KERNEL_LOG'] or 'warn' if it isn't set.
     */
    logLevel?: LogLevel | undefined;
    /**
     * Set the logger.
     *
     * Defaults to globalThis.console.
     */
    logger?: Logger | undefined;
}
/**
 * API Client for interfacing with the Kernel API.
 */
export declare class Kernel {
    #private;
    apiKey: string;
    projectID: string | null;
    project: string | null;
    baseURL: string;
    maxRetries: number;
    timeout: number;
    logger: Logger;
    logLevel: LogLevel | undefined;
    fetchOptions: MergedRequestInit | undefined;
    private fetch;
    private rawFetch;
    protected idempotencyHeader?: string;
    private _options;
    browserRouteCache: BrowserRouteCache;
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
    constructor({ baseURL, apiKey, projectID, project, ...opts }?: ClientOptions);
    /**
     * Create a new client instance re-using the same options given to the current client with optional overriding.
     */
    withOptions(options: Partial<ClientOptions>): this;
    protected defaultQuery(): Record<string, string | undefined> | undefined;
    protected validateHeaders({ values, nulls }: NullableHeaders): void;
    protected authHeaders(opts: FinalRequestOptions): Promise<NullableHeaders | undefined>;
    protected stringifyQuery(query: object | Record<string, unknown>): string;
    private getUserAgent;
    protected defaultIdempotencyKey(): string;
    protected makeStatusError(status: number, error: Object, message: string | undefined, headers: Headers): Errors.APIError;
    buildURL(path: string, query: Record<string, unknown> | null | undefined, defaultBaseURL?: string | undefined): string;
    /**
     * Used as a callback for mutating the given `FinalRequestOptions` object.
     */
    protected prepareOptions(options: FinalRequestOptions): Promise<void>;
    /**
     * Used as a callback for mutating the given `RequestInit` object.
     *
     * This is useful for cases where you want to add certain headers based off of
     * the request properties, e.g. `method` or `url`.
     */
    protected prepareRequest(request: RequestInit, { url, options }: {
        url: string;
        options: FinalRequestOptions;
    }): Promise<void>;
    get<Rsp>(path: string, opts?: PromiseOrValue<RequestOptions>): APIPromise<Rsp>;
    post<Rsp>(path: string, opts?: PromiseOrValue<RequestOptions>): APIPromise<Rsp>;
    patch<Rsp>(path: string, opts?: PromiseOrValue<RequestOptions>): APIPromise<Rsp>;
    put<Rsp>(path: string, opts?: PromiseOrValue<RequestOptions>): APIPromise<Rsp>;
    delete<Rsp>(path: string, opts?: PromiseOrValue<RequestOptions>): APIPromise<Rsp>;
    private methodRequest;
    request<Rsp>(options: PromiseOrValue<FinalRequestOptions>, remainingRetries?: number | null): APIPromise<Rsp>;
    private makeRequest;
    getAPIList<Item, PageClass extends Pagination.AbstractPage<Item> = Pagination.AbstractPage<Item>>(path: string, Page: new (...args: any[]) => PageClass, opts?: PromiseOrValue<RequestOptions>): Pagination.PagePromise<PageClass, Item>;
    requestAPIList<Item = unknown, PageClass extends Pagination.AbstractPage<Item> = Pagination.AbstractPage<Item>>(Page: new (...args: ConstructorParameters<typeof Pagination.AbstractPage>) => PageClass, options: PromiseOrValue<FinalRequestOptions>): Pagination.PagePromise<PageClass, Item>;
    fetchWithTimeout(url: RequestInfo, init: RequestInit | undefined, ms: number, controller: AbortController): Promise<Response>;
    private shouldRetry;
    private retryRequest;
    private calculateDefaultRetryTimeoutMillis;
    buildRequest(inputOptions: FinalRequestOptions, { retryCount }?: {
        retryCount?: number;
    }): Promise<{
        req: FinalizedRequestInit;
        url: string;
        timeout: number;
    }>;
    private buildHeaders;
    private _makeAbort;
    private buildBody;
    /**
     * Create a new KernelApp instance.
     *
     * @param name - The name of the app to create.
     * @returns A new KernelApp instance you can attach actions to.
     */
    app(name: string): KernelApp;
    static Kernel: typeof Kernel;
    static DEFAULT_TIMEOUT: number;
    static KernelError: typeof Errors.KernelError;
    static APIError: typeof Errors.APIError;
    static APIConnectionError: typeof Errors.APIConnectionError;
    static APIConnectionTimeoutError: typeof Errors.APIConnectionTimeoutError;
    static APIUserAbortError: typeof Errors.APIUserAbortError;
    static NotFoundError: typeof Errors.NotFoundError;
    static ConflictError: typeof Errors.ConflictError;
    static RateLimitError: typeof Errors.RateLimitError;
    static BadRequestError: typeof Errors.BadRequestError;
    static AuthenticationError: typeof Errors.AuthenticationError;
    static InternalServerError: typeof Errors.InternalServerError;
    static PermissionDeniedError: typeof Errors.PermissionDeniedError;
    static UnprocessableEntityError: typeof Errors.UnprocessableEntityError;
    static toFile: typeof Uploads.toFile;
    /**
     * Create and manage app deployments and stream deployment events.
     */
    deployments: API.Deployments;
    /**
     * List applications and versions.
     */
    apps: API.Apps;
    /**
     * Invoke actions and stream or query invocation status and events.
     */
    invocations: API.Invocations;
    /**
     * Resolve browser and proxy recommendations for bot-protected sites.
     */
    configRegistry: API.ConfigRegistry;
    browsers: API.Browsers;
    /**
     * Create, list, retrieve, and delete browser profiles.
     */
    profiles: API.Profiles;
    auth: API.Auth;
    telemetry: API.Telemetry;
    /**
     * Create and manage proxy configurations for routing browser traffic.
     */
    proxies: API.Proxies;
    /**
     * Create, list, retrieve, and delete browser extensions.
     */
    extensions: API.Extensions;
    /**
     * Create and manage browser pools for acquiring and releasing browsers.
     */
    browserPools: API.BrowserPools;
    vaultProviderConfigs: API.VaultProviderConfigs;
    vaults: API.Vaults;
    /**
     * Create and manage credentials for authentication.
     */
    credentials: API.Credentials;
    /**
     * Create and manage projects for resource isolation within an organization.
     * When projects are disabled for the organization, project operations return
     * `404` with code `projects_disabled`.
     *
     */
    projects: API.Projects;
    organization: API.Organization;
    /**
     * Read audit log records for the authenticated organization.
     */
    auditLogs: API.AuditLogs;
    /**
     * Create and manage API keys for organization and project-scoped access.
     */
    apiKeys: API.APIKeys;
    /**
     * Configure external credential providers like 1Password.
     */
    credentialProviders: API.CredentialProviders;
}
export declare namespace Kernel {
    export type RequestOptions = Opts.RequestOptions;
    export import PageTokenPagination = Pagination.PageTokenPagination;
    export { type PageTokenPaginationParams as PageTokenPaginationParams, type PageTokenPaginationResponse as PageTokenPaginationResponse, };
    export import OffsetPagination = Pagination.OffsetPagination;
    export { type OffsetPaginationParams as OffsetPaginationParams, type OffsetPaginationResponse as OffsetPaginationResponse, };
    export { Deployments as Deployments, type DeploymentStateEvent as DeploymentStateEvent, type DeploymentCreateResponse as DeploymentCreateResponse, type DeploymentRetrieveResponse as DeploymentRetrieveResponse, type DeploymentListResponse as DeploymentListResponse, type DeploymentFollowResponse as DeploymentFollowResponse, type DeploymentListResponsesOffsetPagination as DeploymentListResponsesOffsetPagination, type DeploymentCreateParams as DeploymentCreateParams, type DeploymentListParams as DeploymentListParams, type DeploymentFollowParams as DeploymentFollowParams, };
    export { Apps as Apps, type AppListResponse as AppListResponse, type AppListResponsesOffsetPagination as AppListResponsesOffsetPagination, type AppListParams as AppListParams, };
    export { Invocations as Invocations, type InvocationStateEvent as InvocationStateEvent, type InvocationCreateResponse as InvocationCreateResponse, type InvocationRetrieveResponse as InvocationRetrieveResponse, type InvocationUpdateResponse as InvocationUpdateResponse, type InvocationListResponse as InvocationListResponse, type InvocationFollowResponse as InvocationFollowResponse, type InvocationListBrowsersResponse as InvocationListBrowsersResponse, type InvocationListResponsesOffsetPagination as InvocationListResponsesOffsetPagination, type InvocationCreateParams as InvocationCreateParams, type InvocationUpdateParams as InvocationUpdateParams, type InvocationListParams as InvocationListParams, type InvocationFollowParams as InvocationFollowParams, };
    export { ConfigRegistry as ConfigRegistry, type Analysis as Analysis, type AnalysisSummary as AnalysisSummary, type Browser as Browser, type ConfigRegistryResponse as ConfigRegistryResponse, type Evidence as Evidence, type LookupRequest as LookupRequest, type LookupResponse as LookupResponse, type NoRecommendation as NoRecommendation, type Proxy as Proxy, type Recommendation as Recommendation, type RecommendationResult as RecommendationResult, type RecommendationSummary as RecommendationSummary, type ResolveRequest as ResolveRequest, type Target as Target, type RecommendationSummariesOffsetPagination as RecommendationSummariesOffsetPagination, type ConfigRegistryListParams as ConfigRegistryListParams, type ConfigRegistryLookupParams as ConfigRegistryLookupParams, type ConfigRegistryResolveParams as ConfigRegistryResolveParams, };
    export { Browsers as Browsers, type BrowserMemory as BrowserMemory, type BrowserMemoryRequest as BrowserMemoryRequest, type BrowserNetworkConfig as BrowserNetworkConfig, type BrowserPoolRef as BrowserPoolRef, type BrowserProxy as BrowserProxy, type BrowserProxyConfig as BrowserProxyConfig, type BrowserProxyMode as BrowserProxyMode, type BrowserReplContent as BrowserReplContent, type BrowserReplImageContent as BrowserReplImageContent, type BrowserReplRequest as BrowserReplRequest, type BrowserReplResult as BrowserReplResult, type BrowserReplTextContent as BrowserReplTextContent, type BrowserUsage as BrowserUsage, type Profile as Profile, type Tags as Tags, type VaultReference as VaultReference, type BrowserCreateResponse as BrowserCreateResponse, type BrowserRetrieveResponse as BrowserRetrieveResponse, type BrowserUpdateResponse as BrowserUpdateResponse, type BrowserListResponse as BrowserListResponse, type BrowserCurlResponse as BrowserCurlResponse, type BrowserListResponsesOffsetPagination as BrowserListResponsesOffsetPagination, type BrowserCreateParams as BrowserCreateParams, type BrowserRetrieveParams as BrowserRetrieveParams, type BrowserUpdateParams as BrowserUpdateParams, type BrowserListParams as BrowserListParams, type BrowserCurlParams as BrowserCurlParams, type BrowserLoadExtensionsParams as BrowserLoadExtensionsParams, type BrowserReplParams as BrowserReplParams, };
    export { Profiles as Profiles, type ProfileCreateParams as ProfileCreateParams, type ProfileUpdateParams as ProfileUpdateParams, type ProfileListParams as ProfileListParams, type ProfileDownloadParams as ProfileDownloadParams, };
    export { Auth as Auth };
    export { Telemetry as Telemetry };
    export { Proxies as Proxies, type ProxyCreateResponse as ProxyCreateResponse, type ProxyRetrieveResponse as ProxyRetrieveResponse, type ProxyUpdateResponse as ProxyUpdateResponse, type ProxyListResponse as ProxyListResponse, type ProxyCheckResponse as ProxyCheckResponse, type ProxyListResponsesOffsetPagination as ProxyListResponsesOffsetPagination, type ProxyCreateParams as ProxyCreateParams, type ProxyUpdateParams as ProxyUpdateParams, type ProxyListParams as ProxyListParams, type ProxyCheckParams as ProxyCheckParams, };
    export { Extensions as Extensions, type ExtensionListResponse as ExtensionListResponse, type ExtensionGetResponse as ExtensionGetResponse, type ExtensionUploadResponse as ExtensionUploadResponse, type ExtensionListResponsesOffsetPagination as ExtensionListResponsesOffsetPagination, type ExtensionListParams as ExtensionListParams, type ExtensionDownloadFromChromeStoreParams as ExtensionDownloadFromChromeStoreParams, type ExtensionUploadParams as ExtensionUploadParams, };
    export { BrowserPools as BrowserPools, type BrowserPool as BrowserPool, type BrowserPoolAcquireResponse as BrowserPoolAcquireResponse, type BrowserPoolsOffsetPagination as BrowserPoolsOffsetPagination, type BrowserPoolCreateParams as BrowserPoolCreateParams, type BrowserPoolUpdateParams as BrowserPoolUpdateParams, type BrowserPoolListParams as BrowserPoolListParams, type BrowserPoolDeleteParams as BrowserPoolDeleteParams, type BrowserPoolAcquireParams as BrowserPoolAcquireParams, type BrowserPoolReleaseParams as BrowserPoolReleaseParams, };
    export { VaultProviderConfigs as VaultProviderConfigs, type VaultProviderConfig as VaultProviderConfig, type VaultProviderConfigsOffsetPagination as VaultProviderConfigsOffsetPagination, type VaultProviderConfigCreateParams as VaultProviderConfigCreateParams, type VaultProviderConfigUpdateParams as VaultProviderConfigUpdateParams, type VaultProviderConfigListParams as VaultProviderConfigListParams, };
    export { Vaults as Vaults, type Vault as Vault, type VaultsOffsetPagination as VaultsOffsetPagination, type VaultListParams as VaultListParams, type VaultUpsertParams as VaultUpsertParams, };
    export { Credentials as Credentials, type CreateCredentialRequest as CreateCredentialRequest, type Credential as Credential, type UpdateCredentialRequest as UpdateCredentialRequest, type CredentialTotpCodeResponse as CredentialTotpCodeResponse, type CredentialsOffsetPagination as CredentialsOffsetPagination, type CredentialCreateParams as CredentialCreateParams, type CredentialUpdateParams as CredentialUpdateParams, type CredentialListParams as CredentialListParams, };
    export { Projects as Projects, type CreateProjectRequest as CreateProjectRequest, type Project as Project, type UpdateProjectRequest as UpdateProjectRequest, type ProjectsOffsetPagination as ProjectsOffsetPagination, type ProjectCreateParams as ProjectCreateParams, type ProjectUpdateParams as ProjectUpdateParams, type ProjectListParams as ProjectListParams, };
    export { Organization as Organization };
    export { AuditLogs as AuditLogs, type AuditLogEntry as AuditLogEntry, type AuditLogEntriesPageTokenPagination as AuditLogEntriesPageTokenPagination, type AuditLogListParams as AuditLogListParams, type AuditLogExportChunkParams as AuditLogExportChunkParams, };
    export { APIKeys as APIKeys, type APIKey as APIKey, type CreatedAPIKey as CreatedAPIKey, type APIKeysOffsetPagination as APIKeysOffsetPagination, type APIKeyCreateParams as APIKeyCreateParams, type APIKeyRetrieveParams as APIKeyRetrieveParams, type APIKeyUpdateParams as APIKeyUpdateParams, type APIKeyListParams as APIKeyListParams, type APIKeyRotateParams as APIKeyRotateParams, };
    export { CredentialProviders as CredentialProviders, type CreateCredentialProviderRequest as CreateCredentialProviderRequest, type CredentialProvider as CredentialProvider, type CredentialProviderItem as CredentialProviderItem, type CredentialProviderTestResult as CredentialProviderTestResult, type UpdateCredentialProviderRequest as UpdateCredentialProviderRequest, type CredentialProviderListItemsResponse as CredentialProviderListItemsResponse, type CredentialProvidersOffsetPagination as CredentialProvidersOffsetPagination, type CredentialProviderCreateParams as CredentialProviderCreateParams, type CredentialProviderUpdateParams as CredentialProviderUpdateParams, type CredentialProviderListParams as CredentialProviderListParams, };
    export type AppAction = API.AppAction;
    export type BrowserExtension = API.BrowserExtension;
    export type BrowserProfile = API.BrowserProfile;
    export type BrowserViewport = API.BrowserViewport;
    export type ErrorDetail = API.ErrorDetail;
    export type ErrorEvent = API.ErrorEvent;
    export type ErrorModel = API.ErrorModel;
    export type HeartbeatEvent = API.HeartbeatEvent;
    export type LogEvent = API.LogEvent;
}
//# sourceMappingURL=client.d.ts.map