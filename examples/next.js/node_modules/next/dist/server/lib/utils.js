"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function printAndExit(message, code = 1) {
    if (code === 0) {
        console.log(message);
    }
    else {
        console.error(message);
    }
    process.exit(code);
}
exports.printAndExit = printAndExit;
