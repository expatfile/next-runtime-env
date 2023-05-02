import fs from 'fs';
import path from 'path';

import * as log from '../utils/log';

/**
 * Writes the environment variables to the public __ENV.js file and make them
 * accessible under `window.__ENV`.
 */
export function writeBrowserEnv(env: NodeJS.ProcessEnv, subdirectory = '') {
  const base = fs.realpathSync(process.cwd());
  const file = `${base}/public/${subdirectory}__ENV.js`;

  const content = `window.__ENV = ${JSON.stringify(env)};`;

  const dirname = path.dirname(file);

  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }

  fs.writeFileSync(file, content);

  log.info(`Wrote browser runtime environment variables to '${file}'.`);
}
