#!/usr/bin/env bash
# Naver Blog publish via Playwright MCP browser automation
# Naver Blog writePost API was shut down May 2020 — browser automation is the only path
# Stdin: JSON {title, content, content_format, tags}
# Stdout: JSON with browser_automation instructions for publisher agent
set -euo pipefail

# Validate required credentials
for var in NAVER_USERNAME NAVER_PASSWORD; do
  if [ -z "${!var:-}" ]; then
    echo "{\"error\": \"Missing required environment variable: $var\", \"platform\": \"naver\"}" >&2
    exit 1
  fi
done

PAYLOAD=$(cat)

# Output instructions for the publisher agent to use Playwright MCP
echo "$PAYLOAD" | jq '{
  platform: "naver",
  method: "browser_automation",
  instructions: "Use Playwright MCP tools to publish to Naver Blog:\n1. browser_navigate to https://nid.naver.com/nidlogin.login\n2. Login with NAVER_USERNAME and NAVER_PASSWORD\n3. Navigate to https://blog.naver.com/BLOG_ID (use NAVER_BLOG_ID if set)\n4. Click the write/new post button to open the editor\n5. browser_type the title into the title field\n6. Switch to the HTML editor mode if available\n7. browser_evaluate to inject HTML content into the SmartEditor\n8. Add tags if the tag input is available\n9. browser_click the publish/save button\n10. browser_snapshot to capture the published URL\n11. Return the URL and post ID",
  title: .title,
  content: .content,
  content_format: (.content_format // "html"),
  tags: (.tags // []),
  daily_limit_warning: "Avoid posting more than 3-5 posts per day to prevent account restrictions"
}'
