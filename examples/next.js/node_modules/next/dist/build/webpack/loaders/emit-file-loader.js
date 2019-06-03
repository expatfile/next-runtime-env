"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loader_utils_1 = __importDefault(require("loader-utils"));
module.exports = function (content, sourceMap) {
    this.cacheable();
    const callback = this.async();
    const resourcePath = this.resourcePath;
    const query = loader_utils_1.default.getOptions(this);
    // Allows you to do checks on the file name. For example it's used to check if there's both a .js and .jsx file.
    if (query.validateFileName) {
        try {
            query.validateFileName(resourcePath);
        }
        catch (err) {
            callback(err);
            return;
        }
    }
    const name = query.name || '[hash].[ext]';
    const context = query.context || this.rootContext || this.options.context;
    const regExp = query.regExp;
    const opts = { context, content, regExp };
    const interpolateName = query.interpolateName || ((name) => name);
    const interpolatedName = interpolateName(loader_utils_1.default.interpolateName(this, name, opts), { name, opts });
    const emit = (code, map) => {
        this.emitFile(interpolatedName, code, map);
        callback(null, code, map);
    };
    if (query.transform) {
        const transformed = query.transform({ content, sourceMap, interpolatedName });
        return emit(transformed.content, transformed.sourceMap);
    }
    return emit(content, sourceMap);
};
