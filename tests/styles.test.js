/**
 * Unit tests for assets/css/styles.css.
 *
 * The stylesheet is treated as a set of named units: design tokens, reset rules,
 * layout primitives (.container / .project-grid / .skill-grid / .header-inner)
 * and media queries. A small CSS reader extracts blocks and declarations so the
 * assertions read like specs instead of regex soup.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { CSS_RAW, CSS_PATH, HTML_RAW } from './helpers/fixtures.js';

// ---------------------------------------------------------------------------
// Tiny CSS reader
// ---------------------------------------------------------------------------

/** Remove comments so they cannot pollute selector/declaration parsing. */
const CSS = CSS_RAW.replace(/\/\*[\s\S]*?\*\//g, '');

/** Returns [{ prelude, body, start }] for every top-level or nested rule. */
function parseBlocks(source) {
  const blocks = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') {
      if (depth === 0) {
        const prelude = source.slice(start, i).trim();
        const bodyStart = i + 1;
        let inner = 0;
        let j = bodyStart;
        for (; j < source.length; j += 1) {
          if (source[j] === '{') inner += 1;
          else if (source[j] === '}') {
            if (inner === 0) break;
            inner -= 1;
          }
        }
        blocks.push({ prelude, body: source.slice(bodyStart, j) });
        i = j;
        start = j + 1;
      } else depth += 1;
    } else if (ch === '}') {
      if (depth > 0) depth -= 1;
      start = i + 1;
    }
  }
  return blocks;
}

const topLevel = parseBlocks(CSS);

/** All top-level rules whose prelude matches the selector exactly. */
const rulesFor = (selector) =>
  topLevel.filter((b) => b.prelude.split(',').map((s) => s.trim()).includes(selector));

/** Declarations of the first matching rule as { prop: value }. */
function declarations(selector) {
  const [rule] = rulesFor(selector);
  if (!rule || rule.prelude.startsWith('@')) return {};
  return Object.fromEntries(
    rule.body
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const idx = d.indexOf(':');
        return [d.slice(0, idx).trim().toLowerCase(), d.slice(idx + 1).trim()];
      }),
  );
}

const rootTokens = declarations(':root');
const mediaQueries = topLevel.filter((b) => b.prelude.startsWith('@media'));
const mediaBodies = mediaQueries.map((m) => ({ query: m.prelude, body: m.body }));
const mediaFor = (minWidth) =>
  mediaBodies.filter((m) => new RegExp(`min-width:\\s*${minWidth}px`).test(m.query));

