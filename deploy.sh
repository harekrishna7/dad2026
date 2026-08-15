#!/usr/bin/env bash
# ============================================================
# DADsync v14 — one-command deploy to GitHub Pages
# Repo: harekrishna7/dad2026  (branch: main, root folder)
# Live: https://www.dadsync.in
#
# WHAT THIS FIXES
#   main currently serves STUB files (assets/styles.css = "TODO_CSS",
#   assets/app.js = "TODO_APPJS", 8-byte 404.html, older index.html),
#   so the live site is unstyled/broken. This script replaces every
#   site file with the REAL v14 production build and pushes, which
#   triggers the existing Pages workflow to redeploy in ~1 minute.
#
# USAGE
#   chmod +x deploy.sh && ./deploy.sh
#   (run from THIS folder: documents/dadsync-ghpages-deploy-v14)
# ============================================================
set -euo pipefail

REPO_URL="https://github.com/harekrishna7/dad2026.git"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "==> [1/4] Cloning harekrishna7/dad2026 (main)..."
git clone --depth 1 --branch main "$REPO_URL" "$WORK/repo"

echo "==> [2/4] Replacing site files with the REAL v14 build..."
# Copy everything from this folder into the repo root (overwrites stubs).
# Uses rsync --delete so any stale/stub-only files vanish too.
rsync -a --delete \
  --exclude=".git" \
  --exclude="deploy.sh" \
  "$(pwd)/" "$WORK/repo/"

echo "==> [3/4] Committing..."
cd "$WORK/repo"
git add -A
git -c user.name="DADsync Deploy" \
    -c user.email="deploy@dadsync.in" \
    commit -m "DADsync v14: deploy REAL production build (fixes TODO_CSS/TODO_APPJS stubs on main)"

echo "==> [4/4] Pushing to main (triggers Pages workflow)..."
git push origin main

echo
echo "✅ Done. GitHub Actions is now rebuilding the site."
echo "   Watch: https://github.com/harekrishna7/dad2026/actions"
echo "   Verify in ~1 min:"
echo "     curl -s https://www.dadsync.in/assets/styles.css | wc -c   # expect 39102"
echo "     curl -s https://www.dadsync.in/assets/app.js    | wc -c   # expect  9592"
echo "     curl -s -o /dev/null -w '%{http_code}\n' https://www.dadsync.in/connection.html  # 200"
