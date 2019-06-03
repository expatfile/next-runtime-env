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
const DynamicEntryPlugin_1 = __importDefault(require("webpack/lib/DynamicEntryPlugin"));
const events_1 = require("events");
const path_1 = require("path");
const url_1 = require("url");
const fs_1 = __importDefault(require("fs"));
const require_1 = require("next-server/dist/server/require");
const normalize_page_path_1 = require("next-server/dist/server/normalize-page-path");
const constants_1 = require("next-server/constants");
const querystring_1 = require("querystring");
const find_page_file_1 = require("./lib/find-page-file");
const is_writeable_1 = require("../build/is-writeable");
const Log = __importStar(require("../build/output/log"));
const ADDED = Symbol('added');
const BUILDING = Symbol('building');
const BUILT = Symbol('built');
// Based on https://github.com/webpack/webpack/blob/master/lib/DynamicEntryPlugin.js#L29-L37
function addEntry(compilation, context, name, entry) {
    return new Promise((resolve, reject) => {
        const dep = DynamicEntryPlugin_1.default.createDependency(entry, name);
        compilation.addEntry(context, dep, name, (err) => {
            if (err)
                return reject(err);
            resolve();
        });
    });
}
function onDemandEntryHandler(devMiddleware, multiCompiler, { buildId, dir, distDir, reload, pageExtensions, maxInactiveAge, pagesBufferLength, publicRuntimeConfig, serverRuntimeConfig }) {
    const pagesDir = path_1.join(dir, 'pages');
    const clients = new Map();
    const evtSourceHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/event-stream;charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        // While behind nginx, event stream should not be buffered:
        // http://nginx.org/docs/http/ngx_http_proxy_module.html#proxy_buffering
        'X-Accel-Buffering': 'no',
        'Connection': 'keep-alive'
    };
    const { compilers } = multiCompiler;
    const invalidator = new Invalidator(devMiddleware, multiCompiler);
    let entries = {};
    let lastAccessPages = [''];
    let doneCallbacks = new events_1.EventEmitter();
    let reloading = false;
    let stopped = false;
    let reloadCallbacks = new events_1.EventEmitter();
    let lastEntry = null;
    for (const compiler of compilers) {
        compiler.hooks.make.tapPromise('NextJsOnDemandEntries', (compilation) => {
            invalidator.startBuilding();
            const allEntries = Object.keys(entries).map(async (page) => {
                const { name, absolutePagePath } = entries[page];
                const pageExists = await is_writeable_1.isWriteable(absolutePagePath);
                if (!pageExists) {
                    Log.event('page was removed', page);
                    delete entries[page];
                    return;
                }
                entries[page].status = BUILDING;
                return addEntry(compilation, compiler.context, name, [compiler.name === 'client' ? `next-client-pages-loader?${querystring_1.stringify({ page, absolutePagePath })}!` : absolutePagePath]);
            });
            return Promise.all(allEntries);
        });
    }
    multiCompiler.hooks.done.tap('NextJsOnDemandEntries', (multiStats) => {
        const clientStats = multiStats.stats[0];
        const { compilation } = clientStats;
        const hardFailedPages = compilation.errors
            .filter(e => {
            // Make sure to only pick errors which marked with missing modules
            const hasNoModuleFoundError = /ENOENT/.test(e.message) || /Module not found/.test(e.message);
            if (!hasNoModuleFoundError)
                return false;
            // The page itself is missing. So this is a failed page.
            if (constants_1.IS_BUNDLED_PAGE_REGEX.test(e.module.name))
                return true;
            // No dependencies means this is a top level page.
            // So this is a failed page.
            return e.module.dependencies.length === 0;
        })
            .map(e => e.module.chunks)
            .reduce((a, b) => [...a, ...b], [])
            .map(c => {
            const pageName = constants_1.ROUTE_NAME_REGEX.exec(c.name)[1];
            return normalizePage(`/${pageName}`);
        });
        // compilation.entrypoints is a Map object, so iterating over it 0 is the key and 1 is the value
        for (const [, entrypoint] of compilation.entrypoints.entries()) {
            const result = constants_1.ROUTE_NAME_REGEX.exec(entrypoint.name);
            if (!result) {
                continue;
            }
            const pagePath = result[1];
            if (!pagePath) {
                continue;
            }
            const page = normalizePage('/' + pagePath);
            const entry = entries[page];
            if (!entry) {
                continue;
            }
            if (entry.status !== BUILDING) {
                continue;
            }
            entry.status = BUILT;
            entry.lastActiveTime = Date.now();
            doneCallbacks.emit(page);
        }
        invalidator.doneBuilding();
        if (hardFailedPages.length > 0 && !reloading) {
            console.log(`> Reloading webpack due to inconsistant state of pages(s): ${hardFailedPages.join(', ')}`);
            reloading = true;
            reload()
                .then(() => {
                console.log('> Webpack reloaded.');
                reloadCallbacks.emit('done');
                stop();
            })
                .catch(err => {
                console.error(`> Webpack reloading failed: ${err.message}`);
                console.error(err.stack);
                process.exit(1);
            });
        }
    });
    const disposeHandler = setInterval(function () {
        if (stopped)
            return;
        disposeInactiveEntries(devMiddleware, entries, lastAccessPages, maxInactiveAge);
    }, 5000);
    disposeHandler.unref();
    function stop() {
        clients.forEach((id, client) => client.end());
        clearInterval(disposeHandler);
        stopped = true;
        doneCallbacks = null;
        reloadCallbacks = null;
    }
    function handlePing(pg) {
        const page = normalizePage(pg);
        const entryInfo = entries[page];
        let toSend;
        // If there's no entry, it may have been invalidated and needs to be re-built.
        if (!entryInfo) {
            if (page !== lastEntry)
                Log.event(`client pings, but there's no entry for page: ${page}`);
            lastEntry = page;
            return { invalid: true };
        }
        // 404 is an on demand entry but when a new page is added we have to refresh the page
        if (page === '/_error') {
            toSend = { invalid: true };
        }
        else {
            toSend = { success: true };
        }
        // We don't need to maintain active state of anything other than BUILT entries
        if (entryInfo.status !== BUILT)
            return;
        // If there's an entryInfo
        if (!lastAccessPages.includes(page)) {
            lastAccessPages.unshift(page);
            // Maintain the buffer max length
            if (lastAccessPages.length > pagesBufferLength) {
                lastAccessPages.pop();
            }
        }
        entryInfo.lastActiveTime = Date.now();
        return toSend;
    }
    return {
        waitUntilReloaded() {
            if (!reloading)
                return Promise.resolve(true);
            return new Promise((resolve) => {
                reloadCallbacks.once('done', function () {
                    resolve();
                });
            });
        },
        async ensurePage(page) {
            await this.waitUntilReloaded();
            let normalizedPagePath;
            try {
                normalizedPagePath = normalize_page_path_1.normalizePagePath(page);
            }
            catch (err) {
                console.error(err);
                throw require_1.pageNotFoundError(normalizedPagePath);
            }
            let pagePath = await find_page_file_1.findPageFile(pagesDir, normalizedPagePath, pageExtensions);
            // Default the /_error route to the Next.js provided default page
            if (page === '/_error' && pagePath === null) {
                pagePath = 'next/dist/pages/_error';
            }
            if (pagePath === null) {
                throw require_1.pageNotFoundError(normalizedPagePath);
            }
            let pageUrl = `/${pagePath.replace(new RegExp(`\\.+(?:${pageExtensions.join('|')})$`), '').replace(/\\/g, '/')}`.replace(/\/index$/, '');
            pageUrl = pageUrl === '' ? '/' : pageUrl;
            const bundleFile = pageUrl === '/' ? '/index.js' : `${pageUrl}.js`;
            const name = path_1.join('static', buildId, 'pages', bundleFile);
            const absolutePagePath = pagePath.startsWith('next/dist/pages') ? require.resolve(pagePath) : path_1.join(pagesDir, pagePath);
            page = path_1.posix.normalize(pageUrl);
            return new Promise((resolve, reject) => {
                // Makes sure the page that is being kept in on-demand-entries matches the webpack output
                const normalizedPage = normalizePage(page);
                const entryInfo = entries[normalizedPage];
                if (entryInfo) {
                    if (entryInfo.status === BUILT) {
                        resolve();
                        return;
                    }
                    if (entryInfo.status === BUILDING) {
                        doneCallbacks.once(normalizedPage, handleCallback);
                        return;
                    }
                }
                Log.event(`build page: ${normalizedPage}`);
                entries[normalizedPage] = { name, absolutePagePath, status: ADDED };
                doneCallbacks.once(normalizedPage, handleCallback);
                invalidator.invalidate();
                function handleCallback(err) {
                    if (err)
                        return reject(err);
                    const { name } = entries[normalizedPage];
                    let serverPage = path_1.join(dir, distDir, 'server', name);
                    const clientPage = path_1.join(dir, distDir, name);
                    try {
                        require('next/config').setConfig({
                            serverRuntimeConfig,
                            publicRuntimeConfig
                        });
                        let mod = require(serverPage);
                        mod = mod.default || mod;
                        if (mod && mod.__nextAmpOnly) {
                            fs_1.default.unlinkSync(clientPage);
                        }
                    }
                    catch (err) {
                        if (err.code !== 'ENOENT' && err.code !== 'MODULE_NOT_FOUND') {
                            return reject(err);
                        }
                    }
                    resolve();
                }
            });
        },
        middleware() {
            return (req, res, next) => {
                if (stopped) {
                    // If this handler is stopped, we need to reload the user's browser.
                    // So the user could connect to the actually running handler.
                    res.statusCode = 302;
                    res.setHeader('Location', req.url);
                    res.end('302');
                }
                else if (reloading) {
                    // Webpack config is reloading. So, we need to wait until it's done and
                    // reload user's browser.
                    // So the user could connect to the new handler and webpack setup.
                    this.waitUntilReloaded()
                        .then(() => {
                        res.statusCode = 302;
                        res.setHeader('Location', req.url);
                        res.end('302');
                    });
                }
                else {
                    if (!/^\/_next\/on-demand-entries-ping/.test(req.url))
                        return next();
                    const { query } = url_1.parse(req.url, true);
                    const page = query.page;
                    if (!page)
                        return next();
                    // Upgrade request to EventSource
                    req.socket.setKeepAlive(true);
                    res.writeHead(200, evtSourceHeaders);
                    res.write('\n');
                    const startId = req.headers['user-agent'] + req.connection.remoteAddress;
                    let clientId = startId;
                    let numSameClient = 0;
                    while (clients.has(clientId)) {
                        numSameClient++;
                        clientId = startId + numSameClient;
                    }
                    if (numSameClient > 1) {
                        // If the user has too many tabs with Next.js open in the same browser,
                        // they might be exceeding the max number of concurrent request.
                        // This varies per browser so we can only guess if this is the cause of
                        // a slow request and show a warning that this might be why
                        console.warn(`\nWarn: You are opening multiple tabs of the same site in the same browser, this could cause requests to stall. https://err.sh/zeit/next.js/multi-tabs`);
                    }
                    clients.set(clientId, res);
                    const runPing = () => {
                        const data = handlePing(query.page);
                        if (!data)
                            return;
                        res.write('data: ' + JSON.stringify(data) + '\n\n');
                    };
                    const pingInterval = setInterval(() => runPing(), 5000);
                    req.on('close', () => {
                        clients.delete(clientId);
                        clearInterval(pingInterval);
                    });
                    // Do initial ping right after EventSource is finished being set up
                    runPing();
                }
            };
        }
    };
}
exports.default = onDemandEntryHandler;
function disposeInactiveEntries(devMiddleware, entries, lastAccessPages, maxInactiveAge) {
    const disposingPages = [];
    Object.keys(entries).forEach((page) => {
        const { lastActiveTime, status } = entries[page];
        // This means this entry is currently building or just added
        // We don't need to dispose those entries.
        if (status !== BUILT)
            return;
        // We should not build the last accessed page even we didn't get any pings
        // Sometimes, it's possible our XHR ping to wait before completing other requests.
        // In that case, we should not dispose the current viewing page
        if (lastAccessPages.includes(page))
            return;
        if (Date.now() - lastActiveTime > maxInactiveAge) {
            disposingPages.push(page);
        }
    });
    if (disposingPages.length > 0) {
        disposingPages.forEach((page) => {
            delete entries[page];
        });
        Log.event(`disposing inactive page(s): ${disposingPages.join(', ')}`);
        devMiddleware.invalidate();
    }
}
// /index and / is the same. So, we need to identify both pages as the same.
// This also applies to sub pages as well.
function normalizePage(page) {
    const unixPagePath = page.replace(/\\/g, '/');
    if (unixPagePath === '/index' || unixPagePath === '/') {
        return '/';
    }
    return unixPagePath.replace(/\/index$/, '');
}
exports.normalizePage = normalizePage;
// Make sure only one invalidation happens at a time
// Otherwise, webpack hash gets changed and it'll force the client to reload.
class Invalidator {
    constructor(devMiddleware, multiCompiler) {
        this.multiCompiler = multiCompiler;
        this.devMiddleware = devMiddleware;
        // contains an array of types of compilers currently building
        this.building = false;
        this.rebuildAgain = false;
    }
    invalidate() {
        // If there's a current build is processing, we won't abort it by invalidating.
        // (If aborted, it'll cause a client side hard reload)
        // But let it to invalidate just after the completion.
        // So, it can re-build the queued pages at once.
        if (this.building) {
            this.rebuildAgain = true;
            return;
        }
        this.building = true;
        // Work around a bug in webpack, calling `invalidate` on Watching.js
        // doesn't trigger the invalid call used to keep track of the `.done` hook on multiCompiler
        for (const compiler of this.multiCompiler.compilers) {
            compiler.hooks.invalid.call();
        }
        this.devMiddleware.invalidate();
    }
    startBuilding() {
        this.building = true;
    }
    doneBuilding() {
        this.building = false;
        if (this.rebuildAgain) {
            this.rebuildAgain = false;
            this.invalidate();
        }
    }
}
