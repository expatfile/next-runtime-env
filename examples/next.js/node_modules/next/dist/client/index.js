"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _assign = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/assign"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/slicedToArray"));

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

var doRender = function doRender(_ref5) {
  var App = _ref5.App,
      Component = _ref5.Component,
      props = _ref5.props,
      err = _ref5.err;

  try {
    function _temp11() {
      Component = Component || lastAppProps.Component;
      props = props || lastAppProps.props;
      var appProps = (0, _assign.default)({
        Component: Component,
        err: err,
        router: exports.router
      }, props); // lastAppProps has to be set before ReactDom.render to account for ReactDom throwing an error.

      lastAppProps = appProps;
      exports.emitter.emit('before-reactdom-render', {
        Component: Component,
        ErrorComponent: exports.ErrorComponent,
        appProps: appProps
      }); // In development runtime errors are caught by react-error-overlay.

      if (process.env.NODE_ENV === 'development') {
        renderReactElement(react_1.default.createElement(react_1.Suspense, {
          fallback: react_1.default.createElement("div", null, "Loading...")
        }, react_1.default.createElement(router_context_1.RouterContext.Provider, {
          value: router_1.makePublicRouterInstance(exports.router)
        }, react_1.default.createElement(data_manager_context_1.DataManagerContext.Provider, {
          value: exports.dataManager
        }, react_1.default.createElement(head_manager_context_1.HeadManagerContext.Provider, {
          value: headManager.updateHead
        }, react_1.default.createElement(App, (0, _assign.default)({}, appProps)))))), appContainer);
      } else {
        // In production we catch runtime errors using componentDidCatch which will trigger renderError.
        renderReactElement(react_1.default.createElement(error_boundary_1.ErrorBoundary, {
          fn: function fn(error) {
            return renderError({
              App: App,
              err: error
            }).catch(function (err) {
              return console.error('Error rendering page: ', err);
            });
          }
        }, react_1.default.createElement(react_1.Suspense, {
          fallback: react_1.default.createElement("div", null, "Loading...")
        }, react_1.default.createElement(router_context_1.RouterContext.Provider, {
          value: router_1.makePublicRouterInstance(exports.router)
        }, react_1.default.createElement(data_manager_context_1.DataManagerContext.Provider, {
          value: exports.dataManager
        }, react_1.default.createElement(head_manager_context_1.HeadManagerContext.Provider, {
          value: headManager.updateHead
        }, react_1.default.createElement(App, (0, _assign.default)({}, appProps))))))), appContainer);
      }

      exports.emitter.emit('after-reactdom-render', {
        Component: Component,
        ErrorComponent: exports.ErrorComponent,
        appProps: appProps
      });
    }

    var _temp12 = function () {
      if (!props && Component && Component !== exports.ErrorComponent && lastAppProps.Component === exports.ErrorComponent) {
        var _exports$router = exports.router,
            pathname = _exports$router.pathname,
            _query = _exports$router.query,
            _asPath = _exports$router.asPath;
        return _promise.default.resolve(utils_1.loadGetInitialProps(App, {
          Component: Component,
          router: exports.router,
          ctx: {
            err: err,
            pathname: pathname,
            query: _query,
            asPath: _asPath
          }
        })).then(function (_utils_1$loadGetIniti) {
          props = _utils_1$loadGetIniti;
        });
      }
    }();

    // Usual getInitialProps fetching is handled in next/router
    // this is for when ErrorComponent gets replaced by Component by HMR
    return _promise.default.resolve(_temp12 && _temp12.then ? _temp12.then(_temp11) : _temp11(_temp12));
  } catch (e) {
    return _promise.default.reject(e);
  }
};

// This method handles all runtime and debug errors.
// 404 and 500 errors are special kind of errors
// and they are still handle via the main render method.
var renderError = function renderError(props) {
  try {
    var _App = props.App,
        _err = props.err;

    if (process.env.NODE_ENV !== 'production') {
      return _promise.default.resolve(webpackHMR.reportRuntimeError(webpackHMR.prepareError(_err)));
    } // Make sure we log the error to the console, otherwise users can't track down issues.


    console.error(_err);
    return _promise.default.resolve(pageLoader.loadPage('/_error')).then(function (_pageLoader$loadPage3) {
      function _temp8(initProps) {
        return _promise.default.resolve(doRender((0, _assign.default)({}, props, {
          err: _err,
          Component: exports.ErrorComponent,
          props: initProps
        }))).then(function () {});
      }

      exports.ErrorComponent = _pageLoader$loadPage3;
      var _props$props = props.props;
      // In production we do a normal render with the `ErrorComponent` as component.
      // If we've gotten here upon initial render, we can use the props from the server.
      // Otherwise, we need to call `getInitialProps` on `App` before mounting.
      return _props$props ? _temp8(props.props) : _promise.default.resolve(utils_1.loadGetInitialProps(_App, {
        Component: exports.ErrorComponent,
        router: exports.router,
        ctx: {
          err: _err,
          pathname: page,
          query: query,
          asPath: asPath
        }
      })).then(_temp8);
    });
  } catch (e) {
    return _promise.default.reject(e);
  }
};

