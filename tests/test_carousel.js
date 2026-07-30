#!/usr/bin/env node
/**
 * Test suite for the 'Most Played' carousel feature on the home page.
 * Validates all acceptance criteria for the carousel replacement of the featured section.
 */

const fs = require('fs');
const path = require('path');

const HTML_PATH = path.resolve(__dirname, '..', 'index.html');
const CSS_PATH = path.resolve(__dirname, '..', 'styles.css');
const JS_PATH = path.resolve(__dirname, '..', 'script.js');
const GAMES_DIR = path.resolve(__dirname, '..', 'games');

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

// ============================================================
// Load files
// ============================================================
const html = fs.readFileSync(HTML_PATH, 'utf-8');
const css = fs.readFileSync(CSS_PATH, 'utf-8');
const js = fs.readFileSync(JS_PATH, 'utf-8');

// ============================================================
// 1. Replacement of featured section with most-played section
// ============================================================
section('1. Featured Section Replacement');

assert(!html.includes('featured-section'), 'Old featured-section HTML is removed');
assert(!html.includes('featured-inner'), 'Old featured-inner HTML is removed');
assert(html.includes('class="most-played-section"'), 'New most-played-section exists in HTML');
assert(html.includes('<section class="most-played-section">'), 'most-played-section uses <section> element');

// Verify section ordering: header < most-played < random-btn < games-section
const headerIdx = html.indexOf('<header');
const mpIdx = html.indexOf('class="most-played-section"');
const rbIdx = html.indexOf('id="randomGameBtn"');
const gsIdx = html.indexOf('class="games-section"');
assert(headerIdx !== -1 && mpIdx !== -1 && rbIdx !== -1 && gsIdx !== -1,
    'All sections (header, most-played, random, games) are present');
assert(headerIdx < mpIdx, 'most-played-section is after header');
assert(mpIdx < rbIdx, 'most-played-section is before random game button');
assert(rbIdx < gsIdx, 'random game button is before games-section');

// ============================================================
// 2. Carousel structure — section-header, track, slides, dots
// ============================================================
section('2. Carousel HTML Structure');

assert(html.includes('<h2>Most Played'), 'Most Played heading <h2> exists');
assert(html.includes('class="shuffle-indicator"'), 'shuffle-indicator class present');
assert(html.includes('aria-label="Carousel auto-advances"'), 'shuffle-indicator has proper aria-label');
assert(html.includes('↻'), 'Pulsing ↻ icon present in shuffle-indicator');
assert(html.includes('class="carousel-wrapper"'), 'carousel-wrapper div exists');
assert(html.includes('class="carousel-track"'), 'carousel-track div exists');
assert(html.includes('class="carousel-slide"'), 'carousel-slide div(s) exist');
assert(html.includes('class="carousel-dots"'), 'carousel-dots div exists');

// Verify exactly 4 slide groups
const slideCount = (html.match(/class="carousel-slide"/g) || []).length;
assert(slideCount === 4, `Exactly 4 carousel-slide groups (found ${slideCount})`);

// Verify exactly 4 dot buttons
const dotCount = (html.match(/carousel-dot/g) || []).length;
assert(dotCount === 5, `Carousel-dot references found (includes class on active dot): ${dotCount}`);
const dotButtons = html.match(/<button[^>]*carousel-dot[^>]*>/g);
assert(dotButtons && dotButtons.length === 4, 'All 4 dot elements are <button> elements');
assert(html.includes('data-index="0"'), 'Dot 1 has data-index="0"');
assert(html.includes('data-index="1"'), 'Dot 2 has data-index="1"');
assert(html.includes('data-index="2"'), 'Dot 3 has data-index="2"');
assert(html.includes('data-index="3"'), 'Dot 4 has data-index="3"');

// Verify dot aria-labels for screen readers
assert(html.includes('aria-label="Show slide 1"'), 'Dot 1 has aria-label "Show slide 1"');
assert(html.includes('aria-label="Show slide 2"'), 'Dot 2 has aria-label "Show slide 2"');
assert(html.includes('aria-label="Show slide 3"'), 'Dot 3 has aria-label "Show slide 3"');
assert(html.includes('aria-label="Show slide 4"'), 'Dot 4 has aria-label "Show slide 4"');

// Verify first dot starts as active
assert(html.includes('class="carousel-dot active"') || html.includes('class="active carousel-dot"'),
    'First dot has active class by default');

// ============================================================
// 3. Carousel groups match the spec
// ============================================================
section('3. Curated Game Groups');

