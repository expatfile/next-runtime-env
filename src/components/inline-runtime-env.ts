import React from 'react';

import { getPublicEnv } from '../helpers/get-public-env';

export const InlineRuntimeEnv = React.createElement('script', {
  dangerouslySetInnerHTML: {
    __html: `window.__ENV = ${JSON.stringify(getPublicEnv())};`,
  },
});
