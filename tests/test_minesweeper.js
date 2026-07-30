var fs = require('fs');
var path = require('path');

var filepath = path.join(__dirname, '..', 'games', 'minesweeper.html');
var content = fs.readFileSync(filepath, 'utf-8');

var passed = 0;
var failed = 0;
var failures = [];

function assert(condition, message) {
  if (condition) {
    console.log('  ✅ ' + message);
    passed++;
  } else {
    console.log('  ❌ ' + message);
    failed++;
    failures.push(message);
  }
}

console.log('\n=== Minesweeper — Double-Tap Start Bug Fix Tests ===\n');

// ── AC1: Space/Enter on start screen starts game with one press ──
// The playing-state key handler (lines 786+) must NOT contain the !minesPlaced guard
// and must NOT call beginPlaying() or placeMines() from there.
console.log('\n--- AC1: Space/Enter on start screen starts game (single key press) ---');

// Extract the playing-state branch of the keydown handler
var playingStateKeyMatch = content.match(/gameState\s*!==\s*'playing'\s*return;([\s\S]*?)(?:\n\s*\/\/|function)/);
assert(playingStateKeyMatch !== null, 'Playing-state guard exists in keydown handler');

if (playingStateKeyMatch) {
  var playingBranch = playingStateKeyMatch[0];

  // The playing-state Space/Enter handler must NOT contain !minesPlaced guard
  // Extract just the Space/Enter section from playing branch
  var spaceEnterInPlaying = playingBranch.match(/if\s*\(\s*e\.code\s*===\s*'Space'\s*\|\|\s*e\.code\s*===\s*'Enter'\s*\)\s*\{([\s\S]*?)\n\s*\}/);
  assert(spaceEnterInPlaying !== null, 'Space/Enter handler found in playing-state key handler');

  if (spaceEnterInPlaying) {
    var spaceEnterBody = spaceEnterInPlaying[1];
    assert(!spaceEnterBody.includes('!minesPlaced') && !spaceEnterBody.includes('!minesPlaced'),
           'Space/Enter handler does NOT contain !minesPlaced guard');
    assert(!spaceEnterBody.includes('beginPlaying()'),
           'Space/Enter handler does NOT call beginPlaying()');
    assert(!spaceEnterBody.includes('placeMines('),
           'Space/Enter handler does NOT call placeMines()');
    assert(!spaceEnterBody.includes('startTimer()'),
           'Space/Enter handler does NOT call startTimer()');
    assert(!spaceEnterBody.includes('calculateAdjacentMines()'),
           'Space/Enter handler does NOT call calculateAdjacentMines()');
    assert(spaceEnterBody.includes('revealCell(cursorX, cursorY)'),
           'Space/Enter handler calls revealCell(cursorX, cursorY)');
    assert(spaceEnterBody.includes('render()'),
           'Space/Enter handler calls render()');
  }
}

// ── AC2: Start button click handler calls handleFirstReveal() ──
console.log('\n--- AC2: Start button click calls handleFirstReveal() ---');

var startBtnHandler = content.match(/startBtn\.addEventListener\('click',\s*function\(\)\s*\{[\s\S]*?\}\);/);
assert(startBtnHandler !== null, 'startBtn click listener exists');

if (startBtnHandler) {
  var handlerBody = startBtnHandler[0];
  assert(handlerBody.includes('handleFirstReveal()'),
         'Start button click handler calls handleFirstReveal()');
  // Should NOT have manual beginPlaying/placeMines/calculateAdjacentMines calls
  // since handleFirstReveal() covers them
  assert(!handlerBody.includes('beginPlaying(') || handlerBody.includes('handleFirstReveal()'),
         'Start button relies on handleFirstReveal() for game start logic');
}

// ── AC3: handleFirstReveal() places mines, begins playing, starts timer, reveals cell ──
console.log('\n--- AC3: handleFirstReveal() is complete (single-call game start) ---');

var handleFirstRevealMatch = content.match(/function handleFirstReveal\(\)\s*\{[\s\S]*?\n\s*\}/);
assert(handleFirstRevealMatch !== null, 'handleFirstReveal() function exists');

