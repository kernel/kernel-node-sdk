#!/usr/bin/env bash
# Reads NUL-delimited kernel-mcp-server paths on stdin and prints, NUL-delimited,
# the ones the MCP coverage updater must not publish.
set -euo pipefail

while IFS= read -r -d '' path; do
  case "$path" in
    src/lib/mcp/apps/generated/*) ;;
    package.json | bun.lock | src/*.ts | src/*.tsx) continue ;;
  esac
  printf '%s\0' "$path"
done
