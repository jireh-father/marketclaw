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

[Phase 5: 이미지 처리]
    - 콘텐츠 내 [IMAGE: 설명] 마커 분석
    - Unsplash/Pexels API로 관련 무료 이미지 검색
    - 적합한 이미지 없으면 AI 생성 (DALL-E 3 / Stable Diffusion)
    - 생성된 이미지 품질 자체 검증 (텍스트 깨짐, 부자연스러움 체크)
    - 이미지 URL/경로를 콘텐츠에 삽입
    - ALT 텍스트 최적화 (SEO + 접근성)
    → workspace/drafts/{topic_id}/images/
    → workspace/drafts/{topic_id}/final_{lang}.md (이미지 삽입 버전)

[Phase 6: 휴먼라이크 검증]
    - Content-Verifier 에이전트가 독립적으로 검증
    - AI 작성 패턴 감지 (뻔한 도입부, 균일한 구조, AI 버즈워드)
    - 개인 관점/감정 표현 충분한지 확인
    - 구어체 비율, 문단 길이 변동성 측정
    - 팩트체크 (주요 수치/사실 WebSearch로 교차 검증)
    - 이미지 적절성 검증 (콘텐츠 맥락과 일치하는지)
    - PASS/REVISE/FAIL 판정
    → workspace/drafts/{topic_id}/verification.json

[Phase 7: 발행]
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
│       ├── metadata.json            # 메타데이터
│       ├── verification.json        # 검증 결과 (Content-Verifier)
│       └── images/                  # 이미지 파일
│           ├── cover.png            # 커버/썸네일 이미지
│           ├── body_001.png         # 본문 이미지
│           └── image_verification.json  # 이미지 검증 결과
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
│   ├── content-verifier/SKILL.md    # 콘텐츠 검증 에이전트 (휴먼라이크 + 팩트체크)
│   ├── image-manager/SKILL.md       # 이미지 수집/생성/검증 에이전트
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
| **Content-Verifier** | 휴먼라이크 검증, 팩트체크, AI감지 방지 | Read, Write, Edit, WebSearch |
| **Image-Manager** | 이미지 검색/수집/AI생성/검증 | WebSearch, WebFetch, Bash, Read, Write |
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
│    ├─ [Phase 5.5] Image-Manager: 이미지 처리         │
│    │   ├── 콘텐츠 내 [IMAGE] 마커 분석               │
│    │   ├── 무료 이미지 검색 (Unsplash/Pexels)        │
│    │   ├── 필요시 AI 이미지 생성 (DALL-E/SD)         │
│    │   ├── 생성된 이미지 자체 품질 검증               │
│    │   └── 이미지 URL/경로를 콘텐츠에 삽입            │
│    │                                                │
│    ├─ [Phase 5.7] Content-Verifier: 검증             │
│    │   ├── 휴먼라이크 검증 (AI 작성 티 감지)          │
│    │   ├── 팩트체크 (사실 정확성 확인)                │
│    │   ├── 이미지 적절성 검증                         │
│    │   ├── PASS → Publisher로 이동                   │
│    │   ├── REVISE → Writer에게 수정 지시 후 재검증    │
│    │   └── FAIL → 로그 기록 후 스킵                  │
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

### 6.2 휴먼라이크 작성 전략 (Human-Like Writing)

AI가 작성했다는 티가 나면 독자 신뢰도와 SEO 모두 망한다. MarketClaw는 **사람이 직접 쓴 것처럼 자연스러운 글**을 생산하는 것을 최우선 원칙으로 둔다.

#### 6.2.1 AI 글 특징 (반드시 피해야 할 것)

```
[AI가 쓴 티가 나는 패턴 - 절대 금지]

1. 뻔한 도입부
   ✗ "오늘날 빠르게 변화하는 디지털 환경에서..."
   ✗ "In today's rapidly evolving landscape..."
   ✗ "~에 대해 알아보겠습니다"
   ✗ "Let's dive into..."

2. 과도하게 정돈된 구조
   ✗ 모든 문단이 정확히 같은 길이
   ✗ 매 섹션마다 동일한 패턴 반복
   ✗ 너무 깔끔한 전환어 (Furthermore, Moreover, Additionally)
   ✗ 한국어에서 "또한", "더불어", "아울러" 연속 사용

3. 감정 없는 서술
   ✗ 지나치게 중립적이고 객관적인 톤만 유지
   ✗ 개인 경험이나 의견이 전혀 없음
   ✗ "~것으로 알려져 있습니다", "~라고 할 수 있습니다" 반복

4. 단어 선택의 문제
   ✗ "혁신적인", "획기적인", "강력한" 등 AI 선호 형용사 남발
   ✗ "Revolutionize", "Cutting-edge", "Leverage", "Harness" 남발
   ✗ 같은 문장 구조가 3번 이상 연속

5. 리스트 항목의 균일성
   ✗ 모든 불릿 포인트가 비슷한 길이와 구조
   ✗ 항목마다 "~합니다", "~됩니다" 로 동일하게 끝남
```

