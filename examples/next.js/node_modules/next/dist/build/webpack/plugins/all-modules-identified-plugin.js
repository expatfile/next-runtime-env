"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const path_1 = __importDefault(require("path"));
/**
 * From escape-string-regexp: https://github.com/sindresorhus/escape-string-regexp
 * brought here to reduce the bundle size
 * MIT License
 * Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
 */
const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
const escapeRegex = (str) => {
    if (typeof str !== 'string') {
        throw new TypeError('Expected a string');
    }
    return str.replace(matchOperatorsRe, '\\$&');
};
function getRawModuleIdentifier(m, dir) {
    // webpack impl:
    // new RawModule(
    //   "/* (ignored) */",
    //   `ignored ${context} ${request}`,
    //   `${request} (ignored)`
    // )
    let request = m.readableIdentifierStr.replace(/ \(ignored\)$/, '');
    let context = m.identifierStr
        .match(new RegExp(`^ignored (.*) ${escapeRegex(request)}$`))
        .pop();
    if (path_1.default.isAbsolute(request)) {
        request = path_1.default.relative(dir, request);
    }
    if (path_1.default.isAbsolute(context)) {
        context = path_1.default.relative(dir, context);
    }
    const identifier = `${context}::${request}`;
    console.warn(`> module identifier: RawModule ${m.identifier()} => ${identifier}`);
    return identifier;
}
function getMultiModuleIdentifier(m) {
    const mods = m.dependencies.map((d) => d.module);
    if (mods.some((d) => !Boolean(d))) {
        throw new Error('Cannot handle a MultiModule with moduleless dependencies');
    }
    const ids = mods.map((m) => m.id);
    if (ids.some((i) => !Boolean(i))) {
        throw new Error('Cannot handle a MultiModule dependency without a module id');
    }
    const identifier = ids.sort().join('::');
    console.warn(`> module identifier: MultiModule ${m.identifier()} => ${identifier}`);
    return identifier;
}
class AllModulesIdentifiedPlugin {
    constructor(dir) {
        this.dir = dir;
    }
    apply(compiler) {
        compiler.hooks.compilation.tap('AllModulesIdentifiedPlugin', compilation => {
            compilation.hooks.beforeModuleIds.tap('AllModulesIdentifiedPlugin', modules => {
                ;
                modules.forEach(m => {
                    if (m.id != null) {
                        return;
                    }
                    let identifier;
                    if (m.constructor && m.constructor.name === 'RawModule') {
                        identifier = getRawModuleIdentifier(m, this.dir);
                    }
                    else if (m.constructor &&
                        m.constructor.name === 'MultiModule') {
                        identifier = getMultiModuleIdentifier(m);
                    }
                    else {
                        throw new Error(`Do not know how to handle module: ${m.name}, ${m.identifier && m.identifier()}, ${m.type}, ${m.constructor && m.constructor.name}`);
                    }
                    // This hashing algorithm is consistent with how the rest of
                    // webpack does it (n.b. HashedModuleIdsPlugin)
                    m.id = crypto_1.createHash('md4')
                        .update(identifier)
                        .digest('hex')
                        .substr(0, 4);
                });
            });
        });
    }
}
exports.AllModulesIdentifiedPlugin = AllModulesIdentifiedPlugin;
