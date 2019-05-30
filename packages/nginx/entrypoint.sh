#!/bin/sh

set -e

echo "Serializing whitelist environment:"

react-env --dest .

cat env.js

exec "$@"
