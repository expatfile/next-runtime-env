"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mkdirp_1 = __importDefault(require("mkdirp"));
const util_1 = require("util");
const path_1 = require("path");
const render_1 = require("next-server/dist/server/render");
const fs_1 = require("fs");
const async_sema_1 = __importDefault(require("async-sema"));
const amphtml_validator_1 = __importDefault(require("amphtml-validator"));
const load_components_1 = require("next-server/dist/server/load-components");
const envConfig = require('next-server/config');
const mkdirp = util_1.promisify(mkdirp_1.default);
const writeFileP = util_1.promisify(fs_1.writeFile);
const accessP = util_1.promisify(fs_1.access);
global.__NEXT_DATA__ = {
    nextExport: true
};
process.on('message', async ({ distDir, buildId, exportPaths, exportPathMap, outDir, renderOpts, serverRuntimeConfig, concurrency }) => {
    const sema = new async_sema_1.default(concurrency, { capacity: exportPaths.length });
    try {
        const work = async (path) => {
            await sema.acquire();
            const ampPath = `${path === '/' ? '/index' : path}.amp`;
            const { page, query = {} } = exportPathMap[path];
            delete query.ampOnly;
            delete query.hasAmp;
            delete query.ampPath;
            delete query.amphtml;
            const req = { url: path };
            const res = {};
            envConfig.setConfig({
                serverRuntimeConfig,
                publicRuntimeConfig: renderOpts.runtimeConfig
            });
            let htmlFilename = `${path}${path_1.sep}index.html`;
            const pageExt = path_1.extname(page);
            const pathExt = path_1.extname(path);
            // Make sure page isn't a folder with a dot in the name e.g. `v1.2`
            if (pageExt !== pathExt && pathExt !== '') {
                // If the path has an extension, use that as the filename instead
                htmlFilename = path;
            }
            else if (path === '/') {
                // If the path is the root, just use index.html
                htmlFilename = 'index.html';
            }
            const baseDir = path_1.join(outDir, path_1.dirname(htmlFilename));
            const htmlFilepath = path_1.join(outDir, htmlFilename);
            await mkdirp(baseDir);
            const components = await load_components_1.loadComponents(distDir, buildId, page);
            const curRenderOpts = Object.assign({}, components, renderOpts, { ampPath });
            const html = await render_1.renderToHTML(req, res, page, query, curRenderOpts);
            const validateAmp = async (html, page) => {
                const validator = await amphtml_validator_1.default.getInstance();
                const result = validator.validateString(html);
                const errors = result.errors.filter(e => e.severity === 'ERROR');
                const warnings = result.errors.filter(e => e.severity !== 'ERROR');
                if (warnings.length || errors.length) {
                    process.send({
                        type: 'amp-validation',
                        payload: {
                            page,
                            result: {
                                errors,
                                warnings
                            }
                        }
                    });
                }
            };
            if (curRenderOpts.amphtml && query.amp) {
                await validateAmp(html, path);
            }
            if ((curRenderOpts.amphtml && !query.amp) || curRenderOpts.hasAmp) {
                // we need to render a clean AMP version
                const ampHtmlFilename = `${ampPath}${path_1.sep}index.html`;
                const ampBaseDir = path_1.join(outDir, path_1.dirname(ampHtmlFilename));
                const ampHtmlFilepath = path_1.join(outDir, ampHtmlFilename);
                try {
                    await accessP(ampHtmlFilepath);
                }
                catch (_) {
                    // make sure it doesn't exist from manual mapping
                    const ampHtml = await render_1.renderToHTML(req, res, page, Object.assign({}, query, { amp: 1 }), curRenderOpts);
                    await validateAmp(ampHtml, page + '?amp=1');
                    await mkdirp(ampBaseDir);
                    await writeFileP(ampHtmlFilepath, ampHtml, 'utf8');
                }
            }
            await writeFileP(htmlFilepath, html, 'utf8');
            process.send({ type: 'progress' });
            sema.release();
        };
        await Promise.all(exportPaths.map(work));
        process.send({ type: 'done' });
    }
    catch (err) {
        console.error(err);
        process.send({ type: 'error', payload: err });
    }
});
