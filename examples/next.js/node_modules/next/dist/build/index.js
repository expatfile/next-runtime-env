"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const constants_1 = require("next-server/constants");
const next_config_1 = __importDefault(require("next-server/next-config"));
const index_js_1 = __importDefault(require("next/dist/compiled/nanoid/index.js"));
const async_sema_1 = __importDefault(require("async-sema"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const format_webpack_messages_1 = __importDefault(require("../client/dev-error-overlay/format-webpack-messages"));
const recursive_delete_1 = require("../lib/recursive-delete");
const compiler_1 = require("./compiler");
const entries_1 = require("./entries");
const flying_shuttle_1 = require("./flying-shuttle");
const generate_build_id_1 = require("./generate-build-id");
const is_writeable_1 = require("./is-writeable");
const utils_1 = require("./utils");
const webpack_config_1 = __importDefault(require("./webpack-config"));
const write_build_id_1 = require("./write-build-id");
const util_1 = require("util");
const unlink = util_1.promisify(fs_1.default.unlink);
async function build(dir, conf = null) {
    if (!(await is_writeable_1.isWriteable(dir))) {
        throw new Error('> Build directory is not writeable. https://err.sh/zeit/next.js/build-dir-not-writeable');
    }
    const debug = process.env.__NEXT_BUILDER_EXPERIMENTAL_DEBUG === 'true' ||
        process.env.__NEXT_BUILDER_EXPERIMENTAL_DEBUG === '1';
    console.log(debug
        ? 'Creating a development build ...'
        : 'Creating an optimized production build ...');
    console.log();
    const config = next_config_1.default(constants_1.PHASE_PRODUCTION_BUILD, dir, conf);
    const buildId = debug
        ? 'unoptimized-build'
        : await generate_build_id_1.generateBuildId(config.generateBuildId, index_js_1.default);
    const distDir = path_1.default.join(dir, config.distDir);
    const pagesDir = path_1.default.join(dir, 'pages');
    const isFlyingShuttle = Boolean(config.experimental.flyingShuttle &&
        !process.env.__NEXT_BUILDER_EXPERIMENTAL_PAGE);
    const selectivePageBuilding = Boolean(isFlyingShuttle || process.env.__NEXT_BUILDER_EXPERIMENTAL_PAGE);
    if (selectivePageBuilding && config.target !== 'serverless') {
        throw new Error(`Cannot use ${isFlyingShuttle ? 'flying shuttle' : '`now dev`'} without the serverless target.`);
    }
    const selectivePageBuildingCacheIdentifier = selectivePageBuilding
        ? await utils_1.getCacheIdentifier({
            pagesDirectory: pagesDir,
            env: config.env || {},
        })
        : 'noop';
    let flyingShuttle;
    if (isFlyingShuttle) {
        console.log(chalk_1.default.magenta('Building with Flying Shuttle enabled ...'));
        console.log();
        await recursive_delete_1.recursiveDelete(distDir, /^(?!cache(?:[\/\\]|$)).*$/);
        flyingShuttle = new flying_shuttle_1.FlyingShuttle({
            buildId,
            pagesDirectory: pagesDir,
            distDirectory: distDir,
            cacheIdentifier: selectivePageBuildingCacheIdentifier,
        });
    }
    let pagePaths;
    if (process.env.__NEXT_BUILDER_EXPERIMENTAL_PAGE) {
        pagePaths = await utils_1.getSpecifiedPages(dir, process.env.__NEXT_BUILDER_EXPERIMENTAL_PAGE, config.pageExtensions);
    }
    else {
        pagePaths = await utils_1.collectPages(pagesDir, config.pageExtensions);
    }
    if (flyingShuttle && (await flyingShuttle.hasShuttle())) {
        const _unchangedPages = new Set(await flyingShuttle.getUnchangedPages());
        for (const unchangedPage of _unchangedPages) {
            const recalled = await flyingShuttle.restorePage(unchangedPage);
            if (recalled) {
                continue;
            }
            _unchangedPages.delete(unchangedPage);
        }
        const unchangedPages = await Promise.all([..._unchangedPages].map(async (page) => {
            const file = await utils_1.getFileForPage({
                page,
                pagesDirectory: pagesDir,
                pageExtensions: config.pageExtensions,
            });
            if (file) {
                return file;
            }
            return Promise.reject(new Error(`Failed to locate page file: ${page}. ` +
                `Did pageExtensions change? We can't recover from this yet.`));
        }));
        const pageSet = new Set(pagePaths);
        for (const unchangedPage of unchangedPages) {
            pageSet.delete(unchangedPage);
        }
        pagePaths = [...pageSet];
    }
    const mappedPages = entries_1.createPagesMapping(pagePaths, config.pageExtensions);
    const entrypoints = entries_1.createEntrypoints(mappedPages, config.target, buildId, 
    /* dynamicBuildId */ selectivePageBuilding, config);
    const configs = await Promise.all([
        webpack_config_1.default(dir, {
            debug,
            buildId,
            isServer: false,
            config,
            target: config.target,
            selectivePageBuildingCacheIdentifier,
            entrypoints: entrypoints.client,
            selectivePageBuilding,
        }),
        webpack_config_1.default(dir, {
            debug,
            buildId,
            isServer: true,
            config,
            target: config.target,
            selectivePageBuildingCacheIdentifier,
            entrypoints: entrypoints.server,
            selectivePageBuilding,
        }),
    ]);
    let result = { warnings: [], errors: [] };
    if (config.target === 'serverless') {
        if (config.publicRuntimeConfig)
            throw new Error('Cannot use publicRuntimeConfig with target=serverless https://err.sh/zeit/next.js/serverless-publicRuntimeConfig');
        const clientResult = await compiler_1.runCompiler(configs[0]);
        // Fail build if clientResult contains errors
        if (clientResult.errors.length > 0) {
            result = {
                warnings: [...clientResult.warnings],
                errors: [...clientResult.errors],
            };
        }
        else {
            const serverResult = await compiler_1.runCompiler(configs[1]);
            result = {
                warnings: [...clientResult.warnings, ...serverResult.warnings],
                errors: [...clientResult.errors, ...serverResult.errors],
            };
        }
    }
    else {
        result = await compiler_1.runCompiler(configs);
    }
    result = format_webpack_messages_1.default(result);
    const pages = Object.keys(mappedPages);
    const sema = new async_sema_1.default(20, { capacity: pages.length });
    await Promise.all(pages.map(async (page) => {
        await sema.acquire();
        page = page === '/' ? '/index' : page;
        if (constants_1.BLOCKED_PAGES.includes(page)) {
            return sema.release();
        }
        const serverPage = path_1.default.join(distDir, config.target === 'serverless' ? 'serverless/pages' : `server/static/${buildId}/pages`, page + '.js');
        const clientPage = path_1.default.join(distDir, 'static', buildId, 'pages', page + '.js');
        try {
            require('next/config').setConfig({
                publicRuntimeConfig: config.publicRuntimeConfig,
                serverRuntimeConfig: config.serverRuntimeConfig
            });
            let mod = require(serverPage);
            mod = mod.default || mod;
            if (mod && mod.__nextAmpOnly) {
                await unlink(clientPage);
            }
        }
        catch (err) {
            if (err.code !== 'ENOENT' && err.code !== 'MODULE_NOT_FOUND') {
                throw err;
            }
        }
        sema.release();
    }));
    if (isFlyingShuttle) {
        console.log();
    }
    if (result.errors.length > 0) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (result.errors.length > 1) {
            result.errors.length = 1;
        }
        const error = result.errors.join('\n\n');
        console.error(chalk_1.default.red('Failed to compile.\n'));
        console.error(error);
        console.error();
        if (error.indexOf('private-next-pages') > -1) {
            throw new Error('> webpack config.resolve.alias was incorrectly overriden. https://err.sh/zeit/next.js/invalid-resolve-alias');
        }
        throw new Error('> Build failed because of webpack errors');
    }
    else if (result.warnings.length > 0) {
        console.warn(chalk_1.default.yellow('Compiled with warnings.\n'));
        console.warn(result.warnings.join('\n\n'));
        console.warn();
    }
    else {
        console.log(chalk_1.default.green('Compiled successfully.\n'));
    }
    utils_1.printTreeView(Object.keys(mappedPages));
    if (flyingShuttle) {
        await flyingShuttle.save();
    }
    await write_build_id_1.writeBuildId(distDir, buildId, selectivePageBuilding);
}
exports.default = build;
