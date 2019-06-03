#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const index_js_1 = __importDefault(require("next/dist/compiled/arg/index.js"));
const export_1 = __importDefault(require("../export"));
const utils_1 = require("../server/lib/utils");
const nextExport = (argv) => {
    const args = index_js_1.default({
        // Types
        '--help': Boolean,
        '--silent': Boolean,
        '--outdir': String,
        '--threads': Number,
        '--concurrency': Number,
        // Aliases
        '-h': '--help',
        '-s': '--silent',
        '-o': '--outdir',
    }, { argv });
    if (args['--help']) {
        // tslint:disable-next-line
        console.log(`
      Description
        Exports the application for production deployment

      Usage
        $ next export [options] <dir>

      <dir> represents where the compiled dist folder should go.
      If no directory is provided, the 'out' folder will be created in the current directory.

      Options
        -h - list this help
        -o - set the output dir (defaults to 'out')
        -s - do not print any messages to console
    `);
        process.exit(0);
    }
    const dir = path_1.resolve(args._[0] || '.');
    // Check if pages dir exists and warn if not
    if (!fs_1.existsSync(dir)) {
        utils_1.printAndExit(`> No such directory exists as the project root: ${dir}`);
    }
    if (!fs_1.existsSync(path_1.join(dir, 'pages'))) {
        if (fs_1.existsSync(path_1.join(dir, '..', 'pages'))) {
            utils_1.printAndExit('> No `pages` directory found. Did you mean to run `next` in the parent (`../`) directory?');
        }
        utils_1.printAndExit('> Couldn\'t find a `pages` directory. Please create one under the project root');
    }
    const options = {
        silent: args['--silent'] || false,
        threads: args['--threads'],
        concurrency: args['--concurrency'],
        outdir: args['--outdir'] ? path_1.resolve(args['--outdir']) : path_1.join(dir, 'out'),
    };
    export_1.default(dir, options)
        .then(() => {
        utils_1.printAndExit('Export successful', 0);
    })
        .catch((err) => {
        utils_1.printAndExit(err);
    });
};
exports.nextExport = nextExport;
