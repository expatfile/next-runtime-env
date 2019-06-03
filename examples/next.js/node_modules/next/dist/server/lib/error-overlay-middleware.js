"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
const launch_editor_1 = __importDefault(require("launch-editor"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function errorOverlayMiddleware(options) {
    return (req, res, next) => {
        if (req.url.startsWith('/_next/development/open-stack-frame-in-editor')) {
            const query = url_1.default.parse(req.url, true).query;
            const lineNumber = parseInt(query.lineNumber, 10) || 1;
            const colNumber = parseInt(query.colNumber, 10) || 1;
            let resolvedFileName = query.fileName;
            if (!fs_1.default.existsSync(resolvedFileName)) {
                resolvedFileName = path_1.default.join(options.dir, resolvedFileName);
            }
            launch_editor_1.default(`${resolvedFileName}:${lineNumber}:${colNumber}`);
            res.end();
        }
        else {
            next();
        }
    };
}
exports.default = errorOverlayMiddleware;
