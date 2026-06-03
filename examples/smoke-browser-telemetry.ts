import Kernel from '@onkernel/sdk';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function normalizeURL(input: unknown): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input instanceof URL) {
    return input.toString();
  }
  return (input as Request).url;
}

function authHeaderPresent(input: unknown, init?: RequestInit): boolean {
  const headers = input instanceof Request ? new Headers(input.headers) : new Headers(init?.headers);
  return headers.has('authorization');
}

async function main() {
  // Telemetry is now a default routing subresource; set the env var explicitly to be safe.
  process.env['KERNEL_BROWSER_ROUTING_SUBRESOURCES'] = 'curl,telemetry';

  const records: Array<{ url: string; auth: boolean }> = [];
  const realFetch: typeof fetch = fetch;

  const kernel = new Kernel({
    baseURL: process.env['KERNEL_BASE_URL'] || 'https://api.onkernel.com',
    fetch: async (input, init) => {
      records.push({ url: normalizeURL(input), auth: authHeaderPresent(input, init as RequestInit) });
      return realFetch(input as any, init as any);
    },
  });

  let sessionID: string | undefined;

  try {
    console.log(`Using Kernel API ${kernel.baseURL}`);
    const browser = await kernel.browsers.create({
      headless: true,
      timeout_seconds: 120,
      telemetry: { enabled: true },
    });
    sessionID = browser.session_id;
    console.log(`Created browser ${sessionID}`);

    const route = kernel.browserRouteCache.get(sessionID);
    assert(route, `expected a cached route for session ${sessionID}`);
    const baseHost = new URL(route.baseURL).host;
    console.log(`Cached VM base_url host: ${baseHost}`);

    const recordsBeforeStream = records.length;
    const stream = await kernel.browsers.telemetry.stream(sessionID);
    console.log(`Opened telemetry stream`);

    // The telemetry stream request should be the most recent recorded request.
    const streamReq = records[records.length - 1];
    assert(streamReq, 'no recorded request for telemetry stream');
    assert(records.length > recordsBeforeStream, 'telemetry stream did not produce an outbound request');

    const streamURL = new URL(streamReq.url);
    console.log(`Telemetry stream outbound URL: ${streamReq.url} (auth=${streamReq.auth})`);

    assert(
      streamURL.host === baseHost,
      `telemetry stream host ${streamURL.host} did not match VM base_url host ${baseHost}`,
    );
    assert(streamURL.host !== 'api.onkernel.com', 'telemetry stream was NOT routed (still api.onkernel.com)');
    assert(
      streamURL.pathname.endsWith('/telemetry/stream'),
      `telemetry stream path ${streamURL.pathname} did not end with /telemetry/stream`,
    );
    assert(!!streamURL.searchParams.get('jwt'), 'telemetry stream URL missing jwt query param');
    assert(!streamReq.auth, 'Authorization header was NOT stripped on the routed telemetry stream request');
    console.log(
      `Routing confirmed: stream -> ${streamURL.host}${streamURL.pathname} (jwt present, auth stripped)`,
    );

    // Generate activity so the "api" telemetry category emits an event.
    const activity = (async () => {
      try {
        await kernel.browsers.curl(sessionID!, {
          url: 'https://example.com/',
          method: 'GET',
          response_encoding: 'utf8',
          timeout_ms: 10_000,
        });
        console.log('Generated activity via browsers.curl');
      } catch (error) {
        console.error('activity curl failed', error);
      }
    })();

    let eventCount = 0;
    const deadline = Date.now() + 25_000;
    const reader = (async () => {
      for await (const event of stream) {
        eventCount += 1;
        console.log(
          `telemetry event #${eventCount}: seq=${(event as any)?.seq} type=${(event as any)?.event?.type}`,
        );
        break;
      }
    })();

    await activity;
    await Promise.race([
      reader,
      new Promise<void>((resolve) => {
        const timer = setInterval(() => {
          if (eventCount > 0 || Date.now() > deadline) {
            clearInterval(timer);
            resolve();
          }
        }, 250);
      }),
    ]);

    assert(eventCount >= 1, `expected at least one telemetry event within 25s, got ${eventCount}`);
    console.log(`PASS telemetry stream received ${eventCount} event(s) over direct-routed VM connection`);
    console.log(`SMOKE_RESULT eventsObserved=${eventCount} routedURL=${streamReq.url}`);
  } finally {
    if (sessionID) {
      console.log(`Deleting browser ${sessionID}`);
      try {
        await kernel.browsers.deleteByID(sessionID);
      } catch (error) {
        console.error(`Failed to delete browser ${sessionID}`, error);
      }
    }
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
