# MarketClaw - AI Blog Content Marketing Agent PRD

## Product Requirements Document v1.0

---

## 1. 개요 (Overview)

**MarketClaw**는 Claude Code의 네이티브 에이전트 기능을 활용하여 구축된 **자율형 블로그 콘텐츠 마케팅 에이전트**다. 사용자가 홍보할 분야/서비스와 목표 콘텐츠 수만 입력하면, 에이전트가 스스로 마케팅 전략을 수립하고, 최신 트렌드를 조사하며, SEO 최적화된 콘텐츠를 작성하고, 실제 블로그에 발행까지 수행한다.

**핵심 철학**: 정해진 정답 없이, 사람처럼 자료를 조사하고 시행착오를 거치며 계속 성장하는 에이전트. 반복할수록 더 나은 마케팅 전략과 콘텐츠를 만들어낸다.

### 1.1 비전

> "잠자는 동안에도 쉬지 않고 일하는, 인간보다 부지런한 콘텐츠 마케터"

- 24/7 자동 운영되는 콘텐츠 마케팅 파이프라인
- 한국어(네이버/티스토리) + 영어(Medium/WordPress/Dev.to) 동시 운영
- 트래픽 분석 기반 자기 학습 및 전략 진화
- 인기 콘텐츠 벤치마킹 → 자체 콘텐츠 재생산

### 1.2 핵심 가치

| 가치 | 설명 |
|------|------|
| **자율성** | 사용자 개입 최소화, 목표만 주면 끝까지 알아서 수행 |
| **적응성** | 성과 데이터 기반으로 전략을 스스로 수정·개선 |
| **속도** | 빠르게 대량 콘텐츠 생산, 트렌드 실시간 반영 |
| **이중 언어** | 한국 바이럴 + 글로벌 바이럴 동시 공략 |
| **투명성** | 모든 전략·조사·결과를 로컬 파일로 체계적 관리 |

---

## 2. 문제 정의 (Problem Statement)

### 2.1 현재 블로그 마케팅의 문제점

1. **시간 부족**: 양질의 콘텐츠 1개 작성에 3-8시간 소요
2. **트렌드 파악 어려움**: 최신 핫 토픽을 실시간 추적하고 반영하기 어려움
3. **SEO 전문성 부족**: 키워드 리서치, 메타데이터 최적화 등 전문 지식 필요
4. **다국어 운영 부담**: 한국어·영어 동시 운영 시 2배의 노동력 필요
5. **일관성 유지 어려움**: 정기적 발행 일정을 지키기 어려움
6. **성과 분석 미흡**: 트래픽 데이터를 분석하고 전략에 반영하는 피드백 루프 부재
7. **경쟁 콘텐츠 분석 부재**: 인기 콘텐츠의 성공 요인 분석 및 벤치마킹 미흡

### 2.2 MarketClaw가 해결하는 것

```
[사용자 입력]                    [MarketClaw 자동 수행]

분야: "AI SaaS"          →    1. 트렌드 조사 & 키워드 리서치
목표: 20개 콘텐츠          →    2. 경쟁 콘텐츠 벤치마킹
                              3. 마케팅 전략 수립
                              4. 콘텐츠 작성 (한/영)
                              5. 블로그 발행
                              6. 트래픽 분석
                              7. 전략 수정 & 반복
                              8. → 20개 완료까지 무한 반복
```

---

## 3. 사용자 (Target Users)

### 3.1 주요 사용자

- **1인 창업자 / 인디해커**: 마케팅 팀 없이 혼자 서비스를 홍보해야 하는 개발자
- **스타트업 마케터**: 한정된 인력으로 대량 콘텐츠를 생산해야 하는 담당자
- **프리랜서 / 컨설턴트**: 자신의 전문 분야를 블로그로 홍보하려는 전문가
- **소규모 에이전시**: 다수 클라이언트의 콘텐츠를 효율적으로 관리해야 하는 팀

### 3.2 사용 시나리오

```bash
# 시나리오 1: 기본 실행
claude -p "분야: AI 챗봇 SaaS, 목표: 10개 콘텐츠, 언어: 한국어+영어"

# 시나리오 2: 특정 블로그 플랫폼 지정
claude -p "분야: 헬스케어 앱, 목표: 5개, 플랫폼: 네이버블로그+Medium"

# 시나리오 3: 영어만
claude -p "분야: DevTools, 목표: 15개, 언어: 영어, 플랫폼: dev.to"

# 시나리오 4: 키워드 지정
claude -p "분야: 부동산 투자, 키워드: 갭투자,전세,청약, 목표: 20개"
```

---

## 4. 핵심 기능 (Core Features)

### 4.1 자율 마케팅 전략 엔진

에이전트의 두뇌. 정해진 템플릿 없이 스스로 전략을 수립하고 진화시킨다.

#### 4.1.1 트렌드 리서치 & 키워드 발굴

```
[WebSearch] 실시간 트렌드 파악
    ├── 구글 트렌드 키워드 조사
    ├── 네이버 데이터랩 인기 검색어
    ├── Reddit/HackerNews 핫 토픽
    ├── 업계 뉴스 & 보도자료
    └── 소셜미디어 바이럴 콘텐츠

[분석 & 저장]
    ├── 키워드 경쟁도 추정
    ├── 검색 볼륨 트렌드 분석
    ├── 콘텐츠 갭 식별
    └── → workspace/research/keywords/ 에 저장
```

#### 4.1.2 경쟁 콘텐츠 벤치마킹

인기 있는 콘텐츠를 분석하고, 구조와 기법을 학습하여 자체 콘텐츠에 반영한다.

```
[WebFetch] 인기 콘텐츠 크롤링
    ├── 네이버 블로그 인기글 상위 노출 분석
    ├── Medium 인기 아티클 구조 분석
    ├── 제목 패턴, 도입부 기법, CTA 분석
    ├── 글 길이, 이미지 배치, 소제목 구조
    └── → workspace/research/benchmarks/ 에 저장

[벤치마킹 전략]
    ├── 인기 글의 주제를 자체 분야에 맞게 변형
    ├── 검증된 제목 패턴 재사용 (숫자형, 질문형, 방법론형)
    ├── 성공적인 글 구조를 템플릿화
    └── 결과만 바꾸는 식의 "합법적 모방" 전략
```

