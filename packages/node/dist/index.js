'use strict';

function isBrowser() {
  return Boolean(typeof window !== "undefined" && window.__ENV);
}

function env(key = "") {
  if (isBrowser()) {
    return window.__ENV[key];
  }
  return process.env[key];
}

module.exports = env;
