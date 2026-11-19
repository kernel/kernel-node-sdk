import type { AccessToken, AccessTokenProvider } from './types';
import {
  ADVISORY_REFRESH_BACKOFF_IN_SECONDS,
  ADVISORY_REFRESH_LIFETIME_FRACTION,
  ADVISORY_REFRESH_THRESHOLD_IN_SECONDS,
  MANDATORY_REFRESH_LIFETIME_FRACTION,
  MANDATORY_REFRESH_THRESHOLD_IN_SECONDS,
  nowAsSeconds,
} from './types';

/**
 * Wraps an {@link AccessTokenProvider} with two-tier proactive refresh and
 * concurrent deduplication.
 *
 * The refresh thresholds scale with the token's lifetime (the time it had
 * left when it was cached), so a token that lives for a few seconds is not
 * refreshed on every call:
 *
 * - advisory: min(120s, 40% of the lifetime) remaining;
 * - mandatory: min(30s, 10% of the lifetime) remaining.
 *
 * On each {@link getToken} call:
 *
 * - No cached token: call the provider, cache the result and return it.
 * - Cached with `expiresAt == null`: return it forever.
 * - More than the advisory threshold remaining: return the cached token.
 * - Between the two thresholds: return the cached token and refresh in the
 *   background. A failure is reported to `onAdvisoryRefreshError` and the
 *   cached token keeps being served.
 * - Less than the mandatory threshold remaining, or expired: wait for a
 *   refresh, and throw if it fails.
 *
 * Concurrent callers share one provider call.
 */
export class TokenCache {
  private provider: AccessTokenProvider;
  private cached: AccessToken | null = null;
  private cachedLifetime = 0;
  private pendingRefresh: Promise<AccessToken> | null = null;
  private pendingIsForced = false;
  private queuedForcedRefresh: Promise<AccessToken> | null = null;
  private nextForce = false;
  private invalidations = 0;
  private lastAdvisoryError = -Infinity;
  private onAdvisoryRefreshError: ((err: unknown) => void) | undefined;

  constructor(provider: AccessTokenProvider, onAdvisoryRefreshError?: (err: unknown) => void) {
    this.provider = provider;
    this.onAdvisoryRefreshError = onAdvisoryRefreshError;
  }

  async getToken(): Promise<string> {
    // Stays set until a forced refresh succeeds.
    const force = this.nextForce;
    const cached = this.cached;

    if (force || cached == null) {
      return (await this.refresh(force)).token;
    }

    if (cached.expiresAt == null) {
      return cached.token;
    }

    const remaining = cached.expiresAt - nowAsSeconds();
    const advisory = Math.min(
      ADVISORY_REFRESH_THRESHOLD_IN_SECONDS,
      ADVISORY_REFRESH_LIFETIME_FRACTION * this.cachedLifetime,
    );
    const mandatory = Math.min(
      MANDATORY_REFRESH_THRESHOLD_IN_SECONDS,
      MANDATORY_REFRESH_LIFETIME_FRACTION * this.cachedLifetime,
    );

    if (remaining > advisory) {
      return cached.token;
    }

    if (remaining > mandatory) {
      this.backgroundRefresh();
      return cached.token;
    }

    return (await this.refresh()).token;
  }

  /**
   * Drops the cached token so the next {@link getToken} mints a new one.
   * Call it after a 401: the server has rejected the token even though it
   * has not expired.
   *
   * Pass the rejected token to leave the cache alone when it already holds a
   * newer one, as happens when several requests fail with the same token.
   */
  invalidate(token?: string): void {
    if (token !== undefined && this.cached?.token !== token) return;
    this.cached = null;
    this.nextForce = true;
    this.invalidations++;
  }

  /**
   * Joins the refresh in flight, so the provider is never called twice at
   * once. A forced refresh cannot join an unforced one, which may be served
   * from the provider's own cache: it is queued to run when that call
   * settles, and every caller that needs a token meanwhile waits for it.
   */
  private refresh(force = false): Promise<AccessToken> {
    if (this.queuedForcedRefresh) {
      return this.queuedForcedRefresh;
    }
    const pending = this.pendingRefresh;
    if (!pending) {
      return this.doRefresh(force);
    }
    if (!force || this.pendingIsForced) {
      return pending;
    }
    const run = () => {
      this.queuedForcedRefresh = null;
      return this.doRefresh(true);
    };
    this.queuedForcedRefresh = pending.then(run, run);
    return this.queuedForcedRefresh;
  }

  /**
   * Waits {@link ADVISORY_REFRESH_BACKOFF_IN_SECONDS} after a failure before
   * trying again, so an outage during the advisory window does not send one
   * token request per API request.
   */
  private backgroundRefresh(): void {
    if (this.pendingRefresh || this.queuedForcedRefresh) {
      return;
    }
    if (nowAsSeconds() - this.lastAdvisoryError < ADVISORY_REFRESH_BACKOFF_IN_SECONDS) {
      return;
    }
    this.doRefresh().catch((err) => {
      this.lastAdvisoryError = nowAsSeconds();
      this.onAdvisoryRefreshError?.(err);
    });
  }

  /** Only called when no refresh is in flight. */
  private doRefresh(force = false): Promise<AccessToken> {
    const invalidations = this.invalidations;
    this.pendingIsForced = force;
    this.pendingRefresh = (async () => this.provider(force ? { forceRefresh: true } : undefined))().then(
      (token) => {
        this.pendingRefresh = null;
        // An unforced call that was already running when the cache was
        // invalidated may return the rejected token from the provider's own
        // cache. Its caller gets the result, but it is not cached, so the
        // next caller forces a refresh.
        if (force) this.nextForce = false;
        if (force || invalidations === this.invalidations) {
          this.cached = token;
          // Measured from now, not from the token's issue time, so a token
          // that was slow to arrive is not already inside its refresh window.
          this.cachedLifetime = token.expiresAt == null ? 0 : Math.max(0, token.expiresAt - nowAsSeconds());
        }
        return token;
      },
      (err) => {
        this.pendingRefresh = null;
        throw err;
      },
    );
    return this.pendingRefresh;
  }
}
