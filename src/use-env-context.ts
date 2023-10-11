'use client';

import { useContext } from 'react';

import { EnvContext } from './env-context';

export const useEnvContext = () => useContext(EnvContext);
