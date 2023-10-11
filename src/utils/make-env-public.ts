import { event, warn } from '../helpers/log';

function prefixKey(key: string) {
  // Check if key is available in process.env.
  if (!process.env[key]) {
    warn(
      `Skipped prefixing environment variable '${key}'. Variable not in process.env`,
    );

    return;
  }

  // Check if key is already public.
  if (/^NEXT_PUBLIC_/i.test(key)) {
    warn(`Environment variable '${key}' is already public`);
  }

  const prefixedKey = `NEXT_PUBLIC_${key}`;

  process.env[prefixedKey] = process.env[key];

  // eslint-disable-next-line no-console
  event(`Prefixed environment variable '${key}'`);
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
