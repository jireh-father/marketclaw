# Quality Standards

## Self-Evaluation Schema

Every content piece MUST include a quality evaluation in `metadata.json`:

```json
{
  "quality_score": {
    "content_quality": 0,
    "human_likeness": 0,
    "seo_optimization": 0,
    "viral_potential": 0,
    "readability": 0,
    "image_quality": 0,
    "reader_value": 0,
    "brand_consistency": 0,
    "weighted_overall": 0
  }
}
```

## Scoring (1-10 scale)

- **content_quality** (x1.3): Information value, depth, accuracy, unique insights
- **human_likeness** (x1.5): Reads like a real person wrote it. No AI patterns
- **seo_optimization** (x1.0): Keyword placement, meta tags, heading structure
- **viral_potential** (x1.0): Share-worthy title, hook, emotional trigger
- **readability** (x1.0): Flow, structure, visual comfort, scannable
- **image_quality** (x1.0): Relevant images, good resolution, proper ALT text
- **reader_value** (x1.0): Practical, actionable takeaways readers can use immediately
- **brand_consistency** (x1.0): Consistent tone, style, messaging across all content

## Weighted Overall Calculation

`weighted_overall = (content_quality*1.3 + human_likeness*1.5 + rest*1.0) / 9.8`

## Thresholds

- **>= 7.0**: PUBLISH — send to publisher
- **5.0 - 6.9**: IMPROVE — identify weak areas, targeted refinement (max 3 rounds)
- **< 5.0**: DISCARD — log failure reason, move to next topic

## Improvement Loop Rules

- Each round must improve score by at least 0.5
- If score stagnates (< 0.5 improvement), stop iterating
- After 3 rounds, publish best version if >= 6.0, otherwise discard
- Focus improvement on the 2-3 lowest-scoring areas only

## Content Uniqueness

- Never duplicate previously published content (check `workspace/published/`)
- Each piece must provide unique value not found in prior content
- Cross-reference with competitor content to ensure differentiation
