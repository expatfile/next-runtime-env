# React Env - Runtime Environment Configuration

[![Build Status](https://travis-ci.org/beam-australia/react-env.svg?branch=master)](https://travis-ci.org/beam-australia/react-env)
[![npm version](https://badge.fury.io/js/%40beam-australia%2Freact-env.svg)](https://badge.fury.io/js/%40beam-australia%2Freact-env)
[![Coverage Status](https://coveralls.io/repos/github/beam-australia/react-env/badge.svg?branch=2.0.2)](https://coveralls.io/github/beam-australia/react-env?branch=2.0.2)

Allows your react app's environment variables to be populated at **run-time** rather then **build-time**. Works with client and server rendered frameworks.

* Example using [Create React APP](examples/create-react-app/README.md) (see README.md)

* Example using [Next.js](examples/next.js/README.md) (see README.md)

### Overview

This package generates a `env.js` file that contains white-listed environment variables that have a `REACT_APP_` preposition, as per the [CRA documentation](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).

In the browser your variables will be available at `window._env.REACT_APP_FOO` and on the server `process.env.REACT_APP_FOO`. We have included a helper function to make retrieving a value easier:

```bash
# .env
REACT_APP_CRA="Create React App"
REACT_APP_NEXT="Next.js"
REACT_APP_NOT_SECRET_CODE="1234"
```

becomes...

```jsx
import env from "@beam-australia/react-env";

export default props => (
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
  </div>
);
```

### Runtime environment variables

The `env.js` environment configuration file is generated as the container boots. Therefore it will contain whitelisted env vars that are present at _container start_, any new environment variables needs a container restart. This is normal Docker behaviour.

### .env file order of priority

We have replicated the order of priority as per the [CRA documentation](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables#what-other-env-files-can-be-used).

e.g. `.env.development.local, .env.development, .env.local, .env`

### Arguments and parameters


```bash
$ react-env <command with arguments> --env /path/to/.env.foo --env /path/to/.env.bar --dest /path/to/build
```

This will generate a `env.js` file in the dest directory `/path/to/build` and then run the command. The command will have all the environment variable available in `process.env`, great for server side rending and other use-cases.

* `<command>` 

You may pass a command, such as a nodejs entry file to the `react-env` cli tool. The command will have all the environment variable available in `process.env`, great for server side rending and other use-cases.

* `--env` **(default: null)**

Read in another `.env` file for populating `env.js`. You may include multiple env files.

* `--dest` **(default: ./public)**

Change the default destination for generating the `env.js` file
