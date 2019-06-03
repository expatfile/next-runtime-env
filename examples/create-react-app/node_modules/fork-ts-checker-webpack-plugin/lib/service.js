"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const process = require("process");
const IncrementalChecker_1 = require("./IncrementalChecker");
const CancellationToken_1 = require("./CancellationToken");
const ApiIncrementalChecker_1 = require("./ApiIncrementalChecker");
const NormalizedMessageFactories_1 = require("./NormalizedMessageFactories");
const worker_rpc_1 = require("worker-rpc");
const RpcTypes_1 = require("./RpcTypes");
const rpc = new worker_rpc_1.RpcProvider(message => {
    try {
        process.send(message);
    }
    catch (e) {
        // channel closed...
        process.exit();
    }
});
process.on('message', message => rpc.dispatch(message));
const typescript = require(process.env.TYPESCRIPT_PATH);
// message factories
exports.createNormalizedMessageFromDiagnostic = NormalizedMessageFactories_1.makeCreateNormalizedMessageFromDiagnostic(typescript);
exports.createNormalizedMessageFromRuleFailure = NormalizedMessageFactories_1.makeCreateNormalizedMessageFromRuleFailure();
exports.createNormalizedMessageFromInternalError = NormalizedMessageFactories_1.makeCreateNormalizedMessageFromInternalError();
const resolveModuleName = process.env.RESOLVE_MODULE_NAME
    ? require(process.env.RESOLVE_MODULE_NAME).resolveModuleName
    : undefined;
const resolveTypeReferenceDirective = process.env
    .RESOLVE_TYPE_REFERENCE_DIRECTIVE
    ? require(process.env.RESOLVE_TYPE_REFERENCE_DIRECTIVE)
        .resolveTypeReferenceDirective
    : undefined;
const checker = process.env.USE_INCREMENTAL_API === 'true'
    ? new ApiIncrementalChecker_1.ApiIncrementalChecker(typescript, exports.createNormalizedMessageFromDiagnostic, exports.createNormalizedMessageFromRuleFailure, process.env.TSCONFIG, JSON.parse(process.env.COMPILER_OPTIONS), process.env.CONTEXT, process.env.TSLINT === 'true' ? true : process.env.TSLINT || false, process.env.TSLINTAUTOFIX === 'true', process.env.CHECK_SYNTACTIC_ERRORS === 'true', resolveModuleName, resolveTypeReferenceDirective)
    : new IncrementalChecker_1.IncrementalChecker(typescript, exports.createNormalizedMessageFromDiagnostic, exports.createNormalizedMessageFromRuleFailure, process.env.TSCONFIG, JSON.parse(process.env.COMPILER_OPTIONS), process.env.CONTEXT, process.env.TSLINT === 'true' ? true : process.env.TSLINT || false, process.env.TSLINTAUTOFIX === 'true', process.env.WATCH === '' ? [] : process.env.WATCH.split('|'), parseInt(process.env.WORK_NUMBER, 10) || 0, parseInt(process.env.WORK_DIVISION, 10) || 1, process.env.CHECK_SYNTACTIC_ERRORS === 'true', process.env.VUE === 'true', resolveModuleName, resolveTypeReferenceDirective);
function run(cancellationToken) {
    return __awaiter(this, void 0, void 0, function* () {
        let diagnostics = [];
        let lints = [];
        try {
            checker.nextIteration();
            diagnostics = yield checker.getDiagnostics(cancellationToken);
            if (checker.hasLinter()) {
                lints = checker.getLints(cancellationToken);
            }
        }
        catch (error) {
            if (error instanceof typescript.OperationCanceledException) {
                return undefined;
            }
            diagnostics.push(exports.createNormalizedMessageFromInternalError(error));
        }
        if (cancellationToken.isCancellationRequested()) {
            return undefined;
        }
        return {
            diagnostics,
            lints
        };
    });
}
rpc.registerRpcHandler(RpcTypes_1.RUN, message => typeof message !== 'undefined'
    ? run(CancellationToken_1.CancellationToken.createFromJSON(typescript, message))
    : undefined);
process.on('SIGINT', () => {
    process.exit();
});
//# sourceMappingURL=service.js.map