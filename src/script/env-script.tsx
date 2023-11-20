// XXX: Blocked by https://github.com/vercel/next.js/pull/58129
// import { headers } from 'next/headers';
import { type FC } from 'react';

import { type NonceConfig } from '../typings/nonce';
import { type ProcessEnv } from '../typings/process-env';
import { PUBLIC_ENV_KEY } from './constants';

type EnvScriptProps = {
  env: ProcessEnv;
  nonce?: string | NonceConfig;
};

/**
 * Sets the provided environment variables in the browser. If an nonce is
 * available, it will be set on the script tag.
 *
 * Usage:
 * ```ts
 * <head>
 *   <EnvScript env={{ NODE_ENV: 'test', API_URL: 'http://localhost:3000' }} />
 * </head>
 * ```
 */
export const EnvScript: FC<EnvScriptProps> = ({ env, nonce }) => {
  let nonceString: string | undefined;

  // XXX: Blocked by https://github.com/vercel/next.js/pull/58129
  // if (typeof nonce === 'object' && nonce !== null) {
  //   // It's strongly recommended to set a nonce on your script tags.
  //   nonceString = headers().get(nonce.headerKey) ?? undefined;
  // }

  if (typeof nonce === 'string') {
    nonceString = nonce;
  }

  return (
    <script
      data-testid="env-script"
      nonce={nonceString}
      dangerouslySetInnerHTML={{
        __html: `window['${PUBLIC_ENV_KEY}'] = ${JSON.stringify(env)}`,
      }}
    />
  );
};
