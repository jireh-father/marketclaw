#!/usr/bin/env bash
# Velog publish via Playwright MCP browser automation
# Velog has no official public API — browser automation required
# Stdin: JSON {title, content, tags}
# Stdout: JSON with browser_automation instructions for publisher agent
set -euo pipefail

# Validate required credentials
for var in VELOG_USERNAME VELOG_PASSWORD; do
  if [ -z "${!var:-}" ]; then
    echo "{\"error\": \"Missing required environment variable: $var\", \"platform\": \"velog\"}" >&2
    exit 1
  fi
done

PAYLOAD=$(cat)

# Output instructions for the publisher agent to use Playwright MCP
echo "$PAYLOAD" | jq '{
  platform: "velog",
  method: "browser_automation",
  instructions: "Use Playwright MCP tools to publish to Velog:\n1. browser_navigate to https://velog.io\n2. Login with VELOG_USERNAME and VELOG_PASSWORD (or GitHub OAuth)\n3. Navigate to https://velog.io/write\n4. browser_type the title into the title input\n5. browser_type the markdown content into the editor area\n6. Add tags using the tag input\n7. browser_click the publish button\n8. In the publish modal, click confirm publish\n9. browser_snapshot to capture the published URL\n10. Return the URL",
  title: .title,
  content: .content,
  content_format: "markdown",
  tags: (.tags // [])
}'
