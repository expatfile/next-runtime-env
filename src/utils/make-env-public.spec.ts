import { makeEnvPublic } from './make-env-public';

const warnMock = jest.fn();
const eventMock = jest.fn();

jest.mock('../helpers/log', () => ({
  warn: (...args: unknown[]) => warnMock(...args),
  event: (...args: unknown[]) => eventMock(...args),
}));

describe('makeEnvPublic()', () => {
  afterEach(() => {
    jest.clearAllMocks();

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

  it('should show an info message when env vars are prefixed', () => {
    process.env.FOO = 'foo';
    process.env.BAR = 'bar';
    process.env.BAZ = 'baz';

    makeEnvPublic('FOO');
    makeEnvPublic(['BAR', 'BAZ']);

    expect(eventMock).toHaveBeenCalledWith(
      `Prefixed environment variable 'FOO'`,
    );

    expect(eventMock).toHaveBeenCalledWith(
      `Prefixed environment variable 'BAR'`,
    );

    expect(eventMock).toHaveBeenCalledWith(
      `Prefixed environment variable 'BAZ'`,
    );
  });

  it('should warn when prefixing a variable that is not available in process.env', () => {
    makeEnvPublic('FOO');

    expect(warnMock).toHaveBeenCalledWith(
      `Skipped prefixing environment variable 'FOO'. Variable not in process.env`,
    );
  });

  it('should warn when the env var already starts with NEXT_PUBLIC_', () => {
    process.env.NEXT_PUBLIC_FOO = 'foo';

    makeEnvPublic('NEXT_PUBLIC_FOO');

    expect(warnMock).toHaveBeenCalledWith(
      `Environment variable 'NEXT_PUBLIC_FOO' is already public`,
    );
  });
});
