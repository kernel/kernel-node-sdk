// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Kernel from '@onkernel/sdk';

const client = new Kernel({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource workloadIdentityFederationRules', () => {
  // Mock server tests are disabled
  test.skip('create: only required params', async () => {
    const responsePromise = client.workloadIdentityFederationRules.create({
      authorization: {
        policy: {
          statements: [{ action: 'browsers:use', resource: 'projects/proj_abc123/browsers/br_abc123' }],
        },
        project_id: 'x',
        token_audience: 'x',
      },
      expected_audience: 'x',
      issuer_id: 'x',
      match: { type: 'github_actions' },
      name: 'name',
      target: { service_account_id: 'x', type: 'service_account' },
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
  test.skip('create: required and optional params', async () => {
    const response = await client.workloadIdentityFederationRules.create({
      authorization: {
        policy: {
          statements: [
            {
              action: 'browsers:use',
              resource: 'projects/proj_abc123/browsers/br_abc123',
              condition: {
                key: 'source_ip',
                operator: 'in',
                values: ['203.0.113.0/24'],
              },
            },
          ],
        },
        project_id: 'x',
        token_audience: 'x',
        max_token_ttl_seconds: 1,
      },
      expected_audience: 'x',
      issuer_id: 'x',
      match: {
        type: 'github_actions',
        claims: { foo: 'x' },
        environment: 'environment',
        event_names: ['x'],
        job_workflow_ref: 'job_workflow_ref',
        namespace: 'namespace',
        ref: 'ref',
        repository: 'repository',
        repository_id: '269125115713',
        repository_owner_id: '269125115713',
        service_account: 'service_account',
        subject: 'x',
        subject_prefix: 'x',
        workflow: 'workflow',
        workflow_ref: 'workflow_ref',
      },
      name: 'name',
      target: { service_account_id: 'x', type: 'service_account' },
      description: 'description',
      enabled: true,
    });
  });

  // Mock server tests are disabled
  test.skip('retrieve', async () => {
    const responsePromise = client.workloadIdentityFederationRules.retrieve('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('update: only required params', async () => {
    const responsePromise = client.workloadIdentityFederationRules.update('id', { expected_version: 1 });
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
    const response = await client.workloadIdentityFederationRules.update('id', {
      expected_version: 1,
      authorization: {
        policy: {
          statements: [
            {
              action: 'browsers:use',
              resource: 'projects/proj_abc123/browsers/br_abc123',
              condition: {
                key: 'source_ip',
                operator: 'in',
                values: ['203.0.113.0/24'],
              },
            },
          ],
        },
        project_id: 'x',
        token_audience: 'x',
        max_token_ttl_seconds: 1,
      },
      description: 'description',
      enabled: true,
      expected_audience: 'x',
      issuer_id: 'x',
      match: {
        type: 'github_actions',
        claims: { foo: 'x' },
        environment: 'environment',
        event_names: ['x'],
        job_workflow_ref: 'job_workflow_ref',
        namespace: 'namespace',
        ref: 'ref',
        repository: 'repository',
        repository_id: '269125115713',
        repository_owner_id: '269125115713',
        service_account: 'service_account',
        subject: 'x',
        subject_prefix: 'x',
        workflow: 'workflow',
        workflow_ref: 'workflow_ref',
      },
      name: 'name',
      target: { service_account_id: 'x', type: 'service_account' },
    });
  });

  // Mock server tests are disabled
  test.skip('list', async () => {
    const responsePromise = client.workloadIdentityFederationRules.list();
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
      client.workloadIdentityFederationRules.list(
        {
          issuer_id: 'issuer_id',
          limit: 1,
          offset: 0,
          project_id: 'project_id',
          query: 'query',
          service_account_id: 'service_account_id',
          status: 'active',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Kernel.NotFoundError);
  });

  // Mock server tests are disabled
  test.skip('delete', async () => {
    const responsePromise = client.workloadIdentityFederationRules.delete('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });
});
