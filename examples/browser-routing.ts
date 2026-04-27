import Kernel from '@onkernel/sdk';

async function main() {
  const kernel = new Kernel();

  const browser = await kernel.browsers.create({});

  // Raw browser curl: streams the response. Use for large responses, when you want to stream,
  // or when you want fetch() / Response semantics.
  const response: Response = await kernel.browsers.fetch(browser.session_id, 'https://example.com', {
    method: 'GET',
  });
  console.log('body', await response.text());

  // Buffered browser curl: returns the full response in a JSON envelope. Use for small responses.
  const buffered = await kernel.browsers.curl(browser.session_id, {
    url: 'https://example.com',
    method: 'GET',
  });
  console.log('body', buffered.body);

  await kernel.browsers.deleteByID(browser.session_id);
}

void main();
