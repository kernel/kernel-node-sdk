import Kernel from '@onkernel/sdk';

async function main() {
  const kernel = new Kernel();

  // Create a browser with telemetry enabled so it emits events while it runs.
  const browser = await kernel.browsers.create({ telemetry: { enabled: true } });

  try {
    // Telemetry is a default routing subresource, so the stream goes directly to the VM automatically.
    const stream = await kernel.browsers.telemetry.stream(browser.session_id);

    // Make browser activity to generate telemetry. The "api" category emits an event per VM API call,
    // so events arrive within ~1s.
    for (let i = 0; i < 3; i++) {
      await kernel.browsers.curl(browser.session_id, { url: 'https://example.com', method: 'GET' });
    }

    // Print a few events, then stop so the program terminates promptly.
    let count = 0;
    for await (const event of stream) {
      console.log('telemetry event', event);
      if (++count >= 3) break;
    }
  } finally {
    await kernel.browsers.deleteByID(browser.session_id);
  }
}

void main();
