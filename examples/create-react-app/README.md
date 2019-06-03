### Create React App

This folder contains an example app using Create React App. First place the following in the head of the `public/index.html` file:

```html
<script src="%PUBLIC_URL%/env.js"></script>
```

Install the package:

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

#### Deploying in production

To run CRA in production We have built a docker image that automatically populates `env.js` when the container starts. As a convenience this is based off the Alpine Linux - Nginx image and contains a best practices `nginx.conf` file for serving you CRA site. Simple!

Create a `Dockerfile` in the root of your CRA project:

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