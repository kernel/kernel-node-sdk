import Kernel from '@onkernel/sdk';

async function main() {
  const kernel = new Kernel({
    browserRouting: {
      enabled: true,
      subresources: ['computer', 'curl'],
    },
  });

  const browser = await kernel.browsers.create({});
  await kernel.browsers.computer.clickMouse(browser.session_id, { x: 10, y: 10 });

  const response = await kernel
    .get(`/browsers/${browser.session_id}/curl/raw`, {
      query: { url: 'https://example.com' },
    })
    .asResponse();
  console.log('status', response.status);

  await kernel.browsers.deleteByID(browser.session_id);
}

void main();
