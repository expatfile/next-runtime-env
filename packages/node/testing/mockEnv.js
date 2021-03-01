import del from "del";
import fs from "fs";

function run(args) {
  process.argv = ["", "", ...args];
  const basePath = fs.realpathSync(process.cwd());
  require(`${basePath}/src/cli-index`);
  require(`${basePath}/__ENV.js`);
}

function writeEnvFile(name, string) {
  const path = fs.realpathSync(process.cwd());
  fs.writeFileSync(`${path}/${name}`, string);
}

function reset() {
  del.sync([".env*", "__ENV.js"]);
  jest.resetModules();
  delete window.__ENV;
}

export default { run, writeEnvFile, reset };
