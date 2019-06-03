"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const index_js_1 = __importDefault(require("next/dist/compiled/resolve/index.js"));
const nextjs_ssr_import_1 = __importDefault(require("./webpack/plugins/nextjs-ssr-import"));
const nextjs_ssr_module_cache_1 = __importDefault(require("./webpack/plugins/nextjs-ssr-module-cache"));
const pages_manifest_plugin_1 = __importDefault(require("./webpack/plugins/pages-manifest-plugin"));
const build_manifest_plugin_1 = __importDefault(require("./webpack/plugins/build-manifest-plugin"));
const chunk_names_plugin_1 = __importDefault(require("./webpack/plugins/chunk-names-plugin"));
const react_loadable_plugin_1 = require("./webpack/plugins/react-loadable-plugin");
const constants_1 = require("next-server/constants");
const constants_2 = require("../lib/constants");
const index_1 = require("./webpack/plugins/terser-webpack-plugin/src/index");
const serverless_plugin_1 = require("./webpack/plugins/serverless-plugin");
const all_modules_identified_plugin_1 = require("./webpack/plugins/all-modules-identified-plugin");
const shared_runtime_plugin_1 = require("./webpack/plugins/shared-runtime-plugin");
const hashed_chunk_ids_plugin_1 = require("./webpack/plugins/hashed-chunk-ids-plugin");
const chunk_graph_plugin_1 = require("./webpack/plugins/chunk-graph-plugin");
function getBaseWebpackConfig(dir, { dev = false, debug = false, isServer = false, buildId, config, target = 'server', entrypoints, selectivePageBuilding = false, selectivePageBuildingCacheIdentifier = '' }) {
    const defaultLoaders = {
        babel: {
            loader: 'next-babel-loader',
            options: { isServer, cwd: dir, asyncToPromises: config.experimental.asyncToPromises }
        },
        // Backwards compat
        hotSelfAccept: {
            loader: 'noop-loader'
        }
    };
    // Support for NODE_PATH
    const nodePathList = (process.env.NODE_PATH || '')
        .split(process.platform === 'win32' ? ';' : ':')
        .filter((p) => !!p);
    const distDir = path_1.default.join(dir, config.distDir);
    const outputDir = target === 'serverless' ? 'serverless' : constants_1.SERVER_DIRECTORY;
    const outputPath = path_1.default.join(distDir, isServer ? outputDir : '');
    const totalPages = Object.keys(entrypoints).length;
    const clientEntries = !isServer ? {
        // Backwards compatibility
        'main.js': [],
        [constants_1.CLIENT_STATIC_FILES_RUNTIME_MAIN]: `.${path_1.default.sep}` + path_1.default.relative(dir, path_1.default.join(constants_2.NEXT_PROJECT_ROOT_DIST_CLIENT, (dev ? `next-dev.js` : 'next.js')))
    } : undefined;
    const resolveConfig = {
        // Disable .mjs for node_modules bundling
        extensions: isServer ? ['.js', '.mjs', '.jsx', '.json', '.wasm'] : ['.mjs', '.js', '.jsx', '.json', '.wasm'],
        modules: [
            'node_modules',
            ...nodePathList // Support for NODE_PATH environment variable
        ],
        alias: {
            // These aliases make sure the wrapper module is not included in the bundles
            // Which makes bundles slightly smaller, but also skips parsing a module that we know will result in this alias
            'next/head': 'next-server/dist/lib/head.js',
            'next/router': 'next/dist/client/router.js',
            'next/config': 'next-server/dist/lib/runtime-config.js',
            'next/dynamic': 'next-server/dist/lib/dynamic.js',
            next: constants_2.NEXT_PROJECT_ROOT,
            [constants_2.PAGES_DIR_ALIAS]: path_1.default.join(dir, 'pages'),
            [constants_2.DOT_NEXT_ALIAS]: distDir,
        },
        mainFields: isServer ? ['main', 'module'] : ['browser', 'module', 'main']
    };
    const webpackMode = dev ? 'development' : 'production';
    const terserPluginConfig = {
        parallel: true,
        sourceMap: false,
        cache: true,
        cpus: config.experimental.cpus,
        distDir: distDir
    };
    let webpackConfig = {
        mode: webpackMode,
        devtool: (dev || debug) ? 'cheap-module-source-map' : false,
        name: isServer ? 'server' : 'client',
        target: isServer ? 'node' : 'web',
        externals: !isServer ? undefined : target !== 'serverless' ? [
            (context, request, callback) => {
                const notExternalModules = [
                    'next/app', 'next/document', 'next/link', 'next/error',
                    'string-hash',
                    'next/constants'
                ];
                if (notExternalModules.indexOf(request) !== -1) {
                    return callback();
                }
                index_js_1.default(request, { basedir: dir, preserveSymlinks: true }, (err, res) => {
                    if (err) {
                        return callback();
                    }
                    if (!res) {
                        return callback();
                    }
                    // Default pages have to be transpiled
                    if (res.match(/next[/\\]dist[/\\]/) || res.match(/node_modules[/\\]@babel[/\\]runtime[/\\]/) || res.match(/node_modules[/\\]@babel[/\\]runtime-corejs2[/\\]/)) {
                        return callback();
                    }
                    // Webpack itself has to be compiled because it doesn't always use module relative paths
                    if (res.match(/node_modules[/\\]webpack/) || res.match(/node_modules[/\\]css-loader/)) {
                        return callback();
                    }
                    // styled-jsx has to be transpiled
                    if (res.match(/node_modules[/\\]styled-jsx/)) {
                        return callback();
                    }
                    if (res.match(/node_modules[/\\].*\.js$/)) {
                        return callback(undefined, `commonjs ${request}`);
                    }
                    callback();
                });
            }
        ] : [
            // When the serverless target is used all node_modules will be compiled into the output bundles
            // So that the serverless bundles have 0 runtime dependencies
            'amp-toolbox-optimizer' // except this one
        ],
        optimization: Object.assign({
            checkWasmTypes: false,
            nodeEnv: false,
        }, isServer ? {
            splitChunks: false,
            minimize: false
        } : {
            runtimeChunk: selectivePageBuilding ? false : {
                name: constants_1.CLIENT_STATIC_FILES_RUNTIME_WEBPACK
            },
            splitChunks: dev ? {
                cacheGroups: {
                    default: false,
                    vendors: false
                }
            } : selectivePageBuilding ? {
                cacheGroups: {
                    default: false,
                    vendors: false,
                    react: {
                        name: 'commons',
                        chunks: 'all',
                        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/
                    }
                }
            } : {
                chunks: 'all',
                cacheGroups: {
                    default: false,
                    vendors: false,
                    commons: {
                        name: 'commons',
                        chunks: 'all',
                        minChunks: totalPages > 2 ? totalPages * 0.5 : 2
                    },
                    react: {
                        name: 'commons',
                        chunks: 'all',
                        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/
                    }
                }
            },
            minimize: !(dev || debug),
            minimizer: !(dev || debug) ? [
                new index_1.TerserPlugin(Object.assign({}, terserPluginConfig, { terserOptions: Object.assign({ safari10: true }, ((selectivePageBuilding || config.experimental.terserLoader) ? { compress: false, mangle: true } : undefined)) }))
            ] : undefined,
        }, selectivePageBuilding ? {
            providedExports: false,
            usedExports: false,
            concatenateModules: false,
        } : undefined),
        recordsPath: selectivePageBuilding ? undefined : path_1.default.join(outputPath, 'records.json'),
        context: dir,
        // Kept as function to be backwards compatible
        entry: async () => {
            return Object.assign({}, clientEntries ? clientEntries : {}, entrypoints);
        },
        output: {
            path: outputPath,
            filename: ({ chunk }) => {
                // Use `[name]-[contenthash].js` in production
                if (!dev && (chunk.name === constants_1.CLIENT_STATIC_FILES_RUNTIME_MAIN || chunk.name === constants_1.CLIENT_STATIC_FILES_RUNTIME_WEBPACK)) {
                    return chunk.name.replace(/\.js$/, '-[contenthash].js');
                }
                return '[name]';
            },
            libraryTarget: isServer ? 'commonjs2' : 'var',
            hotUpdateChunkFilename: 'static/webpack/[id].[hash].hot-update.js',
            hotUpdateMainFilename: 'static/webpack/[hash].hot-update.json',
            // This saves chunks with the name given via `import()`
            chunkFilename: isServer ? `${dev ? '[name]' : '[name].[contenthash]'}.js` : `static/chunks/${dev ? '[name]' : '[name].[contenthash]'}.js`,
            strictModuleExceptionHandling: true,
            crossOriginLoading: config.crossOrigin,
            futureEmitAssets: !dev,
            webassemblyModuleFilename: 'static/wasm/[modulehash].wasm'
        },
        performance: false,
        resolve: resolveConfig,
        resolveLoader: {
            modules: [
                path_1.default.join(__dirname, 'webpack', 'loaders'),
                'node_modules',
                ...nodePathList // Support for NODE_PATH environment variable
            ]
        },
        // @ts-ignore this is filtered
        module: {
            rules: [
                (selectivePageBuilding || config.experimental.terserLoader) && !isServer && {
                    test: /\.(js|mjs|jsx)$/,
                    exclude: /\.min\.(js|mjs|jsx)$/,
                    use: {
                        loader: 'next-minify-loader',
                        options: { terserOptions: { safari10: true, compress: true, mangle: false } }
                    }
                },
                config.experimental.ampBindInitData && !isServer && {
                    test: /\.(js|mjs|jsx)$/,
                    include: [path_1.default.join(dir, 'data')],
                    use: 'next-data-loader'
                },
                {
                    test: /\.(js|mjs|jsx)$/,
                    include: [dir, /next-server[\\/]dist[\\/]lib/],
                    exclude: (path) => {
                        if (/next-server[\\/]dist[\\/]lib/.test(path)) {
                            return false;
                        }
                        return /node_modules/.test(path);
                    },
                    use: defaultLoaders.babel
                }
            ].filter(Boolean)
        },
        plugins: [
            // This plugin makes sure `output.filename` is used for entry chunks
            new chunk_names_plugin_1.default(),
            new webpack_1.default.DefinePlugin(Object.assign({}, (Object.keys(config.env).reduce((acc, key) => {
                if (/^(?:NODE_.+)|(?:__.+)$/i.test(key)) {
                    throw new Error(`The key "${key}" under "env" in next.config.js is not allowed. https://err.sh/zeit/next.js/env-key-not-allowed`);
                }
                return Object.assign({}, acc, { [`process.env.${key}`]: JSON.stringify(config.env[key]) });
            }, {})), { 'process.env.NODE_ENV': JSON.stringify(webpackMode), 'process.crossOrigin': JSON.stringify(config.crossOrigin), 'process.browser': JSON.stringify(!isServer) }, (dev && !isServer ? {
                'process.env.__NEXT_DIST_DIR': JSON.stringify(distDir)
            } : {}), { 'process.env.__NEXT_EXPERIMENTAL_DEBUG': JSON.stringify(debug), 'process.env.__NEXT_EXPORT_TRAILING_SLASH': JSON.stringify(config.experimental.exportTrailingSlash) })),
            !isServer && new react_loadable_plugin_1.ReactLoadablePlugin({
                filename: constants_1.REACT_LOADABLE_MANIFEST
            }),
            !isServer && selectivePageBuilding && new chunk_graph_plugin_1.ChunkGraphPlugin(buildId, path_1.default.resolve(dir), { filename: constants_1.CHUNK_GRAPH_MANIFEST, selectivePageBuildingCacheIdentifier }),
            ...(dev ? (() => {
                // Even though require.cache is server only we have to clear assets from both compilations
                // This is because the client compilation generates the build manifest that's used on the server side
                const { NextJsRequireCacheHotReloader } = require('./webpack/plugins/nextjs-require-cache-hot-reloader');
                const { UnlinkRemovedPagesPlugin } = require('./webpack/plugins/unlink-removed-pages-plugin');
                const devPlugins = [
                    new UnlinkRemovedPagesPlugin(),
                    new webpack_1.default.NoEmitOnErrorsPlugin(),
                    new NextJsRequireCacheHotReloader(),
                ];
                if (!isServer) {
                    const AutoDllPlugin = require('autodll-webpack-plugin');
                    devPlugins.push(new AutoDllPlugin({
                        filename: '[name]_[hash].js',
                        path: './static/development/dll',
                        context: dir,
                        entry: {
                            dll: [
                                'react',
                                'react-dom'
                            ]
                        },
                        config: {
                            mode: webpackMode,
                            resolve: resolveConfig
                        }
                    }));
                    devPlugins.push(new webpack_1.default.HotModuleReplacementPlugin());
                }
                return devPlugins;
            })() : []),
            !dev && new webpack_1.default.HashedModuleIdsPlugin(),
            // This must come after HashedModuleIdsPlugin (it sets any modules that
            // were missed by HashedModuleIdsPlugin)
            !dev && selectivePageBuilding && new all_modules_identified_plugin_1.AllModulesIdentifiedPlugin(dir),
            // This sets chunk ids to be hashed versions of their names to reduce
            // bundle churn
            !dev && new hashed_chunk_ids_plugin_1.HashedChunkIdsPlugin(buildId),
            // On the client we want to share the same runtime cache
            !isServer && selectivePageBuilding && new shared_runtime_plugin_1.SharedRuntimePlugin(),
            !dev && new webpack_1.default.IgnorePlugin({
                checkResource: (resource) => {
                    return /react-is/.test(resource);
                },
                checkContext: (context) => {
                    return /next-server[\\/]dist[\\/]/.test(context) || /next[\\/]dist[\\/]/.test(context);
                }
            }),
            target === 'serverless' && (isServer || selectivePageBuilding) && new serverless_plugin_1.ServerlessPlugin(buildId, { isServer }),
            target !== 'serverless' && isServer && new pages_manifest_plugin_1.default(),
            target !== 'serverless' && isServer && new nextjs_ssr_module_cache_1.default({ outputPath }),
            isServer && new nextjs_ssr_import_1.default(),
            !isServer && new build_manifest_plugin_1.default(),
            config.experimental.profiling && new webpack_1.default.debug.ProfilingPlugin({
                outputPath: path_1.default.join(distDir, `profile-events-${isServer ? 'server' : 'client'}.json`)
            })
        ].filter(Boolean)
    };
    if (typeof config.webpack === 'function') {
        webpackConfig = config.webpack(webpackConfig, { dir, dev, isServer, buildId, config, defaultLoaders, totalPages, webpack: webpack_1.default });
        // @ts-ignore: Property 'then' does not exist on type 'Configuration'
        if (typeof webpackConfig.then === 'function') {
            console.warn('> Promise returned in next config. https://err.sh/zeit/next.js/promise-in-next-config.md');
        }
    }
    // Backwards compat for `main.js` entry key
    const originalEntry = webpackConfig.entry;
    if (typeof originalEntry !== 'undefined') {
        webpackConfig.entry = async () => {
            const entry = typeof originalEntry === 'function' ? await originalEntry() : originalEntry;
            // Server compilation doesn't have main.js
            if (clientEntries && entry['main.js'] && entry['main.js'].length > 0) {
                const originalFile = clientEntries[constants_1.CLIENT_STATIC_FILES_RUNTIME_MAIN];
                entry[constants_1.CLIENT_STATIC_FILES_RUNTIME_MAIN] = [
                    ...entry['main.js'],
                    originalFile
                ];
            }
            delete entry['main.js'];
            return entry;
        };
    }
    return webpackConfig;
}
exports.default = getBaseWebpackConfig;
