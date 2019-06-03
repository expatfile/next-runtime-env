"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const util_1 = require("util");
const readdir = util_1.promisify(fs_1.default.readdir);
const stat = util_1.promisify(fs_1.default.stat);
/**
 * Recursively read directory
 * @param  {string} dir Directory to read
 * @param  {RegExp} filter Filter for the file name, only the name part is considered, not the full path
 * @param  {string[]=[]} arr This doesn't have to be provided, it's used for the recursion
 * @param  {string=dir`} rootDir Used to replace the initial path, only the relative path is left, it's faster than path.relative.
 * @returns Promise array holding all relative paths
 */
async function recursiveReadDir(dir, filter, arr = [], rootDir = dir) {
    const result = await readdir(dir);
    await Promise.all(result.map(async (part) => {
        const absolutePath = path_1.join(dir, part);
        const pathStat = await stat(absolutePath);
        if (pathStat.isDirectory()) {
            await recursiveReadDir(absolutePath, filter, arr, rootDir);
            return;
        }
        if (!filter.test(part)) {
            return;
        }
        arr.push(absolutePath.replace(rootDir, ''));
    }));
    return arr;
}
exports.recursiveReadDir = recursiveReadDir;
