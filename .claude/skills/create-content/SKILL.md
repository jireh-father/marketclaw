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
3. Delegate to **researcher**: deep research on the topic
4. Delegate to **writer-ko** and/or **writer-en**: write drafts
5. Delegate to **seo-optimizer**: optimize
6. Delegate to **image-manager**: handle images
7. Delegate to **content-verifier**: verify (PASS/REVISE/FAIL loop)
8. Quality Gate check (improvement loop if needed)
9. Delegate to **publisher**: publish if PASS
10. Report results
