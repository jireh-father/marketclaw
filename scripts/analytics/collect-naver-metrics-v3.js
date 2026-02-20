/**
 * Naver Blog Metrics Collector v3
 * - Likes: span.u_likeit_text._count.num (first occurrence, the "like" type)
 * - Comments: regex from page text
 * - Views: Login to Naver first, then visit desktop blog admin stats page
 *
 * Usage: node scripts/analytics/collect-naver-metrics-v3.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..', '..', 'workspace');
const OUTPUT_DIR = path.join(WORKSPACE, 'analytics', 'daily');
const DEBUG_DIR = path.join(WORKSPACE, 'analytics', 'debug');

// Load .env
const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        let value = trimmed.substring(eqIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  });
}

const NAVER_USERNAME = process.env.NAVER_USERNAME;
const NAVER_PASSWORD = process.env.NAVER_PASSWORD;
const BLOG_ID = (process.env.NAVER_BLOG_ID || NAVER_USERNAME || 'seoilgun').trim();

const POSTS = [
  { id: 'C001', topic: '허쉬컷', url: 'https://blog.naver.com/seoilgun/224180269282', postId: '224180269282', type: 'original', date: '2026-02-11' },
  { id: 'C002', topic: '중단발', url: 'https://blog.naver.com/seoilgun/224180293152', postId: '224180293152', type: 'original', date: '2026-02-11' },
  { id: 'C003', topic: '펌비교', url: 'https://blog.naver.com/seoilgun/224181028087', postId: '224181028087', type: 'original', date: '2026-02-12' },
  { id: 'C004', topic: '컬러멜팅', url: 'https://blog.naver.com/seoilgun/224181071362', postId: '224181071362', type: 'original', date: '2026-02-12' },
  { id: 'C005', topic: '남자헤어TOP5', url: 'https://blog.naver.com/seoilgun/224181125758', postId: '224181125758', type: 'original', date: '2026-02-12' },
  { id: 'C006', topic: '앞머리가이드', url: 'https://blog.naver.com/seoilgun/224181480669', postId: '224181480669', type: 'original', date: '2026-02-12' },
  { id: 'C007', topic: '여자숏컷비교', url: 'https://blog.naver.com/seoilgun/224181512430', postId: '224181512430', type: 'original', date: '2026-02-12' },
  { id: 'C008', topic: '손상모관리루틴', url: 'https://blog.naver.com/seoilgun/224181573980', postId: '224181573980', type: 'original', date: '2026-02-12' },
  { id: 'C009', topic: '메시번vs슬릭번', url: 'https://blog.naver.com/seoilgun/224182263457', postId: '224182263457', type: 'original', date: '2026-02-13' },
  { id: 'C010', topic: '김고은한소희단발', url: 'https://blog.naver.com/seoilgun/224182286468', postId: '224182286468', type: 'celeb-style', date: '2026-02-13' },
  { id: 'C011', topic: '매직vs볼륨매직vs셋팅펌', url: 'https://blog.naver.com/seoilgun/224182577411', postId: '224182577411', type: 'original', date: '2026-02-13' },
  { id: 'C012', topic: '송혜교원진아유아숏컷', url: 'https://blog.naver.com/seoilgun/224183454753', postId: '224183454753', type: 'celeb-style', date: '2026-02-14' },
  { id: 'C013', topic: '퍼스널컬러별염색추천', url: 'https://blog.naver.com/seoilgun/224183737945', postId: '224183737945', type: 'original', date: '2026-02-14' },
  { id: 'C014', topic: '셀프스타일링가이드', url: 'https://blog.naver.com/seoilgun/224183768890', postId: '224183768890', type: 'original', date: '2026-02-14' },
  { id: 'C015', topic: '거지존롭스타일링', url: 'https://blog.naver.com/seoilgun/224186083225', postId: '224186083225', type: 'original', date: '2026-02-17' },
  { id: 'C016', topic: '버즈컷가이드', url: 'https://blog.naver.com/seoilgun/224186084530', postId: '224186084530', type: 'original', date: '2026-02-17' },
  { id: 'C017', topic: '봄염색컬러TOP7', url: 'https://blog.naver.com/seoilgun/224186086154', postId: '224186086154', type: 'original', date: '2026-02-17' },
  { id: 'C018', topic: '블랙핑크컴백헤어', url: 'https://blog.naver.com/seoilgun/224187262823', postId: '224187262823', type: 'celeb-style', date: '2026-02-18' },
  { id: 'C019', topic: '버킨뱅앞머리비교', url: 'https://blog.naver.com/seoilgun/224187265195', postId: '224187265195', type: 'original', date: '2026-02-18' },
  { id: 'C020', topic: '팅커벨컷보브컷롭컷', url: 'https://blog.naver.com/seoilgun/224187267282', postId: '224187267282', type: 'original', date: '2026-02-18' },
  { id: 'C021', topic: '웨이브펌비교', url: 'https://blog.naver.com/seoilgun/224187603216', postId: '224187603216', type: 'original', date: '2026-02-18' },
  { id: 'C022', topic: '제니숏컷', url: 'https://blog.naver.com/seoilgun/224187605512', postId: '224187605512', type: 'celeb-style', date: '2026-02-18' },
  { id: 'C023', topic: '카리나단발', url: 'https://blog.naver.com/seoilgun/224187607349', postId: '224187607349', type: 'celeb-style', date: '2026-02-18' },
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function login(page) {
  console.log('=== Logging in to Naver ===');
  await page.goto('https://nid.naver.com/nidlogin.login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);

  await page.evaluate((u) => {
    const e = document.querySelector('#id');
    if (e) { e.focus(); e.value = u; e.dispatchEvent(new Event('input', { bubbles: true })); }
  }, NAVER_USERNAME);
  await sleep(500);
  await page.evaluate((p) => {
    const e = document.querySelector('#pw');
    if (e) { e.focus(); e.value = p; e.dispatchEvent(new Event('input', { bubbles: true })); }
  }, NAVER_PASSWORD);
  await sleep(500);

  try { await page.click('#log\\.login', { timeout: 5000 }); } catch (e) {
    try { await page.click('button.btn_login', { timeout: 3000 }); } catch (e2) {
      await page.evaluate(() => { const f = document.querySelector('#frmNIDLogin'); if (f) f.submit(); });
    }
  }
  await sleep(6000);
  try { await page.waitForLoadState('networkidle', { timeout: 15000 }); } catch (e) {}

  const url = page.url();
  console.log(`After login URL: ${url}`);

  if (url.includes('nidlogin') || url.includes('login')) {
    console.log('Retrying login with execCommand...');
    await page.click('#id'); await sleep(200);
    await page.keyboard.down('Control'); await page.keyboard.press('a'); await page.keyboard.up('Control');
    await page.keyboard.press('Backspace'); await sleep(200);
    await page.evaluate((t) => { document.querySelector('#id').focus(); document.execCommand('insertText', false, t); }, NAVER_USERNAME);
    await sleep(500);
    await page.click('#pw'); await sleep(200);
    await page.keyboard.down('Control'); await page.keyboard.press('a'); await page.keyboard.up('Control');
    await page.keyboard.press('Backspace'); await sleep(200);
    await page.evaluate((t) => { document.querySelector('#pw').focus(); document.execCommand('insertText', false, t); }, NAVER_PASSWORD);
    await sleep(500);
    await page.click('#log\\.login'); await sleep(6000);
    try { await page.waitForLoadState('networkidle', { timeout: 15000 }); } catch (e) {}
    console.log(`After retry URL: ${page.url()}`);
  }

  if (page.url().includes('captcha')) { console.log('CAPTCHA detected! Waiting 90s...'); await sleep(90000); }
  try { const l = await page.$('button:has-text("나중에")'); if (l) { await l.click(); await sleep(1000); } } catch (e) {}

  const loggedIn = !page.url().includes('nidlogin');
  console.log(`Login ${loggedIn ? 'successful' : 'FAILED'}\n`);
  return loggedIn;
}

async function extractMetricsFromPost(page, post, isDebug) {
  const result = {
    id: post.id,
    topic: post.topic,
    url: post.url,
    type: post.type,
    published_date: post.date,
    title: '',
    views: 0,
    likes: 0,
    comments: 0,
    collected_at: new Date().toISOString(),
    status: 'pending'
  };

  try {
    // Use mobile URL for likes/comments (cleaner DOM)
    const mobileUrl = `https://m.blog.naver.com/seoilgun/${post.postId}`;
    await page.goto(mobileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(3000);
    try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch (e) {}

    if (isDebug) {
      fs.mkdirSync(DEBUG_DIR, { recursive: true });
      await page.screenshot({ path: path.join(DEBUG_DIR, `${post.id}_v3.png`), fullPage: false });
    }

    // Extract metrics
    const metrics = await page.evaluate(() => {
      const data = { title: '', views: 0, likes: 0, comments: 0, allReactions: 0 };

      // Title from og:title meta tag (most reliable)
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) data.title = ogTitle.getAttribute('content') || '';
      if (!data.title) data.title = document.title.replace(' : 네이버 블로그', '').trim();

      // === Likes (공감) ===
      // The first .u_likeit_list.like .u_likeit_list_count._count contains the like count
      const likeCountEl = document.querySelector('.u_likeit_list.like .u_likeit_list_count._count');
      if (likeCountEl) {
        const num = parseInt(likeCountEl.textContent.trim(), 10);
        if (!isNaN(num)) data.likes = num;
      }

      // Also get total reactions from u_likeit_text._count.num
      const totalReactionEl = document.querySelector('.u_likeit_text._count.num');
      if (totalReactionEl) {
        const num = parseInt(totalReactionEl.textContent.trim(), 10);
        if (!isNaN(num)) data.allReactions = num;
      }

      // === Comments ===
      // Look for comment count in text
      const bodyText = document.body.innerText;
      const commentMatch = bodyText.match(/댓글\s*(\d+)/);
      if (commentMatch) {
        data.comments = parseInt(commentMatch[1], 10);
      }

      // Also try: number__ifGfl class (from v2 debug, this had "1" for comment count display)
      const numEl = document.querySelector('.number__ifGfl');
      if (numEl) {
        const num = parseInt(numEl.textContent.trim(), 10);
        if (!isNaN(num) && num > data.comments) data.comments = num;
      }

      // === Views ===
      // On mobile, view count may appear for logged-in blog owner
      const viewMatch = bodyText.match(/조회[수]?\s*[:：]?\s*([\d,]+)/);
      if (viewMatch) {
        data.views = parseInt(viewMatch[1].replace(/,/g, ''), 10);
      }

      return data;
    });

    result.title = metrics.title || post.topic;
    result.views = metrics.views;
    result.likes = metrics.allReactions > 0 ? metrics.allReactions : metrics.likes; // allReactions includes all types
    result.comments = metrics.comments;
    result.status = 'collected';

  } catch (e) {
    result.status = 'error';
    result.error = e.message.substring(0, 200);
    console.log(`  ERROR: ${e.message.substring(0, 80)}`);
  }

  return result;
}

async function getViewsFromStats(page) {
  console.log('\n=== Fetching view counts from blog stats page ===');

  // Try the Naver Blog admin statistics page
  // Method 1: Blog admin > 통계 (Statistics)
  const viewCounts = {};

  try {
    // Navigate to blog admin stats
    await page.goto(`https://blog.naver.com/BlogStatisticsList.naver?blogId=${BLOG_ID}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(3000);
    try { await page.waitForLoadState('networkidle', { timeout: 10000 }); } catch (e) {}

    await page.screenshot({ path: path.join(DEBUG_DIR, 'stats_page.png'), fullPage: false });
    console.log(`Stats page URL: ${page.url()}`);

    // Check if we landed on the stats page
    const pageContent = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log(`Stats page content preview: ${pageContent.substring(0, 200)}`);

  } catch (e) {
    console.log(`Stats page navigation failed: ${e.message.substring(0, 80)}`);
  }

  // Method 2: Try individual post pages on desktop (logged-in) where view count is shown
  try {
    // Navigate to the desktop version of a blog post while logged in
    // On desktop Naver blog, logged-in blog owner sees view count
    for (const post of POSTS.slice(0, 1)) { // Test with first post
      await page.goto(post.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(4000);
      try { await page.waitForLoadState('networkidle', { timeout: 10000 }); } catch (e) {}

      await page.screenshot({ path: path.join(DEBUG_DIR, `${post.id}_desktop_loggedin.png`), fullPage: false });

      // Try to get view count from the iframe
      const frames = page.frames();
      console.log(`  Desktop page frames: ${frames.length}`);
      for (const frame of frames) {
        const frameUrl = frame.url();
        if (frameUrl.includes('PostView') || frameUrl.includes('PostList')) {
          console.log(`  Found content frame: ${frameUrl.substring(0, 100)}`);
          try {
            const viewData = await frame.evaluate(() => {
              const bodyText = document.body.innerText;
              const match = bodyText.match(/조회[수]?\s*[:：]?\s*([\d,]+)/);

              // Also look for specific elements
              const viewEl = document.querySelector('.blog_viewer_count em, .post_btn .num');
              const viewNum = viewEl ? viewEl.textContent.trim() : '';

              return {
                regexMatch: match ? match[1] : null,
                elementText: viewNum,
                bodyPreview: bodyText.substring(0, 300)
              };
            });
            console.log(`  Frame view data: ${JSON.stringify(viewData)}`);
          } catch (e) {
            console.log(`  Frame evaluate error: ${e.message.substring(0, 60)}`);
          }
        }
      }
    }
  } catch (e) {
    console.log(`Desktop view extraction failed: ${e.message.substring(0, 80)}`);
  }

  // Method 3: Try the Naver Blog API for blog owner stats
  try {
    // This API endpoint returns post statistics for the blog owner
    await page.goto(`https://blog.naver.com/NBlogStatApi.naver?blogId=${BLOG_ID}&widgetType=ARTICLE_TREND`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(2000);
    const apiResponse = await page.evaluate(() => document.body.innerText);
    console.log(`API response preview: ${apiResponse.substring(0, 300)}`);

    if (apiResponse.startsWith('{') || apiResponse.startsWith('[')) {
      const data = JSON.parse(apiResponse);
      console.log(`API parsed successfully: ${JSON.stringify(data).substring(0, 200)}`);
    }
  } catch (e) {
    console.log(`Blog API failed: ${e.message.substring(0, 80)}`);
  }

  // Method 4: Try post-level API
  try {
    const postId = POSTS[0].postId;
    await page.goto(`https://blog.naver.com/PostViewBottomTitleListAsync.naver?blogId=${BLOG_ID}&logNo=${postId}&categoryNo=0`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(2000);
    const apiResponse = await page.evaluate(() => document.body.innerText);
    console.log(`Post API response: ${apiResponse.substring(0, 300)}`);
  } catch (e) {
    console.log(`Post API failed: ${e.message.substring(0, 80)}`);
  }

  return viewCounts;
}

async function main() {
  console.log('=== Naver Blog Metrics Collector v3 ===');
  console.log(`Blog: ${BLOG_ID}`);
  console.log(`Posts: ${POSTS.length}\n`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(DEBUG_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: false,
    slowMo: 20,
    args: ['--disable-blink-features=AutomationControlled']
  });

  // Use desktop context for login and stats
  const desktopContext = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'ko-KR'
  });
  const desktopPage = await desktopContext.newPage();
  desktopPage.setDefaultTimeout(30000);

  // Login first
  let loggedIn = false;
  if (NAVER_USERNAME && NAVER_PASSWORD) {
    loggedIn = await login(desktopPage);
  } else {
    console.log('No Naver credentials found. Skipping login.\n');
  }

  // Try to get view counts from stats page (requires login)
  let viewCounts = {};
  if (loggedIn) {
    viewCounts = await getViewsFromStats(desktopPage);
  }

  // Now collect likes and comments from mobile pages (no login needed)
  const mobileContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
    locale: 'ko-KR',
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  mobilePage.setDefaultTimeout(30000);

  console.log('\n=== Collecting post metrics ===\n');
  const results = [];

  for (let i = 0; i < POSTS.length; i++) {
    const post = POSTS[i];
    const isDebug = i < 2;
    console.log(`[${i + 1}/${POSTS.length}] ${post.id} (${post.topic})`);

    const metrics = await extractMetricsFromPost(mobilePage, post, isDebug);

    // Merge view counts from stats if available
    if (viewCounts[post.postId]) {
      metrics.views = viewCounts[post.postId];
    }

    // If we're logged in, also try desktop page for views
    if (loggedIn && metrics.views === 0) {
      try {
        await desktopPage.goto(post.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await sleep(3000);
        try { await desktopPage.waitForLoadState('networkidle', { timeout: 8000 }); } catch (e) {}

        // Look for view count in iframe
        const frames = desktopPage.frames();
        for (const frame of frames) {
          if (frame.url().includes('PostView') || frame.url().includes('blog.naver.com')) {
            try {
              const viewData = await frame.evaluate(() => {
                // View count on desktop naver blog for owner
                const viewEl = document.querySelector('.post_date + span, .blog_viewer_count em');
                if (viewEl) return parseInt(viewEl.textContent.replace(/[^0-9]/g, ''), 10);

                const bodyText = document.body.innerText;
                const match = bodyText.match(/조회[수]?\s*[:：]?\s*([\d,]+)/);
                if (match) return parseInt(match[1].replace(/,/g, ''), 10);
                return 0;
              });
              if (viewData > 0) {
                metrics.views = viewData;
                break;
              }
            } catch (e) {}
          }
        }
      } catch (e) {
        // Ignore errors
      }
    }

    results.push(metrics);
    console.log(`  Title: ${metrics.title ? metrics.title.substring(0, 50) : '(no title)'}...`);
    console.log(`  Views: ${metrics.views} | Likes: ${metrics.likes} | Comments: ${metrics.comments}\n`);

    await sleep(1000);
  }

  // Save results
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const outputPath = path.join(OUTPUT_DIR, `performance_${today}.json`);

  const output = {
    collected_at: new Date().toISOString(),
    collection_method: 'playwright_v3_mobile+desktop',
    total_posts: results.length,
    logged_in: loggedIn,
    summary: {
      total_views: results.reduce((s, r) => s + r.views, 0),
      total_likes: results.reduce((s, r) => s + r.likes, 0),
      total_comments: results.reduce((s, r) => s + r.comments, 0),
      avg_views: Math.round(results.reduce((s, r) => s + r.views, 0) / results.length),
      avg_likes: Math.round(results.reduce((s, r) => s + r.likes, 0) / results.length * 10) / 10,
      avg_comments: Math.round(results.reduce((s, r) => s + r.comments, 0) / results.length * 10) / 10,
      posts_with_views: results.filter(r => r.views > 0).length,
      posts_with_likes: results.filter(r => r.likes > 0).length,
      posts_with_comments: results.filter(r => r.comments > 0).length,
    },
    posts: results
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n=== Results saved to ${outputPath} ===`);
  console.log(`Summary:`);
  console.log(`  Total views: ${output.summary.total_views} (${output.summary.posts_with_views} posts with views)`);
  console.log(`  Total likes: ${output.summary.total_likes} (${output.summary.posts_with_likes} posts with likes)`);
  console.log(`  Total comments: ${output.summary.total_comments} (${output.summary.posts_with_comments} posts with comments)`);
  console.log(`  Average: ${output.summary.avg_views} views, ${output.summary.avg_likes} likes, ${output.summary.avg_comments} comments`);

  await browser.close();
  console.log('\nDone!');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
