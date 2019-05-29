'use strict';

const shell = require("shelljs");
var argv = require("yargs").argv;
var path = require("path");

function translateArch() {
  switch (process.arch) {
    default:
    case "x64":
      return "amd64";
    case "ia32":
      return "386";
    case "arm":
      return "arm";
  }
}

function getBinaryPath() {
  const bin = `react-env_${process.platform}-${translateArch()}`;
  return path.resolve(`${__dirname}/bin/${bin}`);
}

function command(bin) {
  const command = argv.env ? `${bin} --env=${argv.env}` : bin;
  console.log(command);
  if (shell.exec(command).code !== 0) {
    shell.exit(1);
  }
}

command(getBinaryPath());
