/**
 * Browser routing: keep the standard browser resource surface while routing
 * allowlisted subresources and raw HTTP directly to the browser VM.
 */
import Kernel from '@onkernel/sdk';

async function main() {
  const kernel = new Kernel({
    browserRouting: {
      enabled: true,
      directToVMSubresources: ['computer'],
    },
  });

  const created = await kernel.browsers.create({});
  kernel.browserRouteCache.prime(created);

  await kernel.browsers.computer.clickMouse(created.session_id, { x: 10, y: 10 });

  const page = await kernel.browsers.fetch(created.session_id, 'https://example.com', { method: 'GET' });
  console.log('status', page.status);

  await kernel.browsers.deleteByID(created.session_id);
}

void main();
