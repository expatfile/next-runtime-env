import { unstable_noStore as noStore } from 'next/cache';

/**
 * Server Component version: reads any env var from process.env.
 * Safe because Server Component output never leaks into client HTML.
 */
export function env(key: string): string | undefined {
  noStore();

  return process.env[key];
}
