import * as log from '../output/log';

/**
 * Gets a list of environment variables that start with `NEXT_PUBLIC_`.
 */
export function getPublicEnv() {
  log.info(
    `Get environment variables prefixed with 'NEXT_PUBLIC_' from process.env`
  );

  return Object.keys(process.env)
    .filter((key) => /^NEXT_PUBLIC_/i.test(key))
    .reduce(
      (env, key) => ({
        ...env,
        [key]: process.env[key],
      }),
      {} as NodeJS.ProcessEnv
    );
}
