/**
 * Naver Blog Publisher via Playwright (v5.2)
 * Automates publishing to Naver Blog SmartEditor
 *
 * Key fixes in v5.2:
 * - Fixed buildImageMap to handle image_verification.json with local_path and id fields
 *   (not just filename) — extracts filename from local_path or id
 * - Added italic caption support: *caption* lines after images are entered with Ctrl+I
 *
 * Key fixes in v5.1:
 * - Increased default timeout to 30s
 * - Wrapped waitForLoadState in try/catch to prevent timeout crashes
 * - Changed login page goto to domcontentloaded instead of networkidle
 *
 * Key fixes in v5:
 * - Support [IMAGE: ...] markers from draft content
 * - Build image mapping from image_verification.json or ordered files
 * - Robust dialog dismissal with multiple fallback strategies
 * - Close help panel before starting
 * - Proper editor focus after dialog close
 * - Image upload via SmartEditor photo panel + file input
 * - Tag entry via Playwright keyboard (not just evaluate)
 *
 * Usage: node scripts/publish/naver-playwright.js <topic_id>
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TOPIC_ID = process.argv[2];
if (!TOPIC_ID) {
  console.error('Usage: node naver-playwright.js <topic_id>');
  process.exit(1);
}

// Load .env file
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
        } else {
          const ci = value.indexOf('#');
          if (ci > 0) value = value.substring(0, ci).trim();
        }
        process.env[key] = value;
      }
    }
  });
}

const NAVER_USERNAME = process.env.NAVER_USERNAME;
const NAVER_PASSWORD = process.env.NAVER_PASSWORD;
const BLOG_ID = (process.env.NAVER_BLOG_ID || NAVER_USERNAME || '').trim();

if (!NAVER_USERNAME || !NAVER_PASSWORD) {
  console.error('NAVER_USERNAME and NAVER_PASSWORD must be set');
  process.exit(1);
}

const WORKSPACE = path.join(__dirname, '..', '..', 'workspace');
const DRAFT_DIR = path.join(WORKSPACE, 'drafts', TOPIC_ID);
const IMAGES_DIR = path.join(DRAFT_DIR, 'images');
const contentPath = path.join(DRAFT_DIR, 'final_ko.md');
const metadataPath = path.join(DRAFT_DIR, 'metadata.json');

if (!fs.existsSync(contentPath)) { console.error(`Content not found: ${contentPath}`); process.exit(1); }

const content = fs.readFileSync(contentPath, 'utf-8');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
const title = metadata.title_ko || metadata.title;
const tags = metadata.tags || [];

// Build image mapping from image_verification.json or ordered files
function buildImageMap() {
  const imgVerPath = path.join(IMAGES_DIR, 'image_verification.json');
  const imageFiles = [];

  if (fs.existsSync(imgVerPath)) {
    const imgVer = JSON.parse(fs.readFileSync(imgVerPath, 'utf-8'));
    if (imgVer.images && Array.isArray(imgVer.images)) {
      for (const img of imgVer.images) {
        // Extract filename from: img.filename, img.local_path, or img.id
        let filename = img.filename;
        if (!filename && img.local_path) {
          filename = path.basename(img.local_path);
        }
        if (!filename && img.id) {
          // Try to find a file matching the id pattern (e.g., img_001 -> img_001.jpg)
          if (fs.existsSync(IMAGES_DIR)) {
            const candidates = fs.readdirSync(IMAGES_DIR).filter(f =>
              f.startsWith(img.id) && /\.(jpg|jpeg|png|gif|webp)$/i.test(f) && !f.includes('_final')
            );
            if (candidates.length > 0) filename = candidates[0];
          }
        }
        if (!filename) {
          console.log(`  WARNING: Cannot determine filename for image: ${JSON.stringify(img).substring(0, 80)}`);
          continue;
        }

        const fullPath = path.join(IMAGES_DIR, filename);
        if (fs.existsSync(fullPath)) {
          imageFiles.push({
            filename: filename,
            path: fullPath,
            placement: img.placement || '',
            alt: img.alt_text_ko || img.description || ''
          });
        } else {
          console.log(`  WARNING: Image file not found: ${fullPath}`);
        }
      }
    }
  }

  // Fallback: scan directory for image files in sorted order (exclude _final duplicates)
  if (imageFiles.length === 0 && fs.existsSync(IMAGES_DIR)) {
    const files = fs.readdirSync(IMAGES_DIR)
      .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f) && !f.includes('_final'))
      .sort();
    for (const f of files) {
      imageFiles.push({
        filename: f,
        path: path.join(IMAGES_DIR, f),
        placement: '',
        alt: ''
      });
    }
  }

  console.log(`  Image map: ${imageFiles.length} images available`);
  imageFiles.forEach(img => console.log(`    - ${img.filename}`));
  return imageFiles;
}

const imageMap = buildImageMap();
let nextImageIndex = 0; // Track which image to use next for [IMAGE:] markers

function isDivider(line) {
  const t = line.trim();
  return t === '---' || /^[─━]+$/.test(t) || /^-{3,}$/.test(t);
}
function isImageCredit(line) {
  const t = line.trim();
  return t.startsWith('*') && (t.includes('출처') || t.includes('Photo credit') || t.includes('Source:'));
}
function isImageCaption(line) {
  const t = line.trim();
  // Matches *italic caption text* pattern (starts and ends with *)
  return t.startsWith('*') && t.endsWith('*') && !t.startsWith('**') && t.length > 2;
}
function isImageMarker(line) {
  const t = line.trim();
  return t.startsWith('[IMAGE:') && t.endsWith(']');
}
function parseContent(md) {
  const lines = md.split('\n');
  const chunks = [];
  let i = 0;
  // Skip H1 title line
  if (lines[0] && lines[0].startsWith('# ')) { i = 1; while (i < lines.length && lines[i].trim() === '') i++; }
  // Find end of content (skip trailing tag line starting with #)
  let endLine = lines.length;
  for (let j = lines.length - 1; j >= 0; j--) {
    const lt = lines[j].trim();
    if (lt === '') continue;
    if (lt.startsWith('#') && !lt.startsWith('## ') && !lt.startsWith('### ')) endLine = j;
    break;
  }
  let imgIdx = 0;
  while (i < endLine) {
    const trimmed = lines[i].trim();
    if (trimmed === '') { i++; continue; }
    if (isDivider(trimmed)) { chunks.push({ type: 'divider' }); i++; continue; }
    if (trimmed.startsWith('## ')) { chunks.push({ type: 'header', text: trimmed.substring(3) }); i++; continue; }
    if (trimmed.startsWith('### ')) { chunks.push({ type: 'subheader', text: trimmed.substring(4) }); i++; continue; }
    // Handle [IMAGE: ...] markers
    if (isImageMarker(trimmed)) {
      if (imgIdx < imageMap.length) {
        const img = imageMap[imgIdx];
        chunks.push({ type: 'image', path: img.path, filename: img.filename });
        imgIdx++;
      } else {
        console.log(`  WARNING: No image available for marker: ${trimmed}`);
      }
      i++; continue;
    }
    // Handle markdown image syntax ![alt](path)
    if (trimmed.startsWith('![')) {
      const m = trimmed.match(/!\[.*?\]\((.*?)\)/);
      if (m) {
        const f = path.join(IMAGES_DIR, path.basename(m[1]));
        if (fs.existsSync(f)) chunks.push({ type: 'image', path: f, filename: path.basename(m[1]) });
        else console.log(`  WARNING: Image not found: ${f}`);
      }
      i++; continue;
    }
    // Handle italic captions (lines like *caption text*)
    if (isImageCaption(trimmed)) {
      const captionText = trimmed.slice(1, -1); // Remove surrounding *
      chunks.push({ type: 'caption', text: captionText });
      i++; continue;
    }
    if (isImageCredit(trimmed)) { i++; continue; }
    if (trimmed.startsWith('> ')) {
      // Collect multi-line quotes
      const quoteLines = [];
      while (i < endLine && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().substring(2));
        i++;
      }
      chunks.push({ type: 'quote', text: quoteLines.join('\n') });
      continue;
    }
    if (trimmed.startsWith('|')) {
      const tl = [];
      while (i < endLine && lines[i].trim().startsWith('|')) {
        const t = lines[i].trim();
        if (!t.match(/^\|[\s\-:|]+\|$/)) tl.push(t);
        i++;
      }
      if (tl.length > 0) chunks.push({ type: 'table', lines: tl });
      continue;
    }
    const pl = [];
    while (i < endLine) {
      const pt = lines[i].trim();
      if (pt === '' || isDivider(pt) || pt.startsWith('## ') || pt.startsWith('### ') || pt.startsWith('![') || pt.startsWith('> ') || pt.startsWith('|') || isImageCredit(pt) || isImageMarker(pt) || isImageCaption(pt)) break;
      pl.push(pt); i++;
    }
    if (pl.length > 0) chunks.push({ type: 'text', text: pl.join('\n') });
  }
  return chunks;
}

function stripBold(t) { return t.replace(/\*\*(.*?)\*\*/g, '$1'); }
function parseBoldSegments(text) {
  const s = []; const r = /\*\*(.*?)\*\*/g; let li = 0, m;
  while ((m = r.exec(text)) !== null) {
    if (m.index > li) s.push({ text: text.substring(li, m.index), bold: false });
    s.push({ text: m[1], bold: true });
    li = r.lastIndex;
  }
  if (li < text.length) s.push({ text: text.substring(li), bold: false });
  return s;
}
function stripLinks(t) { return t.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); }
function cleanText(t) { return stripLinks(stripBold(t)); }
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Dismiss the "작성 중인 글이 있습니다" draft recovery dialog.
 * Uses multiple strategies:
 * 1. Playwright locator getByText
 * 2. JS evaluate with broader text matching
 * 3. Keyboard Escape
 * 4. Direct DOM removal as last resort
 */
