# React Env - Runtime Environment Configuration

[![Build Status](https://cloud.drone.io/api/badges/andrewmclagan/react-env/status.svg)](https://cloud.drone.io/andrewmclagan/react-env)
[![npm version](https://badge.fury.io/js/%40beam-australia%2Freact-env.svg)](https://badge.fury.io/js/%40beam-australia%2Freact-env)
[![Coverage Status](https://coveralls.io/repos/github/beam-australia/react-env/badge.svg)](https://coveralls.io/github/beam-australia/react-env)

Populates your environment from `.env` files at **run-time** rather than **build-time**.

- Isomorphic - Server and browser compatible.
- Supports static site generation.
- Supports multiple `.env` files.

## README

* [Examples](#examples)
* [Getting started](#getting-started)
* [File priority](#env-file-order-of-priority)
* [Common use cases](#common-use-cases)
  * [Environment specific config](#environment-specific-config)
  * [Specifing an env file](#Specifing-an-env-file)
  * [Using with Docker entrypoint](#using-with-docker-entrypoint)
* [Arguments and parameters](#arguments-and-parameters)

### Examples

- Example using [Next.js](examples/next.js/README.md) (see README.md)
- Example using [Create React APP](examples/create-react-app/README.md) (see README.md)

### Getting started

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

We have implemented some sane defaults that have the following order of priority:

1. `.env.{file}  // from the --path, -p argument`
2. `.env.{key}   // from the --env, -e argument`
3. `.env.local`
4. `.env`

Your config is available in the browser and `process.env` on the server. We suggest you add `.env.local` to `.gitignore`.

### Common use cases

##### 1. Environment specific config

Frameworks such as Next allow for some nice defaults such as `.env.local, .env.production, .env`. This has the limitation where you may want to run your app in different environments such as "staging, integration, qa" but still build a "production" app with `NODE_ENV=production`. With react-env this is possible:

```bash
# .env.staging
REACT_APP_API_HOST="api.staging.com"
# .env.production
REACT_APP_API_HOST="api.staging.com"
# .env.qa
REACT_APP_API_HOST="api.staging.com"
# .env.integration
REACT_APP_API_HOST="api.staging.com"
# .env.local
REACT_APP_API_HOST="api.example.dev"
# .env
REACT_APP_API_HOST="localhost"
```

for staging you would simply set `APP_ENV=staging` where you run your app:

```
{
  ...
  "scripts": {
    "start": "react-env --env APP_ENV -- next start" // where .env.${APP_ENV}
  }
  ...
}
```
Thus `REACT_APP_API_HOST=api.staging.com` in your staging environment.

##### 2. Specifing an env file

You are also able to specify the path to a specific env file:

```
{
  ...
  "scripts": {
    "start": "react-env --path config/.env.defaults -- next start" 
  }
  ...
}
```

You can use any combination of these two arguments along with the default `.env, .env.local` to build your runtime config. 

##### 4. Using with Docker entrypoint

It is possible to use this package as an `ENTRYPOINT` script inside a Dockerfile. This will generate your `__ENV.js` config file when the container boots and allow your `package.json` scripts to remain the unchanged. Of course `node` binary must be present in your container.

```dockerfile
FROM node:alpine

ENTRYPOINT yarn react-env --env APP_ENV

CMD yarn start
```

### Arguments and parameters 

```bash
$ react-env <args> -- <command>
```

- `<command>`

You may pass a command, such as a nodejs entry file to the `react-env` cli tool. For example `react-scripts`, `next dev`, `next start`

- `--env`, `-e` **(default: null)**

Parse an environment specific env-file via the value of an exisitng environment variable. For example `--env APP_ENV` where `APP_ENV=staging` would load `.env.staging, .env.local, .env` in that order with the latter taking priority.

- `--path`, `-p` **(default: null)**

Specify a specific env file to load e.g. `react-env --path testing` would load `.env.testing, .env.local, .env` in that order with the latter taking priority. a Combination of `--env APP_ENV --path testing` where `APP_ENV=staging` loads `.env.testing, .env.staging, .env.local, .env` as the priority order.

- `--dest`, `-d` **(default: ./public)**

Change the default destination for generating the `__ENV.js` file.


### 3.x.x Breaking changes

---
As a significant breaking change we have dropped the ability to specify specific files via the `--env` argument. This argument now specifies environment file to be parsed depending on the running environment. For example `--env APP_ENV` or `-e APP_ENV` where `APP_ENV=staging` reads in `.env.staging`. It is very common for platforms to have `staging, qa, integration` environments that are still built in "production" mode with `NODE_ENV=production`. This allows for that usecase and many others.

--
You are still able to specify files via the `--path, -p` argument.

---
We have also dropped adding `NODE_ENV` by default as this was a security risk.

---
File is now named `__ENV.js`

---
Depandand command is now in the format `react-env <args> -- <command>`
