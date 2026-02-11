#!/usr/bin/env bash
# Tistory publish via Playwright MCP browser automation
# Tistory API was shut down Feb 2024 — browser automation is the only path
# Stdin: JSON {title, content, content_format, tags, category}
# Stdout: JSON with browser_automation instructions for publisher agent
set -euo pipefail

PAYLOAD=$(cat)

# Output instructions for the publisher agent to use Playwright MCP
echo "$PAYLOAD" | jq '{
  platform: "tistory",
  method: "browser_automation",
  instructions: "Use Playwright MCP tools to publish to Tistory:\n1. browser_navigate to https://www.tistory.com/auth/login\n2. Login with TISTORY_USERNAME and TISTORY_PASSWORD\n3. Navigate to new post editor (https://BLOGNAME.tistory.com/manage/newpost)\n4. browser_type the title into the title field\n5. browser_evaluate to inject HTML content into the editor\n6. Set category if specified\n7. browser_click the publish/save button\n8. browser_snapshot to capture the published URL\n9. Return the URL and post ID",
  title: .title,
  content: .content,
  content_format: (.content_format // "html"),
  tags: (.tags // []),
  category: (.category // ""),
  daily_limit_warning: "Tistory allows max 5 posts/day per blog, 15 across all blogs"
}'
