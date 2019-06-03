"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const find_up_1 = __importDefault(require("find-up"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const recursive_readdir_1 = require("../lib/recursive-readdir");
const fsExists = util_1.promisify(fs_1.default.exists);
const fsReadFile = util_1.promisify(fs_1.default.readFile);
function collectPages(directory, pageExtensions) {
    return recursive_readdir_1.recursiveReadDir(directory, new RegExp(`\\.(?:${pageExtensions.join('|')})$`));
}
exports.collectPages = collectPages;
function printTreeView(list) {
    list
        .sort((a, b) => (a > b ? 1 : -1))
        .forEach((item, i) => {
        const corner = i === 0
            ? list.length === 1
                ? '─'
                : '┌'
            : i === list.length - 1
                ? '└'
                : '├';
        console.log(` \x1b[90m${corner}\x1b[39m ${item}`);
    });
    console.log();
}
exports.printTreeView = printTreeView;
function flatten(arr) {
    return arr.reduce((acc, val) => acc.concat(val), []);
}
function getPossibleFiles(pageExtensions, pages) {
    const res = pages.map(page => pageExtensions
        .map(e => `${page}.${e}`)
        .concat(pageExtensions.map(e => `${path_1.default.join(page, 'index')}.${e}`))
        .concat(page));
    return flatten(res);
}
async function getFileForPage({ page, pagesDirectory, pageExtensions, }) {
    const theFile = getPossibleFiles(pageExtensions, [
        path_1.default.join(pagesDirectory, page),
    ]).find(f => fs_1.default.existsSync(f) && fs_1.default.lstatSync(f).isFile());
    if (theFile) {
        return path_1.default.sep + path_1.default.relative(pagesDirectory, theFile);
    }
    return theFile;
}
exports.getFileForPage = getFileForPage;
async function getSpecifiedPages(dir, pagesString, pageExtensions) {
    const pagesDir = path_1.default.join(dir, 'pages');
    const reservedPages = ['/_app', '/_document', '/_error'];
    const explodedPages = [
        ...new Set([...pagesString.split(','), ...reservedPages]),
    ].map(p => {
        let resolvedPage;
        if (path_1.default.isAbsolute(p)) {
            resolvedPage = getPossibleFiles(pageExtensions, [
                path_1.default.join(pagesDir, p),
                p,
            ]).find(f => fs_1.default.existsSync(f) && fs_1.default.lstatSync(f).isFile());
        }
        else {
            resolvedPage = getPossibleFiles(pageExtensions, [
                path_1.default.join(pagesDir, p),
                path_1.default.join(dir, p),
            ]).find(f => fs_1.default.existsSync(f) && fs_1.default.lstatSync(f).isFile());
        }
        return { original: p, resolved: resolvedPage || null };
    });
    const missingPage = explodedPages.find(({ original, resolved }) => !resolved && !reservedPages.includes(original));
    if (missingPage) {
        throw new Error(`Unable to identify page: ${missingPage.original}`);
    }
    const resolvedPagePaths = explodedPages
        .filter(page => page.resolved)
        .map(page => '/' + path_1.default.relative(pagesDir, page.resolved));
    return resolvedPagePaths.sort();
}
exports.getSpecifiedPages = getSpecifiedPages;
async function getCacheIdentifier({ pagesDirectory, env = {}, }) {
    let selectivePageBuildingCacheIdentifier = '';
    const envObject = env
        ? Object.keys(env)
            .sort()
            // eslint-disable-next-line
            .reduce((a, c) => ((a[c] = env[c]), a), {})
        : {};
    selectivePageBuildingCacheIdentifier += JSON.stringify(envObject);
    const pkgPath = await find_up_1.default('package.json', { cwd: pagesDirectory });
    if (pkgPath) {
        const yarnLock = path_1.default.join(path_1.default.dirname(pkgPath), 'yarn.lock');
        const packageLock = path_1.default.join(path_1.default.dirname(pkgPath), 'package-lock.json');
        if (await fsExists(yarnLock)) {
            selectivePageBuildingCacheIdentifier += await fsReadFile(yarnLock, 'utf8');
        }
        else if (await fsExists(packageLock)) {
            selectivePageBuildingCacheIdentifier += await fsReadFile(packageLock, 'utf8');
        }
        else {
            selectivePageBuildingCacheIdentifier += JSON.stringify(require(pkgPath));
        }
    }
    return crypto_1.default
        .createHash('sha1')
        .update(selectivePageBuildingCacheIdentifier)
        .digest('hex');
}
exports.getCacheIdentifier = getCacheIdentifier;
