import '@testing-library/jest-dom';

import { render } from '@testing-library/react';

import { ProcessEnv } from '../typings/process-env';
import { EnvProvider } from './env-provider';
import { useEnvContext } from './use-env-context';

const errorSpy = jest.spyOn(console, 'error');

let processEnv: NodeJS.ProcessEnv;

beforeAll(() => {
  errorSpy.mockImplementation();

  processEnv = process.env;
});

afterAll(() => {
  errorSpy.mockRestore();

  process.env = processEnv;
});

describe('useEnvContext', () => {
  beforeEach(() => {
    process.env = {};
  });

  it('should retrieve env vars from the context', () => {
    const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' };

    let contextEnv: ProcessEnv = {};

    const SomeClientComponent = () => {
      contextEnv = useEnvContext();

      return (
        <>
          <p>NODE_ENV: {contextEnv.NODE_ENV}</p>
          <p>API_URL: {contextEnv.API_URL}</p>
        </>
      );
    };

    render(
      <EnvProvider env={env}>
        <SomeClientComponent />
      </EnvProvider>,
    );

    expect(contextEnv).toEqual(env);
  });

  it('should throw when used outside of provider', () => {
    const SomeClientComponent = () => {
      const { NODE_ENV, API_URL } = useEnvContext();

      return (
        <>
          <p>NODE_ENV: {NODE_ENV}</p>
          <p>API_URL: {API_URL}</p>
        </>
      );
    };

    expect(() => render(<SomeClientComponent />)).toThrow(
      'useEnvContext must be used within a EnvProvider or PublicEnvProvider',
    );
  });
});
