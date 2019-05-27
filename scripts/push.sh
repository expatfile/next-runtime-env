#!/bin/bash

set -e

docker login -u=$DOCKER_USERNAME -p=$DOCKER_PASSWORD

docker tag beamaustralia/create-react-env beamaustralia/php:$TRAVIS_TAG

docker push beamaustralia/create-react-env:$TRAVIS_TAG
