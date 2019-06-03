"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const next_1 = __importDefault(require("../next"));
async function start(serverOptions, port, hostname) {
    const app = next_1.default(serverOptions);
    const srv = http_1.default.createServer(app.getRequestHandler());
    await new Promise((resolve, reject) => {
        // This code catches EADDRINUSE error if the port is already in use
        srv.on('error', reject);
        srv.on('listening', () => resolve());
        srv.listen(port, hostname);
    });
    // It's up to caller to run `app.prepare()`, so it can notify that the server
    // is listening before starting any intensive operations.
    return app;
}
exports.default = start;
