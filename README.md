# React Env - Runtime Environment Configuration

[![Build Status](https://cloud.drone.io/api/badges/andrewmclagan/react-env/status.svg)](https://cloud.drone.io/andrewmclagan/react-env)
[![npm version](https://badge.fury.io/js/%40beam-australia%2Freact-env.svg)](https://badge.fury.io/js/%40beam-australia%2Freact-env)
[![Coverage Status](https://coveralls.io/repos/github/beam-australia/react-env/badge.svg)](https://coveralls.io/github/beam-australia/react-env)

Populates your environment from `.env` files at **run-time** rather than **build-time**.

### Features

- Isomorphic - Server and browser compatible.
- Supports static site generation.
- Supports multiple `.env` files.

### Examples

- Example using [Next.js](examples/next.js/README.md) (see README.md)
- Example using [Create React APP](examples/create-react-app/README.md) (see README.md)

### Overview

This package generates a `__ENV.js` file from multiple `.env` files that contains white-listed environment variables that have a `REACT_APP_` preposition.

In the browser your variables will be available at `window.__ENV.REACT_APP_FOO` and on the server `process.env.REACT_APP_FOO`. We have included a helper function to make retrieving a value easier:

```bash
# .env
REACT_APP_NEXT="Next.js"
REACT_APP_CRA="Create React App"
REACT_APP_NOT_SECRET_CODE="1234"
```

becomes...

```jsx
import env from "@beam-australia/react-env";

export default (props) => (
  <div>
    <small>
      Works in the browser: <b>{env("CRA")}</b>.
    </small>
    <small>
      Also works for server side rendering: <b>{env("NEXT")}</b>.
    </small>
    <form>
      <input type="hidden" defaultValue={env("NOT_SECRET_CODE")} />
    </form>
    <small>
      Entire safe environment:
      <pre>
        <code>{{JSON.stringify(env())}}</code>
      </pre>
    </small>
  </div>
);
```

### .env file order of priority

We have implemented some sane defaults that will be have the following order of priority:

1. `.env.{key}`
2. `.env.local`
3. `.env`

Where `.env.{key}` is defined by the `--key` argument. For example:

```bash
# .env.staging
REACT_APP_API_HOST="api.staging.com"
# .env.local
REACT_APP_API_HOST="api.example.dev"
# .env
REACT_APP_API_HOST="localhost"
```
running `react-env --key APP_ENV` where the environment variable `APP_ENV=staging` would populate:

```json
{
  "REACT_APP_API_HOST": "api.staging.com"
}
```

in the browser and `process.env` on the server. This allows for overiding environments where there is defaults for a local environment. We suggest you add `.env.local` to `.gitignore`.

### Arguments and parameters

```bash
$ react-env --key APP_ENV --dest /path/to/build -- <command with arguments>
```

This will generate a `__ENV.js` file in the dest directory `/path/to/build` and then run the command. The command will have all the environment variable available in `process.env`, great for server side rending and other use-cases.

- `<command>`

You may pass a command, such as a nodejs entry file to the `react-env` cli tool. The command will have all the environment variable available in `process.env`, great for server side rending and other use-cases.

- `--key`, `-k` **(default: null)**

Parse an environment specific env-file via the value of an exisitng environment variable. For example `--key APP_ENV` where `APP_ENV=staging` would read the env file `.env.staging`. This file takes priority over the defaults `.env` and `.env.local`

- `--dest` **(default: ./public)**

Change the default destination for generating the `__ENV.js` file.


### 3.x.x Breaking changes

As a significant breaking change we have dropped the ability to specify specific files via the `--env` argument in favour of an env key `--key`. This allows specific environment configuration to be built depending on the running environment. It is very common for platforms to have `staging, qa, integration` environments that are still built in "production" mode with `NODE_ENV=production`. This allows for that usecase and many others.

We have also dropped adding `NODE_ENV` by default.