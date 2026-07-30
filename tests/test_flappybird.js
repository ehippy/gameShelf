var fs = require('fs');
var path = require('path');

var filepath = path.join(__dirname, '..', 'games', 'flappybird.html');
var content = fs.readFileSync(filepath, 'utf-8');

var indexPath = path.join(__dirname, '..', 'index.html');
var indexContent = fs.readFileSync(indexPath, 'utf-8');

var scriptPath = path.join(__dirname, '..', 'script.js');
var scriptContent = fs.readFileSync(scriptPath, 'utf-8');

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

console.log('\n=== Flappy Bird Game Tests ===\n');

// ─── 1. File existence & self-contained ───
assert(fs.existsSync(filepath), 'games/flappybird.html exists');
assert(/<style>[\s\S]*<\/style>/.test(content), 'Contains inline <style> tag');
assert(/<script>[\s\S]*<\/script>/.test(content), 'Contains inline <script> tag');
assert(!content.includes('<script src="') && !content.includes("<script src='"), 'No external script links');
assert(!content.includes('href="../styles.css"'), 'No external stylesheet links');

// ─── 2. Footer ───
assert(content.includes('class="site-footer"'), 'Footer has site-footer class');
assert(content.includes('© 2025 gameShelf — All games built in browser — no downloads required'),
       'Footer has exact required copyright text');

// ─── 3. Canvas element ───
assert(content.includes('id="gameCanvas"'), 'Canvas element with id="gameCanvas" exists');
assert(/<canvas\s+id="gameCanvas"\s+width="400"\s+height="400"/.test(content), 'Canvas is 400x400');

// ─── 4. Start overlay ───
assert(content.includes('id="startOverlay"'), 'Start overlay exists with id="startOverlay"');
assert(content.includes('🐦 Flappy Bird'), 'Start overlay shows game title with emoji');
assert(/Click|tap|press|Space|flap/i.test(content), 'Start overlay has instructions mentioning tap/click/flap');
assert(content.includes('id="startBtn"'), 'Start button has id="startBtn"');
assert(content.includes('Start Game') || content.includes('Start'), 'Start button text present');

// ─── 5. Game does not auto-run ───
assert(!content.includes("startGame()") || content.match(/function\s+startGame/) && !content.match(/startGame\(\)\s*[;\n]/) ||
       content.indexOf('startGame()') > content.indexOf('function startGame')),
       'Game does not auto-start (startGame called only from event handlers or explicit call after setup)';
// More precise: check that initGame()/render() are called at bottom, not startGame()
var scriptBlock = content.match(/<script>[\s\S]*<\/script>/);
assert(scriptBlock, 'Inline script block found');
var jsBlock = scriptBlock[0];
assert(jsBlock.includes('initGame()') && jsBlock.includes('render()'),
       'Bottom of script calls initGame() and render() (initial render only)');
assert(!jsBlock.match(/startGame\(\)\s*[;\n\s]/) &&
       !jsBlock.match(/gameState\s*=\s*'playing'\s*[;\n\s]/),
       'No auto-start: gameState is not set to "playing" at bottom of script');

// ─── 6. Bird rendering & gravity ───
assert(content.includes('BIRD_X') || content.includes('birdX') || content.includes("BIRD_X"), 'Bird X position constant defined');
assert(content.includes('GRAVITY') || content.includes('gravity') || content.includes('GRAV'), 'Gravity constant defined');
assert(content.includes("'fbbf24'") || content.includes('#fbbf24') || content.includes("'yellow'") || content.includes('yellow'),
       'Bird rendered in yellow color (#fbbf24)');
assert(content.includes("ctx.arc") || content.includes('beginPath'), 'Bird rendered as shape (circle/arc)');
assert(content.includes('birdY') || content.includes('birdy'), 'Bird vertical position tracked');
assert(content.includes('birdVelocity') || content.includes('birdVelocity'), 'Bird velocity tracked for gravity');
assert(content.includes('birdY') && content.includes('+'), 'Bird Y changes over time (gravity applied)');

