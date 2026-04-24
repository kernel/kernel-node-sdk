import Kernel from '@onkernel/sdk';

async function main() {
  const kernel = new Kernel();

  const browser = await kernel.browsers.create({});
  const response = await kernel.browsers.fetch(browser.session_id, 'https://example.com', { method: 'GET' });
  console.log('status', response.status);

  await kernel.browsers.deleteByID(browser.session_id);
}

void main();
