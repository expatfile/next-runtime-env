import { event, LogOptions, warn } from '../helpers/log';

export interface MakeEnvPublicOptions extends LogOptions {}

function prefixKey(key: string, options?: MakeEnvPublicOptions) {
  // Check if key is available in process.env.
  if (!process.env[key]) {
    warn(
      `Skipped prefixing environment variable '${key}'. Variable not in process.env`,
      options,
    );

    return;
  }

  // Check if key is already public.
  if (/^NEXT_PUBLIC_/i.test(key)) {
    warn(`Environment variable '${key}' is already public`, options);
  }

  const prefixedKey = `NEXT_PUBLIC_${key}`;

  process.env[prefixedKey] = process.env[key];

  // eslint-disable-next-line no-console
  event(`Prefixed environment variable '${key}'`, options);
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
 *
 * // Disable logging.
 * makeEnvPublic('FOO', { logLevel: 'silent' });
 *
 * // Disable logging in production
 * makeEnvPublic('FOO', { logLevel: process.env.NODE_ENV === 'production' ? 'silent': 'info' });
 * ```
 */
export function makeEnvPublic(
  key: string | string[],
  options?: MakeEnvPublicOptions,
): void {
  if (typeof key === 'string') {
    prefixKey(key, options);
  } else {
    key.forEach((value) => prefixKey(value, options));
  }
}