async function dismissDraftDialog(page) {
  console.log('  Checking for draft recovery dialog...');

  for (let attempt = 0; attempt < 5; attempt++) {
    // Check if dialog exists
    const dialogExists = await page.evaluate(() => {
      // Look for the dialog by its characteristic text
      const allText = document.body.innerText || '';
      return allText.includes('작성 중인 글이 있습니다');
    });

    if (!dialogExists) {
      console.log('  No draft dialog found (or already dismissed)');
      return true;
    }

    console.log(`  Draft dialog detected, dismissing (attempt ${attempt + 1})...`);

    // Strategy 1: Try Playwright locator click on "취소" button
    try {
      const cancelBtn = page.locator('button', { hasText: '취소' });
      const count = await cancelBtn.count();
      if (count > 0) {
        await cancelBtn.first().click({ force: true, timeout: 3000 });
        console.log('  Clicked 취소 via Playwright locator');
        await sleep(2000);
        continue;
      }
    } catch (e) {
      console.log(`  Locator click failed: ${e.message.substring(0, 60)}`);
    }

    // Strategy 2: JS evaluate - find any button containing "취소" text (broader matching)
    try {
      const clicked = await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
          const txt = btn.innerText || btn.textContent || '';
          if (txt.includes('취소')) {
            btn.click();
            return 'clicked-취소: ' + txt.trim();
          }
        }
        // Also try anchor tags or div buttons
        const allClickables = document.querySelectorAll('a, [role="button"], .btn');
        for (const el of allClickables) {
          const txt = el.innerText || el.textContent || '';
          if (txt.includes('취소')) {
            el.click();
            return 'clicked-alt: ' + txt.trim();
          }
        }
        return null;
      });
      if (clicked) {
        console.log(`  JS evaluate: ${clicked}`);
        await sleep(2000);
        continue;
      }
    } catch (e) {
      console.log(`  JS evaluate failed: ${e.message.substring(0, 60)}`);
    }

    // Strategy 3: Click by coordinates - "취소" button is at approximately (627, 516) based on screenshots
    // The dialog is centered, so with viewport 1400x900, 취소 is roughly at left button position
    try {
      console.log('  Trying coordinate click on 취소 button area...');
      await page.mouse.click(627, 516, { force: true });
      await sleep(2000);
      continue;
    } catch (e) {
      console.log(`  Coordinate click failed: ${e.message.substring(0, 60)}`);
    }

    // Strategy 4: Press Escape to close dialog
    try {
      console.log('  Trying Escape key...');
      await page.keyboard.press('Escape');
      await sleep(2000);
      continue;
    } catch (e) {}

    // Strategy 5: Force remove dialog from DOM
    try {
      console.log('  Force removing dialog from DOM...');
      await page.evaluate(() => {
        // Find the dialog overlay/container and remove it
        const modals = document.querySelectorAll('.se-popup-dim, .se-popup-overlay, [class*="modal"], [class*="dialog"], [class*="popup"]');
        modals.forEach(m => m.remove());
        // Also look for the specific dialog structure
        const allDivs = document.querySelectorAll('div');
        for (const div of allDivs) {
          if (div.innerText && div.innerText.includes('작성 중인 글이 있습니다')) {
            // Go up to find the overlay container
            let parent = div;
            for (let i = 0; i < 5; i++) {
              if (parent.parentElement) parent = parent.parentElement;
              const style = window.getComputedStyle(parent);
              if (style.position === 'fixed' || style.position === 'absolute') {
                parent.remove();
                return 'removed-parent';
              }
            }
            div.remove();
            return 'removed-div';
          }
        }
        return 'no-match';
      });
      await sleep(1000);
      continue;
    } catch (e) {
      console.log(`  DOM removal failed: ${e.message.substring(0, 60)}`);
    }
  }

  // Final check
  const stillThere = await page.evaluate(() => {
    return (document.body.innerText || '').includes('작성 중인 글이 있습니다');
  });
  if (stillThere) {
    console.log('  WARNING: Draft dialog could not be dismissed after all attempts!');
    return false;
  }
  return true;
}

