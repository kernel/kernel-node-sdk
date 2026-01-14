import { multipartFormRequestOptions, createForm } from '@onkernel/sdk/internal/uploads';
import { toFile } from '@onkernel/sdk/core/uploads';

describe('form data validation', () => {
  test('valid values do not error', async () => {
    await multipartFormRequestOptions(
      {
        body: {
          foo: 'foo',
          string: 1,
          bool: true,
          file: await toFile(Buffer.from('some-content')),
          blob: new Blob(['Some content'], { type: 'text/plain' }),
        },
      },
      fetch,
    );
  });

  test('null', async () => {
    await expect(() =>
      multipartFormRequestOptions(
        {
          body: {
            null: null,
          },
        },
        fetch,
      ),
    ).rejects.toThrow(TypeError);
  });

  test('undefined is stripped', async () => {
    const form = await createForm(
      {
        foo: undefined,
        bar: 'baz',
      },
      fetch,
    );
    expect(form.has('foo')).toBe(false);
    expect(form.get('bar')).toBe('baz');
  });

  test('nested undefined property is stripped', async () => {
    const form = await createForm(
      {
        bar: {
          baz: undefined,
        },
      },
      fetch,
    );
    expect(Array.from(form.entries())).toEqual([]);

    const form2 = await createForm(
      {
        bar: {
          foo: 'string',
          baz: undefined,
        },
      },
      fetch,
    );
    // Objects without uploadable values are now serialized as JSON
    expect(Array.from(form2.entries())).toEqual([['bar', '{"foo":"string"}']]);
  });

  test('env_vars are always flattened for backward compatibility', async () => {
    const form = await createForm(
      {
        env_vars: {
          API_KEY: 'secret',
          DEBUG: 'true',
        },
      },
      fetch,
    );
    // env_vars should be flattened, not JSON-serialized
    expect(Array.from(form.entries())).toEqual([
      ['env_vars[API_KEY]', 'secret'],
      ['env_vars[DEBUG]', 'true'],
    ]);
  });

  test('source field is JSON-serialized', async () => {
    const form = await createForm(
      {
        source: {
          type: 'github',
          url: 'https://github.com/user/repo',
          ref: 'main',
          entrypoint: 'app.py',
        },
      },
      fetch,
    );
    // source should be JSON-serialized per OpenAPI spec
    const entries = Array.from(form.entries());
    expect(entries.length).toBe(1);
    expect(entries[0]![0]).toBe('source');
    expect(JSON.parse(entries[0]![1] as string)).toEqual({
      type: 'github',
      url: 'https://github.com/user/repo',
      ref: 'main',
      entrypoint: 'app.py',
    });
  });

  test('nested undefined array item is stripped', async () => {
    const form = await createForm(
      {
        bar: [undefined, undefined],
      },
      fetch,
    );
    expect(Array.from(form.entries())).toEqual([]);

    const form2 = await createForm(
      {
        bar: [undefined, 'foo'],
      },
      fetch,
    );
    expect(Array.from(form2.entries())).toEqual([['bar[]', 'foo']]);
  });
});
