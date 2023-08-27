import TestRenderer from 'react-test-renderer';

import { getPublicEnv } from '../helpers/get-public-env';
import { InlineRuntimeEnv } from './inline-env';

jest.mock('../helpers/get-public-env', () => ({
  getPublicEnv: jest.fn().mockReturnValue({
    NEXT_PUBLIC_FOO: 'foo',
    NEXT_PUBLIC_BAZ: 'baz',
  }),
}));

describe('InlineRuntimeEnv', () => {
  it('renders a script tag with the env variables', () => {
    const renderer = TestRenderer.create(InlineRuntimeEnv);

    expect(renderer.root.findByType('script').props).toEqual({
      dangerouslySetInnerHTML: {
        __html:
          'window.__ENV = {"NEXT_PUBLIC_FOO":"foo","NEXT_PUBLIC_BAZ":"baz"};',
      },
    });

    expect(getPublicEnv).toBeCalledTimes(1);
  });
});
