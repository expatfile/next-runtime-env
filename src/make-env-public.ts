import * as log from './utils/log';

function prefixKey(key: string) {
  // Check if the key already is already public.
  if (/^NEXT_PUBLIC_/i.test(key)) {
    log.warn(`Environment variable '${key}' is already public.`);
  }

  const prefixedKey = `NEXT_PUBLIC_${key}`;

  process.env[prefixedKey] = process.env[key];

  log.info(`Prefixed environment variable '${key}'.`);
}

/**
 * Make a private environment variable public, so that it can be accessed in the
 * browser.
 *
 * Usage:
 * ```ts
 * // Make a single variable public.
 * makeEnvPublic('FOO');
 *
 * // Make multiple variables public.
 * makeEnvPublic(['FOO', 'BAR', 'BAZ']);
 * ```
 */
export function makeEnvPublic(key: string | string[]): void {
  if (typeof key === 'string') {
    prefixKey(key);
  } else {
    key.forEach(prefixKey);
  }
}
