export const PROXY_PREFIX = '\0commonjs-proxy-';
export const EXTERNAL_PREFIX = '\0commonjs-external-';
export const HELPERS_ID = '\0commonjsHelpers.js';

// `x['default']` is used instead of `x.default` for backward compatibility with ES3 browsers.
// Minifiers like uglify will usually transpile it back if compatibility with ES3 is not enabled.
export const HELPERS = `
export var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

export function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

export function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

export function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

export function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}`;