// Parse slides using the slide comment markers
const slideGroups = html.split('<!-- Slide ');
const expectedGroups = [
    ['games/snake.html', 'games/tetris.html', 'games/2048.html', 'games/breakout.html', 'games/pacman.html'],
    ['games/pacman.html', 'games/minesweeper.html', 'games/tictactoe.html', 'games/memorymatch.html', 'games/simon-says.html'],
    ['games/whackamole.html', 'games/snake.html', 'games/tetris.html', 'games/breakout.html', 'games/2048.html'],
    ['games/2048.html', 'games/pacman.html', 'games/memorymatch.html', 'games/minesweeper.html', 'games/simon-says.html']
];

for (let i = 1; i <= 4; i++) {
    const group = slideGroups[i];
    if (!group) {
        assert(false, `Slide ${i} content found`);
        continue;
    }
    const endIdx = group.indexOf('<div class="carousel-dots">');
    const slideContent = endIdx > -1 ? group.substring(0, endIdx) : group;
    const links = (slideContent.match(/href="([^"]+)"/g) || [])
        .map(s => s.replace(/href="/, '').replace(/"/g, ''));

    const expected = expectedGroups[i - 1];
    const match = JSON.stringify(links) === JSON.stringify(expected);
    assert(match, `Group ${i} matches spec: ${expected.join(', ')}`);
}

// Verify 5 cards per slide
for (let i = 1; i <= 4; i++) {
    const group = slideGroups[i];
    const endIdx = group.indexOf('<div class="carousel-dots">');
    const slideContent = endIdx > -1 ? group.substring(0, endIdx) : group;
    const cardCount = (slideContent.match(/class="game-card"/g) || []).length;
    assert(cardCount === 5, `Slide ${i} has exactly 5 game cards (found ${cardCount})`);
}

// Verify all carousel cards are <a> elements (clickable links)
const allCards = slideGroups.slice(1, 5).map(g => {
    const endIdx = g.indexOf('<div class="carousel-dots">');
    const sc = endIdx > -1 ? g.substring(0, endIdx) : g;
    return (sc.match(/<a href="([^"]+)"[^>]*class="game-card"/g) || []);
}).flat();
assert(allCards.length === 20, 'All 20 carousel cards are <a> elements');

// Verify each carousel card links to an existing game file
const availableGames = fs.readdirSync(GAMES_DIR).filter(f => f.endsWith('.html'));
const allCarouselHrefs = allCards.map(c => {
    const m = c.match(/href="([^"]+)"/);
    return m ? m[1] : '';
});
allCarouselHrefs.forEach(href => {
    const baseName = href.replace('games/', '').replace('.html', '');
    const exists = availableGames.some(g => g.replace('.html', '') === baseName);
    assert(exists, `Carousel href ${href} maps to existing game file`);
});

// Verify carousel cards do NOT have .card-play
for (let i = 1; i <= 4; i++) {
    const group = slideGroups[i];
    const endIdx = group.indexOf('<div class="carousel-dots">');
    const slideContent = endIdx > -1 ? group.substring(0, endIdx) : group;
    const cardPlayCount = (slideContent.match(/card-play/g) || []).length;
    assert(cardPlayCount === 0, `Slide ${i} has no .card-play elements on carousel cards`);
}

// ============================================================
// 4. Carousel card structure: thumb with gradient, emoji, info, tag
// ============================================================
section('4. Carousel Card Visual Structure');

// Each card should have: .card-thumb with gradient, .thumb-icon with emoji,
// .card-info with h3, .card-desc, and .card-tag
const allCardBlocks = [];
for (let i = 1; i <= 4; i++) {
    const group = slideGroups[i];
    const endIdx = group.indexOf('<div class="carousel-dots">');
    const slideContent = endIdx > -1 ? group.substring(0, endIdx) : group;
    const cardElements = slideContent.match(/<a href="[^"]+?"[^>]*class="game-card"[^>]*>[\s\S]*?<\/a>/g) || [];
    cardElements.forEach(el => allCardBlocks.push(el));
}

allCardBlocks.forEach((card, idx) => {
    assert(card.includes('card-thumb'), `Card ${idx + 1} has .card-thumb`);
    assert(card.includes('card-info'), `Card ${idx + 1} has .card-info`);
    assert(card.includes('<h3>'), `Card ${idx + 1} has <h3> game name`);
    assert(card.includes('card-desc'), `Card ${idx + 1} has .card-desc`);
    assert(card.includes('card-tag'), `Card ${idx + 1} has .card-tag`);
    assert(card.includes('thumb-icon'), `Card ${idx + 1} has .thumb-icon`);
    assert(/linear-gradient/.test(card), `Card ${idx + 1} has gradient background on thumb`);
});

