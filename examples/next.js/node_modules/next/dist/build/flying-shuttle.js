"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const async_sema_1 = __importDefault(require("async-sema"));
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const constants_1 = require("next-server/constants");
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const recursive_delete_1 = require("../lib/recursive-delete");
const Log = __importStar(require("./output/log"));
const FILE_BUILD_ID = 'HEAD_BUILD_ID';
const DIR_FILES_NAME = 'files';
const mkdirp = util_1.promisify(mkdirp_1.default);
const fsExists = util_1.promisify(fs_1.default.exists);
const fsReadFile = util_1.promisify(fs_1.default.readFile);
const fsWriteFile = util_1.promisify(fs_1.default.writeFile);
const fsCopyFile = util_1.promisify(fs_1.default.copyFile);
class FlyingShuttle {
    constructor({ buildId, pagesDirectory, distDirectory, cacheIdentifier, }) {
        this._restoreSema = new async_sema_1.default(1);
        this._recalledManifest = {
            pages: {},
            pageChunks: {},
            chunks: {},
            hashes: {},
        };
        this.hasShuttle = async () => {
            const found = this.shuttleBuildId &&
                (await fsExists(path_1.default.join(this.shuttleDirectory, constants_1.CHUNK_GRAPH_MANIFEST)));
            if (found) {
                Log.info('flying shuttle is docked');
            }
            else {
                Log.info('could not locate flying shuttle');
            }
            return found;
        };
        this.getUnchangedPages = async () => {
            const manifestPath = path_1.default.join(this.shuttleDirectory, constants_1.CHUNK_GRAPH_MANIFEST);
            const manifest = require(manifestPath);
            const { pages: pageFileDictionary, hashes } = manifest;
            const pageNames = Object.keys(pageFileDictionary);
            const allFiles = new Set();
            pageNames.forEach(pageName => pageFileDictionary[pageName].forEach(file => allFiles.add(file)));
            const fileChanged = new Map();
            await Promise.all([...allFiles].map(async (file) => {
                const filePath = path_1.default.join(path_1.default.dirname(this.pagesDirectory), file);
                const exists = await fsExists(filePath);
                if (!exists) {
                    fileChanged.set(file, true);
                    return;
                }
                const hash = crypto_1.default
                    .createHash('sha1')
                    .update(this.cacheIdentifier)
                    .update(await fsReadFile(filePath))
                    .digest('hex');
                fileChanged.set(file, hash !== hashes[file]);
            }));
            const unchangedPages = pageNames
                .filter(p => !pageFileDictionary[p].map(f => fileChanged.get(f)).some(Boolean))
                .filter(pageName => pageName !== '/_app' &&
                pageName !== '/_error' &&
                pageName !== '/_document');
            if (unchangedPages.length) {
                const u = unchangedPages.length;
                const c = pageNames.length - u;
                Log.info(`found ${c} changed and ${u} unchanged page${u > 1 ? 's' : ''}`);
            }
            else {
                Log.warn(`flying shuttle had no pages we can reuse`);
            }
            return unchangedPages;
        };
        this.restorePage = async (page) => {
            await this._restoreSema.acquire();
            try {
                const manifestPath = path_1.default.join(this.shuttleDirectory, constants_1.CHUNK_GRAPH_MANIFEST);
                const manifest = require(manifestPath);
                const { pages, pageChunks, hashes } = manifest;
                if (!(pages.hasOwnProperty(page) && pageChunks.hasOwnProperty(page))) {
                    Log.warn(`unable to find ${page} in shuttle`);
                    return false;
                }
                const serverless = path_1.default.join('serverless/pages', `${page === '/' ? 'index' : page}.js`);
                const files = [serverless, ...pageChunks[page]];
                const filesExists = await Promise.all(files
                    .map(f => path_1.default.join(this.shuttleDirectory, DIR_FILES_NAME, f))
                    .map(f => fsExists(f)));
                if (!filesExists.every(Boolean)) {
                    Log.warn(`unable to locate files for ${page} in shuttle`);
                    return false;
                }
                const rewriteRegex = new RegExp(`${this.shuttleBuildId}[\\/\\\\]`);
                const movedPageChunks = [];
                await Promise.all(files.map(async (recallFileName) => {
                    if (!rewriteRegex.test(recallFileName)) {
                        const recallPath = path_1.default.join(this.distDirectory, recallFileName);
                        const recallPathExists = await fsExists(recallPath);
                        if (!recallPathExists) {
                            await mkdirp(path_1.default.dirname(recallPath));
                            await fsCopyFile(path_1.default.join(this.shuttleDirectory, DIR_FILES_NAME, recallFileName), recallPath);
                        }
                        movedPageChunks.push(recallFileName);
                        return;
                    }
                    const newFileName = recallFileName.replace(rewriteRegex, `${this.buildId}/`);
                    const recallPath = path_1.default.join(this.distDirectory, newFileName);
                    const recallPathExists = await fsExists(recallPath);
                    if (!recallPathExists) {
                        await mkdirp(path_1.default.dirname(recallPath));
                        await fsCopyFile(path_1.default.join(this.shuttleDirectory, DIR_FILES_NAME, recallFileName), recallPath);
                    }
                    movedPageChunks.push(newFileName);
                }));
                this._recalledManifest.pages[page] = pages[page];
                this._recalledManifest.pageChunks[page] = movedPageChunks.filter(f => f !== serverless);
                this._recalledManifest.hashes = Object.assign({}, this._recalledManifest.hashes, pages[page].reduce((acc, cur) => Object.assign(acc, { [cur]: hashes[cur] }), {}));
                return true;
            }
            finally {
                this._restoreSema.release();
            }
        };
        this.save = async () => {
            Log.wait('docking flying shuttle');
            await recursive_delete_1.recursiveDelete(this.shuttleDirectory);
            await mkdirp(this.shuttleDirectory);
            const nextManifestPath = path_1.default.join(this.distDirectory, constants_1.CHUNK_GRAPH_MANIFEST);
            if (!(await fsExists(nextManifestPath))) {
                Log.warn('could not find shuttle payload :: shuttle will not be docked');
                return;
            }
            const nextManifest = JSON.parse(await fsReadFile(nextManifestPath, 'utf8'));
            if (nextManifest.chunks && Object.keys(nextManifest.chunks).length) {
                Log.warn('build emitted assets that cannot fit in flying shuttle');
                return;
            }
            const storeManifest = {
                pages: Object.assign({}, this._recalledManifest.pages, nextManifest.pages),
                pageChunks: Object.assign({}, this._recalledManifest.pageChunks, nextManifest.pageChunks),
                chunks: Object.assign({}, this._recalledManifest.chunks, nextManifest.chunks),
                hashes: Object.assign({}, this._recalledManifest.hashes, nextManifest.hashes),
            };
            await fsWriteFile(path_1.default.join(this.shuttleDirectory, FILE_BUILD_ID), this.buildId);
            const usedChunks = new Set();
            const pages = Object.keys(storeManifest.pageChunks);
            pages.forEach(page => {
                storeManifest.pageChunks[page].forEach(file => usedChunks.add(file));
                usedChunks.add(path_1.default.join('serverless/pages', `${page === '/' ? 'index' : page}.js`));
            });
            await fsWriteFile(path_1.default.join(this.shuttleDirectory, constants_1.CHUNK_GRAPH_MANIFEST), JSON.stringify(storeManifest, null, 2) + os_1.EOL);
            await Promise.all([...usedChunks].map(async (usedChunk) => {
                const target = path_1.default.join(this.shuttleDirectory, DIR_FILES_NAME, usedChunk);
                await mkdirp(path_1.default.dirname(target));
                return fsCopyFile(path_1.default.join(this.distDirectory, usedChunk), target);
            }));
            Log.info(`flying shuttle payload: ${usedChunks.size + 2} files`);
            Log.ready('flying shuttle docked');
        };
        mkdirp_1.default.sync((this.shuttleDirectory = path_1.default.join(distDirectory, 'cache', 'next-flying-shuttle')));
        this.buildId = buildId;
        this.pagesDirectory = pagesDirectory;
        this.distDirectory = distDirectory;
        this.cacheIdentifier = cacheIdentifier;
    }
    get shuttleBuildId() {
        if (this._shuttleBuildId) {
            return this._shuttleBuildId;
        }
        const headBuildIdPath = path_1.default.join(this.shuttleDirectory, FILE_BUILD_ID);
        if (!fs_1.default.existsSync(headBuildIdPath)) {
            return (this._shuttleBuildId = undefined);
        }
        const contents = fs_1.default.readFileSync(headBuildIdPath, 'utf8').trim();
        return (this._shuttleBuildId = contents);
    }
}
exports.FlyingShuttle = FlyingShuttle;
