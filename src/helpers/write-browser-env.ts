import fs from 'fs';
import path from 'path';

import { type ProcessEnv } from '../typings';
import * as log from '../utils/log';
import { getBrowserEnvScript } from './get-browser-env-script';

/**
 * Writes the environment variables to the public __ENV.js file and make them
 * accessible under `window.__ENV`.
 */
export function writeBrowserEnv(env: ProcessEnv, subdirectory = '') {
  const base = fs.realpathSync(process.cwd());
  const file = `${base}/public/${subdirectory}__ENV.js`;

  const content = getBrowserEnvScript(env);

  const dirname = path.dirname(file);

  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }

  fs.writeFileSync(file, content);

  log.ready(`wrote browser runtime environment variables to '${file}'.`);
}
