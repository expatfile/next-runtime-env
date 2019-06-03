#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const index_js_1 = __importDefault(require("next/dist/compiled/arg/index.js"));
const fs_1 = require("fs");
const start_server_1 = __importDefault(require("../server/lib/start-server"));
const utils_1 = require("../server/lib/utils");
const output_1 = require("../build/output");
const nextDev = (argv) => {
    const args = index_js_1.default({
        // Types
        '--help': Boolean,
        '--port': Number,
        '--hostname': String,
        // Aliases
        '-h': '--help',
        '-p': '--port',
        '-H': '--hostname',
    }, { argv });
    if (args['--help']) {
        // tslint:disable-next-line
        console.log(`
      Description
        Starts the application in development mode (hot-code reloading, error
        reporting, etc)

      Usage
        $ next dev <dir> -p <port number>

      <dir> represents where the compiled folder should go.
      If no directory is provided, the folder will be created in the current directory.
      You can set a custom folder in config https://github.com/zeit/next.js#custom-configuration.

      Options
        --port, -p      A port number on which to start the application
        --hostname, -H  Hostname on which to start the application
        --help, -h      Displays this message
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
    const port = args['--port'] || 3000;
    const appUrl = `http://${args['--hostname'] || 'localhost'}:${port}`;
    output_1.startedDevelopmentServer(appUrl);
    start_server_1.default({ dir, dev: true }, port, args['--hostname'])
        .then(async (app) => {
        await app.prepare();
    })
        .catch((err) => {
        if (err.code === 'EADDRINUSE') {
            let errorMessage = `Port ${port} is already in use.`;
            const pkgAppPath = require('find-up').sync('package.json', {
                cwd: dir,
            });
            const appPackage = require(pkgAppPath);
            if (appPackage.scripts) {
                const nextScript = Object.entries(appPackage.scripts).find((scriptLine) => scriptLine[1] === 'next');
                if (nextScript) {
                    errorMessage += `\nUse \`npm run ${nextScript[0]} -- -p <some other port>\`.`;
                }
            }
            // tslint:disable-next-line
            console.error(errorMessage);
        }
        else {
            // tslint:disable-next-line
            console.error(err);
        }
        process.nextTick(() => process.exit(1));
    });
};
exports.nextDev = nextDev;
