import { isBrowser } from './utils/is-browser';

/**
 * Reads an environment variable from the server or the browser.
 */
export function env(key: string) {
  if (isBrowser()) {
    // eslint-disable-next-line no-underscore-dangle
    return window.__ENV[key];
  }

  return process.env[key];
}
