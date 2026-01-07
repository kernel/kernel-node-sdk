// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Kernel from '@onkernel/sdk';

const client = new Kernel({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource computer', () => {
  test('captureScreenshot: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.browsers.computer.captureScreenshot(
        'id',
        {
          region: {
            height: 0,
            width: 0,
            x: 0,
            y: 0,
          },
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Kernel.NotFoundError);
  });

  // Prism tests are disabled
  test.skip('clickMouse: only required params', async () => {
    const responsePromise = client.browsers.computer.clickMouse('id', { x: 0, y: 0 });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('clickMouse: required and optional params', async () => {
    const response = await client.browsers.computer.clickMouse('id', {
      x: 0,
      y: 0,
      button: 'left',
      click_type: 'down',
      hold_keys: ['string'],
      num_clicks: 0,
    });
  });

  // Prism tests are disabled
  test.skip('dragMouse: only required params', async () => {
    const responsePromise = client.browsers.computer.dragMouse('id', {
      path: [
        [0, 0],
        [0, 0],
      ],
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
  test.skip('dragMouse: required and optional params', async () => {
    const response = await client.browsers.computer.dragMouse('id', {
      path: [
        [0, 0],
        [0, 0],
      ],
      button: 'left',
      delay: 0,
      hold_keys: ['string'],
      step_delay_ms: 0,
      steps_per_segment: 1,
    });
  });

  // Prism tests are disabled
  test.skip('moveMouse: only required params', async () => {
    const responsePromise = client.browsers.computer.moveMouse('id', { x: 0, y: 0 });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('moveMouse: required and optional params', async () => {
    const response = await client.browsers.computer.moveMouse('id', {
      x: 0,
      y: 0,
      hold_keys: ['string'],
    });
  });

  // Prism tests are disabled
  test.skip('pressKey: only required params', async () => {
    const responsePromise = client.browsers.computer.pressKey('id', { keys: ['string'] });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('pressKey: required and optional params', async () => {
    const response = await client.browsers.computer.pressKey('id', {
      keys: ['string'],
      duration: 0,
      hold_keys: ['string'],
    });
  });

  // Prism tests are disabled
  test.skip('scroll: only required params', async () => {
    const responsePromise = client.browsers.computer.scroll('id', { x: 0, y: 0 });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('scroll: required and optional params', async () => {
    const response = await client.browsers.computer.scroll('id', {
      x: 0,
      y: 0,
      delta_x: 0,
      delta_y: 0,
      hold_keys: ['string'],
    });
  });

  // Prism tests are disabled
  test.skip('setCursorVisibility: only required params', async () => {
    const responsePromise = client.browsers.computer.setCursorVisibility('id', { hidden: true });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('setCursorVisibility: required and optional params', async () => {
    const response = await client.browsers.computer.setCursorVisibility('id', { hidden: true });
  });

  // Prism tests are disabled
  test.skip('typeText: only required params', async () => {
    const responsePromise = client.browsers.computer.typeText('id', { text: 'text' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('typeText: required and optional params', async () => {
    const response = await client.browsers.computer.typeText('id', { text: 'text', delay: 0 });
  });
});
