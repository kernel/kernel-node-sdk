// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Kernel, { toFile } from '@onkernel/sdk';

const client = new Kernel({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource browsers', () => {
  // Prism tests are disabled
  test.skip('create', async () => {
    const responsePromise = client.browsers.create();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('create: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.browsers.create(
        {
          extensions: [{ id: 'id', name: 'name' }],
          headless: false,
          invocation_id: 'rr33xuugxj9h0bkf1rdt2bet',
          kiosk_mode: true,
          persistence: { id: 'my-awesome-browser-for-user-1234' },
          profile: {
            id: 'id',
            name: 'name',
            save_changes: true,
          },
          proxy_id: 'proxy_id',
          stealth: true,
          timeout_seconds: 10,
          viewport: {
            height: 800,
            width: 1280,
            refresh_rate: 60,
          },
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Kernel.NotFoundError);
  });

  // Prism tests are disabled
  test.skip('retrieve', async () => {
    const responsePromise = client.browsers.retrieve('htzv5orfit78e1m2biiifpbv');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('list', async () => {
    const responsePromise = client.browsers.list();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('list: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.browsers.list(
        {
          include_deleted: true,
          limit: 1,
          offset: 0,
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Kernel.NotFoundError);
  });

  // Prism tests are disabled
  test.skip('delete: only required params', async () => {
    const responsePromise = client.browsers.delete({ persistent_id: 'persistent_id' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('delete: required and optional params', async () => {
    const response = await client.browsers.delete({ persistent_id: 'persistent_id' });
  });

  // Prism tests are disabled
  test.skip('deleteByID', async () => {
    const responsePromise = client.browsers.deleteByID('htzv5orfit78e1m2biiifpbv');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('loadExtensions: only required params', async () => {
    const responsePromise = client.browsers.loadExtensions('id', {
      extensions: [{ name: 'name', zip_file: await toFile(Buffer.from('# my file contents'), 'README.md') }],
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('loadExtensions: required and optional params', async () => {
    const response = await client.browsers.loadExtensions('id', {
      extensions: [{ name: 'name', zip_file: await toFile(Buffer.from('# my file contents'), 'README.md') }],
    });
  });
});
