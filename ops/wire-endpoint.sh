#!/usr/bin/env bash
# Wire a deployed Apps Script Web App URL into the static site config.
# Usage: ./ops/wire-endpoint.sh 'https://script.google.com/macros/s/XXXX/exec'
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
URL="${1:-}"
if [[ -z "$URL" ]]; then
  echo "Usage: $0 'https://script.google.com/macros/s/.../exec'" >&2
  exit 1
fi
if [[ ! "$URL" =~ ^https://script\.google\.com/ ]]; then
  echo "Refusing non-Apps-Script URL: $URL" >&2
  exit 1
fi
CFG="$ROOT/js/funnel-config.js"
python3 - "$CFG" "$URL" <<'PY'
import pathlib, sys, re
cfg_path, url = pathlib.Path(sys.argv[1]), sys.argv[2]
text = cfg_path.read_text()
new, n = re.subn(
    r'formEndpoint:\s*"[^"]*"',
    f'formEndpoint: "{url}"',
    text,
    count=1,
)
if n != 1:
    raise SystemExit("Could not find formEndpoint in funnel-config.js")
cfg_path.write_text(new)
print(f"Updated {cfg_path} → formEndpoint set")
PY
