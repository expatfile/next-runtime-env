import del from "del";
import fs from "fs";

const defaults = [
  ".env.test.local",
  ".env.test",
  ".env.local",
  ".env"
];

export function loadEnv() {
  process.argv = ["", "", "--dest", "."];
  const basePath = fs.realpathSync(process.cwd());
  require(`${basePath}/src/cli-index`);
  require(`${basePath}/env.js`);
}

export function mockEnvFiles(files = defaults) {
  const path = fs.realpathSync(process.cwd());
  files.forEach(file => {
    const env = `
    REACT_APP_FOO='${file}'
    BAR='foo'      
    ` + 'REACT_APP_EXPAND=${NODE_ENV}';
    fs.writeFileSync(`${path}/${file}`, env);
  });
}

export function resetMocks() {
  del.sync([".env*", "env.js"]);
  jest.resetModules();
  delete window._env;
  delete process.env.REACT_APP_FOO;
  delete process.env.BAR;
  delete process.env.REACT_APP_EXPAND;
}
