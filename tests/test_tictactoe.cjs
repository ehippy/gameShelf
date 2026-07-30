var fs = require('fs');
var path = require('path');

var filepath = path.join(__dirname, '..', 'games', 'tictactoe.html');
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

console.log('\n=== Tic Tac Toe — Mouse Click Control Tests ===\n');

// ── Acceptance Criterion 1: Clicking empty cell places X (same as Enter with cursor) ──
console.log('--- AC1: Empty-cell click places X ---');

// Verify click handler exists
assert(content.includes("canvas.addEventListener('click'"),
       'Canvas click event listener is registered');

// Verify click handler maps coordinates to grid cells
assert(content.includes('getBoundingClientRect'),
       'Click handler uses getBoundingClientRect for coordinate mapping');
assert(content.includes("e.clientX - rect.left") || content.includes('clickX'),
       'Click handler computes relative X coordinate');
assert(content.includes("e.clientY - rect.top") || content.includes('clickY'),
       'Click handler computes relative Y coordinate');
assert(content.includes('Math.floor(clickX') || content.includes('Math.floor(clickX'),
       'Click X coordinate converted to grid column via Math.floor');
assert(content.includes('Math.floor(clickY') || content.includes('Math.floor(clickY'),
       'Click Y coordinate converted to grid row via Math.floor');

// Verify click handler places X in empty cells
assert(content.includes("board[row][col] === null"),
       'Click handler checks if cell is empty');
assert(content.includes("board[row][col] = 'X'") || content.includes("board[row][col]='X'"),
       'Click handler places X in empty cell');

// Verify click handler runs win/draw check after placing X
assert(content.includes('checkWinner()'),
       'Click handler calls checkWinner after placing X');

// Verify click handler triggers AI turn when game continues
assert(content.includes("aiMove()"),
       'Click handler triggers AI move after player places X');

// Verify click handler calls render
assert(/render\(\)\s*;/.test(content),
       'Click handler calls render to update display');

// Verify click handler calls updateTurnIndicator
assert(content.includes("updateTurnIndicator()"),
       'Click handler calls updateTurnIndicator');

// ── Acceptance Criterion 2: Clicking occupied cell has no effect ──
console.log('\n--- AC2: Occupied-cell click is ignored ---');

// The click handler must check board[row][col] === null before placing
// and must NOT place if occupied — verify the guard logic is present
var clickHandler = content.match(/canvas\.addEventListener\('click',\s*function\(e\)\s*\{[\s\S]*?\n\s*\}\);/);
assert(clickHandler !== null, 'Click handler function block can be extracted');

if (clickHandler) {
  assert(clickHandler[0].includes("board[row][col] === null"),
         'Occupied-cell guard: only places X if cell is null (empty)');
}

// ── Acceptance Criterion 3: After placing X via click, game continues with AI turn after 300ms delay ──
console.log('\n--- AC3: Game continues with AI turn after click ──');

// Verify win check happens
assert(content.includes('result = checkWinner()') || content.includes("result=checkWinner()"),
       'Click handler checks for win/draw after placing X');

// Verify AI move uses 300ms delay (from aiMove function)
var aiMoveMatch = content.match(/function aiMove\(\)[\s\S]*?(?=\n\n        \/\/|function )/);
assert(aiMoveMatch !== null, 'aiMove function exists');

if (aiMoveMatch) {
  assert(aiMoveMatch[0].includes('setTimeout') && aiMoveMatch[0].includes('300'),
         'AI move uses 300ms setTimeout delay');
}

// ── Acceptance Criterion 4: Clicking empty cell during start overlay has no effect ──
console.log('\n--- AC4: Clicks ignored during start state ---');

if (clickHandler) {
  assert(clickHandler[0].includes("gameState !== 'playing'") ||
         clickHandler[0].includes("gameState != 'playing'"),
         'Click handler guards against non-playing state (ignores start state)');
}

// ── Acceptance Criterion 5: Clicking empty cell during gameover has no effect ──
console.log('\n--- AC5: Clicks ignored during gameover state ---');

if (clickHandler) {
  assert(clickHandler[0].includes("gameState !== 'playing'") ||
         clickHandler[0].includes("gameState != 'playing'"),
         'Click handler ignores clicks when gameState is gameover (not playing)');
}

// ── Acceptance Criterion 6: Cursor highlight not affected by mouse clicks ──
console.log('\n--- AC6: Cursor highlight unaffected by mouse clicks ---');

