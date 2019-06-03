"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const is_writeable_1 = require("../../build/is-writeable");
async function findPageFile(rootDir, normalizedPagePath, pageExtensions) {
    for (const extension of pageExtensions) {
        const relativePagePath = `${normalizedPagePath}.${extension}`;
        const pagePath = path_1.join(rootDir, relativePagePath);
        if (await is_writeable_1.isWriteable(pagePath)) {
            return relativePagePath;
        }
        const relativePagePathWithIndex = path_1.join(normalizedPagePath, `index.${extension}`);
        const pagePathWithIndex = path_1.join(rootDir, relativePagePathWithIndex);
        if (await is_writeable_1.isWriteable(pagePathWithIndex)) {
            return relativePagePathWithIndex;
        }
    }
    return null;
}
exports.findPageFile = findPageFile;
