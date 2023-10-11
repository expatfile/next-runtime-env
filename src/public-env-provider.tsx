import { ReactNode } from 'react';

import { EnvProvider } from './env-provider';
import { getPublicEnv } from './helpers/get-public-env';

interface PublicEnvProviderProps {
  children: ReactNode;
}

export const PublicEnvProvider = ({ children }: PublicEnvProviderProps) => {
  const publicEnv = getPublicEnv();

  return <EnvProvider env={publicEnv}>{children}</EnvProvider>;
};
