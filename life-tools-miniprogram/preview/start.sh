#!/usr/bin/env bash
# 好算生活预览服务；默认端口 8788，可用第一个参数覆盖，例如: ./start.sh 8899
set -euo pipefail
PORT="${1:-8788}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if command -v ss >/dev/null 2>&1; then
  if ss -ltn | grep -qE ":${PORT}\\b"; then
    echo "端口 ${PORT} 已被占用，请换一个端口，例如: ./start.sh 8899" >&2
    exit 1
  fi
fi

echo "好算生活预览: http://127.0.0.1:${PORT}/"
echo "自动演示:     http://127.0.0.1:${PORT}/?demo=1"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
