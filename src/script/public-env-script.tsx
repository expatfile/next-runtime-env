import { unstable_noStore as noStore } from 'next/cache';
import { ScriptProps } from 'next/script';
import { type FC } from 'react';

import { getPublicEnv } from '../helpers/get-public-env';
import { type NonceConfig } from '../typings/nonce';
import { EnvScript } from './env-script';

type PublicEnvScriptProps = {
  nonce?: string | NonceConfig;
  strategy?: ScriptProps['strategy'];
};

/**
 * Sets the public environment variables in the browser. If an nonce is
 * available, it will be set on the script tag.
 *
 * This component is disables Next.js' caching mechanism to ensure that the
 * environment variables are always up-to-date.
 *
 * Usage:
 * ```ts
 * <head>
 *   <PublicEnvScript />
 * </head>
 * ```
 */
export const PublicEnvScript: FC<PublicEnvScriptProps> = ({
  nonce,
  strategy,
}) => {
  noStore(); // Opt into dynamic rendering

  // This value will be evaluated at runtime
  const publicEnv = getPublicEnv();

  return <EnvScript env={publicEnv} nonce={nonce} strategy={strategy} />;
};
