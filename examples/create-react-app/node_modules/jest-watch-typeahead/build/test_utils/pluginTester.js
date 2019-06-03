"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _jestWatcher = require("jest-watcher");

var _stripAnsi = _interopRequireDefault(require("strip-ansi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

expect.addSnapshotSerializer({
  test: val => typeof val === 'string',
  print: val => (0, _stripAnsi.default)(val)
});
/**
 * See https://github.com/facebook/jest/pull/7523 for more details
 */

const CLEAR = '\x1B[2J\x1B[3J\x1B[H';
expect.addSnapshotSerializer({
  test: val => val.includes(CLEAR),
  print: val => (0, _stripAnsi.default)(val.replace(CLEAR, '[MOCK - clear]'))
});
/**
 * See https://github.com/facebook/jest/pull/7523 for more details
 */

const WINDOWS_CLEAR = '\x1B[2J\x1B[0f';
expect.addSnapshotSerializer({
  test: val => val.includes(WINDOWS_CLEAR),
  print: val => (0, _stripAnsi.default)(val.replace(WINDOWS_CLEAR, '[MOCK - clear]'))
});
jest.mock('ansi-escapes', () => ({
  clearScreen: '[MOCK - clearScreen]',
  cursorDown: (count = 1) => `[MOCK - cursorDown(${count})]`,
  cursorLeft: '[MOCK - cursorLeft]',
  cursorHide: '[MOCK - cursorHide]',
  cursorRestorePosition: '[MOCK - cursorRestorePosition]',
  cursorSavePosition: '[MOCK - cursorSavePosition]',
  cursorShow: '[MOCK - cursorShow]',
  cursorTo: (x, y) => `[MOCK - cursorTo(${x}, ${y})]`
}));

const pluginTester = (Plugin, config = {}) => {
  const stdout = {
    columns: 80,
    write: jest.fn()
  };
  const jestHooks = new _jestWatcher.JestHook();
  const plugin = new Plugin({
    stdout,
    config
  });
  plugin.apply(jestHooks.getSubscriber());

  const type = (...keys) => keys.forEach(key => plugin.onKey(key));

  return {
    stdout,
    hookEmitter: jestHooks.getEmitter(),
    updateConfigAndRun: jest.fn(),
    plugin,
    type
  };
};

var _default = pluginTester;
exports.default = _default;