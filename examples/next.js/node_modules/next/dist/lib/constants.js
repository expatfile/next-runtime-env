"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
exports.NEXT_PROJECT_ROOT = path_1.join(__dirname, '..', '..');
exports.NEXT_PROJECT_ROOT_DIST = path_1.join(exports.NEXT_PROJECT_ROOT, 'dist');
exports.NEXT_PROJECT_ROOT_NODE_MODULES = path_1.join(exports.NEXT_PROJECT_ROOT, 'node_modules');
exports.DEFAULT_PAGES_DIR = path_1.join(exports.NEXT_PROJECT_ROOT_DIST, 'pages');
exports.NEXT_PROJECT_ROOT_DIST_CLIENT = path_1.join(exports.NEXT_PROJECT_ROOT_DIST, 'client');
exports.NEXT_PROJECT_ROOT_DIST_SERVER = path_1.join(exports.NEXT_PROJECT_ROOT_DIST, 'server');
// Because on Windows absolute paths in the generated code can break because of numbers, eg 1 in the path,
// we have to use a private alias
exports.PAGES_DIR_ALIAS = 'private-next-pages';
exports.DOT_NEXT_ALIAS = 'private-dot-next';
