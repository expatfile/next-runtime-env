import { makeEnvPublic } from './make-env-public';

describe('makeEnvPublic()', () => {
  afterEach(() => {
    delete process.env.FOO;
    delete process.env.NEXT_PUBLIC_FOO;
  });

  it('should prefix an env var with NEXT_PUBLIC_', () => {
    process.env.FOO = 'foo';

    makeEnvPublic('FOO');

    expect(process.env.FOO).toBeDefined();
    expect(process.env.NEXT_PUBLIC_FOO).toBeDefined();
  });

  it('should copy the value to the new NEXT_PUBLIC_ env var', () => {
    process.env.FOO = 'foo';

    makeEnvPublic('FOO');

    expect(process.env.FOO).toEqual('foo');
    expect(process.env.NEXT_PUBLIC_FOO).toEqual('foo');
  });

  it('should throw when the env var already starts with NEXT_PUBLIC_', () => {
    process.env.NEXT_PUBLIC_FOO = 'foo';

    expect(() => {
      makeEnvPublic('NEXT_PUBLIC_FOO');
    }).toThrowError(
      'The environment variable "NEXT_PUBLIC_FOO" is already public.'
    );
  });
});
