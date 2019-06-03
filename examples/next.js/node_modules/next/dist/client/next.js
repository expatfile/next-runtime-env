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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _1 = __importStar(require("./")),
    next = _1;

window.next = next;

_1.default().catch(function (err) {
  console.error("".concat(err.message, "\n").concat(err.stack));
});