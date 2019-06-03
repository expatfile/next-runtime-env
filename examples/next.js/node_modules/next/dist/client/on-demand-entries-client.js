"use strict";
/* global window */

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));

var _this = void 0;

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var router_1 = __importDefault(require("next/router"));

var on_demand_entries_utils_1 = require("./on-demand-entries-utils");

exports.default = function (_ref) {
  var assetPrefix = _ref.assetPrefix;

  try {
    router_1.default.ready(function () {
      router_1.default.events.on('routeChangeStart', function () {
        return on_demand_entries_utils_1.closePing();
      });
      router_1.default.events.on('routeChangeComplete', on_demand_entries_utils_1.setupPing.bind(_this, assetPrefix, function () {
        return router_1.default.pathname;
      }));
    });
    on_demand_entries_utils_1.setupPing(assetPrefix, function () {
      return router_1.default.pathname;
    }, on_demand_entries_utils_1.currentPage);
    return;
  } catch (e) {
    return _promise.default.reject(e);
  }
};