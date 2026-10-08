#!/bin/sh
# Brings the ATRO preview app up on 0.0.0.0:8080.
#
# Idempotent: exits 0 immediately when this project's server is already serving,
# otherwise restarts it and waits until it answers correctly.
#
# Two host hazards this guards against, both seen in practice:
#   1. Another project's dev server holding 8080, so this app never starts and
#      the preview silently shows someone else's app.
#   2. A stale long-lived Vite process serving a valid shell with every route
#      404'd, which a plain "does / return 200" check would happily accept.
set -eu
cd "$(dirname "$0")"

LOG=/tmp/app-startup.log
BASE=http://127.0.0.1:8080
MARKER='+254 799 034 712'
ROOT_DIR=$(pwd)

# Healthy means: the shell answers AND a deep route carries real route content.
healthy() {
  curl -sf -o /dev/null --max-time 3 "$BASE/" || return 1
  curl -sf --max-time 5 "$BASE/contact" 2>/dev/null | grep -q "$MARKER"
}

# PIDs of dev servers belonging to THIS project only, so a sibling workspace's
# server is never killed by a blanket pattern match.
own_pids() {
  for pid in $(pgrep -f "vite dev --host 0.0.0.0 --port 8080" 2>/dev/null); do
    cwd=$(readlink "/proc/$pid/cwd" 2>/dev/null || echo "")
    if [ "$cwd" = "$ROOT_DIR" ]; then
      echo "$pid"
    fi
  done
}

# A listener that is not ours means someone else owns the preview port.
foreign_owner() {
  for pid in $(pgrep -f "vite dev --host 0.0.0.0 --port 8080" 2>/dev/null); do
    cwd=$(readlink "/proc/$pid/cwd" 2>/dev/null || echo "")
    if [ "$cwd" != "$ROOT_DIR" ]; then
      echo "$cwd (pid $pid)"
    fi
  done
}

node scripts/preview.mjs stop || true

if healthy; then
  exit 0
fi

for pid in $(own_pids); do
  kill "$pid" 2>/dev/null || true
done
sleep 1

npm run dev >>"$LOG" 2>&1 &

# Wait for readiness so the caller can rely on the app being up on return.
i=0
while [ "$i" -lt 90 ]; do
  if healthy; then
    exit 0
  fi
  i=$((i + 1))
  sleep 1
done

owners=$(foreign_owner || true)
if [ -n "$owners" ]; then
  echo "atro: port 8080 is held by another project, so ATRO is not serving." >&2
  echo "atro:   $owners" >&2
  echo "atro: stop that server, then re-run this script." >&2
else
  echo "atro: dev server did not become healthy on $BASE (see $LOG)" >&2
fi
exit 1