#### 6.2.2 휴먼라이크 작성 원칙

```
[사람처럼 쓰는 핵심 기법]

1. 불완전함을 의도적으로 남기기
   ✓ 문단 길이를 일부러 불규칙하게 (2줄, 5줄, 1줄, 4줄...)
   ✓ 가끔 짧은 한 줄 문장으로 임팩트 ("진짜다.", "It works.")
   ✓ 리스트 항목도 길이 불균일하게
   ✓ 완벽한 문법보다 자연스러운 구어체 섞기

2. 개인적 관점 삽입 (페르소나)
   ✓ "직접 써봤는데 솔직히 놀랐다"
   ✓ "처음엔 반신반의했는데..."
   ✓ "I was skeptical at first, but..."
   ✓ "Here's what surprised me:"
   ✓ 구체적인 체험 디테일 (날짜, 상황, 감정)

3. 대화하는 듯한 톤
   ✓ 독자에게 직접 말 걸기 ("이거 아셨나요?", "You know what?")
   ✓ 수사적 질문 활용 ("근데 진짜 그럴까?")
   ✓ 구어체 표현 자연스럽게 섞기
   ✓ 한국어: "~거든요", "~잖아요", "~더라고요" 등 말투 변화
   ✓ 영어: contractions (don't, isn't, I've), 구어 표현

4. 정보의 비균일 배치
   ✓ 핵심 인사이트를 예상치 못한 위치에 배치
   ✓ 때로는 결론부터, 때로는 이야기부터
   ✓ "아, 그리고 하나 더" 같은 추가 정보 패턴
   ✓ 완벽한 서론-본론-결론이 아닌 자연스러운 흐름

5. 감정적 리액션과 솔직한 의견
   ✓ "솔직히 이건 좀 별로였다"
   ✓ "이 부분은 정말 미쳤다고 생각한다"
   ✓ "Honestly, this blew my mind"
   ✓ "Not gonna lie, I expected more"
   ✓ 장점과 단점을 솔직하게 (장점만 나열하면 AI 티 남)

6. 구체적 디테일로 신뢰성 확보
   ✓ 추상적 서술 대신 구체적 수치 ("3일 써봤는데 응답률 23% 올랐다")
   ✓ 실제 스크린샷 위치 표시 ("[IMAGE: 실제 대시보드 캡처]")
   ✓ 비교 시 구체적 기준 명시 ("가격 기준으로 비교하면...")
   ✓ 시간적 맥락 ("지난 주에 업데이트된 버전 기준으로")
```

#### 6.2.3 언어별 휴먼라이크 전략

**한국어 - 블로그 감성 살리기**
```
[네이버/티스토리 블로거 페르소나]

톤 변화 패턴:
  "요즘 ~ 때문에 고민인 분들 많으시죠?"        (공감 유도)
  "저도 처음에 똑같은 고민을 했거든요."          (경험 공유)
  "그래서 직접 이것저것 써보면서 비교해봤습니다." (체험 강조)
  "결론부터 말하면, ~ 가 압도적이었어요."        (결론 선제)
  "근데 단점도 있어요. 솔직하게 말할게요."       (솔직함)

금지 패턴:
  ✗ 매 문단 "~입니다" 로 끝내기
  ✗ "이러한", "이와 같은", "상기" 등 논문투
  ✗ 감정 표현 없이 나열만 하기
  ✗ 모든 제품을 좋게만 평가하기

필수 요소:
  ✓ 최소 2-3곳에서 톤 변화 (진지→유머→진지)
  ✓ 개인 경험 에피소드 1-2개
  ✓ "~거든요", "~더라고요" 등 구어체 30% 이상
  ✓ 가끔 맞춤법 수준의 자연스러운 표현 (띄어쓰기 변형 등)
```

