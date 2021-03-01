import env from "../";

it("returns a safe value from the browser", () => {
  Object.defineProperty(global, "window", {
    value: {
      __ENV: {
        REACT_APP_FOO: "bar",
      },
    },
    writable: true,
  });

  expect(env("FOO")).toBe("bar");
});

it("returns a safe value from the server", () => {
  process.env.REACT_APP_FOO = "bar";
  expect(env("FOO")).toBe("bar");
});

it("does not return a non-safe value from the browser", () => {
  Object.defineProperty(global, "window", {
    value: {
      __ENV: {
        FOO: "bar",
      },
    },
    writable: true,
  });

  expect(env("FOO")).toBeUndefined();
});

it("does not return a non-safe value from the server", () => {
  process.env.FOO = "bar";
  expect(env("FOO")).toBeUndefined();
});

it("returns entire safe environment from the browser", () => {
  Object.defineProperty(global, "window", {
    value: {
      __ENV: {
        REACT_APP_FOO: "bar",
        REACT_APP_BAR: "foo",
      },
    },
    writable: true,
  });

  expect(env()).toEqual({
    REACT_APP_FOO: "bar",
    REACT_APP_BAR: "foo",
  });
});

it("returns entire safe environment from the server", () => {
  process.env.REACT_APP_FOO = "bar";
  process.env.REACT_APP_BAR = "foo";
  expect(env()).toEqual({
    REACT_APP_FOO: "bar",
    REACT_APP_BAR: "foo",
  });
});

it("returns undefined when variable does not exist in the browser", () => {
  expect(env("BAM_BAM")).toBe(undefined);
});

it("returns undefined when variable does not exist in the server", () => {
  expect(env("BAM_BAM_BAM")).toBe(undefined);
});
