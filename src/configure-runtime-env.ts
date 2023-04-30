import { getPublicEnv } from './helpers/get-public-env';
import { writeBrowserEnv } from './helpers/write-browser-env';

/**
 * Reads all environment variables that start with `NEXT_PUBLIC_` and writes
 * them to the public `__ENV.js` file. This makes them accessible under the
 * `window.__ENV` object.
 */
export function configureRuntimeEnv() {
  const publicEnv = getPublicEnv();

  writeBrowserEnv(publicEnv);
}
