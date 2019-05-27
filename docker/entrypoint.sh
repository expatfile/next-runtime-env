#!/bin/sh

set -e

echo "Serializing whitelist environment:"

create-react-env

cat env.json

exec "$@"
