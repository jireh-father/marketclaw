#!/usr/bin/env bash
# Publishes to Dev.to via Forem API
# Env: DEVTO_API_KEY
# Stdin: JSON {title, content, tags, status}
# Stdout: JSON {url, post_id, status, platform}
set -euo pipefail

# Validate required credentials
if [ -z "${DEVTO_API_KEY:-}" ]; then
  echo '{"error": "Missing required environment variable: DEVTO_API_KEY", "platform": "devto"}' >&2
  exit 1
fi

PAYLOAD=$(cat)
TITLE=$(echo "$PAYLOAD" | jq -r '.title')
CONTENT=$(echo "$PAYLOAD" | jq -r '.content')
STATUS=$(echo "$PAYLOAD" | jq -r '.status // "draft"')
TAGS=$(echo "$PAYLOAD" | jq -c '.tags // [] | .[0:4]')
SLUG=$(echo "$PAYLOAD" | jq -r '.slug // empty')

PUBLISHED="false"
[ "$STATUS" = "publish" ] && PUBLISHED="true"

# Rate limit guard: Dev.to allows 10 req/30s
sleep 3

POST_BODY=$(jq -n \
  --arg title "$TITLE" \
  --arg body_markdown "$CONTENT" \
  --argjson published "$PUBLISHED" \
  --argjson tags "$TAGS" \
  '{article: {title: $title, body_markdown: $body_markdown, published: $published, tags: $tags}}')

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "https://dev.to/api/articles" \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.forem.api-v1+json" \
  -H "api-key: ${DEVTO_API_KEY}" \
  -d "$POST_BODY" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "$BODY" | jq '{url: .url, post_id: .id, status: (if .published then "published" else "draft" end), platform: "devto"}'
else
  echo "$BODY" | jq '{error: (.error // "unknown error"), platform: "devto"}' >&2
  exit 1
fi
