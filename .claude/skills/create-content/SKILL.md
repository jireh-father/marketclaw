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
- **country** (optional): 타겟 국가 (e.g., "한국", "미국"). 미입력 시 무시하고 진행
- **age** (optional): 타겟 연령대 (e.g., "20대", "30-40대"). 미입력 시 무시하고 진행
- **gender** (optional): 타겟 성별 (e.g., "여성", "남성"). 미입력 시 무시하고 진행
- **strategy** (optional, default: "original"): 콘텐츠 전략 타입
  - `original` — 키워드 리서치 기반 오리지널 콘텐츠
  - `celeb-style` — 핫한 연예인 사진 기반 스타일 분석 콘텐츠
  - `viral-adapt` — 바이럴 된 글을 참고한 어댑테이션 콘텐츠

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
