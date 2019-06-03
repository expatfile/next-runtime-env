"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const prefixes = {
    wait: chalk_1.default `[ {cyan wait} ] `,
    error: chalk_1.default `[ {red error} ]`,
    warn: chalk_1.default `[ {yellow warn} ] `,
    ready: chalk_1.default `[ {green ready} ]`,
    info: chalk_1.default `[ {cyan {dim info}} ] `,
    event: chalk_1.default `[ {magenta event} ]`,
};
function wait(...message) {
    console.log(prefixes.wait, ...message);
}
exports.wait = wait;
function error(...message) {
    console.log(prefixes.error, ...message);
}
exports.error = error;
function warn(...message) {
    console.log(prefixes.warn, ...message);
}
exports.warn = warn;
function ready(...message) {
    console.log(prefixes.ready, ...message);
}
exports.ready = ready;
function info(...message) {
    console.log(prefixes.info, ...message);
}
exports.info = info;
function event(...message) {
    console.log(prefixes.event, ...message);
}
exports.event = event;
