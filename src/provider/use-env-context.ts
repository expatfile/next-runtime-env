'use client';

import { useContext } from 'react';

import { EnvContext } from './env-context';

/**
 * Returns the environment variables from the context.
 *
 * Usage:
 * ```ts
 * const { NODE_ENV, API_URL } = useEnvContext();
 * ```
 */
export const useEnvContext = () => {
  const context = useContext(EnvContext);

  if (!context) {
    throw new Error(
      'useEnvContext must be used within a EnvProvider or PublicEnvProvider',
    );
  }

  return context;
};
