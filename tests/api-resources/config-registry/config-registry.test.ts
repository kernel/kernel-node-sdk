// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Kernel from '@onkernel/sdk';

const client = new Kernel({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource configRegistry', () => {
  // Mock server tests are disabled
  test.skip('list', async () => {
    const responsePromise = client.configRegistry.list();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('list: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.configRegistry.list(
        {
          limit: 1,
          offset: 0,
          search: 'search',
          sort_by: 'target',
          sort_order: 'asc',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Kernel.NotFoundError);
  });

  // Mock server tests are disabled
  test.skip('lookup: only required params', async () => {
    const responsePromise = client.configRegistry.lookup({ url: 'https://example.com' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('lookup: required and optional params', async () => {
    const response = await client.configRegistry.lookup({
      url: 'https://example.com',
      allowed_proxy_countries: ['US'],
    });
  });

  // Mock server tests are disabled
  test.skip('resolve: only required params', async () => {
    const responsePromise = client.configRegistry.resolve({ url: 'https://example.com' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('resolve: required and optional params', async () => {
    const response = await client.configRegistry.resolve({
      url: 'https://example.com',
      allowed_proxy_countries: ['US'],
    });
  });
});
