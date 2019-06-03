/* eslint-disable camelcase */

/**
MIT License

Copyright (c) 2013-present, Facebook, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
// This file is based on https://github.com/facebook/create-react-app/blob/v1.1.4/packages/react-dev-utils/webpackHotDevClient.js
// It's been edited to rely on webpack-hot-middleware and to be more compatible with SSR / Next.js
'use strict';

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

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

// Attempt to update code on the fly, fall back to a hard reload.
var tryApplyUpdates = function (_tryApplyUpdates) {
  function tryApplyUpdates(_x) {
    return _tryApplyUpdates.apply(this, arguments);
  }

  tryApplyUpdates.toString = function () {
    return _tryApplyUpdates.toString();
  };

  return tryApplyUpdates;
}(function (onHotUpdateSuccess) {
  try {
    if (!module.hot) {
      // HotModuleReplacementPlugin is not in Webpack configuration.
      console.error('HotModuleReplacementPlugin is not in Webpack configuration.'); // window.location.reload();

      return _promise.default.resolve();
    }

    function handleApplyUpdates(err, updatedModules) {
      if (err || hadRuntimeError) {
        if (err) {
          console.warn('Error while applying updates, reloading page', err);
        }

        if (hadRuntimeError) {
          console.warn('Had runtime error previously, reloading page');
        }

        window.location.reload();
        return;
      }

      if (typeof onHotUpdateSuccess === 'function') {
        // Maybe we want to do something.
        onHotUpdateSuccess();
      }

      if (isUpdateAvailable()) {
        // While we were updating, there was a new update! Do it again.
        tryApplyUpdates();
      }
    } // https://webpack.github.io/docs/hot-module-replacement.html#check


    if (!isUpdateAvailable() || !canApplyUpdates()) {
      return _promise.default.resolve();
    }

    var _temp2 = _catch(function () {
      return _promise.default.resolve(module.hot.check(
      /* autoApply */
      {
        ignoreUnaccepted: true
      })).then(function (updatedModules) {
        if (updatedModules) {
          handleApplyUpdates(null, updatedModules);
        }
      });
    }, function (err) {
      handleApplyUpdates(err, null);
    });

    return _promise.default.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
  } catch (e) {
    return _promise.default.reject(e);
  }
});

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  }
  result["default"] = mod;
  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var eventsource_1 = require("./eventsource");

var format_webpack_messages_1 = __importDefault(require("./format-webpack-messages"));

var ErrorOverlay = __importStar(require("react-error-overlay"));

var strip_ansi_1 = __importDefault(require("strip-ansi"));

var source_map_support_1 = require("../source-map-support");

var unfetch_1 = __importDefault(require("unfetch")); // This alternative WebpackDevServer combines the functionality of:
// https://github.com/webpack/webpack-dev-server/blob/webpack-1/client/index.js
// https://github.com/webpack/webpack/blob/webpack-1/hot/dev-server.js
// It only supports their simplest configuration (hot updates on same server).
// It makes some opinionated choices on top, like adding a syntax error overlay
// that looks similar to our console output. The error overlay is inspired by:
// https://github.com/glenjamin/webpack-hot-middleware
// This is a modified version of create-react-app's webpackHotDevClient.js
// It implements webpack-hot-middleware's EventSource events instead of webpack-dev-server's websocket.
// https://github.com/facebook/create-react-app/blob/25184c4e91ebabd16fe1cde3d8630830e4a36a01/packages/react-dev-utils/webpackHotDevClient.js


var hadRuntimeError = false;
var customHmrEventHandler;

