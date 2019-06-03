import commonjs from "rollup-plugin-commonjs";

export default [
  {
    input: "src/cli-index.js",
    output: {
      file: "dist/cli-index.js",
      format: "cjs"
    },
    external: ["shelljs", "yargs"]
  },
  {
    input: "src/index.js",
    output: {
      file: "dist/index.js",
      format: "cjs"
    },
    plugins: [
      commonjs()
    ]
  }
];
