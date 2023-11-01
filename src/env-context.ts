import { createContext } from 'react';

import { type ProcessEnv } from './typings/process-env';

export const EnvContext = createContext<ProcessEnv>({});
