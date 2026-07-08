#!/usr/bin/env bash
# Render.com build script for Zen Platform
# See: https://render.com/docs/deploy-rails-app

set -o errexit
set -o pipefail
set -o nounset

echo "==> Installing dependencies..."
bundle install
npm install --legacy-peer-deps

echo "==> Preparing database..."
bin/rails db:prepare

echo "==> Precompiling assets..."
bin/rails assets:precompile
bin/rails assets:clean

echo "==> Build complete!"
