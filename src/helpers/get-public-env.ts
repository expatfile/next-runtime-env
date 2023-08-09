import * as log from '../utils/log';

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
      {} as NodeJS.ProcessEnv,
    );

  log.event(
    `read environment variables prefixed with 'NEXT_PUBLIC_' from process.env.`,
  );

  return publicEnv;
}
