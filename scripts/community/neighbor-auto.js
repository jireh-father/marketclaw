/**
 * Naver Blog Neighbor Acquisition Automation
 *
 * Searches diverse keywords, sends neighbor requests,
 * writes natural comments, and gives likes.
 *
 * Usage: node scripts/community/neighbor-auto.js [options]
 *   --target=20       Number of blogs to target (default: 20)
 *   --niche=헤어스타일  Campaign niche for keyword expansion
 *   --keywords=허쉬컷,봄헤어  Comma-separated additional keywords
 *   --dry-run          Collect bloggers only, don't act
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        let value = trimmed.substring(eqIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  });
}

const NAVER_USERNAME = process.env.NAVER_USERNAME;
const NAVER_PASSWORD = process.env.NAVER_PASSWORD;
const WORKSPACE = path.join(__dirname, '..', '..', 'workspace');
const COMMUNITY_DIR = path.join(WORKSPACE, 'community');

if (!NAVER_USERNAME || !NAVER_PASSWORD) {
  console.error('NAVER_USERNAME and NAVER_PASSWORD must be set');
  process.exit(1);
}

// Parse CLI args
const args = {};
process.argv.slice(2).forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, val] = arg.substring(2).split('=');
    args[key] = val || true;
  }
});

const TARGET_COUNT = parseInt(args.target || '20');
const NICHE = args.niche || '헤어스타일';
const EXTRA_KEYWORDS = args.keywords ? args.keywords.split(',') : [];
const DRY_RUN = !!args['dry-run'];

// Keyword expansion per niche
const KEYWORD_MAP = {
  '헤어스타일': {
    tier1: ['허쉬컷', '봄헤어스타일', '중단발스타일', '남자헤어스타일', '머릿결관리', '앞머리스타일'],
    tier2: ['네일아트', '데일리메이크업', '피부관리루틴', '뷰티템추천', '립스틱추천', '향수추천'],
    tier3: ['데일리룩', 'OOTD', '셀프케어루틴', '카페추천', '다이어트식단', '일상브이로그', '자기관리루틴']
  }
};

function getKeywords(niche, extraKeywords) {
  const map = KEYWORD_MAP[niche] || KEYWORD_MAP['헤어스타일'];
  const all = [...map.tier1, ...map.tier2, ...map.tier3, ...extraKeywords];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

function randomDelay(minMs, maxMs) {
  const ms = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  return new Promise(r => setTimeout(r, ms));
}

// --- Content-Aware Comment System ---
// Reads actual blog post content and generates relevant, specific comments.

/**
 * Read the blog post's title and key content from the page.
 * Returns { title, topics, bodySnippets, hasImages }
 */
async function readPostContent(mainFrame) {
  return await mainFrame.evaluate(() => {
    // Extract title
    const titleSelectors = [
      '.se-title-text', '.pcol1', 'h3.se_textarea', '.itemSubjectBol498',
      '.se-fs-', '.se-title', '[class*="title"]'
    ];
    let title = '';
    for (const sel of titleSelectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim().length > 3) {
        title = el.textContent.trim();
        break;
      }
    }
    // Fallback: look for the biggest heading
    if (!title) {
      const headings = document.querySelectorAll('h2, h3, h4, strong');
      for (const h of headings) {
        const t = h.textContent.trim();
        if (t.length > 5 && t.length < 100) { title = t; break; }
      }
    }

    // Extract body text
    const bodySelectors = [
      '.se-main-container', '#postViewArea', '.se_component_wrap',
      '.post-view', '.se_doc_viewer', '[class*="post"]'
    ];
    let bodyText = '';
    for (const sel of bodySelectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim().length > 50) {
        bodyText = el.textContent.trim();
        break;
      }
    }

    // Extract meaningful phrases (4+ char segments between punctuation)
    const phrases = bodyText
      .replace(/\s+/g, ' ')
      .split(/[.!?\n,…·~]/)
      .map(s => s.trim())
      .filter(s => s.length >= 8 && s.length <= 60)
      .filter(s => !s.match(/^(https?|www|Copyright|All rights|저작권|출처)/i));

    // Extract unique topic keywords from title + body
    const allText = (title + ' ' + bodyText).replace(/[^\uAC00-\uD7A3a-zA-Z0-9\s]/g, ' ');
    const words = allText.split(/\s+/).filter(w => w.length >= 2);
    // Get frequent 2+ char Korean words as topics
    const wordCount = {};
    words.forEach(w => {
      if (w.match(/[\uAC00-\uD7A3]/) && w.length >= 2) {
        wordCount[w] = (wordCount[w] || 0) + 1;
      }
    });
    const topics = Object.entries(wordCount)
      .filter(([w, c]) => c >= 2 && w.length >= 2 && w.length <= 10)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([w]) => w);

    // Check for images
    const hasImages = document.querySelectorAll('.se-image img, img[src*="blogfiles"], img[src*="pstatic"]').length > 0;

    return {
      title: title.substring(0, 80),
      topics,
      bodySnippets: phrases.slice(0, 15),
      hasImages
    };
  });
}

/**
 * Generate a comment that's specific to the blog post content.
 * Uses extracted title, topics, and body snippets to create natural comments.
 */