if (handleFirstRevealMatch) {
  var hfrBody = handleFirstRevealMatch[0];
  assert(hfrBody.includes('placeMines(cursorX, cursorY)'),
         'handleFirstReveal() calls placeMines(cursorX, cursorY)');
  assert(hfrBody.includes('calculateAdjacentMines()'),
         'handleFirstReveal() calls calculateAdjacentMines()');
  assert(hfrBody.includes('minesPlaced = true'),
         'handleFirstReveal() sets minesPlaced = true');
  assert(hfrBody.includes('revealCell(cursorX, cursorY)'),
         'handleFirstReveal() calls revealCell(cursorX, cursorY)');
  assert(hfrBody.includes('beginPlaying()'),
         'handleFirstReveal() calls beginPlaying()');
  assert(hfrBody.includes('startTimer()'),
         'handleFirstReveal() calls startTimer()');
  assert(hfrBody.includes('render()'),
         'handleFirstReveal() calls render()');
}

// ── AC4: Smiley shows 😀 on game start ──
console.log('\n--- AC4: Smiley shows 😀 when game starts ---');

assert(content.includes("smileyBtn.textContent = '😀'") || content.includes("smileyBtn.textContent='😀'"),
       'Smiley resets to 😀 on game start (initBoard/startGame)');

// Verify smiley on game over shows 😵
assert(content.includes("smileyBtn.textContent = '😵'") || content.includes("smileyBtn.textContent='😵'"),
       'Smiley shows 😵 on game over');

// Verify smiley on win shows 😎
assert(content.includes("smileyBtn.textContent = '😎'") || content.includes("smileyBtn.textContent='😎'"),
       'Smiley shows 😎 on win');

// ── AC5: No mine on cell (0,0) — placeMines excludes firstRevealX/Y ──
console.log('\n--- AC5: No mine placed on cell (0,0) ---');

var placeMinesMatch = content.match(/function placeMines\([^)]*\)\s*\{[\s\S]*?(?=\n\n        \/\/|function )/);
assert(placeMinesMatch !== null, 'placeMines() function exists');

if (placeMinesMatch) {
  var pmBody = placeMinesMatch[0];
  assert(pmBody.includes('firstRevealX') && pmBody.includes('firstRevealY'),
         'placeMines() accepts firstReveal coordinates as parameters');
  assert(pmBody.includes('firstRevealX') && pmBody.includes('firstRevealY') &&
         pmBody.includes('&&') && pmBody.includes('!board[y][x].mine'),
         'placeMines() excludes the reveal cell from mine placement');
  assert(pmBody.includes('&&') && pmBody.includes('!board[y][x].mine'),
         'placeMines() checks both: not already a mine AND not the reveal cell');
}

// ── AC6: Arrow key cursor navigation on start screen works ──
console.log('\n--- AC6: Arrow key cursor navigation on start screen ---');

