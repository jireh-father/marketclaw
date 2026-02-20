---
name: run-campaign
description: "Execute a full content marketing campaign. Usage: /run-campaign niche:AI_SaaS goal:20 lang:ko,en platforms:naver,medium"
tools: [Read, Write, Edit, Bash, WebSearch, WebFetch, Task, Glob, Grep]
---

# Run Campaign — Main Orchestration Loop

You are the main orchestrator for MarketClaw campaigns. You drive the entire
content production pipeline from research to publication.

## Input Parsing

Parse user input for:
- **niche** (required): The field/service to promote (e.g., "AI SaaS", "헬스케어 앱")
- **goal** (required): Target number of content pieces
- **lang** (optional, default: "ko,en"): Languages to produce
- **platforms** (optional, default: all enabled): Target blog platforms
- **keywords** (optional): Seed keywords to start with
- **series** (optional, default: false): 시리즈 콘텐츠로 생성. true이면 주제를 연결된 시리즈로 구성
- **country** (optional): 타겟 국가 (e.g., "한국", "미국", "일본"). 미입력 시 무시하고 진행
- **age** (optional): 타겟 연령대 (e.g., "20대", "30-40대"). 미입력 시 무시하고 진행
- **gender** (optional): 타겟 성별 (e.g., "여성", "남성", "전체"). 미입력 시 무시하고 진행
- **neighbors** (optional): 글 발행 후 이웃 확보할 블로그 수 (e.g., "20", "50"). 미입력 시 이웃 확보 단계를 건너뜀
- **strategy** (optional, default: "mix"): 콘텐츠 전략 타입
  - `original` — 기존 방식. 키워드 리서치 → 오리지널 콘텐츠 작성
  - `celeb-style` — 셀럽 스타일 분석. 핫한 연예인 사진 찾아서 스타일 설명/분석
  - `viral-adapt` — 바이럴 어댑테이션. 이미 바이럴 된 글을 참고하여 새로운 관점으로 작성
  - `issue-linked` — 당일 핫이슈 연계. 실시간 트렌드에 niche를 연결하여 시의성 있는 콘텐츠
  - `article-adapt` — 기사 스타일 변형. 뉴스/매거진 기사를 블로그 톤으로 재구성
  - `mix` — 위 5가지를 자동 배합 (original 30%, celeb-style 20%, viral-adapt 20%, issue-linked 15%, article-adapt 15%)

## Phase 0: Initialization

If `workspace/progress/task_queue.json` does NOT exist:

1. Create the full `workspace/` directory tree:
   ```
   workspace/{config,strategy,research/keywords,research/benchmarks,research/trends,
   research/sources,drafts,published,analytics/daily,analytics/reports,analytics/rankings,
   insights,logs,progress}
   ```
2. Initialize `workspace/config/platforms.json` with user's platform selection
   - Set `enabled: true` only for platforms the user specified
   - Set `enabled: false` for all other platforms
3. **Validate Credentials (CRITICAL):**
   For each enabled platform in `platforms.json`:
   - Read the `credentials_env` field
   - Check if the corresponding environment variable is set and non-empty
   - If credentials are missing for an enabled platform:
     - Log a WARNING: "Platform {name} is enabled but {credentials_env} is not set"
     - Set that platform to `enabled: false` in platforms.json
   - If NO platforms have valid credentials after this check:
     - ABORT the campaign with error: "No platforms have valid credentials configured. See docs/setup-guide.md"
   - Report the final list of active platforms to the user
4. Initialize `workspace/progress/task_queue.json`:
   ```json
   {
     "session_id": "YYYY-MM-DD-001",
     "campaign": {"niche": "...", "goal": N, "languages": [...], "platforms": {...}, "series": false},
     "status": "initializing",
     "total_target": N,
     "completed_count": 0,
     "current_topic_id": null,
     "next_action": "Start initial research",
     "created_at": "...",
     "updated_at": "..."
   }
   ```
   - 타겟팅 정보(country, age, gender)가 있으면 campaign.targeting에 포함. 없으면 targeting 필드 자체를 생략.
   - series가 true이면 campaign.series = true로 설정.
   - neighbors 값이 있으면 campaign.neighbors = N으로 설정. 없으면 필드 생략.
   - strategy 값 설정: campaign.strategy = "mix" (기본값) 또는 사용자 지정 값
