## Create React Env
##### Runtime environment variables

This repository builds a Docker image that generates a `env.js` file from your environment variables as per the [CRA docs](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables#adding-development-environment-variables-in-env). 

Docker repo: `beamaustralia/create-react-env`

The image is based off the official Nginx alpine distro and includes a best-practices default `nginx.conf` file to servce a CRA application.

## How does this work?

The Docker image contains a small Golang binary that builds the `env.json` file. The binary is run within the ENTRYPOINT script of the Docker image, therefore env variables are read when the container is started. 

## How do I use this?

Create a `Dockerfile` in the root of your CRA project

```dockerfile
# Build the app
FROM node:8-alpine AS build

WORKDIR /var/app

COPY package.json /var/app

COPY yarn.lock /var/app

RUN yarn install

RUN yarn build

# Create an image

FROM beamaustralia/create-react-env:1.0.0

WORKDIR /var/www

COPY . /var/www

COPY --from=install /var/app/build /var/www
```

Place the following in the head of the `public/index.html` file:

```html
<script src="%PUBLIC_URL%/env.js"></script>
```

Build your app:

`docker build -t my-app .`

Run your app:

`docker run -p 127.0.0.1:80:80/tcp my-app`

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

