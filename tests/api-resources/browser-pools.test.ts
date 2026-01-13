// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Kernel from '@kernel/sdk';

const client = new Kernel({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource browserPools', () => {
  // Prism tests are disabled
  test.skip('create: only required params', async () => {
    const responsePromise = client.browserPools.create({ size: 10 });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('create: required and optional params', async () => {
    const response = await client.browserPools.create({
      size: 10,
      extensions: [{ id: 'id', name: 'name' }],
      fill_rate_per_minute: 0,
      headless: false,
      kiosk_mode: true,
      name: 'my-pool',
      profile: {
        id: 'id',
        name: 'name',
        save_changes: true,
      },
      proxy_id: 'proxy_id',
      stealth: true,
      timeout_seconds: 60,
      viewport: {
        height: 800,
        width: 1280,
        refresh_rate: 60,
      },
    });
  });

  // Prism tests are disabled
  test.skip('retrieve', async () => {
    const responsePromise = client.browserPools.retrieve('id_or_name');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('update: only required params', async () => {
    const responsePromise = client.browserPools.update('id_or_name', { size: 10 });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('update: required and optional params', async () => {
    const response = await client.browserPools.update('id_or_name', {
      size: 10,
      discard_all_idle: false,
      extensions: [{ id: 'id', name: 'name' }],
      fill_rate_per_minute: 0,
      headless: false,
      kiosk_mode: true,
      name: 'my-pool',
      profile: {
        id: 'id',
        name: 'name',
        save_changes: true,
      },
      proxy_id: 'proxy_id',
      stealth: true,
      timeout_seconds: 60,
      viewport: {
        height: 800,
        width: 1280,
        refresh_rate: 60,
      },
    });
  });

  // Prism tests are disabled
  test.skip('list', async () => {
    const responsePromise = client.browserPools.list();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('delete', async () => {
    const responsePromise = client.browserPools.delete('id_or_name');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('delete: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.browserPools.delete('id_or_name', { force: true }, { path: '/_stainless_unknown_path' }),
    ).rejects.toThrow(Kernel.NotFoundError);
  });

  // Prism tests are disabled
  test.skip('acquire', async () => {
    const responsePromise = client.browserPools.acquire('id_or_name', {});
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('flush', async () => {
    const responsePromise = client.browserPools.flush('id_or_name');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('release: only required params', async () => {
    const responsePromise = client.browserPools.release('id_or_name', {
      session_id: 'ts8iy3sg25ibheguyni2lg9t',
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
  test.skip('release: required and optional params', async () => {
    const response = await client.browserPools.release('id_or_name', {
      session_id: 'ts8iy3sg25ibheguyni2lg9t',
      reuse: false,
    });
  });
});