4. Initialize `workspace/progress/dashboard.md`

If `task_queue.json` DOES exist:
1. Read it and resume from current state
2. Report progress to user

## Phase 1: Initial Research

Delegate to **researcher** agent via Task:
```
Conduct initial research for the niche '{niche}'.
{IF targeting exists: "타겟: {country} {age} {gender}를 위한 리서치"}
Discover 20-30 keywords, analyze 5-10 competitor blogs,
identify trending topics. Save all results to workspace/research/.
```

Update task_queue.json: status = "researching" → "strategizing"

## Phase 2: Strategy Development

Delegate to **strategist** agent via Task:
```
Develop a marketing strategy based on workspace/research/.
{IF targeting exists: "타겟 오디언스: {country} {age} {gender}"}
{IF series == true: "콘텐츠를 연결된 시리즈로 구성. 각 글이 독립적으로 읽히되 시리즈 전체를 읽으면 깊이 있는 이해를 제공하도록 설계. 시리즈 제목 패턴, 회차 번호, 다음 편 예고 포함."}
콘텐츠 전략: {strategy} (mix이면 original 40%, celeb-style 30%, viral-adapt 30% 비율로 배합)
Create a content calendar for {goal} pieces.
Save to workspace/strategy/.
```

Read the content calendar and populate task_queue.json with content items.
Update status: "strategizing" → "producing"

## Phase 3: Content Production Loop

```
WHILE completed_count < goal:

  1. PLAN: Delegate to planner → get next topic_id and topic

  2. RESEARCH: Delegate to researcher (strategy-aware)
     IF content_type == "celeb-style-analysis":
       → "Find trending celebrity photos/styles for topic '{topic}'. Search for hot celeb looks, red carpet photos, SNS updates. Save celeb photos and style analysis to workspace/research/sources/{topic_id}/"
     ELIF content_type == "viral-adaptation":
       → "Find viral blog posts about '{topic}'. Identify 3-5 posts with high engagement (views, comments, shares). Save full content analysis and viral elements to workspace/research/sources/{topic_id}/"
     ELSE:
       → "Deep research for topic '{topic}' (topic_id: {topic_id})"

  3. WRITE: (based on languages AND strategy)
     IF 'ko' in languages:
       Delegate to writer-ko → draft_ko.md
       (Include content_type in prompt: "celeb-style-analysis", "viral-adaptation", or standard type)
     IF 'en' in languages:
       Delegate to writer-en → draft_en.md

  4. SEO OPTIMIZE: Delegate to seo-optimizer
     → Optimize drafts, produce final versions

  5. IMAGES: Delegate to image-manager
     → Search/generate images, insert into content

  6. VERIFY: Delegate to content-verifier
     → Independent human-likeness + fact check
     IF REVISE:
       Send revision instructions back to writer
       Re-verify (max 2 rounds)
     IF FAIL:
       Log and skip to next topic

  7. QUALITY GATE: Read quality_score from metadata.json
     IF weighted_overall >= 7.0: proceed to publish
     IF 5.0-6.9: identify weak areas, delegate targeted improvements
       → Re-verify and re-score (max 3 rounds, must gain 0.5+ each)
     IF < 5.0: discard, move to next topic

  8. PUBLISH: Delegate to publisher
     → Publish to enabled platforms with valid credentials (from platforms.json)

  9. UPDATE: Delegate to planner
     → Update progress, dashboard, logs

  10. ANALYZE (every 3 pieces):
      Delegate to analyst → performance analysis
      Delegate to strategist → update strategy based on insights
```

## Phase 3.5: Community Building (neighbors 옵션이 있을 때만)

캠페인의 모든 글이 발행된 후, `neighbors` 값이 설정되어 있으면 커뮤니티 빌딩을 실행한다.