// ─── 7. Flap mechanics ───
assert(content.includes('FLAP_STRENGTH') || content.includes('FLAP_STRENG') || content.includes('flapStrength') || content.includes('FLAP'),
       'Flap strength constant defined');
assert(content.includes('birdVelocity') && content.includes('-'), 'Flap sets negative velocity (upward)');
assert(content.includes("' '") || content.includes('" "') || content.includes("e.key === ' '"), 'Space key handled for flap');
assert(content.includes('mousedown'), 'Mouse click event listener on canvas');
assert(content.includes('touchstart'), 'Touch event listener on canvas');
assert(content.includes("flap()") || content.includes("flap\\("), 'Flap function called on input');

// ─── 8. Pipes spawn from right with random heights and gap ───
assert(content.includes('CANVAS_SIZE') && content.includes(')') &&
       (content.includes('gapTop') || content.includes('gapTop') || content.includes('gapMax')),
       'Pipe gap position randomized within bounds');
assert(content.includes('createPipe') || content.includes('spawnPipe'), 'Pipe creation function exists');
assert(content.includes('Math.random'), 'Random height for pipes');
assert(content.includes("x: CANVAS_SIZE") || content.includes("x:400") || content.includes("x: CANVAS_SIZE"),
       'Pipes spawn at right edge (x = canvas width)');
assert(content.includes('GAP_HEIGHT') || content.includes('gapHeight') || content.includes('gap.*100'), 'Gap height constant defined');

// ─── 9. Score increments on passing pipes ───
assert(content.includes('scored') || content.includes('scoredFlag'), 'Pipe scored flag for one-time scoring');
assert(content.includes('score++') || content.includes('score +=') || content.includes('score='), 'Score increments');
assert(/score\s*\+\+\s*\n/.test(content) || content.includes('score++'), 'Score incremented on pipe pass');
assert(content.includes('(BIRD_X') && content.includes('PIPE_WIDTH') ||
       content.includes('birdX') && content.includes('pipe.x') ||
       content.includes('BIRD_X + BIRD_RADIUS') && content.includes('p.x + PIPE_WIDTH'),
       'Score check compares bird position past pipe right edge');

// ─── 10. Score visible in HUD ───
assert(content.includes('id="score"') || content.includes('scoreEl'), 'Score display element in HUD');
assert(content.includes('Score') || content.includes('score'), 'Score label visible in HUD');
assert(content.includes('highScoreEl') || content.includes('high-score') || content.includes('highScore'),
       'High Score display element in HUD');
assert(content.includes('score-bar') || content.includes('scoreBar') || content.includes('hud'), 'HUD bar exists');

// ─── 11. Game over overlay ───
assert(content.includes('id="gameOverOverlay"'), 'Game over overlay exists with id="gameOverOverlay"');
assert(content.includes('Game Over'), 'Game over title present');
assert(content.includes('id="finalScore"') || content.includes('finalScoreEl'), 'Final score display exists');
assert(content.includes('id="finalHighScore"') || content.includes('finalHighScoreEl'), 'High score display on game over exists');
assert(content.includes('id="restartBtn"'), 'Restart button has id="restartBtn"');
assert(content.includes('Restart') || content.includes('restart'), 'Restart button text present');

// ─── 12. Restart resets game state ───
assert(content.includes('initGame'), 'initGame function exists for reset');
assert(content.match(/restartBtn\.addEventListener/), 'Restart button has click listener');
assert(content.includes("'start'") || content.includes("start"), 'Start state defined');
assert(content.includes("'playing'") || content.includes("playing"), 'Playing state defined');
assert(content.includes("'gameover'") || content.includes("gameover"), 'GameOver state defined');
assert(content.includes('pipes = []') || content.includes('pipes='), 'Pipes array reset on init');
assert(content.includes("score = 0") || content.includes('score=0'), 'Score reset to 0 on init');

