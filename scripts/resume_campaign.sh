#!/usr/bin/env bash
# MarketClaw — Resume an interrupted campaign
# Usage: ./scripts/resume_campaign.sh [SESSION_ID]
set -euo pipefail

SESSION_ID="${1:-}"

echo "[MarketClaw] Resuming campaign..."

if [ -n "$SESSION_ID" ]; then
  echo "  Resuming session: ${SESSION_ID}"
  claude --resume "$SESSION_ID" -p \
    "Check workspace/progress/task_queue.json and continue the campaign from where it left off."
else
  echo "  Starting fresh session from task_queue.json state"
  claude -p "$(cat <<'EOF'
Read workspace/progress/task_queue.json and continue the campaign from where it left off.
Check workspace/progress/dashboard.md for current status.
Resume the next pending task and keep going until the campaign goal is reached.
EOF
  )" \
    --allowedTools "Read,Write,Edit,Bash,WebSearch,WebFetch,Task,Glob,Grep" \
    --output-format stream-json
fi
