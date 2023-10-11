'use client';

import { ReactNode } from 'react';

import { EnvContext } from './env-context';
import { type ProcessEnv } from './typings/process-env';

interface EnvProviderProps {
  children: ReactNode;
  env: ProcessEnv;
}

export const EnvProvider = ({ children, env }: EnvProviderProps) => {
  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
};
