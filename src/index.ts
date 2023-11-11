/* istanbul ignore file */

// This allows TypeScript to detect our global value.
declare global {
  interface Window {
    __ENV: NodeJS.ProcessEnv;
  }
}

export * from './provider';
export * from './script';
export { makeEnvPublic } from './utils/make-env-public';
