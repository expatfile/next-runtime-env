import * as log from './output/log';

function prefixKey(key: string) {
  // Check if the key already is already public.
  if (/^NEXT_PUBLIC_/i.test(key)) {
    log.warn(`Prefix environment variable '${key}' is already public.`);
  }

  log.info(`Prefix environment variable '${key}'.`);

  const prefixedKey = `NEXT_PUBLIC_${key}`;

  process.env[prefixedKey] = process.env[key];
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
