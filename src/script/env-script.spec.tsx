import '@testing-library/jest-dom';

import { render } from '@testing-library/react';

import { EnvScript } from './env-script';

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

describe('EnvScript', () => {
  it('should set the env in the script', () => {
    const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' };

    render(<EnvScript env={env} />);

    expect(document.querySelector('script')?.textContent).toBe(
      `window['__ENV'] = ${JSON.stringify(env)}`,
    );
  });

  it("should set a nonce when it's available", () => {
    const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' };
    const nonce = 'test-nonce-xyz';

    render(<EnvScript env={env} nonce={nonce} />);

    expect(document.querySelector('script')).toHaveAttribute('nonce', nonce);
  });

  it("should not set a nonce when it's not available", () => {
    const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' };

    render(<EnvScript env={env} />);

    expect(document.querySelector('script')).not.toHaveAttribute('nonce');
  });

  it('should accept Next.js Script tag props', () => {
    const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' };
    const nonce = 'test-nonce-xyz';
    const id = 'text-id-abc';

    render(
      <EnvScript
        env={env}
        nonce={nonce}
        nextScriptProps={{
          strategy: 'afterInteractive',
          id,
        }}
      />,
    );

    expect(document.querySelector('script')).toHaveAttribute('nonce', nonce);
    expect(document.querySelector('script')).toHaveAttribute('id', id);
    expect(document.querySelector('script')?.textContent).toBe(
      `window['__ENV'] = ${JSON.stringify(env)}`,
    );
  });

  it('should not have Next.js Script props when a regular script tag is used', () => {
    const env = { NODE_ENV: 'test', API_URL: 'http://localhost:3000' };
    const id = 'text-id-abc';

    render(
      <EnvScript
        env={env}
        disableNextScript
        nextScriptProps={{
          id,
        }}
      />,
    );

    expect(document.querySelector('script')).not.toHaveAttribute('id', id);
  });

  it.todo(
    'should get the nonce from the headers when the headerKey is provided',
  );
});
