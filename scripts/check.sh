#!/usr/bin/env bash
# The one check agents and CI run before calling a change done.
# Runs in Docker on a throwaway copy of the tree, so host node_modules stay untouched.
set -euo pipefail
cd "$(dirname "$0")/.."

MSYS_NO_PATHCONV=1 docker run --rm -v "$(pwd -W 2>/dev/null || pwd):/src:ro" node:22-bookworm bash -ec '
  mkdir /work
  tar -C /src --exclude=node_modules --exclude=.next --exclude=.turbo --exclude=.git -cf - . | tar -C /work -xf -
  cd /work
  corepack enable
  pnpm install --frozen-lockfile
  pnpm typecheck
  pnpm lint
  pnpm test
'
