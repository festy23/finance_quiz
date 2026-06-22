#!/usr/bin/env bash
# Сборка PDF-шпаргалки «АиСД fast».
# Требует: typst (brew install typst). SVG-фигуры берутся из public/figures/aisd/
# (генерируются Python-пайплайном scripts/figures/, см. корневой README).
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(cd ../../.. && pwd)"
typst compile main.typ aisd-fast.pdf --root "$ROOT"
echo "✓ docs/exam/aisd/aisd-fast.pdf собран"
