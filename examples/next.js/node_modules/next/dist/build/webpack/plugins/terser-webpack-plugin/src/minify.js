"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable
  arrow-body-style
*/
const terser_1 = require("terser");
const buildTerserOptions = ({ ecma, warnings, parse = {}, compress = {}, mangle, module, output, toplevel, ie8, 
/* eslint-disable camelcase */
keep_classnames, keep_fnames, 
/* eslint-enable camelcase */
safari10, } = {}) => ({
    ecma,
    warnings,
    parse: Object.assign({}, parse),
    compress: typeof compress === 'boolean' ? compress : Object.assign({}, compress),
    // eslint-disable-next-line no-nested-ternary
    mangle: mangle == null
        ? true
        : typeof mangle === 'boolean'
            ? mangle
            : Object.assign({}, mangle),
    output: Object.assign({ shebang: true, comments: false, beautify: false, semicolons: true }, output),
    module,
    toplevel,
    ie8,
    keep_classnames,
    keep_fnames,
    safari10,
});
const minify = (options) => {
    const { file, input, inputSourceMap } = options;
    // Copy terser options
    const terserOptions = buildTerserOptions(options.terserOptions);
    // Add source map data
    if (inputSourceMap) {
        terserOptions.sourceMap = {
            content: inputSourceMap,
        };
    }
    const { error, map, code, warnings } = terser_1.minify({ [file]: input }, terserOptions);
    return { error, map, code, warnings };
};
exports.default = minify;