function connect(options) {
  // Open stack traces in an editor.
  ErrorOverlay.setEditorHandler(function editorHandler(_ref) {
    var fileName = _ref.fileName,
        lineNumber = _ref.lineNumber,
        colNumber = _ref.colNumber;
    // Resolve invalid paths coming from react-error-overlay
    var resolvedFilename = fileName.replace(/^webpack:\/\//, '');
    unfetch_1.default('/_next/development/open-stack-frame-in-editor' + "?fileName=".concat(window.encodeURIComponent(resolvedFilename)) + "&lineNumber=".concat(lineNumber || 1) + "&colNumber=".concat(colNumber || 1));
  }); // We need to keep track of if there has been a runtime error.
  // Essentially, we cannot guarantee application state was not corrupted by the
  // runtime error. To prevent confusing behavior, we forcibly reload the entire
  // application. This is handled below when we are notified of a compile (code
  // change).
  // See https://github.com/facebook/create-react-app/issues/3096

  ErrorOverlay.startReportingRuntimeErrors({
    onError: function onError() {
      hadRuntimeError = true;
    }
  });

  if (module.hot && typeof module.hot.dispose === 'function') {
    module.hot.dispose(function () {
      // TODO: why do we need this?
      ErrorOverlay.stopReportingRuntimeErrors();
    });
  }

  eventsource_1.getEventSourceWrapper(options).addMessageListener(function (event) {
    // This is the heartbeat event
    if (event.data === "\uD83D\uDC93") {
      return;
    }

    try {
      processMessage(event);
    } catch (ex) {
      console.warn('Invalid HMR message: ' + event.data + '\n' + ex);
    }
  });
  return {
    subscribeToHmrEvent: function subscribeToHmrEvent(handler) {
      customHmrEventHandler = handler;
    },
    reportRuntimeError: function reportRuntimeError(err) {
      ErrorOverlay.reportRuntimeError(err);
    },
    prepareError: function prepareError(err) {
      // Temporary workaround for https://github.com/facebook/create-react-app/issues/4760
      // Should be removed once the fix lands
      hadRuntimeError = true; // react-error-overlay expects a type of `Error`

      var error = new Error(err.message);
      error.name = err.name;
      error.stack = err.stack; // __NEXT_DIST_DIR is provided by webpack

      source_map_support_1.rewriteStacktrace(error, process.env.__NEXT_DIST_DIR);
      return error;
    }
  };
}

exports.default = connect; // Remember some state related to hot module replacement.

var isFirstCompilation = true;
var mostRecentCompilationHash = null;
var hasCompileErrors = false;

function clearOutdatedErrors() {
  // Clean up outdated compile errors, if any.
  if (typeof console !== 'undefined' && typeof console.clear === 'function') {
    if (hasCompileErrors) {
      console.clear();
    }
  }
} // Successful compilation.


function handleSuccess() {
  var isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;
  hasCompileErrors = false; // Attempt to apply hot updates or reload.

  if (isHotUpdate) {
    tryApplyUpdates(function onHotUpdateSuccess() {
      // Only dismiss it when we're sure it's a hot update.
      // Otherwise it would flicker right before the reload.
      ErrorOverlay.dismissBuildError();
    });
  }
} // Compilation with warnings (e.g. ESLint).


function handleWarnings(warnings) {
  clearOutdatedErrors(); // Print warnings to the console.

  var formatted = format_webpack_messages_1.default({
    warnings: warnings,
    errors: []
  });

  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    for (var i = 0; i < formatted.warnings.length; i++) {
      if (i === 5) {
        console.warn('There were more warnings in other files.\n' + 'You can find a complete log in the terminal.');
        break;
      }

      console.warn(strip_ansi_1.default(formatted.warnings[i]));
    }
  }
} // Compilation with errors (e.g. syntax error or missing modules).


function handleErrors(errors) {
  clearOutdatedErrors();
  isFirstCompilation = false;
  hasCompileErrors = true; // "Massage" webpack messages.

  var formatted = format_webpack_messages_1.default({
    errors: errors,
    warnings: []
  }); // Only show the first error.

  ErrorOverlay.reportBuildError(formatted.errors[0]); // Also log them to the console.

  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    for (var i = 0; i < formatted.errors.length; i++) {
      console.error(strip_ansi_1.default(formatted.errors[i]));
    }
  }
} // There is a newer version of the code available.


function handleAvailableHash(hash) {
  // Update last known compilation hash.
  mostRecentCompilationHash = hash;
} // Handle messages from the server.


function processMessage(e) {
  var obj = JSON.parse(e.data);

  switch (obj.action) {
    case 'building':
      {
        console.log('[HMR] bundle ' + (obj.name ? "'" + obj.name + "' " : '') + 'rebuilding');
        break;
      }

    case 'built':
    case 'sync':
      {
        clearOutdatedErrors();

        if (obj.hash) {
          handleAvailableHash(obj.hash);
        }

        if (obj.warnings.length > 0) {
          handleWarnings(obj.warnings);
        }

        if (obj.errors.length > 0) {
          // When there is a compilation error coming from SSR we have to reload the page on next successful compile
          if (obj.action === 'sync') {
            hadRuntimeError = true;
          }

          handleErrors(obj.errors);
          break;
        }

        handleSuccess();
        break;
      }

    default:
      {
        if (customHmrEventHandler) {
          customHmrEventHandler(obj);
          break;
        }

        break;
      }
  }
} // Is there a newer version of this code available?


function isUpdateAvailable() {
  /* globals __webpack_hash__ */
  // __webpack_hash__ is the hash of the current compilation.
  // It's a global variable injected by Webpack.
  return mostRecentCompilationHash !== __webpack_hash__;
} // Webpack disallows updates in other states.


function canApplyUpdates() {
  return module.hot.status() === 'idle';
}