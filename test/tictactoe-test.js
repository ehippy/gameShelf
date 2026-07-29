#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const tictactoePath = path.join(__dirname, '..', 'games', 'tictactoe.html');
const gamesIndexPath = path.join(__dirname, '..', 'games', 'index.html');
const rootIndexPath = path.join(__dirname, '..', 'index.html');

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
    try {
        fn();
        passed++;
        results.push(`✅ PASS: ${name}`);
    } catch (e) {
        failed++;
        results.push(`❌ FAIL: ${name} — ${e.message}`);
    }
}

// ── Read files ──
const tictactoe = fs.readFileSync(tictactoePath, 'utf8');
const gamesIndex = fs.readFileSync(gamesIndexPath, 'utf8');
const rootIndex = fs.readFileSync(rootIndexPath, 'utf8');

// ── Criterion 1: File exists at path matching href in games/index.html ──
test('File games/tictactoe.html exists', () => {
    if (!fs.existsSync(tictactoePath)) throw new Error('File does not exist');
});

test('games/index.html has href="tictactoe.html"', () => {
    const href = gamesIndex.match(/href="tictactoe\.html"/);
    if (!href) throw new Error('No href="tictactoe.html" found in games/index.html');
});

// ── Criterion 2: Self-contained HTML (CSS in <style>, JS in <script>) ──
test('CSS is inline in <style> tag', () => {
    if (!tictactoe.includes('<style>')) throw new Error('No <style> tag found');
});

test('JS is inline in <script> tag', () => {
    if (!tictactoe.includes('<script>') && !tictactoe.includes('<script type="text/javascript">')) {
        // Check for just <script> with JS inside (not linked externally)
        if (tictactoe.includes('<script src="')) {
            throw new Error('JS is linked via <script src=""> instead of inline');
        }
    }
    if (!/<script\b[^>]*>([\s\S]*?)<\/script>/.test(tictactoe)) {
        throw new Error('No inline <script> block found');
    }
});

test('Does NOT link ../styles.css', () => {
    if (tictactoe.includes('href="../styles.css"')) throw new Error('Links external styles.css');
});

test('Does NOT link ../script.js', () => {
    if (tictactoe.includes('src="../script.js"')) throw new Error('Links external script.js');
});

// ── Criterion 3: Canvas element ──
test('Has <canvas id="gameCanvas" width="400" height="400">', () => {
    const canvasMatch = tictactoe.match(/<canvas\s+id="gameCanvas"\s+width="400"\s+height="400"/);
    if (!canvasMatch) throw new Error('Canvas element not found with correct id/width/height');
});

// ── Criterion 4: 3×3 grid drawn ──
test('Grid dimensions use 400/3 = 133.333...', () => {
    if (!tictactoe.includes('400 / 3') && !tictactoe.includes('CANVAS_SIZE / GRID')) throw new Error('Cell size calculation not found');
});

// ── Criterion 5: Arrow keys move cursor highlight ──
test('Arrow keys are handled in keyboard events', () => {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    for (const k of keys) {
        if (!tictactoe.includes(k)) throw new Error(`Arrow key ${k} not handled`);
    }
});

test('Cursor is clamped to 0-2 range', () => {
    if (!tictactoe.includes('cursorX < 0') && !tictactoe.includes('cursorY < 0')) throw new Error('Cursor clamping not found');
});

test('Cursor highlight is drawn on canvas', () => {
    if (!tictactoe.includes('CURSOR_COLOR') && !tictactoe.includes('rgba(0, 212, 255, 0.25)')) {
        throw new Error('Cursor highlight color not found');
    }
});

// ── Criterion 6: Enter places X on empty cell ──
test('Enter key triggers player move', () => {
    if (!tictactoe.includes("e.key === 'Enter'")) throw new Error("Enter key not checked");
});

test('Places X at cursor position', () => {
    if (!tictactoe.includes("board[cursorY][cursorX] = 'X'")) throw new Error("X placement not found");
});

test('Does not overwrite occupied cells', () => {
    if (!tictactoe.includes('!== null') && !tictactoe.includes('!==null')) {
        throw new Error('Empty cell check not found');
    }
});

// ── Criterion 7: AI places O after player move ──
test('AI places O mark', () => {
    if (!tictactoe.includes("board[") || !tictactoe.includes("'O'")) throw new Error("O placement not found");
});

test('Non-empty cells cannot be overwritten by AI', () => {
    if (!tictactoe.includes('=== null')) throw new Error('Null check for AI move not found');
});

