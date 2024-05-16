import '@testing-library/jest-dom';

import { render } from '@testing-library/react';

import { PublicEnvScript } from './public-env-script';

jest.mock('next/script', () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({ children, ...props }: any) => <script {...props}>{children}</script>,
);

beforeEach(() => {
  process.env = {};
});

afterEach(() => {
  process.env = {};
});

describe('PublicEnvScript', () => {
  it('should set a public env in the script', async () => {
    process.env = {
      NEXT_PUBLIC_FOO: 'foo-value',
    };

    render(<PublicEnvScript />);

    expect(document.querySelector('script')?.textContent).toBe(
      `window['__ENV'] = {"NEXT_PUBLIC_FOO":"foo-value"}`,
    );
  });

  it('should not set a private env in the script', () => {
    process.env = {
      NEXT_PUBLIC_FOO: 'foo-value',
      BAR: 'bar-value',
    };

    render(<PublicEnvScript />);

    expect(document.querySelector('script')?.textContent).toBe(
      `window['__ENV'] = {"NEXT_PUBLIC_FOO":"foo-value"}`,
    );
  });

  it('should only set public env in the script', () => {
    process.env = {
      NEXT_PUBLIC_FOO: 'foo-value',
      BAR: 'bar-value',
    };

    render(<PublicEnvScript />);

    expect(document.querySelector('script')?.textContent).toBe(
      `window['__ENV'] = {"NEXT_PUBLIC_FOO":"foo-value"}`,
    );
  });

  it("should set a nonce when it's available", () => {
    process.env = {
      NEXT_PUBLIC_FOO: 'foo-value',
      BAR: 'bar-value',
    };

    render(<PublicEnvScript nonce="test-nonce-xyz" />);

    expect(document.querySelector('script')).toHaveAttribute('nonce');
  });

  it("should not set a nonce when it's not available", () => {
    process.env = {
      NEXT_PUBLIC_FOO: 'foo-value',
      BAR: 'bar-value',
    };

    render(<PublicEnvScript />);

    expect(document.querySelector('script')).not.toHaveAttribute('nonce');
  });
});
