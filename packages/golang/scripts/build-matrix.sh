#!/bin/sh

set -e

echo "Compiling binaries"

./build.sh "darwin" "amd64"
./build.sh "darwin" "386"

./build.sh "linux" "amd64"
./build.sh "linux" "386"
