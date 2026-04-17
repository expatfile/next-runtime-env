import { env } from './env';

describe('env() client version', () => {
  afterEach(() => {
    delete process.env.FOO;
    delete process.env.NEXT_PUBLIC_FOO;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.window = undefined as any;
  });

  it('should return a public var from the server (SSR)', () => {
    process.env.NEXT_PUBLIC_FOO = 'foo';

    expect(env('NEXT_PUBLIC_FOO')).toEqual('foo');
  });

  it('should return a public var from the browser', () => {
    Object.defineProperty(global, 'window', {
      value: {
        __ENV: {
          NEXT_PUBLIC_FOO: 'foo',
        },
      },
      writable: true,
    });

    expect(env('NEXT_PUBLIC_FOO')).toEqual('foo');
  });

  it('should throw for non-public var on the server (SSR)', () => {
    process.env.FOO = 'secret';

    expect(() => env('FOO')).toThrow(
      /not public and cannot be accessed from a Client Component/,
    );
  });

  it('should throw for non-public var in the browser', () => {
    Object.defineProperty(global, 'window', {
      value: {
        __ENV: {},
      },
      writable: true,
    });

    expect(() => env('FOO')).toThrow(
      /not public and cannot be accessed from a Client Component/,
    );
  });

  it('should return undefined when public var does not exist on the server', () => {
    expect(env('NEXT_PUBLIC_MISSING')).toEqual(undefined);
  });

  it('should return undefined when public var does not exist in the browser', () => {
    Object.defineProperty(global, 'window', {
      value: {
        __ENV: {
          NEXT_PUBLIC_FOO: 'foo',
        },
      },
      writable: true,
    });

    expect(env('NEXT_PUBLIC_BAR')).toEqual(undefined);
  });
});
