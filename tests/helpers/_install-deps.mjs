/**
 * Minimal, no-npm dependency installer for this test suite.
 *
 * Why: this project is a static site and some machines (including CI sandboxes)
 * ship Node without an `npm` binary. This script reads package.json
 * devDependencies, downloads every tarball from the public npm registry and
 * extracts it into ./node_modules/<name>.
 *
 * Usage:
 *   node tests/helpers/_install-deps.mjs            # install devDependencies
 *   node tests/helpers/_install-deps.mjs jsdom     # install specific packages
 */
import { execFile } from 'node:child_process';
import { createWriteStream, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const MODULES = path.join(ROOT, 'node_modules');
const CACHE = path.join(ROOT, '.testdeps');
const SEED = process.argv.slice(2);

const run = promisify(execFile);
mkdirSync(MODULES, { recursive: true });
mkdirSync(CACHE, { recursive: true });

const installed = new Set();
const failed = [];

async function resolvePackage(name) {
  const res = await fetch(`https://registry.npmjs.org/${name.replace('/', '%2f')}/latest`);
  if (!res.ok) throw new Error(`registry HTTP ${res.status} for ${name}`);
  return res.json();
}

async function download(name, meta) {
  const file = path.join(CACHE, `${name.replace(/[@/]/g, '_')}.tgz`);
  if (!existsSync(file) || readFileSync(file).length === 0) {
    const res = await fetch(meta.dist.tarball);
    if (!res.ok) throw new Error(`tarball HTTP ${res.status} for ${name}`);
    // Write via a stream pipeline: works with gzip bodies and closes the file handle.
    await pipeline(Readable.fromWeb(res.body), createWriteStream(file));
  }
  return file;
}

async function extract(name, file) {
  const dest = path.join(MODULES, name);
  mkdirSync(dest, { recursive: true });
  // Windows library paths are not UTF-8: use relative paths from ROOT so that a
  // non-ASCII project directory (e.g. "Hưnglee") does not break tar.
  const args = ['-xzf', path.relative(ROOT, file), '-C', path.relative(ROOT, dest), '--strip-components=1'];
  // cwd: ROOT keeps every argument ASCII, which Windows tar requires.
  await run('tar', args, { cwd: ROOT });
}

async function install(name, { optional = false } = {}) {
  if (installed.has(name)) return;
  installed.add(name);
  try {
    const meta = await resolvePackage(name);
    const file = await download(name, meta);
    await extract(name, file);
    console.log(`installed ${name}@${meta.version}`);
    const deps = { ...(meta.optionalDependencies ?? {}), ...(meta.dependencies ?? {}) };
    for (const dep of Object.keys(deps)) await install(dep);
  } catch (error) {
    if (optional) {
      installed.delete(name);
      console.warn(`skipped optional ${name}: ${error.message}`);
      return;
    }
    failed.push(name);
    console.error(`failed ${name}: ${error.message}`);
  }
}

async function installFromManifest() {
  const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  // `optional` entries power the optional browser suite and must not fail install
  // (platform-specific prebuilt binaries et al.).
  const optional = new Set(Object.keys(pkg.devDependenciesOptional ?? {}));
  for (const dep of Object.keys(pkg.devDependencies ?? {})) {
    await install(dep, { optional: optional.has(dep) });
  }
}

if (SEED.length) for (const name of SEED) await install(name);
else await installFromManifest();

console.log(`done: ${installed.size - failed.length} installed, ${failed.length} failed`);
if (failed.length) {
  console.error(`could not install: ${failed.join(', ')}`);
  process.exitCode = 1;
}
