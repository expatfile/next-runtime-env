import { type ProcessEnv } from '../typings';

export function getBrowserEnvScript(env: ProcessEnv) {
  return `window.__ENV = ${JSON.stringify(env)};`;
}
