---
name: analyze-performance
description: "Analyze performance of published content and update strategy"
tools: [Read, Write, Edit, Bash, WebSearch, WebFetch, Task, Glob, Grep]
---

# Analyze Performance

Trigger an on-demand analysis cycle for all published content.

## Process

1. Delegate to **analyst** agent:
   ```
   Analyze performance of all published content in workspace/published/.
   Collect metrics, check search rankings, identify patterns.
   Save report and update insights.
   ```

2. Delegate to **strategist** agent:
   ```
   Review latest insights in workspace/insights/ and analytics report.
   Update workspace/strategy/current_strategy.md based on findings.
   Version the strategy change.
   ```

3. Report key findings to user:
   - Top and bottom performers
   - Key patterns discovered
   - Strategy changes made
