import chalk from 'chalk';

import { getPublicEnv } from './get-public-env';

const infoSpy = jest.spyOn(console, 'info');

beforeAll(() => {
  infoSpy.mockImplementation();
});

afterAll(() => {
  infoSpy.mockRestore();
});

describe('getPublicEnv()', () => {
  afterEach(() => {
    delete process.env.FOO;
    delete process.env.BAR;
    delete process.env.BAR;
    delete process.env.NEXT_PUBLIC_FOO;
    delete process.env.NEXT_PUBLIC_BAR;
    delete process.env.NEXT_PUBLIC_BAZ;
  });

  it('should return an allow-listed value', () => {
    process.env.NEXT_PUBLIC_FOO = 'foo';

    expect(getPublicEnv()).toEqual({
      NEXT_PUBLIC_FOO: 'foo',
    });
  });

  it('should return multiple allow-listed values', () => {
    process.env.NEXT_PUBLIC_FOO = 'foo';
    process.env.NEXT_PUBLIC_BAR = 'bar';
    process.env.NEXT_PUBLIC_BAZ = 'baz';

    expect(getPublicEnv()).toEqual({
      NEXT_PUBLIC_FOO: 'foo',
      NEXT_PUBLIC_BAR: 'bar',
      NEXT_PUBLIC_BAZ: 'baz',
    });
  });

  it('should not return a non allow-listed value', () => {
    process.env.FOO = 'foo';

    expect(getPublicEnv()).toEqual({});
  });

  it('should not return multiple non allow-listed values', () => {
    process.env.FOO = 'foo';
    process.env.BAR = 'bar';
    process.env.BAZ = 'baz';

    expect(getPublicEnv()).toEqual({});
  });

  it('should not return a mixed list of allow-listed and non allow-listed values', () => {
    process.env.NEXT_PUBLIC_FOO = 'foo';
    process.env.BAR = 'bar';
    process.env.NEXT_PUBLIC_BAZ = 'baz';

    expect(getPublicEnv()).toEqual({
      NEXT_PUBLIC_FOO: 'foo',
      NEXT_PUBLIC_BAZ: 'baz',
    });
  });

  it('should show an info message after reading the environment', () => {
    getPublicEnv();

    expect(infoSpy).toHaveBeenCalledWith(
      `${chalk.cyan(
        `info`
      )}  - [next-runtime-env] - Read environment variables prefixed with 'NEXT_PUBLIC_' from process.env.`
    );
  });
});
