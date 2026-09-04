// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Kernel from '@onkernel/sdk';

const client = new Kernel({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource items', () => {
  // Mock server tests are disabled
  test.skip('retrieve: only required params', async () => {
    const responsePromise = client.vaults.items.retrieve('x', { id_or_name: 'id_or_name' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('retrieve: required and optional params', async () => {
    const response = await client.vaults.items.retrieve('x', {
      id_or_name: 'id_or_name',
      expand: ['payment_methods'],
      wait: 0,
    });
  });

  // Mock server tests are disabled
  test.skip('update: only required params', async () => {
    const responsePromise = client.vaults.items.update('x', {
      id_or_name: 'id_or_name',
      spec: {
        amount: 1,
        context:
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        currency: 'bFx',
        merchant_name: 'x',
        merchant_url: 'https://example.com',
        payment_method_id: 'x',
        provider: 'link',
        wallet: 'wallet',
      },
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
  test.skip('update: required and optional params', async () => {
    const response = await client.vaults.items.update('x', {
      id_or_name: 'id_or_name',
      spec: {
        amount: 1,
        context:
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        currency: 'bFx',
        merchant_name: 'x',
        merchant_url: 'https://example.com',
        payment_method_id: 'x',
        provider: 'link',
        wallet: 'wallet',
        expires_at: 0,
        line_items: [
          {
            name: 'name',
            description: 'description',
            image_url: 'image_url',
            product_url: 'product_url',
            quantity: 1,
            sku: 'sku',
            totals: [
              {
                amount: 0,
                display_text: 'display_text',
                type: 'type',
              },
            ],
            unit_amount: 0,
            url: 'url',
          },
        ],
        metadata: { foo: 'string' },
        totals: [
          {
            amount: 0,
            display_text: 'display_text',
            type: 'type',
          },
        ],
      },
    });
  });

  // Mock server tests are disabled
  test.skip('list', async () => {
    const responsePromise = client.vaults.items.list('id_or_name');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('delete: only required params', async () => {
    const responsePromise = client.vaults.items.delete('x', { id_or_name: 'id_or_name' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('delete: required and optional params', async () => {
    const response = await client.vaults.items.delete('x', { id_or_name: 'id_or_name' });
  });

  // Mock server tests are disabled
  test.skip('events: only required params', async () => {
    const responsePromise = client.vaults.items.events('key', { id_or_name: 'id_or_name' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('events: required and optional params', async () => {
    const response = await client.vaults.items.events('key', {
      id_or_name: 'id_or_name',
      after: 'after',
      wait: 0,
    });
  });

  // Mock server tests are disabled
  test.skip('performOperation: only required params', async () => {
    const responsePromise = client.vaults.items.performOperation('key', {
      id_or_name: 'id_or_name',
      type: 'authorize',
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
  test.skip('performOperation: required and optional params', async () => {
    const response = await client.vaults.items.performOperation('key', {
      id_or_name: 'id_or_name',
      type: 'authorize',
    });
  });

  // Mock server tests are disabled
  test.skip('upsert: only required params', async () => {
    const responsePromise = client.vaults.items.upsert('x', {
      id_or_name: 'id_or_name',
      spec: {
        authorization: {
          client: { type: 'kernel_managed' },
          method: 'oauth',
        },
        provider: 'link',
      },
      type: 'wallet',
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
  test.skip('upsert: required and optional params', async () => {
    const response = await client.vaults.items.upsert('x', {
      id_or_name: 'id_or_name',
      spec: {
        authorization: {
          client: { type: 'kernel_managed' },
          method: 'oauth',
        },
        provider: 'link',
      },
      type: 'wallet',
    });
  });
});
