import { unstable_noStore as noStore } from 'next/cache';
import { ReactNode } from 'react';

import { EnvProvider } from './env-provider';
import { getPublicEnv } from './helpers/get-public-env';

interface PublicEnvProviderProps {
  children: ReactNode;
}

export const PublicEnvProvider = ({ children }: PublicEnvProviderProps) => {
  noStore(); // Opt into dynamic rendering

  // This value will be evaluated at runtime
  const publicEnv = getPublicEnv();

  return <EnvProvider env={publicEnv}>{children}</EnvProvider>;
};