**영어 - 오피니언 블로거 페르소나**
```
[Medium/WordPress 블로거 페르소나]

톤 변화 패턴:
  "I've been using ~ for the past month."     (경험 시작)
  "Let me be real with you —"                  (솔직한 전환)
  "Here's the thing nobody talks about:"       (인사이트)
  "Is it perfect? No. But here's why I..."     (균형잡힌 평가)
  "Look, if you're on a budget, skip this."    (직설적 조언)

금지 패턴:
  ✗ "In conclusion" 로 끝내기
  ✗ "It is important to note that" 반복
  ✗ 모든 문장을 같은 길이로
  ✗ Passive voice 과다 사용

필수 요소:
  ✓ 1인칭 시점 유지 (I, my, we)
  ✓ Contractions 자연스럽게 사용
  ✓ 최소 1개의 anecdote나 story
  ✓ 독자에게 직접 말 걸기 (you, your)
  ✓ Hedging 줄이기 ("seems to", "might be" 최소화)
```

#### 6.2.4 콘텐츠 검증 에이전트 (Content Verifier)

작성된 콘텐츠가 발행 전에 반드시 거쳐야 하는 **독립 검증 게이트**. Writer와 SEO-Optimizer와 완전히 분리된 제3의 에이전트가 객관적으로 평가한다.

```
[검증 에이전트 역할]

                Writer-KO/EN
                     │
                     ▼
              SEO-Optimizer
                     │
                     ▼
            ┌────────────────┐
            │Content Verifier│ ← 독립 검증 게이트
            │   (검증 에이전트)  │
            └───────┬────────┘
                    │
           ┌───────┼───────┐
           │       │       │
         PASS    REVISE   FAIL
           │       │       │
           ▼       ▼       ▼
       Publisher  Writer   로그 기록
                  재작성    & 스킵
```

**검증 체크리스트:**

```json
{
  "verification_result": {
    "human_likeness": {
      "score": 8,
      "checks": {
        "no_ai_opener": true,
        "varied_paragraph_lengths": true,
        "personal_voice_present": true,
        "conversational_tone": true,
        "no_repetitive_structure": true,
        "emotional_reactions_included": true,
        "specific_details_present": true,
        "natural_transitions": true,
        "imperfection_intentional": true,
        "no_ai_buzzwords": true
      },
      "flagged_sentences": [
        {"line": 23, "issue": "AI투 도입부", "suggestion": "개인 에피소드로 교체"},
        {"line": 45, "issue": "'Furthermore' 사용", "suggestion": "삭제하거나 구어체로"}
      ]
    },
    "factual_accuracy": {
      "score": 9,
      "unverified_claims": [],
      "sources_checked": 3
    },
    "seo_compliance": {
      "score": 8,
      "issues": []
    },
    "overall_verdict": "PASS",
    "revision_required": false
  }
}
```

**검증 기준:**

| 항목 | 기준 | PASS | REVISE | FAIL |
|------|------|:---:|:---:|:---:|
| **AI 감지 점수** | AI 작성 티가 나는 정도 | 2점 이하 | 3-5점 | 6점 이상 |
| **휴먼라이크** | 사람이 쓴 듯한 자연스러움 | 8점 이상 | 5-7점 | 4점 이하 |
| **개인 관점** | 페르소나 경험/의견 포함 | 3개 이상 | 1-2개 | 0개 |
| **구어체 비율** | 전체 대비 자연스러운 구어체 | 25%+ | 10-25% | 10% 미만 |
| **구조 다양성** | 문단/리스트 길이 변동 | CV 30%+ | CV 15-30% | CV 15% 미만 |
| **감정 표현** | 솔직한 반응, 감정 포함 | 5회+ | 2-4회 | 1회 이하 |
| **전환어 자연스러움** | AI 전환어 패턴 회피 | 0개 감지 | 1-2개 | 3개 이상 |
| **사실 정확성** | 검증 가능한 정보 정확도 | 100% | 95%+ | 95% 미만 |

> **핵심 원칙**: "이 글을 읽은 사람 10명 중 10명이 사람이 쓴 거라고 확신할 수 있어야 PASS"

### 6.3 이미지 전략 (Image Strategy)

블로그 콘텐츠에서 이미지는 체류 시간, 공유율, SEO 순위에 직접 영향을 준다. MarketClaw는 이미지를 단순 장식이 아닌 **전략적 도구**로 활용한다.

#### 6.3.1 이미지 소싱 우선순위

