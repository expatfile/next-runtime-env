"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));

var _set = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/set"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* global document */

var mitt_1 = __importDefault(require("next-server/dist/lib/mitt"));

var unfetch_1 = __importDefault(require("unfetch")); // smaller version of https://gist.github.com/igrigorik/a02f2359f3bc50ca7a9c


function supportsPreload(list) {
  if (!list || !list.supports) {
    return false;
  }

  try {
    return list.supports('preload');
  } catch (e) {
    return false;
  }
}

var hasPreload = supportsPreload(document.createElement('link').relList);

var PageLoader =
/*#__PURE__*/
function () {
  function PageLoader(buildId, assetPrefix) {
    (0, _classCallCheck2.default)(this, PageLoader);
    this.buildId = buildId;
    this.assetPrefix = assetPrefix;
    this.pageCache = {};
    this.prefetchCache = new _set.default();
    this.pageRegisterEvents = mitt_1.default();
    this.loadingRoutes = {};
    this.promisedBuildId = _promise.default.resolve();
  }

  (0, _createClass2.default)(PageLoader, [{
    key: "normalizeRoute",
    value: function normalizeRoute(route) {
      if (route[0] !== '/') {
        throw new Error("Route name should start with a \"/\", got \"".concat(route, "\""));
      }

      route = route.replace(/\/index$/, '/');
      if (route === '/') return route;
      return route.replace(/\/$/, '');
    }
  }, {
    key: "loadPage",
    value: function loadPage(route) {
      var _this = this;

      route = this.normalizeRoute(route);
      return new _promise.default(function (resolve, reject) {
        var fire = function fire(_ref) {
          var error = _ref.error,
              page = _ref.page;

          _this.pageRegisterEvents.off(route, fire);

          delete _this.loadingRoutes[route];

          if (error) {
            reject(error);
          } else {
            resolve(page);
          }
        }; // If there's a cached version of the page, let's use it.


        var cachedPage = _this.pageCache[route];

        if (cachedPage) {
          var error = cachedPage.error,
              page = cachedPage.page;
          error ? reject(error) : resolve(page);
          return;
        } // Register a listener to get the page


        _this.pageRegisterEvents.on(route, fire); // If the page is loading via SSR, we need to wait for it
        // rather downloading it again.


        if (document.getElementById("__NEXT_PAGE__".concat(route))) {
          return;
        } // Load the script if not asked to load yet.


        if (!_this.loadingRoutes[route]) {
          _this.loadScript(route);

          _this.loadingRoutes[route] = true;
        }
      });
    }
  }, {
    key: "onDynamicBuildId",
    value: function onDynamicBuildId() {
      var _this2 = this;

      this.promisedBuildId = new _promise.default(function (resolve) {
        unfetch_1.default("".concat(_this2.assetPrefix, "/_next/static/HEAD_BUILD_ID")).then(function (res) {
          if (res.ok) {
            return res;
          }

          var err = new Error('Failed to fetch HEAD buildId');
          err.res = res;
          throw err;
        }).then(function (res) {
          return res.text();
        }).then(function (buildId) {
          _this2.buildId = buildId.trim();
        }).catch(function () {
          // When this fails it's not a _huge_ deal, preload wont work and page
          // navigation will 404, triggering a SSR refresh
          console.warn('Failed to load BUILD_ID from server. ' + 'The following client-side page transition will likely 404 and cause a SSR.\n' + 'http://err.sh/zeit/next.js/head-build-id');
        }).then(resolve, resolve);
      });
    }
  }, {
    key: "loadScript",
    value: function (route) {
      try {
        var _this4 = this;

        return _promise.default.resolve(_this4.promisedBuildId).then(function () {
          route = _this4.normalizeRoute(route);
          var scriptRoute = route === '/' ? '/index.js' : "".concat(route, ".js");
          var script = document.createElement('script');
          var url = "".concat(_this4.assetPrefix, "/_next/static/").concat(encodeURIComponent(_this4.buildId), "/pages").concat(scriptRoute);
          script.crossOrigin = process.crossOrigin;
          script.src = url;

          script.onerror = function () {
            var error = new Error("Error when loading route: ".concat(route));
            error.code = 'PAGE_LOAD_ERROR';

            _this4.pageRegisterEvents.emit(route, {
              error: error
            });
          };

          document.body.appendChild(script);
        });
      } catch (e) {
        return _promise.default.reject(e);
      }
    } // This method if called by the route code.

  }, {
    key: "registerPage",
    value: function registerPage(route, regFn) {
      var _this5 = this;

      var register = function register() {
        try {
          var _regFn = regFn(),
              error = _regFn.error,
              page = _regFn.page;

          _this5.pageCache[route] = {
            error: error,
            page: page
          };

          _this5.pageRegisterEvents.emit(route, {
            error: error,
            page: page
          });
        } catch (error) {
          _this5.pageCache[route] = {
            error: error
          };

          _this5.pageRegisterEvents.emit(route, {
            error: error
          });
        }
      };

      if (process.env.NODE_ENV !== 'production') {
        // Wait for webpack to become idle if it's not.
        // More info: https://github.com/zeit/next.js/pull/1511
        if (module.hot && module.hot.status() !== 'idle') {
          console.log("Waiting for webpack to become \"idle\" to initialize the page: \"".concat(route, "\""));

          var check = function check(status) {
            if (status === 'idle') {
              module.hot.removeStatusHandler(check);
              register();
            }
          };

          module.hot.status(check);
          return;
        }
      }

      register();
    }
  }, {
    key: "prefetch",
    value: function (route) {
      try {
        var _exit2 = false;

        var _this7 = this;

        function _temp3(_result) {
          if (_exit2) return _result;

          if (document.readyState === 'complete') {
            return _this7.loadPage(route).catch(function () {});
          } else {
            return new _promise.default(function (resolve) {
              window.addEventListener('load', function () {
                _this7.loadPage(route).then(function () {
                  return resolve();
                }, function () {
                  return resolve();
                });
              });
            });
          }
        }

        route = _this7.normalizeRoute(route);
        var scriptRoute = route === '/' ? '/index.js' : "".concat(route, ".js");

        if (_this7.prefetchCache.has(scriptRoute)) {
          return _promise.default.resolve();
        }

        _this7.prefetchCache.add(scriptRoute); // Inspired by quicklink, license: https://github.com/GoogleChromeLabs/quicklink/blob/master/LICENSE
        // Don't prefetch if the user is on 2G / Don't prefetch if Save-Data is enabled


        if ('connection' in navigator) {
          if ((navigator.connection.effectiveType || '').indexOf('2g') !== -1 || navigator.connection.saveData) {
            return _promise.default.resolve();
          }
        } // Feature detection is used to see if preload is supported
        // If not fall back to loading script tags before the page is loaded
        // https://caniuse.com/#feat=link-rel-preload


        var _temp4 = function () {
          if (hasPreload) {
            return _promise.default.resolve(_this7.promisedBuildId).then(function () {
              var link = document.createElement('link');
              link.rel = 'preload';
              link.crossOrigin = process.crossOrigin;
              link.href = "".concat(_this7.assetPrefix, "/_next/static/").concat(encodeURIComponent(_this7.buildId), "/pages").concat(scriptRoute);
              link.as = 'script';
              document.head.appendChild(link);
              _exit2 = true;
            });
          }
        }();

        return _promise.default.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
      } catch (e) {
        return _promise.default.reject(e);
      }
    }
  }, {
    key: "clearCache",
    value: function clearCache(route) {
      route = this.normalizeRoute(route);
      delete this.pageCache[route];
      delete this.loadingRoutes[route];
      var script = document.getElementById("__NEXT_PAGE__".concat(route));

      if (script) {
        script.parentNode.removeChild(script);
      }
    }
  }]);
  return PageLoader;
}();

exports.default = PageLoader;