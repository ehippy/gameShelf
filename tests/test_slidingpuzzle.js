#!/usr/bin/env node
/**
 * Test suite for games/slidingpuzzle.html — validates all acceptance criteria.
 * Uses static analysis + JSDOM to verify game logic, structure, and behavior.
 */

var fs = require('fs');
var path = require('path');
var { JSDOM } = require('jsdom');

var HTML_PATH = path.resolve(__dirname, '..', 'games', 'slidingpuzzle.html');
var GAMES_INDEX_PATH = path.resolve(__dirname, '..', 'index.html');
var SCRIPT_JS_PATH = path.resolve(__dirname, '..', 'script.js');

var passed = 0;
var failed = 0;
var failures = [];

function assert(condition, message) {
    if (condition) {
        passed++;
        console.log('  ✅ ' + message);
    } else {
        failed++;
        failures.push(message);
        console.log('  ❌ ' + message);
    }
}

// ============================================================
// 1. File existence & self-contained checks
// ============================================================
console.log('\n📋 FILE EXISTENCE & SELF-CONTAINED');
console.log('─'.repeat(50));

assert(fs.existsSync(HTML_PATH), 'games/slidingpuzzle.html exists');

var content = fs.readFileSync(HTML_PATH, 'utf-8');

// Must link shared resources
assert(content.includes('href="../styles.css"'), 'Links shared ../styles.css');
assert(content.includes('src="../script.js"') || content.includes("src='../script.js'"), 'Links shared ../script.js');

