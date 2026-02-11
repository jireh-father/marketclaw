# MarketClaw 사용자 준비 가이드

실제로 블로그에 자동으로 홍보글을 발행하기 위해 준비해야 할 모든 것을 정리한 문서입니다.

---

## 1. 기본 환경 준비

### 1.1 필수 소프트웨어

| 소프트웨어 | 최소 버전 | 설치 확인 명령어 |
|-----------|----------|----------------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Claude Code CLI | 최신 | `claude --version` |
| Git | 2.30+ | `git --version` |

```bash
# Node.js 설치 (nvm 권장)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20

# Claude Code CLI 설치
npm install -g @anthropic-ai/claude-code

# 프로젝트 의존성 설치
cd marketclaw
npm install
```

### 1.2 프로젝트 초기 설정

```bash
# 1. 저장소 클론
git clone <repository-url>
cd marketclaw

# 2. npm 패키지 설치 (marked - MD→HTML 변환용)
npm install

# 3. 환경변수 파일 생성
cp workspace/config/credentials.env.example .env

# 4. .env 파일에 API 키 입력 (아래 섹션 참고)
```

---

## 2. 블로그 플랫폼별 준비사항

사용할 플랫폼만 준비하면 됩니다. 최소 1개 이상의 플랫폼이 필요합니다.

---

### 2.1 네이버 블로그 (한국어)

**방식:** REST API (자동 발행)

#### 준비 단계:

1. **네이버 블로그 개설**
   - https://blog.naver.com 에서 블로그 생성
   - 블로그 주소 확인 (예: blog.naver.com/your_id)

2. **네이버 개발자 앱 등록**
   - https://developers.naver.com 접속 → 로그인
   - "Application" → "애플리케이션 등록" 클릭
   - 애플리케이션 이름: MarketClaw (자유)
   - 사용 API: "블로그" 선택
   - 환경: "WEB 설정" → 서비스 URL: `http://localhost` 입력
   - Callback URL: `http://localhost/callback` 입력
   - 등록 완료 후 **Client ID**와 **Client Secret** 메모

3. **OAuth 2.0 Access Token 발급**
   ```
   # 브라우저에서 아래 URL 접속 (Client ID 교체)
   https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost/callback&state=random_state

   # 로그인 후 동의 → 리다이렉트된 URL에서 code 값 복사
   # http://localhost/callback?code=AUTHORIZATION_CODE&state=random_state

   # 토큰 교환
   curl "https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&code=AUTHORIZATION_CODE&state=random_state"

   # 응답에서 access_token 값 복사
   ```

4. **환경변수 설정**
   ```
   NAVER_BLOG_ACCESS_TOKEN=발급받은_access_token
   ```

> **주의:** 네이버 Access Token은 만료 기간이 있습니다. refresh_token으로 갱신하거나 만료 시 재발급이 필요합니다.

---

### 2.2 티스토리 (한국어)

**방식:** 브라우저 자동화 (Playwright MCP) — API가 2024년 2월에 폐쇄됨

#### 준비 단계:

1. **티스토리 블로그 개설**
   - https://www.tistory.com 접속 → 카카오 계정으로 가입/로그인
   - 블로그 생성 (블로그 이름 선택)
   - 블로그 주소 확인 (예: yourblog.tistory.com)

2. **로그인 정보 준비**
   - 카카오 계정 이메일과 비밀번호 필요
   - 2단계 인증이 활성화되어 있다면 **비활성화** 권장 (자동 로그인에 방해)

3. **환경변수 설정**
   ```
   TISTORY_USERNAME=카카오_이메일
   TISTORY_PASSWORD=카카오_비밀번호
   TISTORY_BLOG_NAME=yourblog    # .tistory.com 앞부분만
   ```

> **주의:** 브라우저 자동화 방식이므로 첫 실행 시 CAPTCHA나 추가 인증이 나올 수 있습니다. 처음 한 번은 수동으로 로그인하여 기기 인증을 완료해 두세요.

---

### 2.3 Medium (영어)

**방식:** REST API (자동 발행)

#### 준비 단계:

1. **Medium 계정 생성**
   - https://medium.com 에서 계정 생성 (Google/이메일)

2. **Integration Token 발급**
   - Medium 로그인 후 프로필 아이콘 클릭
   - "Settings" → "Security and apps"
   - "Integration tokens" 섹션에서 토큰 설명 입력 (예: "MarketClaw")
   - "Get integration token" 클릭 → 토큰 복사

