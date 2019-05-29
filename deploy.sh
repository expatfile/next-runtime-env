#!/bin/bash

set -e

cd packages/nginx
docker push beamaustralia/create-react:$TRAVIS_TAG
docker push beamaustralia/create-react:latest 
cd ../node
npm install -g npm-cli-login
npm-cli-login
npm version $TRAVIS_TAG --allow-same-version
npm publish --access public  
