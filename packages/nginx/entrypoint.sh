#!/bin/sh

set -e

echo "Serializing environment:"

react-env --dest .

cat env.js

exec "$@"
