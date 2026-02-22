// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Kernel from '@onkernel/sdk';

const client = new Kernel({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource computer', () => {
  // Mock server tests are disabled
  test.skip('batch: only required params', async () => {
    const responsePromise = client.browsers.computer.batch('id', { actions: [{ type: 'click_mouse' }] });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('batch: required and optional params', async () => {
    const response = await client.browsers.computer.batch('id', {
      actions: [
        {
          type: 'click_mouse',
          click_mouse: {
            x: 0,
            y: 0,
            button: 'left',
            click_type: 'down',
            hold_keys: ['string'],
            num_clicks: 0,
          },
          drag_mouse: {
            path: [
              [0, 0],
              [0, 0],
            ],
            button: 'left',
            delay: 0,
            hold_keys: ['string'],
            step_delay_ms: 0,
            steps_per_segment: 1,
          },
          move_mouse: {
            x: 0,
            y: 0,
            hold_keys: ['string'],
          },
          press_key: {
            keys: ['string'],
            duration: 0,
            hold_keys: ['string'],
          },
          scroll: {
            x: 0,
            y: 0,
            delta_x: 0,
            delta_y: 0,
            hold_keys: ['string'],
          },
          set_cursor: { hidden: true },
          sleep: { duration_ms: 0 },
          type_text: { text: 'text', delay: 0 },
        },
      ],
    });
  });

  // Mock server tests are disabled
  test.skip('captureScreenshot: request options and params are passed correctly', async () => {
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

  // Mock server tests are disabled
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

  // Mock server tests are disabled
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

  // Mock server tests are disabled
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

  // Mock server tests are disabled
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

  // Mock server tests are disabled
  test.skip('getMousePosition', async () => {
    const responsePromise = client.browsers.computer.getMousePosition('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
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

  // Mock server tests are disabled
  test.skip('moveMouse: required and optional params', async () => {
    const response = await client.browsers.computer.moveMouse('id', {
      x: 0,
      y: 0,
      hold_keys: ['string'],
    });
  });

  // Mock server tests are disabled
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

  // Mock server tests are disabled
  test.skip('pressKey: required and optional params', async () => {
    const response = await client.browsers.computer.pressKey('id', {
      keys: ['string'],
      duration: 0,
      hold_keys: ['string'],
    });
  });

  // Mock server tests are disabled
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

  // Mock server tests are disabled
  test.skip('scroll: required and optional params', async () => {
    const response = await client.browsers.computer.scroll('id', {
      x: 0,
      y: 0,
      delta_x: 0,
      delta_y: 0,
      hold_keys: ['string'],
    });
  });

  // Mock server tests are disabled
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

  // Mock server tests are disabled
  test.skip('setCursorVisibility: required and optional params', async () => {
    const response = await client.browsers.computer.setCursorVisibility('id', { hidden: true });
  });

  // Mock server tests are disabled
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

  // Mock server tests are disabled
  test.skip('typeText: required and optional params', async () => {
    const response = await client.browsers.computer.typeText('id', { text: 'text', delay: 0 });
  });
});
