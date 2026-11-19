// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Kernel from '@onkernel/sdk';

const client = new Kernel({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource workloadIdentityAuthenticationEvents', () => {
  // Mock server tests are disabled
  test.skip('list', async () => {
    const responsePromise = client.workloadIdentityAuthenticationEvents.list();
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
      client.workloadIdentityAuthenticationEvents.list(
        {
          end_time: '2019-12-27T18:11:19.117Z',
          federation_rule_id: 'federation_rule_id',
          issuer_id: 'issuer_id',
          limit: 1,
          offset: 0,
          outcome: 'success',
          project_id: 'project_id',
          service_account_id: 'service_account_id',
          start_time: '2019-12-27T18:11:19.117Z',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Kernel.NotFoundError);
  });
});
