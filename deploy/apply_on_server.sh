#!/bin/bash
# Runs ON THE SERVER (shipped by deploy_landing.sh): puts an unpacked build into the live landing folder IN PLACE.
#   apply_on_server.sh <unpacked-build-dir> <live-dir>
# The live folder is bind-mounted into nginx: it is never renamed or recreated, only its files change (a renamed folder
# leaves nginx on the old deleted inode and answers 404 until a restart).
# /assets/ (hashed names) is NOT synced with --delete: the previous build's files stay for one more build, so a tab that is open
# on the old page still finds its chunks (K3 L9, АД-10/23).  Everything else is synced with --delete, index.html last.
set -euo pipefail
SRC=${1:?build dir}
DST=${2:?live dir}
[ -f "$SRC/index.html" ] || { echo "no index.html in $SRC" >&2; exit 1; }
mkdir -p "$DST/assets"

# 1. new assets first: no page of the new build can point to a file that is not there yet
( cd "$SRC/assets" && find . -type f | sed 's|^\./||' | LC_ALL=C sort ) > "$SRC/.assets-new"
rsync -a "$SRC/assets/" "$DST/assets/"

# 2. drop assets that belong to neither this build nor the previous one
if [ -f "$DST/.assets-manifest" ]; then
  LC_ALL=C sort -u "$SRC/.assets-new" "$DST/.assets-manifest" > "$SRC/.assets-keep"
else
  # first deploy with this script: nothing is known about the previous build, so nothing is deleted this time
  ( cd "$DST/assets" && find . -type f | sed 's|^\./||' | LC_ALL=C sort ) > "$SRC/.assets-keep"
fi
( cd "$DST/assets" && find . -type f | sed 's|^\./||' | LC_ALL=C sort ) > "$SRC/.assets-have"
LC_ALL=C comm -23 "$SRC/.assets-have" "$SRC/.assets-keep" | while IFS= read -r f; do rm -f -- "$DST/assets/$f"; done
find "$DST/assets" -mindepth 1 -type d -empty -delete 2>/dev/null || true
cp "$SRC/.assets-new" "$DST/.assets-manifest"

# 3. the rest, without index.html and assets; --delete removes files that left the build (e.g. old samples)
rsync -a -c --delete --exclude='/assets/' --exclude='/index.html' --exclude='/.assets-*' "$SRC/" "$DST/"
# 4. index.html last
cp "$SRC/index.html" "$DST/index.html.tmp" && mv "$DST/index.html.tmp" "$DST/index.html"
echo "applied: $(find "$DST/assets" -type f | wc -l | tr -d ' ') asset files kept ($(wc -l < "$SRC/.assets-new" | tr -d ' ') new), revision $(cat "$DST/.revision" 2>/dev/null || echo '?')"
