import { env } from './env.server';

jest.mock('next/cache', () => ({
  unstable_noStore: jest.fn(),
}));

describe('env() server version', () => {
  afterEach(() => {
    delete process.env.FOO;
    delete process.env.NEXT_PUBLIC_BAR;
  });

  it('should return any env var', () => {
    process.env.FOO = 'secret';

    expect(env('FOO')).toEqual('secret');
  });

  it('should return public env vars too', () => {
    process.env.NEXT_PUBLIC_BAR = 'public';

    expect(env('NEXT_PUBLIC_BAR')).toEqual('public');
  });

  it('should return undefined for missing vars', () => {
    expect(env('DOES_NOT_EXIST')).toEqual(undefined);
  });
});
