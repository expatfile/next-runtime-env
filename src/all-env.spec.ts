import { allEnv } from './all-env';

describe('allEnv()', () => {
  afterEach(() => {
    delete process.env.FOO;
    delete process.env.NEXT_PUBLIC_BAR;
    delete process.env.NEXT_PUBLIC_BAZ;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.window = undefined as any;
  });

  it('should return all values from the server', () => {
    process.env.FOO = 'foo';
    process.env.NEXT_PUBLIC_BAR = 'bar';
    process.env.NEXT_PUBLIC_BAZ = 'baz';

    expect(allEnv()).toBe({
      FOO: 'foo',
      NEXT_PUBLIC_BAR: 'bar',
      NEXT_PUBLIC_BAZ: 'baz',
    });
  });

  it('should return all values from the browser', () => {
    Object.defineProperty(global, 'window', {
      value: {
        __ENV: {
          NEXT_PUBLIC_BAR: 'bar',
          NEXT_PUBLIC_BAZ: 'baz',
        },
      },
      writable: true,
    });

    expect(allEnv()).toBe({
      NEXT_PUBLIC_BAR: 'bar',
      NEXT_PUBLIC_BAZ: 'baz',
    });
  });
});
