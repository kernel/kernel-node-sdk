import Kernel from '@onkernel/sdk';

async function main() {
  const kernel = new Kernel({
    browserRouting: {
      enabled: true,
      subresources: ['computer'],
    },
  });

  const browser = await kernel.browsers.create({});
  await kernel.browsers.computer.clickMouse(browser.session_id, { x: 10, y: 10 });
  const response = await kernel.browsers.fetch(browser.session_id, 'https://example.com', { method: 'GET' });
  console.log('status', response.status);

  await kernel.browsers.deleteByID(browser.session_id);
}

void main();
