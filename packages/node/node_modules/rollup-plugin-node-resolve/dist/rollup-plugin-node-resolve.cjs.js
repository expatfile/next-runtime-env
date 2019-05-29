'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = require('path');
var builtins = _interopDefault(require('builtin-modules'));
var resolveId = _interopDefault(require('resolve'));
var isModule = _interopDefault(require('is-module'));
var fs = _interopDefault(require('fs'));

var ES6_BROWSER_EMPTY = path.resolve( __dirname, '../src/empty.js' );
// It is important that .mjs occur before .js so that Rollup will interpret npm modules
// which deploy both ESM .mjs and CommonJS .js files as ESM.
var DEFAULT_EXTS = [ '.mjs', '.js', '.json', '.node' ];

var readFileAsync = function (file) { return new Promise(function (fulfil, reject) { return fs.readFile(file, function (err, contents) { return err ? reject(err) : fulfil(contents); }); }); };
var statAsync = function (file) { return new Promise(function (fulfil, reject) { return fs.stat(file, function (err, contents) { return err ? reject(err) : fulfil(contents); }); }); };
var cache = function (fn) {
	var cache = new Map();
	var wrapped = function (param, done) {
		if (cache.has(param) === false) {
			cache.set(param, fn(param).catch(function (err) {
				cache.delete(param);
				throw err;
			}));
		}
		return cache.get(param).then(function (result) { return done(null, result); }, done);
	};
	wrapped.clear = function () { return cache.clear(); };
	return wrapped;
};
var ignoreENOENT = function (err) {
	if (err.code === 'ENOENT') { return false; }
	throw err;
};
var readFileCached = cache(readFileAsync);
var isDirCached = cache(function (file) { return statAsync(file).then(function (stat) { return stat.isDirectory(); }, ignoreENOENT); });
var isFileCached = cache(function (file) { return statAsync(file).then(function (stat) { return stat.isFile(); }, ignoreENOENT); });

function getMainFields (options) {
	var mainFields;
	if (options.mainFields) {
		if ('module' in options || 'main' in options || 'jsnext' in options) {
			throw new Error("node-resolve: do not use deprecated 'module', 'main', 'jsnext' options with 'mainFields'");
		}
		mainFields = options.mainFields;
	} else {
		mainFields = [];
		[['module', 'module', true], ['jsnext', 'jsnext:main', false], ['main', 'main', true]].forEach(function (ref) {
			var option = ref[0];
			var field = ref[1];
			var defaultIncluded = ref[2];

			if (option in options) {
				// eslint-disable-next-line no-console
				console.warn(("node-resolve: setting options." + option + " is deprecated, please override options.mainFields instead"));
				if (options[option]) {
					mainFields.push(field);
				}
			} else if (defaultIncluded) {
				mainFields.push(field);
			}
		});
	}
	if (options.browser && mainFields.indexOf('browser') === -1) {
		return ['browser'].concat(mainFields);
	}
	if ( !mainFields.length ) {
		throw new Error( "Please ensure at least one 'mainFields' value is specified" );
	}
	return mainFields;
}

var resolveIdAsync = function (file, opts) { return new Promise(function (fulfil, reject) { return resolveId(file, opts, function (err, contents) { return err ? reject(err) : fulfil(contents); }); }); };

