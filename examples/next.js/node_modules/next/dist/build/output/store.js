"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const unistore_1 = __importDefault(require("next/dist/compiled/unistore"));
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const Log = __importStar(require("./log"));
exports.store = unistore_1.default({ appUrl: null, bootstrap: true });
let lastStore = {};
function hasStoreChanged(nextStore) {
    if ([...new Set([...Object.keys(lastStore), ...Object.keys(nextStore)])].every(key => Object.is(lastStore[key], nextStore[key]))) {
        return false;
    }
    lastStore = nextStore;
    return true;
}
exports.store.subscribe(state => {
    if (!hasStoreChanged(state)) {
        return;
    }
    if (state.bootstrap) {
        Log.wait('starting the development server ...');
        Log.info(`waiting on ${state.appUrl} ...`);
        return;
    }
    if (state.loading) {
        Log.wait('compiling ...');
        return;
    }
    if (state.errors) {
        Log.error(state.errors[0]);
        const cleanError = strip_ansi_1.default(state.errors[0]);
        if (cleanError.indexOf('SyntaxError') > -1) {
            const matches = cleanError.match(/\[.*\]=/);
            if (matches) {
                for (const match of matches) {
                    const prop = (match.split(']').shift() || '').substr(1);
                    console.log(`AMP bind syntax [${prop}]='' is not supported in JSX, use 'data-amp-bind-${prop}' instead. https://err.sh/zeit/next.js/amp-bind-jsx-alt`);
                }
                return;
            }
        }
        return;
    }
    if (state.warnings) {
        Log.warn(state.warnings.join('\n\n'));
        Log.info(`ready on ${state.appUrl}`);
        return;
    }
    if (state.appUrl) {
        Log.ready('compiled successfully');
        if (state.appUrl) {
            Log.info(`ready on ${state.appUrl}`);
        }
    }
});
