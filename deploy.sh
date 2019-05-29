#!/bin/bash

set -e

# publish nginx image
cd packages/nginx
docker login -u=$DOCKER_USERNAME -p=$DOCKER_PASSWORD
docker build -t beamaustralia/react-env:$TRAVIS_TAG -t beamaustralia/react-env:latest .  
docker push beamaustralia/react-env:latest
docker push beamaustralia/react-env:$TRAVIS_TAG

# publish npm package
cd ../node
npm install -g npm-cli-login
npm-cli-login
npm version $TRAVIS_TAG --allow-same-version
npm publish --access public  
