"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function deleteCache(path) {
    try {
        delete require.cache[fs_1.realpathSync(path)];
    }
    catch (e) {
        if (e.code !== 'ENOENT')
            throw e;
    }
    finally {
        delete require.cache[path];
    }
}
// This plugin flushes require.cache after emitting the files. Providing 'hot reloading' of server files.
class NextJsRequireCacheHotReloader {
    constructor() {
        this.prevAssets = null;
    }
    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync('NextJsRequireCacheHotReloader', (compilation, callback) => {
            const { assets } = compilation;
            if (this.prevAssets) {
                for (const f of Object.keys(assets)) {
                    deleteCache(assets[f].existsAt);
                }
                for (const f of Object.keys(this.prevAssets)) {
                    if (!assets[f]) {
                        deleteCache(this.prevAssets[f].existsAt);
                    }
                }
            }
            this.prevAssets = assets;
            callback();
        });
    }
}
exports.NextJsRequireCacheHotReloader = NextJsRequireCacheHotReloader;
