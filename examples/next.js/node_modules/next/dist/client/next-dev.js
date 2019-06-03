"use strict";

var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  }
  result["default"] = mod;
  return result;
};

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _1 = __importStar(require("./")),
    next = _1;

var event_source_polyfill_1 = __importDefault(require("./event-source-polyfill"));

var on_demand_entries_client_1 = __importDefault(require("./on-demand-entries-client"));

var webpack_hot_middleware_client_1 = __importDefault(require("./webpack-hot-middleware-client")); // Temporary workaround for the issue described here:
// https://github.com/zeit/next.js/issues/3775#issuecomment-407438123
// The runtimeChunk doesn't have dynamic import handling code when there hasn't been a dynamic import
// The runtimeChunk can't hot reload itself currently to correct it when adding pages using on-demand-entries


import('./noop'); // Support EventSource on Internet Explorer 11

if (!window.EventSource) {
  window.EventSource = event_source_polyfill_1.default;
}

var _window = window,
    assetPrefix = _window.__NEXT_DATA__.assetPrefix;
var prefix = assetPrefix || '';
var webpackHMR = webpack_hot_middleware_client_1.default({
  assetPrefix: prefix
});
window.next = next;

_1.default({
  webpackHMR: webpackHMR
}).then(function (emitter) {
  on_demand_entries_client_1.default({
    assetPrefix: prefix
  });
  var lastScroll;
  emitter.on('before-reactdom-render', function (_ref) {
    var Component = _ref.Component,
        ErrorComponent = _ref.ErrorComponent;

    // Remember scroll when ErrorComponent is being rendered to later restore it
    if (!lastScroll && Component === ErrorComponent) {
      var _window2 = window,
          pageXOffset = _window2.pageXOffset,
          pageYOffset = _window2.pageYOffset;
      lastScroll = {
        x: pageXOffset,
        y: pageYOffset
      };
    }
  });
  emitter.on('after-reactdom-render', function (_ref2) {
    var Component = _ref2.Component,
        ErrorComponent = _ref2.ErrorComponent;

    if (lastScroll && Component !== ErrorComponent) {
      // Restore scroll after ErrorComponent was replaced with a page component by HMR
      var _lastScroll = lastScroll,
          x = _lastScroll.x,
          y = _lastScroll.y;
      window.scroll(x, y);
      lastScroll = null;
    }
  });
}).catch(function (err) {
  console.error('Error was not caught', err);
});