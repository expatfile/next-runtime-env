"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const constants_1 = require("next-server/constants");
const unlink = util_1.promisify(fs_1.default.unlink);
// Makes sure removed pages are removed from `.next` in development
class UnlinkRemovedPagesPlugin {
    constructor() {
        this.prevAssets = {};
    }
    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync('NextJsUnlinkRemovedPages', (compilation, callback) => {
            const removed = Object.keys(this.prevAssets)
                .filter((a) => constants_1.IS_BUNDLED_PAGE_REGEX.test(a) && !compilation.assets[a]);
            this.prevAssets = compilation.assets;
            Promise.all(removed.map(async (f) => {
                const path = path_1.join(compiler.outputPath, f);
                try {
                    await unlink(path);
                }
                catch (err) {
                    if (err.code === 'ENOENT')
                        return;
                    throw err;
                }
            }))
                .then(() => callback(), callback);
        });
    }
}
exports.UnlinkRemovedPagesPlugin = UnlinkRemovedPagesPlugin;
