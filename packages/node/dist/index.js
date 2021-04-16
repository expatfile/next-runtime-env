'use strict';

function isBrowser() {
  return Boolean(typeof window !== "undefined" && window.__ENV);
}

function getFiltered() {
  const prefix = process.env.REACT_ENV_PREFIX || 'REACT_APP';
  return Object.keys(process.env)
    .filter((key) => new RegExp(`^${prefix}_`, 'i').test(key))
    .reduce((env, key) => {
      env[key] = process.env[key];
      return env;
    }, {});
}

function env(key = "") {
  const prefix = (isBrowser() ? window.__ENV['REACT_ENV_PREFIX'] : process.env.REACT_ENV_PREFIX) || 'REACT_APP';
  const safeKey = `${prefix}_${key}`;
  if (isBrowser()) {
    return key.length ? window.__ENV[safeKey] : window.__ENV;
  }
  return key.length ? process.env[safeKey] : getFiltered();
}

module.exports = env;
