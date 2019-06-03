"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_sources_1 = require("webpack-sources");
const constants_1 = require("next-server/constants");
// This plugin creates a pages-manifest.json from page entrypoints.
// This is used for mapping paths like `/` to `.next/server/static/<buildid>/pages/index.js` when doing SSR
// It's also used by next export to provide defaultPathMap
class PagesManifestPlugin {
    apply(compiler) {
        compiler.hooks.emit.tap('NextJsPagesManifest', (compilation) => {
            const { chunks } = compilation;
            const pages = {};
            for (const chunk of chunks) {
                const result = constants_1.ROUTE_NAME_REGEX.exec(chunk.name);
                if (!result) {
                    continue;
                }
                const pagePath = result[1];
                if (!pagePath) {
                    continue;
                }
                // Write filename, replace any backslashes in path (on windows) with forwardslashes for cross-platform consistency.
                pages[`/${pagePath.replace(/\\/g, '/')}`] = chunk.name.replace(/\\/g, '/');
            }
            if (typeof pages['/index'] !== 'undefined') {
                pages['/'] = pages['/index'];
            }
            compilation.assets[constants_1.PAGES_MANIFEST] = new webpack_sources_1.RawSource(JSON.stringify(pages));
        });
    }
}
exports.default = PagesManifestPlugin;