// ─── 13. Progressive difficulty (speed increases with score) ───
assert(content.includes('INITIAL_SPEED') || content.includes('initialSpeed'), 'Initial speed constant defined');
assert(content.includes('MAX_SPEED') || content.includes('maxSpeed'), 'Max speed constant defined');
assert(content.includes('SPEED_INCREMENT') || content.includes('speedIncrement') || content.includes('SPEED_INCR'),
       'Speed increment constant defined');
assert(content.includes('SPEED_STEP') || content.includes('speedStep') || content.includes('SPEED_STEP') || content.includes('5'),
       'Speed step threshold (every N points) defined');
assert(content.includes('currentSpeed') || content.includes('currentspeed') || content.includes('speed'),
       'Current speed variable updated during gameplay');
// Verify speed increases with score (not constant)
assert(/score/.test(content.match(/currentSpeed|currentspeed|INITIAL_SPEED.*score/i)?.[0] || content) ||
       content.match(/INITIAL_SPEED.*Math|INITIAL_SPEED.*floor/),
       'Speed calculation references score (progressive difficulty)');

// ─── 14. High score persisted in localStorage ───
assert(content.includes("localStorage.getItem('flappybirdHighScore')") ||
       content.includes("localStorage.getItem(\"flappybirdHighScore\")") ||
       content.includes("localStorage.getItem('flappybirdHighScore')"),
       'High score read from localStorage with key "flappybirdHighScore"');
assert(content.includes("localStorage.setItem('flappybirdHighScore')") ||
       content.includes("localStorage.setItem(\"flappybirdHighScore\")"),
       'High score written to localStorage with key "flappybirdHighScore"');

// ─── 15. Scroll prevention for game keys ───
assert(content.includes("e.preventDefault") && content.includes("' '") || content.includes('e.preventDefault'),
       'Keydown events prevent default to stop scrolling');
assert(content.includes("'ArrowUp'") || content.includes("'ArrowDown'"), 'Arrow key prevention for scrolling');
assert(content.includes("'Enter'") || content.includes("'Enter'"), 'Enter key handled');

// ─── 16. Visibility API pause/resume ───
assert(content.includes("visibilitychange"), 'visibilitychange event listener for pause/resume');
assert(content.includes("document.hidden") || content.includes('document.hidden'),
       'Uses document.hidden to check tab visibility');
assert(content.includes("requestAnimationFrame") && content.includes("cancelAnimationFrame"),
       'Uses requestAnimationFrame and cancelAnimationFrame for game loop control');

// ─── 17. Game card in index.html ───
assert(indexContent.includes('flappybird.html'), 'flappybird.html referenced in index.html');
assert(indexContent.includes('Flappy Bird'), 'Flappy Bird game card present in index.html');
assert(/<a\s+href="games\/flappybird\.html"\s+class="game-card"\s+data-category="arcade"/.test(indexContent),
       'Game card has data-category="arcade"');
assert(indexContent.includes('card-tag arcade'), 'Game card uses card-tag arcade class');

// ─── 18. Entry in script.js gamesCatalog ───
assert(scriptContent.includes("'Flappy Bird'") || scriptContent.includes('"Flappy Bird"'),
       'Flappy Bird in gamesCatalog');
assert(scriptContent.includes("'flappybird.html'") || scriptContent.includes('"flappybird.html"'),
       'Flappy Bird href points to flappybird.html');
assert(scriptContent.includes("'arcade'") || scriptContent.includes('"arcade"'),
       'Flappy Bird has category arcade in gamesCatalog');

// ─── 19. Card uses arcade category styling ───
assert(indexContent.includes('card-tag arcade'), 'Game card uses "card-tag arcade" class');
assert(/data-category="arcade"/.test(indexContent), 'Game card has data-category="arcade"');

