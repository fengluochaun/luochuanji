#!/usr/bin/env bash
# Manual deploy fallback for blog.luochuanji.com.
#
# The normal path is GitHub Actions (.github/workflows/deploy.yml, on push
# to main). Use this script when CI is unavailable. It builds locally and
# rsyncs dist/ to the server through a local SSH alias.
#
# Usage:
#   ./scripts/deploy.sh
#   DEPLOY_TARGET=other-alias DEPLOY_PATH=/var/www/other ./scripts/deploy.sh
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

DEPLOY_TARGET="${DEPLOY_TARGET:-MySAServer}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/blog.luochuanji.com}"
SITE_HOST="blog.luochuanji.com"
SITE_IP="13.251.118.133"

echo "==> Building"
pnpm run build

echo "==> Syncing dist/ to ${DEPLOY_TARGET}:${DEPLOY_PATH}/"
rsync -az --delete -e "ssh" dist/ "${DEPLOY_TARGET}:${DEPLOY_PATH}/"

# Local DNS may be polluted by proxies, so pin the IP with --resolve.
echo "==> Verifying https://${SITE_HOST}/"
status="$(curl -sS -o /dev/null -w '%{http_code}' \
  --resolve "${SITE_HOST}:443:${SITE_IP}" "https://${SITE_HOST}/")"
echo "HTTP ${status}"
if [ "${status}" != "200" ]; then
  echo "Deploy verification failed: expected HTTP 200, got ${status}" >&2
  exit 1
fi
echo "==> Deploy complete"
