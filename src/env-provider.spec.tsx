import '@testing-library/jest-dom';

import { render } from '@testing-library/react';

import { EnvProvider } from './env-provider';
import { useEnvContext } from './use-env-context';

let processEnv: NodeJS.ProcessEnv;

beforeAll(() => {
  processEnv = process.env;
});

afterAll(() => {
  process.env = processEnv;
});

describe('EnvProvider', () => {
  beforeEach(() => {
    process.env = {};
  });

  it("should make the env available to it's children", () => {
    const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' };

    const SomeClientComponent = () => {
      const { NODE_ENV, API_URL } = useEnvContext();

      return (
        <>
          <p>NODE_ENV: {NODE_ENV}</p>
          <p>API_URL: {API_URL}</p>
        </>
      );
    };

    const { getByText } = render(
      <EnvProvider env={env}>
        <SomeClientComponent />
      </EnvProvider>,
    );

    expect(getByText(/^NODE_ENV:/).textContent).toBe('NODE_ENV: test');
    expect(getByText(/^API_URL:/).textContent).toBe(
      'API_URL: http://localhost:3000',
    );
  });
});
