"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const data_manager_context_1 = require("next-server/dist/lib/data-manager-context");
const router_context_1 = require("next-server/dist/lib/router-context");
const unfetch_1 = __importDefault(require("unfetch"));
const querystring_1 = require("querystring");
function generateArgsKey(args) {
    return args.reduce((a, b) => {
        if (Array.isArray(b)) {
            return a + generateArgsKey(b);
        }
        if (typeof b !== 'string' && typeof b !== 'number') {
            throw new Error('arguments can only be string or number');
        }
        return a + b.toString();
    }, '');
}
function createHook(fetcher, options) {
    if (!options.key) {
        throw new Error('key not provided to createHook options.');
    }
    return function useData(...args) {
        const router = react_1.useContext(router_context_1.RouterContext);
        const dataManager = react_1.useContext(data_manager_context_1.DataManagerContext);
        const key = `${options.key}${generateArgsKey(args)}`;
        const existing = dataManager.get(key);
        if (existing) {
            if (existing.status === 'resolved') {
                return existing.result;
            }
            if (existing === 'mismatched-key') {
                throw new Error('matching key was missing from returned data. make sure arguments match between the client and server');
            }
        }
        // @ts-ignore webpack optimization
        if (process.browser) {
            const res = unfetch_1.default(router.route + '?' + querystring_1.stringify(router.query), {
                headers: {
                    accept: 'application/amp.bind+json',
                },
            }).then((res) => res.json()).then((result) => {
                const hasKey = result.some((pair) => pair[0] === key);
                if (!hasKey) {
                    result = [[key, 'mismatched-key']];
                }
                dataManager.overwrite(result);
            });
            throw res;
        }
        else {
            const res = fetcher(...args).then((result) => {
                dataManager.set(key, {
                    status: 'resolved',
                    result,
                });
            });
            throw res;
        }
    };
}
exports.createHook = createHook;
