var fs = require('fs');
var path = require('path');

var filepath = path.join(__dirname, '..', 'games', 'whackamole.html');
var content = fs.readFileSync(filepath, 'utf-8');

var passed = 0;
var failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log('  ✅ ' + message);
    passed++;
  } else {
    console.log('  ❌ ' + message);
    failed++;
  }
}

console.log('\n=== Whack-a-Mole Game Tests ===\n');

// 1. File existence
assert(fs.existsSync(filepath), 'games/whackamole.html exists');

// 2. Self-contained (inline CSS and JS)
assert(/<style>[\s\S]*<\/style>/.test(content), 'Contains inline <style> tag');
assert(/<script>[\s\S]*<\/script>/.test(content), 'Contains inline <script> tag');
assert(!content.includes('<script src="'), 'No external script links');
assert(!content.includes('href="../styles.css"'), 'No external stylesheet links');

// 3. Canvas element
assert(content.includes('id="gameCanvas"'), 'Canvas element with id="gameCanvas" exists');
assert(/<canvas\s+id="gameCanvas"\s+width="400"\s+height="400"/.test(content), 'Canvas is 400x400');

// 4. Game title
assert(content.includes('Whack-a-Mole'), 'Game title "Whack-a-Mole" present');
assert(content.includes('<title>gameShelf — Whack-a-Mole</title>'), 'Page title correct');

// 5. Start overlay
assert(content.includes('id="startOverlay"'), 'Start overlay exists');
assert(content.includes('start-overlay'), 'Start overlay class present');
assert(content.includes('Start Game'), 'Start button text present');
assert(content.includes('id="startBtn"'), 'Start button has id="startBtn"');
assert(/startOverlay.*classList.*remove|remove.*startOverlay/.test(content), 'Start overlay hides on start');

// 6. Game over overlay
assert(content.includes('id="gameOverOverlay"'), 'Game over overlay exists');
assert(content.includes('id="gameOverTitle"'), 'Game over title element exists');
assert(content.includes('id="gameOverSubtitle"'), 'Game over subtitle element exists');
assert(content.includes('Play Again'), 'Restart button text present');
assert(content.includes('id="restartBtn"'), 'Restart button has id="restartBtn"');

// 7. HUD elements
assert(content.includes('id="scoreDisplay"'), 'Score display exists');
assert(content.includes('id="timeDisplay"'), 'Time display exists');
assert(content.includes('id="highScoreDisplay"'), 'High score display exists');

// 8. Canvas click handler (mouse support)
assert(content.includes("canvas.addEventListener('click'"), 'Canvas click event listener exists');
assert(content.includes('e.preventDefault'), 'Click handler prevents default');
assert(content.includes('getBoundingClientRect'), 'Uses getBoundingClientRect for coordinate mapping');
assert(content.includes('Math.floor(clickX') || content.includes('Math.floor(clickX'), 'Maps click X to grid');
assert(content.includes('Math.floor(clickY') || content.includes('Math.floor(clickY'), 'Maps click Y to grid');
assert(content.includes('clamped') || content.includes('Math.max') || content.includes('Math.min'), 'Clicks clamped to grid bounds');

// 9. Game logic - whackMole function
assert(content.includes('function whackMole'), 'whackMole function exists');
assert(content.includes('board') && content.includes('isUp'), 'Checks board state and isUp flag');
assert(content.includes('score') && content.includes('++'), 'Score increments on whack');

// 10. Game state machine
assert(content.includes("'start'"), 'Start state defined');
assert(content.includes("'playing'"), 'Playing state defined');
assert(content.includes("'gameover'"), 'GameOver state defined');
assert(content.includes("gameState === 'start'"), 'Checks start state');
assert(content.includes("gameState === 'playing'"), 'Checks playing state');
assert(content.includes("gameState === 'gameover'"), 'Checks gameover state');

// 11. Timer and scoring
assert(content.includes('setInterval'), 'setInterval for game timer');
assert(content.includes('timeLeft'), 'timeLeft variable tracked');
assert(content.includes('GAME_DURATION'), 'Game duration constant defined');
assert(content.includes('localStorage'), 'localStorage for high score');
assert(content.includes('localStorage.getItem'), 'Reads high score from localStorage');
assert(content.includes('localStorage.setItem'), 'Writes high score to localStorage');

// 12. Spawn logic
assert(content.includes('spawnMole'), 'spawnMole function exists');
assert(content.includes('MOLE_SHOW_TIME'), 'Mole show time constant');
assert(content.includes('MOLE_SPAWN_INTERVAL'), 'Spawn interval constant');
assert(content.includes('clearTimeout'), 'Mole timer can be cleared');

// 13. Start overlay blocks clicks during start
assert(content.includes("if (gameState !== 'playing') return") && 
       content.indexOf("canvas.addEventListener('click'") < content.indexOf("if (gameState !== 'playing') return"),
       'Click handler ignores non-playing state');

// 14. Game over overlay blocks clicks during gameover
assert(/if \(gameState !== 'playing'\) return/.test(content), 'Click handler guards against non-playing state');

// 15. Keyboard support for overlays
assert(content.includes("'Enter'") && content.includes("' '"), 'Keyboard Enter/Space supported for overlays');

// 16. Button event listeners
assert(/startBtn\.addEventListener/.test(content), 'Start button has click listener');
assert(/restartBtn\.addEventListener/.test(content), 'Restart button has click listener');

// 17. Footer structure
assert(content.includes('class="site-footer"'), 'Footer with site-footer class exists');
assert(content.includes('© 2025 gameShelf — All games built in browser — no downloads required'), 
       'Footer has consistent copyright text');
assert(content.includes('href="../index.html"'), 'Footer links to ../index.html');

// 18. Header structure
assert(content.includes('class="game-header"'), 'Header with game-header class exists');
assert(content.includes('href="../index.html"') && content.includes('class="logo"'), 'Logo links to ../index.html');
assert(content.includes('class="back-link"'), 'Back link present');

// 19. IIFE and strict mode
assert(content.includes('(function()'), 'JS wrapped in IIFE');
assert(content.includes("'use strict'"), 'use strict present');

// 20. Canvas cursor
assert(content.includes('cursor: crosshair'), 'Canvas has crosshair cursor');

// 21. Overlay backdrop styling
assert(content.includes('rgba(15, 15, 35, 0.92)'), 'Overlay has semi-transparent backdrop');
assert(content.includes('.overlay.hidden') || content.includes('.overlay\.hidden'), '.hidden class defined');
assert(content.includes('backdrop-filter'), 'Backdrop blur effect used');

// 22. Game registration in index.html
var indexPath = path.join(__dirname, '..', 'index.html');
var indexContent = fs.readFileSync(indexPath, 'utf-8');
assert(indexContent.includes('whackamole.html'), 'whackamole.html referenced in index.html');

console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
process.exit(failed > 0 ? 1 : 0);
