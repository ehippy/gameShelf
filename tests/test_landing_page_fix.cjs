#!/usr/bin/env node
/**
 * Test suite for "Why is the site all fucked up?" — Landing Page Fix
 *
 * Validates every acceptance criterion from this card that isn't already
 * covered by the existing test suite.
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
    console.log('\n' + '='.repeat(55));
    console.log(`  ${name}`);
    console.log('='.repeat(55));
}

// ============================================================
// Load files
// ============================================================
const indexPath = path.join(REPO_ROOT, 'index.html');
const aboutPath = path.join(REPO_ROOT, 'about.html');
const scriptPath = path.join(REPO_ROOT, 'script.js');
const cssPath = path.join(REPO_ROOT, 'styles.css');
const gamesDir = path.join(REPO_ROOT, 'games');

const indexHtml = fs.readFileSync(indexPath, 'utf-8');
const aboutHtml = fs.readFileSync(aboutPath, 'utf-8');
const scriptJs = fs.readFileSync(scriptPath, 'utf-8');
const cssContent = fs.readFileSync(cssPath, 'utf-8');
const gameFiles = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html'));

// ============================================================
// AC1: index.html no longer references /src/main.js
// ============================================================
section('AC1: No Vue SPA entry point (/src/main.js)');

assert(!indexHtml.includes('/src/main.js'),
    'index.html does not reference /src/main.js');
assert(!indexHtml.includes('type="module"'),
    'index.html has no <script type="module"> tags');

// ============================================================
// AC2: No inline <script type="module"> declaring window.games
// ============================================================
section('AC2: No inline script type="module" declaring window.games');

assert(!indexHtml.match(/<script\s+type="module"[^>]*>/),
    'No <script type="module"> block in index.html');
assert(!indexHtml.includes('window.games'),
    'No window.games declaration in index.html');

// ============================================================
// AC3: CSS link present in <head>
// ============================================================
section('AC3: <link rel="stylesheet" href="styles.css"> in <head>');

assert(indexHtml.includes('<link rel="stylesheet" href="styles.css">'),
    'index.html includes <link rel="stylesheet" href="styles.css">');

// ============================================================
// AC4: <script src="script.js"></script> before </body>
// ============================================================
section('AC4: <script src="script.js"> before </body>');

const scriptIdx = indexHtml.indexOf('<script src="script.js">');
const bodyCloseIdx = indexHtml.indexOf('</body>');
assert(scriptIdx !== -1, 'index.html contains <script src="script.js">');
assert(bodyCloseIdx !== -1 && scriptIdx < bodyCloseIdx,
    '<script src="script.js"> appears before </body>');

// ============================================================
// AC5: No broken favicon (/vite.svg)
// ============================================================
section('AC5: No broken /vite.svg favicon');

assert(!indexHtml.includes('vite.svg'),
    'No reference to /vite.svg in index.html');
assert(!indexHtml.match(/<link\s+rel="icon"[^>]*href="\/vite\.svg"/),
    'No <link rel="icon" ... href="/vite.svg"');

// ============================================================
// AC6: Standard .site-header / .header-inner structure;
//       no ../ paths
// ============================================================
section('AC6: Standard header structure, no ../ paths');

assert(indexHtml.includes('class="site-header"'),
    'Header uses class="site-header"');
assert(indexHtml.includes('class="header-inner"'),
    'Header uses class="header-inner"');

// Check header link paths
const headerSection = indexHtml.substring(0, indexHtml.indexOf('<!-- Most Played'));
assert(!headerSection.includes('../'),
    'Header has no ../ relative paths');

// Check entire index.html for ../ paths
assert(!indexHtml.includes('../'),
    'index.html has no ../ relative paths anywhere');

// ============================================================
// AC7: No <div id="app"> placeholder
// ============================================================
section('AC7: No <div id="app"> placeholder');

assert(!indexHtml.includes('id="app"'),
    'index.html has no <div id="app">');

// ============================================================
// AC8: Flappy Bird card has .card-play
// ============================================================
section('AC8: Flappy Bird card has .card-play');

// Extract the Flappy Bird card block
const flappyCardMatch = indexHtml.match(
    /<a[^>]*href="games\/flappybird\.html"[^>]*>[\s\S]*?<\/a>/
);
assert(flappyCardMatch !== null, 'Flappy Bird grid card <a> element found');
if (flappyCardMatch) {
    assert(flappyCardMatch[0].includes('card-play'),
        'Flappy Bird card has .card-play element');
    assert(flappyCardMatch[0].includes('▶ Play'),
        'Flappy Bird card .card-play has "▶ Play" text');
}

// ============================================================
// AC9: Space Invaders card has .card-play
// ============================================================
section('AC9: Space Invaders card has .card-play');

const spaceInvCardMatch = indexHtml.match(
    /<a[^>]*href="games\/spaceinvaders\.html"[^>]*>[\s\S]*?<\/a>/
);
assert(spaceInvCardMatch !== null, 'Space Invaders grid card <a> element found');
if (spaceInvCardMatch) {
    assert(spaceInvCardMatch[0].includes('card-play'),
        'Space Invaders card has .card-play element');
    assert(spaceInvCardMatch[0].includes('▶ Play'),
        'Space Invaders card .card-play has "▶ Play" text');
}

// ============================================================
// AC10: Whack-a-Mole in script.js gamesCatalog
// ============================================================
section('AC10: Whack-a-Mole in script.js window.gamesCatalog');

assert(scriptJs.includes("name: 'Whack-a-Mole'"),
    'script.js gamesCatalog has Whack-a-Mole name');
assert(scriptJs.includes("href: 'whackamole.html'"),
    'script.js gamesCatalog has Whack-a-Mole href');
assert(scriptJs.includes("category: 'action'"),
    'script.js gamesCatalog has Whack-a-Mole category');

// ============================================================
// AC11: Random game button navigates correctly from homepage
// ============================================================
section('AC11: Random game button URL logic');

// From homepage: pathname does not contain /games/, so it should prefix 'games/'
assert(scriptJs.includes("'games/' + entry.href"),
    'Random button prepends "games/" when not on /games/ page');
assert(scriptJs.includes("window.location.pathname.indexOf('/games/')"),
    'Random button checks pathname for /games/ to determine URL construction');

// ============================================================
// AC12: about.html loads with site header, footer, and styling
// ============================================================
section('AC12: about.html structure');

assert(aboutHtml.includes('class="site-header"'),
    'about.html uses site-header class');
assert(aboutHtml.includes('class="header-inner"'),
    'about.html uses header-inner class');
assert(aboutHtml.includes('class="site-footer"'),
    'about.html has site-footer class');
assert(aboutHtml.includes('© 2025 gameShelf — All games built in browser — no downloads required'),
    'about.html has correct footer copyright text');
assert(aboutHtml.includes('<link rel="stylesheet" href="styles.css">'),
    'about.html links styles.css');
assert(aboutHtml.includes('<script src="script.js"></script>'),
    'about.html loads script.js');

// ============================================================
// AC13: All 13 game files in games/ are linked in index.html grid
//        with correct hrefs, categories, and .card-play
// ============================================================
section('AC13: All 13 games linked in grid with hrefs, categories, .card-play');

// The expected game names (from games/ directory)
const expectedGames = gameFiles.map(f => f.replace('.html', ''));
assert(expectedGames.length === 13,
    `Expected 13 game files, found ${expectedGames.length}: ${expectedGames.join(', ')}`);

// Extract grid cards (cards with data-category in the games-section)
const gridSection = indexHtml.substring(
    indexHtml.indexOf('class="games-section"'),
    indexHtml.indexOf('<!-- Footer -->')
);
const gridCards = gridSection.match(
    /<a[^>]*class="game-card"[^>]*data-category="[^"]*"[^>]*>[\s\S]*?<\/a>/g
) || [];
assert(gridCards.length === 13,
    `Grid has 13 game cards (found ${gridCards.length})`);

// Check each expected game file is present in the grid
const gridHrefs = gridCards.map(card => {
    const m = card.match(/href="([^"]+)"/);
    return m ? m[1] : null;
});
const expectedHrefs = expectedGames.map(name => `games/${name}.html`);

expectedHrefs.forEach(href => {
    assert(gridHrefs.includes(href),
        `Grid includes href="${href}"`);
});

// Check each grid card has a valid category
const validCategories = ['action', 'puzzle', 'arcade', 'strategy', 'board', 'casual'];
gridCards.forEach((card, i) => {
    const catMatch = card.match(/data-category="([^"]+)"/);
    assert(catMatch !== null, `Grid card ${i + 1} has data-category attribute`);
    if (catMatch) {
        assert(validCategories.includes(catMatch[1]),
            `Grid card ${i + 1} has valid category "${catMatch[1]}"`);
    }
});

// Check each grid card has .card-play with ▶ Play
gridCards.forEach((card, i) => {
    assert(card.includes('card-play'),
        `Grid card ${i + 1} has .card-play`);
    assert(card.includes('▶ Play'),
        `Grid card ${i + 1} .card-play has "▶ Play" text`);
});

// ============================================================
// AC14: Page renders with all required sections (visual sanity)
// ============================================================
section('AC14: Required page sections present');

assert(indexHtml.includes('class="site-header"'), 'Has site header');
assert(indexHtml.includes('class="most-played-section"'), 'Has most-played carousel');
assert(indexHtml.includes('id="randomGameBtn"'), 'Has random game button');
assert(indexHtml.includes('class="games-section"'), 'Has games section');
assert(indexHtml.includes('class="games-grid"'), 'Has games grid');
assert(indexHtml.includes('class="site-footer"'), 'Has site footer');
assert(indexHtml.includes('class="what-new-section"'), 'Has what\'s new section');
assert(indexHtml.includes('class="what-new-list"'), 'Has what\'s new list');

// ============================================================
// Summary
// ============================================================
console.log('\n' + '='.repeat(55));
console.log('  RESULTS');
console.log('='.repeat(55));
console.log(`✅ PASSED: ${passed}`);
console.log(`❌ FAILED: ${failed}`);
if (failures.length > 0) {
    console.log('\nFailures:');
    failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    process.exit(1);
} else {
    console.log('\nAll landing-page fix tests passed! 🎉');
    process.exit(0);
}