/**
 * Close the "도움말" (Help) panel on the right side
 */
async function closeHelpPanel(page) {
  try {
    const closed = await page.evaluate(() => {
      // Look for 도움말 close button (X)
      const helpClose = document.querySelector('.se-help-panel-close, .se-help .close, [class*="help"] button[class*="close"]');
      if (helpClose) { helpClose.click(); return 'close-btn'; }
      // Try finding X button near "도움말" text
      const allBtns = document.querySelectorAll('button');
      for (const btn of allBtns) {
        const parent = btn.closest('[class*="help"]');
        if (parent && (btn.className.includes('close') || btn.getAttribute('aria-label') === 'close')) {
          btn.click();
          return 'btn-in-help';
        }
      }
      return null;
    });
    if (closed) {
      console.log(`  Closed help panel: ${closed}`);
      await sleep(500);
    }
  } catch (e) {}

  // Also try clicking the X near the "도움말" header at top-right
  try {
    const helpX = page.locator('button:near(:text("도움말"))').first();
    if (await helpX.count() > 0) {
      // The X close button is at approximately (1318, 40) based on screenshots
      await page.mouse.click(1318, 40);
      await sleep(500);
      console.log('  Clicked help panel X by coordinates');
    }
  } catch (e) {}
}

/**
 * Upload an image via SmartEditor's "사진" (Photo) toolbar button.
 * SmartEditor opens its own photo selection panel with a hidden file input.
 */
