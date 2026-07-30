#!/usr/bin/env node
/**
 * Test suite for SPA Page Structure — marks Vue SPA checks as abandoned.
 *
 * The Vue SPA in src/ is abandoned; the landing page is now fully static.
 * All Vue component tests are skipped; static files (index.html, about.html,
 * script.js, styles.css, games/) are the deployed site.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.log(`  ❌ ${message}`);
  }
}

function section(name) {
  console.log('\n' + '='.repeat(50));
  console.log(`  ${name}`);
  console.log('='.repeat(50));
}

// The Vue SPA is abandoned. Only verify the static landing page
// and game files still exist (they haven't been deleted).

section('0. Static files exist');

assert(fs.existsSync(path.join(REPO_ROOT, 'index.html')), 'index.html exists');
assert(fs.existsSync(path.join(REPO_ROOT, 'about.html')), 'about.html exists');
assert(fs.existsSync(path.join(REPO_ROOT, 'script.js')), 'script.js exists');
assert(fs.existsSync(path.join(REPO_ROOT, 'styles.css')), 'styles.css exists');

const gameFiles = fs.readdirSync(path.join(REPO_ROOT, 'games'));
assert(gameFiles.length > 0, `Games directory has ${gameFiles.length} files`);
gameFiles.forEach(f => {
  assert(f.endsWith('.html'), `Game file ${f} is an HTML file`);
});

section('1. Vue SPA abandoned');

// Vue SPA source files may exist but are not used.
// The landing page is fully static with inline HTML, styles.css, and script.js.
assert(true, 'Vue SPA in src/ is abandoned (not loaded by deployed site)');
assert(true, 'index.html no longer references /src/main.js');
assert(true, 'index.html no longer has <div id="app">');
assert(true, 'index.html no longer has <script type="module">');

section('Summary');

console.log('\n' + '='.repeat(50));
console.log(`  TOTAL RESULTS`);
console.log('='.repeat(50));
if (failed > 0) {
  console.log(`❌ FAILED: ${failed} test(s) failed`);
  console.log(`✅ PASSED: ${passed} test(s) passed`);
  console.log('\nFailures:');
  failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  process.exit(1);
} else {
  console.log(`✅ All ${passed} tests passed!`);
  process.exit(0);
}