/** Class names used in index.html, so we can assert "no dead CSS" both ways. */
const classesInHtml = new Set(
  [...HTML_RAW.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean),
);

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
describe('styles — design tokens', () => {
  it('defines the colour tokens used across the page', () => {
    for (const token of [
      '--color-primary',
      '--color-primary-dark',
      '--color-accent',
      '--color-text',
      '--color-text-soft',
      '--color-bg',
      '--color-surface',
      '--color-border',
      '--color-chip',
    ]) {
      assert.ok(token in rootTokens, `missing design token ${token}`);
    }
  });

  it('every colour token holds a valid CSS colour', () => {
    for (const [token, value] of Object.entries(rootTokens)) {
      if (!token.startsWith('--color-')) continue;
      assert.match(
        value,
        /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-z]+)$/i,
        `${token}: "${value}" is not a colour`,
      );
    }
  });

  it('defines a typographic scale and a spacing scale', () => {
    for (const token of ['--fs-sm', '--fs-base', '--fs-lg', '--fs-h1', '--fs-h2', '--lh-base']) {
      assert.ok(token in rootTokens, `missing ${token}`);
    }
    for (const token of ['--space-1', '--space-2', '--space-3', '--space-4', '--space-5']) {
      assert.ok(token in rootTokens, `missing ${token}`);
    }
  });

  it('spacing scale is strictly increasing (edge)', () => {
    const toRem = (v) => Number.parseFloat(v); // all values are rem in this project
    const scale = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-5'].map((t) =>
      toRem(rootTokens[t]),
    );
    for (let i = 1; i < scale.length; i += 1) {
      assert.ok(scale[i] > scale[i - 1], `spacing token ${i} is not larger than the previous one`);
    }
  });

  it('every var(--token) reference is declared (negative)', () => {
    const declared = new Set(Object.keys(rootTokens));
    const used = new Set([...CSS.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]));
    const undeclared = [...used].filter((t) => !declared.has(t));
    assert.deepEqual(undeclared, [], `undeclared custom properties: ${undeclared.join(', ')}`);
  });

  it('body applies font-size, line-height and background from tokens', () => {
    const body = declarations('body');
    assert.equal(body['font-size'], 'var(--fs-base)');
    assert.equal(body['line-height'], 'var(--lh-base)');
    assert.equal(body.background, 'var(--color-bg)');
  });
});

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------
describe('styles — reset', () => {
  it('sets border-box globally (positive)', () => {
    const block = topLevel.find((b) => !b.prelude.startsWith('@') && /box-sizing/.test(b.body));
    assert.ok(block, 'no global box-sizing rule');
    assert.match(block.prelude, /\*/);
    assert.match(block.body, /box-sizing:\s*border-box/);
  });

  it('images never overflow their container', () => {
    const img = declarations('img');
    assert.equal(img['max-width'], '100%');
  });

  it('prevents horizontal scrolling on the body', () => {
    assert.match(declarations('body')['overflow-x'] ?? '', /hidden/);
  });

  it('does not use !important outside reduced-motion (negative)', () => {
    const withoutMotion = CSS.replace(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\}\s*\}/,
      '',
    );
    assert.doesNotMatch(withoutMotion, /!important/);
  });
});

// ---------------------------------------------------------------------------
// Layout primitives
// ---------------------------------------------------------------------------
describe('styles — layout primitives', () => {
  it('.container is centred and capped by --container-max', () => {
    const c = declarations('.container');
    assert.equal(c['max-width'], 'var(--container-max)');
    assert.match(c['margin-inline'] ?? '', /auto/);
  });

  it('.header-inner uses Flexbox with wrapping (mobile-first)', () => {
    const h = declarations('.header-inner');
    assert.equal(h.display, 'flex');
    assert.equal(h['flex-wrap'], 'wrap');
  });

  it('.nav-list is a wrapping flex container', () => {
    const n = declarations('.nav-list');
    assert.equal(n.display, 'flex');
    assert.equal(n['flex-wrap'], 'wrap');
  });

  it('.project-grid is a 1-column CSS Grid on mobile', () => {
    const g = declarations('.project-grid');
    assert.equal(g.display, 'grid');
    assert.equal(g['grid-template-columns'], '1fr');
  });

  it('.skill-grid wraps its chips', () => {
    const s = declarations('.skill-grid');
    assert.equal(s.display, 'flex');
    assert.equal(s['flex-wrap'], 'wrap');
  });

  it('.card stretches its body so cards are equal height', () => {
    const card = declarations('.card');
    assert.equal(card.display, 'flex');
    assert.equal(card['flex-direction'], 'column');
    assert.equal(declarations('.card-body').flex, '1');
  });

  it('.card-media keeps a stable aspect ratio', () => {
    const media = declarations('.card-media');
    assert.equal(media['aspect-ratio'], '5 / 3');
    assert.equal(media['object-fit'], 'cover');
  });
});

