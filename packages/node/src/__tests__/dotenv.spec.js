import { loadEnv, mockEnvFiles, resetMocks } from "../../testing/mockEnv";

afterEach(() => {
  resetMocks();
});

test(".env.test.local has 1st priority", () => {
  mockEnvFiles([".env.test.local", ".env.test", ".env.local", ".env"]);
  loadEnv();
  expect(window._env.REACT_APP_FOO).toBe(".env.test.local");
});

test(".env.test has 2nd priority", () => {
  mockEnvFiles([".env.test", ".env.local", ".env"]);
  loadEnv();
  expect(window._env.REACT_APP_FOO).toBe(".env.test");
});

test(".env has 3rd priority", () => {
  mockEnvFiles([".env"]);
  loadEnv();
  expect(window._env.REACT_APP_FOO).toBe(".env");
});

test(".env.local has 3rd priority when not in test env", () => {
  process.env.NODE_ENV = 'development'
  mockEnvFiles([".env.local",".env"]);
  loadEnv();
  expect(window._env.REACT_APP_FOO).toBe(".env.local");
});

test("can expand env vars", () => {
  mockEnvFiles();
  loadEnv();
  expect(window._env.REACT_APP_EXPAND).toBe(process.env.NODE_ENV);
});
