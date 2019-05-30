#!/bin/sh

set -e

echo "Serializing whitelist environment:"

./node_modules/.bin/react-env --dest .

cat env.js

exec "$@"
