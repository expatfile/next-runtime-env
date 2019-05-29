#!/bin/sh

set -e

echo "Serializing whitelist environment:"

react-env

cat env.js

exec "$@"
