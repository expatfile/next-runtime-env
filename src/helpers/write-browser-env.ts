import fs from 'fs';

/**
 * Writes the environment variables to the public __ENV.js file and make them
 * accessible under `window.__ENV`.
 */
export function writeBrowserEnv(env: NodeJS.ProcessEnv) {
  const base = fs.realpathSync(process.cwd());
  const path = `${base}/public/__ENV.js`;

  // eslint-disable-next-line no-console
  console.info('next-runtime-env: Writing browser runtime env', path);

  const content = `window.__ENV = ${JSON.stringify(env)};`;

  fs.writeFileSync(path, content);
}
