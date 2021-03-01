'use strict';

function isBrowser() {
  return Boolean(typeof window !== "undefined" && window.__ENV);
}

function getFiltered() {
  return Object.keys(process.env)
    .filter((key) => /^REACT_APP_/i.test(key))
    .reduce((env, key) => {
      env[key] = process.env[key];
      return env;
    }, {});
}

function env(key = "") {
  const safeKey = `REACT_APP_${key}`;
  if (isBrowser()) {
    return key.length ? window.__ENV[safeKey] : window.__ENV;
  }
  return key.length ? process.env[safeKey] : getFiltered();
}

module.exports = env;
