import http from 'http';
import { AddressInfo } from 'net';
import Kernel, { toFile } from '@onkernel/sdk';
// @ts-ignore
import Busboy from 'busboy';

/**
 * Parse a multipart request and extract array-of-object fields using standard
 * indexed notation. Supports:
 *   files[0][dest_path]   (bracket-bracket)
 *   files[0].dest_path    (bracket-dot — not typical from FormData but included)
 *
 * Returns parsed entries or throws if field names are not in an indexed format.
 */
function parseMultipartArrayFields(
  prefix: string,
  fields: { name: string; value: string }[],
  files: { name: string; buffer: Buffer }[],
): Map<number, Record<string, string | Buffer>> {
  const items = new Map<number, Record<string, string | Buffer>>();

  const parse = (name: string): { index: number; field: string } | null => {
    if (!name.startsWith(prefix)) return null;
    const rest = name.slice(prefix.length);

    // bracket notation: [0][field] or [0].field
    const bracketMatch = rest.match(/^\[(\d+)\][\[.]?([^\]]*)\]?$/);
    if (bracketMatch) {
      return { index: parseInt(bracketMatch[1]!, 10), field: bracketMatch[2]! };
    }

    return null;
  };

  for (const { name, value } of fields) {
    const parsed = parse(name);
    if (!parsed) {
      throw new Error(`Cannot parse field name "${name}": expected indexed format like ${prefix}[0][field]`);
    }
    if (!items.has(parsed.index)) items.set(parsed.index, {});
    items.get(parsed.index)![parsed.field] = value;
  }

  for (const { name, buffer } of files) {
    const parsed = parse(name);
    if (!parsed) {
      throw new Error(
        `Cannot parse file field name "${name}": expected indexed format like ${prefix}[0][field]`,
      );
    }
    if (!items.has(parsed.index)) items.set(parsed.index, {});
    items.get(parsed.index)![parsed.field] = buffer;
  }

  return items;
}

/**
 * Create a test HTTP server that captures the raw multipart form data from
 * incoming requests. Returns the server and a function to retrieve captured data.
 */
function createCaptureServer(): {
  server: http.Server;
  getCapture: () => Promise<{
    fields: { name: string; value: string }[];
    files: { name: string; buffer: Buffer }[];
  }>;
  resetCapture: () => void;
} {
  let captureResolve: (val: any) => void;
  let capturePromise = new Promise<any>((r) => (captureResolve = r));

  const server = http.createServer((req, res) => {
    // All non-multipart requests get a simple 200 with empty JSON
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{}');
      return;
    }

    const fields: { name: string; value: string }[] = [];
    const files: { name: string; buffer: Buffer }[] = [];

    const busboy = Busboy({ headers: req.headers });

    busboy.on('field', (name: string, value: string) => {
      fields.push({ name, value });
    });

    busboy.on('file', (name: string, stream: NodeJS.ReadableStream) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => {
        files.push({ name, buffer: Buffer.concat(chunks) });
      });
    });

    busboy.on('finish', () => {
      captureResolve({ fields, files });
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end('{}');
    });

    req.pipe(busboy);
  });

  return {
    server,
    getCapture: () => capturePromise,
    resetCapture: () => {
      capturePromise = new Promise<any>((r) => (captureResolve = r));
    },
  };
}

function startServer(server: http.Server): Promise<string> {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as AddressInfo;
      resolve(`http://127.0.0.1:${addr.port}`);
    });
  });
}

function stopServer(server: http.Server): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

// Busboy is a standard multipart parser — install check
let hasBusboy = false;
try {
  require.resolve('busboy');
  hasBusboy = true;
} catch {}

const describeIfBusboy = hasBusboy ? describe : describe.skip;

