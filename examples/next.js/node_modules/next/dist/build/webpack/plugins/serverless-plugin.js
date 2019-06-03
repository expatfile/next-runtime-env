"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GraphHelpers_1 = __importDefault(require("webpack/lib/GraphHelpers"));
/**
 * Makes sure there are no dynamic chunks when the target is serverless
 * The dynamic chunks are integrated back into their parent chunk
 * This is to make sure there is a single render bundle instead of that bundle importing dynamic chunks
 */
const NEXT_REPLACE_BUILD_ID = '__NEXT_REPLACE__BUILD_ID__';
function replaceInBuffer(buffer, from, to) {
    const target = Buffer.from(from, 'utf8');
    const replacement = Buffer.from(to, 'utf8');
    function bufferTee(source) {
        const index = source.indexOf(target);
        if (index === -1) {
            // Escape recursion loop
            return source;
        }
        const b1 = source.slice(0, index);
        const b2 = source.slice(index + target.length);
        const nextBuffer = bufferTee(b2);
        return Buffer.concat([b1, replacement, nextBuffer], index + replacement.length + nextBuffer.length);
    }
    return bufferTee(buffer);
}
function interceptFileWrites(compiler, contentFn) {
    compiler.outputFileSystem = new Proxy(compiler.outputFileSystem, {
        get(target, propKey) {
            const orig = target[propKey];
            if (propKey !== 'writeFile') {
                return orig;
            }
            return function (targetPath, content, ...args) {
                return orig.call(target, targetPath, contentFn(content), ...args);
            };
        },
    });
}
class ServerlessPlugin {
    constructor(buildId, { isServer = false } = {}) {
        this.buildId = buildId;
        this.isServer = isServer;
    }
    apply(compiler) {
        if (this.isServer) {
            interceptFileWrites(compiler, content => replaceInBuffer(content, NEXT_REPLACE_BUILD_ID, this.buildId));
            compiler.hooks.compilation.tap('ServerlessPlugin', compilation => {
                compilation.hooks.optimizeChunksBasic.tap('ServerlessPlugin', chunks => {
                    chunks.forEach(chunk => {
                        // If chunk is not an entry point skip them
                        if (chunk.hasEntryModule()) {
                            const dynamicChunks = chunk.getAllAsyncChunks();
                            if (dynamicChunks.size !== 0) {
                                for (const dynamicChunk of dynamicChunks) {
                                    for (const module of dynamicChunk.modulesIterable) {
                                        GraphHelpers_1.default.connectChunkAndModule(chunk, module);
                                    }
                                }
                            }
                        }
                    });
                });
            });
        }
        else {
            compiler.hooks.emit.tap('ServerlessPlugin', compilation => {
                const assetNames = Object.keys(compilation.assets).filter(f => f.includes(this.buildId));
                for (const name of assetNames) {
                    compilation.assets[name
                        .replace(new RegExp(`${this.buildId}[\\/\\\\]`), 'client/')
                        .replace(/[.]js$/, `.${this.buildId}.js`)] = compilation.assets[name];
                }
            });
        }
    }
}
exports.ServerlessPlugin = ServerlessPlugin;
