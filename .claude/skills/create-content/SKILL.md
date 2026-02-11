---
name: create-content
description: "Create a single content piece. Usage: /create-content topic:'AI chatbot guide' lang:ko,en"
tools: [Read, Write, Edit, Bash, WebSearch, WebFetch, Task, Glob, Grep]
---

# Create Content — Single Piece Production

Create one content piece outside of a campaign context.

## Input
- **topic** (required): The content topic
- **lang** (optional, default: "ko,en"): Languages
- **type** (optional): Content type (how-to, listicle, comparison, etc.)
- **platforms** (optional): Target platforms

## Process

1. Generate a topic_id (e.g., "SINGLE_001")
2. Create `workspace/drafts/{topic_id}/` directory
3. **Determine target platforms:**
   - Read `workspace/config/platforms.json`
   - If user specified `platforms`, use those (but verify they are enabled and have credentials)
   - If not specified, use all platforms where `enabled: true`
   - For each target platform, check that its `credentials_env` environment variable is set
   - Skip platforms with missing credentials (log a warning)
   - If no platforms are available, ABORT with error message
4. Delegate to **researcher**: deep research on the topic
5. Delegate to **writer-ko** and/or **writer-en**: write drafts (only for languages matching enabled platforms)
6. Delegate to **seo-optimizer**: optimize
7. Delegate to **image-manager**: handle images
8. Delegate to **content-verifier**: verify (PASS/REVISE/FAIL loop)
9. Quality Gate check (improvement loop if needed)
10. Delegate to **publisher**: publish to validated platforms only
11. Report results
