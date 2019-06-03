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
const path_1 = require("path");
const webpack_dev_middleware_1 = __importDefault(require("webpack-dev-middleware"));
const webpack_hot_middleware_1 = __importDefault(require("webpack-hot-middleware"));
const error_overlay_middleware_1 = __importDefault(require("./lib/error-overlay-middleware"));
const on_demand_entry_handler_1 = __importStar(require("./on-demand-entry-handler"));
const webpack_1 = __importDefault(require("webpack"));
const webpack_config_1 = __importDefault(require("../build/webpack-config"));
const constants_1 = require("next-server/constants");
const constants_2 = require("../lib/constants");
const router_1 = require("next-server/dist/server/router");
const entries_1 = require("../build/entries");
const output_1 = require("../build/output");
const find_page_file_1 = require("./lib/find-page-file");
const recursive_delete_1 = require("../lib/recursive-delete");
async function renderScriptError(res, error) {
    // Asks CDNs and others to not to cache the errored page
    res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    if (error.code === 'ENOENT' || error.message === 'INVALID_BUILD_ID') {
        res.statusCode = 404;
        res.end('404 - Not Found');
        return;
    }
    console.error(error.stack);
    res.statusCode = 500;
    res.end('500 - Internal Error');
}
exports.renderScriptError = renderScriptError;
function addCorsSupport(req, res) {
    if (!req.headers.origin) {
        return { preflight: false };
    }
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    // Based on https://github.com/primus/access-control/blob/4cf1bc0e54b086c91e6aa44fb14966fa5ef7549c/index.js#L158
    if (req.headers['access-control-request-headers']) {
        res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
    }
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return { preflight: true };
    }
    return { preflight: false };
}
const matchNextPageBundleRequest = router_1.route('/_next/static/:buildId/pages/:path*.js(.map)?');
// Recursively look up the issuer till it ends up at the root
function findEntryModule(issuer) {
    if (issuer.issuer) {
        return findEntryModule(issuer.issuer);
    }
    return issuer;
}
function erroredPages(compilation, options = { enhanceName: (name) => name }) {
    const failedPages = {};
    for (const error of compilation.errors) {
        const entryModule = findEntryModule(error.origin);
        const { name } = entryModule;
        if (!name) {
            continue;
        }
        // Only pages have to be reloaded
        if (!constants_1.IS_BUNDLED_PAGE_REGEX.test(name)) {
            continue;
        }
        const enhancedName = options.enhanceName(name);
        if (!failedPages[enhancedName]) {
            failedPages[enhancedName] = [];
        }
        failedPages[enhancedName].push(error);
    }
    return failedPages;
}
class HotReloader {
    constructor(dir, { config, buildId } = {}) {
        this.buildId = buildId;
        this.dir = dir;
        this.middlewares = [];
        this.webpackDevMiddleware = null;
        this.webpackHotMiddleware = null;
        this.initialized = false;
        this.stats = null;
        this.serverPrevDocumentHash = null;
        this.config = config;
    }
    async run(req, res, parsedUrl) {
        // Usually CORS support is not needed for the hot-reloader (this is dev only feature)
        // With when the app runs for multi-zones support behind a proxy,
        // the current page is trying to access this URL via assetPrefix.
        // That's when the CORS support is needed.
        const { preflight } = addCorsSupport(req, res);
        if (preflight) {
            return;
        }
        // When a request comes in that is a page bundle, e.g. /_next/static/<buildid>/pages/index.js
        // we have to compile the page using on-demand-entries, this middleware will handle doing that
        // by adding the page to on-demand-entries, waiting till it's done
        // and then the bundle will be served like usual by the actual route in server/index.js
        const handlePageBundleRequest = async (res, parsedUrl) => {
            const { pathname } = parsedUrl;
            const params = matchNextPageBundleRequest(pathname);
            if (!params) {
                return {};
            }
            if (params.buildId !== this.buildId) {
                return;
            }
            const page = `/${params.path.join('/')}`;
            if (page === '/_error' || constants_1.BLOCKED_PAGES.indexOf(page) === -1) {
                try {
                    await this.ensurePage(page);
                }
                catch (error) {
                    await renderScriptError(res, error);
                    return { finished: true };
                }
                const errors = await this.getCompilationErrors(page);
                if (errors.length > 0) {
                    await renderScriptError(res, errors[0]);
                    return { finished: true };
                }
            }
            return {};
        };
        const { finished } = await handlePageBundleRequest(res, parsedUrl);
        for (const fn of this.middlewares) {
            await new Promise((resolve, reject) => {
                fn(req, res, (err) => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
        }
        return { finished };
    }
    async clean() {
        return recursive_delete_1.recursiveDelete(path_1.join(this.dir, this.config.distDir));
    }
    async getWebpackConfig() {
        const pagesDir = path_1.join(this.dir, 'pages');
        const pagePaths = await Promise.all([
            find_page_file_1.findPageFile(pagesDir, '/_app', this.config.pageExtensions),
            find_page_file_1.findPageFile(pagesDir, '/_document', this.config.pageExtensions)
        ]);
        const pages = entries_1.createPagesMapping(pagePaths.filter(i => i !== null), this.config.pageExtensions);
        const entrypoints = entries_1.createEntrypoints(pages, 'server', this.buildId, false, this.config);
        let additionalClientEntrypoints = {};
        additionalClientEntrypoints[constants_1.CLIENT_STATIC_FILES_RUNTIME_AMP] = `.${path_1.sep}` + path_1.relative(this.dir, path_1.join(constants_2.NEXT_PROJECT_ROOT_DIST_CLIENT, 'amp-dev'));
        return [
            webpack_config_1.default(this.dir, { dev: true, isServer: false, config: this.config, buildId: this.buildId, entrypoints: Object.assign({}, entrypoints.client, additionalClientEntrypoints) }),
            webpack_config_1.default(this.dir, { dev: true, isServer: true, config: this.config, buildId: this.buildId, entrypoints: entrypoints.server })
        ];
    }
    async start() {
        await this.clean();
        const configs = await this.getWebpackConfig();
        const multiCompiler = webpack_1.default(configs);
        const buildTools = await this.prepareBuildTools(multiCompiler);
        this.assignBuildTools(buildTools);
        this.stats = (await this.waitUntilValid()).stats[0];
    }
    async stop(webpackDevMiddleware) {
        const middleware = webpackDevMiddleware || this.webpackDevMiddleware;
        if (middleware) {
            return new Promise((resolve, reject) => {
                middleware.close((err) => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
        }
    }
    async reload() {
        this.stats = null;
        await this.clean();
        const configs = await this.getWebpackConfig();
        const compiler = webpack_1.default(configs);
        const buildTools = await this.prepareBuildTools(compiler);
        this.stats = await this.waitUntilValid(buildTools.webpackDevMiddleware);
        const oldWebpackDevMiddleware = this.webpackDevMiddleware;
        this.assignBuildTools(buildTools);
        await this.stop(oldWebpackDevMiddleware);
    }
    assignBuildTools({ webpackDevMiddleware, webpackHotMiddleware, onDemandEntries }) {
        this.webpackDevMiddleware = webpackDevMiddleware;
        this.webpackHotMiddleware = webpackHotMiddleware;
        this.onDemandEntries = onDemandEntries;
        this.middlewares = [
            webpackDevMiddleware,
            webpackHotMiddleware,
            error_overlay_middleware_1.default({ dir: this.dir }),
            onDemandEntries.middleware()
        ];
    }
    async prepareBuildTools(multiCompiler) {
        output_1.watchCompiler(multiCompiler.compilers[0], multiCompiler.compilers[1]);
        // This plugin watches for changes to _document.js and notifies the client side that it should reload the page
        multiCompiler.compilers[1].hooks.done.tap('NextjsHotReloaderForServer', (stats) => {
            if (!this.initialized) {
                return;
            }
            const { compilation } = stats;
            // We only watch `_document` for changes on the server compilation
            // the rest of the files will be triggered by the client compilation
            const documentChunk = compilation.chunks.find(c => c.name === path_1.normalize(`static/${this.buildId}/pages/_document.js`));
            // If the document chunk can't be found we do nothing
            if (!documentChunk) {
                console.warn('_document.js chunk not found');
                return;
            }
            // Initial value
            if (this.serverPrevDocumentHash === null) {
                this.serverPrevDocumentHash = documentChunk.hash;
                return;
            }
            // If _document.js didn't change we don't trigger a reload
            if (documentChunk.hash === this.serverPrevDocumentHash) {
                return;
            }
            // Notify reload to reload the page, as _document.js was changed (different hash)
            this.send('reloadPage');
            this.serverPrevDocumentHash = documentChunk.hash;
        });
        multiCompiler.compilers[0].hooks.done.tap('NextjsHotReloaderForClient', (stats) => {
            const { compilation } = stats;
            const chunkNames = new Set(compilation.chunks
                .map((c) => c.name)
                .filter(name => constants_1.IS_BUNDLED_PAGE_REGEX.test(name)));
            if (this.initialized) {
                // detect chunks which have to be replaced with a new template
                // e.g, pages/index.js <-> pages/_error.js
                const addedPages = diff(chunkNames, this.prevChunkNames);
                const removedPages = diff(this.prevChunkNames, chunkNames);
                if (addedPages.size > 0) {
                    for (const addedPage of addedPages) {
                        let page = '/' + constants_1.ROUTE_NAME_REGEX.exec(addedPage)[1].replace(/\\/g, '/');
                        page = page === '/index' ? '/' : page;
                        this.send('addedPage', page);
                    }
                }
                if (removedPages.size > 0) {
                    for (const removedPage of removedPages) {
                        let page = '/' + constants_1.ROUTE_NAME_REGEX.exec(removedPage)[1].replace(/\\/g, '/');
                        page = page === '/index' ? '/' : page;
                        this.send('removedPage', page);
                    }
                }
            }
            this.initialized = true;
            this.stats = stats;
            this.prevChunkNames = chunkNames;
        });
        // We don’t watch .git/ .next/ and node_modules for changes
        const ignored = [
            /[\\/]\.git[\\/]/,
            /[\\/]\.next[\\/]/,
            /[\\/]node_modules[\\/]/
        ];
        let webpackDevMiddlewareConfig = {
            publicPath: `/_next/static/webpack`,
            noInfo: true,
            logLevel: 'silent',
            watchOptions: { ignored },
            writeToDisk: true
        };
        if (this.config.webpackDevMiddleware) {
            console.log(`> Using "webpackDevMiddleware" config function defined in ${this.config.configOrigin}.`);
            webpackDevMiddlewareConfig = this.config.webpackDevMiddleware(webpackDevMiddlewareConfig);
        }
        const webpackDevMiddleware = webpack_dev_middleware_1.default(multiCompiler, webpackDevMiddlewareConfig);
        const webpackHotMiddleware = webpack_hot_middleware_1.default(multiCompiler.compilers[0], {
            path: '/_next/webpack-hmr',
            log: false,
            heartbeat: 2500
        });
        const onDemandEntries = on_demand_entry_handler_1.default(webpackDevMiddleware, multiCompiler, Object.assign({ dir: this.dir, buildId: this.buildId, distDir: this.config.distDir, reload: this.reload.bind(this), pageExtensions: this.config.pageExtensions, publicRuntimeConfig: this.config.publicRuntimeConfig, serverRuntimeConfig: this.config.serverRuntimeConfig }, this.config.onDemandEntries));
        return {
            webpackDevMiddleware,
            webpackHotMiddleware,
            onDemandEntries
        };
    }
    waitUntilValid(webpackDevMiddleware) {
        const middleware = webpackDevMiddleware || this.webpackDevMiddleware;
        return new Promise((resolve) => {
            middleware.waitUntilValid(resolve);
        });
    }
    async getCompilationErrors(page) {
        const normalizedPage = on_demand_entry_handler_1.normalizePage(page);
        // When we are reloading, we need to wait until it's reloaded properly.
        await this.onDemandEntries.waitUntilReloaded();
        if (this.stats.hasErrors()) {
            const { compilation } = this.stats;
            const failedPages = erroredPages(compilation, {
                enhanceName(name) {
                    return '/' + constants_1.ROUTE_NAME_REGEX.exec(name)[1];
                }
            });
            // If there is an error related to the requesting page we display it instead of the first error
            if (failedPages[normalizedPage] && failedPages[normalizedPage].length > 0) {
                return failedPages[normalizedPage];
            }
            // If none were found we still have to show the other errors
            return this.stats.compilation.errors;
        }
        return [];
    }
    send(action, ...args) {
        this.webpackHotMiddleware.publish({ action, data: args });
    }
    async ensurePage(page) {
        // Make sure we don't re-build or dispose prebuilt pages
        if (page !== '/_error' && constants_1.BLOCKED_PAGES.indexOf(page) !== -1) {
            return;
        }
        return this.onDemandEntries.ensurePage(page);
    }
}
exports.default = HotReloader;
function diff(a, b) {
    return new Set([...a].filter((v) => !b.has(v)));
}
