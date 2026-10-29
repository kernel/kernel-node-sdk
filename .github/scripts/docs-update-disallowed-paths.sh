#!/usr/bin/env bash
# Reads NUL-delimited docs paths on stdin and prints, NUL-delimited,
# the ones the docs updater must not publish.
set -euo pipefail

while IFS= read -r -d '' path; do
  case "$path" in
    .* | changelog.mdx | reference/cli.mdx | reference/cli/* | reference/mcp-server.mdx | reference/mcp-server/*) ;;
    docs.json | *.mdx) continue ;;
  esac
  printf '%s\0' "$path"
done