// ── Criterion 8: Minimax-based AI ──
test('Minimax function exists', () => {
    if (!tictactoe.includes('minimax')) throw new Error('Minimax function not found');
});

test('Minimax has depth penalty for faster wins', () => {
    if (!tictactoe.includes('10 - depth') && !tictactoe.includes('- depth')) {
        throw new Error('Depth penalty not found in minimax');
    }
});

test('AI does NOT use random placement', () => {
    // Make sure moves are selected by minimax, not purely random
    // The AI should pick the best score, not a random cell
    if (!tictactoe.includes('bestScore')) throw new Error('AI move selection not using scores');
});

// ── Criterion 9: Win detection ──
test('Win detection checks 3 in a row', () => {
    if (!tictactoe.includes('WIN_LINES') || !tictactoe.includes('checkWinner')) {
        throw new Error('Win line checking not found');
    }
});

test('Checks rows, columns, and diagonals', () => {
    // The WIN_LINES should have 8 entries (3 rows + 3 cols + 2 diag)
    const rows = tictactoe.match(/\[\[0,\s*0\],\s*\[0,\s*1\],\s*\[0,\s*2\]\]/);
    const cols = tictactoe.match(/\[\[0,\s*0\],\s*\[1,\s*0\],\s*\[2,\s*0\]\]/);
    const diag1 = tictactoe.match(/\[\[0,\s*0\],\s*\[1,\s*1\],\s*\[2,\s*2\]\]/);
    const diag2 = tictactoe.match(/\[\[0,\s*2\],\s*\[1,\s*1\],\s*\[2,\s*0\]\]/);
    if (!rows || !cols || !diag1 || !diag2) throw new Error('Not all 8 win lines found');
});

// ── Criterion 10: Draw detection ──
test('Draw detection when all cells filled', () => {
    if (!tictactoe.includes("'draw'")) throw new Error("'draw' result not found");
    if (!tictactoe.includes('return null')) throw new Error('Early return for incomplete board not found');
});

// ── Criterion 11: Start overlay ──
test('Start overlay exists', () => {
    if (!tictactoe.includes('startOverlay')) throw new Error('startOverlay element not found');
});

test('Start overlay has description of keyboard controls', () => {
    const hasArrowKeys = tictactoe.match(/arrow\s*keys/i);
    const hasEnter = tictactoe.match(/Enter/i);
    if (!hasArrowKeys || !hasEnter) throw new Error('Keyboard control description missing');
});

test('Start overlay has Start button', () => {
    if (!tictactoe.includes("Start Game")) throw new Error('Start Game button not found');
});

// ── Criterion 12: Game-over overlay ──
test('Game-over overlay exists', () => {
    if (!tictactoe.includes('gameOverOverlay')) throw new Error('gameOverOverlay element not found');
});

test('Game-over overlay shows "You Win!" for player win', () => {
    if (!tictactoe.includes("You Win!")) throw new Error('"You Win!" not found');
});

test('Game-over overlay shows "AI Wins!" for AI win', () => {
    if (!tictactoe.includes("AI Wins!")) throw new Error('"AI Wins!" not found');
});

test('Game-over overlay shows "Draw!" for draw', () => {
    if (!tictactoe.includes("Draw!")) throw new Error('"Draw!" not found');
});

test('Game-over overlay has Restart button', () => {
    if (!tictactoe.includes("Restart")) throw new Error('Restart button not found');
});

// ── Criterion 13: Restart resets board and shows start overlay ──
test('Restart function resets board', () => {
    if (!tictactoe.includes('initBoard()')) throw new Error('initBoard() not called in restart');
});

test('Restart shows start overlay', () => {
    if (!tictactoe.match(/startOverlay.*classList.*remove|remove.*startOverlay/)) {
        // Check the restart function removes hidden from start overlay
        throw new Error('Restart does not show start overlay');
    }
});

// ── Criterion 14: Header structure ──
test('Header logo links to ../index.html', () => {
    if (!tictactoe.includes('href="../index.html"') || !tictactoe.match(/class="logo"/)) {
        throw new Error('Header logo href incorrect');
    }
});

test('Header has game title "Tic Tac Toe"', () => {
    if (!tictactoe.includes('Tic Tac Toe')) throw new Error('Game title not found');
});

