"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
class HashedChunkIdsPlugin {
    constructor(buildId) {
        this.buildId = buildId;
    }
    apply(compiler) {
        compiler.hooks.compilation.tap('HashedChunkIdsPlugin', compilation => {
            compilation.hooks.beforeChunkIds.tap('HashedChunkIdsPlugin', chunks => {
                for (const chunk of chunks) {
                    if (chunk.id === null && chunk.name) {
                        const id = chunk.name.replace(this.buildId, '');
                        chunk.id = crypto_1.createHash('md4')
                            .update(id)
                            .digest('hex')
                            .substr(0, 4);
                        continue;
                    }
                    const ids = [...chunk.modulesIterable]
                        .map(m => m.id)
                        .sort();
                    const h = crypto_1.createHash('md4');
                    ids.forEach(id => h.update(id));
                    chunk.id = h.digest('hex').substr(0, 4);
                }
            });
        });
    }
}
exports.HashedChunkIdsPlugin = HashedChunkIdsPlugin;
