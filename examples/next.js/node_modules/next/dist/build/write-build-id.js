"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const path_1 = require("path");
const constants_1 = require("next-server/constants");
const writeFile = util_1.promisify(fs_1.default.writeFile);
async function writeBuildId(distDir, buildId, headBuildId) {
    const buildIdPath = path_1.join(distDir, constants_1.BUILD_ID_FILE);
    await writeFile(buildIdPath, buildId, 'utf8');
    if (headBuildId) {
        const headBuildIdPath = path_1.join(distDir, constants_1.HEAD_BUILD_ID_FILE);
        await writeFile(headBuildIdPath, buildId, 'utf8');
    }
}
exports.writeBuildId = writeBuildId;
