#!/usr/bin/env sh
set -eu

# AWS_BUCKET overrides the default below. The starter ships it as an
# ARN, and `aws s3 sync` needs a bare name -- an ARN here fails in a way
# that reads like a credentials problem. Refuse it rather than pass it on.
case "${AWS_BUCKET:-}" in
  arn:*) echo "deploy: AWS_BUCKET is an ARN; it must be the bare bucket name." >&2; exit 1 ;;
esac
# Refuse to sync something that is not a build. --delete makes the bucket
# match ./www, so an empty or half-built www would delete the live site.
if [ ! -f ./www/index.html ] || ! ls ./www/main*.js >/dev/null 2>&1; then
  echo "deploy: ./www does not look like a build (no index.html, or no main bundle)." >&2
  echo "deploy: refusing to sync --delete over the live site. Run the build first." >&2
  exit 1
fi
aws s3 sync --delete ./www s3://${AWS_BUCKET:-udagram-site-965672055380}/
aws s3 cp --cache-control="max-age=0, no-cache, no-store, must-revalidate" ./www/index.html s3://${AWS_BUCKET:-udagram-site-965672055380}/