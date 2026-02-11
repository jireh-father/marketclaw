#!/usr/bin/env bash
# MarketClaw — Headless campaign execution
# Usage: ./scripts/run_campaign.sh "AI SaaS" 20 "ko,en" "naver,medium"
set -euo pipefail

NICHE="${1:?Usage: run_campaign.sh NICHE GOAL [LANGUAGES] [PLATFORMS]}"
GOAL="${2:?Usage: run_campaign.sh NICHE GOAL [LANGUAGES] [PLATFORMS]}"
LANGUAGES="${3:-ko,en}"
PLATFORMS="${4:-naver,medium}"

echo "[MarketClaw] Starting campaign..."
echo "  Niche: ${NICHE}"
echo "  Goal: ${GOAL} content pieces"
echo "  Languages: ${LANGUAGES}"
echo "  Platforms: ${PLATFORMS}"

claude -p "$(cat <<EOF
/run-campaign niche:${NICHE} goal:${GOAL} lang:${LANGUAGES} platforms:${PLATFORMS}

Execute the full campaign. Continue until all ${GOAL} content pieces are published.
If the session was interrupted before, resume from workspace/progress/task_queue.json.
EOF
)" \
  --allowedTools "Read,Write,Edit,Bash,WebSearch,WebFetch,Task,Glob,Grep" \
  --output-format stream-json