```
IF campaign.neighbors exists AND campaign.neighbors > 0:

  Delegate to community-manager agent via Task:
  """
  캠페인 '{niche}'의 모든 글이 발행 완료되었습니다.
  관련 블로그 {neighbors}개를 찾아서 이웃 신청하고,
  각 블로그의 최신 글에 자연스러운 댓글을 작성해주세요.

  캠페인 정보: workspace/progress/task_queue.json
  발행된 글 목록: workspace/published/
  활동 기록: workspace/community/

  주의사항:
  - 봇처럼 보이지 않게 모든 댓글을 고유하고 자연스럽게 작성
  - 각 액션 사이에 랜덤 대기 (3~15초)
  - CAPTCHA 발생 시 즉시 중단하고 진행 상황 저장
  """

  Update task_queue.json: add community_building status
```

## Phase 4: Final Report

When all content is published (and community building is done, if applicable):
1. Delegate to analyst for final comprehensive analysis
2. Generate summary report
3. Print key metrics to user:
   - Total published
   - Average quality score
   - Best performer
   - Key insights discovered
   - Strategy evolution summary
   - Community building results (if neighbors option was used):
     - 이웃 신청 수
     - 댓글 작성 수
     - 공감 수

## 스케줄링 가이드

MarketClaw를 정기적으로 자동 실행하려면 OS 스케줄러를 활용한다.

### Windows 작업 스케줄러 (Task Scheduler)
```batch
:: scripts/scheduled-campaign.bat 참조
:: 작업 스케줄러에서 등록:
:: 1. "작업 스케줄러" 열기 (taskschd.msc)
:: 2. "기본 작업 만들기" → 이름: "MarketClaw Daily"
:: 3. 트리거: 매일 / 특정 시간 (예: 오전 9시)
:: 4. 동작: 프로그램 시작 → scripts/scheduled-campaign.bat
:: 5. "마침" 클릭
::
:: 또는 명령어로 등록:
schtasks /create /tn "MarketClaw-Daily" /tr "D:\source\marketclaw\scripts\scheduled-campaign.bat" /sc daily /st 09:00
```

### Linux/Mac crontab
```bash
# crontab -e
# 매일 오전 9시 실행
0 9 * * * cd /path/to/marketclaw && claude -p "기존 캠페인 이어서 실행" --allowedTools "Bash,Read,Write,Edit,WebSearch,WebFetch,Task,Glob,Grep"

# 매주 월/수/금 실행
0 9 * * 1,3,5 cd /path/to/marketclaw && claude -p "새 콘텐츠 3개 제작 및 발행" --allowedTools "Bash,Read,Write,Edit,WebSearch,WebFetch,Task,Glob,Grep"
```

### 권장 운영 패턴
| 주기 | 액션 | 설명 |
|------|------|------|
| 매일 | 콘텐츠 1-2개 발행 | 꾸준한 발행으로 C-Rank 강화 |
| 매일 | 이웃 10-20명 확보 | 커뮤니티 활성화 |
| 주 1회 | 성과 분석 | 조회수/공감 추이 확인 |
| 주 1회 | 전략 업데이트 | 성과 기반 키워드/주제 조정 |
| 월 1회 | 전체 리포트 | 월간 성과 종합 분석 |

## Issue-Linked Strategy (Phase 3 보충)

content_type이 `issue-linked`일 때의 제작 흐름:

```
1. RESEARCH: researcher에게 당일 핫이슈 검색 위임
   → "오늘 핫한 이슈/트렌드를 찾아서 '{niche}'와 연결할 수 있는 주제를 발굴해주세요"
   → 실시간 검색어, 뉴스 트렌드, SNS 화제 등 검색

2. WRITE: 이슈를 niche 관점에서 재해석
   → 예) niche=헤어스타일, 이슈=드라마 X 방영
   → "드라마 X 여주인공 헤어스타일 따라하기"

3. 나머지는 일반 파이프라인과 동일
```

## Article-Adapt Strategy (Phase 3 보충)

content_type이 `article-adapt`일 때의 제작 흐름:

```
1. RESEARCH: researcher에게 인기 기사/매거진 글 검색 위임
   → "'{niche}' 관련 최근 인기 기사나 매거진 글을 찾아주세요"
   → 뉴스, 매거진, 전문 미디어의 인기 기사 수집

2. WRITE: 기사의 정보를 블로그 톤으로 재구성
   → 기사의 핵심 정보 + 개인 경험/의견 추가
   → 30% 이상 새로운 관점/정보 필수
   → 원본 기사 출처 명시 (투명성)

3. 나머지는 일반 파이프라인과 동일
```
