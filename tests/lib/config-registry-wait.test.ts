import Kernel, { APIConnectionTimeoutError, APIUserAbortError, KernelError } from '@onkernel/sdk';

const analysisResponse = (
  status: string,
  { id = 'analysis-1', finishedAt = null }: { id?: string; finishedAt?: string | null } = {},
) => ({
  analysis: {
    id,
    created_at: '2026-09-16T00:00:00Z',
    expires_at: '2026-09-16T00:45:00Z',
    failure: null,
    finished_at: finishedAt,
    status,
    intent: null,
  },
  recommendation: null,
  target: {
    domain: 'example.com',
    host: 'example.com',
    normalized: 'https://example.com/',
  },
  working_configurations: [],
  guidance: null,
  workload_outcome: null,
});

const requestURL = (input: string | URL | Request) =>
  input instanceof Request ? input.url : input.toString();

describe('config registry analysis waiter', () => {
  test('polls unknown unfinished statuses until the analysis is finished', async () => {
    const responses = [
      analysisResponse('running'),
      analysisResponse('queued'),
      analysisResponse('archived', { finishedAt: '2026-09-16T00:01:00Z' }),
    ];
    const requests: Request[] = [];
    const client = new Kernel({
      apiKey: 'test',
      baseURL: 'https://api.example',
      fetch: async (input, init) => {
        const request = input instanceof Request ? input : new Request(input, init);
        requests.push(request);
        return Response.json(responses.shift());
      },
    });

    const result = await client.configRegistry.analyses.waitForResult('analysis-1', {
      pollIntervalMs: 1,
      headers: { 'X-Test': 'preserved', 'X-Stainless-Poll-Helper': 'caller' },
    });

    expect(result.analysis?.status).toBe('archived');
    expect(requests).toHaveLength(3);
    expect(requests.every((request) => request.headers.get('X-Test') === 'preserved')).toBe(true);
    expect(requests.every((request) => request.headers.get('X-Stainless-Poll-Helper') === 'true')).toBe(true);
    expect(requestURL(requests[0]!)).toBe('https://api.example/config-registry/analyses/analysis-1');
  });

  test.each(['completed', 'failed', 'canceled', 'expired'])(
    'returns %s without requiring finished_at',
    async (status) => {
      let requests = 0;
      const client = new Kernel({
        apiKey: 'test',
        baseURL: 'https://api.example',
        fetch: async () => {
          requests += 1;
          return Response.json(analysisResponse(status));
        },
      });

      const result = await client.configRegistry.analyses.waitForResult('analysis-1');

      expect(result.analysis?.status).toBe(status);
      expect(requests).toBe(1);
    },
  );

  test('a zero max wait reads once before timing out', async () => {
    let requests = 0;
    const client = new Kernel({
      apiKey: 'test',
      baseURL: 'https://api.example',
      fetch: async () => {
        requests += 1;
        return Response.json(analysisResponse('running'));
      },
    });

    await expect(
      client.configRegistry.analyses.waitForResult('analysis-1', { maxWaitMs: 0 }),
    ).rejects.toThrow(APIConnectionTimeoutError);
    expect(requests).toBe(1);
  });

  test.each([
    [{ analysis: null }, 'missing an analysis'],
    [analysisResponse('running', { id: 'analysis-2' }), 'analysis-2'],
  ])('rejects an invalid analysis response', async (payload, message) => {
    const client = new Kernel({
      apiKey: 'test',
      baseURL: 'https://api.example',
      fetch: async () => Response.json(payload),
    });

    await expect(client.configRegistry.analyses.waitForResult('analysis-1')).rejects.toThrow(
      message as string,
    );
    await expect(client.configRegistry.analyses.waitForResult('analysis-1')).rejects.toThrow(KernelError);
  });

  test('rejects a response that omits finished_at', async () => {
    const payload = analysisResponse('running');
    delete (payload.analysis as { finished_at?: string | null }).finished_at;
    const client = new Kernel({
      apiKey: 'test',
      baseURL: 'https://api.example',
      fetch: async () => Response.json(payload),
    });

    await expect(client.configRegistry.analyses.waitForResult('analysis-1')).rejects.toThrow('finished_at');
  });

  test.each([
    { pollIntervalMs: 0 },
    { pollIntervalMs: Number.NaN },
    { maxWaitMs: -1 },
    { maxWaitMs: Number.POSITIVE_INFINITY },
  ])('rejects invalid timing options', async (options) => {
    const client = new Kernel({ apiKey: 'test', baseURL: 'https://api.example' });

    await expect(client.configRegistry.analyses.waitForResult('analysis-1', options)).rejects.toThrow(
      RangeError,
    );
  });

  test('aborts while sleeping without issuing another request', async () => {
    const controller = new AbortController();
    let requests = 0;
    const client = new Kernel({
      apiKey: 'test',
      baseURL: 'https://api.example',
      fetch: async () => {
        requests += 1;
        setTimeout(() => controller.abort(), 0);
        return Response.json(analysisResponse('running'));
      },
    });

    await expect(
      client.configRegistry.analyses.waitForResult('analysis-1', {
        pollIntervalMs: 60_000,
        signal: controller.signal,
      }),
    ).rejects.toThrow(APIUserAbortError);
    expect(requests).toBe(1);
  });
});