3. **환경변수 설정**
   ```
   MEDIUM_INTEGRATION_TOKEN=발급받은_토큰
   ```

> **참고:** Medium API는 공식적으로 deprecated 상태이지만 여전히 작동합니다. 글 생성만 가능하고 수정/삭제는 API로 불가합니다. 기본적으로 draft(임시 저장) 상태로 발행됩니다.

---

### 2.4 WordPress (영어)

**방식:** REST API (자동 발행, 풀 CRUD 지원)

#### 준비 단계:

1. **WordPress 사이트 준비**
   - Self-hosted WordPress 사이트 필요 (WordPress.com은 별도 인증 필요)
   - WordPress 5.6+ 버전 권장 (Application Passwords 기본 지원)

2. **Application Password 발급**
   - WordPress 관리자 (wp-admin) 로그인
   - "사용자" → "프로필" (또는 Users → Edit Profile)
   - 페이지 하단 "Application Passwords" 섹션
   - 새 애플리케이션 비밀번호 이름: "MarketClaw"
   - "Add New Application Password" 클릭
   - 생성된 비밀번호 즉시 복사 (다시 볼 수 없음!)

3. **REST API 접근 확인**
   ```bash
   # API 접근 가능 여부 테스트
   curl https://yourblog.com/wp-json/wp/v2/posts
   # 403 에러가 나면 보안 플러그인이 REST API를 차단한 것일 수 있음
   ```

4. **환경변수 설정**
   ```
   WP_SITE_URL=https://yourblog.com    # 끝에 / 붙이지 않기
   WP_USERNAME=워드프레스_사용자명
   WP_APP_PASSWORD=발급받은_앱_비밀번호
   ```

> **주의:** 보안 플러그인(Wordfence, iThemes 등)이 REST API를 차단할 수 있습니다. 차단된 경우 플러그인 설정에서 REST API 접근을 허용하세요.

---

### 2.5 Dev.to (영어)

**방식:** REST API (자동 발행)

#### 준비 단계:

1. **Dev.to 계정 생성**
   - https://dev.to 에서 계정 생성 (GitHub/이메일)

2. **API Key 발급**
   - https://dev.to/settings/extensions 접속
   - "DEV Community API Keys" 섹션
   - Description: "MarketClaw"
   - "Generate API Key" 클릭 → 키 복사

3. **환경변수 설정**
   ```
   DEVTO_API_KEY=발급받은_API_키
   ```

> **참고:** Rate Limit이 30초에 10개 요청으로 제한됩니다. MarketClaw가 자동으로 처리하므로 별도 조치 불요. 기본적으로 draft 상태로 발행됩니다.

---

### 2.6 Hashnode (영어)

**방식:** GraphQL API (자동 발행)

#### 준비 단계:

1. **Hashnode 계정 생성**
   - https://hashnode.com 에서 계정 생성

2. **블로그(Publication) 생성**
   - 대시보드에서 Publication 생성
   - Publication ID 확인: 대시보드 URL에서 확인 가능
     또는 API로 조회:
     ```bash
     curl -X POST https://gql.hashnode.com \
       -H "Content-Type: application/json" \
       -H "Authorization: YOUR_PAT" \
       -d '{"query":"{ me { publications(first:1) { edges { node { id title } } } } }"}'
     ```

3. **Personal Access Token (PAT) 발급**
   - https://hashnode.com/settings/developer 접속
   - "Generate New Token" 클릭
   - 토큰 이름: "MarketClaw"
   - 토큰 복사

4. **환경변수 설정**
   ```
   HASHNODE_PAT=발급받은_PAT
   HASHNODE_PUBLICATION_ID=Publication_ID
   ```

---

### 2.7 Velog (한국어)

**방식:** 브라우저 자동화 (Playwright MCP) — 공식 API 없음

#### 준비 단계:

1. **Velog 계정 생성**
   - https://velog.io 에서 계정 생성 (GitHub/Google/이메일)

2. **로그인 정보 준비**
   - 이메일과 비밀번호 (또는 소셜 로그인 계정)

3. **환경변수 설정**
   ```
   VELOG_USERNAME=이메일_또는_사용자명
   VELOG_PASSWORD=비밀번호
   ```

> **주의:** 소셜 로그인(GitHub/Google) 사용 시 브라우저 자동화가 더 복잡해질 수 있습니다. 가능하면 이메일/비밀번호 로그인 계정을 사용하세요.

---

## 3. 이미지 서비스 준비 (선택사항이지만 권장)

콘텐츠에 이미지를 자동으로 삽입하려면 최소 1개 이상의 이미지 서비스가 필요합니다.

