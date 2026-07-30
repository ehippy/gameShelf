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
console.log('\n--- AC1: Space/Enter on start screen starts game (single key press) ---');

// The playing-state Space/Enter handler must NOT contain !minesPlaced guard
// Extract the playing-state branch of the keydown handler
var playingGuard = content.match(/if\s*\(gameState\s*!==\s*['"]playing['"]\)\s*return;/);
assert(playingGuard !== null, 'Playing-state guard exists in keydown handler');

if (playingGuard) {
  // Get everything after "gameState !== 'playing' return;"
  var afterGuardIdx = content.indexOf('gameState') + playingGuard[0].length;
  var afterGuard = content.substring(afterGuardIdx);
  // Get up to next major block (function definition or next if at top level)
  var playingBranch = afterGuard.match(/([\s\S]*?)\n\s*\/\/|function /);

  if (playingBranch) {
    var pb = playingBranch[1];
    // Extract Space/Enter handler from playing branch
    var seMatch = pb.match(/e\.code\s*===\s*['"]Space['"]\s*\|\|\s*e\.code\s*===\s*['"]Enter['"]/);
    assert(seMatch !== null, 'Space/Enter check found in playing-state branch');

    // Extract just the Space/Enter if-block body
    var seBlock = pb.match(/e\.code\s*===\s*['"]Space['"]\s*\|\|\s*e\.code\s*===\s*['"]Enter['"][\s\S]*?\}\n\s*\}/);
    assert(seBlock !== null, 'Space/Enter if-block found in playing-state branch');

    if (seBlock) {
      var seBody = seBlock[0];
      assert(!seBody.includes('!minesPlaced') && !seBody.includes('!minesPlaced '),
             'Space/Enter handler does NOT contain !minesPlaced guard');
      assert(!seBody.includes('beginPlaying()'),
             'Space/Enter handler does NOT call beginPlaying()');
      assert(!seBody.includes('placeMines('),
             'Space/Enter handler does NOT call placeMines()');
      assert(!seBody.includes('startTimer()'),
             'Space/Enter handler does NOT call startTimer()');
      assert(!seBody.includes('calculateAdjacentMines()'),
             'Space/Enter handler does NOT call calculateAdjacentMines()');
      assert(seBody.includes('revealCell(cursorX, cursorY)'),
             'Space/Enter handler calls revealCell(cursorX, cursorY)');
      assert(seBody.includes('render()'),
             'Space/Enter handler calls render()');
    }
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
         pmBody.includes('&&') && pmBody.includes('!board'),
         'placeMines() excludes the reveal cell from mine placement');
}

// ── AC6: Arrow key cursor navigation on start screen works ──
console.log('\n--- AC6: Arrow key cursor navigation on start screen ---');

// The start-state branch of the keydown handler must process arrow keys
// Look for: if (gameState === 'start')
var startCheck = content.indexOf("gameState === 'start'");
assert(startCheck !== -1, 'Start state check exists in keydown handler');

if (startCheck !== -1) {
  // Get the block after this check, up to the next top-level if or }
  var afterStart = content.substring(startCheck);
  var startBlock = afterStart.match(/\{([\s\S]*?)\n\s*(?:\}\s*$|\n\s*if\s*\(\s*gameState\s*==)/);

  if (startBlock) {
    var sb = startBlock[1];
    // Must process arrow key movement
    assert(sb.includes('cursorX +=') || sb.includes('cursorX+='),
           'Start state moves cursorX on arrow keys');
    assert(sb.includes('cursorY +=') || sb.includes('cursorY+='),
           'Start state moves cursorY on arrow keys');
    // Must clamp cursor to grid
    assert(sb.includes('cursorX < 0') || sb.includes('cursorX<0'),
           'Start state clamps cursorX lower bound');
    assert(sb.includes('cursorX >= COLS') || sb.includes('cursorX>=COLS'),
           'Start state clamps cursorX upper bound');
    assert(sb.includes('cursorY < 0') || sb.includes('cursorY<0'),
           'Start state clamps cursorY lower bound');
    assert(sb.includes('cursorY >= ROWS') || sb.includes('cursorY>=ROWS'),
           'Start state clamps cursorY upper bound');
    assert(sb.includes('render()'),
           'Start state calls render() after cursor movement');
  }
}

// ── AC7: Restart mechanisms work after fix ──
console.log('\n--- AC7: Restart mechanisms work after fix ---');

// Restart button for game over overlay
assert(content.includes('restartBtnGameOver.addEventListener'),
       'Game Over restart button has click listener');

// Restart button for win overlay
assert(content.includes('restartBtnWin.addEventListener'),
       'Win restart button has click listener');

// Smiley button restart
assert(content.includes('smileyBtn.addEventListener'),
       'Smiley button has click listener');

// Escape-to-restart
var escapeMatch = content.match(/e\.code\s*===\s*['"]Escape['"]([\s\S]*?)\n\s*\}/);
assert(escapeMatch !== null, 'Escape key handler exists');
if (escapeMatch) {
  assert(escapeMatch[1].includes('restart()'),
         'Escape key calls restart() during playing state');
}

// GameOver/Win overlay Enter/Space also restarts
assert(content.match(/gameState\s*===\s*['"]gameover['"]|gameState\s*===\s*['"]win['"]/),
       'Key handler checks gameover and win overlay states');

// ── AC8: Left-click canvas during 'start' state reveals clicked cell ──
console.log('\n--- AC8: Left-click canvas during start state reveals cell ---');

var canvasClickMatch = content.match(/canvas\.addEventListener\('click',\s*function\(e\)\s*\{[\s\S]*?\}\);/);
assert(canvasClickMatch !== null, 'Canvas click event listener exists');

if (canvasClickMatch) {
  var canvasClickBody = canvasClickMatch[0];
  assert(canvasClickBody.includes("gameState === 'start'") || canvasClickBody.includes("gameState=='start'"),
         'Canvas click handler checks for start state');
  assert(canvasClickBody.includes('handleFirstReveal()'),
         'Canvas click during start state calls handleFirstReveal()');
}

// ── AC9: Timer starts immediately on game start (keyboard or mouse) ──
console.log('\n--- AC9: Timer starts immediately on game start ---');

assert(content.includes('timerSeconds'), 'timerSeconds variable exists');
assert(content.includes('timerInterval'), 'timerInterval variable exists');
assert(content.includes('setInterval'), 'startTimer() uses setInterval');
assert(content.includes('stopTimer()'), 'stopTimer() exists to clear interval');
assert(content.includes('clearInterval'), 'stopTimer() uses clearInterval');

// handleFirstReveal() must call startTimer()
assert(handleFirstRevealMatch[0].includes('startTimer()'),
       'handleFirstReveal() calls startTimer() to begin timer immediately');

// ── AC10: Structural checks ──
console.log('\n--- Structural & Integration Checks ---');

// Grid dimensions: 16×16
assert(content.includes('COLS = 16'), 'Grid has 16 columns');
assert(content.includes('ROWS = 16'), 'Grid has 16 rows');

// Mine count
assert(content.includes('MINES = 10'), 'Mine count is 10');

// Canvas dimensions
assert(content.includes('CANVAS_SIZE = 400'), 'Canvas size is 400px');

// Game states
assert(content.indexOf("'start'") !== -1, 'start state defined');
assert(content.indexOf("'playing'") !== -1, 'playing state defined');
assert(content.indexOf("'gameover'") !== -1, 'gameover state defined');
assert(content.indexOf("'win'") !== -1, 'win state defined');

// Overlay elements
assert(content.includes('id="startOverlay"'), 'Start overlay exists');
assert(content.includes('id="gameOverOverlay"'), 'Game over overlay exists');
assert(content.includes('id="winOverlay"'), 'Win overlay exists');
assert(content.includes('class="overlay hidden"'), 'Overlays hidden by default with .hidden class');

// Overlays have titles
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
assert(!content.includes('script src="'), 'No external script src links');
assert(!content.includes('href="../styles.css"'), 'No external stylesheet links');

// IIFE and strict mode
assert(content.includes('(function()'), 'JS wrapped in IIFE');
assert(content.includes("'use strict'"), 'use strict present');

// Core functions exist
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
assert(indexContent.includes('minesweeper.html'), 'Minesweeper registered in index.html');

// Check for valid category
var validCategories = ['action', 'puzzle', 'arcade', 'strategy', 'board', 'casual'];
var hasCategory = false;
for (var ci = 0; ci < validCategories.length; ci++) {
  var cat = validCategories[ci];
  var catIdx = indexContent.indexOf(cat);
  if (catIdx !== -1) {
    // Check if minesweeper is nearby
    var nearby = indexContent.substring(Math.max(0, catIdx - 200), Math.min(indexContent.length, catIdx + 200));
    if (nearby.includes('minesweeper')) {
      hasCategory = true;
      break;
    }
  }
}
assert(hasCategory, 'Minesweeper has a valid category in index.html');

// ── Summary ──
console.log('\n' + '═'.repeat(50));
console.log('\nRESULTS: ' + passed + ' passed, ' + failed + ' failed\n');

if (failures.length > 0) {
  console.log('FAILURES:');
  failures.forEach(function(f, i) { console.log('  ' + (i + 1) + '. ' + f); });
}

process.exit(failed > 0 ? 1 : 0);
