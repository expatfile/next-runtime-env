#!/bin/sh

set -e

echo "Serializing whitelist environment:"

./node_modules/.bin/react-env

cat env.js

exec "$@"
