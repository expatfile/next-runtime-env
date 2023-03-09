function isBrowser() {
  return Boolean(typeof window !== "undefined" && window.__ENV);
}

export default function env(key = "") {
  if (isBrowser()) {
    return window.__ENV[key];
  }
  return process.env[key];
}
