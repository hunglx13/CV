/**
 * DOM-level tests: render index.html in a simulated browser environment and
 * exercise the behaviour a visitor actually gets — landmark traversal, anchor
 * navigation, rendered text, and the accessibility tree surface.
 *
 * jsdom gives us a real document without a network layer, so it is both fast and
 * deterministic. If jsdom is not installed the whole suite is skipped with a
 * clear reason instead of failing the other suites.
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { HTML_PATH } from './helpers/fixtures.js';

let JSDOM = null;
let jsdomLoadError = null;

try {
  ({ JSDOM } = await import('jsdom'));
} catch (error) {
  jsdomLoadError = error;
}

const skipReason = jsdomLoadError
  ? `jsdom is not installed (run "npm install" first): ${jsdomLoadError.message.split('\n')[0]}`
  : false;

let dom;
let document;

before(() => {
  if (skipReason) return;
  dom = new JSDOM(readFileSync(HTML_PATH, 'utf8'), { url: 'http://localhost/' });
  document = dom.window.document;
});

after(() => {
  if (!skipReason) dom?.window.close();
});

const q = (selector) => document.querySelector(selector);
const qa = (selector) => [...document.querySelectorAll(selector)];

describe('DOM — rendered page', { skip: skipReason }, () => {
  it('parses without dropping structural elements', () => {
    assert.ok(q('header.site-header'));
    assert.ok(q('nav.main-nav'));
    assert.ok(q('main#top'));
    assert.ok(q('footer.site-footer'));
  });

  it('exposes the hero content as rendered text', () => {
    assert.equal(q('h1.hero-title').textContent.trim(), 'Lê Xuân Hưng');
    assert.match(q('.hero-role').textContent, /Frontend Developer/);
    assert.ok(q('.hero-desc').textContent.trim().length > 40);
  });

  it('renders the six skill chips in order', () => {
    const chips = qa('.skill-grid .skill-chip').map((el) => el.textContent.trim());
    assert.deepEqual(chips, [
      'HTML5',
      'CSS3 / Flexbox / Grid',
      'JavaScript (ES6+)',
      'Responsive Design',
      'Git & GitHub',
      'Figma / Wireframe',
    ]);
  });

  it('renders the four project cards with titles and links', () => {
    const cards = qa('.project-grid > .card');
    assert.equal(cards.length, 4);
    assert.deepEqual(
      cards.map((c) => c.querySelector('.card-title').textContent.trim()),
      ['GS25', 'Tháp đồng hồ Big Ben', 'Starbucks', 'Iphone 18 pro max'],
    );
    for (const card of cards) {
      assert.ok(card.querySelector('img.card-media'), 'card media missing');
      assert.ok(card.querySelector('a.card-link'), 'card CTA missing');
    }
  });

  it('renders a contact email link that a user can click', () => {
    const mail = q('#contact a[href^="mailto:"]');
    assert.ok(mail);
    assert.equal(mail.getAttribute('href'), 'mailto:lexuanhung130908@gmail.com');
    assert.equal(mail.textContent.trim(), 'lexuanhung130908@gmail.com');
  });

  it('renders a working "back to top" control in the footer', () => {
    const toTop = q('footer a.to-top');
    assert.ok(toTop);
    assert.equal(toTop.getAttribute('href'), '#top');
    assert.ok(document.getElementById('top'), 'the #top target must exist');
  });
});

describe('DOM — anchor navigation', { skip: skipReason }, () => {
  it('every in-page link resolves to an element in the document', () => {
    const links = qa('a[href^="#"]').filter((a) => a.getAttribute('href') !== '#');
    assert.ok(links.length >= 5);
    for (const link of links) {
      const id = link.getAttribute('href').slice(1);
      assert.ok(document.getElementById(id), `#${id} from "${link.textContent.trim()}" not found`);
    }
  });

  it('nav order matches the visual page order of the sections', () => {
    const navTargets = qa('nav.main-nav a').map((a) => a.getAttribute('href').slice(1));
    const positions = navTargets.map((id) => qa('[id]').indexOf(document.getElementById(id)));
    const sorted = [...positions].sort((a, b) => a - b);
    assert.deepEqual(positions, sorted, 'menu order differs from document order');
  });

  it('hero call-to-action buttons target existing sections (positive)', () => {
    for (const btn of qa('.hero-actions .btn')) {
      assert.match(btn.getAttribute('href'), /^#[a-z]+$/);
      assert.ok(document.getElementById(btn.getAttribute('href').slice(1)));
    }
  });
});

describe('DOM — accessibility surface', { skip: skipReason }, () => {
  it('has a document title and language', () => {
    assert.ok(document.title.length > 0);
    assert.equal(document.documentElement.lang, 'vi');
  });

  it('every image exposes alternative text', () => {
    for (const img of qa('img')) {
      assert.ok(img.hasAttribute('alt'), `img ${img.getAttribute('src')} missing alt`);
      assert.ok(img.getAttribute('alt').trim().length > 0);
    }
  });

  it('links have discernible text (no empty accessible names)', () => {
    for (const a of qa('a')) {
      assert.ok(a.textContent.trim().length > 0, `empty link to ${a.getAttribute('href')}`);
    }
  });

  it('the nav landmark is labelled and links are focusable', () => {
    const nav = q('nav.main-nav');
    assert.equal(nav.getAttribute('aria-label'), 'Điều hướng chính');
    for (const a of nav.querySelectorAll('a')) {
      a.focus();
      assert.equal(document.activeElement, a, 'nav link is not keyboard focusable');
    }
  });

  it('decorative brand mark is hidden from assistive technology', () => {
    const mark = q('.brand-mark');
    assert.ok(mark, 'brand mark missing');
    assert.equal(mark.getAttribute('aria-hidden'), 'true');
  });

  it('interactive elements are real links, not click-handled divs (negative)', () => {
    assert.equal(qa('div[onclick], span[onclick]').length, 0);
  });
});

describe('DOM — resilience (edge cases)', { skip: skipReason }, () => {
  it('re-rendering the same markup yields an identical card count', () => {
    const fresh = new JSDOM(readFileSync(HTML_PATH, 'utf8')).window.document;
    assert.equal(
      fresh.querySelectorAll('.card').length,
      document.querySelectorAll('.card').length,
    );
    fresh.defaultView.close();
  });

  it('text nodes contain no unresolved template syntax', () => {
    assert.doesNotMatch(document.body.textContent, /\{\{|\}\}|\$\{/);
  });

  it('no element is nested inside <p> in a way that unclosed <p> tags would break', () => {
    // A <p> may only contain phrasing content; block elements inside it get
    // auto-closed by the HTML parser and shift the DOM.
    const blockInsideP = qa('p article, p section, p div, p ul').length;
    assert.equal(blockInsideP, 0);
  });

  it('document has no duplicate ids', () => {
    const ids = qa('[id]').map((el) => el.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});
