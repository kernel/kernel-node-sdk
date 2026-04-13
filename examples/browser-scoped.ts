/**
 * Browser-scoped client: call metro-routed browser APIs without repeating the
 * session id, and run `fetch`-style HTTP through the browser network stack.
 *
 * Run after `yarn build` so `dist/` matches sources, or import from `src/` via
 * ts-node with path aliases.
 */
import Kernel from '@onkernel/sdk';

async function main() {
  const kernel = new Kernel();

  const created = await kernel.browsers.create({});
  const browser = kernel.forBrowser(created);

  await browser.computer.clickMouse({ x: 10, y: 10 });

  const page = await browser.fetch('https://example.com', { method: 'GET' });
  console.log('status', page.status);

  await kernel.browsers.deleteByID(created.session_id);
}

void main();
