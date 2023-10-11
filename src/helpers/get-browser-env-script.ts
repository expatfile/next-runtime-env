import { type ProcessEnv } from '../typings/process-env';

export function getBrowserEnvScript(env: ProcessEnv) {
  return `window.__ENV = ${JSON.stringify(env)};`;
}
