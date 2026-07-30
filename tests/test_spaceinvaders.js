'use strict';

var fs = require('fs');
var path = require('path');
var { execSync } = require('child_process');

var spaceInvadersPath = path.join(__dirname, '..', 'games', 'spaceinvaders.html');
var rootIndexPath = path.join(__dirname, '..', 'index.html');
var scriptPath = path.join(__dirname, '..', 'script.js');

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

console.log('\n=== Space Invaders — Acceptance Criteria Tests ===\n');

// ── Read files ──
var si = fs.readFileSync(spaceInvadersPath, 'utf8');
var rootIndex = fs.readFileSync(rootIndexPath, 'utf8');
var scriptContent = fs.readFileSync(scriptPath, 'utf8');

// ════════════════════════════════════════════════════════════
// 1. File existence & self-contained
// ════════════════════════════════════════════════════════════
console.log('--- File Existence & Self-Contained ---');

assert(fs.existsSync(spaceInvadersPath), 'File games/spaceinvaders.html exists');
assert(si.includes('<link rel="stylesheet" href="../styles.css">'), 'HTML links shared styles via <link rel="stylesheet" href="../styles.css">');

// No external JS files (inline only)
assert(!si.includes('<script src="'), 'No external JS <script src> links');

// ════════════════════════════════════════════════════════════
// 2. Canvas 400×400 + requestAnimationFrame
// ════════════════════════════════════════════════════════════
console.log('\n--- Canvas & Game Loop ---');

assert(si.match(/<canvas\s+id="gameCanvas"\s+width="400"\s+height="400"/),
       'Canvas is 400×400 with id="gameCanvas"');
assert(si.includes('requestAnimationFrame'), 'Game uses requestAnimationFrame for game loop');

// ════════════════════════════════════════════════════════════
// 3. Start overlay with title + ▶ Start Game button
// ════════════════════════════════════════════════════════════
console.log('\n--- Start Overlay ---');