```
[이미지 확보 방법 - 우선순위]

1순위: 무료 스톡 이미지 검색
   ├── Unsplash API (무료, 고품질, 상업 이용 가능)
   ├── Pexels API (무료, 고품질, API 지원)
   ├── Pixabay API (무료, 다양한 종류)
   └── 검색 키워드: 콘텐츠 주제 + 분위기 키워드 조합

2순위: AI 이미지 생성
   ├── DALL-E 3 API (OpenAI) - 고품질, 텍스트 이해 우수
   ├── Stable Diffusion API - 오픈소스, 커스터마이징 가능
   └── 생성 시나리오:
       ├── 스톡에 적합한 이미지 없을 때
       ├── 브랜드 특화 인포그래픽 필요 시
       ├── 추상적 개념 시각화 필요 시
       └── 썸네일/커버 이미지 제작 시

3순위: 웹 이미지 수집 (라이선스 확인 필수)
   ├── Creative Commons 라이선스 이미지
   ├── WebFetch로 공식 제품 이미지 (보도자료용)
   └── 반드시 출처 표기
```

#### 6.3.2 이미지 배치 전략

```
[콘텐츠 내 이미지 배치 규칙]

필수 이미지:
  ✓ 커버/썸네일 이미지 (1개) - 클릭률 직접 영향
  ✓ 본문 중간 이미지 (2-4개) - 가독성 & 체류시간
  ✓ 스크린샷/예시 이미지 - 신뢰도 향상

배치 간격:
  ✓ 300-500자(한국어) / 200-300 words(영어) 마다 1개
  ✓ 긴 텍스트 블록 사이에 시각적 브레이크로 삽입
  ✓ H2 소제목 바로 아래에 관련 이미지 배치

플랫폼별 최적화:
  네이버 블로그: 이미지 크게 (가로 최대), 텍스트 사이사이 배치
  티스토리: 커버 이미지 필수, 본문 이미지 중심 정렬
  Medium: 고해상도, 와이드 이미지, 캡션 적극 활용
  WordPress: Featured Image 필수, 본문 내 반응형 이미지
  Dev.to: 커버 이미지 + 코드 스크린샷 위주
```

#### 6.3.3 AI 생성 이미지 검증

AI로 생성한 이미지는 **반드시 자체 검증**을 거친다.

```
[AI 이미지 검증 체크리스트]

1. 텍스트 품질 검증
   □ 이미지 내 텍스트가 깨지지 않았는지 (AI 이미지 최대 약점)
   □ 철자가 정확한지
   □ 텍스트가 필요없는 이미지면 텍스트 없이 생성했는지

2. 시각적 품질 검증
   □ 손가락/신체 비율이 자연스러운지 (인물 이미지)
   □ 배경이 자연스럽게 이어지는지
   □ 이상한 아티팩트가 없는지
   □ 해상도가 충분한지 (최소 1200x630 for OG image)

3. 콘텐츠 적합성 검증
   □ 글의 주제와 이미지 내용이 일치하는지
   □ 분위기/톤이 글과 맞는지
   □ 대상 독자층에 적합한지
   □ 문화적으로 부적절한 요소가 없는지

4. 법적 안전성
   □ 실존 인물/브랜드 로고가 포함되지 않았는지
   □ 저작권 침해 소지가 없는지
   □ AI 생성 이미지 표시 필요 여부 확인

검증 결과:
  PASS → 이미지 사용
  REGENERATE → 프롬프트 수정 후 재생성 (최대 3회)
  SKIP → 스톡 이미지로 대체
```

```json
// workspace/drafts/{topic_id}/images/image_verification.json
{
  "images": [
    {
      "id": "img_001",
      "type": "ai_generated",
      "generator": "dall-e-3",
      "prompt": "modern workspace with AI chatbot dashboard on screen, clean minimal style",
      "file": "cover.png",
      "verification": {
        "text_quality": "PASS",
        "visual_quality": "PASS",
        "content_relevance": "PASS",
        "legal_safety": "PASS",
        "overall": "PASS"
      },
      "attempts": 1
    },
    {
      "id": "img_002",
      "type": "stock",
      "source": "unsplash",
      "url": "https://unsplash.com/photos/...",
      "alt_text": "AI 챗봇 인터페이스 예시",
      "license": "Unsplash License (free commercial use)"
    }
  ]
}
```