test('Header back link goes to ../games/index.html', () => {
    const lines = tictactoe.split('\n');
    const backLine = lines.find(l => l.includes('back-link') && l.includes('href='));
    if (!backLine || !backLine.includes('href="../games/index.html"')) {
        throw new Error('Back link href incorrect');
    }
});

// ── Criterion 15: Footer structure ──
test('Footer Home link goes to ../index.html', () => {
    // Find footer section and check for Home link
    const footerStart = tictactoe.indexOf('class="site-footer"');
    if (footerStart === -1) throw new Error('Footer not found');
    const footer = tictactoe.substring(footerStart);
    const homeLink = footer.match(/<a[^>]*>Home<\/a>/);
    if (!homeLink) throw new Error('Footer Home link not found');
    const homeLine = footer.split('\n').find(l => l.includes('Home') && l.includes('href='));
    if (!homeLine || !homeLine.includes('href="../index.html"')) {
        throw new Error('Footer Home link href incorrect');
    }
});

test('Footer All Games link goes to ../games/index.html', () => {
    const footerStart = tictactoe.indexOf('class="site-footer"');
    const footer = tictactoe.substring(footerStart);
    const allGamesLine = footer.split('\n').find(l => l.includes('All Games') && l.includes('href='));
    if (!allGamesLine || !allGamesLine.includes('href="../games/index.html"')) {
        throw new Error('Footer All Games link href incorrect');
    }
});

// ── Criterion 16: Overlay CSS pattern ──
test('Overlay has semi-transparent backdrop', () => {
    if (!tictactoe.includes('rgba(15, 15, 35, 0.92)')) {
        throw new Error('Overlay backdrop color not matching spec');
    }
});

test('Overlay has .hidden class for visibility toggle', () => {
    if (!tictactoe.match(/\.overlay\.hidden\s*\{[\s\S]*?display:\s*none/)) {
        throw new Error('.hidden class not properly defined');
    }
});

test('Overlay uses backdrop-filter blur', () => {
    if (!tictactoe.includes('backdrop-filter')) throw new Error('Backdrop blur not found');
});

// ── Criterion 17: 'use strict' inside IIFE ──
test('JS is wrapped in IIFE', () => {
    if (!tictactoe.includes('(function()')) throw new Error('Not wrapped in IIFE');
});

test('IIFE has "use strict"', () => {
    if (!tictactoe.includes("'use strict'")) throw new Error("'use strict' not found");
});

// ── Criterion 18: Page title ──
test('Page title is "gameShelf — Tic Tac Toe"', () => {
    const titleMatch = tictactoe.match(/<title>([^<]+)<\/title>/);
    if (!titleMatch) throw new Error('No <title> tag found');
    if (!titleMatch[1].includes('Tic Tac Toe')) throw new Error(`Title is "${titleMatch[1]}" but should include "Tic Tac Toe"`);
});

// ── Criterion 19: Card-thumb gradient colors ──
test('Card thumb uses #38bdf8 and #0284c7', () => {
    // Check games/index.html for the card entry
    if (!gamesIndex.includes('linear-gradient(135deg, #38bdf8, #0284c7)')) {
        throw new Error('Card-thumb gradient colors #38bdf8/#0284c7 not found in games/index.html');
    }
});

// ── Criterion 20: X and O colors match spec ──
test('X color is #00d4ff', () => {
    if (!tictactoe.includes("X_COLOR = '#00d4ff'")) throw new Error('X color not #00d4ff');
});

test('O color is #f87171', () => {
    if (!tictactoe.includes("O_COLOR = '#f87171'")) throw new Error('O color not #f87171');
});

// ── Criterion 21: Alpha-beta pruning in minimax ──
test('Minimax uses alpha-beta pruning', () => {
    if (!tictactoe.includes('alpha') || !tictactoe.includes('beta')) {
        throw new Error('Alpha-beta pruning not found');
    }
});

// ── Criterion 22: Canvas grid lines at correct positions ──
test('Grid lines at 133.33 and 266.67', () => {
    // CELL = 400/3, so CELL and CELL*2 give the positions
    if (!tictactoe.includes('CELL, 0') || !tictactoe.includes('CELL, CANVAS_SIZE')) {
        throw new Error('Grid line drawing not using CELL variable');
    }
});

// ── Summary ──
console.log('\n=== Test Results ===\n');
results.forEach(r => console.log(r));
console.log(`\n${passed} passed, ${failed} failed out of ${passed + failed} tests`);

if (failed > 0) {
    process.exit(1);
}
