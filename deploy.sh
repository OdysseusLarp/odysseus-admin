#!/usr/bin/env bash

set -euo pipefail

DEPLOY_PATH="/var/www/odysseus/adminui/"
SOURCE_PATH="dist/"

npm run build

rsync -avzr --delete "$SOURCE_PATH" "$DEPLOY_PATH"
echo "Deployed to $DEPLOY_PATH"
