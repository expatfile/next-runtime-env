"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/slicedToArray"));

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var hot_dev_client_1 = __importDefault(require("./dev-error-overlay/hot-dev-client"));

exports.default = function (_ref) {
  var assetPrefix = _ref.assetPrefix;
  var options = {
    path: "".concat(assetPrefix, "/_next/webpack-hmr")
  };
  var devClient = hot_dev_client_1.default(options);
  devClient.subscribeToHmrEvent(function (obj) {
    if (obj.action === 'reloadPage') {
      return window.location.reload();
    }

    if (obj.action === 'removedPage') {
      var _obj$data = (0, _slicedToArray2.default)(obj.data, 1),
          page = _obj$data[0];

      if (page === window.next.router.pathname) {
        return window.location.reload();
      }

      return;
    }

    if (obj.action === 'addedPage') {
      var _obj$data2 = (0, _slicedToArray2.default)(obj.data, 1),
          _page = _obj$data2[0];

      if (_page === window.next.router.pathname && typeof window.next.router.components[_page] === 'undefined') {
        return window.location.reload();
      }

      return;
    }

    throw new Error('Unexpected action ' + obj.action);
  });
  return devClient;
};