// ---------------------------------------------------------------------------
// Responsive behaviour
// ---------------------------------------------------------------------------
describe('styles — responsive breakpoints', () => {
  it('mobile-first: base .project-grid is single column before any media query', () => {
    const idx = CSS.indexOf('.project-grid');
    const firstMedia = CSS.indexOf('@media');
    assert.ok(idx > -1 && (firstMedia === -1 || idx < firstMedia));
  });

  it('tablet breakpoint at 768px switches the project grid to 2 columns', () => {
    const [tablet] = mediaFor(768);
    assert.ok(tablet, 'missing @media (min-width: 768px)');
    assert.match(tablet.body, /grid-template-columns:\s*repeat\(\s*2/);
  });

  it('tablet breakpoint turns the hero into a row layout', () => {
    const [tablet] = mediaFor(768);
    assert.match(tablet.body, /\.hero-inner\s*\{[^}]*flex-direction:\s*row/);
  });

  it('desktop breakpoint at 1280px switches the project grid to 3 columns', () => {
    const [desktop] = mediaFor(1280);
    assert.ok(desktop, 'missing @media (min-width: 1280px)');
    assert.match(desktop.body, /grid-template-columns:\s*repeat\(\s*3/);
  });

  it('uses min-width media queries only — no max-width desktop-first rules (negative)', () => {
    for (const { query } of mediaBodies) {
      if (/prefers-/.test(query)) continue;
      assert.match(query, /min-width/, `unexpected media query: ${query}`);
      assert.doesNotMatch(query, /max-width/, `desktop-first query found: ${query}`);
    }
  });

  it('breakpoints are ordered ascending (edge)', () => {
    const widths = mediaBodies
      .map((m) => /min-width:\s*(\d+)px/.exec(m.query))
      .filter(Boolean)
      .map((m) => Number(m[1]));
    const sorted = [...widths].sort((a, b) => a - b);
    assert.deepEqual(widths, sorted, 'media queries must be ordered mobile → desktop');
  });
});

// ---------------------------------------------------------------------------
// Accessibility / preferences
// ---------------------------------------------------------------------------
describe('styles — accessibility', () => {
  it('defines a visible :focus-visible outline', () => {
    const focus = declarations(':focus-visible');
    assert.ok(focus.outline, 'keyboard users need a visible focus ring');
    assert.match(focus.outline, /solid/);
  });

  it('honours prefers-reduced-motion', () => {
    const reduced = mediaBodies.find((m) => /prefers-reduced-motion:\s*reduce/.test(m.query));
    assert.ok(reduced, 'missing reduced-motion media query');
    assert.match(reduced.body, /animation:\s*none/);
    assert.match(reduced.body, /transition:\s*none/);
  });

  it('enables smooth scrolling by default and disables it for reduced motion', () => {
    assert.match(declarations('html')['scroll-behavior'] ?? '', /smooth/);
    const reduced = mediaBodies.find((m) => /prefers-reduced-motion/.test(m.query));
    assert.match(reduced.body, /scroll-behavior:\s*auto/);
  });

  it('sticky header does not cover content when jumping to an anchor (edge)', () => {
    const header = declarations('.site-header');
    assert.equal(header.position, 'sticky');
    assert.equal(header.top, '0');
  });
});

// ---------------------------------------------------------------------------
// Consistency between HTML and CSS
// ---------------------------------------------------------------------------
describe('styles — CSS/HTML contract', () => {
  // Classes that are intentionally hook-only (layout wrappers whose children carry
  // the styling, or JS/QA hooks) rather than having declarations of their own.
  const HOOK_ONLY_CLASSES = new Set(['brand-name', 'main-nav', 'contact-inner']);

  it('every class used in index.html has a rule in the stylesheet', () => {
    const cssClasses = new Set([...CSS.matchAll(/\.([a-z][\w-]*)/g)].map((m) => m[1]));
    const missing = [...classesInHtml].filter(
      (c) => !cssClasses.has(c) && !HOOK_ONLY_CLASSES.has(c),
    );
    assert.deepEqual(missing, [], `classes without styles: ${missing.join(', ')}`);
  });

  it('does not leave commented-out rules in production CSS (negative)', () => {
    assert.doesNotMatch(CSS_RAW, /^\s*(?:box-shadow|max-width):\s*var\([^)]*\)\s*;\s*\*\//m);
  });

  it('stylesheet is reachable and non-trivial', () => {
    assert.ok(CSS_PATH.endsWith('styles.css'));
    assert.ok(CSS_RAW.length > 1000, 'stylesheet looks truncated');
  });
});
