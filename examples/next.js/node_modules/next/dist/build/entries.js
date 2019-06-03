"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const querystring_1 = require("querystring");
const constants_1 = require("../lib/constants");
function createPagesMapping(pagePaths, extensions) {
    const pages = pagePaths.reduce((result, pagePath) => {
        let page = `${pagePath.replace(new RegExp(`\\.+(${extensions.join('|')})$`), '').replace(/\\/g, '/')}`.replace(/\/index$/, '');
        page = page === '/index' ? '/' : page;
        result[page === '' ? '/' : page] = path_1.join(constants_1.PAGES_DIR_ALIAS, pagePath).replace(/\\/g, '/');
        return result;
    }, {});
    pages['/_app'] = pages['/_app'] || 'next/dist/pages/_app';
    pages['/_error'] = pages['/_error'] || 'next/dist/pages/_error';
    pages['/_document'] = pages['/_document'] || 'next/dist/pages/_document';
    return pages;
}
exports.createPagesMapping = createPagesMapping;
function createEntrypoints(pages, target, buildId, dynamicBuildId, config) {
    const client = {};
    const server = {};
    const defaultServerlessOptions = {
        absoluteAppPath: pages['/_app'],
        absoluteDocumentPath: pages['/_document'],
        absoluteErrorPath: pages['/_error'],
        distDir: constants_1.DOT_NEXT_ALIAS,
        assetPrefix: config.assetPrefix,
        generateEtags: config.generateEtags,
        ampBindInitData: config.experimental.ampBindInitData,
        dynamicBuildId
    };
    Object.keys(pages).forEach((page) => {
        const absolutePagePath = pages[page];
        const bundleFile = page === '/' ? '/index.js' : `${page}.js`;
        const bundlePath = path_1.join('static', buildId, 'pages', bundleFile);
        if (target === 'serverless' && page !== '/_app' && page !== '/_document') {
            const serverlessLoaderOptions = Object.assign({ page, absolutePagePath }, defaultServerlessOptions);
            server[path_1.join('pages', bundleFile)] = `next-serverless-loader?${querystring_1.stringify(serverlessLoaderOptions)}!`;
        }
        else if (target === 'server') {
            server[bundlePath] = [absolutePagePath];
        }
        if (page === '/_document') {
            return;
        }
        client[bundlePath] = `next-client-pages-loader?${querystring_1.stringify({ page, absolutePagePath })}!`;
    });
    return {
        client,
        server
    };
}
exports.createEntrypoints = createEntrypoints;
