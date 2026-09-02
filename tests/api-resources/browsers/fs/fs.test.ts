// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Kernel, { toFile } from '@onkernel/sdk';

const client = new Kernel({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource fs', () => {
  // Mock server tests are disabled
  test.skip('createDirectory: only required params', async () => {
    const responsePromise = client.browsers.fs.createDirectory('htzv5orfit78e1m2biiifpbv', { path: '/J!' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('createDirectory: required and optional params', async () => {
    const response = await client.browsers.fs.createDirectory('htzv5orfit78e1m2biiifpbv', {
      path: '/J!',
      mode: '0611',
    });
  });

  // Mock server tests are disabled
  test.skip('deleteDirectory: only required params', async () => {
    const responsePromise = client.browsers.fs.deleteDirectory('htzv5orfit78e1m2biiifpbv', { path: '/J!' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('deleteDirectory: required and optional params', async () => {
    const response = await client.browsers.fs.deleteDirectory('htzv5orfit78e1m2biiifpbv', { path: '/J!' });
  });

  // Mock server tests are disabled
  test.skip('deleteFile: only required params', async () => {
    const responsePromise = client.browsers.fs.deleteFile('htzv5orfit78e1m2biiifpbv', { path: '/J!' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('deleteFile: required and optional params', async () => {
    const response = await client.browsers.fs.deleteFile('htzv5orfit78e1m2biiifpbv', { path: '/J!' });
  });

  // Mock server tests are disabled
  test.skip('downloadDirZip: required and optional params', async () => {
    const response = await client.browsers.fs.downloadDirZip('htzv5orfit78e1m2biiifpbv', { path: '/J!' });
  });

  // Mock server tests are disabled
  test.skip('fileInfo: only required params', async () => {
    const responsePromise = client.browsers.fs.fileInfo('htzv5orfit78e1m2biiifpbv', { path: '/J!' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('fileInfo: required and optional params', async () => {
    const response = await client.browsers.fs.fileInfo('htzv5orfit78e1m2biiifpbv', { path: '/J!' });
  });

  // Mock server tests are disabled
  test.skip('listFiles: only required params', async () => {
    const responsePromise = client.browsers.fs.listFiles('htzv5orfit78e1m2biiifpbv', { path: '/J!' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('listFiles: required and optional params', async () => {
    const response = await client.browsers.fs.listFiles('htzv5orfit78e1m2biiifpbv', { path: '/J!' });
  });

  // Mock server tests are disabled
  test.skip('move: only required params', async () => {
    const responsePromise = client.browsers.fs.move('htzv5orfit78e1m2biiifpbv', {
      dest_path: '/J!',
      src_path: '/J!',
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
  test.skip('move: required and optional params', async () => {
    const response = await client.browsers.fs.move('htzv5orfit78e1m2biiifpbv', {
      dest_path: '/J!',
      src_path: '/J!',
    });
  });

  // Mock server tests are disabled
  test.skip('readFile: required and optional params', async () => {
    const response = await client.browsers.fs.readFile('htzv5orfit78e1m2biiifpbv', { path: '/J!' });
  });

  // Mock server tests are disabled
  test.skip('setFilePermissions: only required params', async () => {
    const responsePromise = client.browsers.fs.setFilePermissions('htzv5orfit78e1m2biiifpbv', {
      mode: '0611',
      path: '/J!',
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
  test.skip('setFilePermissions: required and optional params', async () => {
    const response = await client.browsers.fs.setFilePermissions('htzv5orfit78e1m2biiifpbv', {
      mode: '0611',
      path: '/J!',
      group: 'group',
      owner: 'owner',
    });
  });

  // Mock server tests are disabled
  test.skip('upload: only required params', async () => {
    const responsePromise = client.browsers.fs.upload('htzv5orfit78e1m2biiifpbv', {
      files: [{ dest_path: '/J!', file: await toFile(Buffer.from('Example data'), 'README.md') }],
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
  test.skip('upload: required and optional params', async () => {
    const response = await client.browsers.fs.upload('htzv5orfit78e1m2biiifpbv', {
      files: [{ dest_path: '/J!', file: await toFile(Buffer.from('Example data'), 'README.md') }],
    });
  });

  // Mock server tests are disabled
  test.skip('uploadZip: only required params', async () => {
    const responsePromise = client.browsers.fs.uploadZip('htzv5orfit78e1m2biiifpbv', {
      dest_path: '/J!',
      zip_file: await toFile(Buffer.from('Example data'), 'README.md'),
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
  test.skip('uploadZip: required and optional params', async () => {
    const response = await client.browsers.fs.uploadZip('htzv5orfit78e1m2biiifpbv', {
      dest_path: '/J!',
      zip_file: await toFile(Buffer.from('Example data'), 'README.md'),
    });
  });

  // Mock server tests are disabled
  test.skip('writeFile: only required params', async () => {
    const responsePromise = client.browsers.fs.writeFile(
      'htzv5orfit78e1m2biiifpbv',
      await toFile(Buffer.from('Example data'), 'README.md'),
      { path: '/J!' },
    );
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('writeFile: required and optional params', async () => {
    const response = await client.browsers.fs.writeFile(
      'htzv5orfit78e1m2biiifpbv',
      await toFile(Buffer.from('Example data'), 'README.md'),
      { path: '/J!', mode: '0611' },
    );
  });
});
