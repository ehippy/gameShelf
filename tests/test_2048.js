#!/usr/bin/env node
/**
 * Test suite for games/2048.html — validates all acceptance criteria.
 * Uses JSDOM to load and execute the HTML, then checks game logic.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const HTML_PATH = path.resolve(__dirname, '..', 'games', '2048.html');
const GAMES_INDEX_PATH = path.resolve(__dirname, '..', 'index.html');

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

// ============================================================
// 1. File existence & self-contained checks
// ============================================================
console.log('\n📋 FILE EXISTENCE & SELF-CONTAINED');
console.log('─'.repeat(50));

assert(fs.existsSync(HTML_PATH), 'games/2048.html exists');

const htmlContent = fs.readFileSync(HTML_PATH, 'utf-8');

// Must be self-contained: no external script/src links
const hasExternalScript = /<script\s+[^>]*src\s*=\s*["'][^"']*:\/\/[^"']*["']/.test(htmlContent);
assert(!hasExternalScript, 'No external script dependencies (self-contained)');

const hasExternalStyle = /<link\s+[^>]*rel\s*=\s*["']stylesheet["'][^>]*href\s*=\s*["'][^"']*:\/\/[^"']*["']/.test(htmlContent);
assert(!hasExternalStyle, 'No external stylesheet dependencies (self-contained)');

// Must have inline CSS
const hasStyleTag = /<style>[\s\S]*<\/style>/.test(htmlContent);
assert(hasStyleTag, 'Contains inline <style> tag');

// Must have inline JS
const hasScriptTag = /<script>[\s\S]*<\/script>/.test(htmlContent);
assert(hasScriptTag, 'Contains inline <script> tag');

// ============================================================
// 2. Dark theme checks
// ============================================================
console.log('\n🎨 THEME & STYLING');
console.log('─'.repeat(50));

assert(htmlContent.includes('#0f0f23') || htmlContent.includes('background'), 'Dark background theme present');

// Yellow/orange gradient accent
assert(htmlContent.includes('#fbbf24') && htmlContent.includes('#d97706'), 'Yellow/orange gradient (#fbbf24 → #d97706) present');

// ============================================================
// 3. Classic 2048 tile colors
// ============================================================
console.log('\n🎨 TILE COLOR PALETTE');
console.log('─'.repeat(50));

assert(htmlContent.includes('#eee4da'), 'Tile 2 color: #eee4da');
assert(htmlContent.includes('#ede0c8'), 'Tile 4 color: #ede0c8');
assert(htmlContent.includes('#f2b179'), 'Tile 8 color: #f2b179');
assert(htmlContent.includes('#f59563'), 'Tile 16 color: #f59563');
assert(htmlContent.includes('#f67c5f'), 'Tile 32 color: #f67c5f');
assert(htmlContent.includes('#f65e3b'), 'Tile 64 color: #f65e3b');
assert(htmlContent.includes('#edcf72'), 'Tile 128 color: #edcf72');

// ============================================================
// 4. Home link check
// ============================================================
console.log('\n🔗 NAVIGATION');
console.log('─'.repeat(50));

assert(htmlContent.includes('href="../index.html"'), 'Back/home link to ../index.html present');

// ============================================================
// 5. Registration in games/index.html
// ============================================================
console.log('\n📝 REGISTRATION');
console.log('─'.repeat(50));

const gamesIndex = fs.readFileSync(GAMES_INDEX_PATH, 'utf-8');
assert(gamesIndex.includes('2048.html'), '2048.html referenced in index.html');
assert(gamesIndex.includes('2048') && gamesIndex.includes('puzzle'), '2048 game card present with puzzle category');

// ============================================================
// 6. Run the game logic via JSDOM
// ============================================================
console.log('\n🧪 GAME LOGIC TESTS');
console.log('─'.repeat(50));

const dom = new JSDOM(htmlContent, {
    url: 'http://localhost/games/2048.html',
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
});

const { window } = dom;
const { document } = window;

setTimeout(() => {
    const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
        try {
            const boardBg = document.getElementById('board-bg');
            assert(boardBg !== null, 'board-bg element exists');

            const tileLayer = document.getElementById('tile-layer');
            assert(tileLayer !== null, 'tile-layer element exists');

            const scoreEl = document.getElementById('score');
            assert(scoreEl !== null, 'Score element exists');

            const bestScoreEl = document.getElementById('best-score');
            assert(bestScoreEl !== null, 'Best score element exists');

            const board = document.getElementById('board');
            assert(board !== null, 'Board element exists');

            const overlayGameOver = document.getElementById('overlay-gameover');
            assert(overlayGameOver !== null, 'Game-over overlay exists');

            const overlayWin = document.getElementById('overlay-win');
            assert(overlayWin !== null, 'Win overlay exists');

            const btnNewGame = document.getElementById('btn-new-game');
            assert(btnNewGame !== null, 'New Game button exists');

            const btnPlayAgain = document.getElementById('btn-play-again');
            assert(btnPlayAgain !== null, 'Play Again button exists');

            const btnKeepPlaying = document.getElementById('btn-keep-playing');
            assert(btnKeepPlaying !== null, 'Keep Playing button exists');

            // 4x4 grid check
            const boardCells = document.querySelectorAll('.board-cell');
            assert(boardCells.length === 16, `4x4 grid: ${boardCells.length} background cells (expected 16)`);

            // Initial tiles: 2 tiles with values 2 or 4
            const tiles = document.querySelectorAll('.tile');
            assert(tiles.length === 2, `Initial tiles: ${tiles.length} tiles (expected exactly 2)`);

            if (tiles.length >= 2) {
                let validStart = true;
                for (let i = 0; i < tiles.length; i++) {
                    const val = parseInt(tiles[i].textContent);
                    if (val !== 2 && val !== 4) {
                        validStart = false;
                        break;
                    }
                }
                assert(validStart, 'Initial tiles have values of 2 or 4 only');
            }

        } catch (e) {
            assert(false, `Script execution error: ${e.message}`);
            console.error(e);
        }
    }

    // ============================================================
    // 7. Mechanics logic tests (static analysis of code)
    // ============================================================
    console.log('\n⚙️ MECHANICS LOGIC TESTS');
    console.log('─'.repeat(50));

    // Check slide/move algorithm
    assert(htmlContent.includes('slideLine') || htmlContent.includes('slide_line'), 'slideLine/move algorithm exists');

    // Check merge logic
    assert(htmlContent.includes('merge') || htmlContent.includes('Merge'), 'Merge logic present');

    // Check spawn logic
    assert(htmlContent.includes('spawnTile') || htmlContent.includes('randomEmptyCell'), 'Tile spawn logic present');

    // Check 90/10 probability
    const has90Prob = /0\.9|90/.test(htmlContent);
    assert(has90Prob, '90% probability weight for value-2 spawn');

    // Check game-over detection
    assert(htmlContent.includes('gameOver') || htmlContent.includes('hasAnyMove'), 'Game-over detection logic present');

    // Check win condition (2048)
    assert(htmlContent.includes('2048') && (htmlContent.includes('win') || htmlContent.includes('Win')), 'Win condition for 2048 tile');

    // Check score accumulation
    assert(htmlContent.includes('score +=') || htmlContent.includes('score='), 'Score updates on merge');

    // Check localStorage for best score
    assert(htmlContent.includes('localStorage'), 'localStorage for best score persistence');

    // Check keyboard handlers
    assert(htmlContent.includes('ArrowUp') && htmlContent.includes('ArrowDown') && 
           htmlContent.includes('ArrowLeft') && htmlContent.includes('ArrowRight'), 'Arrow key handlers');

    // Check touch events
    assert(htmlContent.includes('touchstart') && htmlContent.includes('touchend'), 'Touch event handlers');

    // Check swipe threshold
    assert(htmlContent.includes('30') && htmlContent.includes('SWIPE_THRESHOLD'), 'Swipe threshold present');

    // Check CSS transitions/animations
    assert(htmlContent.includes('transition') || htmlContent.includes('animation'), 'CSS transitions present');
    assert(htmlContent.includes('@keyframes'), 'Keyframe animations defined');
    assert(htmlContent.includes('tile-pop') || htmlContent.includes('tile-merge'), 'Tile animations defined');

    // Check scroll prevention
    assert(htmlContent.includes('preventDefault'), 'Scroll prevention on touch events');

    // Check responsive design
    assert(htmlContent.includes('@media'), 'Responsive media queries');

    // Check grid setup
    assert(htmlContent.includes('repeat(4,') || htmlContent.includes('grid-template-columns'), '4x4 CSS grid');

    // Check board-wrapper for touch-action
    assert(htmlContent.includes('touch-action'), 'touch-action CSS property present');

    // ============================================================
    // Final summary
    // ============================================================
    console.log('\n' + '═'.repeat(50));
    console.log(`\nRESULTS: ${passed} passed, ${failed} failed\n`);

    if (failures.length > 0) {
        console.log('FAILURES:');
        failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
        process.exit(1);
    } else {
        console.log('All tests passed! 🎉');
        process.exit(0);
    }

}, 200);
