/**
 * Naver Blog Metrics Collector
 * Visits each blog post URL and extracts view count, like count, and comment count.
 *
 * Usage: node scripts/analytics/collect-naver-metrics.js
 * Output: workspace/analytics/daily/performance_YYYYMMDD.json
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..', '..', 'workspace');
const OUTPUT_DIR = path.join(WORKSPACE, 'analytics', 'daily');

// All published posts
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

async function extractMetrics(page, post) {
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
    // Navigate to the post
    await page.goto(post.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(3000);

    // Wait for content to load
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {
      // Continue anyway
    }

    // Naver blog posts are often in an iframe
    // First check if we need to deal with the iframe
    const metrics = await page.evaluate(() => {
      const data = { title: '', views: 0, likes: 0, comments: 0 };

      // Try to get title
      const titleEl = document.querySelector('.se-title-text, .pcol1, .se-fs-, .se_title, h3.se_textarea');
      if (titleEl) data.title = titleEl.textContent.trim();

      // Try post title from different selectors
      if (!data.title) {
        const h3 = document.querySelector('.se-module-text h3, .se-title-text span');
        if (h3) data.title = h3.textContent.trim();
      }

      // Look for title in Open Graph meta
      if (!data.title) {
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) data.title = ogTitle.getAttribute('content') || '';
      }

      // View count - multiple selector patterns for Naver blog
      const viewSelectors = [
        '.blog_viewer_count em',
        '.blog2_series span.num',
        '.wrap_info .num',
        '.blog_viewer_count',
        '.se_viewer .u_cnt',
        '.post-btn .u_cnt',
        '.post_info_area .post_date + span',
        '#viewCount'
      ];
      for (const sel of viewSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const num = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(num) && num > 0) { data.views = num; break; }
        }
      }

      // Like/sympathy count
      const likeSelectors = [
        '.u_likeit_list_module .u_cnt',
        '.post-btn .u_cnt',
        '.like_article em.u_cnt',
        '.sympathy_count em',
        '.u_likeit_list_count .u_cnt',
        'em.u_cnt._count'
      ];
      for (const sel of likeSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const num = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(num)) { data.likes = num; break; }
        }
      }

      // Comment count
      const commentSelectors = [
        '.comment_count em',
        '.wrap_postdata .num',
        '.post-btn .u_cnt',
        '.u_cbox_count em',
        '#commentCount',
        '.comment_area .num'
      ];
      for (const sel of commentSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const num = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(num)) { data.comments = num; break; }
        }
      }

      return data;
    });

    // If metrics not found in main page, try the iframe
    if (metrics.views === 0 && metrics.title === '') {
      try {
        // Naver blog uses mainFrame iframe
        const frame = page.frame('mainFrame') || page.frames().find(f => f.url().includes('PostView'));
        if (frame) {
          const iframeMetrics = await frame.evaluate(() => {
            const data = { title: '', views: 0, likes: 0, comments: 0 };

            // Title
            const titleEl = document.querySelector('.se-title-text, .pcol1, .se_title, .se-fs-');
            if (titleEl) data.title = titleEl.textContent.trim();
            if (!data.title) {
              const spans = document.querySelectorAll('.se-title-text span, .se-text-paragraph span');
              for (const s of spans) {
                const t = s.textContent.trim();
                if (t.length > 5 && t.length < 200) { data.title = t; break; }
              }
            }

            // Views
            const viewEl = document.querySelector('.blog_viewer_count em, .wrap_info .num');
            if (viewEl) {
              const num = parseInt(viewEl.textContent.replace(/[^0-9]/g, ''), 10);
              if (!isNaN(num)) data.views = num;
            }

            // Likes
            const likeEl = document.querySelector('.u_likeit_list_module .u_cnt, em.u_cnt._count');
            if (likeEl) {
              const num = parseInt(likeEl.textContent.replace(/[^0-9]/g, ''), 10);
              if (!isNaN(num)) data.likes = num;
            }

            // Comments
            const commentEl = document.querySelector('.u_cbox_count em, .comment_count em');
            if (commentEl) {
              const num = parseInt(commentEl.textContent.replace(/[^0-9]/g, ''), 10);
              if (!isNaN(num)) data.comments = num;
            }

            return data;
          });

          if (iframeMetrics.title) metrics.title = iframeMetrics.title;
          if (iframeMetrics.views > 0) metrics.views = iframeMetrics.views;
          if (iframeMetrics.likes > 0) metrics.likes = iframeMetrics.likes;
          if (iframeMetrics.comments > 0) metrics.comments = iframeMetrics.comments;
        }
      } catch (e) {
        console.log(`  iframe extraction failed for ${post.id}: ${e.message.substring(0, 60)}`);
      }
    }

    // Try alternative approach: look at the page text content for numbers
    if (metrics.views === 0) {
      try {
        // Try to find view count from the page text
        const pageText = await page.evaluate(() => document.body.innerText);

        // Look for patterns like "조회 123" or "조회수 123"
        const viewMatch = pageText.match(/조회[수]?\s*[:\s]*(\d[\d,]*)/);
        if (viewMatch) {
          metrics.views = parseInt(viewMatch[1].replace(/,/g, ''), 10);
        }

        // Look for comment count pattern
        const commentMatch = pageText.match(/댓글\s*(\d+)/);
        if (commentMatch) {
          metrics.comments = parseInt(commentMatch[1], 10);
        }

        // Look for like count
        const likeMatch = pageText.match(/공감\s*(\d+)/);
        if (likeMatch) {
          metrics.likes = parseInt(likeMatch[1], 10);
        }
      } catch (e) {}
    }

    // Take a screenshot for debugging the first post
    if (post.id === 'C001') {
      const screenshotDir = path.join(WORKSPACE, 'analytics', 'debug');
      fs.mkdirSync(screenshotDir, { recursive: true });
      await page.screenshot({ path: path.join(screenshotDir, `${post.id}_page.png`), fullPage: false });
    }

    result.title = metrics.title;
    result.views = metrics.views;
    result.likes = metrics.likes;
    result.comments = metrics.comments;
    result.status = 'collected';

  } catch (e) {
    result.status = 'error';
    result.error = e.message.substring(0, 200);
    console.log(`  ERROR collecting ${post.id}: ${e.message.substring(0, 80)}`);
  }

  return result;
}

async function main() {
  console.log('=== Naver Blog Metrics Collector ===');
  console.log(`Collecting metrics for ${POSTS.length} posts...\n`);

  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: false,
    slowMo: 30,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'ko-KR'
  });

  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  const results = [];

  for (let i = 0; i < POSTS.length; i++) {
    const post = POSTS[i];
    console.log(`[${i + 1}/${POSTS.length}] ${post.id} (${post.topic}) — ${post.url}`);

    const metrics = await extractMetrics(page, post);
    results.push(metrics);

    console.log(`  Title: ${metrics.title ? metrics.title.substring(0, 50) : '(not found)'}`);
    console.log(`  Views: ${metrics.views} | Likes: ${metrics.likes} | Comments: ${metrics.comments}`);
    console.log(`  Status: ${metrics.status}\n`);

    // Small delay between requests
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
  console.log(`Total views: ${output.summary.total_views}`);
  console.log(`Average views: ${output.summary.avg_views}`);
  console.log(`Total likes: ${output.summary.total_likes}`);
  console.log(`Total comments: ${output.summary.total_comments}`);

  await browser.close();
  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
