/**
 * Shared fixtures + a tiny, dependency-free HTML parser.
 *
 * The portfolio under test is a static site (index.html + assets/css/styles.css),
 * so "units" are: the markup structure, the asset/link graph and the stylesheet.
 * Every test file loads the real files from disk — no mocks of the file system.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const PROJECT_ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
export const HTML_PATH = path.join(PROJECT_ROOT, 'index.html');
export const CSS_PATH = path.join(PROJECT_ROOT, 'assets', 'css', 'styles.css');

export const HTML_RAW = readFileSync(HTML_PATH, 'utf8');
export const CSS_RAW = readFileSync(CSS_PATH, 'utf8');

/** Resolve a site-relative URL (as written in the HTML) to an absolute fs path. */
export const resolveSitePath = (url) =>
  path.resolve(PROJECT_ROOT, url.replace(/^\.\//, ''));

/** Returns the decoded local paths of an HTML attribute value. */
export const decodeUrl = (url) => decodeURI(url);

// ---------------------------------------------------------------------------
// Minimal HTML parser — good enough for well-formed, machine-checkable markup.
// Returns a flat list of nodes; tree navigation is done with helper selectors.
// ---------------------------------------------------------------------------
const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

/** @param {string} raw */
export function parseHtml(raw) {
  const withoutComments = raw.replace(/<!--[\s\S]*?-->/g, '');
  const nodes = [];
  const stack = [];
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^<>]*?)?)(\/?)>/g;
  let match;
  let cursor = 0;

  while ((match = tagRe.exec(withoutComments)) !== null) {
    const [, closing, rawName, rawAttrs, selfClosing] = match;
    const name = rawName.toLowerCase();

    // Raw source slice up to the current tag: element content for the innermost
    // open element, and never contains markup (so no tags can leak into text).
    const text = withoutComments.slice(cursor, match.index);
    const parent = stack[stack.length - 1] ?? null;
    if (parent) parent.textParts.push(text);

    if (closing) {
      // pop until the matching open tag is closed (tolerates stray end tags)
      for (let i = stack.length - 1; i >= 0; i -= 1) {
        if (stack[i].name === name) {
          stack.length = i;
          break;
        }
      }
    } else {
      const node = {
        name,
        attrs: parseAttributes(rawAttrs),
        children: [],
        textParts: [],
        parent,
      };
      if (parent) {
        parent.children.push(node);
      }
      nodes.push(node);
      if (!VOID_TAGS.has(name) && !selfClosing) stack.push(node);
    }

    cursor = tagRe.lastIndex;
  }

  return nodes;
}

function parseAttributes(raw) {
  const attrs = {};
  const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = attrRe.exec(raw)) !== null) {
    const value = m[2] ?? m[3] ?? m[4] ?? '';
    attrs[m[1].toLowerCase()] = decodeEntities(value);
  }
  return attrs;
}

export function decodeEntities(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

/** Normalise whitespace the way a browser renders it (collapses + trims). */
export const normalise = (value) => decodeEntities(value).replace(/\s+/g, ' ').trim();

/** All nodes whose tag name matches. */
export const byTag = (nodes, tag) => nodes.filter((n) => n.name === tag.toLowerCase());

/** All nodes carrying the given class. */
export const byClass = (nodes, className) =>
  nodes.filter((n) => (n.attrs.class ?? '').split(/\s+/).includes(className));

/** Last text content of a node (its own text, not descendants). */
export const ownText = (node) => decodeEntities(node.textParts.join(' ')).trim();

/** Concatenation of a node's own text plus all descendant text, in document order. */
export function textOf(node) {
  if (!node) return '';
  // Reconstruct the element's inner HTML text order: own runs interleaved with children.
  const parts = [node.textParts.join('')];
  for (const child of node.children) parts.push(textOf(child));
  return normalise(parts.join(' '));
}

export const html = () => parseHtml(HTML_RAW);
