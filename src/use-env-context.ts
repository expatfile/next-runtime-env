'use client';

import { useContext } from 'react';

import { EnvContext } from './env-context';

export const useEnvContext = () => {
  const context = useContext(EnvContext);

  if (!context) {
    throw new Error(
      'useEnvContext must be used within a EnvProvider or PublicEnvProvider',
    );
  }

  return context;
};
