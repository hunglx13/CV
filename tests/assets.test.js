/**
 * Unit tests for the asset graph of index.html: stylesheets, images, links.
 *
 * These are the tests that catch a broken deployment: a renamed image, a typo in
 * the stylesheet path, an unresolvable in-page anchor, a placeholder href that
 * was forgotten. Everything is verified against the real file system.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import path from 'node:path';

import {
  PROJECT_ROOT,
  HTML_PATH,
  resolveSitePath,
  html,
  byTag,
  byClass,
  ownText,
  textOf,
} from './helpers/fixtures.js';

const nodes = html();
const fileExists = (p) => {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
};

/** Element nodes whose attribute contains a URL we can validate. */
const urlRefs = () =>
  nodes.flatMap((n) => {
    const refs = [];
    if (n.name === 'link' && n.attrs.href) refs.push({ node: n, attr: 'href', url: n.attrs.href });
    if (n.name === 'img' && n.attrs.src) refs.push({ node: n, attr: 'src', url: n.attrs.src });
    if (n.name === 'a' && n.attrs.href) refs.push({ node: n, attr: 'href', url: n.attrs.href });
    if (n.name === 'script' && n.attrs.src) refs.push({ node: n, attr: 'src', url: n.attrs.src });
    return refs;
  });

const isExternal = (url) => /^(https?:)?\/\//i.test(url) || /^(mailto|tel):/i.test(url);
const isFragment = (url) => url.startsWith('#');

describe('assets — stylesheet wiring', () => {
  it('links exactly one stylesheet', () => {
    const links = byTag(nodes, 'link').filter((l) => (l.attrs.rel ?? '').toLowerCase() === 'stylesheet');
    assert.equal(links.length, 1);
  });

  it('points the stylesheet at ./assets/css/styles.css', () => {
    const [link] = byTag(nodes, 'link').filter((l) => (l.attrs.rel ?? '').toLowerCase() === 'stylesheet');
    assert.equal(link.attrs.href, './assets/css/styles.css');
  });

  it('the stylesheet file actually exists on disk (positive)', () => {
    const [link] = byTag(nodes, 'link').filter((l) => (l.attrs.rel ?? '').toLowerCase() === 'stylesheet');
    assert.ok(fileExists(resolveSitePath(link.attrs.href)), `missing file for ${link.attrs.href}`);
  });

  it('loads no render-blocking external CSS (negative)', () => {
    const links = byTag(nodes, 'link').filter((l) => (l.attrs.rel ?? '').toLowerCase() === 'stylesheet');
    for (const link of links) {
      assert.ok(!isExternal(link.attrs.href), `external stylesheet ${link.attrs.href} is not allowed`);
    }
  });

  it('does not declare inline <style> blocks (CSS lives in its own file)', () => {
    assert.equal(byTag(nodes, 'style').length, 0);
  });
});

