## CRA - Runtime environment variables

# NOTE: Dev-server support coming soon.

#### Create React Env

This repository builds a Docker image that generates a `env.js` file from your environment variables as per the [CRA docs](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables#adding-development-environment-variables-in-env). 

Docker repo: `beamaustralia/create-react-env`

The image is based off the official Nginx alpine distro and includes a best-practices default `nginx.conf` file to serve a CRA application.

## How does this work?

The Docker image contains a small Golang binary that builds the `env.js` file. The binary is run within the ENTRYPOINT script of the Docker image, therefore env variables are read when the container is started. 

## How do I use this?

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

Place the following in the head of the `public/index.html` file:

```html
<script src="%PUBLIC_URL%/env.js"></script>
```

Build your app:

`docker build -t my-app .`

Run your app:

`docker run -d -p 8080:80 my-app`

Then you can hit http://localhost:8080 or http://host-ip:8080 in your browser.

Access your white-listed env variables:

```jsx
render() {
  return (
    <div>
      <small>Did you know that... <b>{window._env.MY_VARIABLE}</b> is great!.</small>
      <form>
        <input type="hidden" defaultValue={window._env.NOT_SECRET_CODE} />
      </form>
    </div>
  );
}
````

## Runtime environment variables

The `env.js` environment configuration file is generated as the container boots. Therefore it will contain whitelisted env vars that are present at *container start*, any new environment variables needs a container restart. This is normal Docker behaviour. 
