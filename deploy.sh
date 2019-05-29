#!/bin/bash

set -e

LATEST_TAG=beamaustralia/create-react:latest
VERSION_TAG=beamaustralia/create-react:$TRAVIS_TAG

# publish nginx image
cd packages/nginx
docker push $LATEST_TAG
docker push $VERSION_TAG

# publish npm package
cd ../node
npm install -g npm-cli-login
npm-cli-login
npm version $TRAVIS_TAG --allow-same-version
npm publish --access public  
