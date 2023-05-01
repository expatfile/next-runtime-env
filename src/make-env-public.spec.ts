import chalk from 'chalk';

import { makeEnvPublic } from './make-env-public';

const warnSpy = jest.spyOn(console, 'warn');
const infoSpy = jest.spyOn(console, 'info');

beforeAll(() => {
  warnSpy.mockImplementation();
  infoSpy.mockImplementation();
});

afterAll(() => {
  warnSpy.mockRestore();
  infoSpy.mockRestore();
});

describe('makeEnvPublic()', () => {
  afterEach(() => {
    delete process.env.FOO;
    delete process.env.BAR;
    delete process.env.BAZ;
    delete process.env.NEXT_PUBLIC_FOO;
    delete process.env.NEXT_PUBLIC_BAR;
    delete process.env.NEXT_PUBLIC_BAZ;
  });

  it('should prefix an env var with NEXT_PUBLIC_', () => {
    process.env.FOO = 'foo';

    makeEnvPublic('FOO');

    expect(infoSpy).toHaveBeenCalledWith(
      `${chalk.cyan(
        `info`
      )}  - [next-runtime-env] - Prefix environment variable 'FOO'.`
    );

    expect(process.env.FOO).toEqual('foo');
    expect(process.env.NEXT_PUBLIC_FOO).toEqual('foo');
  });

  it('should prefix multiple env vars with NEXT_PUBLIC_', () => {
    process.env.FOO = 'foo';
    process.env.BAR = 'bar';
    process.env.BAZ = 'baz';

    makeEnvPublic(['FOO', 'BAR', 'BAZ']);

    expect(process.env.FOO).toEqual('foo');
    expect(process.env.NEXT_PUBLIC_FOO).toEqual('foo');
    expect(process.env.BAR).toEqual('bar');
    expect(process.env.NEXT_PUBLIC_BAR).toEqual('bar');
    expect(process.env.BAZ).toEqual('baz');
    expect(process.env.NEXT_PUBLIC_BAZ).toEqual('baz');
  });

  it('should warn when the env var already starts with NEXT_PUBLIC_', () => {
    process.env.NEXT_PUBLIC_FOO = 'foo';

    makeEnvPublic('NEXT_PUBLIC_FOO');

    expect(warnSpy).toHaveBeenCalledWith(
      `${chalk.yellow(
        `warn`
      )}  - [next-runtime-env] - Prefix environment variable 'NEXT_PUBLIC_FOO' is already public.`
    );
  });
});
