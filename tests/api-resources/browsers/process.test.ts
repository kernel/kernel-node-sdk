// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Kernel from '@onkernel/sdk';

const client = new Kernel({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource process', () => {
  // Mock server tests are disabled
  test.skip('exec: only required params', async () => {
    const responsePromise = client.browsers.process.exec('id', { command: 'command' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('exec: required and optional params', async () => {
    const response = await client.browsers.process.exec('id', {
      command: 'command',
      args: ['string'],
      as_root: true,
      as_user: 'as_user',
      cwd: '/J!',
      env: { foo: 'string' },
      timeout_sec: 0,
    });
  });

  // Mock server tests are disabled
  test.skip('kill: only required params', async () => {
    const responsePromise = client.browsers.process.kill('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
      id: 'id',
      signal: 'TERM',
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
  test.skip('kill: required and optional params', async () => {
    const response = await client.browsers.process.kill('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
      id: 'id',
      signal: 'TERM',
    });
  });

  // Mock server tests are disabled
  test.skip('resize: only required params', async () => {
    const responsePromise = client.browsers.process.resize('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
      id: 'id',
      cols: 1,
      rows: 1,
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
  test.skip('resize: required and optional params', async () => {
    const response = await client.browsers.process.resize('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
      id: 'id',
      cols: 1,
      rows: 1,
    });
  });

  // Mock server tests are disabled
  test.skip('spawn: only required params', async () => {
    const responsePromise = client.browsers.process.spawn('id', { command: 'command' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('spawn: required and optional params', async () => {
    const response = await client.browsers.process.spawn('id', {
      command: 'command',
      allocate_tty: true,
      args: ['string'],
      as_root: true,
      as_user: 'as_user',
      cols: 1,
      cwd: '/J!',
      env: { foo: 'string' },
      rows: 1,
      timeout_sec: 0,
    });
  });

  // Mock server tests are disabled
  test.skip('status: only required params', async () => {
    const responsePromise = client.browsers.process.status('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
      id: 'id',
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
  test.skip('status: required and optional params', async () => {
    const response = await client.browsers.process.status('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
      id: 'id',
    });
  });

  // Mock server tests are disabled
  test.skip('stdin: only required params', async () => {
    const responsePromise = client.browsers.process.stdin('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
      id: 'id',
      data_b64: 'data_b64',
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
  test.skip('stdin: required and optional params', async () => {
    const response = await client.browsers.process.stdin('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
      id: 'id',
      data_b64: 'data_b64',
    });
  });

  // Mock server tests are disabled
  test.skip('stdoutStream: only required params', async () => {
    const responsePromise = client.browsers.process.stdoutStream('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
      id: 'id',
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
  test.skip('stdoutStream: required and optional params', async () => {
    const response = await client.browsers.process.stdoutStream('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
      id: 'id',
    });
  });
});
