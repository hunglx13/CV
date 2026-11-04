/**
 * Browser-level integration tests (optional).
 *
 * Runs the real page in headless Chromium at three viewports and checks what the
 * CSS actually computes: the grid goes 1 → 2 → 3 columns, the hero stacks then
 * sits side by side, nothing overflows horizontally, and there are no console
 * errors or failed asset requests.
 *
 * The suite is skipped (not failed) when Playwright is unavailable, so the core
 * unit suites stay green on a bare checkout.
 *
 *   npm install -D playwright && npx playwright install chromium
 *
 * Either the `playwright` or the `playwright-core` package works: the latter is
 * enough when the browser binaries are already present on the machine.
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

import { HTML_PATH } from './helpers/fixtures.js';

let chromium = null;
let loadError = null;
try {
  ({ chromium } = await import('playwright'));
} catch {
  try {
    ({ chromium } = await import('playwright-core'));
  } catch (error) {
    loadError = error;
  }
}

const skipReason = loadError
  ? `playwright/playwright-core is not installed (optional browser suite): ${loadError.message.split('\n')[0]}`
  : false;

const PAGE_URL = pathToFileURL(HTML_PATH).href;
let browser;
let page;

/** Render at a viewport and return computed layout metrics. */
async function metricsAt(width, height) {
  await page.setViewportSize({ width, height });
  return page.evaluate(() => {
    const grid = document.querySelector('.project-grid');
    const hero = document.querySelector('.hero-inner');
    const cards = [...document.querySelectorAll('.card')];
    return {
      gridColumns: getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length,
      heroDirection: getComputedStyle(hero).flexDirection,
      topRowCount: new Set(cards.map((c) => Math.round(c.getBoundingClientRect().top))).size,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
}

before(async () => {
  if (skipReason) return;
  // Use the full headed Chromium build: the lightweight headless shell is not
  // always installed by `npx playwright install chromium`.
  browser = await chromium.launch({ channel: 'chromium' });
  page = await browser.newPage();
});

after(async () => {
  await browser?.close();
});

describe('browser — rendering the real page', { skip: skipReason }, () => {
  it('loads without console errors or failed requests', async () => {
    const context = await browser.newContext();
    const fresh = await context.newPage();
    const errors = [];
    fresh.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    fresh.on('requestfailed', (req) => errors.push(`request failed: ${req.url()}`));
    await fresh.goto(PAGE_URL, { waitUntil: 'load' });
    await context.close();
    assert.deepEqual(errors, []);
  });

  it('applies the external stylesheet (sticky header, token colours)', async () => {
    await page.goto(PAGE_URL, { waitUntil: 'load' });
    const styles = await page.evaluate(() => {
      const header = getComputedStyle(document.querySelector('.site-header'));
      const body = getComputedStyle(document.body);
      return { headerPosition: header.position, bodyFont: body.fontFamily };
    });
    assert.equal(styles.headerPosition, 'sticky');
    assert.match(styles.bodyFont, /system-ui|Segoe UI|sans-serif/);
  });

  it('mobile 375px: one column grid, stacked hero, no horizontal scroll', async () => {
    await page.goto(PAGE_URL, { waitUntil: 'load' });
    const m = await metricsAt(375, 800);
    assert.equal(m.gridColumns, 1);
    assert.equal(m.heroDirection, 'column');
    assert.ok(m.scrollWidth <= m.clientWidth, 'page overflows horizontally on mobile');
  });

  it('tablet 800px: two column grid, side-by-side hero', async () => {
    await page.goto(PAGE_URL, { waitUntil: 'load' });
    const m = await metricsAt(800, 900);
    assert.equal(m.gridColumns, 2);
    assert.equal(m.heroDirection, 'row');
    assert.ok(m.scrollWidth <= m.clientWidth, 'page overflows horizontally on tablet');
  });

  it('desktop 1366px: three column grid and no overflow (edge)', async () => {
    await page.goto(PAGE_URL, { waitUntil: 'load' });
    const m = await metricsAt(1366, 900);
    assert.equal(m.gridColumns, 3);
    assert.ok(m.scrollWidth <= m.clientWidth, 'page overflows horizontally on desktop');
  });

  it('every image is actually decoded (not a broken asset)', async () => {
    await page.goto(PAGE_URL, { waitUntil: 'load' });
    const broken = await page.evaluate(() =>
      [...document.images]
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.getAttribute('src')),
    );
    assert.deepEqual(broken, [], `broken images: ${broken.join(', ')}`);
  });

  it('keyboard focus reaches a link and shows a focus ring', async () => {
    await page.goto(PAGE_URL, { waitUntil: 'load' });
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return { tag: el.tagName, outline: getComputedStyle(el).outlineStyle };
    });
    assert.equal(focused.tag, 'A');
    assert.notEqual(focused.outline, 'none', 'focused element has no visible outline');
  });
});