function generateComment(postContent) {
  const { title, topics, bodySnippets, hasImages } = postContent;
  const topic = topics[0] || '';
  const topic2 = topics[1] || topics[0] || '';
  const snippet = bodySnippets[Math.floor(Math.random() * Math.min(bodySnippets.length, 5))] || title;

  // Template patterns that reference actual content
  const templates = [
    // Type A: 구체적 공감 — references a specific snippet
    () => {
      const s = snippet.length > 30 ? snippet.substring(0, 30) + '...' : snippet;
      return `"${s}" 이 부분 진짜 공감이에요. 저도 ${topic} 관련해서 비슷한 경험 있거든요 ㅎㅎ`;
    },
    // Type B: 질문형 — asks about specific topic
    () => `${topic} 관련 글 잘 읽었어요! 혹시 ${topic2}은(는) 어떻게 하고 계세요? 저도 요즘 고민 중이거든요`,
    // Type C: 경험 공유 — shares related experience
    () => `오 ${topic} 저도 해봤는데 진짜 ${Math.random() < 0.5 ? '괜찮더라고요' : '좋더라고요'}! ${title.length > 20 ? '글 내용이 딱 제가 궁금했던 부분이에요' : '도움 많이 됐어요'}`,
    // Type D: 정보 추가
    () => {
      const s2 = bodySnippets[Math.floor(Math.random() * bodySnippets.length)] || topic;
      const shortS2 = s2.length > 25 ? s2.substring(0, 25) : s2;
      return `${shortS2} 부분 몰랐던 정보네요! 저는 좀 다른 방법으로 하고 있었는데 이것도 한번 해봐야겠어요`;
    },
    // Type E: 제목 기반 공감
    () => `${title.substring(0, 25)}${title.length > 25 ? '...' : ''} 제목 보고 바로 들어왔어요 ㅋㅋ ${topic} 요즘 저도 관심이라서 읽으면서 많이 배웠어요~`,
    // Type F: 짧은 감상 + 구체적 포인트
    () => {
      const phrases = ['진짜 실용적이에요', '바로 적용해봐야겠어요', '주변에도 알려줘야겠다', '저장해놓을게요'];
      return `${topic} 관련 ${phrases[Math.floor(Math.random() * phrases.length)]}! ${bodySnippets.length > 3 ? '특히 ' + (bodySnippets[2] || '').substring(0, 20) + ' 부분이요' : ''}`;
    },
    // Type G: 이미지 언급 (사진이 있을 때)
    () => {
      if (hasImages) {
        return `사진 보니까 ${topic} 느낌이 확 와요 ㅎㅎ 저도 ${topic2} 해보고 싶었는데 이거 보고 결심했어요!`;
      }
      return `${topic} 이렇게 자세하게 정리한 글은 처음이에요. ${Math.random() < 0.5 ? '진짜 도움 됐어요!' : '많이 배웠습니다!'}`;
    },
    // Type H: 자연스러운 질문
    () => `궁금한 게 있는데요, ${topic} 처음 시작할 때 ${topic2}은(는) 어떻게 하셨어요? 저도 도전해보려고요!`,
    // Type I: 감사 + 구체적 이유
    () => {
      const reason = bodySnippets[0] ? bodySnippets[0].substring(0, 25) : topic;
      return `${reason} 부분 덕분에 새로운 걸 알게 됐어요! 저도 한번 해봐야겠네요 ㅎㅎ`;
    },
    // Type J: 리액션형
    () => `오 ${title.substring(0, 20)} 마침 요즘 ${topic} 찾고 있었는데 타이밍 좋게 딱 나왔네요! 감사해요~`,
  ];

  // Pick a random template
  const template = templates[Math.floor(Math.random() * templates.length)];
  let comment = template();

  // Clean up: remove empty references, double spaces, trailing artifacts
  comment = comment
    .replace(/\s+/g, ' ')
    .replace(/ 부분 부분/g, ' 부분')
    .replace(/^""\s*/, '')
    .replace(/\(\)/, '')
    .replace(/은\(는\)/g, Math.random() < 0.5 ? '은' : '는')
    .trim();

  // Ensure comment isn't too long (Naver limit)
  if (comment.length > 150) {
    comment = comment.substring(0, 147) + '...';
  }

  return comment;
}

/**
 * Generate a reply that's relevant to the existing comment being replied to.
 * Reads the parent comment text for context.
 */
