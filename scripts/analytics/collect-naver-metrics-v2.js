/**
 * Naver Blog Metrics Collector v2
 * Uses iframe navigation and comprehensive selector search.
 * Takes a screenshot of the first post for debugging.
 *
 * Usage: node scripts/analytics/collect-naver-metrics-v2.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..', '..', 'workspace');
const OUTPUT_DIR = path.join(WORKSPACE, 'analytics', 'daily');
const DEBUG_DIR = path.join(WORKSPACE, 'analytics', 'debug');

const POSTS = [
  { id: 'C001', topic: '허쉬컷', url: 'https://blog.naver.com/seoilgun/224180269282', type: 'original', date: '2026-02-11' },
  { id: 'C002', topic: '중단발', url: 'https://blog.naver.com/seoilgun/224180293152', type: 'original', date: '2026-02-11' },
  { id: 'C003', topic: '펌비교', url: 'https://blog.naver.com/seoilgun/224181028087', type: 'original', date: '2026-02-12' },
  { id: 'C004', topic: '컬러멜팅', url: 'https://blog.naver.com/seoilgun/224181071362', type: 'original', date: '2026-02-12' },
  { id: 'C005', topic: '남자헤어TOP5', url: 'https://blog.naver.com/seoilgun/224181125758', type: 'original', date: '2026-02-12' },
  { id: 'C006', topic: '앞머리가이드', url: 'https://blog.naver.com/seoilgun/224181480669', type: 'original', date: '2026-02-12' },
  { id: 'C007', topic: '여자숏컷비교', url: 'https://blog.naver.com/seoilgun/224181512430', type: 'original', date: '2026-02-12' },
  { id: 'C008', topic: '손상모관리루틴', url: 'https://blog.naver.com/seoilgun/224181573980', type: 'original', date: '2026-02-12' },
  { id: 'C009', topic: '메시번vs슬릭번', url: 'https://blog.naver.com/seoilgun/224182263457', type: 'original', date: '2026-02-13' },
  { id: 'C010', topic: '김고은한소희단발', url: 'https://blog.naver.com/seoilgun/224182286468', type: 'celeb-style', date: '2026-02-13' },
  { id: 'C011', topic: '매직vs볼륨매직vs셋팅펌', url: 'https://blog.naver.com/seoilgun/224182577411', type: 'original', date: '2026-02-13' },
  { id: 'C012', topic: '송혜교원진아유아숏컷', url: 'https://blog.naver.com/seoilgun/224183454753', type: 'celeb-style', date: '2026-02-14' },
  { id: 'C013', topic: '퍼스널컬러별염색추천', url: 'https://blog.naver.com/seoilgun/224183737945', type: 'original', date: '2026-02-14' },
  { id: 'C014', topic: '셀프스타일링가이드', url: 'https://blog.naver.com/seoilgun/224183768890', type: 'original', date: '2026-02-14' },
  { id: 'C015', topic: '거지존롭스타일링', url: 'https://blog.naver.com/seoilgun/224186083225', type: 'original', date: '2026-02-17' },
  { id: 'C016', topic: '버즈컷가이드', url: 'https://blog.naver.com/seoilgun/224186084530', type: 'original', date: '2026-02-17' },
  { id: 'C017', topic: '봄염색컬러TOP7', url: 'https://blog.naver.com/seoilgun/224186086154', type: 'original', date: '2026-02-17' },
  { id: 'C018', topic: '블랙핑크컴백헤어', url: 'https://blog.naver.com/seoilgun/224187262823', type: 'celeb-style', date: '2026-02-18' },
  { id: 'C019', topic: '버킨뱅앞머리비교', url: 'https://blog.naver.com/seoilgun/224187265195', type: 'original', date: '2026-02-18' },
  { id: 'C020', topic: '팅커벨컷보브컷롭컷', url: 'https://blog.naver.com/seoilgun/224187267282', type: 'original', date: '2026-02-18' },
  { id: 'C021', topic: '웨이브펌비교', url: 'https://blog.naver.com/seoilgun/224187603216', type: 'original', date: '2026-02-18' },
  { id: 'C022', topic: '제니숏컷', url: 'https://blog.naver.com/seoilgun/224187605512', type: 'celeb-style', date: '2026-02-18' },
  { id: 'C023', topic: '카리나단발', url: 'https://blog.naver.com/seoilgun/224187607349', type: 'celeb-style', date: '2026-02-18' },
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Try to use the Naver Blog API or direct PostView URL approach
 * Naver blog posts at blog.naver.com/seoilgun/XXXX redirect to an iframe-based page.
 * The actual post content is in PostView.naver URL.
 * But we can also try the mobile version which renders without iframes.
 */