#### 4.1.3 마케팅 전략 수립 & 진화

```
[전략 수립 프로세스]
    1. 분야 분석 → 타겟 오디언스 정의
    2. 키워드 매핑 → 콘텐츠 주제 도출
    3. 콘텐츠 캘린더 생성
    4. 각 콘텐츠별 세부 전략 설정
       - 콘텐츠 타입 (how-to, listicle, case study, 비교분석 등)
       - SEO 전략 (주요키워드, LSI 키워드, 내부링크)
       - 바이럴 전략 (공유 유도, 댓글 유도, SNS 최적화)
    5. 실행 → 성과 측정 → 전략 수정 → 반복

[전략 진화 메커니즘]
    - 고성과 콘텐츠의 공통 패턴 추출
    - 저성과 콘텐츠의 실패 원인 분석
    - A/B 테스트: 제목, 도입부, CTA 변형 시도
    - → workspace/strategy/ 에 전략 문서 지속 업데이트
```

### 4.2 콘텐츠 생산 엔진

#### 4.2.1 콘텐츠 타입 지원

| 타입 | 한국어 최적화 | 영어 최적화 | 설명 |
|------|:---:|:---:|------|
| **How-to 가이드** | O | O | "~하는 방법" 단계별 설명 |
| **리스티클** | O | O | "Top 10 ~", "~하는 7가지 방법" |
| **트렌드 분석** | O | O | 최신 업계 동향 분석 |
| **비교 분석** | O | O | "A vs B", 제품/서비스 비교 |
| **케이스 스터디** | O | O | 성공 사례 분석 |
| **뉴스 큐레이션** | O | O | 업계 뉴스 모아서 정리 |
| **초보자 가이드** | O | O | 입문자를 위한 종합 안내 |
| **인터뷰/Q&A** | O | O | 가상 전문가 인터뷰 형식 |
| **데이터 분석** | O | O | 통계/데이터 기반 인사이트 |
| **오피니언/칼럼** | O | O | 전문가 관점의 의견 제시 |

#### 4.2.2 콘텐츠 작성 파이프라인

```
[Phase 1: 리서치]
    WebSearch → 최신 정보 수집
    WebFetch → 참고 자료 상세 분석
    → workspace/research/sources/{topic_id}/ 저장

[Phase 2: 아웃라인]
    - 벤치마크 데이터 참고
    - SEO 키워드 매핑
    - 독자 니즈 기반 구조 설계
    → workspace/drafts/{topic_id}/outline.md 저장

[Phase 3: 초안 작성]
    - 한국어 버전: 네이버/티스토리 최적화 문체
    - 영어 버전: Medium/WordPress 최적화 문체
    - 각 버전은 독립적으로 최적화 (단순 번역 X)
    → workspace/drafts/{topic_id}/draft_ko.md
    → workspace/drafts/{topic_id}/draft_en.md

[Phase 4: SEO 최적화]
    - 제목 최적화 (클릭률 극대화)
    - 메타 디스크립션 작성
    - 헤딩 구조 최적화 (H1-H3)
    - 키워드 밀도 조정
    - 내부/외부 링크 삽입
    → workspace/drafts/{topic_id}/final_ko.md
    → workspace/drafts/{topic_id}/final_en.md

[Phase 5: 발행]
    - 블로그 플랫폼 API로 자동 발행
    - 발행 결과 기록
    → workspace/published/{topic_id}/metadata.json
```

#### 4.2.3 언어별 최적화 전략

**한국어 (네이버/티스토리 최적화)**
- 네이버 검색 알고리즘 최적화 (C-Rank, D.I.A.)
- 한국인 선호 문체: 친근하고 정보성 있는 ~입니다체 또는 ~해요체
- 네이버 키워드 도구 기반 키워드 전략
- 이미지 ALT 텍스트 한국어 최적화
- 네이버 블로그 특유의 포맷 (구분선, 인용구, 강조 등)
- 체험형/후기형 콘텐츠 스타일 적극 활용

**영어 (Medium/WordPress/Dev.to 최적화)**
- Google SEO 최적화 (E-E-A-T 기준)
- 영미권 선호 문체: Direct, Value-driven, Scannable
- Google Keyword Planner 기반 키워드 전략
- Schema markup 최적화
- Open Graph / Twitter Card 메타 태그
- 데이터 기반, 인사이트 중심 콘텐츠 스타일

### 4.3 블로그 플랫폼 연동

#### 4.3.1 지원 플랫폼

| 플랫폼 | 언어 | 연동 방식 | 우선순위 |
|--------|:---:|----------|:---:|
| **네이버 블로그** | KO | Open API / 자동화 스크립트 | P0 |
| **티스토리** | KO | Tistory API | P0 |
| **Medium** | EN | Medium API | P0 |
| **WordPress** | EN | WP REST API | P0 |
| **Dev.to** | EN | Forem API | P1 |
| **Velog** | KO | GraphQL API | P1 |
| **Hashnode** | EN | Hashnode API | P1 |
| **Ghost** | EN | Ghost Admin API | P2 |
| **Blogger** | KO/EN | Blogger API v3 | P2 |
| **Brunch** | KO | 수동/반자동 | P2 |

#### 4.3.2 플랫폼 연동 아키텍처

```
workspace/config/platforms.json
{
  "platforms": {
    "naver_blog": {
      "enabled": true,
      "language": "ko",
      "credentials_env": "NAVER_BLOG_API_KEY",
      "blog_id": "user_blog_id",
      "auto_publish": true,
      "schedule": "immediate"
    },
    "medium": {
      "enabled": true,
      "language": "en",
      "credentials_env": "MEDIUM_TOKEN",
      "publication_id": "optional",
      "auto_publish": false,
      "schedule": "draft_first"
    },
    "tistory": {
      "enabled": true,
      "language": "ko",
      "credentials_env": "TISTORY_TOKEN",
      "blog_name": "user_blog",
      "auto_publish": true,
      "category_id": "auto"
    },
    "wordpress": {
      "enabled": true,
      "language": "en",
      "credentials_env": "WP_APP_PASSWORD",
      "site_url": "https://yourblog.com",
      "auto_publish": true
    }
  }
}
```

### 4.4 트래픽 분석 & 피드백 루프

#### 4.4.1 분석 지표

