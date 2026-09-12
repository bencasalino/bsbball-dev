#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="$PWD/fonts/lexend"
CSS_URL="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap"

mkdir -p "$OUT_DIR"
css_tmp=$(mktemp)
trap 'rm -f "$css_tmp"' EXIT

curl -sSf "$CSS_URL" -o "$css_tmp"

grep -o 'https://fonts.gstatic.com/[^)]*\.woff2' "$css_tmp" | sort -u | while read -r url; do
  filename=$(basename "$url")
  curl -sSfL "$url" -o "$OUT_DIR/$filename"
done

echo "Fonts downloaded to $OUT_DIR"
