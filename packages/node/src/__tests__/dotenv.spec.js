import Mock from "../../testing/mockEnv";

afterEach(() => {
  Mock.reset();
});

it("parses safe env vars", () => {
  Mock.writeEnvFile(".env", `
  REACT_APP_FOO=123
  REACT_APP_BAR='hello world'
  `);
  Mock.run(["--dest","."]);

  expect(window.__ENV.REACT_APP_FOO).toBe("123");
  expect(window.__ENV.REACT_APP_BAR).toBe("hello world");

  delete process.env.REACT_APP_FOO;
  delete process.env.REACT_APP_BAR;
});

it("reads env files via --key arg", () => {
  process.env.ENV = 'staging';

  Mock.writeEnvFile(".env.staging", `
  REACT_APP_FOO=456
  REACT_APP_BAR=789
  `);
  Mock.run(["--key","ENV","--dest","."]);

  expect(window.__ENV.REACT_APP_FOO).toBe("456");
  expect(window.__ENV.REACT_APP_BAR).toBe("789");

  delete process.env.ENV;
  delete process.env.REACT_APP_FOO;
  delete process.env.REACT_APP_BAR;
});

it("reads env files via -k arg", () => {
  process.env.ENV = 'production';

  Mock.writeEnvFile(".env.production", `
  REACT_APP_FOO=789
  REACT_APP_BAR=101112
  `);
  Mock.run(["-k","ENV","--dest","."]);

  expect(window.__ENV.REACT_APP_FOO).toBe("789");
  expect(window.__ENV.REACT_APP_BAR).toBe("101112");

  delete process.env.ENV;
  delete process.env.REACT_APP_FOO;
  delete process.env.REACT_APP_BAR;
});

it("has order of priority", () => {
  process.env.ENV = 'test';

  Mock.writeEnvFile(".env.test", `
  REACT_APP_TEST=1001
  `);
  Mock.writeEnvFile(".env.local", `
  REACT_APP_TEST=1000
  REACT_APP_LOCAL=2001
  `);  
  Mock.writeEnvFile(".env", `
  REACT_APP_TEST=1000
  REACT_APP_LOCAL=2000
  REACT_APP_BASE=3001
  `);    
  Mock.run(["-k","ENV","--dest","."]);

  expect(window.__ENV.REACT_APP_TEST).toBe("1001");
  expect(window.__ENV.REACT_APP_LOCAL).toBe("2001");
  expect(window.__ENV.REACT_APP_BASE).toBe("3001");

  delete process.env.ENV;
  delete process.env.REACT_APP_TEST;
  delete process.env.REACT_APP_LOCAL;
  delete process.env.REACT_APP_BASE;
});

it("can expand env vars", () => {
  Mock.writeEnvFile(".env", "REACT_APP_ENV=${NODE_ENV}");
  Mock.run(["--dest","."]);

  expect(window.__ENV.REACT_APP_ENV).toBe(process.env.NODE_ENV);

  delete process.env.REACT_APP_ENV;
});
