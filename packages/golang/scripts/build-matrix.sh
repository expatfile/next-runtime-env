#!/bin/sh

set -e

##############################################################
echo "Compiling 'darwin' binaries"

./build.sh "darwin" "amd64"
./build.sh "darwin" "386"
./build.sh "darwin" "arm"
./build.sh "darwin" "arm64"

##############################################################
echo "Compiling 'linux' binaries"

./build.sh "linux" "amd64"
./build.sh "linux" "386"
./build.sh "linux" "arm"
./build.sh "linux" "arm64"
