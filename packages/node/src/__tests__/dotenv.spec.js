import Mock from "../../testing/mockEnv";
import fs from 'fs';

const debugSpy = jest.spyOn(console, "debug");
const infoSpy = jest.spyOn(console, "info");

beforeAll(() => {
  debugSpy.mockImplementation()
  infoSpy.mockImplementation()
});

afterAll(() => {
  debugSpy.mockRestore();
  infoSpy.mockRestore();
});

afterEach(() => {
  Mock.reset();
});

it("parses safe env vars and", () => {
  const dest = '.';
  const base = fs.realpathSync(process.cwd());
  const pathToEnv = `${base}/${dest}/__ENV.js`;

  Mock.writeEnvFile(".env", `
  REACT_APP_FOO=123
  REACT_APP_BAR='hello world'
  `);
  
  const jsonEnv = JSON.stringify({
    REACT_APP_FOO: "123",
    REACT_APP_BAR: 'hello world'
  }, null, 2)

  Mock.run(["--dest", dest]);
  

  expect(window.__ENV.REACT_APP_FOO).toBe("123");
  expect(window.__ENV.REACT_APP_BAR).toBe("hello world");

  delete process.env.REACT_APP_FOO;
  delete process.env.REACT_APP_BAR;

   
  expect(infoSpy).toHaveBeenCalledWith('react-env: Writing runtime env', pathToEnv)
  expect(debugSpy).not.toHaveBeenCalledWith(jsonEnv)
});

it("reads env files via --env arg", () => {
  process.env.ENV = 'staging';

  Mock.writeEnvFile(".env.staging", `
  REACT_APP_FOO=456
  REACT_APP_BAR=789
  `);
  Mock.run(["--env","ENV","--dest","."]);

  expect(window.__ENV.REACT_APP_FOO).toBe("456");
  expect(window.__ENV.REACT_APP_BAR).toBe("789");

  delete process.env.ENV;
  delete process.env.REACT_APP_FOO;
  delete process.env.REACT_APP_BAR;
});

it("reads env files via -e arg", () => {
  process.env.ENV = 'production';

  Mock.writeEnvFile(".env.production", `
  REACT_APP_FOO=789
  REACT_APP_BAR=101112
  `);
  Mock.run(["-e","ENV","--dest","."]);

  expect(window.__ENV.REACT_APP_FOO).toBe("789");
  expect(window.__ENV.REACT_APP_BAR).toBe("101112");

  delete process.env.ENV;
  delete process.env.REACT_APP_FOO;
  delete process.env.REACT_APP_BAR;
});

it("reads files via --path arg", () => {

  Mock.writeEnvFile(".env.foo", `
  REACT_APP_FOO=10101
  REACT_APP_BAR=01010
  `);
  Mock.run(["--path",".env.foo","--dest","."]);

  expect(window.__ENV.REACT_APP_FOO).toBe("10101");
  expect(window.__ENV.REACT_APP_BAR).toBe("01010");

  delete process.env.ENV;
  delete process.env.REACT_APP_FOO;
  delete process.env.REACT_APP_BAR;
});

it("reads files via -p arg", () => {

  Mock.writeEnvFile(".env.bar", `
  REACT_APP_FOO=1983
  REACT_APP_BAR=3891
  `);
  Mock.run(["-p",".env.bar","--dest","."]);

  expect(window.__ENV.REACT_APP_FOO).toBe("1983");
  expect(window.__ENV.REACT_APP_BAR).toBe("3891");

  delete process.env.ENV;
  delete process.env.REACT_APP_FOO;
  delete process.env.REACT_APP_BAR;
});

it("has order of priority", () => {
  process.env.ENV = 'test';

  Mock.writeEnvFile(".env.qa", `
  REACT_APP_QA=4001
  `);  
  Mock.writeEnvFile(".env.test", `
  REACT_APP_QA=4000
  REACT_APP_TEST=3001
  `);
  Mock.writeEnvFile(".env.local", `
  REACT_APP_QA=4000
  REACT_APP_TEST=3000
  REACT_APP_LOCAL=2001
  `);  
  Mock.writeEnvFile(".env", `
  REACT_APP_QA=4000
  REACT_APP_TEST=3000
  REACT_APP_LOCAL=2000
  REACT_APP_BASE=1001
  `);    
  Mock.run(["-p",".env.qa","-e","ENV","--dest","."]);

  expect(window.__ENV.REACT_APP_QA).toBe("4001");
  expect(window.__ENV.REACT_APP_TEST).toBe("3001");
  expect(window.__ENV.REACT_APP_LOCAL).toBe("2001");
  expect(window.__ENV.REACT_APP_BASE).toBe("1001");

  delete process.env.ENV;
  delete process.env.REACT_APP_QA;
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

it('can use custom prefix via --prefix arg', () => {
  Mock.writeEnvFile(".env", `
  CUSTOM_PREFIX_FOO=10101
  CUSTOM_PREFIX_BAR=01010
  `);

  Mock.run(["--prefix","CUSTOM_PREFIX","--dest","."]);

  expect(process.env.REACT_ENV_PREFIX).toBe("CUSTOM_PREFIX");

  expect(process.env.CUSTOM_PREFIX_FOO).toBe("10101");
  expect(process.env.CUSTOM_PREFIX_BAR).toBe("01010");

  expect(window.__ENV.CUSTOM_PREFIX_FOO).toBe("10101");
  expect(window.__ENV.CUSTOM_PREFIX_BAR).toBe("01010");

  delete process.env.CUSTOM_PREFIX_FOO;
  delete process.env.CUSTOM_PREFIX_BAR;
})

it("should show log only if debug params is enabled", () => {
  Mock.writeEnvFile(".env", `
  REACT_APP_FOO=123
  REACT_APP_BAR='hello world'
  `);

  const jsonEnv = JSON.stringify({
    REACT_APP_FOO: "123",
    REACT_APP_BAR: 'hello world'
  }, null, 2)

  Mock.run(["--debug", '--dest', '.']);

  expect(window.__ENV.REACT_APP_FOO).toBe("123");
  expect(window.__ENV.REACT_APP_BAR).toBe("hello world");

  delete process.env.REACT_APP_FOO;
  delete process.env.REACT_APP_BAR;

  expect(debugSpy).toHaveBeenCalledWith(`react-env: ${jsonEnv}`)
})