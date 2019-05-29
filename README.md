## How does this work?

Allows CRA environment variables to be populated at run-time rather then build-time.

## How do I use this?

This package generates a `env.js` file that contains all your white-listed environment variables, you need to include this file.

Place the following in the head of the `public/index.html` file:

```html
<script src="%PUBLIC_URL%/env.js"></script>
```

Rathern then using `process.env.REACT_APP_FOO` you use `window._env.FOO`. As per CRA only env vars following the `REACT_APP_` format will be present, although without this prepesition:

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

#### Runtime environment variables

The `env.js` environment configuration file is generated as the container boots. Therefore it will contain whitelisted env vars that are present at *container start*, any new environment variables needs a container restart. This is normal Docker behaviour. 