async function uploadImage(page, imagePath) {
  console.log(`    Uploading image: ${path.basename(imagePath)}`);

  // Click the "사진" button in the toolbar
  const photoClicked = await page.evaluate(() => {
    // First try: find button with "사진" label
    const labels = document.querySelectorAll('.se-toolbar-label');
    for (const l of labels) {
      if (l.textContent.trim() === '사진') {
        const btn = l.closest('button');
        if (btn) { btn.click(); return 'label'; }
      }
    }
    // Second try: find the image toolbar button by class
    const imgBtn = document.querySelector('button.se-image-toolbar-button');
    if (imgBtn) { imgBtn.click(); return 'class'; }
    return null;
  });

  if (!photoClicked) {
    console.log('    WARNING: 사진 button not found, skipping image');
    return false;
  }
  console.log(`    Clicked 사진 button (${photoClicked})`);
  await sleep(1500);

  // After clicking "사진", SmartEditor shows a photo upload panel.
  // Look for file input in the panel and set files via Playwright.
  try {
    // Method 1: Find the hidden file input that SmartEditor creates
    const fileInputSet = await page.evaluate((imgPath) => {
      const inputs = document.querySelectorAll('input[type="file"]');
      return inputs.length;
    }, imagePath);
    console.log(`    Found ${fileInputSet} file inputs`);

    if (fileInputSet > 0) {
      // Use Playwright's setInputFiles on the file input
      const fileInput = page.locator('input[type="file"]').last();
      await fileInput.setInputFiles(imagePath);
      console.log('    Set file via setInputFiles');
      await sleep(3000);

      // Check if there's an "upload" or "등록" button to confirm
      await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
          const txt = (btn.innerText || '').trim();
          if (txt === '등록' || txt === '확인' || txt === '올리기' || txt === '추가') {
            btn.click();
            return txt;
          }
        }
        return null;
      });
      await sleep(3000);
      console.log('    Image upload completed');
      return true;
    }

    // Method 2: If no file input found, try using the filechooser event
    // (This was known to fail in v3, but try one more time with longer timeout)
    console.log('    No file input found, trying filechooser event...');

    // Click the "내 PC" or upload area in the photo panel
    const uploadAreaClicked = await page.evaluate(() => {
      const allEls = document.querySelectorAll('button, a, div[role="button"], .se-photo-upload, [class*="upload"], [class*="pc"]');
      for (const el of allEls) {
        const txt = (el.innerText || el.textContent || '').trim();
        if (txt.includes('내 PC') || txt.includes('PC에서') || txt.includes('파일 선택') || txt.includes('업로드')) {
          el.click();
          return txt;
        }
      }
      return null;
    });
    if (uploadAreaClicked) {
      console.log(`    Clicked upload area: "${uploadAreaClicked}"`);
    }

    // Try to catch filechooser event
    try {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 5000 }),
      ]);
      await fileChooser.setFiles(imagePath);
      console.log('    File set via filechooser');
      await sleep(3000);
      return true;
    } catch (e) {
      console.log('    Filechooser event not triggered');
    }

    // If nothing works, close the photo panel and skip
    await page.keyboard.press('Escape');
    await sleep(500);
    return false;

  } catch (e) {
    console.log(`    Image upload error: ${e.message.substring(0, 80)}`);
    try { await page.keyboard.press('Escape'); } catch (ee) {}
    await sleep(500);
    return false;
  }
}

