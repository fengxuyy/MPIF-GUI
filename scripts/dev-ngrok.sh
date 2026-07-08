#!/usr/bin/env bash
# ============================================================
# dev-ngrok.sh — Start MPIF-GUI frontend + backend with an ngrok HTTPS tunnel
#
# Usage:
#   ./dev-ngrok.sh
#   ./dev-ngrok.sh --domain my-lab.ngrok-free.app   (override .env.local)
#
# All config is read from .env.local:
#   NGROK_AUTHTOKEN   — tunnel auth token (https://dashboard.ngrok.com/get-started/your-authtoken)
#   NGROK_DOMAIN      — static domain, e.g. xyz.ngrok-free.app  (leave empty for random URL)
#   NGROK_API_KEY     — Management API key (https://dashboard.ngrok.com/api-keys)
#                       Required to auto-delete stale cloud endpoints (ERR_NGROK_334)
# ============================================================

set -euo pipefail

VITE_PORT=5173
API_PORT=8000
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"   # project root (one level up from scripts/)
ENV_FILE="$SCRIPT_DIR/.env.local"
API_LOG="/tmp/mpif-api.log"
VITE_LOG="/tmp/mpif-vite.log"
NGROK_LOG="/tmp/mpif-ngrok.log"

# ---- Colour helpers ----
GREEN="\033[0;32m"; YELLOW="\033[1;33m"; RED="\033[0;31m"; RESET="\033[0m"; BOLD="\033[1m"
info()  { echo -e "${GREEN}  ▶  ${RESET}$*"; }
warn()  { echo -e "${YELLOW}  ⚠  ${RESET}$*"; }
error() { echo -e "${RED}  ✗  ${RESET}$*" >&2; }
ok()    { echo -e "${GREEN}  ✓  ${RESET}$*"; }

# ---- Load a value from .env.local ----
load_env() {
  local key="$1"
  if [[ -f "$ENV_FILE" ]]; then
    grep -E "^${key}=" "$ENV_FILE" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'"
  fi
}

# ---- Parse CLI args ----
CLI_DOMAIN=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) CLI_DOMAIN="$2"; shift 2 ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
done

# ---- Resolve config (CLI > .env.local) ----
NGROK_TOKEN="$(load_env NGROK_AUTHTOKEN)"
NGROK_API_KEY="$(load_env NGROK_API_KEY)"
RAW_DOMAIN="${CLI_DOMAIN:-$(load_env NGROK_DOMAIN)}"
# Strip any accidental https:// or http:// prefix
STATIC_DOMAIN="$(echo "$RAW_DOMAIN" | sed 's|^https\?://||')"

# ============================================================
# 1. INSTALL NGROK if missing
# ============================================================
if ! command -v ngrok &>/dev/null; then
  info "ngrok not found — installing via Homebrew..."
  if ! command -v brew &>/dev/null; then
    error "Homebrew is not installed. Install it first: https://brew.sh"
    exit 1
  fi
  brew install ngrok/ngrok/ngrok
  ok "ngrok installed"
fi
ok "ngrok $(ngrok version 2>/dev/null | head -1 | awk '{print $3}')"

# ============================================================
# 2. CONFIGURE AUTH TOKEN if needed
# ============================================================
NGROK_CONFIG_FILE="$HOME/Library/Application Support/ngrok/ngrok.yml"
[[ ! -f "$NGROK_CONFIG_FILE" ]] && NGROK_CONFIG_FILE="$HOME/.config/ngrok/ngrok.yml"
[[ ! -f "$NGROK_CONFIG_FILE" ]] && NGROK_CONFIG_FILE="$HOME/.ngrok2/ngrok.yml"

TOKEN_CONFIGURED=false
if [[ -f "$NGROK_CONFIG_FILE" ]] && grep -q "authtoken" "$NGROK_CONFIG_FILE" 2>/dev/null; then
  TOKEN_CONFIGURED=true
fi

if [[ "$TOKEN_CONFIGURED" == false ]]; then
  if [[ -n "$NGROK_TOKEN" ]]; then
    info "Configuring ngrok auth token from .env.local..."
    ngrok config add-authtoken "$NGROK_TOKEN"
    ok "ngrok auth token configured"
  else
    warn "ngrok auth token is not configured."
    echo ""
    echo    "  1. Sign up free at https://ngrok.com"
    echo    "  2. Copy your token from https://dashboard.ngrok.com/get-started/your-authtoken"
    echo    "  3. Paste it into .env.local:  NGROK_AUTHTOKEN=your_token_here"
    echo    ""
    echo -n "  Or paste your auth token now and press Enter: "
    read -r INLINE_TOKEN
    if [[ -n "$INLINE_TOKEN" ]]; then
      ngrok config add-authtoken "$INLINE_TOKEN"
      sed -i.bak "s|^NGROK_AUTHTOKEN=.*|NGROK_AUTHTOKEN=${INLINE_TOKEN}|" "$ENV_FILE"
      rm -f "${ENV_FILE}.bak"
      ok "ngrok auth token configured and saved to .env.local"
    else
      error "No auth token provided. Cannot start ngrok."
      exit 1
    fi
  fi
