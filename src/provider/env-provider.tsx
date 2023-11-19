'use client';

import { type FC, type PropsWithChildren } from 'react';

import { type ProcessEnv } from '../typings/process-env';
import { EnvContext } from './env-context';

type EnvProviderProps = PropsWithChildren<{
  env: ProcessEnv;
}>;

/**
 * Provides the environment variables to the application.
 *
 * Usage:
 * ```ts
 * <EnvProvider env={{ NODE_ENV: 'test', API_URL: 'http://localhost:3000' }}>
 *   <App />
 * </EnvProvider>
 * ```
 */
export const EnvProvider: FC<EnvProviderProps> = ({ children, env }) => {
  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
};
