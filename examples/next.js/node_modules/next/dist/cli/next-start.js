#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const index_js_1 = __importDefault(require("next/dist/compiled/arg/index.js"));
const start_server_1 = __importDefault(require("../server/lib/start-server"));
const nextStart = (argv) => {
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
        Starts the application in production mode.
        The application should be compiled with \`next build\` first.

      Usage
        $ next start <dir> -p <port>

      <dir> is the directory that contains the compiled dist folder
      created by running \`next build\`.
      If no directory is provided, the current directory will be assumed.
      You can set a custom dist folder in config https://github.com/zeit/next.js#custom-configuration

      Options
        --port, -p      A port number on which to start the application
        --hostname, -H  Hostname on which to start the application
        --help, -h      Displays this message
    `);
        process.exit(0);
    }
    const dir = path_1.resolve(args._[0] || '.');
    const port = args['--port'] || 3000;
    start_server_1.default({ dir }, port, args['--hostname'])
        .then(async (app) => {
        // tslint:disable-next-line
        console.log(`> Ready on http://${args['--hostname'] || 'localhost'}:${port}`);
        await app.prepare();
    })
        .catch((err) => {
        // tslint:disable-next-line
        console.error(err);
        process.exit(1);
    });
};
exports.nextStart = nextStart;
