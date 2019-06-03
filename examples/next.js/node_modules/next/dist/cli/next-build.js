#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const index_js_1 = __importDefault(require("next/dist/compiled/arg/index.js"));
const build_1 = __importDefault(require("../build"));
const utils_1 = require("../server/lib/utils");
const nextBuild = (argv) => {
    const args = index_js_1.default({
        // Types
        '--help': Boolean,
        // Aliases
        '-h': '--help',
    }, { argv });
    if (args['--help']) {
        utils_1.printAndExit(`
      Description
        Compiles the application for production deployment

      Usage
        $ next build <dir>

      <dir> represents where the compiled dist folder should go.
      If no directory is provided, the dist folder will be created in the current directory.
      You can set a custom folder in config https://github.com/zeit/next.js#custom-configuration, otherwise it will be created inside '.next'
    `, 0);
    }
    const dir = path_1.resolve(args._[0] || '.');
    // Check if the provided directory exists
    if (!fs_1.existsSync(dir)) {
        utils_1.printAndExit(`> No such directory exists as the project root: ${dir}`);
    }
    // Check if the pages directory exists
    if (!fs_1.existsSync(path_1.join(dir, 'pages'))) {
        // Check one level down the tree to see if the pages directory might be there
        if (fs_1.existsSync(path_1.join(dir, '..', 'pages'))) {
            utils_1.printAndExit('> No `pages` directory found. Did you mean to run `next` in the parent (`../`) directory?');
        }
        utils_1.printAndExit("> Couldn't find a `pages` directory. Please create one under the project root");
    }
    build_1.default(dir).catch((err) => {
        // tslint:disable-next-line
        console.error('> Build error occurred');
        utils_1.printAndExit(err);
    });
};
exports.nextBuild = nextBuild;
