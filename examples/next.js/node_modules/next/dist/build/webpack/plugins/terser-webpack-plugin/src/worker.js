"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const minify_1 = __importDefault(require("./minify"));
module.exports = (options, callback) => {
    try {
        // 'use strict' => this === undefined (Clean Scope)
        // Safer for possible security issues, albeit not critical at all here
        // eslint-disable-next-line no-new-func, no-param-reassign
        options = new Function('exports', 'require', 'module', '__filename', '__dirname', `'use strict'\nreturn ${options}`)(exports, require, module, __filename, __dirname);
        callback(null, minify_1.default(options));
    }
    catch (errors) {
        callback(errors);
    }
};
