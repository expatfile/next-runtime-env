"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var filenameRE = /\(([^)]+\.js):(\d+):(\d+)\)$/;

function rewriteStacktrace(e, distDir) {
  if (!e || typeof e.stack !== 'string') {
    return;
  }

  var lines = e.stack.split('\n');
  var result = lines.map(function (line) {
    return rewriteTraceLine(line, distDir);
  });
  e.stack = result.join('\n');
}

exports.rewriteStacktrace = rewriteStacktrace;

function rewriteTraceLine(trace, distDir) {
  var m = trace.match(filenameRE);

  if (m == null) {
    return trace;
  }

  var filename = m[1];
  var filenameLink = filename.replace(distDir, '/_next/development').replace(/\\/g, '/');
  trace = trace.replace(filename, filenameLink);
  return trace;
}