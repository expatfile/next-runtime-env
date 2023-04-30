// This allows TypeScript to detect our global value.
declare global {
  interface Window {
    __ENV: NodeJS.ProcessEnv;
  }
}

export { configureRuntimeEnv } from './configure-runtime-env';
export { env } from './env';