describeIfBusboy('multipart array encoding', () => {
  let server: http.Server;
  let baseURL: string;
  let getCapture: () => Promise<any>;
  let resetCapture: () => void;

  beforeAll(async () => {
    const s = createCaptureServer();
    server = s.server;
    getCapture = s.getCapture;
    resetCapture = s.resetCapture;
    baseURL = await startServer(server);
  });

  afterAll(async () => {
    await stopServer(server);
  });

  /**
   * Test that fs.upload produces field names with numeric array indices.
   *
   * The SDK's addFormValue uses `key + '[]'` for arrays, which produces
   * field names like `files[][dest_path]` and `files[][file]` — bracket
   * notation without indices. Without indices, a server cannot pair file
   * contents with their destination paths.
   */
  describe('fs.upload', () => {
    test('single file should use indexed field names', async () => {
      resetCapture();
      const client = new Kernel({ apiKey: 'test-key', baseURL });

      await client.browsers.fs.upload('sess-1', {
        files: [
          {
            dest_path: '/tmp/hello.txt',
            file: await toFile(Buffer.from('hello world'), 'hello.txt'),
          },
        ],
      });

      const { fields, files } = await getCapture();
      const allNames = [...fields.map((f: any) => f.name), ...files.map((f: any) => f.name)];

      // Every field should have a numeric index in brackets
      for (const name of allNames) {
        expect(name).toMatch(/^files\[\d+\]/);
      }

      // Parse and verify content
      const parsed = parseMultipartArrayFields('files', fields, files);
      expect(parsed.size).toBe(1);
      expect(parsed.get(0)!['dest_path']).toBe('/tmp/hello.txt');
      expect(Buffer.from(parsed.get(0)!['file'] as Buffer).toString()).toBe('hello world');
    });

    test('multiple files should use distinct indexed field names', async () => {
      resetCapture();
      const client = new Kernel({ apiKey: 'test-key', baseURL });

      await client.browsers.fs.upload('sess-1', {
        files: [
          {
            dest_path: '/tmp/a.txt',
            file: await toFile(Buffer.from('aaa'), 'a.txt'),
          },
          {
            dest_path: '/tmp/b.txt',
            file: await toFile(Buffer.from('bbb'), 'b.txt'),
          },
          {
            dest_path: '/tmp/c.txt',
            file: await toFile(Buffer.from('ccc'), 'c.txt'),
          },
        ],
      });

      const { fields, files } = await getCapture();
      const allNames = [...fields.map((f: any) => f.name), ...files.map((f: any) => f.name)];

      // Every field should have a numeric index
      for (const name of allNames) {
        expect(name).toMatch(/^files\[\d+\]/);
      }

      // Parse and verify each file is distinguishable
      const parsed = parseMultipartArrayFields('files', fields, files);
      expect(parsed.size).toBe(3);

      expect(parsed.get(0)!['dest_path']).toBe('/tmp/a.txt');
      expect(Buffer.from(parsed.get(0)!['file'] as Buffer).toString()).toBe('aaa');

      expect(parsed.get(1)!['dest_path']).toBe('/tmp/b.txt');
      expect(Buffer.from(parsed.get(1)!['file'] as Buffer).toString()).toBe('bbb');

      expect(parsed.get(2)!['dest_path']).toBe('/tmp/c.txt');
      expect(Buffer.from(parsed.get(2)!['file'] as Buffer).toString()).toBe('ccc');
    });

    test('field names should contain array indices (direct inspection)', async () => {
      resetCapture();
      const client = new Kernel({ apiKey: 'test-key', baseURL });

      await client.browsers.fs.upload('sess-1', {
        files: [
          {
            dest_path: '/tmp/a.txt',
            file: await toFile(Buffer.from('aaa'), 'a.txt'),
          },
          {
            dest_path: '/tmp/b.txt',
            file: await toFile(Buffer.from('bbb'), 'b.txt'),
          },
        ],
      });

      const { fields, files } = await getCapture();
      const allNames = [...fields.map((f: any) => f.name), ...files.map((f: any) => f.name)];

      // Should NOT have empty brackets (the current bug produces files[][dest_path])
      for (const name of allNames) {
        expect(name).not.toMatch(/\[\]/);
      }

      // Should have indices like files[0], files[1]
      const indices = new Set(
        allNames.map((n: string) => {
          const m = n.match(/^files\[(\d+)\]/);
          return m ? parseInt(m[1]!, 10) : -1;
        }),
      );
      expect(indices).toContain(0);
      expect(indices).toContain(1);
      expect(indices).not.toContain(-1);
    });
  });

  /**
   * Test that loadExtensions produces field names with numeric array indices.
   */
  describe('browsers.loadExtensions', () => {
    test('multiple extensions should use indexed field names', async () => {
      resetCapture();
      const client = new Kernel({ apiKey: 'test-key', baseURL });

      await client.browsers.loadExtensions('sess-1', {
        extensions: [
          {
            name: 'ext-a',
            zip_file: await toFile(Buffer.from('zip-a-data'), 'ext-a.zip'),
          },
          {
            name: 'ext-b',
            zip_file: await toFile(Buffer.from('zip-b-data'), 'ext-b.zip'),
          },
        ],
      });

      const { fields, files } = await getCapture();
      const allNames = [...fields.map((f: any) => f.name), ...files.map((f: any) => f.name)];

      for (const name of allNames) {
        expect(name).toMatch(/^extensions\[\d+\]/);
      }

      const parsed = parseMultipartArrayFields('extensions', fields, files);
      expect(parsed.size).toBe(2);

      expect(parsed.get(0)!['name']).toBe('ext-a');
      expect(Buffer.from(parsed.get(0)!['zip_file'] as Buffer).toString()).toBe('zip-a-data');

      expect(parsed.get(1)!['name']).toBe('ext-b');
      expect(Buffer.from(parsed.get(1)!['zip_file'] as Buffer).toString()).toBe('zip-b-data');
    });
  });
});
