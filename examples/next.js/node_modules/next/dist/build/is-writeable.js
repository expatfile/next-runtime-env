"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const access = util_1.promisify(fs_1.default.access);
async function isWriteable(directory) {
    try {
        await access(directory, (fs_1.default.constants || fs_1.default).W_OK);
        return true;
    }
    catch (err) {
        return false;
    }
}
exports.isWriteable = isWriteable;