```
[수집 가능한 지표]
├── 조회수 (페이지뷰)
├── 검색 유입 키워드
├── 체류 시간
├── 이탈률
├── 공유 수 (소셜 시그널)
├── 댓글 수
├── 검색 순위 변동
└── 클릭률 (CTR)

[분석 방법]
├── 블로그 플랫폼 내장 통계 API 활용
├── Google Search Console API 연동 (가능 시)
├── 네이버 서치어드바이저 API 연동 (가능 시)
└── WebFetch로 검색 결과 페이지 직접 확인
```

#### 4.4.2 피드백 루프 메커니즘

```
[자동 분석 사이클]

콘텐츠 발행 → 24h 대기 → 초기 성과 수집
    │
    ├── 고성과 콘텐츠 → 패턴 추출 → 전략에 반영
    │   ├── 제목 패턴 저장
    │   ├── 키워드 조합 저장
    │   ├── 콘텐츠 구조 저장
    │   └── → workspace/insights/winning_patterns.md
    │
    ├── 저성과 콘텐츠 → 원인 분석 → 개선점 도출
    │   ├── 키워드 경쟁도 너무 높았는지
    │   ├── 콘텐츠 품질 문제인지
    │   ├── 타이밍 문제인지
    │   └── → workspace/insights/improvement_notes.md
    │
    └── 전략 업데이트 → 다음 콘텐츠에 반영
        └── → workspace/strategy/current_strategy.md 갱신
```

### 4.5 로컬 파일 관리 시스템

모든 전략, 조사 내용, 콘텐츠, 분석 결과를 체계적으로 로컬 파일로 관리한다.

#### 4.5.1 디렉토리 구조

```
workspace/
├── config/                          # 설정
│   ├── platforms.json               # 블로그 플랫폼 설정
│   ├── agent_config.json            # 에이전트 동작 설정
│   └── credentials.env.example      # API 키 템플릿
│
├── strategy/                        # 전략 문서
│   ├── master_plan.md               # 전체 마케팅 마스터 플랜
│   ├── current_strategy.md          # 현재 적용 중인 전략
│   ├── content_calendar.md          # 콘텐츠 발행 캘린더
│   ├── keyword_map.md               # 키워드 매핑 문서
│   └── strategy_history/            # 전략 변경 이력
│       ├── v1_initial.md
│       └── v2_optimized.md
│
├── research/                        # 조사 자료
│   ├── keywords/                    # 키워드 리서치 결과
│   │   ├── primary_keywords.md
│   │   ├── long_tail_keywords.md
│   │   └── trending_keywords.md
│   ├── benchmarks/                  # 경쟁 콘텐츠 분석
│   │   ├── top_performers.md
│   │   ├── content_patterns.md
│   │   └── title_formulas.md
│   ├── trends/                      # 트렌드 리서치
│   │   └── {date}_trends.md
│   └── sources/                     # 참고 자료
│       └── {topic_id}/
│
├── drafts/                          # 콘텐츠 초안
│   └── {topic_id}/
│       ├── outline.md               # 아웃라인
│       ├── draft_ko.md              # 한국어 초안
│       ├── draft_en.md              # 영어 초안
│       ├── final_ko.md              # 한국어 최종본
│       ├── final_en.md              # 영어 최종본
│       └── metadata.json            # 메타데이터
│
├── published/                       # 발행된 콘텐츠
│   └── {topic_id}/
│       ├── metadata.json            # 발행 정보
│       ├── ko_published.json        # 한국어 발행 결과
│       └── en_published.json        # 영어 발행 결과
│
├── analytics/                       # 분석 데이터
│   ├── daily/                       # 일별 성과
│   │   └── {date}.json
│   ├── reports/                     # 분석 리포트
│   │   └── {date}_report.md
│   └── rankings/                    # 검색 순위 추적
│       └── {date}_rankings.json
│
├── insights/                        # 인사이트 & 학습 기록
│   ├── winning_patterns.md          # 성공 패턴 모음
│   ├── improvement_notes.md         # 개선 사항 노트
│   ├── marketing_techniques.md      # 마케팅 기법 라이브러리
│   ├── seo_playbook.md              # SEO 플레이북
│   └── content_templates/           # 검증된 콘텐츠 템플릿
│       ├── how_to_template.md
│       ├── listicle_template.md
│       └── comparison_template.md
│
├── logs/                            # 실행 로그
│   ├── execution_log.md             # 전체 실행 이력
│   ├── errors.md                    # 에러 기록
│   └── decisions.md                 # 의사결정 기록
│
└── progress/                        # 진행 상황
    ├── dashboard.md                 # 전체 대시보드
    ├── task_queue.json              # 작업 큐
    └── completion_tracker.json      # 완료 추적
```

#### 4.5.2 Planning Tool 연동 (Manus 스타일)

에이전트가 자체적으로 계획을 세우고, 실행하고, 추적하는 로컬 기반 플래닝 시스템.

```json
// workspace/progress/task_queue.json
{
  "session_id": "2024-01-15-001",
  "goal": "AI SaaS 분야 콘텐츠 20개 작성",
  "total_target": 20,
  "completed": 7,
  "in_progress": 1,
  "phases": [
    {
      "phase": "research",
      "status": "completed",
      "tasks": [
        {"id": "R1", "task": "키워드 리서치", "status": "done"},
        {"id": "R2", "task": "경쟁 콘텐츠 분석", "status": "done"},
        {"id": "R3", "task": "트렌드 조사", "status": "done"}
      ]
    },
    {
      "phase": "strategy",
      "status": "completed",
      "tasks": [
        {"id": "S1", "task": "콘텐츠 캘린더 수립", "status": "done"},
        {"id": "S2", "task": "키워드 매핑", "status": "done"}
      ]
    },
    {
      "phase": "content_creation",
      "status": "in_progress",
      "tasks": [
        {"id": "C1", "task": "콘텐츠 #1: AI 챗봇 구축 가이드", "status": "published"},
        {"id": "C2", "task": "콘텐츠 #2: ChatGPT vs Claude 비교", "status": "published"},
        {"id": "C8", "task": "콘텐츠 #8: RAG 시스템 구축하기", "status": "writing"},
        {"id": "C9", "task": "콘텐츠 #9: AI 에이전트 트렌드 2025", "status": "queued"}
      ]
    },
    {
      "phase": "optimization",
      "status": "recurring",
      "tasks": [
        {"id": "O1", "task": "발행 콘텐츠 성과 분석", "status": "scheduled"},
        {"id": "O2", "task": "전략 재검토 및 수정", "status": "scheduled"}
      ]
    }
  ],
  "next_action": "콘텐츠 #8 초안 작성 계속",
  "updated_at": "2024-01-15T14:30:00Z"
}
```

