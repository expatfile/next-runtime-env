// XXX: Blocked by https://github.com/vercel/next.js/pull/58129
// import { headers } from 'next/headers';
import Script, { ScriptProps } from 'next/script';
import { type FC } from 'react';

import { type NonceConfig } from '../typings/nonce';
import { type ProcessEnv } from '../typings/process-env';
import { PUBLIC_ENV_KEY } from './constants';

type EnvScriptProps = {
  env: ProcessEnv;
  nonce?: string | NonceConfig;
  withNextScriptComponent?: boolean;
  nextScriptComponentProps?: ScriptProps;
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
export const EnvScript: FC<EnvScriptProps> = ({
  env,
  nonce,
  withNextScriptComponent = true,
  nextScriptComponentProps = { strategy: 'beforeInteractive' },
}) => {
  let nonceString: string | undefined;

  // XXX: Blocked by https://github.com/vercel/next.js/pull/58129
  // if (typeof nonce === 'object' && nonce !== null) {
  //   // It's strongly recommended to set a nonce on your script tags.
  //   nonceString = headers().get(nonce.headerKey) ?? undefined;
  // }

  if (typeof nonce === 'string') {
    nonceString = nonce;
  }

  const html = {
    __html: `window['${PUBLIC_ENV_KEY}'] = ${JSON.stringify(env)}`,
  };

  // You can opt to use a regular "<script>" tag instead of Next.js' Script Component.
  // Note: When using Sentry, sentry.client.config.ts might run after the Next.js <Script> component, even when the strategy is "beforeInteractive"
  // This results in the runtime environments being undefined and the Sentry client config initialized without the correct configuration.
  if (!withNextScriptComponent) {
    return <script nonce={nonceString} dangerouslySetInnerHTML={html} />;
  }

  // Use Next.js Script Component by default
  return (
    <Script
      {...nextScriptComponentProps}
      nonce={nonceString}
      dangerouslySetInnerHTML={html}
    />
  );
};
