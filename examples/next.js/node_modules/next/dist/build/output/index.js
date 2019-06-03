"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const text_table_1 = __importDefault(require("next/dist/compiled/text-table"));
const unistore_1 = __importDefault(require("next/dist/compiled/unistore"));
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const format_webpack_messages_1 = __importDefault(require("../../client/dev-error-overlay/format-webpack-messages"));
const store_1 = require("./store");
function startedDevelopmentServer(appUrl) {
    store_1.store.setState({ appUrl });
}
exports.startedDevelopmentServer = startedDevelopmentServer;
let previousClient = null;
let previousServer = null;
var WebpackStatusPhase;
(function (WebpackStatusPhase) {
    WebpackStatusPhase[WebpackStatusPhase["COMPILING"] = 1] = "COMPILING";
    WebpackStatusPhase[WebpackStatusPhase["COMPILED_WITH_ERRORS"] = 2] = "COMPILED_WITH_ERRORS";
    WebpackStatusPhase[WebpackStatusPhase["COMPILED_WITH_WARNINGS"] = 3] = "COMPILED_WITH_WARNINGS";
    WebpackStatusPhase[WebpackStatusPhase["COMPILED"] = 4] = "COMPILED";
})(WebpackStatusPhase || (WebpackStatusPhase = {}));
function getWebpackStatusPhase(status) {
    if (status.loading) {
        return WebpackStatusPhase.COMPILING;
    }
    if (status.errors) {
        return WebpackStatusPhase.COMPILED_WITH_ERRORS;
    }
    if (status.warnings) {
        return WebpackStatusPhase.COMPILED_WITH_WARNINGS;
    }
    return WebpackStatusPhase.COMPILED;
}
function formatAmpMessages(amp) {
    let output = chalk_1.default.bold('Amp Validation') + '\n\n';
    let messages = [];
    const chalkError = chalk_1.default.red('error');
    function ampError(page, error) {
        messages.push([page, chalkError, error.message, error.specUrl || '']);
    }
    const chalkWarn = chalk_1.default.yellow('warn');
    function ampWarn(page, warn) {
        messages.push([page, chalkWarn, warn.message, warn.specUrl || '']);
    }
    for (const page in amp) {
        const { errors, warnings } = amp[page];
        if (errors.length) {
            ampError(page, errors[0]);
            for (let index = 1; index < errors.length; ++index) {
                ampError('', errors[index]);
            }
        }
        if (warnings.length) {
            ampWarn(errors.length ? '' : page, warnings[0]);
            for (let index = 1; index < warnings.length; ++index) {
                ampWarn('', warnings[index]);
            }
        }
        messages.push(['', '', '', '']);
    }
    output += text_table_1.default(messages, {
        align: ['l', 'l', 'l', 'l'],
        stringLength(str) {
            return strip_ansi_1.default(str).length;
        },
    });
    return output;
}
exports.formatAmpMessages = formatAmpMessages;
const buildStore = unistore_1.default();
buildStore.subscribe(state => {
    const { amp, client, server } = state;
    const [{ status }] = [
        { status: client, phase: getWebpackStatusPhase(client) },
        { status: server, phase: getWebpackStatusPhase(server) },
    ].sort((a, b) => a.phase.valueOf() - b.phase.valueOf());
    const { bootstrap: bootstrapping, appUrl } = store_1.store.getState();
    if (bootstrapping && status.loading) {
        return;
    }
    let partialState = {
        bootstrap: false,
        appUrl: appUrl,
    };
    if (status.loading) {
        store_1.store.setState(Object.assign({}, partialState, { loading: true }), true);
    }
    else {
        let { errors, warnings } = status;
        if (errors == null && Object.keys(amp).length > 0) {
            warnings = (warnings || []).concat(formatAmpMessages(amp));
        }
        store_1.store.setState(Object.assign({}, partialState, { loading: false, errors, warnings }), true);
    }
});
function ampValidation(page, errors, warnings) {
    const { amp } = buildStore.getState();
    if (!(errors.length || warnings.length)) {
        buildStore.setState({
            amp: Object.keys(amp)
                .filter(k => k !== page)
                .sort()
                .reduce((a, c) => ((a[c] = amp[c]), a), {}),
        });
        return;
    }
    const newAmp = Object.assign({}, amp, { [page]: { errors, warnings } });
    buildStore.setState({
        amp: Object.keys(newAmp)
            .sort()
            .reduce((a, c) => ((a[c] = newAmp[c]), a), {}),
    });
}
exports.ampValidation = ampValidation;
function watchCompiler(client, server) {
    if (previousClient === client && previousServer === server) {
        return;
    }
    buildStore.setState({
        client: { loading: true },
        server: { loading: true },
    });
    function tapCompiler(key, compiler, onEvent) {
        compiler.hooks.invalid.tap(`NextJsInvalid-${key}`, () => {
            onEvent({ loading: true });
        });
        compiler.hooks.done.tap(`NextJsDone-${key}`, (stats) => {
            buildStore.setState({ amp: {} });
            const { errors, warnings } = format_webpack_messages_1.default(stats.toJson({ all: false, warnings: true, errors: true }));
            onEvent({
                loading: false,
                errors: errors && errors.length ? errors : null,
                warnings: warnings && warnings.length ? warnings : null,
            });
        });
    }
    tapCompiler('client', client, status => buildStore.setState({ client: status }));
    tapCompiler('server', server, status => buildStore.setState({ server: status }));
    previousClient = client;
    previousServer = server;
}
exports.watchCompiler = watchCompiler;
