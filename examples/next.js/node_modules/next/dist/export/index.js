"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const child_process_1 = require("child_process");
const recursive_copy_1 = __importDefault(require("recursive-copy"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const path_1 = require("path");
const fs_1 = require("fs");
const next_config_1 = __importDefault(require("next-server/next-config"));
const constants_1 = require("next-server/constants");
const tty_aware_progress_1 = __importDefault(require("tty-aware-progress"));
const util_1 = require("util");
const recursive_delete_1 = require("../lib/recursive-delete");
const index_1 = require("../build/output/index");
const mkdirp = util_1.promisify(mkdirp_1.default);
async function default_1(dir, options, configuration) {
    function log(message) {
        if (options.silent)
            return;
        console.log(message);
    }
    dir = path_1.resolve(dir);
    const nextConfig = configuration || next_config_1.default(constants_1.PHASE_EXPORT, dir);
    const concurrency = options.concurrency || 10;
    const threads = options.threads || Math.max(os_1.cpus().length - 1, 1);
    const distDir = path_1.join(dir, nextConfig.distDir);
    if (nextConfig.target !== 'server')
        throw new Error('Cannot export when target is not server. https://err.sh/zeit/next.js/next-export-serverless');
    log(`> using build directory: ${distDir}`);
    if (!fs_1.existsSync(distDir)) {
        throw new Error(`Build directory ${distDir} does not exist. Make sure you run "next build" before running "next start" or "next export".`);
    }
    const buildId = fs_1.readFileSync(path_1.join(distDir, constants_1.BUILD_ID_FILE), 'utf8');
    const pagesManifest = require(path_1.join(distDir, constants_1.SERVER_DIRECTORY, constants_1.PAGES_MANIFEST));
    const pages = Object.keys(pagesManifest);
    const defaultPathMap = {};
    for (const page of pages) {
        // _document and _app are not real pages.
        if (page === '/_document' || page === '/_app') {
            continue;
        }
        if (page === '/_error') {
            defaultPathMap['/404.html'] = { page };
            continue;
        }
        defaultPathMap[page] = { page };
    }
    // Initialize the output directory
    const outDir = options.outdir;
    await recursive_delete_1.recursiveDelete(path_1.join(outDir));
    await mkdirp(path_1.join(outDir, '_next', buildId));
    // Copy static directory
    if (fs_1.existsSync(path_1.join(dir, 'static'))) {
        log('  copying "static" directory');
        await recursive_copy_1.default(path_1.join(dir, 'static'), path_1.join(outDir, 'static'), { expand: true });
    }
    // Copy .next/static directory
    if (fs_1.existsSync(path_1.join(distDir, constants_1.CLIENT_STATIC_FILES_PATH))) {
        log('  copying "static build" directory');
        await recursive_copy_1.default(path_1.join(distDir, constants_1.CLIENT_STATIC_FILES_PATH), path_1.join(outDir, '_next', constants_1.CLIENT_STATIC_FILES_PATH));
    }
    // Get the exportPathMap from the config file
    if (typeof nextConfig.exportPathMap !== 'function') {
        console.log(`> No "exportPathMap" found in "${constants_1.CONFIG_FILE}". Generating map from "./pages"`);
        nextConfig.exportPathMap = async (defaultMap) => {
            return defaultMap;
        };
    }
    // Start the rendering process
    const renderOpts = {
        dir,
        buildId,
        nextExport: true,
        assetPrefix: nextConfig.assetPrefix.replace(/\/$/, ''),
        distDir,
        dev: false,
        staticMarkup: false,
        hotReloader: null
    };
    const { serverRuntimeConfig, publicRuntimeConfig } = nextConfig;
    if (publicRuntimeConfig) {
        renderOpts.runtimeConfig = publicRuntimeConfig;
    }
    // We need this for server rendering the Link component.
    global.__NEXT_DATA__ = {
        nextExport: true
    };
    log(`  launching ${threads} threads with concurrency of ${concurrency} per thread`);
    const exportPathMap = await nextConfig.exportPathMap(defaultPathMap, { dev: false, dir, outDir, distDir, buildId });
    const exportPaths = Object.keys(exportPathMap);
    const progress = !options.silent && tty_aware_progress_1.default(exportPaths.length);
    const chunks = exportPaths.reduce((result, route, i) => {
        const worker = i % threads;
        if (!result[worker]) {
            result[worker] = { paths: [], pathMap: {} };
        }
        result[worker].pathMap[route] = exportPathMap[route];
        result[worker].paths.push(route);
        return result;
    }, []);
    const ampValidations = {};
    let hadValidationError = false;
    await Promise.all(chunks.map(chunk => new Promise((resolve, reject) => {
        const worker = child_process_1.fork(require.resolve('./worker'), [], {
            env: process.env
        });
        worker.send({
            distDir,
            buildId,
            exportPaths: chunk.paths,
            exportPathMap: chunk.pathMap,
            outDir,
            renderOpts,
            serverRuntimeConfig,
            concurrency
        });
        worker.on('message', ({ type, payload }) => {
            if (type === 'progress' && progress) {
                progress();
            }
            else if (type === 'error') {
                reject(payload);
            }
            else if (type === 'done') {
                resolve();
            }
            else if (type === 'amp-validation') {
                ampValidations[payload.page] = payload.result;
                hadValidationError = hadValidationError || payload.result.errors.length;
            }
        });
    })));
    if (Object.keys(ampValidations).length) {
        console.log(index_1.formatAmpMessages(ampValidations));
    }
    if (hadValidationError) {
        throw new Error(`AMP Validation caused the export to fail. https://err.sh/zeit/next.js/amp-export-validation`);
    }
    // Add an empty line to the console for the better readability.
    log('');
}
exports.default = default_1;
