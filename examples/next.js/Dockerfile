FROM node:10-alpine AS build

WORKDIR /var/app

COPY package.json /var/app

COPY yarn.lock /var/app

ENV NODE_ENV=production

RUN yarn install

ADD . .

RUN yarn build

CMD ["yarn", "start"]
