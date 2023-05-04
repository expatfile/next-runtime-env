import { configureRuntimeEnv } from './configure';
import { getPublicEnv } from './helpers/get-public-env';
import { writeBrowserEnv } from './helpers/write-browser-env';

jest.mock('./helpers/get-public-env', () => ({
  getPublicEnv: jest.fn(() => ({
    NEXT_PUBLIC_FOO: 'foo',
  })),
}));
jest.mock('./helpers/write-browser-env', () => ({
  writeBrowserEnv: jest.fn(),
}));

// See: https://www.bam.tech/article/fix-jest-mock-cannot-access-before-initialization-error
const mockGetPublicEnv = getPublicEnv as jest.MockedFunction<
  typeof getPublicEnv
>;
const mockWriteBrowserEnv = writeBrowserEnv as jest.MockedFunction<
  typeof writeBrowserEnv
>;

afterEach(() => {
  mockGetPublicEnv.mockClear();
  mockWriteBrowserEnv.mockClear();
});

describe('configureRuntimeEnv()', () => {
  it('should call the helper methods', () => {
    configureRuntimeEnv();

    expect(mockGetPublicEnv).toHaveBeenCalledTimes(1);

    expect(mockWriteBrowserEnv).toHaveBeenCalledTimes(1);
    expect(mockWriteBrowserEnv).toHaveBeenCalledWith(
      {
        NEXT_PUBLIC_FOO: 'foo',
      },
      undefined
    );
  });

  it('should call the helper methods with options', () => {
    configureRuntimeEnv({
      subdirectory: 'subdirectory/',
    });

    expect(mockGetPublicEnv).toHaveBeenCalledTimes(1);

    expect(mockWriteBrowserEnv).toHaveBeenCalledTimes(1);
    expect(mockWriteBrowserEnv).toHaveBeenCalledWith(
      {
        NEXT_PUBLIC_FOO: 'foo',
      },
      'subdirectory/'
    );
  });
});
