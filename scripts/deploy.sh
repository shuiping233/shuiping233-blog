#!/bin/bash

set -xeuo pipefail

TEMP_DIR="/tmp/shuiping233-blog/dist"
BACKUP_DIR="/var/www/html/shuiping233-blog.bak"
TARGET_DIR="/var/www/html/shuiping233-blog"

if [[ -d "$BACKUP_DIR" ]]; then
  rm -rf "$BACKUP_DIR"
fi

if [[ -d "$TARGET_DIR" ]]; then
  mv "$TARGET_DIR" "$BACKUP_DIR"
fi

if [[ ! -d "$TEMP_DIR" ]]; then
  echo "Error: $TEMP_DIR not found"
  exit 1
fi

mv "$TEMP_DIR" "$TARGET_DIR"

systemctl reload nginx

echo "Deploy success at $(date)"