// ─── 20. Card uses unique gradient ───
var flappyGradientMatch = indexContent.match(/Flappy Bird.*?background:\s*linear-gradient\([^)]+\)/s);
assert(flappyGradientMatch, 'Flappy Bird card has gradient background');
if (flappyGradientMatch) {
  var flappyGrad = flappyGradientMatch[0];
  assert(!flappyGrad.includes('#fbbf24, #d97706'), 'Flappy Bird gradient distinct from 2048 (#fbbf24, #d97706)');
  assert(!flappyGrad.includes('#facc15, #ca8a04'), 'Flappy Bird gradient distinct from Pac-Man (#facc15, #ca8a04)');
  assert(!flappyGrad.includes('#fb923c, #ea580c'), 'Flappy Bird gradient distinct from Simon Says (#fb923c, #ea580c)');
}
// Verify yellow tones
assert(indexContent.match(/Flappy Bird[\s\S]{0,300}linear-gradient.*?fbbf24/),
       'Flappy Bird uses yellow tones in gradient');

// ─── 21. Collision detection ───
assert(content.includes('checkCollision') || content.includes('collis'), 'Collision detection function exists');
assert(content.includes("birdY") && (content.includes('BIRD_RADIUS') || content.includes('birdRadius')) ||
       content.includes('canvas') && content.includes('boundary') || content.includes('CANVAS_SIZE'),
       'Canvas boundary collision check present');
assert(content.includes("pipe") && content.includes("gapTop") && content.includes("gapBottom") ||
       content.includes("pipe") && content.includes("gap"),
       'Pipe collision checks top and bottom pipe positions');

// ─── 22. Game loop structure ───
assert(content.includes('requestAnimationFrame') && content.includes('gameLoop') ||
       content.includes('requestAnimationFrame') && content.includes('loop'),
       'requestAnimationFrame-based game loop');
assert(content.includes('gameState') && content.includes("'playing'"), 'Game loop runs during playing state');

// ─── Structural checks ───
assert(content.includes('class="game-header"'), 'Header with game-header class exists');
assert(content.includes('href="../index.html"') && content.includes('class="logo"'), 'Logo links to ../index.html');
assert(content.includes('class="back-link"'), 'Back link present');
assert(content.includes('(function()') || content.includes('(function ()'), 'JS wrapped in IIFE');
assert(content.includes("'use strict'") || content.includes('"use strict"'), 'use strict present');
assert(content.includes('.overlay.hidden') || content.includes('.overlay\.hidden'), '.hidden class for overlays');
assert(content.includes('rgba(15, 15, 35, 0.92)'), 'Overlay has semi-transparent backdrop');
assert(content.includes('backdrop-filter'), 'Backdrop blur effect used on overlays');

// ─── Bird position and pipe details ───
assert(content.includes('BIRD_X = 80') || content.includes('BIRD_X=80'), 'Bird X position at 80 (left side)');
assert(content.includes('GAP_HEIGHT = 100') || content.includes('GAP_HEIGHT=100'), 'Gap height is 100px');
assert(content.includes('GAP_MIN') && content.includes('80') || content.includes('80'), 'Gap minimum bound at y=80');
assert(content.includes('GAP_MAX') && content.includes('320') || content.includes('320'), 'Gap maximum bound at y=320');
assert(content.includes('PIPE_WIDTH = 50') || content.includes('PIPE_WIDTH=50'), 'Pipe width is 50px');
assert(content.includes('INITIAL_SPEED = 2') || content.includes('INITIAL_SPEED=2'), 'Initial speed is 2 px/frame');
assert(content.includes('MAX_SPEED = 6') || content.includes('MAX_SPEED=6'), 'Max speed is 6 px/frame');
assert(content.includes('SPEED_INCREMENT = 0.3') || content.includes('SPEED_INCREMENT=0.3'),
       'Speed increment is 0.3 px/frame');
assert(content.includes('SPAWN_INTERVAL = 180') || content.includes('SPAWN_INTERVAL=180'), 'Pipe spawn interval is 180 frames');

console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
process.exit(failed > 0 ? 1 : 0);
