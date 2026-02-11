#!/usr/bin/env bash
# Publishes to WordPress via WP REST API
# Env: WP_SITE_URL, WP_USERNAME, WP_APP_PASSWORD
# Stdin: JSON {title, content, content_format, tags, slug, meta_description, status}
# Stdout: JSON {url, post_id, status, platform}
set -euo pipefail

PAYLOAD=$(cat)
TITLE=$(echo "$PAYLOAD" | jq -r '.title')
CONTENT=$(echo "$PAYLOAD" | jq -r '.content')
STATUS=$(echo "$PAYLOAD" | jq -r '.status // "draft"')
SLUG=$(echo "$PAYLOAD" | jq -r '.slug // empty')
FORMAT=$(echo "$PAYLOAD" | jq -r '.content_format // "html"')

# Convert markdown to HTML if needed
if [ "$FORMAT" = "markdown" ]; then
  CONTENT=$(echo "$CONTENT" | node "$(dirname "$0")/md2html.js")
fi

API_BODY=$(jq -n \
  --arg title "$TITLE" \
  --arg content "$CONTENT" \
  --arg status "$STATUS" \
  --arg slug "$SLUG" \
  '{title: $title, content: $content, status: $status} + (if $slug != "" then {slug: $slug} else {} end)')

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${WP_SITE_URL}/wp-json/wp/v2/posts" \
  -H "Content-Type: application/json" \
  -u "${WP_USERNAME}:${WP_APP_PASSWORD}" \
  -d "$API_BODY" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "$BODY" | jq '{url: .link, post_id: .id, status: .status, platform: "wordpress"}'
else
  echo "$BODY" | jq '{error: (.message // "unknown error"), code: (.code // "unknown"), platform: "wordpress"}' >&2
  exit 1
fi
