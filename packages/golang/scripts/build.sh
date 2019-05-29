#!/bin/sh

set -e

GOOS=$1
GOARCH=$2
echo "- $GOARCH"
go build -o $PWD/bin/react-env_$GOOS-$GOARCH
