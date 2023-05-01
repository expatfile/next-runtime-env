/**
 * Make a private environment variable public, so that it can be accessed in the
 * browser.
 */
export function makeEnvPublic(key: string): void {
  // Check if the key already is already public.
  if (/^NEXT_PUBLIC_/i.test(key)) {
    throw new Error(`The environment variable "${key}" is already public.`);
  }

  const prefixedKey = `NEXT_PUBLIC_${key}`;

  process.env[prefixedKey] = process.env[key];
}
