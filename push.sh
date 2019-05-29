#!/bin/bash

set -e

docker login -u=$DOCKER_USERNAME -p=$DOCKER_PASSWORD

docker tag beamaustralia/create-react beamaustralia/create-react:$TRAVIS_TAG

docker tag beamaustralia/create-react beamaustralia/create-react:latest

docker push beamaustralia/create-react:$TRAVIS_TAG

docker push beamaustralia/create-react:latest
