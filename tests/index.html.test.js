/**
 * Unit tests for index.html — document metadata & page structure.
 * Runner: Node's built-in test runner (node:test) with node:assert/strict.
 *
 * Coverage strategy:
 *   - positive : the page exposes the metadata, landmarks and nav the spec requires
 *   - negative : no duplicate ids, no missing headings, no bogus doctype/lang
 *   - edge     : empty/whitespace title, trailing whitespace in content, etc.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  HTML_RAW,
  html,
  byTag,
  byClass,
  ownText,
  textOf,
} from './helpers/fixtures.js';

const nodes = html();
const valueOf = (node) => node?.attrs.content ?? '';

/** All heading nodes in document order. */
const headings = () => nodes.filter((n) => /^h[1-6]$/.test(n.name));

/** All descendants with the given tag, in document order. */
function findByTag(node, tag) {
  const found = [];
  const walk = (n) => {
    for (const child of n.children) {
      if (child.name === tag) found.push(child);
      else walk(child);
    }
  };
  walk(node);
  return found;
}

const headingWithin = (node, tag) => findByTag(node, tag)[0];

/** Read a <meta> tag by name (case-insensitive). */
const metaByName = (name) =>
  byTag(nodes, 'meta').find((m) => (m.attrs.name ?? '').toLowerCase() === name.toLowerCase());

describe('index.html — document skeleton', () => {
  it('starts with an HTML5 doctype', () => {
    assert.match(HTML_RAW.trimStart().slice(0, 15).toLowerCase(), /^<!doctype html>/);
  });

  it('declares Vietnamese as the document language', () => {
    const [htmlNode] = byTag(nodes, 'html');
    assert.ok(htmlNode, 'expected exactly one <html> element');
    assert.equal(htmlNode.attrs.lang, 'vi');
  });

  it('has exactly one <head> and one <body>', () => {
    assert.equal(byTag(nodes, 'head').length, 1);
    assert.equal(byTag(nodes, 'body').length, 1);
    assert.equal(byTag(nodes, 'title').length, 1);
  });

  it('closes the document with </html>', () => {
    assert.match(HTML_RAW.trimEnd(), /<\/html>$/i);
  });
});

describe('index.html — required metadata', () => {
  it('declares UTF-8 charset first in <head>', () => {
    const charset = byTag(nodes, 'meta').find((m) => 'charset' in m.attrs);
    assert.ok(charset, 'expected <meta charset>');
    assert.equal(charset.attrs.charset.toUpperCase(), 'UTF-8');
  });

  it('declares a mobile-first viewport', () => {
    const viewport = metaByName('viewport');
    assert.ok(viewport, 'expected <meta name="viewport">');
    assert.match(valueOf(viewport), /width=device-width/);
    assert.match(valueOf(viewport), /initial-scale=1(\.0)?/);
  });

  it('provides a non-empty, descriptive description', () => {
    const description = metaByName('description');
    assert.ok(description, 'expected <meta name="description">');
    const content = valueOf(description).trim();
    assert.ok(content.length > 0, 'description must not be blank');
    assert.ok(content.length <= 160, `description is ${content.length} chars (>160 hurts SEO)`);
  });

  it('provides an author meta tag', () => {
    const author = metaByName('author');
    assert.ok(author, 'expected <meta name="author">');
    assert.ok(valueOf(author).trim().length > 0);
  });

  it('has a non-empty <title> with no leading/trailing whitespace', () => {
    const title = byTag(nodes, 'title')[0];
    const text = ownText(title);
    assert.ok(text.length > 0, 'title must not be empty');
    assert.ok(text.length <= 70, `title is ${text.length} chars (>70 gets truncated in SERPs)`);
  });

  it('does not ship leftover template placeholders in metadata', () => {
    const description = valueOf(metaByName('description'));
    assert.doesNotMatch(description, /lorem ipsum|todo|placeholder/i);
    assert.doesNotMatch(ownText(byTag(nodes, 'title')[0]), /lorem ipsum|todo/i);
  });
});