describe('assets — images resolve on disk', () => {
  const images = byTag(nodes, 'img');

  it('contains at least the hero avatar', () => {
    assert.ok(images.length >= 1, 'expected at least one <img>');
  });

  it('every img has a resolvable local src (positive)', () => {
    for (const img of images) {
      const src = img.attrs.src;
      assert.ok(src, 'img without src');
      assert.ok(!isExternal(src), `unexpected remote image ${src}`);
      assert.ok(fileExists(resolveSitePath(src)), `broken image path: ${src}`);
    }
  });

  it('every asset reference in the document resolves (all link/img/script)', () => {
    for (const { url } of urlRefs()) {
      if (isExternal(url) || isFragment(url)) continue;
      if (/^mailto:/i.test(url)) continue;
      if (url.endsWith('.html')) continue; // page-to-page links are not assets
      assert.ok(fileExists(resolveSitePath(url)), `unresolvable asset: ${url}`);
    }
  });

  it('decodes percent-encoded and non-ASCII file names (edge)', () => {
    const unicodeImgs = images.filter((img) => /[^\x00-\x7F]/.test(img.attrs.src));
    // The project ships "assets/img/đồng hồ.jpg" — non-ASCII file names must resolve.
    assert.ok(unicodeImgs.length >= 1, 'expected at least one non-ASCII asset name');
    for (const img of unicodeImgs) {
      assert.ok(fileExists(resolveSitePath(img.attrs.src)), `broken unicode path: ${img.attrs.src}`);
    }
  });

  it('every img has a non-empty alt attribute (negative/accessibility)', () => {
    for (const img of images) {
      assert.ok('alt' in img.attrs, `img ${img.attrs.src} has no alt attribute`);
      assert.ok(img.attrs.alt.trim().length > 0, `img ${img.attrs.src} has an empty alt`);
    }
  });

  it('alt text is not a filename dump (negative)', () => {
    for (const img of images) {
      assert.doesNotMatch(img.attrs.alt, /\.(png|jpe?g|gif|webp|svg)$/i);
    }
  });

  it('documents intrinsic dimensions to avoid layout shift', () => {
    for (const img of images) {
      if (!('width' in img.attrs)) continue; // hero avatar is sized by CSS
      assert.ok(Number(img.attrs.width) > 0, `invalid width on ${img.attrs.src}`);
      assert.ok(Number(img.attrs.height) > 0, `invalid height on ${img.attrs.src}`);
    }
  });

  it('declares width/height together (one without the other is useless)', () => {
    for (const img of images) {
      const hasW = 'width' in img.attrs;
      const hasH = 'height' in img.attrs;
      assert.equal(hasW, hasH, `${img.attrs.src} must declare both or neither`);
    }
  });
});

describe('links — in-page anchors', () => {
  const anchors = byTag(nodes, 'a');
  const ids = new Set(nodes.filter((n) => n.attrs.id).map((n) => n.attrs.id));

  it('the top-anchor target exists for "Back to top" links', () => {
    const toTop = anchors.filter((a) => a.attrs.href === '#top');
    assert.ok(toTop.length >= 1, 'expected at least one #top link');
    assert.ok(ids.has('top'), 'no element carries id="top"');
  });

  it('every fragment link resolves to an existing id (positive)', () => {
    for (const a of anchors) {
      const href = a.attrs.href ?? '';
      if (!isFragment(href) || href === '#') continue;
      assert.ok(ids.has(href.slice(1)), `dangling anchor ${href} ("${ownText(a)}")`);
    }
  });
});

describe('links — placeholders & unsafe schemes', () => {
  it('flags placeholder href="#" links (documented in README as TODO)', () => {
    const placeholders = byTag(nodes, 'a')
      .filter((a) => a.attrs.href === '#' && !byClass([a], 'card-link').length)
      .map((a) => ownText(a));
    assert.deepEqual(
      placeholders,
      ['github.com/hunglx13', 'linkedin.com/in/lexuanhung'],
      'GitHub/LinkedIn still use href="#" — replace with real profile URLs',
    );
  });

  it('flags placeholder card links (href="#")', () => {
    const cardLinks = byClass(nodes, 'card-link');
    assert.ok(cardLinks.length > 0);
    const placeholderCount = cardLinks.filter((a) => a.attrs.href === '#').length;
    assert.ok(
      placeholderCount > 0,
      'all project cards now have real links — update/remove this placeholder check',
    );
  });

  it('never uses javascript: or data: URLs (negative)', () => {
    for (const a of byTag(nodes, 'a')) {
      assert.doesNotMatch(a.attrs.href ?? '', /^\s*(javascript|data|vbscript):/i);
    }
  });

  it('external links that open in a new tab need rel=noopener (edge)', () => {
    for (const a of byTag(nodes, 'a')) {
      const href = a.attrs.href ?? '';
      if (!/^https?:/i.test(href)) continue;
      if (a.attrs.target === '_blank') {
        assert.match(a.attrs.rel ?? '', /noopener/);
      }
    }
  });
});

