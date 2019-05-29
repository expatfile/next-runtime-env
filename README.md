
Allows CRA environment variables to be populated at run-time rather then build-time.

## User Guide

This package generates a `env.js` file that contains white-listed environment variables as per the [CRA documentation](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).

Place the following in the head of the `public/index.html` file:

```html
<script src="%PUBLIC_URL%/env.js"></script>
```

Rather then using `process.env.REACT_APP_FOO` you use `window._env.FOO`. As per CRA only env vars following the `REACT_APP_` format will be present, although without the `REACT_APP_FOO` preposition as this package removes any missing this.

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

To use this package during development you need to install the npm package `@beam-australia/react-env`

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

#### Deploying

We have build a docker image that builds your `env.js` config when the container starts. As a convenience this is based off the Alpine Linux - Nginx image and contains a best practices `nginx.conf` file for serving you CRA site. Simple!

Create a `Dockerfile` in the root of your CRA project

```dockerfile
# Build the app
FROM node:8-alpine AS build

WORKDIR /var/app

COPY package.json /var/app

COPY yarn.lock /var/app

RUN yarn install

ADD . .

RUN yarn build

# Create deployable image
FROM beamaustralia/create-react-env:1.0.0

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

This library uses a small Golang binary that is responsible for generating the `env.js` environment file. We do this for tow reasons. 

1. A discreet binary enables us build the env config while booting an Nginx docker container without installing npm, nodejs and a host of packages. The resulting Nginx Alpine Docker container comes in at under 10Mb.

2. Golang is very fast and very reliable. Its a system language and is more suitable for this type of application.

#### Runtime environment variables

The `env.js` environment configuration file is generated as the container boots. Therefore it will contain whitelisted env vars that are present at *container start*, any new environment variables needs a container restart. This is normal Docker behaviour. 


#### .env file order of priority

We have replicated the order of priority as per the [CRA documentation](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables#what-other-env-files-can-be-used).

e.g. `.env.development.local, .env.development, .env.local, .env`