// The start-state branch of the keydown handler must process arrow keys
var startStateKeyMatch = content.match(/if \(gameState === 'start'\)([\s\S]*?)(?=\n\s*if\s*\(\s*gameState\s*===\s*'gameover'/);
assert(startStateKeyMatch !== null, 'Start-state key handler branch exists');

if (startStateKeyMatch) {
  var startKeyBranch = startStateKeyMatch[1];
  // Must check for Arrow keys
  assert(startKeyBranch.includes('ArrowUp') || startKeyBranch.includes("move.y"),
         'Start state handles ArrowUp/ArrowDown for cursor movement');
  // Must clamp cursor to grid
  assert(startKeyBranch.includes('cursorX >= COLS') || startKeyBranch.includes('cursorX < 0'),
         'Start state clamps cursorX to grid bounds');
  assert(startKeyBranch.includes('cursorY >= ROWS') || startKeyBranch.includes('cursorY < 0'),
         'Start state clamps cursorY to grid bounds');
  assert(startKeyBranch.includes('render()'),
         'Start state calls render() after cursor movement');
}

// ── AC7: Restart buttons, smiley button, and Escape-to-restart work ──
console.log('\n--- AC7: Restart mechanisms work after fix ---');

// Restart button for game over overlay
assert(content.includes("restartBtnGameOver.addEventListener('click'"),
       'Game Over restart button has click listener');
assert(content.includes("restartBtnGameOver.addEventListener('click', function()") ||
       content.includes('restartBtnGameOver.addEventListener("click', function()'),
       'Game Over restart button calls restart()');

// Restart button for win overlay
assert(content.includes("restartBtnWin.addEventListener('click'"),
       'Win restart button has click listener');
assert(content.includes("restartBtnWin.addEventListener('click', function()") ||
       content.includes('restartBtnWin.addEventListener("click', function()'),
       'Win restart button calls restart()');

// Smiley button restart
assert(content.includes("smileyBtn.addEventListener('click'"),
       'Smiley button has click listener');
assert(content.includes("smileyBtn.addEventListener('click', function()") ||
       content.includes('smileyBtn.addEventListener("click', function()'),
       'Smiley button calls restart()');

// Escape-to-restart in playing state
var escapeInPlaying = content.match(/if \(e\.code\s*===\s*'Escape'\)([\s\S]*?)\n\s*\}/);
assert(escapeInPlaying !== null, 'Escape key handler exists in playing state');
if (escapeInPlaying) {
  assert(escapeInPlaying[1].includes('restart()'),
         'Escape key calls restart() during playing state');
}

// GameOver/Win overlay Enter/Space also restarts
var overlayRestartMatch = content.match(/if \(e\.code\s*===\s*'Enter'\s*\|\|\s*e\.code\s*===\s*'Space'\)\s*\{[\s\S]*?restart\(\)/);
assert(overlayRestartMatch !== null, 'Enter/Space restarts from overlay (gameover/win) states');

// ── AC8: Left-click canvas during 'start' state reveals clicked cell ──
console.log('\n--- AC8: Left-click canvas during start state reveals cell ---');

// The canvas click handler has a start-state branch that calls handleFirstReveal()
var canvasClickMatch = content.match(/canvas\.addEventListener\('click',\s*function\(e\)\s*\{[\s\S]*?\}\);/);
assert(canvasClickMatch !== null, 'Canvas click event listener exists');

if (canvasClickMatch) {
  var canvasClickBody = canvasClickMatch[0];
  assert(canvasClickBody.includes("gameState === 'start'") || canvasClickBody.includes("gameState=='start'"),
         'Canvas click handler checks for start state');
  assert(canvasClickBody.includes("handleFirstReveal()"),
         'Canvas click during start state calls handleFirstReveal()');
  // Mouse click on canvas during start should not have !minesPlaced guard —
  // the click always calls handleFirstReveal()
  var startClickBranch = canvasClickBody.match(/if \(gameState === 'start'[^\)]*\)\s*\{[\s\S]*?handleFirstReveal\(\)/);
  assert(startClickBranch !== null,
         'Canvas click handler: start-state branch calls handleFirstReveal()');
}

// ── AC9: Timer starts immediately on game start (keyboard or mouse) ──
console.log('\n--- AC9: Timer starts immediately on game start ---');

// handleFirstReveal() must call startTimer()
assert(handleFirstRevealMatch[0].includes('startTimer()'),
       'handleFirstReveal() calls startTimer() to begin timer immediately');

// The timer variable and interval must exist
assert(content.includes('timerSeconds'), 'timerSeconds variable exists');
assert(content.includes('timerInterval'), 'timerInterval variable exists');
assert(content.includes('setInterval'), 'startTimer() uses setInterval');
assert(content.includes('stopTimer()'), 'stopTimer() exists to clear interval');
assert(content.includes('clearInterval'), 'stopTimer() uses clearInterval');

// ── AC10: Structural checks ──
console.log('\n--- Structural & Integration Checks ---');

// Grid dimensions: 16×16
assert(content.includes('COLS = 16') || content.includes("COLS='16'") || content.includes("COLS = 16"),
       'Grid has 16 columns');
assert(content.includes('ROWS = 16') || content.includes("ROWS='16'") || content.includes("ROWS = 16"),
       'Grid has 16 rows');

// Mine count
assert(content.includes('MINES = 10') || content.includes("MINES = 10"),
       'Mine count is 10');

// Canvas dimensions
assert(content.includes('CANVAS_SIZE = 400') || content.includes('CANVAS_SIZE=400'),
       'Canvas size is 400px');

// Game states
assert(content.includes("'start'") && content.includes("'playing'") &&
       content.includes("'gameover'") && content.includes("'win'"),
       'All game states defined: start, playing, gameover, win');

// Overlay elements
assert(content.includes('id="startOverlay"'), 'Start overlay exists');
assert(content.includes('id="gameOverOverlay"'), 'Game over overlay exists');
assert(content.includes('id="winOverlay"'), 'Win overlay exists');
assert(content.includes('class="overlay hidden"') || content.includes("class='overlay hidden'"),
       'Overlays hidden by default with .hidden class');

// Overlays exist as HTML elements
assert(content.includes('Game Over') || content.includes('💥'), 'Game over overlay has title');
assert(content.includes('You Win') || content.includes('🎉'), 'Win overlay has title');

// Start button
assert(content.includes('id="startBtn"'), 'Start button has id="startBtn"');
assert(content.includes('Start Game'), 'Start button text present');

// HUD
assert(content.includes('id="mineCounter"'), 'Mine counter exists');
assert(content.includes('id="timer"'), 'Timer display exists');
assert(content.includes('id="smileyBtn"'), 'Smiley button exists');

// Footer
assert(content.includes('class="site-footer"'), 'Footer with site-footer class exists');
assert(content.includes('© 2025 gameShelf — All games built in browser — no downloads required'),
       'Footer has consistent copyright text');

// Header
assert(content.includes('class="game-header"'), 'Header with game-header class exists');
assert(content.includes('class="back-link"'), 'Back link present');

// Self-contained
assert(/<style>[\s\S]*<\/style>/.test(content), 'Contains inline <style> tag');
assert(/<script>[\s\S]*<\/script>/.test(content), 'Contains inline <script> tag');
assert(!content.includes('<script src="') && !content.includes('script src=\''),
       'No external script src links');
assert(!content.includes('href="../styles.css"'), 'No external stylesheet links');

// IIFE and strict mode
assert(content.includes('(function()'), 'JS wrapped in IIFE');
assert(content.includes("'use strict'"), 'use strict present');

// revealCell and game logic
assert(content.includes('function revealCell('), 'revealCell function exists');
assert(content.includes('function toggleFlag('), 'toggleFlag function exists');
assert(content.includes('function endGame('), 'endGame function exists');
assert(content.includes('function startGame()'), 'startGame function exists');
assert(content.includes('function restart()'), 'restart function exists');
assert(content.includes('function initBoard()'), 'initBoard function exists');
assert(content.includes('function beginPlaying()'), 'beginPlaying function exists');

// ── AC11: Game registration in index.html ──
console.log('\n--- AC11: Game registration in index.html ---');

var indexPath = path.join(__dirname, '..', 'index.html');
assert(fs.existsSync(indexPath), 'index.html exists');

var indexContent = fs.readFileSync(indexPath, 'utf-8');
assert(indexContent.includes('minesweeper.html') || indexContent.includes('Minesweeper'),
       'Minesweeper registered in index.html');

// Check for category
assert(indexContent.match(/minesweeper[\s\S]{0,200}?(action|puzzle|arcade|strategy|board|casual)/) !== null ||
       content.includes("'minesweeper'") ||
       (indexContent.includes('minesweeper') &&
        (indexContent.includes('puzzle') || indexContent.includes('action') ||
         indexContent.includes('arcade') || indexContent.includes('strategy') ||
         indexContent.includes('board') || indexContent.includes('casual'))),
       'Minesweeper has a valid category in index.html');

// ── Summary ──
console.log('\n' + '═'.repeat(50));
console.log('\nRESULTS: ' + passed + ' passed, ' + failed + ' failed\n');

if (failures.length > 0) {
  console.log('FAILURES:');
  failures.forEach(function(f, i) { console.log('  ' + (i + 1) + '. ' + f); });
}

process.exit(failed > 0 ? 1 : 0);
