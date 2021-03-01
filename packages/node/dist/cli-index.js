'use strict';

const spawn = require("cross-spawn");
const fs = require("fs");
const argv = require("minimist")(process.argv.slice(2));

function writeBrowserEnvironment(env) {
  const basePath = fs.realpathSync(process.cwd());
  const destPath = argv.dest ? `${argv.dest}/` : "public/";
  console.log("Runtime env: ", JSON.stringify(env, null, 2));
  const populate = `window.__ENV = ${JSON.stringify(env)};`;
  fs.writeFileSync(`${basePath}/${destPath}__ENV.js`, populate);
}

function getEnvironment() {
  return Object.keys(process.env)
    .filter((key) => /^REACT_APP_/i.test(key))
    .reduce((env, key) => {
      env[key] = process.env[key];
      return env;
    }, {});
}

function resolveFile(file) {
  const path = fs.realpathSync(process.cwd());
  return `${path}/${file}`;
}

function getEnvFiles() {
  const envKey = argv.k || argv.key || "";
  const envVal = process.env[envKey] ? process.env[envKey] : "";
  return [
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

if (argv._[0]) {
  spawn(argv._[0], argv._.slice(1), { stdio: "inherit" }).on(
    "exit",
    function (exitCode) {
      process.exit(exitCode);
    }
  );
}
