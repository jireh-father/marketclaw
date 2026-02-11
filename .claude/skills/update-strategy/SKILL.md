---
name: update-strategy
description: "Manually trigger a strategy review and update cycle"
tools: [Read, Write, Edit, Task, Glob, Grep]
---

# Update Strategy

Manually review and update the current marketing strategy.

## Process

1. Delegate to **strategist** agent:
   ```
   Review all data in workspace/research/, workspace/insights/,
   and workspace/analytics/. Re-evaluate the current strategy.
   Update workspace/strategy/current_strategy.md.
   Adjust the content calendar if needed.
   Version the change in strategy_history/.
   ```

2. Report changes to user:
   - What changed in the strategy
   - Why (data-driven reasoning)
   - Impact on remaining content calendar
