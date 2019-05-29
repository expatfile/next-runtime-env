#!/bin/sh

set -e

echo "Compiling binaries"

./build.sh "darwin" "amd64"

./build.sh "linux" "amd64"
