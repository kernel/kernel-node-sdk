// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Kernel from '@onkernel/sdk';

const client = new Kernel({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource search', () => {
  // Mock server tests are disabled
  test.skip('create: only required params', async () => {
    const responsePromise = client.search.create({ query: 'x' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('create: required and optional params', async () => {
    const response = await client.search.create({
      query: 'x',
      content: true,
      country: 'se',
      end_date: '2019-12-27',
      exclude_domains: ['string'],
      include_domains: ['string'],
      include_raw: true,
      language: 'language',
      max_results: 1,
      recency: 'hour',
      safe_search: 'off',
      start_date: '2019-12-27',
      strategy: {
        type: 'auto',
        fallback_on: ['error'],
        provider_options: [
          {
            provider: 'brave',
            options: {
              count: 1,
              extra_snippets: true,
              goggles: 'goggles',
              goggles_id: 'goggles_id',
              include_fetch_metadata: true,
              offset: 0,
              operators: 'operators',
              result_filter: 'result_filter',
              search_lang: 'search_lang',
              spellcheck: true,
              ui_lang: 'ui_lang',
              units: 'metric',
            },
          },
        ],
      },
      strict_params: true,
      timeout_ms: 1000,
    });
  });

  // Mock server tests are disabled
  test.skip('retrieve', async () => {
    const responsePromise = client.search.retrieve('srch_abc123');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });
});
