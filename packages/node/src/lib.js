"use strict";

const fs = require("fs");
var argv = require("yargs").argv;

const NODE_ENV = process.env.NODE_ENV || "development";

function writeClientEnvironment(env) {
  const populate = `window._env = ${JSON.stringify(env)};`;
  fs.appendFile("env.js", populate, () => {});
}

function getClientEnvironment() {
  const match = /^REACT_APP_/i;
  return Object.keys(process.env)
    .filter(key => match.test(key))
    .reduce(
      (env, key) => {
        const subKey = key.split(match).pop();
        env[subKey] = process.env[key];
        return env;
      },
      { NODE_ENV: NODE_ENV }
    );
}

function resolveFile(file) {
  const path = fs.realpathSync(process.cwd());
  return `${path}/${file}`;
}

function getEnvFiles() {
  return [
    argv.env,
    resolveFile(`.env.${NODE_ENV}.local`),
    resolveFile(`.env.${NODE_ENV}`),
    NODE_ENV !== "test" && resolveFile(".env.local"),
    resolveFile(".env"),
  ].filter(Boolean);
}

module.exports = {
  writeClientEnvironment,
  getClientEnvironment,
  resolveFile,
  getEnvFiles
};
