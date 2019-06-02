# React Env - Runtime Environment Configuration
Allows CRA environment variables to be populated at run-time rather then build-time and run as static js.

* *User Guide*
  * [Overview](#overview)
  * [Development server](#development)
  * [Deploying with Docker](#deploying)
* *Technical Guide*
  * [Runtime environment variables](#runtime-environment-variables)
  * [.env file order of priority](#.env-file-order-of-priority)
  * [arguments](#arguments)

## User Guide

#### Overview

This package generates a `env.js` file that contains white-listed environment variables as per the [CRA documentation](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).

Place the following in the head of the `public/index.html` file:

```html
<script src="%PUBLIC_URL%/env.js"></script>
```

Rather then using `process.env.REACT_APP_FOO` you use `window._env.FOO`. As per CRA only env vars following the `REACT_APP_` format will be present, although without the `REACT_APP_` preposition as this package removes it.

```bash
# .env
REACT_APP_FOO="Create React APP"
REACT_APP_NOT_SECRET_CODE="1234"
```
becomes...
```jsx
render() {
  return (
    <div>
      <small>Did you know that... <b>{window._env.FOO}</b> is great!.</small>
      <form>
        <input type="hidden" defaultValue={window._env.NOT_SECRET_CODE} />
      </form>
    </div>
  );
}
````

#### Development

To use this package during development you only need to install the npm package `@beam-australia/react-env`

```bash
yarn add @beam-australia/react-env --dev
## Or
npm install @beam-australia/react-env --save-dev
```

Change your `package.json` scripts file to have a "prestart" key:

```javascript
{
  // ...
  "scripts": {
    // ...
    "prestart": "react-env",
    "start": "react-scripts start", // remains the same
  },
  // ...
}
```

You may now use CRA as normal: 

```bash
yarn start
## Or
npm run start
```

If you have another `.env` file you would like to read you can use the `--env` argument:


```javascript
{
  // ...
  "scripts": {
    // ...
    "prestart": "react-env --env /path/to/.env.custom",
  },
}
```

#### Deploying

We have build a docker image that builds your `env.js` config when the container starts. As a convenience this is based off the Alpine Linux - Nginx image and contains a best practices `nginx.conf` file for serving you CRA site. Simple!

Create a `Dockerfile` in the root of your CRA project

```dockerfile
# Build the app
FROM node:10-alpine AS build

WORKDIR /var/app

COPY package.json /var/app

COPY yarn.lock /var/app

RUN yarn install

ADD . .

RUN yarn build

# Create deployable image
FROM beamaustralia/react-env:1.0.0

WORKDIR /var/www

COPY --from=build /var/app/build /var/www

COPY .env* /var/www/
```

Build your app:

`docker build -t my-app .`

Run your app:

`docker run -d -p 8080:80 my-app`

Then you can hit http://localhost:8080 or http://host-ip:8080 in your browser.

## Technical Guide

#### Runtime environment variables

The `env.js` environment configuration file is generated as the container boots. Therefore it will contain whitelisted env vars that are present at *container start*, any new environment variables needs a container restart. This is normal Docker behaviour. 


#### .env file order of priority

We have replicated the order of priority as per the [CRA documentation](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables#what-other-env-files-can-be-used).

e.g. `.env.development.local, .env.development, .env.local, .env`

#### Arguments and parameters


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
