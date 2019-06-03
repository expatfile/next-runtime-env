"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loader_utils_1 = __importDefault(require("loader-utils"));
const minify_1 = __importDefault(require("../plugins/terser-webpack-plugin/src/minify"));
const nextMiniferLoader = function (source) {
    this.cacheable();
    const options = loader_utils_1.default.getOptions(this) || {};
    const { error, code } = minify_1.default({
        file: 'noop',
        input: source,
        terserOptions: Object.assign({}, options.terserOptions, { sourceMap: false }),
    });
    if (error) {
        this.callback(new Error(`Error from Terser: ${error.message}`));
        return;
    }
    this.callback(undefined, code);
    return;
};
exports.default = nextMiniferLoader;