---

## 5. 에이전트 아키텍처 (Agent Architecture)

### 5.1 Claude Code 네이티브 구현

MarketClaw는 Claude Code의 기능만으로 구현된다. 별도 프레임워크나 외부 오케스트레이션 없음.

#### 5.1.1 구성 요소

```
.claude/
├── CLAUDE.md                        # 프로젝트 컨텍스트 & 브랜드 가이드
├── settings.json                    # hooks 설정
├── agents/                          # 서브 에이전트 정의
│   ├── researcher/SKILL.md          # 트렌드 리서치 에이전트
│   ├── strategist/SKILL.md          # 전략 수립 에이전트
│   ├── writer-ko/SKILL.md           # 한국어 콘텐츠 작성 에이전트
│   ├── writer-en/SKILL.md           # 영어 콘텐츠 작성 에이전트
│   ├── seo-optimizer/SKILL.md       # SEO 최적화 에이전트
│   ├── publisher/SKILL.md           # 블로그 발행 에이전트
│   ├── analyst/SKILL.md             # 트래픽 분석 에이전트
│   └── planner/SKILL.md             # 작업 계획 & 추적 에이전트
│
├── skills/                          # 실행 가능 스킬
│   ├── run-campaign/SKILL.md        # 전체 캠페인 실행
│   ├── create-content/SKILL.md      # 단일 콘텐츠 생성
│   ├── analyze-performance/SKILL.md # 성과 분석
│   └── update-strategy/SKILL.md     # 전략 업데이트
│
└── rules/                           # 규칙 파일
    ├── writing-style-ko.md          # 한국어 작문 규칙
    ├── writing-style-en.md          # 영어 작문 규칙
    ├── seo-checklist.md             # SEO 체크리스트
    └── quality-standards.md         # 품질 기준
```

#### 5.1.2 에이전트 역할 및 도구

| 에이전트 | 역할 | 사용 도구 |
|---------|------|----------|
| **Researcher** | 트렌드 조사, 키워드 발굴, 경쟁 분석 | WebSearch, WebFetch, Read, Write |
| **Strategist** | 마케팅 전략 수립, 콘텐츠 캘린더 관리 | Read, Write, Edit |
| **Writer-KO** | 한국어 콘텐츠 작성 (네이버/티스토리 최적화) | Read, Write, Edit, WebSearch |
| **Writer-EN** | 영어 콘텐츠 작성 (Medium/WP 최적화) | Read, Write, Edit, WebSearch |
| **SEO-Optimizer** | SEO 분석 및 콘텐츠 최적화 | Read, Edit, WebSearch, WebFetch |
| **Publisher** | 블로그 플랫폼에 콘텐츠 발행 | Bash, Read, Write |
| **Analyst** | 트래픽 분석, 성과 리포트 생성 | Bash, Read, Write, WebFetch |
| **Planner** | 작업 계획, 진행 추적, 의사결정 | Read, Write, Edit |

#### 5.1.3 메인 오케스트레이션 루프

```
┌─────────────────────────────────────────────────────┐
│                  MarketClaw Main Loop                │
│                                                     │
│  Input: {분야, 목표 콘텐츠 수, 언어, 플랫폼}          │
│                                                     │
│  while (완성된_콘텐츠 < 목표_콘텐츠_수):              │
│    │                                                │
│    ├─ [Phase 1] Planner: 다음 작업 결정              │
│    │   └── progress/task_queue.json 읽기 & 갱신      │
│    │                                                │
│    ├─ [Phase 2] Researcher: 최신 정보 조사           │
│    │   ├── WebSearch: 트렌드, 뉴스, 핫토픽           │
│    │   ├── WebFetch: 인기 콘텐츠 상세 분석            │
│    │   └── research/ 에 결과 저장                    │
│    │                                                │
│    ├─ [Phase 3] Strategist: 전략 수립/갱신            │
│    │   ├── 리서치 결과 + 이전 성과 데이터 분석         │
│    │   ├── 콘텐츠 주제 & 타입 결정                    │
│    │   └── strategy/ 갱신                           │
│    │                                                │
│    ├─ [Phase 4] Writer(s): 콘텐츠 작성               │
│    │   ├── Writer-KO: 한국어 버전 작성 (동시)         │
│    │   ├── Writer-EN: 영어 버전 작성 (동시)           │
│    │   └── drafts/ 에 저장                          │
│    │                                                │
│    ├─ [Phase 5] SEO-Optimizer: 최적화               │
│    │   ├── SEO 점수 측정 & 개선                      │
│    │   └── drafts/ → final 버전 갱신                 │
│    │                                                │
│    ├─ [Phase 6] Publisher: 발행                      │
│    │   ├── 지정된 플랫폼에 자동 발행                   │
│    │   └── published/ 에 결과 기록                    │
│    │                                                │
│    ├─ [Phase 7] Analyst: 성과 분석 (주기적)           │
│    │   ├── 기존 발행 콘텐츠 트래픽 확인               │
│    │   ├── 성공/실패 패턴 추출                        │
│    │   └── insights/ 에 인사이트 저장                 │
│    │                                                │
│    └─ [Phase 8] 학습 & 반영                          │
│        ├── insights/ 읽어서 다음 전략에 반영           │
│        ├── marketing_techniques.md 업데이트           │
│        └── 다음 사이클로 반복                         │
│                                                     │
│  End: 목표 달성 → 최종 리포트 생성                     │
└─────────────────────────────────────────────────────┘
```

### 5.2 실행 방식

#### 5.2.1 대화형 실행

```bash
# Claude Code 실행 후 스킬 호출
> /run-campaign 분야:AI_SaaS 목표:20 언어:ko,en 플랫폼:naver,medium
```

#### 5.2.2 자율 실행 (Headless)

