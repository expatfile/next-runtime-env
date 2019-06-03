"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const head_1 = __importDefault(require("next-server/head"));
// This component is only rendered on the server side.
function ErrorDebug({ error, info }) {
    return (react_1.default.createElement("div", { style: exports.styles.errorDebug },
        react_1.default.createElement(head_1.default, null,
            react_1.default.createElement("meta", { name: 'viewport', content: 'width=device-width, initial-scale=1.0' })),
        react_1.default.createElement(StackTrace, { error: error, info: info })));
}
exports.default = ErrorDebug;
const StackTrace = ({ error: { name, message, stack }, info }) => (react_1.default.createElement("div", null,
    react_1.default.createElement("div", { style: exports.styles.heading }, message || name),
    react_1.default.createElement("pre", { style: exports.styles.stack }, stack),
    info && react_1.default.createElement("pre", { style: exports.styles.stack }, info.componentStack)));
exports.styles = {
    errorDebug: {
        background: '#ffffff',
        boxSizing: 'border-box',
        overflow: 'auto',
        padding: '24px',
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 9999,
        color: '#000000'
    },
    stack: {
        fontFamily: '"SF Mono", "Roboto Mono", "Fira Mono", consolas, menlo-regular, monospace',
        fontSize: '13px',
        lineHeight: '18px',
        color: '#777',
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        marginTop: '16px'
    },
    heading: {
        fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif',
        fontSize: '20px',
        fontWeight: '400',
        lineHeight: '28px',
        color: '#000000',
        marginBottom: '0px',
        marginTop: '0px'
    }
};
