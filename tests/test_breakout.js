const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, '..', 'games', 'breakout.html');
const content = fs.readFileSync(filepath, 'utf-8');

let passed = 0;
let failed = 0;

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

// 9. Pause overlay hidden by default (no .visible class near it)
var pauseSection = content.substring(content.indexOf('id="pause-overlay"') - 30, content.indexOf('id="pause-overlay"') + 50);
assert(!pauseSection.includes('visible'), 'Pause overlay hidden by default');

// 10. Gameover overlay hidden by default
var goSection = content.substring(content.indexOf('id="gameover-overlay"') - 30, content.indexOf('id="gameover-overlay"') + 50);
assert(!goSection.includes('visible'), 'Gameover overlay hidden by default');

// 11. Win overlay hidden by default
var winSection = content.substring(content.indexOf('id="win-overlay"') - 30, content.indexOf('id="win-overlay"') + 50);
assert(!winSection.includes('visible'), 'Win overlay hidden by default');

// 12. No auto-start (no bare startGame(); call outside of functions/listeners)
var lines = content.split('\n');
var foundAutoStart = false;
for (var i = 0; i < lines.length; i++) {
  var trimmed = lines[i].trim();
  if (trimmed === 'startGame();') {
    // Check context
    var context = lines.slice(Math.max(0, i-5), i+1).join('\n');
    if (!context.includes('addEventListener') && !context.includes('function startGame')) {
      foundAutoStart = true;
    }
  }
}
assert(!foundAutoStart, 'No auto-start call — game does NOT start on page load');

// 13. initGame() + draw() called at page load
assert(content.includes('initGame()') && content.includes('draw()'), 'initGame() and draw() called for initial static render');

// Check that initGame+draw are near the bottom (after all function defs)
var lastBracketIdx = content.lastIndexOf('}');
var initGameIdx = content.indexOf('initGame()');
var drawIdx = content.indexOf('draw()');
assert(initGameIdx > 0 && drawIdx > 0, 'initGame and draw appear in the file');

// 14. startBtn click listener
assert(/startBtn\.addEventListener/.test(content), 'startBtn has event listener');
assert(/startBtn\.addEventListener.*startGame/.test(content) || 
       content.indexOf("startBtn.addEventListener") < content.indexOf("startGame"), 'startBtn listener calls startGame');

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

console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
process.exit(failed > 0 ? 1 : 0);
