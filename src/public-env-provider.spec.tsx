import '@testing-library/jest-dom';

import { render } from '@testing-library/react';

import { PublicEnvProvider } from './public-env-provider';
import { useEnvContext } from './use-env-context';

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

  it("should make the public env available to it's children", () => {
    process.env = {
      NEXT_PUBLIC_FOO: 'foo-value',
    };

    const SomeClientComponent = () => {
      const { NEXT_PUBLIC_FOO } = useEnvContext();

      return (
        <>
          <p>NEXT_PUBLIC_FOO: {NEXT_PUBLIC_FOO}</p>
        </>
      );
    };

    const { getByText } = render(
      <PublicEnvProvider>
        <SomeClientComponent />
      </PublicEnvProvider>,
    );

    expect(getByText(/^NEXT_PUBLIC_FOO:/).textContent).toBe(
      'NEXT_PUBLIC_FOO: foo-value',
    );
  });

  it("should not make private env available to it's children", () => {
    process.env = {
      BAR: 'bar-value',
    };

    const SomeClientComponent = () => {
      const { BAR } = useEnvContext();

      return (
        <>
          <p>BAR: {BAR}</p>
        </>
      );
    };

    const { getByText } = render(
      <PublicEnvProvider>
        <SomeClientComponent />
      </PublicEnvProvider>,
    );

    expect(getByText(/^BAR:/).textContent).toBe('BAR: ');
  });

  it("should only make public env available to it's children ", () => {
    process.env = {
      NEXT_PUBLIC_FOO: 'foo-value',
      BAR: 'bar-value',
    };

    const SomeClientComponent = () => {
      const { NEXT_PUBLIC_FOO, BAR } = useEnvContext();

      return (
        <>
          <p>NEXT_PUBLIC_FOO: {NEXT_PUBLIC_FOO}</p>
          <p>BAR: {BAR}</p>
        </>
      );
    };

    const { getByText } = render(
      <PublicEnvProvider>
        <SomeClientComponent />
      </PublicEnvProvider>,
    );

    expect(getByText(/^NEXT_PUBLIC_FOO:/).textContent).toBe(
      'NEXT_PUBLIC_FOO: foo-value',
    );
    expect(getByText(/^BAR:/).textContent).toBe('BAR: ');
  });
});
