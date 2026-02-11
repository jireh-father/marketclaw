#!/usr/bin/env bash
# Publishes to Naver Blog via Open API
# Env: NAVER_BLOG_ACCESS_TOKEN
# Stdin: JSON {title, content, content_format, tags}
# Stdout: JSON {url, post_id, status, platform}
set -euo pipefail

# Validate required credentials
if [ -z "${NAVER_BLOG_ACCESS_TOKEN:-}" ]; then
  echo '{"error": "Missing required environment variable: NAVER_BLOG_ACCESS_TOKEN", "platform": "naver"}' >&2
  exit 1
fi

PAYLOAD=$(cat)
TITLE=$(echo "$PAYLOAD" | jq -r '.title')
CONTENT=$(echo "$PAYLOAD" | jq -r '.content')
FORMAT=$(echo "$PAYLOAD" | jq -r '.content_format // "markdown"')

# Naver requires HTML content
if [ "$FORMAT" = "markdown" ]; then
  CONTENT=$(echo "$CONTENT" | node "$(dirname "$0")/md2html.js")
fi

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "https://openapi.naver.com/blog/writePost.json" \
  -H "Authorization: Bearer ${NAVER_BLOG_ACCESS_TOKEN}" \
  --data-urlencode "title=${TITLE}" \
  --data-urlencode "contents=${CONTENT}" \
  2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  BLOG_URL=$(echo "$BODY" | jq -r '.message.result.blogUrl // empty')
  LOG_NO=$(echo "$BODY" | jq -r '.message.result.logNo // empty')
  if [ -n "$BLOG_URL" ] && [ -n "$LOG_NO" ]; then
    jq -n --arg url "${BLOG_URL}/${LOG_NO}" --arg post_id "$LOG_NO" \
      '{url: $url, post_id: $post_id, status: "published", platform: "naver"}'
  else
    echo "$BODY" | jq '. + {platform: "naver", status: "published"}'
  fi
else
  echo "$BODY" | jq '{error: (.errorMessage // "unknown error"), code: (.errorCode // "unknown"), platform: "naver"}' >&2
  exit 1
fi
