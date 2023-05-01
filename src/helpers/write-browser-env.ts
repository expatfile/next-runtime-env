import fs from 'fs';

import * as log from '../output/log';

/**
 * Writes the environment variables to the public __ENV.js file and make them
 * accessible under `window.__ENV`.
 */
export function writeBrowserEnv(env: NodeJS.ProcessEnv) {
  const base = fs.realpathSync(process.cwd());
  const path = `${base}/public/__ENV.js`;

  log.info(`Write browser runtime environment variables to ${path}`);

  const content = `window.__ENV = ${JSON.stringify(env)};`;

  fs.writeFileSync(path, content);
}
