#!/bin/bash

set -e

printenv

REPO=beamaustralia/create-react
LATEST=$REPO:latest
VERSION=$REPO:$TRAVIS_TAG

# publish nginx image
cd packages/nginx
docker push $LATEST
docker push $VERSION

# publish npm package
cd ../node
npm install -g npm-cli-login
npm-cli-login
npm version $TRAVIS_TAG --allow-same-version
npm publish --access public  
