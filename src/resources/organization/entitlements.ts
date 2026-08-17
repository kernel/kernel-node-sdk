// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

/**
 * Read and manage organization-level limits.
 */
export class Entitlements extends APIResource {
  /**
   * Get the authenticated organization's effective feature access and constraints
   * after applying its plan, active trial treatment, plan status, and
   * organization-specific overrides. Null constraint values mean unlimited.
   */
  retrieve(options?: RequestOptions): APIPromise<OrgEntitlements> {
    return this._client.get('/org/entitlements', options);
  }
}

/**
 * Effective feature access and constraints for the authenticated organization.
 * Values already include trial treatment, plan status, and organization-specific
 * overrides; consumers should use these resolved values instead of comparing plan
 * IDs.
 */
export interface OrgEntitlements {
  features: OrgEntitlements.Features;

  limits: OrgEntitlements.Limits;

  plan: OrgEntitlements.Plan;
}

export namespace OrgEntitlements {
  export interface Features {
    browser_extensions: Features.BrowserExtensions;

    browser_pools: Features.BrowserPools;

    browser_replays: Features.BrowserReplays;

    credential_providers: Features.CredentialProviders;

    credentials: Features.Credentials;

    custom_proxies: Features.CustomProxies;

    file_io: Features.FileIo;

    gpu: Features.GPU;

    managed_auth: Features.ManagedAuth;

    managed_proxies: Features.ManagedProxies;

    profiles: Features.Profiles;

    proxy_bypass_hosts: Features.ProxyBypassHosts;
  }

  export namespace Features {
    export interface BrowserExtensions {
      /**
       * Whether browser extensions are available.
       */
      enabled: boolean;

      /**
       * Maximum active custom extensions the organization may store. Null means
       * unlimited. Loading stored extensions into a browser is not plan-limited.
       */
      max_stored_per_org: number | null;
    }

    export interface BrowserPools {
      /**
       * Whether the organization is entitled to use this feature.
       */
      enabled: boolean;
    }

    export interface BrowserReplays {
      /**
       * Whether browser replay recording is available.
       */
      enabled: boolean;

      /**
       * Number of days browser replays are retained, matching the replay reaper policy.
       */
      retention_days: number;
    }

    export interface CredentialProviders {
      /**
       * Whether the organization is entitled to use this feature.
       */
      enabled: boolean;
    }

    export interface Credentials {
      /**
       * Whether the organization is entitled to use this feature.
       */
      enabled: boolean;
    }

    export interface CustomProxies {
      /**
       * Whether the organization is entitled to use this feature.
       */
      enabled: boolean;
    }

    export interface FileIo {
      /**
       * Whether the organization is entitled to use this feature.
       */
      enabled: boolean;
    }

    export interface GPU {
      /**
       * Whether the organization is entitled to use this feature.
       */
      enabled: boolean;
    }

    export interface ManagedAuth {
      /**
       * Whether managed auth is available.
       */
      enabled: boolean;

      /**
       * Effective interval in seconds used when a connection is created without an
       * explicit health-check interval.
       */
      health_check_interval_default_seconds: number;

      /**
       * Maximum accepted managed auth health-check interval in seconds.
       */
      health_check_interval_max_seconds: number;

      /**
       * Minimum accepted managed auth health-check interval in seconds.
       */
      health_check_interval_min_seconds: number;

      /**
       * Maximum active managed auth connections in the organization. Null means
       * unlimited.
       */
      max_connections: number | null;
    }

    export interface ManagedProxies {
      /**
       * Whether the organization is entitled to use this feature.
       */
      enabled: boolean;
    }

    export interface Profiles {
      /**
       * Whether the organization is entitled to use this feature.
       */
      enabled: boolean;
    }

    export interface ProxyBypassHosts {
      /**
       * Whether the organization is entitled to use this feature.
       */
      enabled: boolean;
    }
  }

  export interface Limits {
    /**
     * Effective org-level default concurrent invocation ceiling for apps without an
     * app-specific override. App-specific overrides are not represented here.
     */
    default_max_concurrent_invocations_per_app: number;

    /**
     * Effective organization-wide ceiling shared by on-demand browsers and browser
     * pool reservations.
     */
    max_concurrent_browsers: number;

    /**
     * Effective organization-wide concurrent app invocation ceiling.
     */
    max_concurrent_invocations: number;
  }

  export interface Plan {
    /**
     * The organization's contractual plan identifier. Use the resolved feature and
     * limit values, not this field, for access decisions.
     */
    id: 'FREE' | 'HOBBYIST' | 'START_UP' | 'ENTERPRISE';

    /**
     * The plan used to resolve plan-based access. Active trials resolve to START_UP
     * regardless of the contractual plan.
     */
    effective_id: 'FREE' | 'HOBBYIST' | 'START_UP' | 'ENTERPRISE';

    /**
     * Whether the organization is currently within its trial period.
     */
    is_trialing: boolean;

    /**
     * Current billing status of the contractual plan, or null when no billing status
     * is recorded. Status-sensitive feature values already account for it.
     */
    status: 'NEEDS_PAYMENT_METHOD' | 'ACTIVE' | 'CANCELED' | 'UNPAID' | null;

    /**
     * Configured trial end timestamp, or null when the organization has no trial. A
     * past timestamp may be returned when is_trialing is false.
     */
    trial_ends_at: string | null;
  }
}

export declare namespace Entitlements {
  export { type OrgEntitlements as OrgEntitlements };
}
