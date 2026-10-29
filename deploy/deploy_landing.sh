#!/bin/bash
# Landing deploy (K3 L9), modelled on the console's: vite build -> unpack on the server -> IN-PLACE sync into
# ~/algo/landing/{prod,stage} (bind-mounted into nginx) -> check the release marker.
#
#   deploy/deploy_landing.sh stage|prod [--dry-run]
#
# Env:  DEPLOY_HOST     default algo@91.99.183.252
#       CHECK_URL       page to read the marker from (default: prod https://algolab.me/, stage https://landing.stage.algolab.me/)
#       CHECK_USER      user:password for the stage zone if it is behind basic auth (passed to curl -u, never printed)
#       SKIP_HTTP_CHECK=1   only check the file on the server (nginx does not serve this folder yet)
#       ALLOW_NO_TURNSTILE=1  build without a Turnstile site key (refused otherwise)
# Not run by anyone but the lead: no step here asks for confirmation.
set -euo pipefail

MODE=${1:-}
DRY=0; [ "${2:-}" = "--dry-run" ] && DRY=1
case "$MODE" in
  prod) DEFAULT_CHECK=https://algolab.me/ ;;
  stage) DEFAULT_CHECK=https://landing.stage.algolab.me/ ;;
  *) echo "usage: $0 stage|prod [--dry-run]" >&2; exit 2 ;;
esac
HOST=${DEPLOY_HOST:-algo@91.99.183.252}
CHECK_URL=${CHECK_URL:-$DEFAULT_CHECK}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

# --- what is being deployed ---
[ -z "$(git status --porcelain --untracked-files=no)" ] || { echo "FAIL: uncommitted changes: the release marker would not match a commit" >&2; exit 1; }
SHA=$(git rev-parse HEAD)
ENV_FILE=".env.$MODE"
[ -f "$ENV_FILE" ] || { echo "FAIL: $ENV_FILE is missing" >&2; exit 1; }
APP_URL=$(grep -E '^VITE_APP_URL=' "$ENV_FILE" | cut -d= -f2- | tr -d '[:space:]')
TS_KEY=$(grep -E '^VITE_TURNSTILE_SITE_KEY=' "$ENV_FILE" | cut -d= -f2- | tr -d '[:space:]')
[ -n "$APP_URL" ] || { echo "FAIL: VITE_APP_URL is empty in $ENV_FILE" >&2; exit 1; }
if [ -z "$TS_KEY" ] && [ "${ALLOW_NO_TURNSTILE:-}" != "1" ]; then
  echo "FAIL: VITE_TURNSTILE_SITE_KEY is empty in $ENV_FILE (the server rejects a form without a token when it holds the secret). ALLOW_NO_TURNSTILE=1 to build without." >&2; exit 1
fi
echo "== target $MODE | sha ${SHA:0:12} | «Войти» -> $APP_URL/login | turnstile key: $([ -n "$TS_KEY" ] && echo yes || echo NO) | host $HOST"

# --- build ---
[ -x node_modules/.bin/vite ] || { echo "FAIL: node_modules/.bin/vite is missing (do not run npm ci here without a look; see LESSONS 50)" >&2; exit 1; }
rm -rf dist/public
node_modules/.bin/vite build --mode "$MODE"
OUT=dist/public

# --- check the build before it leaves this machine ---
grep -q "name=\"release\" content=\"$SHA\"" "$OUT/index.html" || { echo "FAIL: release marker in index.html is not $SHA" >&2; exit 1; }
grep -qF "$APP_URL/login" "$OUT/index.html" && grep -rqF "$APP_URL" "$OUT/assets" || { echo "FAIL: $APP_URL not found in the build («Войти»)" >&2; exit 1; }
for other in https://app.algolab.me https://stage.algolab.me; do
  [ "$other" = "$APP_URL" ] && continue
  if grep -rqF "$other" "$OUT/index.html" "$OUT/assets"; then echo "FAIL: build contains the other environment's address $other" >&2; exit 1; fi
done
grep -rqE 'localhost|/api/contact' "$OUT/assets" "$OUT/index.html" && { echo "FAIL: localhost or /api/contact left in the build" >&2; exit 1; }
[ -f "$OUT/sitemap.xml" ] && [ -f "$OUT/robots.txt" ] || { echo "FAIL: sitemap.xml / robots.txt missing" >&2; exit 1; }
node -e '
const fs=require("fs"),c=require("crypto");const html=fs.readFileSync(process.argv[1],"utf8");
for(const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) if(m[1].trim()) console.log("   CSP script-src hash for the inline block: sha256-"+c.createHash("sha256").update(m[1]).digest("base64"));
' "$OUT/index.html"
printf '%s\n' "$SHA" > "$OUT/.revision"
echo "== build ok ($(find "$OUT" -type f | wc -l | tr -d ' ') files, $(du -sh "$OUT" | cut -f1))"
if [ "$DRY" = 1 ]; then echo "== dry run: nothing uploaded"; exit 0; fi

# --- upload + in-place sync on the server ---
REMOTE_TMP=".landing-upload-$MODE-$$"
COPYFILE_DISABLE=1 tar -C "$OUT" -czf - . | ssh "$HOST" "set -e; rm -rf \"\$HOME/$REMOTE_TMP\"; mkdir -p \"\$HOME/$REMOTE_TMP\" \"\$HOME/algo/landing/$MODE\"; tar -xzf - -C \"\$HOME/$REMOTE_TMP\""
ssh "$HOST" "bash -s -- \"\$HOME/$REMOTE_TMP\" \"\$HOME/algo/landing/$MODE\"" < deploy/apply_on_server.sh
ssh "$HOST" "rm -rf \"\$HOME/$REMOTE_TMP\""

# --- marker check: the file on the server, then what nginx serves ---
REMOTE_SHA=$(ssh "$HOST" "grep -o 'name=\"release\" content=\"[^\"]*\"' \"\$HOME/algo/landing/$MODE/index.html\" | sed 's/.*content=\"//; s/\"\$//'")
[ "$REMOTE_SHA" = "$SHA" ] || { echo "FAIL: server file has marker '$REMOTE_SHA', expected $SHA" >&2; exit 1; }
echo "== server folder ~/algo/landing/$MODE has release $SHA"
if [ "${SKIP_HTTP_CHECK:-}" = "1" ]; then echo "== http check skipped"; exit 0; fi
AUTH=(); [ -n "${CHECK_USER:-}" ] && AUTH=(-u "$CHECK_USER")
for try in 1 2 3 4 5; do
  LIVE=$(curl -fsS ${AUTH[@]+"${AUTH[@]}"} -H 'Cache-Control: no-cache' "$CHECK_URL" 2>/dev/null | grep -o 'name="release" content="[^"]*"' | sed 's/.*content="//; s/"$//' || true)
  [ "$LIVE" = "$SHA" ] && { echo "== $CHECK_URL serves release $SHA"; exit 0; }
  sleep 3
done
echo "FAIL: $CHECK_URL serves release '${LIVE:-nothing}', expected $SHA (nginx not pointing at this folder yet? use SKIP_HTTP_CHECK=1)" >&2
exit 1