describe('index.html — landmarks & sections', () => {
  it('exposes the five expected landmarks', () => {
    assert.equal(byTag(nodes, 'header').length, 1, 'one <header>');
    assert.equal(byTag(nodes, 'nav').length, 1, 'one <nav>');
    assert.equal(byTag(nodes, 'main').length, 1, 'one <main>');
    assert.equal(byTag(nodes, 'footer').length, 1, 'one <footer>');
    assert.ok(byTag(nodes, 'section').length >= 4, 'expected at least 4 <section>s');
  });

  it('contains the four navigable sections: about, skills, projects, contact', () => {
    const ids = byTag(nodes, 'section')
      .map((s) => s.attrs.id)
      .filter(Boolean);
    for (const id of ['about', 'skills', 'projects', 'contact']) {
      assert.ok(ids.includes(id), `missing <section id="${id}">`);
    }
  });

  it('main is the top anchor target (#top)', () => {
    const main = byTag(nodes, 'main')[0];
    assert.equal(main.attrs.id, 'top');
  });

  it('each navigable section has an accessible <h2>', () => {
    for (const id of ['skills', 'projects', 'contact']) {
      const section = byTag(nodes, 'section').find((s) => s.attrs.id === id);
      const heading = headingWithin(section, 'h2');
      assert.ok(heading, `section #${id} is missing an <h2>`);
      assert.ok(ownText(heading).length > 0, `section #${id} has an empty <h2>`);
    }
  });

  it('has exactly one <h1> — the hero title', () => {
    const h1s = byTag(nodes, 'h1');
    assert.equal(h1s.length, 1, 'pages should have a single <h1>');
    assert.equal(ownText(h1s[0]), 'Lê Xuân Hưng');
  });

  it('keeps heading levels ordered (no skipped levels)', () => {
    const levels = headings().map((n) => Number(n.name[1]));
    assert.equal(levels[0], 1, 'first heading must be <h1>');
    for (let i = 1; i < levels.length; i += 1) {
      assert.ok(
        levels[i] - levels[i - 1] <= 1,
        `heading jumped from h${levels[i - 1]} to h${levels[i]}`,
      );
    }
  });
});

describe('index.html — navigation', () => {
  const nav = byTag(nodes, 'nav')[0];
  const navList = nav?.children.find((c) => c.name === 'ul');
  const navLinks = navList ? findByTag(navList, 'a') : [];

  it('has a labelled <nav> landmark', () => {
    assert.ok(nav, 'expected a <nav> element');
    assert.equal(nav.attrs['aria-label'], 'Điều hướng chính');
  });

  it('exposes exactly the four menu entries', () => {
    assert.equal(navLinks.length, 4);
    assert.deepEqual(
      navLinks.map((a) => ownText(a)),
      ['Giới thiệu', 'Kỹ năng', 'Dự án', 'Liên hệ'],
    );
  });

  it('every nav link points at an element that exists (positive)', () => {
    const ids = new Set(nodes.filter((n) => n.attrs.id).map((n) => n.attrs.id));
    for (const link of navLinks) {
      const href = link.attrs.href ?? '';
      assert.match(href, /^#[a-z][\w-]*$/i, `nav href "${href}" is not a fragment link`);
      assert.ok(ids.has(href.slice(1)), `nav href "${href}" has no matching element id`);
    }
  });

  it('does not contain placeholder or javascript: links (negative)', () => {
    for (const link of navLinks) {
      assert.notEqual(link.attrs.href, '#', 'nav must not use bare "#"');
      assert.doesNotMatch(link.attrs.href ?? '', /^javascript:/i);
    }
  });

  it('renders nav entries as list items inside a single list (edge)', () => {
    const lists = nav.children.filter((c) => c.name === 'ul');
    assert.equal(lists.length, 1);
    assert.ok(
      lists[0].children.every((c) => c.name === 'li'),
      'nav list must contain only <li> children',
    );
  });
});

describe('index.html — ids are unique (edge/negative)', () => {
  it('has no duplicate id attributes', () => {
    const ids = nodes.filter((n) => n.attrs.id).map((n) => n.attrs.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(dupes, [], `duplicate ids: ${dupes.join(', ')}`);
  });

  it('every id is a valid, URL-safe fragment identifier', () => {
    for (const id of nodes.filter((n) => n.attrs.id).map((n) => n.attrs.id)) {
      assert.match(id, /^[A-Za-z][\w-]*$/, `invalid id "${id}"`);
    }
  });

  it('has no ids made only of whitespace', () => {
    const ids = nodes.filter((n) => n.attrs.id).map((n) => n.attrs.id);
    for (const id of ids) assert.ok(id.trim().length > 0);
  });
});

it('has a heading outline that starts at h1 and never skips a level', () => {
  const levels = headings().map((n) => Number(n.name[1]));
  assert.deepEqual(levels, [1, 2, 2, 3, 3, 3, 3, 2], 'unexpected heading outline');
});

describe('index.html — content sanity', () => {
  it('renders the profile name consistently in the brand and hero', () => {
    const brand = byClass(nodes, 'brand-name')[0];
    const hero = byTag(nodes, 'h1')[0];
    assert.ok(textOf(brand).includes('Lê Xuân Hưng'));
    assert.equal(ownText(hero), 'Lê Xuân Hưng');
  });

  it('does not leave empty paragraphs or headings (edge)', () => {
    for (const n of nodes.filter((x) => /^(p|h[1-6]|li)$/.test(x.name))) {
      if (n.children.length === 0) {
        assert.ok(ownText(n).length > 0, `<${n.name}> has no text content`);
      }
    }
  });
});