```bash
# 백그라운드 자율 실행
claude -p "$(cat <<'EOF'
MarketClaw 캠페인을 실행합니다.

분야: AI SaaS
목표: 20개 콘텐츠
언어: 한국어, 영어
플랫폼: 네이버블로그, Medium

workspace/progress/task_queue.json을 확인하고,
남은 작업을 순서대로 실행하세요.
모든 콘텐츠가 완성될 때까지 반복합니다.
EOF
)" \
  --allowedTools "Read,Write,Edit,Bash,WebSearch,WebFetch,Task,Glob,Grep" \
  --output-format stream-json
```

#### 5.2.3 이어하기 (Resume)

```bash
# 중단된 세션 이어서 실행
claude --resume $SESSION_ID -p "이전 진행 상황을 확인하고 남은 작업을 계속 실행하세요."
```

### 5.3 Hooks 설정

```json
// .claude/settings.json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cat workspace/progress/dashboard.md 2>/dev/null || echo '새 세션 시작'"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo '[MarketClaw] 파일 저장됨: '$(echo $TOOL_INPUT | jq -r '.file_path')"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '[MarketClaw] 세션 종료. 진행 상황이 workspace/progress/에 저장되었습니다.'"
          }
        ]
      }
    ]
  }
}
```

### 5.4 CLAUDE.md 프로젝트 컨텍스트

```markdown
# MarketClaw - Blog Content Marketing Agent

## 역할
당신은 MarketClaw, 자율형 블로그 콘텐츠 마케팅 에이전트입니다.
사용자가 지정한 분야에 대해 최고의 블로그 콘텐츠를 작성하고 발행합니다.

## 핵심 원칙
1. 항상 workspace/progress/task_queue.json을 확인하여 현재 상태 파악
2. 모든 조사, 전략, 콘텐츠는 workspace/ 아래에 체계적으로 저장
3. 이전 성과 데이터(workspace/insights/)를 반드시 참고하여 전략 개선
4. 한국어와 영어 콘텐츠는 단순 번역이 아닌 각 시장에 최적화
5. 목표 콘텐츠 수 달성까지 멈추지 않고 반복 실행

## 작업 순서
1. workspace/progress/task_queue.json 확인
2. 다음 할 작업 파악
3. 필요시 리서치 수행
4. 콘텐츠 작성 → SEO 최적화 → 발행
5. 진행 상황 업데이트
6. 다음 작업으로 이동

## 파일 구조
- workspace/config/: 설정 파일
- workspace/strategy/: 전략 문서
- workspace/research/: 조사 자료
- workspace/drafts/: 콘텐츠 초안
- workspace/published/: 발행된 콘텐츠
- workspace/analytics/: 분석 데이터
- workspace/insights/: 인사이트 & 학습 기록
- workspace/progress/: 진행 상황
```

---

## 6. 마케팅 기법 라이브러리 (Marketing Techniques Library)

에이전트가 학습하고 활용하는 콘텐츠 마케팅 기법들. `workspace/insights/marketing_techniques.md`에 지속 축적된다.

### 6.1 콘텐츠 바이럴 기법

#### 한국 시장 (네이버/티스토리)
| 기법 | 설명 | 예시 |
|------|------|------|
| **체험형 후기** | 직접 사용해본 듯한 리얼 후기 스타일 | "직접 써본 AI 챗봇 3개 솔직 후기" |
| **정보성 리스티클** | 숫자 + 정보 조합으로 클릭 유도 | "2025년 꼭 알아야 할 AI 도구 TOP 7" |
| **비교 분석** | A vs B 구도로 검색 트래픽 유입 | "ChatGPT vs Claude, 어떤 게 더 좋을까?" |
| **초보자 가이드** | 입문자 키워드로 대량 유입 | "AI 완전 초보를 위한 가이드 (2025)" |
| **트렌드 속보** | 최신 뉴스를 빠르게 정리 | "GPT-5 출시 임박? 알려진 정보 총정리" |
| **문제 해결형** | "~하는 방법" 검색 키워드 타겟 | "블로그 방문자 10배 늘리는 방법" |
| **큐레이션** | 여러 정보를 한곳에 모아 정리 | "이번 주 AI 업계 뉴스 모아보기" |
| **감성 스토리텔링** | 공감 유도 → 공유 확산 | "AI로 월 100만원 부수입 만든 이야기" |

#### 글로벌 시장 (Medium/WordPress/Dev.to)
| 기법 | 설명 | 예시 |
|------|------|------|
| **Data-Driven Insight** | 데이터 기반 인사이트 제공 | "We Analyzed 1000 AI Tools: Here's What We Found" |
| **Contrarian Take** | 통념에 반하는 주장으로 주목 | "Why Most AI Chatbots Will Fail in 2025" |
| **Ultimate Guide** | 포괄적 가이드로 SEO 장악 | "The Complete Guide to Building AI Agents" |
| **Tutorial/Walkthrough** | 단계별 튜토리얼 | "How to Build a RAG System in 30 Minutes" |
| **Industry Roundup** | 업계 동향 라운드업 | "The State of AI in 2025: Key Trends" |
| **Case Study** | 실제 사례 분석 | "How We Grew to 100K Users with AI Content" |
| **Tool Review** | 도구 리뷰 & 비교 | "I Tested 5 AI Writing Tools So You Don't Have To" |
| **Prediction/Forecast** | 예측 콘텐츠로 공유 유도 | "5 AI Predictions That Will Define 2026" |

### 6.2 SEO 최적화 기법

```
[온페이지 SEO]
├── 타이틀 태그 최적화 (60자 이내, 주요 키워드 포함)
├── 메타 디스크립션 (150자 이내, CTA 포함)
├── H1-H3 헤딩 구조화 (키워드 자연 삽입)
├── 키워드 밀도 1-2% 유지
├── LSI(잠재 의미 인덱싱) 키워드 활용
├── 이미지 ALT 텍스트 최적화
├── 내부 링크 3-5개 삽입
├── 외부 권위 링크 2-3개 삽입
└── URL 슬러그 최적화

[콘텐츠 SEO]
├── 검색 의도(Search Intent) 매칭
│   ├── Informational: 가이드, 설명
│   ├── Navigational: 특정 브랜드/서비스
│   ├── Transactional: 구매/사용 의도
│   └── Commercial: 비교/리뷰
├── E-E-A-T 기준 충족
│   ├── Experience: 체험 기반 콘텐츠
│   ├── Expertise: 전문성 있는 내용
│   ├── Authoritativeness: 권위 있는 출처
│   └── Trustworthiness: 신뢰할 수 있는 정보
├── 스키마 마크업 (FAQ, HowTo, Article)
├── Featured Snippet 최적화
└── People Also Ask 타겟팅
```