assert(si.includes('id="startOverlay"'), 'Start overlay element exists');
assert(si.includes('👾 Space Invaders'), 'Start overlay has title "👾 Space Invaders"');
assert(si.includes('▶ Start Game'), 'Start overlay has ▶ Start Game button');
assert(si.match(/\.overlay\s*\{/), 'Overlay has .overlay CSS class');
assert(si.match(/\.overlay\.hidden\s*\{[\s\S]*?display:\s*none/),
       'Overlay has .hidden class that sets display:none');

// ════════════════════════════════════════════════════════════
// 4. Game-over overlay with final score + restart button
// ════════════════════════════════════════════════════════════
console.log('\n--- Game Over Overlay ---');

assert(si.includes('id="gameOverOverlay"'), 'Game-over overlay element exists');
assert(si.includes('id="finalScore"'), 'Game-over overlay has final score element');
assert(si.includes('id="finalHighScore"'), 'Game-over overlay has high score element');
assert(si.includes('Play Again'), 'Game-over overlay has restart button with "Play Again" text');
assert(si.match(/\.overlay\.hidden\s*\{/), 'Game-over overlay starts hidden via .hidden class');

// ════════════════════════════════════════════════════════════
// 5. Player ship rendered at bottom + left/right movement
// ════════════════════════════════════════════════════════════
console.log('\n--- Player Ship & Movement ---');

assert(si.includes('drawPlayer') || si.match(/ctx\.moveTo[\s\S]*?ctx\.lineTo/),
       'Player ship is drawn on canvas');
assert(si.includes('PLAYER_ROW') && (si.includes('player.y = PLAYER_ROW') || si.includes('y: PLAYER_ROW') || si.includes('y = PLAYER_ROW')),
       'Player position is set near bottom of canvas via PLAYER_ROW');
assert(si.includes("e.key === 'ArrowLeft'") || si.includes('ArrowLeft'),
       'ArrowLeft key is handled for left movement');
assert(si.includes("e.key === 'ArrowRight'") || si.includes('ArrowRight'),
       'ArrowRight key is handled for right movement');
assert(si.includes('keysDown'), 'Keyboard state tracked with keysDown object');

// ════════════════════════════════════════════════════════════
// 6. Single upward bullet with Space key
// ════════════════════════════════════════════════════════════
console.log('\n--- Player Bullet ---');

assert(si.includes("e.key === ' '") || si.includes('Space'),
       'Space key is handled for shooting');
assert(si.includes('!playerBullet') || si.includes('playerBullet == null') ||
       si.includes('playerBullet === null'),
       'One bullet at a time — prevents firing when bullet already exists');
assert(si.includes('playerBullet') || si.includes('BULLET_SPEED'),
       'Player bullet moves upward');

// ════════════════════════════════════════════════════════════
// 7. Multiple alien rows (at least 3) + horizontal movement + edge reversal + step down
// ════════════════════════════════════════════════════════════
console.log('\n--- Alien Rows & Movement ---');

// Check for at least 3 rows
var rowMatch = si.match(/ALIEN_ROWS\s*=\s*(\d+)/);
assert(rowMatch && parseInt(rowMatch[1]) >= 3,
       'At least 3 alien rows defined (got ' + (rowMatch ? rowMatch[1] : 'none') + ')');

// Check columns 5-10
var colMatch = si.match(/ALIEN_COLS\s*=\s*(\d+)/);
assert(colMatch && parseInt(colMatch[1]) >= 5 && parseInt(colMatch[1]) <= 10,
       'Alien columns between 5-10 (got ' + (colMatch ? colMatch[1] : 'none') + ')');

assert(si.includes('alienDir'), 'Alien direction variable exists for horizontal movement');
assert(si.match(/alienDir\.x\s*\*\=\s*-1/), 'Alien direction reverses at edges (alienDir.x *= -1)');
assert(si.includes('y +=') || si.includes('y +='), 'Aliens step downward on edge hit');

// ════════════════════════════════════════════════════════════
// 8. Alien bullets fire downward from random aliens at increasing rate
// ════════════════════════════════════════════════════════════
console.log('\n--- Alien Bullets ---');

assert(si.includes('alienBullets'), 'Alien bullets array exists');
assert(si.includes('updateAlienBullets'), 'Alien bullets update function exists');
assert(si.includes('getAlienBulletRate') || si.includes('bulletRate'),
       'Alien bullet rate is calculated and varies over time');
assert(si.includes('Math.random()'), 'Alien bullet source is randomized');
assert(si.includes('ALIEN_BULLET_SPEED') || si.match(/alien.*\.y\s*\+/),
       'Alien bullets move downward');

// ════════════════════════════════════════════════════════════
// 9. Three distinct alien types with colors, shapes, point values 10/20/30
// ════════════════════════════════════════════════════════════
console.log('\n--- Alien Types (Colors, Shapes, Points) ---');

assert(si.includes("pointValues") || si.includes('points'), 'Aliens have point values');
assert(si.match(/\b30\b/), '30-point alien type defined');
assert(si.match(/\b20\b/), '20-point alien type defined');
assert(si.match(/\b10\b/), '10-point alien type defined');

// Different colors for different rows
assert(si.includes('row === 0') || si.match(/row ===\s*0/), 'Row 0 check exists for top alien type');
assert(si.includes('row === 1') || si.match(/row ===\s*1/), 'Row 1 check exists for middle alien type');

// Different colors used
var colorMatches = si.match(/#[0-9a-fA-F]{3,6}/g) || [];
assert(colorMatches.length >= 3, 'Multiple different colors used for alien types (found ' + colorMatches.length + ')');

// Pixel-art-style drawing with canvas rects
assert(si.includes('ctx.fillRect'), 'Aliens drawn with canvas fillRect (pixel-art style)');

// ════════════════════════════════════════════════════════════
// 10. 3 lives; losing resets position but preserves score
// ════════════════════════════════════════════════════════════
console.log('\n--- Lives & Scoring ---');

assert(si.includes('var lives = 3') || si.match(/lives\s*=\s*3/),
       'Player starts with 3 lives');
assert(si.includes('loseLife') || si.includes('lose lives'), 'Life loss function exists');
assert(si.includes('player.x = ') || si.includes('player.x='),
       'Losing a life resets player position');
assert(si.includes('scoreDisplay') && si.match(/score\s*\+\=/),
       'Score updates when aliens are hit');

// ════════════════════════════════════════════════════════════
// 11. Lives displayed in HUD bar above canvas
// ════════════════════════════════════════════════════════════
console.log('\n--- HUD Bar ---');

assert(si.includes('id="livesDisplay"'), 'Lives display element exists in HUD');
assert(si.includes('❤️') || si.includes('❤❤❤') || si.includes('heart'),
       'Lives displayed with hearts (emoji or text)');
assert(si.includes('id="scoreDisplay"'), 'Score display element exists in HUD');
assert(si.includes('hud-bar') || si.includes('hudBar'), 'HUD bar element exists');

// ════════════════════════════════════════════════════════════
// 12. Score displayed in HUD and updates correctly
// ════════════════════════════════════════════════════════════
console.log('\n--- Score HUD ---');

assert(si.match(/scoreDisplay\.textContent\s*=\s*['"]Score:/),
       'Score is displayed in HUD with "Score: X" format');
assert(si.includes('score +='), 'Score increments on alien hit');

// ════════════════════════════════════════════════════════════
// 13. High score persisted in localStorage + shown on game-over
// ════════════════════════════════════════════════════════════
console.log('\n--- High Score (localStorage) ---');

assert(si.includes("'spaceInvadersHighScore'"),
       'High score persisted under key "spaceInvadersHighScore"');
assert(si.includes('localStorage.getItem'), 'High score read from localStorage');
assert(si.includes('localStorage.setItem'), 'High score written to localStorage');
assert(si.includes('finalHighScore') || si.includes('highScore'),
       'High score shown on game-over overlay');

// ════════════════════════════════════════════════════════════
// 14. Difficulty: speed = baseSpeed × totalAliens / remainingAliens
// ════════════════════════════════════════════════════════════
console.log('\n--- Difficulty Escalation ---');

assert(si.includes('BASE_ALIEN_SPEED') || si.includes('baseSpeed') || si.includes('baseSpeed'),
       'Base alien speed constant defined');
assert(si.includes('totalAliens') || si.match(/total.*alien/i),
       'Total alien count tracked for difficulty');
assert(si.includes('remaining') || si.match(/remaining.*alien/i) ||
       si.includes('alive.length'),
       'Remaining alien count tracked for difficulty');
assert(si.includes('* (' + 'totalAliens' + ' / ' + 'remaining') ||
       si.match(/BASE_ALIEN_SPEED.*totalAliens.*\/.*remaining/),
       'Speed formula uses baseSpeed × (totalAliens / remainingAliens)');

// ════════════════════════════════════════════════════════════
// 15. Wave progression: new wave after all aliens cleared, no separate win screen
// ════════════════════════════════════════════════════════════
console.log('\n--- Wave Progression ---');

assert(si.includes('wave++') || si.includes('wave += 1'), 'Wave counter increments');
assert(si.includes('initAliens') || si.match(/init.*alien/i), 'Aliens re-initialized for new wave');
assert(!si.includes('winOverlay') && !si.includes('win-screen'),
       'No separate win screen — game continues to next wave');

// ════════════════════════════════════════════════════════════
// 16. Footer exact text
// ════════════════════════════════════════════════════════════
console.log('\n--- Footer ---');

assert(si.includes('© 2025 gameShelf — All games built in browser — no downloads required'),
       'Footer contains exact required text');
assert(si.includes('class="site-footer"'), 'Footer uses site-footer class');

// ════════════════════════════════════════════════════════════
// 17. Scroll prevention for arrow keys and space
// ════════════════════════════════════════════════════════════
console.log('\n--- Keyboard Scroll Prevention ---');

assert(si.includes('e.preventDefault()') &&
       (si.includes('ArrowLeft') && si.includes('ArrowRight')),
       'Arrow keys prevent default scrolling');
assert(si.includes('e.preventDefault()') && (si.includes("' '") || si.includes('" "')),
       'Space key prevents default scrolling');

// ════════════════════════════════════════════════════════════
// 18. Card entry in index.html
// ════════════════════════════════════════════════════════════
console.log('\n--- Registration: index.html Card Entry ---');

assert(rootIndex.includes('games/spaceinvaders.html'),
       'index.html has href="games/spaceinvaders.html"');
assert(rootIndex.match(/href="games\/spaceinvaders\.html".*data-category="arcade"/) ||
       rootIndex.match(/data-category="arcade".*href="games\/spaceinvaders\.html"/),
       'Card entry has data-category="arcade"');
assert(rootIndex.includes('Space Invaders'), 'Card has "Space Invaders" title');
assert(rootIndex.match(/card-thumb.*22d3ee.*0891b2/) ||
       rootIndex.match(/card-thumb.*0891b2.*22d3ee/) ||
       rootIndex.includes('22d3ee'), 'Card has space-invader-themed cyan gradient');
assert(rootIndex.includes('thumb-icon') && rootIndex.includes('👾'),
       'Card has 👾 emoji in thumb icon');
assert(rootIndex.match(/card-desc/), 'Card has description');

// ════════════════════════════════════════════════════════════
// 19. Entry in window.gamesCatalog
// ════════════════════════════════════════════════════════════
console.log('\n--- Registration: gamesCatalog in script.js ---');

var catalogMatch = scriptContent.match(/name:\s*['"]Space Invaders['"]/);
assert(catalogMatch !== null, 'gamesCatalog has "Space Invaders" entry');

// Verify correct structure
var entryMatch = scriptContent.match(/{\s*name:\s*['"]Space Invaders['"]\s*,\s*href:\s*['"]spaceinvaders\.html['"]\s*,\s*category:\s*['"]arcade['"]/);
assert(entryMatch !== null, 'Catalog entry has correct structure: {name, href, category}');

// ════════════════════════════════════════════════════════════
// 20. What's new list: 5 entries, new one added
// ════════════════════════════════════════════════════════════
console.log('\n--- Registration: What\'s New Section ---');

var newItems = rootIndex.match(/<li class="what-new-item">/g);
assert(newItems !== null && newItems.length === 5,
       'What\'s new list has exactly 5 entries (got ' + (newItems ? newItems.length : 0) + ')');
assert(rootIndex.includes('Added Space Invaders — the classic arcade shooter with escalating alien waves.'),
       'What\'s new includes Space Invaders entry with correct description');

// ════════════════════════════════════════════════════════════
// 21. Simon Says href fixed in script.js
// ════════════════════════════════════════════════════════════
console.log('\n--- Registration: Simon Says href Fix ---');

var simonCatalog = scriptContent.match(/{\s*name:\s*['"]Simon Says['"][\s\S]*?category:\s*['"]/);
if (simonCatalog) {
    var simonEntryText = simonCatalog[0];
    // The href should be 'simon-says.html' NOT 'games/simon-says.html'
    var hasCorrectHref = simonEntryText.match(/href:\s*['"]simon-says\.html['"]/);
    var hasWrongHref = simonEntryText.match(/href:\s*['"]games\/simon-says\.html['"]/);
    assert(hasCorrectHref && !hasWrongHref,
           'Simon Says catalog href is "simon-says.html" (not "games/simon-says.html")');
} else {
    assert(false, 'Could not find Simon Says catalog entry to verify href fix');
}

// ════════════════════════════════════════════════════════════
// Summary
// ════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(55));
console.log('\nRESULTS: ' + passed + ' passed, ' + failed + ' failed\n');

if (failures.length > 0) {
    console.log('FAILURES:');
    failures.forEach(function (f, i) {
        console.log('  ' + (i + 1) + '. ' + f);
    });
}

process.exit(failed > 0 ? 1 : 0);