async function main() {
  console.log(`Publishing ${TOPIC_ID} to Naver Blog (${BLOG_ID})...`);
  console.log(`Title: ${title}`);
  console.log(`Tags: ${tags.length} tags`);

  const chunks = parseContent(content);
  console.log(`Content parsed into ${chunks.length} chunks`);
  // Debug: show chunk types
  const typeCounts = {};
  chunks.forEach(c => { typeCounts[c.type] = (typeCounts[c.type] || 0) + 1; });
  console.log(`Chunk types: ${JSON.stringify(typeCounts)}`);

  const browser = await chromium.launch({
    headless: false, slowMo: 50,
    args: ['--disable-blink-features=AutomationControlled']
  });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'ko-KR'
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  try {
    // === Step 1: Login ===
    console.log('\n=== Step 1: Login ===');
    await page.goto('https://nid.naver.com/nidlogin.login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(3000);

    // Enter credentials via direct value set + input event
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

    // Click login button
    try { await page.click('#log\\.login', { timeout: 5000 }); } catch (e) {
      try { await page.click('button.btn_login', { timeout: 3000 }); } catch (e2) {
        await page.evaluate(() => { const f = document.querySelector('#frmNIDLogin'); if (f) f.submit(); });
      }
    }
    await sleep(6000);
    try { await page.waitForLoadState('networkidle', { timeout: 15000 }); } catch (e) { console.log('  networkidle timeout after login, continuing...'); }
    console.log(`After login URL: ${page.url()}`);

    // Retry login if still on login page
    if (page.url().includes('nidlogin') || page.url().includes('login')) {
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
      try { await page.waitForLoadState('networkidle', { timeout: 15000 }); } catch (e) { console.log('  networkidle timeout after retry, continuing...'); }
      console.log(`After retry URL: ${page.url()}`);
    }

    if (page.url().includes('captcha')) { console.log('CAPTCHA! Waiting 90s...'); await sleep(90000); }
    try { const l = await page.$('button:has-text("나중에")'); if (l) { await l.click(); await sleep(1000); } } catch (e) {}

    // === Step 2: Navigate to editor ===
    console.log('\n=== Step 2: Navigate to write page ===');
    await page.goto(`https://blog.naver.com/${BLOG_ID}/postwrite`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(5000);
    try { await page.waitForLoadState('networkidle', { timeout: 15000 }); } catch (e) { console.log('  networkidle timeout on write page, continuing...'); }

    // Take screenshot before any dialog handling to debug
    await page.screenshot({ path: path.join(WORKSPACE, 'logs', `naver-editor-${TOPIC_ID}-before-dialog.png`) });

    // Debug: dump all visible buttons for troubleshooting
    const allButtons = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      const result = [];
      btns.forEach((btn, idx) => {
        const txt = (btn.innerText || btn.textContent || '').trim().substring(0, 30);
        const vis = btn.offsetParent !== null;
        const rect = btn.getBoundingClientRect();
        if (txt) result.push({ idx, txt, visible: vis, x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) });
      });
      return result;
    });
    console.log('  All visible buttons:');
    allButtons.filter(b => b.visible).forEach(b => console.log(`    [${b.idx}] "${b.txt}" at (${b.x},${b.y}) ${b.w}x${b.h}`));

    // Close help panel first
    await closeHelpPanel(page);

    // Dismiss draft recovery dialog with robust handling
    const dialogDismissed = await dismissDraftDialog(page);
    if (!dialogDismissed) {
      console.log('  Trying page reload to clear dialog...');
      // Navigate again fresh - this clears the auto-saved draft
      await page.goto(`https://blog.naver.com/${BLOG_ID}/postwrite`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(5000);
      try { await page.waitForLoadState('networkidle', { timeout: 15000 }); } catch (e) {}
      // This time, try clicking "확인" instead (to load the draft then clear it)
      const dialogExists2 = await page.evaluate(() => {
        return (document.body.innerText || '').includes('작성 중인 글이 있습니다');
      });
      if (dialogExists2) {
        console.log('  Dialog still present after reload. Clicking 확인 to load draft, then clear...');
        // Try clicking 확인 to load the old draft, then we'll clear and rewrite
        try {
          const confirmBtn = page.locator('button', { hasText: '확인' });
          await confirmBtn.first().click({ force: true, timeout: 3000 });
          await sleep(3000);
          console.log('  Loaded old draft. Will clear and rewrite.');
          // Select all and delete existing content
          // Click on content area first
          try {
            await page.click('.se-component.se-text .se-text-paragraph', { force: true, timeout: 3000 });
          } catch (e) {
            await page.mouse.click(500, 400);
          }
          await sleep(300);
          await page.keyboard.down('Control'); await page.keyboard.press('a'); await page.keyboard.up('Control');
          await page.keyboard.press('Backspace');
          await sleep(500);
          // Also clear the title
          try {
            await page.click('.se-documentTitle .se-text-paragraph', { force: true, timeout: 3000 });
            await page.keyboard.down('Control'); await page.keyboard.press('a'); await page.keyboard.up('Control');
            await page.keyboard.press('Backspace');
          } catch (e) {}
          await sleep(500);
        } catch (e) {
          console.log(`  Confirm click failed: ${e.message.substring(0, 60)}`);
        }
      }
    }

    await sleep(2000);
    await page.screenshot({ path: path.join(WORKSPACE, 'logs', `naver-editor-${TOPIC_ID}-step2.png`) });

    // Verify dialog is gone
    const dialogGone = await page.evaluate(() => {
      return !(document.body.innerText || '').includes('작성 중인 글이 있습니다');
    });
    console.log(`  Dialog dismissed: ${dialogGone}`);
    if (!dialogGone) {
      console.log('  CRITICAL: Cannot dismiss draft dialog. Aborting.');
      throw new Error('Draft recovery dialog cannot be dismissed');
    }

    // === Step 3: Enter title ===
    console.log('\n=== Step 3: Enter title ===');
    let titleEntered = false;

    // Try clicking the title area with Playwright locator
    try {
      const titleEl = page.locator('.se-documentTitle .se-text-paragraph');
      if (await titleEl.count() > 0) {
        await titleEl.first().click({ force: true, timeout: 5000 });
        await sleep(500);
        // Clear any existing text
        await page.keyboard.down('Control'); await page.keyboard.press('a'); await page.keyboard.up('Control');
        await page.keyboard.press('Backspace'); await sleep(200);
        await page.keyboard.insertText(title);
        titleEntered = true;
        console.log('  Title entered via locator');
      }
    } catch (e) {
      console.log(`  Title locator failed: ${e.message.substring(0, 60)}`);
    }

    // Fallback: click by coordinates (title area is around y=240 in the editor)
    if (!titleEntered) {
      try {
        await page.mouse.click(500, 240);
        await sleep(500);
        await page.keyboard.down('Control'); await page.keyboard.press('a'); await page.keyboard.up('Control');
        await page.keyboard.press('Backspace'); await sleep(200);
        await page.keyboard.insertText(title);
        titleEntered = true;
        console.log('  Title entered via coordinates');
      } catch (e) {
        console.log(`  Title coordinate entry failed: ${e.message.substring(0, 60)}`);
      }
    }

    // Verify title
    await sleep(500);
    const verifyTitle = await page.evaluate(() => {
      const el = document.querySelector('.se-documentTitle .se-text-paragraph');
      return el ? el.textContent.trim() : '';
    });
    console.log(`  Title verification: "${verifyTitle.substring(0, 50)}"`);
    if (!verifyTitle || verifyTitle === '제목') {
      console.log('  WARNING: Title may not have been entered correctly');
    }

    // === Step 4: Enter content ===
    console.log('\n=== Step 4: Enter content ===');

    // Move to content area
    await page.keyboard.press('Tab');  // Tab from title to content area
    await sleep(500);

    // Also try clicking the content area directly
    try {
      const contentArea = page.locator('.se-component.se-text:not(.se-documentTitle) .se-text-paragraph');
      if (await contentArea.count() > 0) {
        await contentArea.first().click({ force: true, timeout: 3000 });
        await sleep(300);
      }
    } catch (e) {
      // Fallback: click in the content area by coordinates (below title)
      await page.mouse.click(500, 360);
      await sleep(300);
    }

    // Set center alignment for all content (Ctrl+E)
    await page.keyboard.down('Control'); await page.keyboard.press('e'); await page.keyboard.up('Control');
    await sleep(200);

    console.log(`  Processing ${chunks.length} chunks...`);
    let imageUploadCount = 0;

    for (let ci = 0; ci < chunks.length; ci++) {
      const chunk = chunks[ci];
      const preview = chunk.text ? chunk.text.substring(0, 40).replace(/\n/g, ' ') : (chunk.filename || '');

      // Log progress every 5 chunks
      if (ci % 5 === 0 || chunk.type === 'image' || chunk.type === 'header') {
        console.log(`  [${ci + 1}/${chunks.length}] ${chunk.type}: ${preview}`);
      }

      try {
        switch (chunk.type) {
          case 'divider': {
            // Try clicking the 구분선 toolbar button
            const inserted = await page.evaluate(() => {
              const labels = document.querySelectorAll('.se-toolbar-label');
              for (const l of labels) {
                if (l.textContent.trim() === '구분선') {
                  const btn = l.closest('button');
                  if (btn) { btn.click(); return true; }
                }
              }
              return false;
            });
            if (inserted) {
              await sleep(1000);
              // SmartEditor might show a line style popup - pick the first option
              try {
                const popupBtn = await page.$('.se-popup.se-popup-visible button, .se-popup-content button');
                if (popupBtn && await popupBtn.isVisible()) {
                  await popupBtn.click();
                  await sleep(300);
                }
              } catch (e) {}
            } else {
              // Fallback: type a text divider
              await page.keyboard.press('Enter');
              await page.keyboard.insertText('────────────────────────');
              await page.keyboard.press('Enter');
            }
            await sleep(300);
            break;
          }

          case 'header': {
            // Add extra blank lines before header
            await page.keyboard.press('Enter');
            await page.keyboard.press('Enter');
            await page.keyboard.press('Enter');
            // Re-apply center alignment
            await page.keyboard.down('Control'); await page.keyboard.press('e'); await page.keyboard.up('Control');
            await sleep(50);
            // Bold the header text
            await page.keyboard.down('Control'); await page.keyboard.press('b'); await page.keyboard.up('Control');
            await sleep(50);
            await page.keyboard.insertText(cleanText(chunk.text));
            await page.keyboard.down('Control'); await page.keyboard.press('b'); await page.keyboard.up('Control');
            await sleep(50);
            await page.keyboard.press('Enter');
            await page.keyboard.press('Enter');
            break;
          }

          case 'subheader': {
            await page.keyboard.press('Enter');
            await page.keyboard.press('Enter');
            await page.keyboard.down('Control'); await page.keyboard.press('e'); await page.keyboard.up('Control');
            await sleep(50);
            await page.keyboard.down('Control'); await page.keyboard.press('b'); await page.keyboard.up('Control');
            await sleep(50);
            await page.keyboard.insertText(cleanText(chunk.text));
            await page.keyboard.down('Control'); await page.keyboard.press('b'); await page.keyboard.up('Control');
            await sleep(50);
            await page.keyboard.press('Enter');
            await page.keyboard.press('Enter');
            break;
          }

          case 'quote': {
            // Try to use SmartEditor's quote button
            const quoteInserted = await page.evaluate(() => {
              const labels = document.querySelectorAll('.se-toolbar-label');
              for (const l of labels) {
                if (l.textContent.trim() === '인용구') {
                  const btn = l.closest('button');
                  if (btn) { btn.click(); return true; }
                }
              }
              return false;
            });
            if (quoteInserted) {
              await sleep(500);
              // Pick first quote style if popup appears
              try {
                const popupBtn = await page.$('.se-popup.se-popup-visible button, .se-popup-content button');
                if (popupBtn && await popupBtn.isVisible()) {
                  await popupBtn.click();
                  await sleep(300);
                }
              } catch (e) {}
              // Handle multi-line quotes
              const quoteLines = chunk.text.split('\n');
              for (let qi = 0; qi < quoteLines.length; qi++) {
                await page.keyboard.insertText(cleanText(quoteLines[qi]));
                if (qi < quoteLines.length - 1) await page.keyboard.press('Enter');
                await sleep(50);
              }
              await sleep(200);
              // Move cursor out of quote block
              await page.keyboard.press('Enter');
              await page.keyboard.press('Enter');
            } else {
              // Fallback: type as text with quotes
              await page.keyboard.insertText(`"${cleanText(chunk.text)}"`);
              await page.keyboard.press('Enter');
              await page.keyboard.press('Enter');
            }
            await sleep(150);
            break;
          }

          case 'caption': {
            // Enter caption text in italic (Ctrl+I)
            await page.keyboard.down('Control'); await page.keyboard.press('e'); await page.keyboard.up('Control');
            await sleep(50);
            await page.keyboard.down('Control'); await page.keyboard.press('i'); await page.keyboard.up('Control');
            await sleep(50);
            await page.keyboard.insertText(cleanText(chunk.text));
            await page.keyboard.down('Control'); await page.keyboard.press('i'); await page.keyboard.up('Control');
            await sleep(50);
            await page.keyboard.press('Enter');
            await page.keyboard.press('Enter');
            break;
          }

          case 'image': {
            // Try to upload image via SmartEditor photo panel
            await page.keyboard.press('Enter');
            await sleep(300);
            const uploaded = await uploadImage(page, chunk.path);
            if (uploaded) {
              imageUploadCount++;
              await page.keyboard.press('Enter');
            } else {
              console.log(`    [SKIP] Image: ${chunk.filename} (upload failed)`);
            }
            await sleep(300);
            break;
          }

          case 'table': {
            await page.keyboard.press('Enter');
            for (const tl of chunk.lines) {
              const cells = tl.split('|').filter(c => c.trim()).map(c => c.trim());
              await page.keyboard.insertText(stripBold(cells.join('  |  ')));
              await page.keyboard.press('Enter');
              await sleep(50);
            }
            await page.keyboard.press('Enter');
            break;
          }

          case 'text': {
            const textLines = chunk.text.split('\n');
            for (let li = 0; li < textLines.length; li++) {
              const cl = stripLinks(textLines[li]);
              if (cl.includes('**')) {
                const segments = parseBoldSegments(cl);
                for (const seg of segments) {
                  if (seg.bold) {
                    await page.keyboard.down('Control'); await page.keyboard.press('b'); await page.keyboard.up('Control');
                    await sleep(30);
                    await page.keyboard.insertText(seg.text);
                    await page.keyboard.down('Control'); await page.keyboard.press('b'); await page.keyboard.up('Control');
                    await sleep(30);
                  } else if (seg.text) {
                    await page.keyboard.insertText(seg.text);
                  }
                }
              } else {
                await page.keyboard.insertText(cl);
              }
              if (li < textLines.length - 1) await page.keyboard.press('Enter');
              await sleep(20);
            }
            await page.keyboard.press('Enter');
            await page.keyboard.press('Enter');
            await sleep(100);
            break;
          }
        }
      } catch (err) {
        console.log(`  ERROR chunk ${ci + 1}: ${err.message.substring(0, 80)}`);
      }
    }

    console.log(`\nContent entry complete! (${imageUploadCount} images uploaded)`);
    await sleep(2000);
    await page.screenshot({ path: path.join(WORKSPACE, 'logs', `naver-editor-${TOPIC_ID}-content.png`) });

    // === Step 5: Publish ===
    console.log('\n=== Step 5: Publish ===');

    // Click "발행" button
    let pubClicked = false;

    // Try Playwright locator first
    try {
      const pubBtn = page.locator('button:has-text("발행")').first();
      if (await pubBtn.count() > 0) {
        await pubBtn.click({ force: true, timeout: 5000 });
        pubClicked = true;
        console.log('  Clicked 발행 via locator');
      }
    } catch (e) {
      console.log(`  Publish locator failed: ${e.message.substring(0, 60)}`);
    }

    // Fallback: JS evaluate
    if (!pubClicked) {
      pubClicked = await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
          if (btn.textContent.trim() === '발행' && btn.offsetParent !== null) {
            btn.click();
            return true;
          }
        }
        return false;
      });
      if (pubClicked) console.log('  Clicked 발행 via evaluate');
    }

    if (pubClicked) {
      await sleep(3000);
      await page.screenshot({ path: path.join(WORKSPACE, 'logs', `naver-editor-${TOPIC_ID}-publish-panel.png`) });

      // Check if the publish settings panel is open
      const publishPanelOpen = await page.evaluate(() => {
        const allText = document.body.innerText || '';
        return allText.includes('카테고리') && allText.includes('공개 설정');
      });
      console.log(`  Publish panel open: ${publishPanelOpen}`);

      // Enter tags
      console.log('  Entering tags...');

      // Method 1: Try Playwright click + keyboard on the tag input
      let tagsEntered = false;
      try {
        const tagInput = page.locator('input[placeholder*="태그"]');
        if (await tagInput.count() > 0) {
          for (const tag of tags) {
            await tagInput.click({ force: true, timeout: 3000 });
            await sleep(200);
            await page.keyboard.insertText(tag);
            await sleep(200);
            await page.keyboard.press('Enter');
            await sleep(300);
          }
          tagsEntered = true;
          console.log(`  Tags entered: ${tags.length} via keyboard`);
        }
      } catch (e) {
        console.log(`  Tag keyboard entry failed: ${e.message.substring(0, 60)}`);
      }

      // Method 2: Use evaluate to enter tags
      if (!tagsEntered) {
        for (const tag of tags) {
          await page.evaluate((t) => {
            const inp = document.querySelector('input[placeholder*="태그"]');
            if (inp) {
              inp.focus();
              inp.value = '';
              document.execCommand('insertText', false, t);
              inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
              inp.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', keyCode: 13, bubbles: true }));
            }
          }, tag);
          await sleep(300);
        }
        console.log(`  Tags entered: ${tags.length} via evaluate`);
      }

      await sleep(1000);
      await page.screenshot({ path: path.join(WORKSPACE, 'logs', `naver-editor-${TOPIC_ID}-publish-dialog.png`) });

      // Confirm publish - click the LAST "발행" button (the confirmation one in the publish panel)
      console.log('  Confirming publish...');
      let confirmed = false;

      // Try evaluate to find all 발행 buttons and click the last one
      confirmed = await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        const pubs = [];
        for (const btn of btns) {
          const txt = (btn.innerText || btn.textContent || '').trim();
          if (txt === '발행' && btn.offsetParent !== null) pubs.push(btn);
        }
        console.log('발행 buttons found:', pubs.length);
        if (pubs.length >= 2) {
          // The second "발행" button is the confirm button in the publish panel
          pubs[pubs.length - 1].click();
          return true;
        } else if (pubs.length === 1) {
          pubs[0].click();
          return true;
        }
        return false;
      });

      if (confirmed) {
        console.log('  Publish confirmed, waiting for navigation...');
        await sleep(10000);
        try { await page.waitForLoadState('networkidle', { timeout: 15000 }); } catch (e) {}
      } else {
        console.log('  WARNING: Could not find publish confirmation button');
      }
    } else {
      console.log('  WARNING: 발행 button not found at all');
    }

    // Close share dialog if it appears
    await sleep(2000);
    try {
      await page.evaluate(() => {
        const c = document.querySelector('a.close._closeLayer');
        if (c) c.click();
      });
    } catch (e) {}

    // Get final URL
    const publishedUrl = page.url();
    console.log(`\nFinal URL: ${publishedUrl}`);
    await page.screenshot({ path: path.join(WORKSPACE, 'logs', `naver-editor-${TOPIC_ID}-final.png`) });

    let postId = '';
    const urlMatch = publishedUrl.match(/\/(\d+)$/);
    if (urlMatch) postId = urlMatch[1];
    // Also try to extract from logNo parameter
    if (!postId) {
      const logNoMatch = publishedUrl.match(/logNo=(\d+)/);
      if (logNoMatch) postId = logNoMatch[1];
    }

    const isSuccess = publishedUrl.includes('blog.naver.com') && !publishedUrl.includes('postwrite') && postId !== '';
    const result = {
      topic_id: TOPIC_ID,
      platform: 'naver',
      url: isSuccess ? `https://blog.naver.com/${BLOG_ID}/${postId}` : publishedUrl,
      post_id: postId,
      published_at: new Date().toISOString(),
      title,
      tags_count: tags.length,
      images_uploaded: imageUploadCount,
      status: isSuccess ? 'success' : 'uncertain'
    };

    const pubDir = path.join(WORKSPACE, 'published', TOPIC_ID);
    fs.mkdirSync(pubDir, { recursive: true });
    fs.writeFileSync(path.join(pubDir, 'publish_result.json'), JSON.stringify(result, null, 2));
    console.log('\n=== RESULT ===');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error(`\nERROR: ${error.message}`);
    try { await page.screenshot({ path: path.join(WORKSPACE, 'logs', `naver-editor-${TOPIC_ID}-error.png`) }); } catch (e) {}
    const pubDir = path.join(WORKSPACE, 'published', TOPIC_ID);
    fs.mkdirSync(pubDir, { recursive: true });
    fs.writeFileSync(path.join(pubDir, 'publish_result.json'), JSON.stringify({
      topic_id: TOPIC_ID, platform: 'naver', status: 'failed',
      error: error.message, failed_at: new Date().toISOString()
    }, null, 2));
    process.exit(1);
  } finally {
    console.log('\nBrowser open for 10s...');
    await sleep(10000);
    await browser.close();
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
