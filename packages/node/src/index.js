"use strict";

const fs = require("fs");
const {
  getEnvFiles,
  getClientEnvironment,
  writeClientEnvironment
} = require("./lib");

const dotenvFiles = getEnvFiles();

dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    require("dotenv-expand")(
      require("dotenv").config({
        path: dotenvFile
      })
    );
  }
});

const env = getClientEnvironment();

writeClientEnvironment(env);