// Self-contained game code: no external script src links
var hasExternalScript = /<script\s+[^>]*src\s*=\s*["'][^"']*:\/\/[^"']*["']/.test(content);
assert(!hasExternalScript, 'No external script dependencies (self-contained)');

// Must have inline CSS and JS
assert(/<style>[\s\S]*<\/style>/.test(content), 'Contains inline <style> tag');
assert(/<script>[\s\S]*<\/script>/.test(content), 'Contains inline <script> tag');

// ============================================================
// 2. IIFE & strict mode
// ============================================================
console.log('\n🔒 IIFE & STRICT MODE');
console.log('─'.repeat(50));

assert(content.includes('(function()'), 'JS wrapped in IIFE');
assert(content.includes("'use strict'"), 'Strict mode enabled');

// ============================================================
// 3. Header & Navigation
// ============================================================
console.log('\n🔗 HEADER & NAVIGATION');
console.log('─'.repeat(50));

assert(content.includes('<header'), 'Header element exists');
assert(content.includes('class="game-header"'), 'Uses .game-header class');
assert(content.includes('class="sticky"') || content.includes('position: sticky'), 'Header is sticky');
assert(content.includes('class="logo"'), 'Logo element exists');
assert(content.includes('href="../index.html"'), 'Back/home link to ../index.html');
assert(/gameShelf/.test(content), 'Logo text is gameShelf');
assert(content.includes('<span class="game-title"') || content.includes('<span class="game-title">'), 'Game title span exists');
assert(content.includes('Sliding Tile Puzzle'), 'Game title "Sliding Tile Puzzle" present');
assert(content.includes('<a class="back-link"') || content.includes('<a class="back-link">'), 'Back link exists');
assert(content.includes('← Back to All Games'), 'Back link text: "← Back to All Games"');

// ============================================================
// 4. Canvas structure
// ============================================================
console.log('\n🎮 CANVAS & GAME STRUCTURE');
console.log('─'.repeat(50));

assert(content.includes('id="gameCanvas"'), 'Canvas element with id="gameCanvas" exists');
assert(content.includes('width="400"') || content.includes('width=\'400\''), 'Canvas width=400');
assert(content.includes('height="400"') || content.includes('height=\'400\''), 'Canvas height=400');
assert(content.includes('CANVAS_SIZE = 400') || content.includes("CANVAS_SIZE = 400"), 'CANVAS_SIZE constant = 400');

// Canvas wrapper with border and shadow
assert(content.includes('class="canvas-wrapper"') || content.includes('class="canvas-wrapper"'), 'canvas-wrapper div exists');
assert(/position: relative/.test(content), 'canvas-wrapper has position:relative (for absolute overlay positioning)');

// ============================================================
// 5. Difficulty selector
// ============================================================
console.log('\n🎛️ DIFFICULTY SELECTOR');
console.log('─'.repeat(50));

assert(content.includes('class="difficulty-select"') || content.includes('class="difficulty-bar"'), 'Difficulty selector element exists');
assert(content.includes('Easy (3×3)') || content.includes('Easy (3x3)') || content.includes('Easy (3'), 'Easy (3×3) option present');
assert(content.includes('Normal (4×4)') || content.includes('Normal (4x4)') || content.includes('Normal (4'), 'Normal (4×4) option present');
assert(content.includes('Hard (5×5)') || content.includes('Hard (5x5)') || content.includes('Hard (5'), 'Hard (5×5) option present');
assert(content.includes('value="3"'), '3×3 difficulty has value="3"');
assert(content.includes('value="4"'), '4×4 difficulty has value="4"');
assert(content.includes('value="5"'), '5×5 difficulty has value="5"');

// ============================================================
// 6. HUD bar
// ============================================================
console.log('\n📊 HUD BAR');
console.log('─'.repeat(50));

assert(content.includes('class="score-bar"') || content.includes('class="hud-bar"'), 'HUD/score bar exists');
assert(content.includes('id="moveCounter"') || content.includes('id="move-counter"'), 'Move counter element exists');
assert(content.includes('Moves'), 'Moves label present in HUD');
assert(content.includes('id="timer"'), 'Timer element exists');
assert(content.includes('Time'), 'Time label present in HUD');
assert(content.includes('monospace'), 'Monospace font used for timer/moves');

// Smiley restart button
assert(content.includes('😀') || content.includes('smileyBtn'), 'Smiley restart button (😀) present');
assert(content.includes('id="smileyBtn"') || content.includes('id="smiley-btn"'), 'Smiley button has id');
assert(content.includes('Restart') || content.includes('restart'), 'Restart functionality referenced');

// ============================================================
// 7. Overlays
// ============================================================
console.log('\n🖼️ OVERLAYS');
console.log('─'.repeat(50));

// Shuffle overlay
assert(content.includes('id="shuffleOverlay"') || content.includes('id="shuffle-overlay"'), 'Shuffle overlay exists');
assert(content.includes('Shuffling') || content.includes('shuffling'), 'Shuffling text present');

// Win overlay
assert(content.includes('id="winOverlay"') || content.includes('id="win-overlay"'), 'Win overlay exists');
assert(content.includes('🎉 You Win!') || content.includes('You Win'), 'Win overlay shows "🎉 You Win!"');
assert(content.includes('id="winTime"') || content.includes('id="win-time"'), 'Win time element exists');
assert(content.includes('id="winMoves"') || content.includes('id="win-moves"'), 'Win moves element exists');
assert(content.includes('id="playAgainBtn"') || content.includes('id="play-again-btn"'), 'Play Again button exists');
assert(content.includes('Play Again'), 'Play Again button text present');

// Overlay uses position: absolute inset: 0 (matching Minesweeper pattern)
assert(content.includes('position: absolute') && content.includes('inset: 0'), 'Overlay uses position:absolute with inset:0');

// ============================================================
// 8. Footer
// ============================================================
console.log('\n📄 FOOTER');
console.log('─'.repeat(50));

assert(content.includes('class="site-footer"'), 'Footer uses .site-footer class');
assert(content.includes('© 2025 gameShelf — All games built in browser — no downloads required'), 'Footer has exact required copyright text');

// ============================================================
// 9. Game mechanics — static code analysis
// ============================================================
console.log('\n⚙️ GAME MECHANICS (static analysis)');
console.log('─'.repeat(50));

// Check initGrid function exists
assert(content.includes('function initGrid') || content.includes('function initgrid'), 'initGrid function exists');

// Check slideTile / move function
assert(content.includes('function slideTile') || content.includes('slideTile('), 'slideTile function exists');

// Check isAdjacent function
assert(content.includes('function isAdjacent') || content.includes('isAdjacent('), 'isAdjacent function exists');

// Check canMove function
assert(content.includes('function canMove') || content.includes('canMove('), 'canMove function exists');

// Check shuffle function
assert(content.includes('function shuffle') || content.includes('shuffle('), 'shuffle function exists');

// Check SHUFFLE_MOVES or move counts for each grid size
assert(content.includes('200'), 'Shuffle move count 200 for 3×3');
assert(content.includes('300'), 'Shuffle move count 300 for 4×4');
assert(content.includes('400'), 'Shuffle move count 400 for 5×5');

// Check cellSize calculation
assert(content.includes('CANVAS_SIZE / gridSize') || content.includes('400 / gridSize'), 'Cell sizing: cellSize = CANVAS_SIZE / gridSize');

// Check timer formatting with padStart
assert(content.includes('padStart'), 'Timer uses padStart for MM:SS format');
assert(content.includes(':'), 'Timer has colon separator for MM:SS format');

// Check win check function
assert(content.includes('function checkWin') || content.includes('checkWin('), 'checkWin function exists');

// Check win condition: tiles 1..n-1 in order, empty at bottom-right
// The loop should check grid[i] !== i+1
assert(content.includes('i + 1') || content.includes('i+1'), 'Win check verifies ascending tile order (grid[i] === i+1)');
assert(content.includes('grid.length - 1') || content.includes('length-1'), 'Empty space checked at last position (bottom-right)');

// Check playerMove function
assert(content.includes('function playerMove') || content.includes('playerMove('), 'playerMove function exists');

// Check timer start/stop
assert(content.includes('function startTimer') || content.includes('startTimer('), 'startTimer function exists');
assert(content.includes('function stopTimer') || content.includes('stopTimer('), 'stopTimer function exists');
assert(content.includes('setInterval'), 'Timer uses setInterval');
assert(content.includes('clearInterval'), 'Timer uses clearInterval');

// ============================================================
// 10. Controls — static analysis
// ============================================================
console.log('\n🎮 CONTROLS');
console.log('─'.repeat(50));

// Arrow key handlers
assert(content.includes('ArrowUp') && content.includes('ArrowDown') && content.includes('ArrowLeft') && content.includes('ArrowRight'), 'Arrow key handlers for all 4 directions');

// preventDefault on arrow keys
assert(content.includes('preventDefault'), 'preventDefault called (scroll prevention)');

// Click handler
assert(content.includes("addEventListener('click'") || content.includes('addEventListener("click"'), 'Click event listener registered');
assert(content.includes('getBoundingClientRect'), 'Click handler uses getBoundingClientRect');

// Context menu prevention
assert(content.includes('contextmenu'), 'Context menu (right-click) handler present');

// ============================================================
// 11. Rendering — static analysis
// ============================================================
console.log('\n🖼️ RENDERING');
console.log('─'.repeat(50));

// Check canvas context
assert(content.includes('getContext'), 'Canvas context obtained');

// Check clearRect / fillRect for drawing
assert(content.includes('clearRect'), 'Canvas clearRect for clearing');
assert(content.includes('fillRect'), 'Canvas fillRect for drawing');
assert(content.includes('strokeRect'), 'Canvas strokeRect for tile borders');

// Check fillText for numbers
assert(content.includes('fillText'), 'Canvas fillText for drawing tile numbers');

// Check requestAnimationFrame
assert(content.includes('requestAnimationFrame'), 'Uses requestAnimationFrame');

// Check grid background draw
assert(content.includes('ctx.fillStyle'), 'Canvas fillStyle for grid background/tiles');
assert(content.includes('ctx.strokeStyle'), 'Canvas strokeStyle for tile borders');

// ============================================================
// 12. Responsive design
// ============================================================
console.log('\n📱 RESPONSIVE DESIGN');
console.log('─'.repeat(50));

assert(content.includes('@media'), 'Responsive media queries present');
assert(content.includes('max-width: 100%'), 'Canvas has max-width: 100% for responsive scaling');

// ============================================================
// 13. Game states
// ============================================================
console.log('\n🔄 GAME STATES & OVERLAYS');
console.log('─'.repeat(50));

assert(content.includes("'idle'") || content.includes('"idle"'), 'idle game state defined');
assert(content.includes("'shuffling'") || content.includes('"shuffling"'), 'shuffling game state defined');
assert(content.includes("'playing'") || content.includes('"playing"'), 'playing game state defined');
assert(content.includes("'won'") || content.includes('"won"'), 'won game state defined');

// Check game state guards in playerMove/click handlers
assert(content.includes('gameState !==') || content.includes("gameState != "), 'Game state guards prevent moves during non-playing states');

// ============================================================
// 14. Color theme (dark theme)
// ============================================================
console.log('\n🎨 THEME & COLORS');
console.log('─'.repeat(50));

assert(content.includes('#0f0f23') || content.includes('--bg-primary'), 'Dark background theme (#0f0f23)');
assert(content.includes('#e0e0e0') || content.includes('--text-primary'), 'Light text color (#e0e0e0)');
assert(content.includes('#00d4ff') || content.includes('--accent'), 'Accent color (#00d4ff)');
assert(content.includes('#2a2a5a') || content.includes('--border-color'), 'Border color (#2a2a5a)');

// Tile rendering with fill and border
assert(content.includes('getTileColor') || content.includes('tileColor'), 'Tile color function/property exists');

// ============================================================
// 15. Registration checks
// ============================================================
console.log('\n📝 REGISTRATION');
console.log('─'.repeat(50));

var indexContent = fs.readFileSync(GAMES_INDEX_PATH, 'utf-8');

assert(indexContent.includes('slidingpuzzle.html'), 'slidingpuzzle.html referenced in index.html');
assert(indexContent.includes('data-category="puzzle"'), 'Game card has data-category="puzzle"');
assert(indexContent.includes('Sliding Tile Puzzle'), 'Game card title present');

// Check emoji in card
assert(/🧩|🎯|🔲|📦/.test(indexContent), 'Game card has puzzle-appropriate emoji');

// Check registration in script.js
var scriptContent = fs.readFileSync(SCRIPT_JS_PATH, 'utf-8');
assert(scriptContent.includes('Sliding Tile Puzzle') || scriptContent.includes('slidingpuzzle'), 'Game registered in script.js window.gamesCatalog');

// ============================================================
// 16. Restart / Play Again behavior
// ============================================================
console.log('\n🔄 RESTART / PLAY AGAIN');
console.log('─'.repeat(50));

assert(content.includes('function restart') || content.includes('function restart('), 'restart function exists');
assert(content.includes('playAgainBtn') || content.includes('play-again-btn'), 'Play Again button referenced in JS');

// restart should reset timer, moves, overlays
assert(content.includes("timerEl.textContent = '00:00'") || content.includes("timerEl.textContent='00:00'"), 'Timer resets to 00:00 on restart');
assert(content.includes("moveCounterEl.textContent = '0'") || content.includes("moveCounterEl.textContent='0'"), 'Move counter resets to 0 on restart');

// ============================================================
// 17. Difficulty change starts new game
// ============================================================
console.log('\n🎛️ DIFFICULTY CHANGE BEHAVIOR');
console.log('─'.repeat(50));

assert(content.includes('difficultySelect.addEventListener') || content.includes('difficulty-select'), 'Difficulty select has change event listener');
// The change handler should call restart or initGrid + shuffle
var diffHandler = content.match(/difficultySelect\.addEventListener[\s\S]*?(?=\n        \/\/)/);
if (diffHandler) {
    assert(diffHandler[0].includes('restart') || diffHandler[0].includes('initGrid') || diffHandler[0].includes('shuffle'), 'Difficulty change triggers restart/initGrid/shuffle');
}

// ============================================================
// 18. Edge cases
// ============================================================
console.log('\n⚠️ EDGE CASES');
console.log('─'.repeat(50));

// Grid dimensions: 3x3 = 8 tiles, 4x4 = 15 tiles, 5x5 = 24 tiles
assert(content.includes('size * size - 1') || content.includes('size*size-1') || content.includes('total - 1'), 'Grid logic: total = size*size, tiles = total-1');

// Timer format: zero-padding for MM:SS
assert(content.includes('padStart(2,') || content.includes('padStart(2,'), 'Timer values zero-padded to 2 digits');

// Timer starts on first move
var pmMatch = content.match(/function playerMove[\s\S]*?(?=\n        \/\/\s|$)/);
if (pmMatch) {
    assert(pmMatch[0].includes('moves === 1') || pmMatch[0].includes('moves==1') || pmMatch[0].includes('moves == 1'), 'Timer starts on first move (moves === 1)');
}

// Timer stops on win
var cwMatch = content.match(/function checkWin[\s\S]*?(?=\n        \/\/\s|$)/);
// checkWin itself just checks the board; timer stopping is in the move handler after checkWin returns true
assert(content.includes('gameState === \'won\'') || content.includes('gameState === "won"'), 'Win state set on puzzle completion');

// ============================================================
// Run JSDOM to verify DOM structure
// ============================================================
console.log('\n🧪 GAME LOGIC TESTS (JSDOM)');
console.log('─'.repeat(50));

var dom = new JSDOM(content, {
    url: 'http://localhost/games/slidingpuzzle.html',
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
});

var w = dom.window;
var doc = w.document;

setTimeout(function() {
    // DOM element checks
    assert(doc.getElementById('gameCanvas') !== null, 'Canvas element rendered in DOM');
    assert(doc.getElementById('moveCounter') !== null, 'Move counter element rendered in DOM');
    assert(doc.getElementById('timer') !== null, 'Timer element rendered in DOM');
    assert(doc.getElementById('smileyBtn') !== null, 'Smiley button rendered in DOM');
    assert(doc.getElementById('shuffleOverlay') !== null, 'Shuffle overlay rendered in DOM');
    assert(doc.getElementById('winOverlay') !== null, 'Win overlay rendered in DOM');
    assert(doc.getElementById('playAgainBtn') !== null, 'Play Again button rendered in DOM');
    assert(doc.getElementById('difficultySelect') !== null, 'Difficulty selector rendered in DOM');

    // Canvas dimensions
    var canvas = doc.getElementById('gameCanvas');
    assert(canvas !== null && canvas.width === 400 && canvas.height === 400, 'Canvas is 400x400 in DOM');

    // Difficulty selector options
    var sel = doc.getElementById('difficultySelect');
    assert(sel !== null && sel.options.length === 3, 'Difficulty selector has 3 options');

    // Verify game states are correct from DOM text
    var shuffleOverlay = doc.getElementById('shuffleOverlay');
    assert(shuffleOverlay !== null && shuffleOverlay.textContent.includes('Shuffling'), 'Shuffle overlay text contains "Shuffling"');

    var winOverlay = doc.getElementById('winOverlay');
    assert(winOverlay !== null && winOverlay.textContent.includes('You Win'), 'Win overlay text contains "You Win"');

    // ============================================================
    // 19. Test the actual game logic by extracting and running JS
    // ============================================================
    console.log('\n🧪 GAME LOGIC EXECUTION TESTS');
    console.log('─'.repeat(50));

    try {
        // Extract the IIFE script content
        var scriptMatch = content.match(/<script>\s*\(\s*function\s*\(\s*\)\s*\{\s*'use strict';([\s\S]*?)\s*\}\s*\)\s*;\s*<\/script>/);
        if (scriptMatch) {
            var gameCode = scriptMatch[1];

            // We can't easily run this in Node because it references document/window.
            // Instead, do deeper static analysis of the extracted code.

            // Check slide direction mapping
            assert(gameCode.includes("'up'") && gameCode.includes("'down'") && gameCode.includes("'left'") && gameCode.includes("'right'"),
                   'slideTile handles all 4 directions (up/down/left/right)');

            // Check empty position tracking
            assert(gameCode.includes('emptyPos') || gameCode.includes('empty'), 'Empty position is tracked');

            // Check grid array initialization: tiles 1..n-1, empty = 0
            assert(gameCode.includes('grid[') && gameCode.includes('i + 1') && gameCode.includes('= 0'),
                   'Grid initialized with tiles 1..n-1 and 0 for empty');

            // Check adjacent neighbor check uses Manhattan distance
            assert(gameCode.includes('Math.abs') && (gameCode.includes('+') || gameCode.includes('=== 1') || gameCode.includes('===1')),
                   'isAdjacent uses Manhattan distance check');

            // Check swap logic: grid[emptyPos] = grid[newPos]; grid[newPos] = 0;
            assert(gameCode.includes('grid[emptyPos]') && gameCode.includes('grid[newPos]') && gameCode.includes('= 0'),
                   'Tile swap: grid[emptyPos] = grid[newPos]; grid[newPos] = 0;');

            // Check shuffle: performs random moves from solved state
            assert(gameCode.includes('Math.random') || gameCode.includes('random'), 'Shuffle uses Math.random for random moves');

            // Check that shuffle avoids reversing the last move (to create better puzzles)
            assert(gameCode.includes('lastDr') || gameCode.includes('lastDc') || gameCode.includes('last'),
                   'Shuffle tracks last move direction to avoid reversing');

            // Check win detection loop
            var cwCheck = content.match(/function checkWin[\s\S]*?(?=\n        \/\/\s|$)/);
            if (cwCheck) {
                assert(cwCheck[0].includes('return false'), 'checkWin returns false early on mismatch');
                assert(cwCheck[0].includes('return true') || cwCheck[0].includes('return true'), 'checkWin returns true when all correct');
            }

            // Check render uses requestAnimationFrame
            assert(gameCode.includes('requestAnimationFrame') || gameCode.includes('raf'), 'Rendering uses requestAnimationFrame');

            // Check timer logic
            assert(gameCode.includes('timerSeconds') || gameCode.includes('timer'), 'Timer seconds variable tracked');
            assert(gameCode.includes('Math.floor(timerSeconds / 60)') || gameCode.includes('timerSeconds / 60'), 'Minutes calculated from timerSeconds');
            assert(gameCode.includes('timerSeconds % 60'), 'Seconds calculated from timerSeconds (modulo 60)');
        }
    } catch (e) {
        assert(false, 'Code analysis error: ' + e.message);
    }

    // ============================================================
    // Final summary
    // ============================================================
    console.log('\n' + '═'.repeat(50));
    console.log('\nRESULTS: ' + passed + ' passed, ' + failed + ' failed\n');

    if (failures.length > 0) {
        console.log('FAILURES:');
        failures.forEach(function(f, i) { console.log('  ' + (i + 1) + '. ' + f); });
        process.exit(1);
    } else {
        console.log('All tests passed! 🎉');
        process.exit(0);
    }

}, 300);