### 6.4 SEO 최적화 기법

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
    ├── 5.5. 이미지 처리
    │   ├── [IMAGE: 설명] 마커 분석
    │   ├── Unsplash/Pexels에서 적합한 이미지 검색
    │   ├── 없으면 AI 생성 (DALL-E 3 / Stable Diffusion)
    │   ├── AI 생성 이미지 자체 검증 (텍스트 깨짐, 비율 등)
    │   ├── 검증 실패 시 프롬프트 수정 후 재생성 (최대 3회)
    │   ├── ALT 텍스트 최적화
    │   └── → drafts/{topic_id}/images/
    │
    ├── 5.7. 콘텐츠 검증 (Content-Verifier)
    │   ├── 휴먼라이크 검증 (AI 작성 패턴 10개 항목 스캔)
    │   ├── 개인 관점/감정 표현 카운트
    │   ├── 팩트체크 (WebSearch 교차 검증)
    │   ├── 이미지 적절성 검증
    │   ├── PASS → 품질 게이트로 이동
    │   ├── REVISE → Writer에게 구체적 수정 지시 → 재검증
    │   └── FAIL → 전면 재작성 또는 스킵
    │
    ├── 5.9. 최종 품질 게이트 (Quality Gate)
    │   ├── 8개 영역 다면 평가 (콘텐츠, 휴먼라이크, SEO, 바이럴, 가독성, 이미지, 독자가치, 브랜드)
    │   ├── 가중 평균 종합 점수 산출
    │   ├── >= 7.0 → 발행 진행
    │   ├── 5.0-6.9 → 약점 영역 타겟 개선
    │   │   ├── 약점 2-3개 영역 식별
    │   │   ├── 해당 에이전트 재호출 (Writer/SEO/Image 등)
    │   │   ├── 재평가 (최대 3회 반복)
    │   │   └── 매 반복 0.5+ 향상 없으면 중단
    │   └── < 5.0 → 폐기, 새 주제로 교체
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
    "relevance": 8,         // 주제 적합성 (1-10)
    "depth": 7,             // 내용 깊이 (1-10)
    "readability": 9,       // 가독성 (1-10)
    "seo_score": 8,         // SEO 최적화 (1-10)
    "viral_potential": 7,   // 바이럴 가능성 (1-10)
    "human_likeness": 8,    // 휴먼라이크 점수 (1-10)
    "image_quality": 8,     // 이미지 품질 & 적절성 (1-10)
    "overall": 7.9          // 종합 점수
  },
  "min_threshold": 6.0      // 이 이하면 재작성
}
```

### 10.3 콘텐츠 검증 파이프라인 (Content Verification Pipeline)

모든 콘텐츠는 발행 전 **Content-Verifier 에이전트**의 독립 검증을 반드시 통과해야 한다. Writer/SEO-Optimizer가 자체 평가한 점수와 별도로, 제3자 시각에서 재평가한다.

```
[검증 파이프라인]

작성 완료 → Content-Verifier 호출
              │
              ├─ [1단계] 휴먼라이크 검증
              │   ├── AI 작성 패턴 10개 항목 스캔
              │   ├── 개인 관점/감정 표현 카운트
              │   ├── 구어체 비율 측정
              │   ├── 문단 길이 변동계수(CV) 측정
              │   └── AI 버즈워드 감지 (금지 단어 목록 대조)
              │
              ├─ [2단계] 팩트체크
              │   ├── 핵심 수치/통계 WebSearch 교차 검증
              │   ├── 인용 출처 실존 여부 확인
              │   └── 날짜/버전 정보 정확성
              │
              ├─ [3단계] 이미지 검증
              │   ├── AI 생성 이미지 품질 체크
              │   ├── 이미지-콘텐츠 맥락 일치도
              │   ├── ALT 텍스트 존재 및 적절성
              │   └── 라이선스 안전성
              │
              └─ [판정]
                  ├── PASS (human_likeness ≥ 8, 전체 ≥ 7)
                  │   → Publisher로 진행
                  ├── REVISE (human_likeness 5-7 또는 전체 5-7)
                  │   → flagged_sentences와 함께 Writer에게 반환
                  │   → 수정 후 재검증 (최대 2회)
                  └── FAIL (human_likeness < 5 또는 팩트 오류)
                      → 전면 재작성 또는 스킵, 로그 기록
```

> **핵심**: Verifier는 Writer/SEO-Optimizer와 완전히 독립된 에이전트다. 자기가 쓴 글을 자기가 평가하는 게 아니라, 별도의 에이전트가 "까다로운 편집자" 역할로 객관적 검증을 수행한다.

### 10.4 최종 품질 게이트 & 반복 개선 루프 (Quality Gate & Iterative Refinement)

콘텐츠는 **모든 검증을 통과한 후에도 최종 다면 품질 평가**를 거친다. 기준 미달 시 자동으로 약점 영역을 타겟하여 개선 작업을 반복한다.

```
[최종 품질 게이트 - 다면 평가]

