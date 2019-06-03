"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));

function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}

// This function reads code updates on the fly and hard
// reloads the page when it has changed.
var tryApplyUpdates = function tryApplyUpdates() {
  try {
    if (!isUpdateAvailable() || !canApplyUpdates()) {
      return _promise.default.resolve();
    }

    var _temp2 = _catch(function () {
      return _promise.default.resolve(unfetch_1.default("".concat(hotUpdatePath).concat(curHash, ".hot-update.json"))).then(function (res) {
        return _promise.default.resolve(res.json()).then(function (data) {
          var curPage = page === '/' ? 'index' : page;
          var pageUpdated = (0, _keys.default)(data.c).some(function (mod) {
            return mod.indexOf("pages".concat(curPage.substr(0, 1) === '/' ? curPage : "/".concat(curPage))) !== -1 || mod.indexOf("pages".concat(curPage.substr(0, 1) === '/' ? curPage : "/".concat(curPage)).replace(/\//g, '\\')) !== -1;
          });

          if (pageUpdated) {
            document.location.reload(true);
          } else {
            curHash = mostRecentHash;
          }
        });
      });
    }, function (err) {
      console.error('Error occurred checking for update', err);
      document.location.reload(true);
    });

    return _promise.default.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
  } catch (e) {
    return _promise.default.reject(e);
  }
};

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* globals __webpack_hash__ */

var unfetch_1 = __importDefault(require("unfetch"));

var event_source_polyfill_1 = __importDefault(require("./event-source-polyfill"));

var eventsource_1 = require("./dev-error-overlay/eventsource");

var on_demand_entries_utils_1 = require("./on-demand-entries-utils");

if (!window.EventSource) {
  window.EventSource = event_source_polyfill_1.default;
}

var data = JSON.parse(document.getElementById('__NEXT_DATA__').textContent);
var assetPrefix = data.assetPrefix,
    page = data.page;
assetPrefix = assetPrefix || '';
var mostRecentHash = null;
/* eslint-disable-next-line */

var curHash = __webpack_hash__;
var hotUpdatePath = assetPrefix + (assetPrefix.endsWith('/') ? '' : '/') + '_next/static/webpack/'; // Is there a newer version of this code available?

function isUpdateAvailable() {
  // __webpack_hash__ is the hash of the current compilation.
  // It's a global variable injected by Webpack.

  /* eslint-disable-next-line */
  return mostRecentHash !== __webpack_hash__;
} // Webpack disallows updates in other states.


function canApplyUpdates() {
  return module.hot.status() === 'idle';
}

eventsource_1.getEventSourceWrapper({
  path: "".concat(assetPrefix, "/_next/webpack-hmr")
}).addMessageListener(function (event) {
  if (event.data === "\uD83D\uDC93") {
    return;
  }

  try {
    var message = JSON.parse(event.data);

    if (message.action === 'sync' || message.action === 'built') {
      if (!message.hash) {
        return;
      }

      mostRecentHash = message.hash;
      tryApplyUpdates();
    } else if (message.action === 'reloadPage') {
      document.location.reload(true);
    }
  } catch (ex) {
    console.warn('Invalid HMR message: ' + event.data + '\n' + ex);
  }
});
on_demand_entries_utils_1.setupPing(assetPrefix, function () {
  return page;
});