// Verify categories are valid
const validCategories = ['action', 'puzzle', 'arcade', 'strategy', 'board', 'casual'];
allCardBlocks.forEach((card, idx) => {
    const tagMatch = card.match(/card-tag ([a-z]+)/);
    if (tagMatch) {
        assert(validCategories.includes(tagMatch[1]),
            `Card ${idx + 1} has valid category "${tagMatch[1]}"`);
    }
});

// ============================================================
// 5. CSS rules for carousel
// ============================================================
section('5. Carousel CSS Rules');

assert(css.includes('.most-played-section'), 'CSS has .most-played-section rule');
assert(css.includes('background: var(--bg-secondary)'),
    '.most-played-section uses var(--bg-secondary) background');
assert(css.includes('.most-played-section .section-header'), 'CSS has section-header rule');
assert(css.includes('.shuffle-indicator'), 'CSS has .shuffle-indicator rule');
assert(css.includes('.carousel-wrapper'), 'CSS has .carousel-wrapper rule');
assert(css.includes('.carousel-track'), 'CSS has .carousel-track rule');
assert(css.includes('transition: transform 0.5s ease'), 'CSS has transform transition on track');
assert(css.includes('.carousel-slide'), 'CSS has .carousel-slide rule');
assert(css.includes('.carousel-dots'), 'CSS has .carousel-dots rule');
assert(css.includes('.carousel-dot'), 'CSS has .carousel-dot rule');
assert(css.includes('.carousel-dot.active'), 'CSS has .carousel-dot.active rule');

// Verify keyframes
assert(css.includes('@keyframes pulse-shuffle'), 'CSS has @keyframes pulse-shuffle');
assert(css.includes('transform: scale(1)'), 'pulse-shuffle has scale(1) keyframe');
assert(css.includes('transform: scale(1.3)'), 'pulse-shuffle has scale(1.3) keyframe');

// Verify dot styling
assert(css.includes('width: 12px'), 'Carousel dots have width 12px');
assert(css.includes('height: 12px'), 'Carousel dots have height 12px');
assert(css.includes('border-radius: 50%'), 'Carousel dots are circular');
assert(css.includes('background: var(--text-muted)'), 'Dots use var(--text-muted) base color');
assert(css.includes('opacity: 0.5'), 'Dots have opacity 0.5 default');
assert(css.includes('transform: scale(1.3)'), 'Active dot has transform: scale(1.3)');
assert(css.includes('background: var(--accent)'), 'Active dot uses var(--accent)');
assert(css.includes('opacity: 1'), 'Active dot has opacity 1');

// Verify responsive breakpoint at 768px
// Use a more robust match: first find the @media line, then find its opening {, then track braces
const resp768Start = css.indexOf('@media (max-width: 768px)');
assert(resp768Start !== -1, 'CSS has @media max-width: 768px breakpoint');
if (resp768Start !== -1) {
    // Find the opening brace of this media query
    let openBrace = -1;
    for (let i = resp768Start; i < css.length; i++) {
        if (css[i] === '{') { openBrace = i; break; }
    }
    assert(openBrace !== -1, 'Opening brace found for 768px @media block');
    if (openBrace !== -1) {
        // Track brace depth starting from 1 (we're inside one block)
        let braceCount = 1;
        let resp768End = -1;
        for (let i = openBrace + 1; i < css.length; i++) {
            if (css[i] === '{') braceCount++;
            if (css[i] === '}') braceCount--;
            if (braceCount === 0) {
                resp768End = i + 1;
                break;
            }
        }
        assert(resp768End !== -1, 'Closing brace found for 768px @media block');
        if (resp768End !== -1) {
            const resp768 = css.substring(resp768Start, resp768End);
            assert(resp768.includes('carousel-slide') || resp768.includes('carousel-dot') || resp768.includes('carousel-wrapper'),
                '768px breakpoint targets carousel elements');
            assert(resp768.includes('50%') || resp768.includes('calc(50%'),
                '768px breakpoint shows 2 cards (50% width each)');
            assert(resp768.includes('most-played-section'),
                '768px breakpoint includes most-played-section padding adjustment');
        }
    }
}

// ============================================================
// 6. JavaScript: carousel initialization, auto-advance, navigation
// ============================================================
section('6. Carousel JavaScript');

assert(js.includes('carousel-track'), 'JS references carousel-track');
assert(js.includes('carousel-slide'), 'JS references carousel-slide elements');
assert(js.includes('carousel-dot') || js.includes('carouselDots'), 'JS references carousel dots');
assert(js.includes('shuffleIndicator') || js.includes('shuffle-indicator'), 'JS references shuffle indicator');

