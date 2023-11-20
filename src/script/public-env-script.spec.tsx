import '@testing-library/jest-dom';

import { render } from '@testing-library/react';

import { PublicEnvScript } from './public-env-script';

// TODO: mock next/headers

let processEnv: NodeJS.ProcessEnv;

beforeAll(() => {
  processEnv = process.env;
});

afterAll(() => {
  process.env = processEnv;
});

describe('PublicEnvProvider', () => {
  beforeEach(() => {
    process.env = {};
  });

  it('should set a public env in the script', () => {
    process.env = {
      NEXT_PUBLIC_FOO: 'foo-value',
    };

    const { getByTestId } = render(<PublicEnvScript />);

    expect(getByTestId('env-script').textContent).toBe(
      `window['__ENV'] = {"NEXT_PUBLIC_FOO":"foo-value"}`,
    );
  });

  it('should not set a private env in the script', () => {
    process.env = {
      BAR: 'bar-value',
    };

    const { getByTestId } = render(<PublicEnvScript />);

    expect(getByTestId('env-script').textContent).toBe(`window['__ENV'] = {}`);
  });

  it('should only set public env in the script', () => {
    process.env = {
      NEXT_PUBLIC_FOO: 'foo-value',
      BAR: 'bar-value',
    };

    const { getByTestId } = render(<PublicEnvScript />);

    expect(getByTestId('env-script').textContent).toBe(
      `window['__ENV'] = {"NEXT_PUBLIC_FOO":"foo-value"}`,
    );
  });

  it("should set a nonce when it's available", () => {
    process.env = {
      NEXT_PUBLIC_FOO: 'foo-value',
      BAR: 'bar-value',
    };
    const nonce = 'test-nonce-xyz';

    const { getByTestId } = render(<PublicEnvScript nonce={nonce} />);

    expect(getByTestId('env-script')).toHaveAttribute('nonce', nonce);
  });

  it("should not set a nonce when it's not available", () => {
    process.env = {
      NEXT_PUBLIC_FOO: 'foo-value',
      BAR: 'bar-value',
    };

    const { getByTestId } = render(<PublicEnvScript />);

    expect(getByTestId('env-script')).not.toHaveAttribute('nonce');
  });
});