### 6.3 제목 작성 공식

에이전트가 활용하는 검증된 제목 공식들:

```
[숫자형]
- "N가지 ~하는 방법" / "N Ways to ~"
- "TOP N ~" / "The N Best ~"
- "~하기 위한 N단계" / "N Steps to ~"

[질문형]
- "~할 수 있을까?" / "Can You ~?"
- "왜 ~인가?" / "Why ~ ?"
- "~vs~, 뭐가 더 좋을까?" / "~ vs ~: Which Is Better?"

[방법형]
- "~하는 완벽 가이드" / "The Complete Guide to ~"
- "초보자를 위한 ~" / "~ for Beginners"
- "~하는 가장 쉬운 방법" / "The Easiest Way to ~"

[감성형]
- "~로 인생이 바뀐 이야기" / "How ~ Changed My Life"
- "~를 후회하지 않는 이유" / "Why I Don't Regret ~"
- "아무도 알려주지 않는 ~" / "What Nobody Tells You About ~"

[시의성]
- "2025년 최신 ~ 트렌드" / "~ Trends in 2025"
- "지금 당장 ~ 해야 하는 이유" / "Why You Should ~ Right Now"
- "~ 완전 총정리 (최신판)" / "The Ultimate ~ Roundup (Updated)"
```

---

## 7. 핵심 워크플로우 (Core Workflows)

### 7.1 캠페인 시작 워크플로우

```
사용자 입력 수신
    │
    ├── 1. 입력 파싱
    │   ├── 분야/서비스 추출
    │   ├── 목표 콘텐츠 수 확인
    │   ├── 언어 설정 (기본: ko + en)
    │   └── 플랫폼 설정 (기본: 전체 활성화)
    │
    ├── 2. 초기 환경 설정
    │   ├── workspace/ 디렉토리 구조 생성
    │   ├── config/ 설정 파일 초기화
    │   └── progress/task_queue.json 생성
    │
    ├── 3. Phase 0: 초기 리서치 (집중)
    │   ├── 분야 전반 조사 (3-5개 WebSearch)
    │   ├── 핵심 키워드 20-30개 발굴
    │   ├── 경쟁 블로그 5-10개 분석
    │   ├── 인기 콘텐츠 패턴 분석
    │   └── 결과 → research/ 저장
    │
    ├── 4. 전략 수립
    │   ├── 타겟 오디언스 정의
    │   ├── 키워드 우선순위 설정
    │   ├── 콘텐츠 주제 N개 도출
    │   ├── 콘텐츠 캘린더 작성
    │   └── 결과 → strategy/ 저장
    │
    └── 5. 메인 루프 시작
        └── → 7.2 콘텐츠 생산 루프
```

### 7.2 콘텐츠 생산 루프 (1 사이클)

```
[사이클 시작]
    │
    ├── 1. 컨텍스트 로딩
    │   ├── task_queue.json 읽기
    │   ├── current_strategy.md 읽기
    │   ├── winning_patterns.md 읽기 (있으면)
    │   └── 다음 작업 결정
    │
    ├── 2. 토픽별 심층 리서치
    │   ├── WebSearch: 해당 주제 최신 정보 5-10개
    │   ├── WebFetch: 핵심 자료 2-3개 상세 분석
    │   ├── 인기 콘텐츠 참고 (벤치마크)
    │   └── → research/sources/{topic_id}/ 저장
    │
    ├── 3. 아웃라인 작성
    │   ├── 벤치마크 참고하여 구조 설계
    │   ├── 키워드 배치 계획
    │   └── → drafts/{topic_id}/outline.md
    │
    ├── 4. 콘텐츠 작성 (한/영 병렬)
    │   ├── [한국어] 네이버 최적화 문체로 작성
    │   │   ├── 2,000-4,000자 분량
    │   │   ├── 친근하고 정보성 있는 톤
    │   │   ├── 이미지 위치 마커 삽입
    │   │   └── → drafts/{topic_id}/draft_ko.md
    │   │
    │   └── [영어] Medium 최적화 문체로 작성
    │       ├── 1,500-3,000 words
    │       ├── Direct, insightful tone
    │       ├── Data-driven approach
    │       └── → drafts/{topic_id}/draft_en.md
    │
    ├── 5. SEO 최적화
    │   ├── 제목 최적화 (3개 후보 생성 → 최적 선택)
    │   ├── 메타 디스크립션 작성
    │   ├── 키워드 밀도 확인/조정
    │   ├── 헤딩 구조 최적화
    │   └── → drafts/{topic_id}/final_{lang}.md
    │
    ├── 6. 발행
    │   ├── 한국어 → 네이버/티스토리 API 발행
    │   ├── 영어 → Medium/WordPress API 발행
    │   ├── 발행 URL & ID 기록
    │   └── → published/{topic_id}/metadata.json
    │
    ├── 7. 진행 상황 업데이트
    │   ├── task_queue.json 갱신
    │   ├── dashboard.md 갱신
    │   ├── completion_tracker.json 갱신
    │   └── execution_log.md에 기록 추가
    │
    └── 8. 다음 사이클 OR 분석 사이클
        ├── 매 3개 콘텐츠마다 → 성과 분석 사이클 실행
        └── 그 외 → 다음 콘텐츠로 이동
```

### 7.3 분석 & 학습 사이클

