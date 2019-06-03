# Build the app
FROM node:10-alpine AS build

WORKDIR /var/app

COPY package.json /var/app

COPY yarn.lock /var/app

RUN yarn install

ADD . .

RUN yarn build

# Create deployable image
FROM beamaustralia/react-env:latest

WORKDIR /var/www

COPY --from=build /var/app/build /var/www

COPY .env* /var/www/