async function extractMetrics(page, post, debug) {
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
    // Use the mobile URL which doesn't use iframes and shows metrics directly
    const postId = post.url.split('/').pop();
    const mobileUrl = `https://m.blog.naver.com/seoilgun/${postId}`;

    await page.goto(mobileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(3000);

    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {}

    // Take debug screenshots for first 3 posts
    if (debug) {
      fs.mkdirSync(DEBUG_DIR, { recursive: true });
      await page.screenshot({ path: path.join(DEBUG_DIR, `${post.id}_mobile.png`), fullPage: false });

      // Also dump page HTML structure for analysis
      const htmlSnippet = await page.evaluate(() => {
        // Get all elements with class names containing count, view, like, comment
        const elements = document.querySelectorAll('[class*="count"], [class*="view"], [class*="like"], [class*="sympathy"], [class*="comment"], [class*="num"]');
        const results = [];
        elements.forEach(el => {
          results.push({
            tag: el.tagName,
            class: el.className.substring(0, 100),
            text: (el.textContent || '').trim().substring(0, 50),
            html: el.outerHTML.substring(0, 200)
          });
        });
        return results;
      });
      fs.writeFileSync(path.join(DEBUG_DIR, `${post.id}_elements.json`), JSON.stringify(htmlSnippet, null, 2));
    }

    // Extract metrics from mobile page
    const metrics = await page.evaluate(() => {
      const data = { title: '', views: 0, likes: 0, comments: 0, debug: {} };

      // Title - mobile version
      const titleEl = document.querySelector('.se-title-text, .se_title, .tit_h3, .__se_title span, .post_tit');
      if (titleEl) data.title = titleEl.textContent.trim();

      // Also try from document title or og:title
      if (!data.title) {
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) data.title = ogTitle.getAttribute('content') || '';
      }
      if (!data.title) {
        data.title = document.title.replace(' : 네이버 블로그', '').trim();
      }

      // === View count ===
      // Mobile Naver blog shows views in different places
      const viewSelectors = [
        // Common mobile selectors
        '.blog_viewer_count',
        '.view_count',
        '.se_viewer em',
        '.post_info .num',
        '.blog2_post_count em',
        'span.pcol2',
        // Look for "조회" label near a number
        '.blog_viewer_count em',
        '.post_info_area span.pcol2',
        '.date em.num'
      ];

      for (const sel of viewSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const text = el.textContent.trim();
          const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(num) && num > 0) {
            data.views = num;
            data.debug.viewSelector = sel;
            break;
          }
        }
      }

      // Broader search for view count
      if (data.views === 0) {
        const allText = document.body.innerText;
        // Look for "조회 N" or "조회수 N" pattern
        const viewMatch = allText.match(/조회[수]?\s*[:：]?\s*([\d,]+)/);
        if (viewMatch) {
          data.views = parseInt(viewMatch[1].replace(/,/g, ''), 10);
          data.debug.viewMethod = 'regex';
        }
      }

      // === Like count ===
      const likeSelectors = [
        '.u_likeit_list_module .u_cnt',
        'em.u_cnt._count',
        '.sympathy_count em',
        '.like_it_count .u_cnt',
        '.post_sympathy_count',
        '.wrap_btn_post .u_cnt'
      ];

      for (const sel of likeSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const num = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(num)) {
            data.likes = num;
            data.debug.likeSelector = sel;
            break;
          }
        }
      }

      // Broader search for likes
      if (data.likes === 0) {
        const allText = document.body.innerText;
        const likeMatch = allText.match(/공감\s*([\d,]+)/);
        if (likeMatch) {
          data.likes = parseInt(likeMatch[1].replace(/,/g, ''), 10);
          data.debug.likeMethod = 'regex';
        }
      }

      // === Comment count ===
      const commentSelectors = [
        '.u_cbox_count em',
        '.comment_count em',
        '.comment_area .num',
        '.wrap_btn_post .num',
        '#commentCount'
      ];

      for (const sel of commentSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const num = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(num)) {
            data.comments = num;
            data.debug.commentSelector = sel;
            break;
          }
        }
      }

      // Broader search for comments
      if (data.comments === 0) {
        const allText = document.body.innerText;
        const commentMatch = allText.match(/댓글\s*([\d,]+)/);
        if (commentMatch) {
          data.comments = parseInt(commentMatch[1].replace(/,/g, ''), 10);
          data.debug.commentMethod = 'regex';
        }
      }

      return data;
    });

    result.title = metrics.title || post.topic;
    result.views = metrics.views;
    result.likes = metrics.likes;
    result.comments = metrics.comments;
    result.status = 'collected';

    if (debug) {
      result.debug = metrics.debug;
    }

  } catch (e) {
    result.status = 'error';
    result.error = e.message.substring(0, 200);
    console.log(`  ERROR: ${e.message.substring(0, 80)}`);
  }

  return result;
}

async function main() {
  console.log('=== Naver Blog Metrics Collector v2 (Mobile) ===');
  console.log(`Collecting metrics for ${POSTS.length} posts...\n`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: false,
    slowMo: 20,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },  // Mobile viewport
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
    locale: 'ko-KR',
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  const results = [];

  for (let i = 0; i < POSTS.length; i++) {
    const post = POSTS[i];
    const debug = i < 3;  // Debug first 3 posts
    console.log(`[${i + 1}/${POSTS.length}] ${post.id} (${post.topic})`);

    const metrics = await extractMetrics(page, post, debug);
    results.push(metrics);

    console.log(`  Views: ${metrics.views} | Likes: ${metrics.likes} | Comments: ${metrics.comments}`);
    if (metrics.debug) console.log(`  Debug: ${JSON.stringify(metrics.debug)}`);

    await sleep(1500);
  }

  // Save results
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const outputPath = path.join(OUTPUT_DIR, `performance_${today}.json`);

  const output = {
    collected_at: new Date().toISOString(),
    total_posts: results.length,
    summary: {
      total_views: results.reduce((s, r) => s + r.views, 0),
      total_likes: results.reduce((s, r) => s + r.likes, 0),
      total_comments: results.reduce((s, r) => s + r.comments, 0),
      avg_views: Math.round(results.reduce((s, r) => s + r.views, 0) / results.length),
      avg_likes: Math.round(results.reduce((s, r) => s + r.likes, 0) / results.length * 10) / 10,
      avg_comments: Math.round(results.reduce((s, r) => s + r.comments, 0) / results.length * 10) / 10
    },
    posts: results
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n=== Results saved to ${outputPath} ===`);
  console.log(`Summary: ${output.summary.total_views} views, ${output.summary.total_likes} likes, ${output.summary.total_comments} comments`);

  await browser.close();
  console.log('Done!');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