// Verify the click handler does NOT modify cursorX or cursorY
if (clickHandler) {
  assert(!clickHandler[0].includes('cursorX') || clickHandler[0].split('cursorX').length <= 0,
         'Click handler does not update cursorX position');
  assert(!clickHandler[0].includes('cursorY') || clickHandler[0].split('cursorY').length <= 0,
         'Click handler does not update cursorY position');
}

// Verify cursor highlight is still drawn during playing state
assert(content.includes("gameState === 'playing'") && content.includes('CURSOR_COLOR') ||
       content.includes("gameState === 'playing'") && content.includes('cursorX') && content.includes('cursorY'),
       'Cursor highlight still rendered during playing state (keyboard cursor preserved)');

// ── Acceptance Criterion 7: Overlay subtitle mentions both keyboard and mouse ──
console.log('\n--- AC7: Overlay subtitle updated to mention mouse ---');

// Extract the start overlay subtitle (between startOverlay div and startBtn)
var startOverlaySection = content.match(/id="startOverlay"[^]*?Start Game/);
assert(startOverlaySection !== null, 'Start overlay section found in HTML');

if (startOverlaySection) {
  var startSection = startOverlaySection[0];
  var subtitleMatch = startSection.match(/overlay-subtitle[^>]*>([^<]*)</);
  assert(subtitleMatch !== null, 'overlay-subtitle element found in start overlay');

  if (subtitleMatch) {
    var subtitle = subtitleMatch[1];
    assert(subtitle.toLowerCase().includes('click'),
           'Subtitle mentions "click" for mouse interaction');
    assert(subtitle.toLowerCase().includes('arrow'),
           'Subtitle mentions arrow keys for keyboard interaction');
    assert(subtitle.toLowerCase().includes('enter'),
           'Subtitle mentions Enter key');
    assert(subtitle.toLowerCase().includes('three in a row'),
           'Subtitle still mentions winning condition');
  }
}

// Verify the old subtitle text is NOT present
assert(!content.includes('Use arrow keys to move, Enter to place.'),
       'Old subtitle "Use arrow keys to move, Enter to place." is NOT present');

// ── Acceptance Criterion 8: Start/Restart button clicks continue to work ──
console.log('\n--- AC8: Start and Restart button functionality preserved ---');

assert(content.includes("startBtn.addEventListener('click'") || content.includes('startBtn.addEventListener("click"'),
       'Start button still has click event listener');
assert(content.includes("restartBtn.addEventListener('click'") || content.includes('restartBtn.addEventListener("click"'),
       'Restart button still has click event listener');

// Verify startGame function exists
assert(content.includes('function startGame()'), 'startGame function exists');

// Verify restart function exists
assert(content.includes('function restart()'), 'restart function exists');

// ── Acceptance Criterion 9: Click handler prevents default behavior ──
console.log('\n--- AC9: Click handler prevents default ---');

if (clickHandler) {
  assert(clickHandler[0].includes("e.preventDefault()") || clickHandler[0].includes('e.preventDefault()'),
         'Click handler calls e.preventDefault() to avoid text selection/side effects');
}

// ── Structural / integration checks ──
console.log('\n--- Structural & Integration Checks ---');

assert(content.includes("id='gameCanvas'") || content.includes('id="gameCanvas"'),
       'Canvas element with id="gameCanvas" exists');
assert(content.includes("id='startOverlay'") || content.includes('id="startOverlay"'),
       'Start overlay exists');
assert(content.includes("id='gameOverOverlay'") || content.includes('id="gameOverOverlay"'),
       'Game over overlay exists');
assert(content.includes("id='startBtn'") || content.includes('id="startBtn"'),
       'Start button exists');
assert(content.includes("id='restartBtn'") || content.includes('id="restartBtn"'),
       'Restart button exists');

// ── High Score Tracking ──
console.log('\n--- High Score Tracking ---');

// recordDisplay element in HUD bar
assert(content.includes("id='recordDisplay'") || content.includes('id="recordDisplay"'),
       'recordDisplay element exists in HUD bar');
assert(content.includes('record-display'),
       'record-display CSS class exists');

// localStorage persistence key
assert(content.includes("'tictactoe-record'"),
       'localStorage key "tictactoe-record" is used');

// loadRecord function
assert(content.includes('function loadRecord()'),
       'loadRecord function exists');

// saveRecord function
assert(content.includes('function saveRecord()'),
       'saveRecord function exists');

