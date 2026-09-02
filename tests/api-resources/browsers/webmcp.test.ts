// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Kernel from '@onkernel/sdk';

const client = new Kernel({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource webmcp', () => {
  // Mock server tests are disabled
  test.skip('invokeTool: only required params', async () => {
    const responsePromise = client.browsers.webmcp.invokeTool('htzv5orfit78e1m2biiifpbv', {
      input: { foo: 'bar' },
      tool_ref: 'x',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('invokeTool: required and optional params', async () => {
    const response = await client.browsers.webmcp.invokeTool('htzv5orfit78e1m2biiifpbv', {
      input: { foo: 'bar' },
      tool_ref: 'x',
      timeout_sec: 1,
    });
  });

  // Mock server tests are disabled
  test.skip('listTools', async () => {
    const responsePromise = client.browsers.webmcp.listTools('htzv5orfit78e1m2biiifpbv');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });
});