else
  # Always re-apply token from .env.local so switching accounts works correctly
  if [[ -n "$NGROK_TOKEN" ]]; then
    info "Configuring ngrok auth token from .env.local..."
    ngrok config add-authtoken "$NGROK_TOKEN" 2>/dev/null
    ok "ngrok auth token configured"
  else
    ok "ngrok auth token already configured"
  fi
fi

# ============================================================
# 3. KILL ANY EXISTING PROCESS ON APP PORTS
# ============================================================
info "Freeing port $VITE_PORT..."
lsof -ti tcp:$VITE_PORT | xargs kill -9 2>/dev/null || true
info "Freeing port $API_PORT..."
lsof -ti tcp:$API_PORT | xargs kill -9 2>/dev/null || true
sleep 0.5
ok "Port $VITE_PORT is free"
ok "Port $API_PORT is free"

# ============================================================
# 4. START BACKEND DATABASE API
# ============================================================
info "Starting backend database API on http://127.0.0.1:$API_PORT ..."
cd "$SCRIPT_DIR"
npm run dev:api &>"$API_LOG" &
API_PID=$!

for i in {1..25}; do
  sleep 1
  if curl -sf "http://127.0.0.1:$API_PORT/health" -o /dev/null 2>/dev/null; then
    ok "Backend API ready (PID $API_PID)"
    break
  fi
  if ! kill -0 $API_PID 2>/dev/null; then
    error "Backend API exited unexpectedly. See $API_LOG"
    cat "$API_LOG"
    exit 1
  fi
  if [[ $i -eq 25 ]]; then
    error "Backend API failed to start. See $API_LOG"
    cat "$API_LOG"
    kill $API_PID 2>/dev/null || true
    exit 1
  fi
done

# ============================================================
# 5. START VITE DEV SERVER
# ============================================================
info "Starting Vite dev server on http://localhost:$VITE_PORT ..."
cd "$SCRIPT_DIR"
npm run dev &>"$VITE_LOG" &
VITE_PID=$!

for i in {1..20}; do
  sleep 1
  if curl -sf "http://localhost:$VITE_PORT" -o /dev/null 2>/dev/null; then
    ok "Vite ready (PID $VITE_PID)"
    break
  fi
  if [[ $i -eq 20 ]]; then
    error "Vite failed to start. See $VITE_LOG"
    cat "$VITE_LOG"
    kill $VITE_PID $API_PID 2>/dev/null || true
    exit 1
  fi
done

# ============================================================
# 6. STOP EXISTING NGROK + DELETE STALE CLOUD ENDPOINT
# ============================================================
info "Stopping any existing ngrok processes..."
pkill -x ngrok 2>/dev/null || killall ngrok 2>/dev/null || true
# Wait for port 4040 to be free
for i in {1..8}; do
  sleep 1
  if ! lsof -ti tcp:4040 &>/dev/null; then break; fi
  if [[ $i -eq 8 ]]; then
    warn "Port 4040 still in use — forcing kill..."
    lsof -ti tcp:4040 | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
done
ok "ngrok cleared"