┌──────────────────────────────────────────────────────────┐
│                    Quality Gate                          │
│                                                          │
│  평가 영역 (각 1-10점):                                    │
│  ┌─────────────────────────────────────────────────┐     │
│  │ 1. 콘텐츠 품질     (정보 가치, 깊이, 정확성)       │     │
│  │ 2. 휴먼라이크      (AI 티 안남, 자연스러움)        │     │
│  │ 3. SEO 최적화      (키워드, 구조, 메타데이터)      │     │
│  │ 4. 바이럴 잠재력    (공유 욕구, 제목 매력도)       │     │
│  │ 5. 가독성          (구조, 흐름, 시각적 편안함)      │     │
│  │ 6. 이미지 품질      (적절성, 해상도, 배치)         │     │
│  │ 7. 독자 가치       (실용성, 즉시 적용 가능한 정보)  │     │
│  │ 8. 브랜드 일관성    (톤, 스타일, 메시지 일관성)     │     │
│  └─────────────────────────────────────────────────┘     │
│                                                          │
│  종합 점수 = 가중 평균                                      │
│  (휴먼라이크 x1.5, 콘텐츠품질 x1.3, 나머지 x1.0)           │
│                                                          │
│  ┌──────────┬────────────────────────────────────┐       │
│  │ >= 7.0   │ PUBLISH → Publisher로 즉시 발행    │       │
│  │ 5.0-6.9  │ IMPROVE → 약점 영역 타겟 개선     │       │
│  │ < 5.0    │ DISCARD → 폐기, 새 주제로 교체    │       │
│  └──────────┴────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────┘
```

```
[반복 개선 루프]

Quality Gate 결과 = IMPROVE (5.0-6.9)
    │
    ├── 1. 약점 영역 식별
    │   ├── 가장 낮은 점수 2-3개 영역 추출
    │   ├── 각 영역별 구체적 개선 포인트 생성
    │   └── 개선 지시서 작성 → drafts/{topic_id}/improvement_plan.md
    │
    ├── 2. 타겟 개선 실행
    │   ├── 휴먼라이크 부족 → Writer에게 톤/구어체 수정 지시
    │   ├── SEO 부족 → SEO-Optimizer 재실행
    │   ├── 이미지 부족 → Image-Manager 이미지 교체/추가
    │   ├── 가독성 부족 → 구조 재편 (소제목, 문단 분리, 시각 요소)
    │   ├── 바이럴 부족 → 제목 재생성, 도입부 리라이트, CTA 강화
    │   └── 콘텐츠 품질 부족 → 추가 리서치 후 내용 보강
    │
    ├── 3. 재평가
    │   ├── Content-Verifier 재검증
    │   ├── Quality Gate 재평가
    │   └── 점수 변화 기록
    │
    └── 4. 반복 제어
        ├── 최대 3회 반복 (무한 루프 방지)
        ├── 매 반복마다 점수 0.5+ 향상 필요 (정체 시 중단)
        ├── 3회 반복 후에도 7.0 미달 → 현재 최고 버전으로 발행 (6.0+)
        └── 6.0 미만 → 폐기하고 다음 주제로 이동
```

```json
// workspace/drafts/{topic_id}/quality_gate.json
{
  "iterations": [
    {
      "round": 1,
      "scores": {
        "content_quality": 7,
        "human_likeness": 5,
        "seo_optimization": 8,
        "viral_potential": 6,
        "readability": 7,
        "image_quality": 7,
        "reader_value": 8,
        "brand_consistency": 7
      },
      "weighted_overall": 6.4,
      "verdict": "IMPROVE",
      "weak_areas": ["human_likeness", "viral_potential"],
      "improvement_actions": [
        "구어체 비율 15% → 30%로 높이기",
        "개인 경험 에피소드 2개 추가",
        "제목을 질문형으로 변경",
        "도입부를 에피소드형으로 리라이트"
      ]
    },
    {
      "round": 2,
      "scores": {
        "content_quality": 7,
        "human_likeness": 8,
        "seo_optimization": 8,
        "viral_potential": 7,
        "readability": 8,
        "image_quality": 7,
        "reader_value": 8,
        "brand_consistency": 7
      },
      "weighted_overall": 7.5,
      "verdict": "PUBLISH",
      "improvement_delta": "+1.1"
    }
  ],
  "final_verdict": "PUBLISH",
  "total_rounds": 2,
  "best_version": "final_ko_v2.md"
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
