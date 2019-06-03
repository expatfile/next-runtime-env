"use strict";
/* global window, location */

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var unfetch_1 = __importDefault(require("unfetch"));

var evtSource;
var retryTimeout;
var retryWait = 5000;

function closePing() {
  if (evtSource) evtSource.close();
}

exports.closePing = closePing;

function setupPing(assetPrefix, pathnameFn, retry) {
  var pathname = pathnameFn(); // Make sure to only create new EventSource request if page has changed

  if (pathname === exports.currentPage && !retry) return;
  exports.currentPage = pathname; // close current EventSource connection

  closePing();
  var url = "".concat(assetPrefix, "/_next/on-demand-entries-ping?page=").concat(exports.currentPage);
  evtSource = new window.EventSource(url);

  evtSource.onerror = function () {
    retryTimeout = setTimeout(function () {
      return setupPing(assetPrefix, pathnameFn, true);
    }, retryWait);
  };

  evtSource.onopen = function () {
    clearTimeout(retryTimeout);
  };

  evtSource.onmessage = function (event) {
    try {
      var payload = JSON.parse(event.data);

      if (payload.invalid) {
        // Payload can be invalid even if the page does not exist.
        // So, we need to make sure it exists before reloading.
        unfetch_1.default(location.href, {
          credentials: 'same-origin'
        }).then(function (pageRes) {
          if (pageRes.status === 200) {
            location.reload();
          }
        });
      }
    } catch (err) {
      console.error('on-demand-entries failed to parse response', err);
    }
  };
}

exports.setupPing = setupPing;