# Auto-delete stale cloud endpoint via Management API (prevents ERR_NGROK_334)
if [[ -n "$STATIC_DOMAIN" && -n "$NGROK_API_KEY" ]]; then
  info "Checking for stale cloud endpoint on ${STATIC_DOMAIN}..."
  ENDPOINT_ID=$(ngrok api endpoints list --api-key "$NGROK_API_KEY" 2>/dev/null \
    | python3 -c "
import sys, json
try:
  data = json.load(sys.stdin)
  for ep in data.get('endpoints', []):
    host = ep.get('public_url','').replace('https://','').replace('http://','').split('/')[0]
    if host == '$STATIC_DOMAIN':
      print(ep['id'])
      break
except: pass
" 2>/dev/null || true)

  if [[ -n "$ENDPOINT_ID" ]]; then
    info "Deleting stale cloud endpoint ($ENDPOINT_ID)..."
    ngrok api endpoints delete "$ENDPOINT_ID" --api-key "$NGROK_API_KEY" >/dev/null 2>&1 \
      && ok "Cloud endpoint deleted — domain is free" \
      || warn "Delete API call failed — trying to start anyway..."
    sleep 3
  else
    ok "No stale cloud endpoint found"
  fi
elif [[ -n "$STATIC_DOMAIN" && -z "$NGROK_API_KEY" ]]; then
  warn "NGROK_API_KEY not set — cannot auto-clean stale endpoints"
  warn "If you see ERR_NGROK_334: add your API key from https://dashboard.ngrok.com/api-keys"
fi

# ============================================================
# 7. START NGROK
# ============================================================
if [[ -n "$STATIC_DOMAIN" ]]; then
  info "Starting ngrok with static domain: ${BOLD}$STATIC_DOMAIN${RESET} ..."
  ngrok http "$VITE_PORT" --domain="$STATIC_DOMAIN" --log=stdout > "$NGROK_LOG" 2>&1 &
else
  info "Starting ngrok (random URL — set NGROK_DOMAIN in .env.local for a permanent URL) ..."
  ngrok http "$VITE_PORT" --log=stdout > "$NGROK_LOG" 2>&1 &
fi
NGROK_PID=$!

# ============================================================
# 8. EXTRACT PUBLIC URL
# ============================================================
info "Waiting for ngrok tunnel to open..."
NGROK_URL=""
for i in {1..30}; do
  sleep 1
  # Bail early if ngrok process already died
  if ! kill -0 $NGROK_PID 2>/dev/null; then
    error "ngrok process exited unexpectedly. Log:"
    cat "$NGROK_LOG" | tail -20
    kill $VITE_PID $API_PID 2>/dev/null || true
    exit 1
  fi
  NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null \
    | python3 -c "
import sys, json
try:
  data = json.load(sys.stdin)
  for t in data.get('tunnels', []):
    if t.get('proto') == 'https':
      print(t['public_url'])
      break
except: pass
" 2>/dev/null || true)
  if [[ -n "$NGROK_URL" ]]; then break; fi
done

if [[ -z "$NGROK_URL" ]]; then
  error "Could not get ngrok public URL. See $NGROK_LOG:"
  cat "$NGROK_LOG" | tail -20
  kill $VITE_PID $API_PID $NGROK_PID 2>/dev/null || true
  exit 1
fi

REDIRECT_URI="${NGROK_URL}/orcid-callback"
ok "Tunnel live: $NGROK_URL"

# ============================================================
# 9. PATCH .env.local
# ============================================================
info "Patching .env.local..."
sed -i.bak "s|^VITE_ORCID_REDIRECT_URI=.*|VITE_ORCID_REDIRECT_URI=${REDIRECT_URI}|" "$ENV_FILE"
sed -i.bak "s|^VITE_ORCID_SANDBOX=.*|VITE_ORCID_SANDBOX=false|" "$ENV_FILE"
rm -f "${ENV_FILE}.bak"
ok ".env.local updated — Vite will hot-reload in a moment"

# ============================================================
# 10. PRINT SUMMARY
# ============================================================
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}  ✅  MPIF-GUI running with a public HTTPS URL${RESET}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "  ${BOLD}Open the app at:${RESET}   $NGROK_URL"
echo -e "  ${BOLD}Redirect URI:${RESET}      $REDIRECT_URI"
echo -e "  ${BOLD}Frontend local:${RESET}    http://localhost:$VITE_PORT"
echo -e "  ${BOLD}Backend local:${RESET}     http://127.0.0.1:$API_PORT"
echo -e "  ${BOLD}Database file:${RESET}     ${MPIF_DB_PATH:-$SCRIPT_DIR/backend/mpif_publish.sqlite3}"
echo ""
echo -e "  ${YELLOW}${BOLD}ACTION REQUIRED — register the redirect URI in ORCID:${RESET}"
echo    "  1. Go to → https://orcid.org/developer-tools"
echo    "  2. Click your app (APP-7JVCJ2FY5YSYYNCE)"
echo -e "  3. Add redirect URI: ${BOLD}${REDIRECT_URI}${RESET}"
echo    "  4. Save, then open the app URL above and click Login with ORCID"
echo ""
echo    "  Press Ctrl+C to stop everything."
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# ============================================================
# 11. KEEP RUNNING — CLEANUP ON EXIT
# ============================================================
cleanup() {
  echo ""
  info "Shutting down backend API, Vite, and ngrok..."
  kill $API_PID $VITE_PID $NGROK_PID 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

while true; do
  sleep 2
  if ! kill -0 $API_PID 2>/dev/null; then
    warn "Backend API stopped unexpectedly. See $API_LOG"
    cleanup
  fi
  if ! kill -0 $VITE_PID 2>/dev/null; then
    warn "Vite stopped unexpectedly. See $VITE_LOG"
    cleanup
  fi
  if ! kill -0 $NGROK_PID 2>/dev/null; then
    warn "ngrok stopped unexpectedly. See $NGROK_LOG"
    cleanup
  fi
done
