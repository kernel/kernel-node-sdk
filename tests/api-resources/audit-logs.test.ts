// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Kernel from '@onkernel/sdk';

const client = new Kernel({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource auditLogs', () => {
  // Mock server tests are disabled
  test.skip('list: only required params', async () => {
    const responsePromise = client.auditLogs.list({
      end: '2026-01-02T00:00:00Z',
      start: '2026-01-01T00:00:00Z',
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
  test.skip('list: required and optional params', async () => {
    const response = await client.auditLogs.list({
      end: '2026-01-02T00:00:00Z',
      start: '2026-01-01T00:00:00Z',
      auth_strategy: 'auth_strategy',
      exclude_method: 'exclude_method',
      limit: 1,
      method: 'method',
      page_token: 'page_token',
      search: 'search',
      search_user_id: ['string'],
      service: 'service',
    });
  });

  // Mock server tests are disabled
  test.skip('exportChunk: required and optional params', async () => {
    const response = await client.auditLogs.exportChunk({
      end: '2026-01-02T00:00:00Z',
      start: '2026-01-01T00:00:00Z',
      auth_strategy: 'auth_strategy',
      cursor: 'cursor',
      exclude_method: 'exclude_method',
      format: 'jsonl',
      limit: 1,
      method: 'method',
      search: 'search',
      search_user_id: ['string'],
      service: 'service',
    });
  });
});