// updateRecordDisplay function
assert(content.includes('function updateRecordDisplay()'),
       'updateRecordDisplay function exists');

// incrementRecord function
assert(content.includes('function incrementRecord(') || content.includes('function incrementRecord ('),
       'incrementRecord function exists');

// buildRecordSummary function
assert(content.includes('function buildRecordSummary()') || content.includes('function buildRecordSummary ('),
       'buildRecordSummary function exists');

// recordSummary div in game over overlay
assert(content.includes("id='recordSummary'") || content.includes('id="recordSummary"'),
       'recordSummary div exists in game over overlay');

// Color coding: X_COLOR for wins
assert(content.includes('var(--x-color)') && content.includes('buildRecordSummary'),
       'Wins display in X color (var(--x-color))');

// Color coding: O_COLOR for losses
assert(content.includes('var(--o-color)') && content.includes('buildRecordSummary'),
       'Losses display in O color (var(--o-color))');

// Color coding: text-secondary for draws
assert(content.includes('var(--text-secondary)') && content.includes('buildRecordSummary'),
       'Draws display in muted gray (var(--text-secondary))');

// showGameOver calls incrementRecord
var showGameOverFn = content.split('function showGameOver')[1]?.split('function')[0] || '';
assert(showGameOverFn && showGameOverFn.includes('incrementRecord'),
       'showGameOver calls incrementRecord to update score');

// showGameOver sets recordSummary display
assert(showGameOverFn && showGameOverFn.includes('recordSummary'),
       'showGameOver updates recordSummary display');

// restart clears recordSummary
var restartFn = content.split('function restart()')[1]?.split('function')[0] || '';
assert(restartFn && restartFn.includes('recordSummary'),
       'restart clears recordSummary');

// Initial setup loads record
var initSetup = (content.split('Initial Setup')[1] || '').split('\n    })();')[0] || '';
assert(initSetup && initSetup.includes('loadRecord()'),
       'Initial setup calls loadRecord');
assert(initSetup && initSetup.includes('updateRecordDisplay()'),
       'Initial setup calls updateRecordDisplay');
assert(initSetup && initSetup.includes('recordSummary.style.display'),
       'Initial setup hides recordSummary');

// Verify footer unchanged
assert(content.includes('© 2025 gameShelf — All games built in browser — no downloads required'),
       'Footer copyright text unchanged');

// Verify no changes to shared resources (check that script.js/styles.css are not referenced for game logic)
var externalScriptMatch = /<script[^>]*src\s*=\s*["'](?!\.\/|\.\.\/)([^"']+)["']/.test(content);
assert(!externalScriptMatch, 'No external script src links for game logic');

// Verify IIFE pattern
assert(content.includes('(function()') || content.includes('(function {'),
       'JS wrapped in IIFE');
assert(content.includes("'use strict'"), 'Strict mode enabled');

// ── Default record values on first visit ──
console.log('\n--- Default Record Values (First Visit) ---');

// Verify loadRecord initializes record to {wins:0, losses:0, draws:0}
var loadRecordFn = content.split('function loadRecord()')[1]?.split('function')[0] || '';
assert(loadRecordFn && loadRecordFn.includes("record = { wins: 0, losses: 0, draws: 0 }") ||
       loadRecordFn && loadRecordFn.includes("record.wins = 0") ||
       content.includes("record = { wins: 0, losses: 0, draws: 0 }"),
       'Record initialized to {wins:0, losses:0, draws:0}');

// Verify incrementRecord increments the correct counter
var incrementFn = content.split('function incrementRecord')[1]?.split('function')[0] || '';
assert(incrementFn && incrementFn.includes("result === 'X'") && incrementFn.includes('record.wins++'),
       'incrementRecord increments wins on X win');
assert(incrementFn && incrementFn.includes("result === 'O'") && incrementFn.includes('record.losses++'),
       'incrementRecord increments losses on O win');
assert(incrementFn && incrementFn.includes("else") && incrementFn.includes('record.draws++'),
       'incrementRecord increments draws on draw');

// ── Summary ──
console.log('\n' + '═'.repeat(50));
console.log('\nRESULTS: ' + passed + ' passed, ' + failed + ' failed\n');

if (failures.length > 0) {
  console.log('FAILURES:');
  failures.forEach(function(f, i) { console.log('  ' + (i + 1) + '. ' + f); });
}

process.exit(failed > 0 ? 1 : 0);
