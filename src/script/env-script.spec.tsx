import '@testing-library/jest-dom';

import { render } from '@testing-library/react';

import { EnvScript } from './env-script';

// TODO: mock next/headers

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

  it('should set the env in the script', () => {
    const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' };

    const { getByTestId } = render(<EnvScript env={env} />);

    expect(getByTestId('env-script').textContent).toBe(
      `window['__ENV'] = ${JSON.stringify(env)}`,
    );
  });

  it("should set a nonce when it's available", () => {
    const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' };
    const nonce = 'test-nonce-xyz';

    const { getByTestId } = render(<EnvScript env={env} nonce={nonce} />);

    expect(getByTestId('env-script')).toHaveAttribute('nonce', nonce);
  });

  it("should not set a nonce when it's not available", () => {
    const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' };

    const { getByTestId } = render(<EnvScript env={env} />);

    expect(getByTestId('env-script')).not.toHaveAttribute('nonce');
  });

  it.todo(
    'should get the nonce from the headers when the headerKey is provided',
  );
});