### 3.1 Unsplash (무료 스톡 이미지) — 1순위 권장

1. https://unsplash.com/developers 접속
2. "Register as a developer" 클릭
3. 새 애플리케이션 생성
4. Access Key 복사

```
UNSPLASH_ACCESS_KEY=발급받은_Access_Key
```

> 무료 플랜: 시간당 50 요청. 대부분의 사용에 충분합니다.

### 3.2 Pexels (무료 스톡 이미지) — 백업용

1. https://www.pexels.com/api/ 접속
2. "Get Started" → 계정 생성 → API 키 발급

```
PEXELS_API_KEY=발급받은_API_키
```

> 무료 플랜: 월 200 요청.

### 3.3 OpenAI API (AI 이미지 생성) — DALL-E 3용

스톡 이미지에서 적절한 이미지를 찾지 못할 때 AI로 이미지를 생성합니다.

1. https://platform.openai.com/api-keys 접속
2. API 키 생성
3. 결제 정보 등록 (DALL-E 3 사용 시 비용 발생)

```
OPENAI_API_KEY=발급받은_API_키
```

> **비용 참고:** DALL-E 3 이미지 1장당 약 $0.04~$0.08 (해상도에 따라 다름). 콘텐츠 1개당 이미지 3~5장 기준 약 $0.12~$0.40.

---

## 4. 환경변수 최종 설정

### 4.1 .env 파일 작성

```bash
# 프로젝트 루트에 .env 파일 생성
cp workspace/config/credentials.env.example .env
```

사용할 플랫폼의 환경변수만 채우면 됩니다. 아래는 전체 예시:

```env
# === 한국어 플랫폼 ===
NAVER_BLOG_ACCESS_TOKEN=AAAA....
TISTORY_USERNAME=your@email.com
TISTORY_PASSWORD=your_password
TISTORY_BLOG_NAME=yourblog

# === 영어 플랫폼 ===
MEDIUM_INTEGRATION_TOKEN=xxxx....
WP_SITE_URL=https://yourblog.com
WP_USERNAME=admin
WP_APP_PASSWORD=xxxx xxxx xxxx xxxx
DEVTO_API_KEY=xxxx....
HASHNODE_PAT=xxxx....
HASHNODE_PUBLICATION_ID=xxxx....

# === 이미지 서비스 ===
UNSPLASH_ACCESS_KEY=xxxx....
PEXELS_API_KEY=xxxx....
OPENAI_API_KEY=sk-xxxx....
```

### 4.2 환경변수 로드

`.env` 파일의 환경변수는 실행 전에 셸에 로드해야 합니다:

```bash
# 방법 1: source로 직접 로드
set -a && source .env && set +a

# 방법 2: direnv 사용 (권장 - 자동 로드)
# .envrc 파일 생성
echo "dotenv" > .envrc
direnv allow
```

---

## 5. 플랫폼 활성화 설정

`workspace/config/platforms.json`에서 사용할 플랫폼을 활성화합니다:

```json
{
  "platforms": {
    "naver": {
      "enabled": true,       // ← 사용할 플랫폼만 true
      "language": "ko",
      "method": "api"
    },
    "tistory": {
      "enabled": false,      // ← 사용하지 않으면 false
      "language": "ko",
      "method": "browser"
    },
    "medium": {
      "enabled": true,
      "language": "en",
      "method": "api"
    }
    // ... 나머지 플랫폼
  }
}
```

---

## 6. 실행 전 체크리스트

실행하기 전에 아래 항목을 모두 확인하세요:

### 필수 항목
- [ ] Node.js 18+ 설치됨
- [ ] Claude Code CLI 설치됨
- [ ] `npm install` 완료됨
- [ ] `.env` 파일 생성 및 API 키 입력 완료
- [ ] 최소 1개 플랫폼의 API 키/계정 준비 완료
- [ ] `platforms.json`에서 사용할 플랫폼 `enabled: true` 설정

### 권장 항목
- [ ] 최소 1개 이미지 서비스 API 키 등록 (Unsplash 권장)
- [ ] 각 플랫폼에 테스트 글 1개 수동으로 발행하여 계정 정상 확인
- [ ] 브라우저 자동화 플랫폼(Tistory/Velog) 사용 시 수동 로그인 1회 완료

### API 연결 테스트

각 플랫폼의 API 연결을 테스트하려면:

