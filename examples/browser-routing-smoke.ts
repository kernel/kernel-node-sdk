/**
 * Smoke test for the demo metro-direct routing middleware.
 *
 * Runs the local source (not the published build) thanks to the tsconfig path
 * alias `@onkernel/sdk` -> `./src/index.ts`, wired up by `yarn tsn`.
 *
 * Usage (from the repo root):
 *
 *   cd /Users/sayan/kernel/kernel-node-sdk
 *   yarn install                 # if you haven't already
 *   KERNEL_API_KEY=sk-... yarn tsn examples/browser-routing-smoke.ts
 *
 * Optional env vars:
 *   KERNEL_BASE_URL  - override the API base (defaults to production)
 *   SKIP_COMPARE     - if set, skip the public-API timing comparison
 *
 * What this verifies:
 *   1. browsers.create() returns a Browser whose base_url + cdp_ws_url
 *      let us derive a metro-direct route.
 *   2. The routing cache gets populated automatically (no manual prewarm).
 *   3. A subresource call (computer.clickMouse) actually succeeds when
 *      routed to <base_url>/computer/click_mouse?jwt=...
 *   4. (Optional) timing comparison vs. the public-API path.
 *
 * If anything fails, the browser is still cleaned up.
 */

import Kernel from '@onkernel/sdk';

const SUBSEP = '─'.repeat(60);

function log(...args: unknown[]) {
  console.log(...args);
}
function header(s: string) {
  console.log('\n' + SUBSEP + '\n' + s + '\n' + SUBSEP);
}

async function timeIt<T>(label: string, fn: () => Promise<T>): Promise<{ value: T; ms: number }> {
  const t0 = Date.now();
  const value = await fn();
  const ms = Date.now() - t0;
  log(`  ${label}: ${ms} ms`);
  return { value, ms };
}

async function main() {
  if (!process.env['KERNEL_API_KEY']) {
    console.error('Set KERNEL_API_KEY before running this script.');
    process.exit(2);
  }

  // Routed client (opt-in to metro-direct).
  const routed = new Kernel({
    browserRouting: { enabled: true },
    logLevel: 'debug',
  });

  // Plain client for the side-by-side comparison; same API key, no routing.
  const plain = new Kernel({ logLevel: 'warn' });

  header('1) Create a browser and inspect routing-relevant fields');
  const browser = await routed.browsers.create({});
  log('  session_id:', browser.session_id);
  log('  base_url:  ', browser.base_url ?? '<empty>');
  log('  cdp_ws_url:', browser.cdp_ws_url);

  let exitCode = 0;
  try {
    header('2) Verify cache was populated by the create response');
    const cached = routed.browserRouteCache?.get(browser.session_id);
    log('  cache entry:', cached);
    if (!cached) {
      console.error(
        '  FAIL: cache was not populated. Either base_url is empty in this env,',
        '\n  or cdp_ws_url has no `?jwt=` query param.',
      );
      exitCode = 1;
      return;
    }
    if (!browser.base_url) {
      console.error('  FAIL: base_url was empty even though we cached something — bug in extractor.');
      exitCode = 1;
      return;
    }

    header('3) Call computer.clickMouse via metro-direct (watch debug log)');
    const routedCall = await timeIt('metro-direct call', () =>
      routed.browsers.computer.clickMouse(browser.session_id, { x: 10, y: 10 }),
    );
    void routedCall;

    if (!process.env['SKIP_COMPARE']) {
      header('4) Same call via the public API for comparison');
      const plainCall = await timeIt('public-API   call', () =>
        plain.browsers.computer.clickMouse(browser.session_id, { x: 20, y: 20 }),
      );
      void plainCall;

      header('5) Repeat both, 3x each, to get a steady-state read');
      const routedSamples: number[] = [];
      const plainSamples: number[] = [];
      for (let i = 0; i < 3; i++) {
        const r = await timeIt(`metro-direct #${i + 1}`, () =>
          routed.browsers.computer.clickMouse(browser.session_id, { x: 30 + i, y: 30 + i }),
        );
        routedSamples.push(r.ms);
        const p = await timeIt(`public-API   #${i + 1}`, () =>
          plain.browsers.computer.clickMouse(browser.session_id, { x: 40 + i, y: 40 + i }),
        );
        plainSamples.push(p.ms);
      }
      const avg = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
      header('6) Result');
      log(`  metro-direct avg: ${avg(routedSamples)} ms (samples: ${routedSamples.join(', ')})`);
      log(`  public-API   avg: ${avg(plainSamples)} ms (samples: ${plainSamples.join(', ')})`);
      log(`  delta: ${avg(plainSamples) - avg(routedSamples)} ms`);
    }

    log('\nOK');
  } catch (err) {
    console.error('\nERROR during routed flow:', err);
    exitCode = 1;
  } finally {
    header('cleanup');
    try {
      await plain.browsers.deleteByID(browser.session_id);
      log('  deleted', browser.session_id);
    } catch (e) {
      console.error('  failed to delete browser:', e);
    }
    process.exit(exitCode);
  }
}

void main();
