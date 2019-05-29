#!/bin/bash

set -e

docker build -t react-env:builder .

docker run -it --rm \
	-v "$PWD/bin":/go/src/bin \
	-v "$PWD/../nginx/bin":/go/src/bin \
	-v "$PWD/../node/dist/bin":/go/src/bin \
	react-env:builder