```
[분석 사이클] (매 3개 콘텐츠 발행 후 실행)
    │
    ├── 1. 성과 데이터 수집
    │   ├── 각 플랫폼 API로 조회수, 좋아요, 댓글 수집
    │   ├── WebFetch로 검색 순위 확인
    │   └── → analytics/daily/{date}.json
    │
    ├── 2. 패턴 분석
    │   ├── 고성과 콘텐츠 공통점 추출
    │   │   ├── 제목 패턴
    │   │   ├── 콘텐츠 길이
    │   │   ├── 키워드 조합
    │   │   ├── 발행 시간
    │   │   └── 콘텐츠 타입
    │   │
    │   ├── 저성과 콘텐츠 원인 분석
    │   │   ├── 키워드 경쟁도 과다?
    │   │   ├── 콘텐츠 품질 미흡?
    │   │   ├── 타이밍 부적절?
    │   │   └── 주제 수요 부족?
    │   │
    │   └── → insights/winning_patterns.md 갱신
    │       → insights/improvement_notes.md 갱신
    │
    ├── 3. 전략 수정
    │   ├── 성과 기반 키워드 우선순위 재조정
    │   ├── 콘텐츠 타입 비율 조정
    │   ├── 작성 가이드라인 업데이트
    │   └── → strategy/current_strategy.md 갱신
    │
    └── 4. 기법 라이브러리 업데이트
        ├── 새로운 성공 패턴 추가
        ├── 비효과적 기법 비활성화
        └── → insights/marketing_techniques.md 갱신
```

---

## 8. 데이터 흐름 (Data Flow)

```
                    ┌──────────────┐
                    │  사용자 입력   │
                    │ 분야, 목표수   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Planner    │ ←── workspace/progress/
                    │  작업 계획    │ ──→ task_queue.json
                    └──────┬───────┘
                           │
              ┌────────────▼────────────┐
              │       Researcher        │ ←── WebSearch, WebFetch
              │   트렌드 & 키워드 조사    │ ──→ workspace/research/
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │       Strategist        │ ←── research/, insights/
              │       전략 수립          │ ──→ workspace/strategy/
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │    Writer-KO + EN       │ ←── strategy/, research/
              │     콘텐츠 작성          │ ──→ workspace/drafts/
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │     SEO-Optimizer       │ ←── drafts/
              │      SEO 최적화         │ ──→ workspace/drafts/final_*
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │       Publisher         │ ←── drafts/final_*
              │       블로그 발행        │ ──→ workspace/published/
              └────────────┬────────────┘     + Blog Platform APIs
                           │
              ┌────────────▼────────────┐
              │        Analyst          │ ←── published/, Blog APIs
              │       성과 분석          │ ──→ workspace/analytics/
              └────────────┬────────────┘     workspace/insights/
                           │
                    ┌──────▼───────┐
                    │  피드백 루프   │ ──→ strategy/ 갱신
                    │  전략 진화    │ ──→ insights/ 축적
                    └──────┬───────┘
                           │
                     ┌─────▼─────┐
                     │ 다음 사이클 │ ──→ Planner로 복귀
                     └───────────┘
```

---

## 9. 기술 요구사항 (Technical Requirements)

### 9.1 필수 환경

| 항목 | 요구사항 |
|------|---------|
| **Claude Code** | 최신 버전 (에이전트, 스킬, 훅 지원) |
| **Node.js** | v18+ (MCP 서버 실행용) |
| **Python** | 3.10+ (보조 스크립트용, 선택) |
| **Git** | 버전 관리 |
| **인터넷** | WebSearch/WebFetch 사용 |

### 9.2 API 키 (플랫폼별, 선택적)

```bash
# .env 또는 시스템 환경변수로 설정
NAVER_BLOG_CLIENT_ID=       # 네이버 블로그 API
NAVER_BLOG_CLIENT_SECRET=
TISTORY_ACCESS_TOKEN=        # 티스토리 API
MEDIUM_INTEGRATION_TOKEN=    # Medium API
WP_SITE_URL=                 # WordPress 사이트
WP_USERNAME=
WP_APP_PASSWORD=
DEVTO_API_KEY=               # Dev.to API
```

### 9.3 MCP 서버 (선택적 확장)

```bash
# 분석 도구
claude mcp add --transport stdio google-analytics -- npx -y ga-mcp-server
claude mcp add --transport stdio search-console -- npx -y gsc-mcp-server

# 콘텐츠 관리
claude mcp add --transport stdio notion -- npx -y @notionhq/mcp-server

# 소셜 미디어 (추후 확장)
claude mcp add --transport stdio twitter -- npx -y twitter-mcp-server
```

---

## 10. 품질 기준 (Quality Standards)

### 10.1 콘텐츠 품질 체크리스트

```
[필수 기준]
□ 최소 글자수 충족 (한국어 2,000자 / 영어 1,500 words)
□ 제목에 주요 키워드 포함
□ H2 소제목 최소 3개 이상
□ 도입부 150자 이내에 핵심 가치 전달
□ CTA(Call-to-Action) 포함
□ 오탈자 및 문법 오류 없음
□ 출처가 필요한 정보에 출처 표기
□ 검색 의도에 부합하는 내용

[SEO 기준]
□ 메타 디스크립션 작성
□ 키워드 밀도 1-2%
□ 내부 링크 2개 이상
□ 외부 권위 링크 1개 이상
□ 이미지 ALT 텍스트 (해당 시)
□ URL 슬러그 최적화

[바이럴 기준]
□ 클릭 유도 제목 (호기심 유발)
□ 공유하고 싶은 인사이트 포함
□ 실용적 가치 제공 (즉시 적용 가능한 정보)
□ 감정적 반응 유도 요소 (놀라움, 공감 등)
```

### 10.2 자체 품질 평가 점수

에이전트가 매 콘텐츠 작성 후 자체 평가:

```json
{
  "quality_score": {
    "relevance": 8,       // 주제 적합성 (1-10)
    "depth": 7,           // 내용 깊이 (1-10)
    "readability": 9,     // 가독성 (1-10)
    "seo_score": 8,       // SEO 최적화 (1-10)
    "viral_potential": 7, // 바이럴 가능성 (1-10)
    "overall": 7.8        // 종합 점수
  },
  "min_threshold": 6.0    // 이 이하면 재작성
}
```

---

## 11. 확장 로드맵 (Roadmap)

### Phase 1: MVP (핵심 기능)
- [x] 트렌드 리서치 & 키워드 발굴
- [x] 콘텐츠 작성 (한/영)
- [x] 로컬 파일 관리 시스템
- [x] 진행 상황 추적
- [ ] 블로그 발행 (네이버, Medium)
- [ ] 기본 SEO 최적화

