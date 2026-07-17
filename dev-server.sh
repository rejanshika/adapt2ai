#!/bin/bash
# Wrapper so the preview server can find the locally-installed Node toolchain.
export PATH="$HOME/.local/node/node-v22.12.0-darwin-arm64/bin:$PATH"
cd "$(dirname "$0")"
exec npm run dev -- --port 3005
