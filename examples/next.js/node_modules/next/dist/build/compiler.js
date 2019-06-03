"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_1 = __importDefault(require("webpack"));
function generateStats(result, stat) {
    const { errors, warnings } = stat.toJson({
        all: false,
        warnings: true,
        errors: true,
    });
    if (errors.length > 0) {
        result.errors.push(...errors);
    }
    if (warnings.length > 0) {
        result.warnings.push(...warnings);
    }
    return result;
}
function runCompiler(config) {
    return new Promise(async (resolve, reject) => {
        // @ts-ignore webpack allows both a single config or array of configs
        const compiler = webpack_1.default(config);
        compiler.run((err, statsOrMultiStats) => {
            if (err) {
                return reject(err);
            }
            if (statsOrMultiStats.stats) {
                const result = statsOrMultiStats.stats.reduce(generateStats, { errors: [], warnings: [] });
                return resolve(result);
            }
            const result = generateStats({ errors: [], warnings: [] }, statsOrMultiStats);
            return resolve(result);
        });
    });
}
exports.runCompiler = runCompiler;
