"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_1 = __importDefault(require("webpack"));
const webpack_sources_1 = require("webpack-sources");
const path_1 = require("path");
const constants_1 = require("next-server/constants");
const SSR_MODULE_CACHE_FILENAME = 'ssr-module-cache.js';
// By default webpack keeps initialized modules per-module.
// This means that if you have 2 entrypoints loaded into the same app
// they will *not* share the same instance
// This creates many issues when developers / libraries rely on the singleton pattern
// As this pattern assumes every module will have 1 instance
// This plugin overrides webpack's code generation step to replace `installedModules`
// The replacement is a require for a file that's also generated here that only exports an empty object
// Because of Node.js's single instance modules this makes webpack share all initialized instances
// Do note that this module is only geared towards the `node` compilation target.
// For the client side compilation we use `runtimeChunk: 'single'`
class NextJsSsrImportPlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        const { outputPath } = this.options;
        compiler.hooks.emit.tapAsync('NextJsSSRModuleCache', (compilation, callback) => {
            compilation.assets[SSR_MODULE_CACHE_FILENAME] = new webpack_sources_1.RawSource(`
      /* This cache is used by webpack for instantiated modules */
      module.exports = {}
      `);
            callback();
        });
        compiler.hooks.compilation.tap('NextJsSSRModuleCache', (compilation) => {
            compilation.mainTemplate.hooks.localVars.intercept({
                register(tapInfo) {
                    if (tapInfo.name === 'MainTemplate') {
                        const originalFn = tapInfo.fn;
                        tapInfo.fn = (source, chunk) => {
                            // If the chunk is not part of the pages directory we have to keep the original behavior,
                            // otherwise webpack will error out when the file is used before the compilation finishes
                            // this is the case with mini-css-extract-plugin
                            if (!constants_1.IS_BUNDLED_PAGE_REGEX.exec(chunk.name)) {
                                return originalFn(source, chunk);
                            }
                            const pagePath = path_1.join(outputPath, path_1.dirname(chunk.name));
                            let relativePathToBaseDir = path_1.relative(pagePath, path_1.join(outputPath, SSR_MODULE_CACHE_FILENAME));
                            // Make sure even in windows, the path looks like in unix
                            // Node.js require system will convert it accordingly
                            const relativePathToBaseDirNormalized = relativePathToBaseDir.replace(/\\/g, '/');
                            return webpack_1.default.Template.asString([
                                source,
                                '// The module cache',
                                `var installedModules = require('${relativePathToBaseDirNormalized}');`
                            ]);
                        };
                    }
                    return tapInfo;
                }
            });
        });
    }
}
exports.default = NextJsSsrImportPlugin;