### Phase 2: 자동화 강화
- [ ] 블로그 트래픽 분석 자동화
- [ ] 피드백 루프 & 전략 자동 진화
- [ ] 추가 플랫폼 연동 (티스토리, WordPress, Dev.to)
- [ ] 콘텐츠 캘린더 자동 관리
- [ ] 인기 콘텐츠 자동 벤치마킹

### Phase 3: 고도화
- [ ] MCP 서버 연동 (Google Analytics, Search Console)
- [ ] 소셜 미디어 자동 공유 (Twitter, LinkedIn)
- [ ] 이미지 자동 생성/삽입 (AI 이미지 생성)
- [ ] 멀티 캠페인 동시 운영
- [ ] 성과 대시보드 웹 UI

### Phase 4: 스케일업
- [ ] 다국어 확장 (일본어, 중국어 등)
- [ ] 이메일 뉴스레터 연동
- [ ] 커뮤니티 자동 참여 (Reddit, Quora 답변)
- [ ] 영상 콘텐츠 스크립트 자동 생성
- [ ] 팟캐스트 쇼노트 자동 생성

---

## 12. 성공 지표 (Success Metrics)

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| **콘텐츠 생산 속도** | 시간당 2-3개 | 발행 로그 타임스탬프 |
| **검색 1페이지 노출** | 발행 후 2주 내 30% | 검색 순위 추적 |
| **평균 조회수** | 콘텐츠당 500+ (1개월) | 플랫폼 통계 |
| **키워드 커버리지** | 타겟 키워드 80% 커버 | 키워드 매핑 대비 발행 비율 |
| **품질 점수** | 평균 7.0+ / 10 | 자체 품질 평가 |
| **전략 진화 횟수** | 10개 콘텐츠당 1회+ | 전략 변경 이력 |

---

## 13. 리스크 & 제약사항

### 13.1 기술적 제약

| 리스크 | 완화 방안 |
|--------|----------|
| 블로그 API 제한 (Rate Limit) | 발행 간격 조절, 큐 시스템 활용 |
| WebSearch/WebFetch 제한 | 캐싱, 우선순위 기반 조사 |
| Claude 컨텍스트 윈도우 한계 | 로컬 파일 기반 상태 관리, 세션 이어하기 |
| 네이버 블로그 API 제약 | 자동화 스크립트 대안 준비 |
| 세션 중단 | progress/ 기반 복구, --resume 활용 |

### 13.2 콘텐츠 리스크

| 리스크 | 완화 방안 |
|--------|----------|
| 부정확한 정보 | 복수 출처 교차 검증, 출처 표기 |
| 저품질 콘텐츠 | 자체 품질 평가, 최소 기준 미달 시 재작성 |
| 중복 콘텐츠 | 발행 이력 기반 중복 검사 |
| 저작권 이슈 | 참고만 하고 자체 작성, 직접 인용 시 출처 명시 |
| SEO 스팸 판정 | 자연스러운 키워드 배치, 과도한 최적화 지양 |

---

## 14. 부록

### 14.1 예시: 첫 실행 시나리오

```bash
$ claude

> /run-campaign 분야:AI_챗봇_SaaS 목표:10 언어:ko,en

[MarketClaw] 캠페인을 시작합니다.
├── 분야: AI 챗봇 SaaS
├── 목표: 10개 콘텐츠
├── 언어: 한국어 + 영어
└── 플랫폼: 네이버블로그, Medium

[Phase 0] 초기 리서치 시작...
├── "AI 챗봇 트렌드 2025" 검색 중...
├── "best AI chatbot platforms" 검색 중...
├── 네이버 인기 블로그 분석 중...
├── Medium Top Stories 분석 중...
└── ✓ 키워드 25개 발굴, 경쟁 콘텐츠 8개 분석 완료

[전략 수립]
├── 타겟 키워드 매핑 완료
├── 콘텐츠 캘린더 생성 (10개 주제)
│   1. "AI 챗봇 만들기 완벽 가이드" (How-to)
│   2. "ChatGPT vs Claude vs Gemini 비교" (비교분석)
│   3. "2025 AI 챗봇 트렌드 TOP 7" (리스티클)
│   ...
└── → workspace/strategy/content_calendar.md 저장

[콘텐츠 #1] 작성 시작...
├── 리서치: AI 챗봇 구축 최신 자료 수집
├── 아웃라인 작성 완료
├── 한국어 버전 작성 중... (3,200자)
├── 영어 버전 작성 중... (2,100 words)
├── SEO 최적화 완료 (점수: 8.2/10)
├── 네이버블로그 발행 ✓
├── Medium 발행 ✓
└── 진행: [1/10] ██░░░░░░░░ 10%

[콘텐츠 #2] 작성 시작...
...계속 반복...

[성과 분석] (3개 완료 후)
├── 콘텐츠 #1: 조회수 320, 좋아요 12
├── 콘텐츠 #2: 조회수 890, 좋아요 45 ⭐ 고성과
├── 콘텐츠 #3: 조회수 150, 좋아요 3
├── 인사이트: 비교 분석형 콘텐츠 성과 높음
└── 전략 수정: 비교 분석 비율 증가

...

[캠페인 완료]
├── 총 10개 콘텐츠 발행
├── 한국어 10개 + 영어 10개 = 20개 블로그 글
├── 평균 품질 점수: 7.6/10
├── 최고 성과: 콘텐츠 #2 (조회수 890)
└── 최종 리포트: workspace/analytics/reports/final_report.md
```

### 14.2 디렉토리 구조 요약

```
marketclaw/
├── docs/
│   └── prd.md                       # 이 문서
├── .claude/
│   ├── CLAUDE.md                    # 에이전트 컨텍스트
│   ├── settings.json                # 훅 & 권한 설정
│   ├── agents/                      # 서브에이전트 정의
│   ├── skills/                      # 실행 스킬 정의
│   └── rules/                       # 규칙 파일
├── workspace/                       # 런타임 데이터
│   ├── config/
│   ├── strategy/
│   ├── research/
│   ├── drafts/
│   ├── published/
│   ├── analytics/
│   ├── insights/
│   ├── logs/
│   └── progress/
├── scripts/                         # 실행 스크립트
│   ├── run_campaign.sh
│   └── publish/                     # 플랫폼별 발행 스크립트
└── README.md
```

---

*MarketClaw PRD v1.0 - 2025.02*
*"잠자는 동안에도 쉬지 않고 일하는 콘텐츠 마케터"*