function nodeResolve ( options ) {
	if ( options === void 0 ) options = {};

	var mainFields = getMainFields(options);
	var useBrowserOverrides = mainFields.indexOf('browser') !== -1;
	var dedupe = options.dedupe || [];
	var isPreferBuiltinsSet = options.preferBuiltins === true || options.preferBuiltins === false;
	var preferBuiltins = isPreferBuiltinsSet ? options.preferBuiltins : true;
	var customResolveOptions = options.customResolveOptions || {};
	var jail = options.jail;
	var only = Array.isArray(options.only)
		? options.only.map(function (o) { return o instanceof RegExp
			? o
			: new RegExp('^' + String(o).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&') + '$'); }
		)
		: null;
	var browserMapCache = {};

	if ( options.skip ) {
		throw new Error( 'options.skip is no longer supported — you should use the main Rollup `external` option instead' );
	}

	var preserveSymlinks;

	return {
		name: 'node-resolve',

		options: function options ( options$1 ) {
			preserveSymlinks = options$1.preserveSymlinks;
		},

		generateBundle: function generateBundle () {
			readFileCached.clear();
			isFileCached.clear();
			isDirCached.clear();
		},

		resolveId: function resolveId ( importee, importer ) {
			var this$1 = this;

			if ( /\0/.test( importee ) ) { return null; } // ignore IDs with null character, these belong to other plugins

			var basedir = importer ? path.dirname( importer ) : process.cwd();

			if (dedupe.indexOf(importee) !== -1) {
				importee = path.join(process.cwd(), 'node_modules', importee);
			}

			// https://github.com/defunctzombie/package-browser-field-spec
			if (useBrowserOverrides && browserMapCache[importer]) {
				var resolvedImportee = path.resolve( basedir, importee );
				var browser = browserMapCache[importer];
				if (browser[importee] === false || browser[resolvedImportee] === false) {
					return ES6_BROWSER_EMPTY;
				}
				if (browser[importee] || browser[resolvedImportee] || browser[resolvedImportee + '.js'] || browser[resolvedImportee + '.json']) {
					importee = browser[importee] || browser[resolvedImportee] || browser[resolvedImportee + '.js'] || browser[resolvedImportee + '.json'];
				}
			}

			var parts = importee.split( /[/\\]/ );
			var id = parts.shift();

			if ( id[0] === '@' && parts.length ) {
				// scoped packages
				id += "/" + (parts.shift());
			} else if ( id[0] === '.' ) {
				// an import relative to the parent dir of the importer
				id = path.resolve( basedir, importee );
			}

			if (only && !only.some(function (pattern) { return pattern.test(id); })) { return null; }

			var disregardResult = false;
			var packageBrowserField = false;
			var extensions = options.extensions || DEFAULT_EXTS;

			var resolveOptions = {
				basedir: basedir,
				packageFilter: function packageFilter ( pkg, pkgPath ) {
					var pkgRoot = path.dirname( pkgPath );
					if (useBrowserOverrides && typeof pkg[ 'browser' ] === 'object') {
						packageBrowserField = Object.keys(pkg[ 'browser' ]).reduce(function (browser, key) {
							var resolved = pkg[ 'browser' ][ key ];
							if (resolved && resolved[0] === '.') {
								resolved = path.resolve( pkgRoot, pkg[ 'browser' ][ key ] );
							}
							browser[ key ] = resolved;
							if ( key[0] === '.' ) {
								var absoluteKey = path.resolve( pkgRoot, key );
								browser[ absoluteKey ] = resolved;
								if ( !path.extname(key) ) {
									extensions.reduce( function ( browser, ext ) {
										browser[ absoluteKey + ext ] = browser[ key ];
										return browser;
									}, browser );
								}
							}
							return browser;
						}, {});
					}

					var overriddenMain = false;
					for ( var i = 0; i < mainFields.length; i++ ) {
						var field = mainFields[i];
						if ( typeof pkg[ field ] === 'string' ) {
							pkg[ 'main' ] = pkg[ field ];
							overriddenMain = true;
							break;
						}
					}
					if ( overriddenMain === false && mainFields.indexOf( 'main' ) === -1 ) {
						disregardResult = true;
					}
					return pkg;
				},
				readFile: readFileCached,
				isFile: isFileCached,
				isDirectory: isDirCached,
				extensions: extensions
			};

			if (preserveSymlinks !== undefined) {
				resolveOptions.preserveSymlinks = preserveSymlinks;
			}

			return resolveIdAsync(
				importee,
				Object.assign( resolveOptions, customResolveOptions )
			)
				.then(function (resolved) {
					if ( resolved && useBrowserOverrides && packageBrowserField ) {
						if ( packageBrowserField.hasOwnProperty(resolved) ) {
							if (!packageBrowserField[resolved]) {
								browserMapCache[resolved] = packageBrowserField;
								return ES6_BROWSER_EMPTY;
							}
							resolved = packageBrowserField[ resolved ];
						}
						browserMapCache[resolved] = packageBrowserField;
					}

					if ( !disregardResult ) {
						if ( !preserveSymlinks && resolved && fs.existsSync( resolved ) ) {
							resolved = fs.realpathSync( resolved );
						}

						if ( ~builtins.indexOf( resolved ) ) {
							return null;
						} else if ( ~builtins.indexOf( importee ) && preferBuiltins ) {
							if ( !isPreferBuiltinsSet ) {
								this$1.warn(
									"preferring built-in module '" + importee + "' over local alternative " +
									"at '" + resolved + "', pass 'preferBuiltins: false' to disable this " +
									"behavior or 'preferBuiltins: true' to disable this warning"
								);
							}
							return null;
						} else if ( jail && resolved.indexOf( path.normalize( jail.trim( path.sep ) ) ) !== 0 ) {
							return null;
						}
					}

					if ( resolved && options.modulesOnly ) {
						return readFileAsync( resolved, 'utf-8').then(function (code) { return isModule( code ) ? resolved : null; });
					} else {
						return resolved;
					}
				})
				.catch(function () { return null; });
		}
	};
}

module.exports = nodeResolve;
