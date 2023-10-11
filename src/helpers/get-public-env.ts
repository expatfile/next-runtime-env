import { ProcessEnv } from '../typings/process-env';

/**
 * Gets a list of environment variables that start with `NEXT_PUBLIC_`.
 */
export function getPublicEnv() {
  const publicEnv = Object.keys(process.env)
    .filter((key) => /^NEXT_PUBLIC_/i.test(key))
    .reduce(
      (env, key) => ({
        ...env,
        [key]: process.env[key],
      }),
      {} as ProcessEnv,
    );

  return publicEnv;
}