var render = function render(props) {
  try {
    var _exit3 = false;

    function _temp6(_result2) {
      if (_exit3) return _result2;

      var _temp3 = _catch(function () {
        return _promise.default.resolve(doRender(props)).then(function () {});
      }, function (err) {
        return _promise.default.resolve(renderError((0, _assign.default)({}, props, {
          err: err
        }))).then(function () {});
      });

      if (_temp3 && _temp3.then) return _temp3.then(function () {});
    }

    var _temp7 = function () {
      if (props.err) {
        return _promise.default.resolve(renderError(props)).then(function () {
          _exit3 = true;
        });
      }
    }();

    return _promise.default.resolve(_temp7 && _temp7.then ? _temp7.then(_temp6) : _temp6(_temp7));
  } catch (e) {
    return _promise.default.reject(e);
  }
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

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var react_1 = __importStar(require("react"));

var react_dom_1 = __importDefault(require("react-dom"));

var head_manager_1 = __importDefault(require("./head-manager"));

var router_1 = require("next/router");

var mitt_1 = __importDefault(require("next-server/dist/lib/mitt"));

var utils_1 = require("next-server/dist/lib/utils");

var page_loader_1 = __importDefault(require("./page-loader"));

var envConfig = __importStar(require("next-server/config"));

var error_boundary_1 = require("./error-boundary");

var loadable_1 = __importDefault(require("next-server/dist/lib/loadable"));

var head_manager_context_1 = require("next-server/dist/lib/head-manager-context");

var data_manager_context_1 = require("next-server/dist/lib/data-manager-context");

var router_context_1 = require("next-server/dist/lib/router-context");

var data_manager_1 = require("next-server/dist/lib/data-manager"); // Polyfill Promise globally
// This is needed because Webpack's dynamic loading(common chunks) code
// depends on Promise.
// So, we need to polyfill it.
// See: https://webpack.js.org/guides/code-splitting/#dynamic-imports


if (!window.Promise) {
  window.Promise = _promise.default;
}

var data = JSON.parse(document.getElementById('__NEXT_DATA__').textContent);
window.__NEXT_DATA__ = data;
var props = data.props,
    err = data.err,
    page = data.page,
    query = data.query,
    buildId = data.buildId,
    dynamicBuildId = data.dynamicBuildId,
    assetPrefix = data.assetPrefix,
    runtimeConfig = data.runtimeConfig,
    dynamicIds = data.dynamicIds;
var d = JSON.parse(window.__NEXT_DATA__.dataManager);
exports.dataManager = new data_manager_1.DataManager(d);
var prefix = assetPrefix || ''; // With dynamic assetPrefix it's no longer possible to set assetPrefix at the build time
// So, this is how we do it in the client side at runtime

__webpack_public_path__ = "".concat(prefix, "/_next/"); //eslint-disable-line
// Initialize next/config with the environment configuration

envConfig.setConfig({
  serverRuntimeConfig: {},
  publicRuntimeConfig: runtimeConfig
});
var asPath = utils_1.getURL();
var pageLoader = new page_loader_1.default(buildId, prefix);

var register = function register(_ref) {
  var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
      r = _ref2[0],
      f = _ref2[1];

  return pageLoader.registerPage(r, f);
};

if (window.__NEXT_P) {
  window.__NEXT_P.map(register);
}

window.__NEXT_P = [];
window.__NEXT_P.push = register;
var headManager = new head_manager_1.default();
var appContainer = document.getElementById('__next');
var lastAppProps;
var webpackHMR;
var Component;
var App;
exports.emitter = mitt_1.default();

exports.default = function () {
  var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      passedWebpackHMR = _ref3.webpackHMR;

  try {
    // This makes sure this specific line is removed in production
    if (process.env.NODE_ENV === 'development') {
      webpackHMR = passedWebpackHMR;
    }

    return _promise.default.resolve(pageLoader.loadPage('/_app')).then(function (_pageLoader$loadPage) {
      var _exit = false;

      function _temp2(_result) {
        return _exit ? _result : _promise.default.resolve(loadable_1.default.preloadReady(dynamicIds || [])).then(function () {
          if (dynamicBuildId === true) {
            pageLoader.onDynamicBuildId();
          }

          exports.router = router_1.createRouter(page, query, asPath, {
            initialProps: props,
            pageLoader: pageLoader,
            App: App,
            Component: Component,
            err: initialErr
          });
          exports.router.subscribe(function (_ref4) {
            var App = _ref4.App,
                Component = _ref4.Component,
                props = _ref4.props,
                err = _ref4.err;
            render({
              App: App,
              Component: Component,
              props: props,
              err: err,
              emitter: exports.emitter
            });
          });
          render({
            App: App,
            Component: Component,
            props: props,
            err: initialErr,
            emitter: exports.emitter
          });
          return exports.emitter;
        });
      }

      App = _pageLoader$loadPage;
      var initialErr = err;

      var _temp = _catch(function () {
        return _promise.default.resolve(pageLoader.loadPage(page)).then(function (_pageLoader$loadPage2) {
          Component = _pageLoader$loadPage2;

          if (process.env.NODE_ENV !== 'production') {
            var _require = require('react-is'),
                isValidElementType = _require.isValidElementType;

            if (!isValidElementType(Component)) {
              throw new Error("The default export is not a React Component in page: \"".concat(page, "\""));
            }
          }
        });
      }, function (error) {
        // This catches errors like throwing in the top level of a module
        initialErr = error;
      });

      return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
    });
  } catch (e) {
    return _promise.default.reject(e);
  }
};

exports.render = render;
exports.renderError = renderError;
var isInitialRender = true;

function renderReactElement(reactEl, domEl) {
  // The check for `.hydrate` is there to support React alternatives like preact
  if (isInitialRender && typeof react_dom_1.default.hydrate === 'function') {
    react_dom_1.default.hydrate(reactEl, domEl);
    isInitialRender = false;
  } else {
    react_dom_1.default.render(reactEl, domEl);
  }
}