async function generateReply(mainFrame, targetCommentIdx) {
  // Read the target comment's text
  const commentText = await mainFrame.evaluate((idx) => {
    const comments = document.querySelectorAll('.u_cbox_text_wrap, .u_cbox_contents');
    if (comments[idx]) {
      return comments[idx].textContent?.trim().substring(0, 80) || '';
    }
    return '';
  }, targetCommentIdx);

  if (!commentText || commentText.length < 3) {
    // Fallback: use simple agreeing replies
    const fallbacks = [
      '맞아요 진짜 ㅋㅋ 공감이에요',
      '오 저도 같은 생각이에요!',
      '저도요 ㅎㅎ 완전 공감',
      '아 그것도 좋은 방법이네요!',
      '진짜 그쵸? 저도 그렇게 느꼈어요',
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // Extract a key phrase from the comment to reference
  const shortRef = commentText.length > 20 ? commentText.substring(0, 20) + '...' : commentText;

  const replyTemplates = [
    `맞아요! "${shortRef}" 저도 완전 공감이에요 ㅎㅎ`,
    `오 그 부분 저도 같은 생각이에요! 저도 비슷한 경험 있거든요`,
    `ㅋㅋ 진짜 그쵸? 저도 그렇게 느꼈어요~`,
    `맞아요 저도 해봤는데 진짜 괜찮더라고요!`,
    `오 좋은 포인트네요! 저도 참고해야겠어요`,
    `아 그것도 좋은 방법이네요! 한번 해봐야겠다`,
  ];

  return replyTemplates[Math.floor(Math.random() * replyTemplates.length)];
}

// Legacy fallback (used only if content extraction completely fails)
function getFallbackComment() {
  const fallbacks = [
    '글 잘 읽었어요! 저도 관심 있던 주제라서 도움 됐어요 ㅎㅎ',
    '오 저도 비슷한 경험 있어서 공감하면서 읽었어요!',
    '마침 요즘 이 주제에 관심 있었는데 잘 봤습니다~',
    '읽으면서 많이 배웠어요! 저도 한번 시도해봐야겠네요',
    '이런 정보 찾고 있었는데 감사해요 ㅎㅎ',
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// Human-like behavior: randomly decide what actions to take
// Returns an object describing the action plan
function decideBehavior() {
  const roll = Math.random();
  if (roll < 0.35) {
    // 35%: Like post + New comment + Maybe like some comments
    return { likePost: true, newComment: true, replyComment: false, likeComments: Math.random() < 0.5 };
  } else if (roll < 0.55) {
    // 20%: Like post + Reply to existing comment + Like some comments
    return { likePost: true, newComment: false, replyComment: true, likeComments: true };
  } else if (roll < 0.70) {
    // 15%: Like post only + Like some comments (no new comment - just browsing)
    return { likePost: true, newComment: false, replyComment: false, likeComments: Math.random() < 0.7 };
  } else if (roll < 0.85) {
    // 15%: Full engagement: Like + Comment + Reply + Like comments
    return { likePost: true, newComment: true, replyComment: true, likeComments: true };
  } else {
    // 15%: Like post + New comment (classic pattern)
    return { likePost: true, newComment: true, replyComment: false, likeComments: false };
  }
}

const NEIGHBOR_MESSAGES = [
  '안녕하세요! 블로그 글이 너무 좋아서 서로이웃 신청드려요 ☺',
  '글 잘 읽고 있습니다~ 서로이웃 신청할게요!',
  '비슷한 관심사라 반가워요! 서로이웃 되고 싶어서 신청합니다',
  '좋은 글 많이 올려주시네요~ 서로이웃 신청합니다!',
  '블로그가 정말 알차요! 서로이웃 되면 좋겠습니다 ☺',
  '관련 주제로 블로그 하고 있어서 서로이웃 신청드립니다~',
];

async function login(page) {
  console.log('[LOGIN] 네이버 로그인 중...');
  await page.goto('https://nid.naver.com/nidlogin.login');
  await page.waitForTimeout(1000);

  const idField = page.locator('#id');
  await idField.click();
  await page.waitForTimeout(300);
  await page.keyboard.insertText(NAVER_USERNAME);
  await page.waitForTimeout(500);

  const pwField = page.locator('#pw');
  await pwField.click();
  await page.waitForTimeout(300);
  await page.keyboard.insertText(NAVER_PASSWORD);
  await page.waitForTimeout(500);

  await page.locator('#log\\.login').click();
  await page.waitForTimeout(3000);

  const url = page.url();
  if (url.includes('naver.com') && !url.includes('nidlogin')) {
    console.log('[LOGIN] 로그인 성공!');
    return true;
  }
  console.error('[LOGIN] 로그인 실패');
  return false;
}

async function searchBloggers(page, keyword) {
  const url = `https://section.blog.naver.com/Search/Post.naver?pageNo=1&rangeType=WEEK&orderBy=sim&keyword=${encodeURIComponent(keyword)}`;
  await page.goto(url);
  await page.waitForTimeout(3000);

  return await page.evaluate((myBlogId) => {
    const EXCLUDE_IDS = ['blogpeople', 'PostList', 'PostView', 'Search', 'navercorp', 'naver_diary'];
    const seen = new Set();
    const results = [];

    // Collect blog profile links
    const links = document.querySelectorAll('a[href*="blog.naver.com/"]');
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      const match = href.match(/blog\.naver\.com\/([a-zA-Z0-9_-]+)$/);
      if (match) {
        const blogId = match[1];
        if (blogId !== myBlogId && !seen.has(blogId) &&
            !EXCLUDE_IDS.includes(blogId) &&
            !blogId.includes('.naver') && !blogId.includes('naver') && blogId.length > 2) {
          seen.add(blogId);
          const nameEl = link.querySelector('em, strong, span') || link;
          results.push({ blogId, name: nameEl.textContent?.trim() || blogId });
        }
      }
    });

    // Collect post links (any numeric post ID)
    document.querySelectorAll('a[href*="blog.naver.com/"]').forEach(link => {
      const href = link.getAttribute('href') || '';
      const match = href.match(/blog\.naver\.com\/([a-zA-Z0-9_-]+)\/(\d{9,})/);
      if (match && !seen.has(match[1]) && match[1] !== myBlogId &&
          !EXCLUDE_IDS.includes(match[1]) && match[1].length > 2) {
        seen.add(match[1]);
        const nameEl = link.querySelector('em, strong, span') || link;
        results.push({ blogId: match[1], name: nameEl.textContent?.trim() || match[1], postUrl: href });
      }
    });

    // Also update existing entries with postUrl if found
    document.querySelectorAll('a[href*="blog.naver.com/"]').forEach(link => {
      const href = link.getAttribute('href') || '';
      const match = href.match(/blog\.naver\.com\/([a-zA-Z0-9_-]+)\/(\d{9,})/);
      if (match) {
        const existing = results.find(r => r.blogId === match[1] && !r.postUrl);
        if (existing) {
          existing.postUrl = href;
        }
      }
    });

    return results;
  }, NAVER_USERNAME);
}

/**
 * Process a single blogger: neighbor request + comment + like
 * Uses a SEPARATE page (new tab) to avoid popup issues.
 */
async function processBlogger(context, blogger, index) {
  const page = await context.newPage();
  const result = {
    blog_id: blogger.blogId,
    blog_name: blogger.name,
    keyword: blogger.keyword,
    neighbor_status: 'skipped',
    comment_written: false,
    comment_text: null,
    reply_written: false,
    reply_text: null,
    liked: false,
    comment_likes: 0,
    timestamp: new Date().toISOString()
  };

  try {
    // Navigate to blog
    await page.goto(`https://blog.naver.com/${blogger.blogId}`, { timeout: 15000 });
    await page.waitForTimeout(2000);

    const mainFrame = page.frame('mainFrame');
    if (!mainFrame) {
      console.log(`  [SKIP] mainFrame 없음`);
      await page.close();
      return result;
    }

    // --- STEP 1: NEIGHBOR REQUEST ---
    try {
      // Click 이웃추가 link in mainFrame
      const clicked = await mainFrame.evaluate(() => {
        const links = document.querySelectorAll('a');
        for (const link of links) {
          if (link.textContent.includes('이웃추가') && link.offsetParent !== null) {
            link.click();
            return true;
          }
        }
        return false;
      });

      if (clicked) {
        const popup = await page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
        if (popup) {
          await popup.waitForLoadState('domcontentloaded');
          await popup.waitForTimeout(1500);

          // Select 서로이웃
          await popup.evaluate(() => {
            const labels = document.querySelectorAll('label, span, div');
            for (const el of labels) {
              if (el.textContent.trim() === '서로이웃') {
                el.click();
                return;
              }
            }
            // Or try radio button
            const radios = document.querySelectorAll('input[type="radio"]');
            for (const r of radios) {
              const parent = r.closest('div, label');
              if (parent && parent.textContent.includes('서로이웃')) {
                r.click();
                return;
              }
            }
          });
          await popup.waitForTimeout(500);

          // Click 다음
          const btn1 = popup.getByRole('button', { name: '다음' });
          if (await btn1.count() > 0) {
            await btn1.click();
            await popup.waitForTimeout(1500);

            // Fill message if there's a textbox
            const msgField = popup.locator('textarea, input[type="text"]').first();
            if (await msgField.count() > 0) {
              await msgField.click().catch(() => {});
              await popup.waitForTimeout(300);
              const msg = NEIGHBOR_MESSAGES[Math.floor(Math.random() * NEIGHBOR_MESSAGES.length)];
              await popup.keyboard.insertText(msg);
              await popup.waitForTimeout(500);
            }

            // Click 다음 again
            const btn2 = popup.getByRole('button', { name: '다음' });
            if (await btn2.count() > 0) {
              await btn2.click();
              await popup.waitForTimeout(1000);
            }
          }

          // Close popup
          const closeBtn = popup.getByRole('button', { name: '닫기' });
          if (await closeBtn.count() > 0) {
            await closeBtn.click().catch(() => {});
          }
          await popup.close().catch(() => {});

          result.neighbor_status = 'mutual_requested';
          console.log(`  [NEIGHBOR] ✅ 서로이웃 신청 완료`);
        }
      } else {
        // Maybe already a neighbor or button not found
        result.neighbor_status = 'no_button';
        console.log(`  [NEIGHBOR] 이웃추가 버튼 없음 (이미 이웃이거나 비공개)`);
      }
    } catch (err) {
      result.neighbor_status = 'error';
      const msg = err && err.message ? err.message.substring(0, 60) : String(err).substring(0, 60);
      console.log(`  [NEIGHBOR] ⚠ 오류: ${msg}`);
    }

    await page.waitForTimeout(1000);

    // Check if page is still alive
    try { await page.url(); } catch {
      console.log(`  [SKIP] 페이지가 닫힘, 새 페이지로 재시도`);
      await page.close().catch(() => {});
      const newPage = await context.newPage();
      await processCommentAndLike(newPage, blogger, result);
      await newPage.close().catch(() => {});
      return result;
    }

    // --- STEP 2: COMMENT ---
    await processCommentAndLike(page, blogger, result);

  } catch (err) {
    const msg = err && err.message ? err.message.substring(0, 80) : String(err).substring(0, 80);
    console.log(`  [ERROR] ${msg}`);
  }

  await page.close().catch(() => {});
  return result;
}

/**
 * Navigate to a specific post page, handling homepage→post navigation.
 * Always ensures we end up on a SINGLE post page (not a homepage with multiple posts).
 */
async function navigateToPost(page, blogger) {
  let targetUrl = blogger.postUrl || `https://blog.naver.com/${blogger.blogId}`;
  const isSpecificPost = /\/\d{9,}/.test(targetUrl) || targetUrl.includes('logNo=');

  await page.goto(targetUrl, { timeout: 15000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  let mainFrame = page.frame('mainFrame');
  if (!mainFrame) return null;

  // If we're already on a specific post, we're good
  if (isSpecificPost) return mainFrame;

  // We're on the blog homepage — find and navigate to the latest post
  const latestPostUrl = await mainFrame.evaluate(() => {
    // Look for PostView links (most reliable)
    const postViewLinks = document.querySelectorAll('a[href*="PostView.naver"], a[href*="logNo="]');
    for (const link of postViewLinks) {
      const href = link.getAttribute('href') || '';
      if (href.includes('logNo=') || href.includes('PostView')) return href;
    }
    // Look for direct post links like /blogId/postNumber
    const allLinks = document.querySelectorAll('a[href]');
    for (const link of allLinks) {
      const href = link.getAttribute('href') || '';
      if (href.match(/\/([a-zA-Z0-9_-]+)\/(\d{9,})/)) return href;
    }
    return null;
  });

  if (!latestPostUrl) return null;

  const fullUrl = latestPostUrl.startsWith('http')
    ? latestPostUrl
    : `https://blog.naver.com${latestPostUrl.startsWith('/') ? '' : '/'}${latestPostUrl}`;
  // console.log(`  [DBG] 최신글로 이동: ${fullUrl.substring(0, 60)}...`);
  await page.goto(fullUrl, { timeout: 15000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  return page.frame('mainFrame');
}

/**
 * Like the post (공감 button on the main post)
 */
async function likePost(page, mainFrame, result) {
  try {
    const liked = await mainFrame.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        const text = btn.textContent || '';
        if (text.includes('공감') && !text.includes('열고') && !text.includes('블로거')) {
          if (btn.getAttribute('aria-pressed') !== 'true' &&
              !btn.classList.contains('on') &&
              btn.offsetParent !== null) {
            btn.scrollIntoView({ block: 'center' });
            btn.click();
            return true;
          }
        }
      }
      return false;
    });
    if (liked) {
      await page.waitForTimeout(1000);
      result.liked = true;
      console.log(`  [LIKE] ✅ 게시글 공감`);
    }
  } catch { /* ok */ }
}

/**
 * Expand the comment section and return whether it's ready
 */
async function expandCommentSection(page, mainFrame) {
  // Check if already expanded
  let ready = await mainFrame.evaluate(() => {
    return !!document.querySelector('.u_cbox_write_wrap, .u_cbox_guide, .u_cbox_text');
  });
  if (ready) return true;

  // Click toggle button to expand
  const expanded = await mainFrame.evaluate(() => {
    const allEls = document.querySelectorAll('button, a');
    // Priority 1: Direct write/first comment link (must be visible)
    for (const el of allEls) {
      const text = (el.textContent || '').replace(/\s+/g, '').trim();
      if ((text.includes('첫댓글') || text === '댓글쓰기') && el.offsetParent !== null) {
        el.scrollIntoView({ block: 'center' });
        el.click();
        return 'direct:' + text.substring(0, 20);
      }
    }
    // Priority 2: Toggle button with "열고 닫기" (the actual expander)
    for (const el of allEls) {
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (text.includes('댓글') && text.includes('열고') && text.includes('닫기')) {
        el.scrollIntoView({ block: 'center' });
        el.click();
        return 'toggle:' + text.substring(0, 30);
      }
    }
    // Priority 3: Simple "댓글 N" button (floating bar or inline)
    for (const el of allEls) {
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (/^댓글\s*\d+/.test(text)) {
        el.scrollIntoView({ block: 'center' });
        el.click();
        return 'simple:' + text.substring(0, 20);
      }
    }
    return null;
  });

  // console.log(`  [DBG] toggle결과: ${expanded}`);
  if (!expanded) return false;

  try {
    await mainFrame.waitForSelector('.u_cbox_guide, .u_cbox_text, [title="댓글"]', { timeout: 6000 });
    // console.log('  [DBG] waitForSelector 성공');
    return true;
  } catch {
    await page.waitForTimeout(3000);
    const mf = page.frame('mainFrame');
    if (!mf) return false;
    const found = await mf.evaluate(() => {
      return !!document.querySelector('.u_cbox_guide, .u_cbox_text, [title="댓글"]');
    });
    // console.log(`  [DBG] fallback 결과: ${found}`);
    return found;
  }
}

/**
 * Like random existing comments (공감 on individual comments)
 */
async function likeExistingComments(page, mainFrame, result) {
  try {
    const likedCount = await mainFrame.evaluate((myBlogId) => {
      let count = 0;
      // Find all comment like buttons (공감 0, 공감 1, etc.)
      const commentLikeBtns = document.querySelectorAll('.u_cbox_btn_recomm, a[data-action="like#like"]');
      for (const btn of commentLikeBtns) {
        // Skip if already liked
        const countEl = btn.querySelector('.u_cbox_cnt_recomm, em');
        // Random: like ~50% of comments
        if (Math.random() < 0.5) continue;
        // Don't like own comments
        const commentItem = btn.closest('.u_cbox_comment_box, li');
        if (commentItem) {
          const author = commentItem.querySelector('.u_cbox_nick, a[href]');
          if (author && (author.textContent || '').includes(myBlogId)) continue;
        }
        btn.scrollIntoView({ block: 'center' });
        btn.click();
        count++;
        if (count >= 3) break; // Max 3 comment likes per post
      }
      return count;
    }, NAVER_USERNAME);

    if (likedCount > 0) {
      await page.waitForTimeout(800);
      result.comment_likes = (result.comment_likes || 0) + likedCount;
      console.log(`  [COMMENT-LIKE] ✅ 댓글 공감 ${likedCount}개`);
    }
  } catch { /* ok */ }
}

/**
 * Reply to an existing comment
 */
async function replyToExistingComment(page, mainFrame, result) {
  try {
    // Find reply buttons and pick one randomly
    const replyBtnCount = await mainFrame.evaluate(() => {
      const btns = [];
      document.querySelectorAll('button').forEach(b => {
        if ((b.textContent || '').trim() === '답글' && b.offsetParent !== null) {
          btns.push(b);
        }
      });
      return btns.length;
    });

    if (replyBtnCount === 0) return false;

    // Pick a random reply button (prefer first few comments)
    const targetIdx = Math.floor(Math.random() * Math.min(replyBtnCount, 3));

    // Click the reply button
    const clicked = await mainFrame.evaluate((idx) => {
      const btns = [];
      document.querySelectorAll('button').forEach(b => {
        if ((b.textContent || '').trim() === '답글' && b.offsetParent !== null) {
          btns.push(b);
        }
      });
      if (btns[idx]) {
        btns[idx].scrollIntoView({ block: 'center' });
        btns[idx].click();
        return true;
      }
      return false;
    }, targetIdx);

    if (!clicked) return false;
    await page.waitForTimeout(1500);

    // Find the reply input area (appears under the comment)
    // Reply inputs use the same .u_cbox_guide / .u_cbox_text pattern but inside .u_cbox_reply_area
    const replyActivated = await mainFrame.evaluate(() => {
      // Look for the newly opened reply guide/text area
      const replyGuides = document.querySelectorAll('.u_cbox_reply_area .u_cbox_guide, .u_cbox_inbox .u_cbox_guide');
      for (const g of replyGuides) {
        if (g.offsetParent !== null) {
          g.scrollIntoView({ block: 'center' });
          g.click();
          return true;
        }
      }
      // Fallback: any visible guide that appeared (might be the reply one)
      const allGuides = document.querySelectorAll('.u_cbox_guide');
      if (allGuides.length > 1) {
        const last = allGuides[allGuides.length - 1];
        if (last.offsetParent !== null) {
          last.scrollIntoView({ block: 'center' });
          last.click();
          return true;
        }
      }
      return false;
    });

    if (!replyActivated) {
      // Try clicking any new text area that appeared
      const directClick = await mainFrame.evaluate(() => {
        const textAreas = document.querySelectorAll('.u_cbox_text[contenteditable="true"]');
        if (textAreas.length > 1) {
          const last = textAreas[textAreas.length - 1];
          last.scrollIntoView({ block: 'center' });
          last.focus();
          last.click();
          return true;
        }
        return false;
      });
      if (!directClick) return false;
    }

    await page.waitForTimeout(800);

    // Generate a context-aware reply
    const reply = await generateReply(mainFrame, targetIdx);
    let filled = false;

    // Try to fill the LAST (newest) contenteditable - should be the reply box
    try {
      const textAreas = mainFrame.locator('[title="댓글"][contenteditable="true"]');
      const count = await textAreas.count();
      if (count > 1) {
        await textAreas.nth(count - 1).fill(reply);
        filled = true;
      } else if (count === 1) {
        await textAreas.first().fill(reply);
        filled = true;
      }
    } catch { /* fallback */ }

    if (!filled) {
      try {
        const textAreas = mainFrame.locator('.u_cbox_text');
        const count = await textAreas.count();
        if (count > 0) {
          await textAreas.nth(count - 1).fill(reply);
          filled = true;
        }
      } catch { /* fallback */ }
    }

    if (!filled) return false;

    await page.waitForTimeout(500);

    // Click 등록 button (the one closest to the reply area)
    try {
      const submitBtns = mainFrame.locator('button:text-is("등록")');
      const count = await submitBtns.count();
      if (count > 0) {
        // Click the LAST 등록 button (the one for the reply)
        await submitBtns.nth(count - 1).click({ timeout: 3000 });
      }
    } catch {
      await mainFrame.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const submitBtns = btns.filter(b => b.textContent.trim() === '등록');
        if (submitBtns.length > 0) submitBtns[submitBtns.length - 1].click();
      });
    }

    await page.waitForTimeout(2000);

    result.reply_written = true;
    result.reply_text = reply;
    console.log(`  [REPLY] ✅ 답글: "${reply}"`);
    return true;
  } catch (err) {
    const msg = err && err.message ? err.message.substring(0, 60) : String(err).substring(0, 60);
    console.log(`  [REPLY] ⚠ ${msg}`);
    return false;
  }
}

/**
 * Write a new top-level comment (content-aware)
 * @param {*} postContent - extracted post content from readPostContent()
 */
async function writeNewComment(page, mainFrame, result, postContent) {
  // Activate the comment input
  let inputActivated = false;

  // Method A: Guide click
  inputActivated = await mainFrame.evaluate(() => {
    // Find the MAIN write area guide (not reply area)
    const writeWrap = document.querySelector('.u_cbox_write_wrap');
    if (writeWrap) {
      const guide = writeWrap.querySelector('.u_cbox_guide');
      if (guide) { guide.scrollIntoView({ block: 'center' }); guide.click(); return true; }
    }
    const guide = document.querySelector('.u_cbox_guide');
    if (guide) { guide.scrollIntoView({ block: 'center' }); guide.click(); return true; }
    return false;
  });
  if (inputActivated) await page.waitForTimeout(800);

  // Method B: Direct text area click
  if (!inputActivated) {
    inputActivated = await mainFrame.evaluate(() => {
      const textArea = document.querySelector('.u_cbox_text, [title="댓글"][contenteditable="true"]');
      if (textArea) { textArea.scrollIntoView({ block: 'center' }); textArea.focus(); textArea.click(); return true; }
      return false;
    });
    if (inputActivated) await page.waitForTimeout(800);
  }

  // Method C: Playwright locator
  if (!inputActivated) {
    try {
      const loc = mainFrame.locator('.u_cbox_guide, [title="댓글"]').first();
      if (await loc.count() > 0) {
        await loc.scrollIntoViewIfNeeded();
        await loc.click({ timeout: 3000 });
        inputActivated = true;
        await page.waitForTimeout(800);
      }
    } catch { /* continue */ }
  }

  if (!inputActivated) {
    console.log(`  [COMMENT] ⚠ 댓글 입력 영역 없음`);
    return false;
  }

  // Generate content-aware comment (or fallback if content extraction failed)
  const comment = (postContent && postContent.title)
    ? generateComment(postContent)
    : getFallbackComment();
  let filled = false;

  try {
    const loc = mainFrame.locator('[title="댓글"][contenteditable="true"]').first();
    if (await loc.count() > 0) { await loc.fill(comment); filled = true; }
  } catch { /* fallback */ }

  if (!filled) {
    try {
      const loc = mainFrame.locator('.u_cbox_text').first();
      if (await loc.count() > 0) { await loc.fill(comment); filled = true; }
    } catch { /* fallback */ }
  }

  if (!filled) {
    await mainFrame.evaluate(() => {
      const el = document.querySelector('.u_cbox_text, [title="댓글"]');
      if (el) { el.focus(); el.click(); }
    });
    await page.waitForTimeout(300);
    await page.keyboard.insertText(comment);
    filled = true;
  }

  await page.waitForTimeout(500);

  // Verify text entered
  const entered = await mainFrame.evaluate(() => {
    const el = document.querySelector('.u_cbox_text, [title="댓글"]');
    return el ? (el.textContent || '').trim().length > 0 : false;
  });
  if (!entered) { console.log(`  [COMMENT] ⚠ 텍스트 입력 실패`); return false; }

  // Click 등록
  try {
    const btn = mainFrame.locator('button:text-is("등록")').first();
    if (await btn.count() > 0) await btn.click({ timeout: 3000 });
    else {
      await mainFrame.evaluate(() => {
        document.querySelectorAll('button').forEach(b => {
          if (b.textContent.trim() === '등록' && b.closest('[class*="cbox"]')) b.click();
        });
      });
    }
  } catch {
    await mainFrame.evaluate(() => {
      document.querySelectorAll('button').forEach(b => { if (b.textContent.trim() === '등록') b.click(); });
    });
  }

  await page.waitForTimeout(2000);

  // Verify
  const posted = await mainFrame.evaluate(() => {
    const el = document.querySelector('.u_cbox_text, [title="댓글"]');
    return !el || (el.textContent || '').trim().length === 0;
  });

  if (posted) {
    result.comment_written = true;
    result.comment_text = comment;
    console.log(`  [COMMENT] ✅ "${comment.substring(0, 35)}..."`);
    return true;
  } else {
    console.log(`  [COMMENT] ⚠ 등록 확인 실패`);
    return false;
  }
}

/**
 * Main interaction function: human-like engagement with a blog post
 * Now reads actual post content before commenting for relevance.
 */
async function processCommentAndLike(page, blogger, result) {
  try {
    // Navigate to the post
    let mainFrame = await navigateToPost(page, blogger);
    if (!mainFrame) {
      console.log(`  [SKIP] 게시글 접근 실패`);
      return;
    }

    // --- READ POST CONTENT (for relevant comments) ---
    let postContent = null;
    try {
      postContent = await readPostContent(mainFrame);
      if (postContent.title) {
        console.log(`  [READ] 글 제목: "${postContent.title.substring(0, 40)}..." (토픽: ${postContent.topics.slice(0, 3).join(', ')})`);
      }
    } catch (err) {
      console.log(`  [READ] ⚠ 콘텐츠 읽기 실패, 폴백 사용`);
    }

    // Decide behavior randomly (human-like)
    const plan = decideBehavior();

    // --- Simulate reading: scroll around a bit ---
    await mainFrame.evaluate(() => {
      window.scrollTo(0, Math.floor(Math.random() * 500) + 200);
    });
    await page.waitForTimeout(1000 + Math.floor(Math.random() * 2000));

    // --- LIKE POST ---
    if (plan.likePost) {
      await likePost(page, mainFrame, result);
      await page.waitForTimeout(500 + Math.floor(Math.random() * 1500));
    }

    // --- EXPAND COMMENT SECTION ---
    const commentReady = await expandCommentSection(page, mainFrame);
    // Re-acquire mainFrame after possible DOM changes
    mainFrame = page.frame('mainFrame');
    if (!mainFrame || !commentReady) {
      if (plan.newComment || plan.replyComment || plan.likeComments) {
        console.log(`  [COMMENT] ⚠ 댓글 영역 로드 안됨`);
      }
      return;
    }

    // --- LIKE EXISTING COMMENTS ---
    if (plan.likeComments) {
      await page.waitForTimeout(500 + Math.floor(Math.random() * 1000));
      await likeExistingComments(page, mainFrame, result);
    }

    // --- REPLY TO EXISTING COMMENT ---
    if (plan.replyComment) {
      await page.waitForTimeout(1000 + Math.floor(Math.random() * 2000));
      await replyToExistingComment(page, mainFrame, result);
    }

    // --- WRITE NEW COMMENT ---
    if (plan.newComment) {
      await page.waitForTimeout(1000 + Math.floor(Math.random() * 2000));
      // Re-acquire mainFrame in case reply changed things
      mainFrame = page.frame('mainFrame');
      if (mainFrame) {
        await writeNewComment(page, mainFrame, result, postContent);
      }
    }

  } catch (err) {
    const msg = err && err.message ? err.message.substring(0, 80) : String(err).substring(0, 80);
    console.log(`  [INTERACTION] ⚠ ${msg}`);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log(`🤝 네이버 블로그 이웃 확보 자동화`);
  console.log(`   목표: ${TARGET_COUNT}명 | niche: ${NICHE}`);
  console.log(`   모드: ${DRY_RUN ? 'DRY RUN (수집만)' : 'FULL (이웃+댓글+답글+공감)'}`);
  console.log('='.repeat(60));

  fs.mkdirSync(COMMUNITY_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: false,
    args: ['--lang=ko-KR']
  });
  const context = await browser.newContext({
    locale: 'ko-KR',
    viewport: { width: 1280, height: 900 }
  });

  // Login with a dedicated page
  const loginPage = await context.newPage();
  const loggedIn = await login(loginPage);
  if (!loggedIn) {
    console.error('로그인 실패. 종료합니다.');
    await browser.close();
    process.exit(1);
  }

  // Search bloggers using loginPage
  const keywords = getKeywords(NICHE, EXTRA_KEYWORDS);
  const allBloggers = new Map();

  console.log(`\n[SEARCH] ${keywords.length}개 키워드에서 블로거 검색 중...`);

  for (const keyword of keywords) {
    if (allBloggers.size >= TARGET_COUNT * 2) break;

    console.log(`  키워드: "${keyword}"`);
    const found = await searchBloggers(loginPage, keyword);

    for (const blogger of found) {
      if (!allBloggers.has(blogger.blogId)) {
        allBloggers.set(blogger.blogId, { ...blogger, keyword });
      }
    }
    console.log(`  → ${found.length}명 발견 (총 ${allBloggers.size}명)`);
    await randomDelay(1000, 2000);
  }

  await loginPage.close();

  const targetBloggers = Array.from(allBloggers.values()).slice(0, TARGET_COUNT);

  console.log(`\n[TARGET] ${targetBloggers.length}명 대상 선정`);
  targetBloggers.forEach((b, i) => {
    console.log(`  ${i + 1}. ${b.blogId} (${b.name}) [${b.keyword}]`);
  });

  if (DRY_RUN) {
    console.log('\n[DRY RUN] 수집만 완료.');
    fs.writeFileSync(
      path.join(COMMUNITY_DIR, `collected_${new Date().toISOString().split('T')[0]}.json`),
      JSON.stringify({ date: new Date().toISOString(), bloggers: targetBloggers }, null, 2)
    );
    await browser.close();
    return;
  }

  // Process each blogger with SEPARATE pages (avoids popup page-close issue)
  const activityLog = {
    date: new Date().toISOString().split('T')[0],
    campaign: NICHE,
    target_count: TARGET_COUNT,
    neighbors_completed: 0,
    neighbors_failed: 0,
    comments_written: 0,
    replies_written: 0,
    post_likes: 0,
    comment_likes: 0,
    blogs: []
  };

  for (let i = 0; i < targetBloggers.length; i++) {
    const blogger = targetBloggers[i];
    console.log(`\n[${i + 1}/${targetBloggers.length}] ${blogger.blogId} (${blogger.name}) [${blogger.keyword}]`);

    const blogResult = await processBlogger(context, blogger, i);
    activityLog.blogs.push(blogResult);

    if (blogResult.neighbor_status === 'mutual_requested' || blogResult.neighbor_status === 'neighbor_added') {
      activityLog.neighbors_completed++;
    } else if (blogResult.neighbor_status === 'error') {
      activityLog.neighbors_failed++;
    }
    if (blogResult.comment_written) activityLog.comments_written++;
    if (blogResult.reply_written) activityLog.replies_written++;
    if (blogResult.liked) activityLog.post_likes++;
    if (blogResult.comment_likes) activityLog.comment_likes += blogResult.comment_likes;

    // Save progress incrementally
    const logPath = path.join(COMMUNITY_DIR, `activity_log_${activityLog.date}.json`);
    fs.writeFileSync(logPath, JSON.stringify(activityLog, null, 2));

    // Anti-bot: break every 10
    if ((i + 1) % 10 === 0 && i < targetBloggers.length - 1) {
      const breakSec = 60 + Math.floor(Math.random() * 60);
      console.log(`\n[BREAK] ${breakSec}초 휴식...`);
      await new Promise(r => setTimeout(r, breakSec * 1000));
    } else {
      await randomDelay(3000, 8000);
    }
  }

  const logPath = path.join(COMMUNITY_DIR, `activity_log_${activityLog.date}.json`);
  fs.writeFileSync(logPath, JSON.stringify(activityLog, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log(`✅ 이웃 확보 완료!`);
  console.log(`   이웃 신청: ${activityLog.neighbors_completed}`);
  console.log(`   댓글 작성: ${activityLog.comments_written}`);
  console.log(`   답글 작성: ${activityLog.replies_written}`);
  console.log(`   게시글 공감: ${activityLog.post_likes}`);
  console.log(`   댓글 공감: ${activityLog.comment_likes}`);
  console.log(`   기록: ${logPath}`);
  console.log('='.repeat(60));

  await browser.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
