import pkg from "./package.json";

export default {
  input: "src/index.js",
  output: [
    {
      file: pkg.main,
      format: "cjs"
    },
    {
      file: pkg.bin["react-env"],
      format: "cjs"
    }
  ],
  external: ["shelljs", "path"]
};