// Verify showSlide function
assert(js.includes('function showSlide'), 'JS has showSlide function');
assert(js.includes('translateX'), 'showSlide uses translateX transform');
assert(js.includes('carouselDots'), 'showSlide references dot elements');
assert(js.includes('classList.remove'), 'showSlide removes active class');
assert(js.includes('classList.add'), 'showSlide adds active class');

// Verify nextSlide function
assert(js.includes('function nextSlide'), 'JS has nextSlide function');
assert(js.includes('% totalSlides'), 'nextSlide uses modulo for cycling');

// Verify auto-advance with setInterval at 6000ms
assert(js.includes('setInterval'), 'JS uses setInterval for auto-advance');
assert(js.includes('6000'), 'Auto-advance interval is 6000ms (6 seconds)');

// Verify dot click navigation
assert(js.includes('addEventListener'), 'JS has event listeners for dots');
assert(js.includes('dotIndex') || js.includes('dot index'), 'Dot navigation uses dot index');
assert(js.includes('stopAutoAdvance') || js.includes('clearInterval'), 'Dot click stops auto-advance');
assert(js.includes('startAutoAdvance'), 'Dot click restarts auto-advance');

// Verify prefers-reduced-motion
assert(js.includes('prefers-reduced-motion'), 'JS checks for prefers-reduced-motion');
assert(js.includes('window.matchMedia'), 'JS uses matchMedia for reduced motion check');
assert(js.includes('(prefers-reduced-motion: reduce)'),
    'JS checks for (prefers-reduced-motion: reduce) media query');
assert(js.includes('startAutoAdvance') || js.includes('setInterval(nextSlide'),
    'JS starts auto-advance when reduced-motion is NOT preferred');

// Verify hover pause
assert(js.includes('mouseenter') || js.includes('mouseleave'),
    'JS has hover pause/resume on carousel wrapper');

// ============================================================
// 7. Footer verification
// ============================================================
section('7. Footer');

assert(html.includes('class="site-footer"'), 'Footer uses site-footer class');
assert(html.includes('© 2025 gameShelf — All games built in browser — no downloads required'),
    'Footer has exact required copyright text');

// ============================================================
// 8. Existing functionality not broken
// ============================================================
section('8. Existing Functionality Preserved');

// Filter buttons
assert(html.includes('data-filter="all"'), 'Filter "All" button present');
assert(html.includes('data-filter="action"'), 'Filter "Action" button present');
assert(html.includes('data-filter="puzzle"'), 'Filter "Puzzle" button present');
assert(html.includes('data-filter="arcade"'), 'Filter "Arcade" button present');
assert(html.includes('data-filter="strategy"'), 'Filter "Strategy" button present');
assert(html.includes('data-filter="board"'), 'Filter "Board" button present');
assert(html.includes('data-filter="casual"'), 'Filter "Casual" button present');

// Search input
assert(html.includes('class="search-input"'), 'Search input present');
assert(html.includes('placeholder="Search games..."'), 'Search input has placeholder');

// Random game button
assert(html.includes('id="randomGameBtn"'), 'Random game button exists');

// Games grid
assert(html.includes('class="games-grid"'), 'Games grid exists');
assert(html.includes('id="games-grid"'), 'Games grid has games-grid id');

// Grid cards still have .card-play (only carousel cards omit it)
const gridCards = html.match(/<div class="card-play">▶ Play<\/div>/g);
assert(gridCards && gridCards.length === 10,
    'All 10 grid cards have .card-play elements (carousel cards should not)');

// Existing JS functions still present
assert(js.includes('filterButtons'), 'JS still has filterButtons logic');
assert(js.includes('searchInput'), 'JS still has searchInput logic');
assert(js.includes('randomBtn'), 'JS still has randomBtn logic');
assert(js.includes('gamesCatalog'), 'JS still has gamesCatalog');

// All 10 games still in the grid
const gridGameCount = (html.match(/class="game-card"[^>]*data-category/g) || []).length;
assert(gridGameCount >= 10, `Grid still has 10+ game cards (found ${gridGameCount})`);

// ============================================================
// 9. No merge conflicts
// ============================================================
section('9. Clean State');

assert(!html.includes('<<<<<<<'), 'No merge conflict markers in index.html');
assert(!html.includes('======='), 'No merge conflict markers in index.html');
assert(!html.includes('>>>>>>>' ), 'No merge conflict markers in index.html');

// ============================================================
// Summary
// ============================================================
console.log('\n' + '='.repeat(50));
if (failed > 0) {
    console.log('❌ FAILED');
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log('\nFailures:');
    failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    process.exit(1);
} else {
    console.log('✅ All tests passed!');
    console.log(`Results: ${passed} passed, ${failed} failed`);
}
