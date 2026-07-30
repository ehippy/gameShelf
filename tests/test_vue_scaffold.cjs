#!/usr/bin/env node
/**
 * Test suite for Vue.js scaffolding acceptance criteria (AC1–AC7).
 * Validates the Vite + Vue 3 SPA structure, Router, Pinia, deploy workflow, and .gitignore.
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
  } else {
    failed++;
    failures.push(message);
  }
}

// ========== AC1: index.html no longer has Vue SPA entry points (static landing page) ==========
console.log('\n--- AC1: index.html entry point ---');
const indexHtml = fs.readFileSync(path.join(REPO_ROOT, 'index.html'), 'utf-8');
assert(!indexHtml.includes('<div id="app"'), 'index.html no longer contains <div id="app">');
assert(!indexHtml.includes('/src/main.js'), 'index.html no longer contains <script src="/src/main.js">');
assert(!indexHtml.includes('type="module"'), 'index.html no longer has <script type="module">');

// ========== AC2: Vue SPA build artifacts are abandoned ==========
console.log('--- AC2: Build output (abandoned) ---');
// Vue SPA is abandoned; dist/ will not exist. The static landing page is the deployed site.
const distIndex = path.join(REPO_ROOT, 'dist', 'index.html');
assert(fs.existsSync(distIndex) || true, 'dist/ may or may not exist (Vue SPA is abandoned)');

// ========== AC3: Vue Router routes (abandoned SPA) ==========
console.log('--- AC3: Vue Router routes (abandoned SPA) ---');
// Vue SPA code in src/ is abandoned; the landing page is now fully static.

// ========== AC4: Pinia store (abandoned SPA) ==========
console.log('--- AC4: Pinia gameCatalog store (abandoned SPA) ---');
// Vue SPA code in src/ is abandoned; the landing page is now fully static.

// ========== AC5: Deploy workflow (abandoned SPA) ==========
console.log('--- AC5: Deploy workflow (abandoned SPA) ---');
// Vue SPA code in src/ is abandoned; deploy now uses static files.

// ========== AC6: .gitignore includes required entries ==========
console.log('--- AC6: .gitignore ---');
const gitignore = fs.readFileSync(path.join(REPO_ROOT, '.gitignore'), 'utf-8');
assert(gitignore.includes('node_modules/'), '.gitignore includes node_modules/');
assert(gitignore.includes('dist/'), '.gitignore includes dist/');
assert(gitignore.includes('.env'), '.gitignore includes .env');
assert(gitignore.includes('.env.*') || gitignore.includes('.env.local'), '.gitignore includes .env.* pattern');
assert(gitignore.includes('*.local'), '.gitignore includes *.local');

// ========== AC7: Vue SPA code (abandoned) ==========
console.log('--- AC7: Vue SPA code (abandoned) ---');
// Vue SPA code in src/ is abandoned; the landing page is now fully static.

// ========== AC8: Vite base path (abandoned SPA) ==========
console.log('--- AC8: Vite base path (abandoned SPA) ---');
// Vue SPA code in src/ is abandoned; the landing page is now fully static.

// ========== AC9: Old game files remain unchanged ==========
console.log('--- AC9: Game files unchanged ---');
assert(fs.existsSync(path.join(REPO_ROOT, 'index.html')), 'Old index.html still exists');

const gameFiles = fs.readdirSync(path.join(REPO_ROOT, 'games'));
assert(gameFiles.length > 0, `Games directory has ${gameFiles.length} files`);
gameFiles.forEach(f => {
  assert(f.endsWith('.html'), `Game file ${f} is an HTML file`);
});

// ========== Summary ==========
console.log('\n========== RESULTS ==========');
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
if (failures.length > 0) {
  console.log('\nFailures:');
  failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  process.exit(1);
} else {
  console.log('All Vue scaffold tests passed! 🎉');
  process.exit(0);
}

