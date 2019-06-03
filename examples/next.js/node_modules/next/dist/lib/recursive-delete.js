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
const rmdir = util_1.promisify(fs_1.default.rmdir);
const unlink = util_1.promisify(fs_1.default.unlink);
const sleep = util_1.promisify(setTimeout);
const unlinkFile = async (p, t = 1) => {
    try {
        await unlink(p);
    }
    catch (e) {
        if ((e.code === 'EBUSY' ||
            e.code === 'ENOTEMPTY' ||
            e.code === 'EPERM' ||
            e.code === 'EMFILE') &&
            t < 3) {
            await sleep(t * 100);
            return unlinkFile(p, t++);
        }
        if (e.code === 'ENOENT') {
            return;
        }
        throw e;
    }
};
/**
 * Recursively delete directory contents
 * @param  {string} dir Directory to delete the contents of
 * @param  {RegExp} [filter] Filter for the relative file path
 * @param  {boolean} [ensure] Ensures that parameter dir exists, this is not passed recursively
 * @param  {string} [previousPath] Ensures that parameter dir exists, this is not passed recursively
 * @returns Promise void
 */
async function recursiveDelete(dir, filter, previousPath = '', ensure) {
    let result;
    try {
        result = await readdir(dir);
    }
    catch (e) {
        if (e.code === 'ENOENT' && !ensure) {
            return;
        }
        throw e;
    }
    await Promise.all(result.map(async (part) => {
        const absolutePath = path_1.join(dir, part);
        const pathStat = await stat(absolutePath).catch((e) => {
            if (e.code !== 'ENOENT')
                throw e;
        });
        if (!pathStat) {
            return;
        }
        if (pathStat.isDirectory()) {
            const pp = path_1.join(previousPath, part);
            await recursiveDelete(absolutePath, filter, pp);
            if (!filter || filter.test(pp)) {
                return rmdir(absolutePath);
            }
            return;
        }
        if (!filter || filter.test(path_1.join(previousPath, part))) {
            return unlinkFile(absolutePath);
        }
    }));
}
exports.recursiveDelete = recursiveDelete;
