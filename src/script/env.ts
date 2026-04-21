import { isBrowser } from '../helpers/is-browser';
import { PUBLIC_ENV_KEY } from './constants';

/**
 * Client Component version: only allows NEXT_PUBLIC_* variables.
 * This runs both in the browser and during SSR of client components.
 * Blocking non-public vars prevents secrets from leaking into HTML.
 */
export function env(key: string): string | undefined {
  if (!key.startsWith('NEXT_PUBLIC_')) {
    throw new Error(
      `Environment variable '${key}' is not public and cannot be accessed from a Client Component. ` +
      `Use process.env['${key}'] directly in a Server Component instead.`,
    );
  }

  if (isBrowser()) {
    return window[PUBLIC_ENV_KEY][key];
  }

  return process.env[key];
}
