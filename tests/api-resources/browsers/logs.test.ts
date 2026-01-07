// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Kernel from '@onkernel/sdk';

const client = new Kernel({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource logs', () => {
  // Prism doesn't support text/event-stream responses
  test.skip('stream: only required params', async () => {
    const responsePromise = client.browsers.logs.stream('id', { source: 'path' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism doesn't support text/event-stream responses
  test.skip('stream: required and optional params', async () => {
    const response = await client.browsers.logs.stream('id', {
      source: 'path',
      follow: true,
      path: 'path',
      supervisor_process: 'supervisor_process',
    });
  });
});