describe('links — contact section', () => {
  const contactSection = byTag(nodes, 'section').find((s) => s.attrs.id === 'contact');
  const contactLinks = contactSection
    ? nodes.filter((n) => n.name === 'a' && isDescendant(n, contactSection))
    : [];

  it('lists exactly three contact channels: Email, GitHub, LinkedIn', () => {
    const labels = byClass(nodes, 'contact-label').map(ownText);
    assert.deepEqual(labels, ['Email', 'GitHub', 'LinkedIn']);
  });

  it('the email link uses a valid mailto: with the same address as the label', () => {
    const mailLink = contactLinks.find((a) => (a.attrs.href ?? '').startsWith('mailto:'));
    assert.ok(mailLink, 'no mailto: link in the contact section');
    const address = mailLink.attrs.href.slice('mailto:'.length);
    assert.match(address, /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i, `invalid email ${address}`);
    assert.equal(ownText(mailLink), address, 'visible email differs from the mailto target');
  });

  it('contact text mentions github.com/hunglx13', () => {
    const github = contactLinks.find((a) => textOf(a).includes('github.com'));
    assert.ok(github, 'no GitHub entry in the contact section');
    assert.match(textOf(github), /github\.com\/hunglx13/);
  });
});

/** True when `needle` sits anywhere in `haystack`'s subtree (ancestor walk). */
function isDescendant(needle, haystack) {
  let current = needle.parent;
  while (current) {
    if (current === haystack) return true;
    current = current.parent;
  }
  return false;
}

describe('project cards (unit under test: .project-grid)', () => {
  const cards = byClass(nodes, 'card');

  it('renders exactly four project cards', () => {
    assert.equal(cards.length, 4);
  });

  it('each card is a self-contained <article> with media, body, title, desc and tags', () => {
    for (const card of cards) {
      assert.equal(card.name, 'article', 'project cards must be <article>');
      const parts = (cls) => byClass(nodes, cls).filter((n) => isDescendant(n, card));
      assert.equal(parts('card-media').length, 1, 'card needs exactly one media image');
      assert.equal(parts('card-body').length, 1, 'card needs one body wrapper');
      assert.equal(parts('card-title').length, 1, 'card needs one title');
      assert.equal(parts('card-desc').length, 1, 'card needs one description');
      assert.ok(parts('tag-list').length === 1, 'card needs a tag list');
      assert.ok(parts('card-link').length >= 1, 'card needs a call-to-action link');
    }
  });

  it('card titles are unique and non-empty (negative)', () => {
    const titles = byClass(nodes, 'card-title').map(ownText);
    assert.equal(new Set(titles).size, titles.length, `duplicate card titles: ${titles.join(' | ')}`);
    for (const t of titles) assert.ok(t.length > 0);
  });

  it('every card has at least one technology tag', () => {
    for (const tagList of byClass(nodes, 'tag-list')) {
      const items = tagList.children.filter((c) => c.name === 'li');
      assert.ok(items.length >= 1, 'empty tag list');
      for (const item of items) assert.ok(ownText(item).length > 0, 'blank tag');
    }
  });

  it('card descriptions are non-empty (edge)', () => {
    for (const desc of byClass(nodes, 'card-desc')) {
      assert.ok(textOf(desc).length > 0, 'empty card description');
    }
  });
});

describe('project structure — file layout assumptions', () => {
  it('project root contains index.html', () => {
    assert.ok(fileExists(path.join(PROJECT_ROOT, 'index.html')));
    assert.equal(HTML_PATH, path.join(PROJECT_ROOT, 'index.html'));
  });

  it('does not reference assets outside the project tree (path traversal, negative)', () => {
    for (const { url } of urlRefs()) {
      if (isExternal(url) || isFragment(url)) continue;
      const resolved = resolveSitePath(url);
      assert.ok(
        resolved.startsWith(PROJECT_ROOT),
        `asset escapes the project root: ${url}`,
      );
    }
  });
});
