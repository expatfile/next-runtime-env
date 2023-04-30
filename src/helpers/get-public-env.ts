/**
 * Gets a list of environment variables that start with `NEXT_PUBLIC_`.
 */
export function getPublicEnv() {
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
