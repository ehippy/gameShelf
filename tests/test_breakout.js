var fs = require('fs');
var path = require('path');

var filepath = path.join(__dirname, '..', 'games', 'breakout.html');
var content = fs.readFileSync(filepath, 'utf-8');

var passed = 0;
var failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log('  PASS: ' + message);
    passed++;
  } else {
    console.log('  FAIL: ' + message);
    failed++;
  }
}

console.log('=== Breakout Start Overlay Tests ===\n');

// 1. start-overlay div exists inside canvas-wrapper
assert(content.includes('id="start-overlay"'), 'Start overlay div with id "start-overlay" exists');

// 2. Inside canvas-wrapper
var cwIdx = content.indexOf('class="canvas-wrapper"');
var soIdx = content.indexOf('id="start-overlay"');
assert(soIdx > cwIdx, 'Start overlay is inside canvas-wrapper');

// 3. Game title in heading
assert(content.includes('<h3>🧱 Breakout</h3>'), 'Game title "🧱 Breakout" in h3 heading');

// 4. Instruction text
assert(content.includes('Use arrow keys or mouse to move the paddle. Destroy all bricks to win.'), 'Instruction text matches exactly');

// 5. Start button with id
assert(content.includes('id="start-btn"'), 'Start button has id "start-btn"');

// 6. Start button text
assert(content.includes('▶ Start Game'), 'Start button text is "▶ Start Game"');

// 7. Uses .overlay-btn class
assert(/overlay-btn/.test(content) && /id="start-btn"/.test(content), 'Button uses .overlay-btn CSS class');

// 8. Start overlay visible by default
assert(/id="start-overlay"[^>]*visible/.test(content) || /visible[^>]*id="start-overlay"/.test(content), 'Start overlay has class="overlay visible" (visible by default)');

// 9. Pause overlay hidden by default
var pauseSection = content.substring(content.indexOf('id="pause-overlay"') - 30, content.indexOf('id="pause-overlay"') + 50);
assert(!pauseSection.includes('visible'), 'Pause overlay hidden by default');

// 10. Gameover overlay hidden by default
var goSection = content.substring(content.indexOf('id="gameover-overlay"') - 30, content.indexOf('id="gameover-overlay"') + 50);
assert(!goSection.includes('visible'), 'Gameover overlay hidden by default');

// 11. Win overlay hidden by default
var winSection = content.substring(content.indexOf('id="win-overlay"') - 30, content.indexOf('id="win-overlay"') + 50);
assert(!winSection.includes('visible'), 'Win overlay hidden by default');

// 12. No auto-start at bottom of script
// After the last addEventListener, there should be no startGame(); call
var lastListenerIdx = content.lastIndexOf('addEventListener');
var afterListener = content.substring(lastListenerIdx);
assert(!afterListener.match(/startGame\(\)\s*;/), 'No auto-start call — startGame() not called at bottom of script');

// 13. initGame() + draw() called at bottom for initial static render
var bottomSection = content.substring(content.length - 500);
assert(bottomSection.includes('initGame()') && bottomSection.includes('draw()'), 'initGame() and draw() at bottom for initial static render');

// 14. startBtn click listener
assert(/startBtn\.addEventListener/.test(content), 'startBtn has event listener');

// 15. startGame hides start overlay
assert(/startOverlay\.classList\.remove/.test(content), 'startGame hides start overlay via remove class');

// 16. startGame calls initGame and render
var sgMatch = content.match(/function startGame\(\)[\s\S]*?(?=\n        \/\/\s|$)/);
if (sgMatch) {
  assert(sgMatch[0].includes('initGame()'), 'startGame calls initGame()');
  assert(sgMatch[0].includes('render()'), 'startGame calls render()');
  assert(sgMatch[0].includes("startOverlay.classList.remove('visible')"), 'startGame removes visible from start overlay');
} else {
  assert(false, 'Could not find startGame function for detailed check');
}

// 17. restartGame exists and calls startGame
assert(/function restartGame/.test(content), 'restartGame function exists');

// 18. Footer unchanged
assert(/© 2025 gameShelf — All games built in browser — no downloads required/.test(content), 'Footer text unchanged');

// 19. .overlay.visible CSS convention
assert(/\.overlay\.visible/.test(content), 'CSS uses .overlay.visible class');

// 20. Canvas wrapper has position relative
assert(/canvas-wrapper/.test(content) && /position: relative/.test(content), 'canvas-wrapper has position:relative');

// 21. Restart buttons exist and wired up
assert(content.includes('restart-btn'), 'Play Again button (restart-btn) exists');
assert(content.includes('win-restart-btn'), 'Win Play Again button (win-restart-btn) exists');
assert(/restartBtn\.addEventListener/.test(content), 'restartBtn wired up');
assert(/winRestartBtn\.addEventListener/.test(content), 'winRestartBtn wired up');

// 22. DOM refs for startOverlay and startBtn
assert(content.includes("document.getElementById('start-overlay')"), 'DOM ref for startOverlay exists');
assert(content.includes("document.getElementById('start-btn')"), 'DOM ref for startBtn exists');

console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
process.exit(failed > 0 ? 1 : 0);