```bash
# Medium API 테스트
curl -H "Authorization: Bearer $MEDIUM_INTEGRATION_TOKEN" \
  https://api.medium.com/v1/me

# WordPress API 테스트
curl -u "$WP_USERNAME:$WP_APP_PASSWORD" \
  "$WP_SITE_URL/wp-json/wp/v2/posts?per_page=1"

# Dev.to API 테스트
curl -H "api-key: $DEVTO_API_KEY" \
  https://dev.to/api/articles/me?per_page=1

# Naver API 테스트 (블로그 정보 조회)
curl -H "Authorization: Bearer $NAVER_BLOG_ACCESS_TOKEN" \
  https://openapi.naver.com/v1/blog/listPost

# Unsplash API 테스트
curl -H "Authorization: Client-ID $UNSPLASH_ACCESS_KEY" \
  "https://api.unsplash.com/photos/random"
```

---

## 7. 캠페인 실행 방법

모든 준비가 완료되면 아래와 같이 실행합니다:

### 7.1 대화형 실행 (권장 — 처음 사용 시)

```bash
# Claude Code 실행
cd marketclaw
claude

# Claude Code 내에서 캠페인 시작
/run-campaign niche:AI_SaaS goal:5 lang:ko,en platforms:naver,medium
```

- `niche`: 홍보할 분야/서비스 (예: AI_SaaS, 피트니스앱, 부동산투자)
- `goal`: 생성할 콘텐츠 수 (처음에는 3~5개로 시작 권장)
- `lang`: 언어 선택 (ko, en, 또는 ko,en)
- `platforms`: 발행 플랫폼 (쉼표 구분)

### 7.2 Headless 실행 (백그라운드)

```bash
# 환경변수 로드
set -a && source .env && set +a

# 캠페인 실행
./scripts/run_campaign.sh "AI SaaS 도구" 10 "ko,en" "naver,medium"
```

### 7.3 중단된 캠페인 이어하기

```bash
# 이전 세션 ID로 이어하기
./scripts/resume_campaign.sh SESSION_ID

# 또는 세션 ID 없이 (task_queue.json 기반으로 자동 이어하기)
./scripts/resume_campaign.sh
```

---

## 8. 비용 참고

### API 사용료 (대략적인 기준)

| 항목 | 비용 | 비고 |
|------|------|------|
| Claude API | Anthropic 요금제에 따름 | Claude Code CLI 구독에 포함 |
| DALL-E 3 이미지 생성 | ~$0.04-0.08/장 | 스톡 이미지로 대체 시 무료 |
| Unsplash | 무료 | 시간당 50 요청 제한 |
| Pexels | 무료 | 월 200 요청 제한 |
| 블로그 플랫폼 API | 무료 | 모든 플랫폼 무료 |

### 콘텐츠 1개당 예상 비용
- 이미지 스톡만 사용: **$0** (API 외 추가 비용 없음)
- AI 이미지 생성 포함: **~$0.20-0.40** (이미지 3-5장 기준)

---

## 9. 문제 해결 (FAQ)

### Q: 네이버 Access Token이 만료되었습니다
**A:** Refresh Token으로 갱신하거나, 섹션 2.1의 과정을 다시 수행하여 재발급하세요.

### Q: 티스토리/Velog 브라우저 자동화가 실패합니다
**A:**
1. 수동으로 해당 사이트에 로그인하여 CAPTCHA/기기 인증 완료
2. 2단계 인증 비활성화
3. 비밀번호에 특수문자가 있다면 환경변수에서 따옴표로 감싸기

### Q: Medium API가 작동하지 않습니다
**A:** Medium API는 deprecated이지만 작동합니다. Integration Token을 재발급하고, `https://api.medium.com/v1/me`로 테스트하세요.

### Q: WordPress REST API가 403 에러를 반환합니다
**A:** 보안 플러그인이 REST API를 차단할 수 있습니다. Wordfence, iThemes Security 등의 설정에서 REST API 접근을 허용하세요.

### Q: 이미지가 삽입되지 않습니다
**A:** 최소 1개의 이미지 서비스 API 키(UNSPLASH_ACCESS_KEY 또는 PEXELS_API_KEY)가 설정되어 있는지 확인하세요.

---

## 10. 보안 주의사항

- `.env` 파일은 **절대 Git에 커밋하지 마세요** (.gitignore에 이미 등록됨)
- API 키와 비밀번호는 안전하게 관리하세요
- 브라우저 자동화용 비밀번호는 메인 계정이 아닌 **별도 계정** 사용 권장
- 정기적으로 API 키를 교체하세요
- 팀원과 공유 시 각자의 API 키를 사용하도록 안내하세요
