#!/usr/bin/env bash
# Publishes to Medium via REST API
# Env: MEDIUM_INTEGRATION_TOKEN
# Stdin: JSON {title, content, content_format, tags, status}
# Stdout: JSON {url, post_id, status, platform}
set -euo pipefail

PAYLOAD=$(cat)
TITLE=$(echo "$PAYLOAD" | jq -r '.title')
CONTENT=$(echo "$PAYLOAD" | jq -r '.content')
FORMAT=$(echo "$PAYLOAD" | jq -r '.content_format // "markdown"')
STATUS=$(echo "$PAYLOAD" | jq -r '.status // "draft"')
TAGS=$(echo "$PAYLOAD" | jq -c '.tags // [] | .[0:5]')

# Step 1: Get author ID
AUTHOR_RESPONSE=$(curl -s "https://api.medium.com/v1/me" \
  -H "Authorization: Bearer ${MEDIUM_INTEGRATION_TOKEN}" \
  -H "Accept: application/json" 2>/dev/null)

AUTHOR_ID=$(echo "$AUTHOR_RESPONSE" | jq -r '.data.id')
if [ -z "$AUTHOR_ID" ] || [ "$AUTHOR_ID" = "null" ]; then
  echo '{"error": "Failed to get Medium author ID", "platform": "medium"}' >&2
  exit 1
fi

# Map status
MEDIUM_STATUS="draft"
case "$STATUS" in
  publish) MEDIUM_STATUS="public" ;;
  draft)   MEDIUM_STATUS="draft" ;;
  *)       MEDIUM_STATUS="draft" ;;
esac

# Step 2: Create post
POST_BODY=$(jq -n \
  --arg title "$TITLE" \
  --arg contentFormat "$FORMAT" \
  --arg content "$CONTENT" \
  --arg publishStatus "$MEDIUM_STATUS" \
  --argjson tags "$TAGS" \
  '{title: $title, contentFormat: $contentFormat, content: $content, publishStatus: $publishStatus, tags: $tags}')

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "https://api.medium.com/v1/users/${AUTHOR_ID}/posts" \
  -H "Authorization: Bearer ${MEDIUM_INTEGRATION_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "$POST_BODY" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "$BODY" | jq '{url: .data.url, post_id: .data.id, status: .data.publishStatus, platform: "medium"}'
else
  echo "$BODY" | jq '{error: (.errors[0].message // "unknown error"), platform: "medium"}' >&2
  exit 1
fi
