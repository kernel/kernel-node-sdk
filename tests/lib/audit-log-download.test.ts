import { createHash } from 'node:crypto';
import { open, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import Kernel, { APIConnectionTimeoutError, APIUserAbortError } from '@onkernel/sdk';

const checksum = (body: string) => createHash('sha256').update(body).digest('hex');

const chunkResponse = (body: string, rows: number, hasMore: boolean, nextCursor?: string) =>
  new Response(body, {
    headers: {
      'content-type': 'application/octet-stream',
      'x-content-sha256': checksum(body),
      'x-has-more': String(hasMore),
      'x-row-count': String(rows),
      ...(nextCursor ? { 'x-next-cursor': nextCursor } : {}),
    },
  });

const requestURL = (input: string | URL | Request) =>
  typeof input === 'string' ? input
  : input instanceof URL ? input.toString()
  : input.url;

const stalledChunkResponse = (signal: AbortSignal) =>
  new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('partial'));
        signal.addEventListener(
          'abort',
          () => controller.error(new DOMException('This operation was aborted', 'AbortError')),
          { once: true },
        );
      },
    }),
    {
      headers: {
        'x-content-sha256': checksum('partial'),
        'x-has-more': 'false',
        'x-row-count': '1',
      },
    },
  );

describe('audit log download', () => {
  test('writes verified chunks and reports progress', async () => {
    const cursors: Array<string | null> = [];
    const client = new Kernel({
      apiKey: 'test',
      baseURL: 'https://api.example',
      fetch: async (input) => {
        const url = new URL(requestURL(input));
        cursors.push(url.searchParams.get('cursor'));
        return cursors.length === 1 ?
            chunkResponse('first', 2, true, 'next')
          : chunkResponse('second', 1, false);
      },
    });
    const chunks: Uint8Array[] = [];
    const progress: Array<{ bytesWritten: number; chunks: number; rows: number; chunkRows: number }> = [];

    const result = await client.auditLogs.download(
      {
        start: '2026-06-01T00:00:00Z',
        end: '2026-06-02T00:00:00Z',
        format: 'jsonl.gz',
      },
      {
        write(chunk) {
          chunks.push(chunk);
        },
      },
      {
        onProgress(update) {
          progress.push(update);
        },
      },
    );

    expect(cursors).toEqual([null, 'next']);
    expect(Buffer.concat(chunks).toString()).toBe('firstsecond');
    expect(result).toEqual({ bytesWritten: 11, chunks: 2, rows: 3 });
    expect(progress).toEqual([
      { bytesWritten: 5, chunks: 1, rows: 2, chunkRows: 2 },
      { bytesWritten: 11, chunks: 2, rows: 3, chunkRows: 1 },
    ]);
  });

  test('writes to a Node file handle', async () => {
    const client = new Kernel({
      apiKey: 'test',
      baseURL: 'https://api.example',
      fetch: async () => chunkResponse('chunk', 1, false),
    });
    const directory = await mkdtemp(join(tmpdir(), 'kernel-audit-logs-'));
    const path = join(directory, 'audit-logs.jsonl.gz');

    try {
      const file = await open(path, 'w');
      try {
        await client.auditLogs.download({ start: '2026-06-01T00:00:00Z', end: '2026-06-02T00:00:00Z' }, file);
      } finally {
        await file.close();
      }
      expect(await readFile(path, 'utf8')).toBe('chunk');
    } finally {
      await rm(directory, { recursive: true });
    }
  });

  test('rejects an invalid next cursor before writing', async () => {
    const client = new Kernel({
      apiKey: 'test',
      baseURL: 'https://api.example',
      fetch: async () => chunkResponse('chunk', 1, true),
    });
    const write = jest.fn();

    await expect(
      client.auditLogs.download({ start: '2026-06-01T00:00:00Z', end: '2026-06-02T00:00:00Z' }, { write }),
    ).rejects.toThrow('response has invalid X-Next-Cursor header');
    expect(write).not.toHaveBeenCalled();
  });

  test.each(['', '1.0', '50001'])('rejects invalid row count %p', async (rowCount) => {
    const client = new Kernel({
      apiKey: 'test',
      baseURL: 'https://api.example',
      fetch: async () => {
        const response = chunkResponse('chunk', 1, false);
        response.headers.set('x-row-count', rowCount);
        return response;
      },
    });
    const write = jest.fn();

    await expect(
      client.auditLogs.download({ start: '2026-06-01T00:00:00Z', end: '2026-06-02T00:00:00Z' }, { write }),
    ).rejects.toThrow('response missing or invalid X-Row-Count header');
    expect(write).not.toHaveBeenCalled();
  });

  test.each([NaN, 0.5, { bytesWritten: NaN }, { bytesWritten: 0.5 }])(
    'rejects invalid destination write result %p',
    async (writeResult) => {
      const client = new Kernel({
        apiKey: 'test',
        baseURL: 'https://api.example',
        fetch: async () => chunkResponse('chunk', 1, false),
      });

      await expect(
        client.auditLogs.download(
          { start: '2026-06-01T00:00:00Z', end: '2026-06-02T00:00:00Z' },
          { write: () => writeResult },
        ),
      ).rejects.toThrow('audit log download destination performed a short write');
    },
  );

  test('retries a checksum mismatch without writing the bad chunk', async () => {
    let attempts = 0;
    const client = new Kernel({
      apiKey: 'test',
      baseURL: 'https://api.example',
      fetch: async () => {
        attempts += 1;
        if (attempts === 1) {
          return new Response('bad', {
            headers: {
              'x-content-sha256': checksum('good'),
              'x-has-more': 'false',
              'x-row-count': '1',
            },
          });
        }
        return chunkResponse('good', 1, false);
      },
    });
    const chunks: Uint8Array[] = [];

    const download = client.auditLogs.download(
      { start: '2026-06-01T00:00:00Z', end: '2026-06-02T00:00:00Z' },
      {
        write(chunk) {
          chunks.push(chunk);
        },
      },
    );
    await download;

    expect(attempts).toBe(2);
    expect(Buffer.concat(chunks).toString()).toBe('good');
  });

  test('respects request retry options', async () => {
    let attempts = 0;
    const client = new Kernel({
      apiKey: 'test',
      baseURL: 'https://api.example',
      fetch: async () => {
        attempts += 1;
        return new Response(JSON.stringify({ message: 'temporary failure' }), {
          status: 500,
          headers: { 'content-type': 'application/json', 'x-should-retry': 'false' },
        });
      },
    });

    await expect(
      client.auditLogs.download(
        { start: '2026-06-01T00:00:00Z', end: '2026-06-02T00:00:00Z' },
        { write() {} },
        { maxRetries: 0 },
      ),
    ).rejects.toThrow('500');
    expect(attempts).toBe(1);
  });

  test('respects transfer retry options', async () => {
    let attempts = 0;
    const client = new Kernel({
      apiKey: 'test',
      baseURL: 'https://api.example',
      fetch: async () => {
        attempts += 1;
        return new Response('bad', {
          headers: {
            'x-content-sha256': checksum('good'),
            'x-has-more': 'false',
            'x-row-count': '1',
          },
        });
      },
    });

    await expect(
      client.auditLogs.download(
        { start: '2026-06-01T00:00:00Z', end: '2026-06-02T00:00:00Z' },
        { write() {} },
        { maxTransferRetries: 0 },
      ),
    ).rejects.toThrow('checksum mismatch');
    expect(attempts).toBe(1);
  });

  test('times out a stalled response body', async () => {
    const client = new Kernel({
      apiKey: 'test',
      baseURL: 'https://api.example',
      fetch: async (_input, init) => stalledChunkResponse(init?.signal as AbortSignal),
    });

    await expect(
      client.auditLogs.download(
        { start: '2026-06-01T00:00:00Z', end: '2026-06-02T00:00:00Z' },
        { write() {} },
        { timeout: 10, maxTransferRetries: 0 },
      ),
    ).rejects.toBeInstanceOf(APIConnectionTimeoutError);
  });

  test('maps cancellation during a response body read to APIUserAbortError', async () => {
    const controller = new AbortController();
    const client = new Kernel({
      apiKey: 'test',
      baseURL: 'https://api.example',
      fetch: async (_input, init) => stalledChunkResponse(init?.signal as AbortSignal),
    });

    const download = client.auditLogs.download(
      { start: '2026-06-01T00:00:00Z', end: '2026-06-02T00:00:00Z' },
      { write() {} },
      { signal: controller.signal, maxTransferRetries: 0 },
    );
    setTimeout(() => controller.abort(), 0);

    await expect(download).rejects.toBeInstanceOf(APIUserAbortError);
  });

  test('rejects a cursor cycle before writing duplicate data', async () => {
    let attempts = 0;
    const client = new Kernel({
      apiKey: 'test',
      baseURL: 'https://api.example',
      fetch: async () => {
        attempts += 1;
        if (attempts === 1) return chunkResponse('first', 1, true, 'a');
        if (attempts === 2) return chunkResponse('second', 1, true, 'b');
        return chunkResponse('duplicate', 1, true, 'a');
      },
    });
    const chunks: Uint8Array[] = [];

    await expect(
      client.auditLogs.download(
        { start: '2026-06-01T00:00:00Z', end: '2026-06-02T00:00:00Z' },
        { write: (chunk) => void chunks.push(chunk) },
      ),
    ).rejects.toThrow('response repeated X-Next-Cursor header');
    expect(Buffer.concat(chunks).toString()).toBe('firstsecond');
  });
});
