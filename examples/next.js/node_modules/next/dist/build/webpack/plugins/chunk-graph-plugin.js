"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const fs_1 = __importDefault(require("fs"));
const constants_1 = require("next-server/constants");
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const querystring_1 = require("querystring");
function getFiles(dir, modules) {
    if (!(modules && modules.length)) {
        return [];
    }
    function getFileByIdentifier(id) {
        if (id.startsWith('external ') || id.startsWith('multi ')) {
            return null;
        }
        let n;
        if ((n = id.lastIndexOf('!')) !== -1) {
            id = id.substring(n + 1);
        }
        if (id && !path_1.default.isAbsolute(id)) {
            id = path_1.default.resolve(dir, id);
        }
        return id;
    }
    return modules
        .reduce((acc, val) => val.modules
        ? acc.concat(getFiles(dir, val.modules))
        : (acc.push(getFileByIdentifier(typeof val.identifier === 'function'
            ? val.identifier()
            : val.identifier)),
            acc), [])
        .filter(Boolean);
}
class ChunkGraphPlugin {
    constructor(buildId, dir, { filename, selectivePageBuildingCacheIdentifier, } = {}) {
        this.buildId = buildId;
        this.dir = dir;
        this.filename = filename || 'chunk-graph-manifest.json';
        this.selectivePageBuildingCacheIdentifier =
            selectivePageBuildingCacheIdentifier || '';
    }
    apply(compiler) {
        const { dir } = this;
        compiler.hooks.emit.tap('ChunkGraphPlugin', compilation => {
            const manifest = {
                pages: {},
                pageChunks: {},
                chunks: {},
                hashes: {},
            };
            const sharedFiles = [];
            const sharedChunks = [];
            const pages = {};
            const pageChunks = {};
            const allFiles = new Set();
            compilation.chunks.forEach(chunk => {
                if (!chunk.hasEntryModule()) {
                    return;
                }
                const chunkModules = new Map();
                const queue = new Set(chunk.groupsIterable);
                const chunksProcessed = new Set();
                const involvedChunks = new Set();
                for (const chunkGroup of queue) {
                    for (const chunk of chunkGroup.chunks) {
                        chunk.files.forEach((file) => involvedChunks.add(file));
                        if (!chunksProcessed.has(chunk)) {
                            chunksProcessed.add(chunk);
                            for (const m of chunk.modulesIterable) {
                                chunkModules.set(m.id, m);
                            }
                        }
                    }
                    for (const child of chunkGroup.childrenIterable) {
                        queue.add(child);
                    }
                }
                const modules = [...chunkModules.values()];
                const files = getFiles(dir, modules)
                    .filter(val => !val.includes('node_modules'))
                    .map(f => path_1.default.relative(dir, f))
                    .sort();
                files.forEach(f => allFiles.add(f));
                let pageName;
                if (chunk.entryModule && chunk.entryModule.loaders) {
                    const entryLoader = chunk.entryModule.loaders.find(({ loader, options, }) => loader && loader.includes('next-client-pages-loader') && options);
                    if (entryLoader) {
                        const { page } = querystring_1.parse(entryLoader.options);
                        if (typeof page === 'string' && page) {
                            pageName = page;
                        }
                    }
                }
                if (pageName) {
                    if (pageName === '/_app' ||
                        pageName === '/_error' ||
                        pageName === '/_document') {
                        sharedFiles.push(...files);
                        sharedChunks.push(...involvedChunks);
                    }
                    else {
                        pages[pageName] = files;
                        pageChunks[pageName] = [...involvedChunks];
                    }
                }
                else {
                    if (chunk.name === constants_1.CLIENT_STATIC_FILES_RUNTIME_MAIN) {
                        sharedFiles.push(...files);
                        sharedChunks.push(...involvedChunks);
                    }
                    else {
                        manifest.chunks[chunk.name] = files;
                    }
                }
            });
            const getLambdaChunk = (name) => name.includes(this.buildId)
                ? name
                    .replace(new RegExp(`${this.buildId}[\\/\\\\]`), 'client/')
                    .replace(/[.]js$/, `.${this.buildId}.js`)
                : name;
            for (const page in pages) {
                manifest.pages[page] = [...pages[page], ...sharedFiles];
                manifest.pageChunks[page] = [
                    ...new Set([
                        ...pageChunks[page],
                        ...pageChunks[page].map(getLambdaChunk),
                        ...sharedChunks,
                        ...sharedChunks.map(getLambdaChunk),
                    ]),
                ].sort();
            }
            manifest.hashes = [...allFiles].sort().reduce((acc, cur) => Object.assign(acc, fs_1.default.existsSync(path_1.default.join(dir, cur))
                ? {
                    [cur]: crypto_1.createHash('sha1')
                        .update(this.selectivePageBuildingCacheIdentifier)
                        .update(fs_1.default.readFileSync(path_1.default.join(dir, cur)))
                        .digest('hex'),
                }
                : undefined), {});
            const json = JSON.stringify(manifest, null, 2) + os_1.EOL;
            compilation.assets[this.filename] = {
                source() {
                    return json;
                },
                size() {
                    return json.length;
                },
            };
        });
    }
}
exports.ChunkGraphPlugin = ChunkGraphPlugin;
