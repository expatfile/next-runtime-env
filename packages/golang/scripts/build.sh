#!/bin/sh

set -e

echo "- $1 $2"
env GOOS=$1 GOARCH=$2 go build -o $PWD/bin/react-env_$1-$2
chmod +x $PWD/bin/react-env_$1-$2
