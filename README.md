# MarketClaw

자율형 블로그 콘텐츠 마케팅 에이전트. Claude Code 네이티브 기능으로 구현.

## Quick Start

```bash
# 1. 의존성 설치
npm install

# 2. API 키 설정
cp workspace/config/credentials.env.example .env
# .env 파일에 사용할 블로그 플랫폼 API 키 입력

# 3. Claude Code에서 실행
claude
> /run-campaign niche:AI_SaaS goal:10 lang:ko,en platforms:naver,medium
```

## Features

- 한국어 + 영어 동시 콘텐츠 생산 (단순 번역 아님)
- 사람이 쓴 것처럼 자연스러운 글 작성 (AI 감지 방지)
- SEO 최적화 + 이미지 자동 처리
- 독립 검증 에이전트 + 다면 품질 평가
- 트래픽 분석 기반 전략 자동 진화
- 네이버, 티스토리, Medium, WordPress, Dev.to, Hashnode, Velog 지원

## Supported Platforms

| Platform | Language | Method |
|----------|----------|--------|
| Naver Blog | Korean | REST API |
| Tistory | Korean | Playwright Browser Automation |
| Medium | English | REST API |
| WordPress | English | REST API |
| Dev.to | English | REST API |
| Hashnode | English | GraphQL API |
| Velog | Korean | Playwright Browser Automation |

## Architecture

See [docs/prd.md](docs/prd.md) for full product spec.

```
.claude/
  agents/     - 10 specialized sub-agents
  skills/     - 4 user-invocable skills
  rules/      - Writing style & quality rules
  CLAUDE.md   - Agent identity & context

scripts/
  publish/    - Per-platform publish scripts
  run_campaign.sh    - Headless execution
  resume_campaign.sh - Resume interrupted session

workspace/   - Runtime data (created at campaign start)
```
