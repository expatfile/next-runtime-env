'use strict';

const spawn = require("cross-spawn");
const fs = require("fs");
const argv = require("minimist")(process.argv.slice(2), { "--": true });

function writeBrowserEnvironment(env) {
  const base = fs.realpathSync(process.cwd());
  const dest = argv.d || argv.dest || "public";
  const debug = argv.debug;
  const path = `${base}/${dest}/__ENV.js`;
  console.info("react-env: Writing runtime env", path);
  if(debug) {
    console.debug(`react-env: ${JSON.stringify(env, null, 2)}`);
  }
  const populate = `window.__ENV = ${JSON.stringify(env)};`;
  fs.writeFileSync(path, populate);
}

function getEnvironment() {
  const prefix = argv.prefix || "REACT_APP";
  const envList = Object.keys(process.env)
    .filter((key) => new RegExp(`^${prefix}_`, 'i').test(key))
    .reduce((env, key) => {
      env[key] = process.env[key];
      return env;
    }, {});
  if(argv.prefix) {
    envList['REACT_ENV_PREFIX'] = prefix;
    process.env.REACT_ENV_PREFIX = prefix;
  }
  return envList;
}

function resolveFile(file) {
  const path = fs.realpathSync(process.cwd());
  return `${path}/${file}`;
}

function getEnvFiles() {
  const envKey = argv.e || argv.env || "";
  const envVal = process.env[envKey] ? process.env[envKey] : "";
  const path = argv.p || argv.path || "";
  return [
    resolveFile(path),
    resolveFile(`.env.${envVal}`),
    resolveFile(".env.local"),
    resolveFile(".env"),
  ].filter(Boolean);
}

const dotenvFiles = getEnvFiles();

dotenvFiles.forEach((dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    require("dotenv-expand")(
      require("dotenv").config({
        path: dotenvFile,
      })
    );
  }
});

const env = getEnvironment();

writeBrowserEnvironment(env);

if (argv["--"] && argv["--"].length) {
  spawn(argv["--"][0], argv["--"].slice(1), { stdio: "inherit" }).on(
    "exit",
    function (exitCode) {
      process.exit(exitCode);
    }
  );
}
