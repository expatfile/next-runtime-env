import { getBrowserEnvScript } from './get-browser-env-script';

describe('getBrowserEnvScript()', () => {
  it('should return a empty env', () => {
    expect(getBrowserEnvScript({})).toEqual('window.__ENV = {};');
  });

  it('should return an env with a value', () => {
    expect(
      getBrowserEnvScript({
        NEXT_PUBLIC_FOO: 'foo',
      }),
    ).toEqual('window.__ENV = {"NEXT_PUBLIC_FOO":"foo"};');
  });

  it('should return an env with multiple values', () => {
    expect(
      getBrowserEnvScript({
        NEXT_PUBLIC_FOO: 'foo',
        NEXT_PUBLIC_BAR: 'bar',
        NEXT_PUBLIC_BAZ: 'baz',
      }),
    ).toEqual(
      'window.__ENV = {"NEXT_PUBLIC_FOO":"foo","NEXT_PUBLIC_BAR":"bar","NEXT_PUBLIC_BAZ":"baz"};',
    );
  });
});
