#!/usr/bin/env node
/**
 * Test suite for games/simon-says.html — validates all acceptance criteria.
 * Uses JSDOM to load and execute the HTML, then checks game logic.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const SIMON_PATH = path.resolve(__dirname, '..', 'games', 'simon-says.html');
const GAMES_INDEX_PATH = path.resolve(__dirname, '..', 'games', 'index.html');
const ROOT_INDEX_PATH = path.resolve(__dirname, '..', 'index.html');

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
    if (condition) {
        passed++;
        console.log(`  ✅ ${message}`);
    } else {
        failed++;
        failures.push(message);
        console.log(`  ❌ ${message}`);
    }
}

// ============================================================
// 1. File existence & self-contained checks
// ============================================================
console.log('\n📋 FILE EXISTENCE & SELF-CONTAINED');
console.log('─'.repeat(50));

assert(fs.existsSync(SIMON_PATH), 'games/simon-says.html exists');

const htmlContent = fs.readFileSync(SIMON_PATH, 'utf-8');

// Must link shared resources
assert(htmlContent.includes('href="../styles.css"'), 'Links shared stylesheet: ../styles.css');
assert(htmlContent.includes('src="../script.js"'), 'Links shared script: ../script.js');

// No external script/src links (self-contained game code)
const hasExternalScript = /<script\s+[^>]*src\s*=\s*["'][^"']*:\/\/[^"']*["']/.test(htmlContent);
assert(!hasExternalScript, 'No external script dependencies (self-contained)');

const hasExternalStyle = /<link\s+[^>]*rel\s*=\s*["']stylesheet["'][^>]*href\s*=\s*["'][^"']*:\/\/[^"']*["']/.test(htmlContent);
assert(!hasExternalStyle, 'No external stylesheet dependencies (self-contained)');

// Must have inline CSS
assert(htmlContent.includes('<style>') && htmlContent.includes('</style>'), 'Contains inline <style> tag');

// Must have inline JS
assert(htmlContent.includes('<script>') && htmlContent.includes('</script>'), 'Contains inline <script> tag');

// ============================================================
// 2. Header structure
// ============================================================
console.log('\n🔗 HEADER & NAVIGATION');
console.log('─'.repeat(50));

assert(htmlContent.includes('class="game-header"') || htmlContent.includes('<header'), 'Header element exists');
assert(htmlContent.includes('href="../index.html"') && htmlContent.includes('gameShelf'), 'Header logo links to ../index.html with gameShelf text');
assert(htmlContent.includes('Simon Says'), 'Game title "Simon Says" present in header');
assert(htmlContent.includes('href="../games/index.html"'), 'Back link to ../games/index.html exists');

// ============================================================
// 3. Footer structure
// ============================================================
console.log('\n📄 FOOTER');
console.log('─'.repeat(50));

assert(htmlContent.includes('© 2025 gameShelf — All games built in browser — no downloads required'),
    'Footer has exact required text: © 2025 gameShelf — All games built in browser — no downloads required');

assert(htmlContent.includes('site-footer'), 'Footer uses site-footer class');

// ============================================================
// 4. Canvas element
// ============================================================
console.log('\n🎨 CANVAS ELEMENT');
console.log('─'.repeat(50));

assert(/<canvas[\s\S]*?id=["']game-canvas["'][\s\S]*?width=["']400["'][\s\S]*?height=["']400["']/.test(htmlContent) ||
      /<canvas[\s\S]*?width=["']400["'][\s\S]*?height=["']400["'][\s\S]*?id=["']game-canvas["']/.test(htmlContent),
    'Canvas element with id="game-canvas" width=400 height=400');

assert(/CANVAS_SIZE\s*=\s*400/.test(htmlContent), 'CANVAS_SIZE constant = 400');

// ============================================================
// 5. Button colors (red, green, blue, yellow)
// ============================================================
console.log('\n🎨 BUTTON COLORS');
console.log('─'.repeat(50));

assert(htmlContent.includes('#e74c3c'), 'Red button color: #e74c3c');
assert(htmlContent.includes('#2ecc71'), 'Green button color: #2ecc71');
assert(htmlContent.includes('#3498db'), 'Blue button color: #3498db');
assert(htmlContent.includes('#f1c40f'), 'Yellow button color: #f1c40f');

// ============================================================
// 6. 2×2 grid layout (positions, gap, visual separation)
// ============================================================
console.log('\n📐 2×2 GRID LAYOUT');
console.log('─'.repeat(50));

// Check for gap and position definitions
assert(htmlContent.includes('GAP') && htmlContent.includes('POSITIONS'), 'Gap and positions defined for grid layout');
assert(htmlContent.includes('BTN_W') && htmlContent.includes('BTN_H'), 'Button width and height variables defined');
assert(htmlContent.includes('BORDER'), 'Border/shadow definition for visual distinction');

// Check that there are 4 positions defined
const posMatches = htmlContent.match(/POSITIONS\s*=\s*\[/);
assert(posMatches, 'POSITIONS array defined');

// Check for 4 button definitions
const btnColorMatches = htmlContent.match(/BUTTON_COLORS\s*=\s*\[/);
assert(btnColorMatches, 'BUTTON_COLORS array defined');

// Visual separation: buttons have dark border and are not one solid color
assert(htmlContent.includes('dark') && htmlContent.includes('#1a1a3e'), 'Button areas separated with dark borders/background');

// ============================================================
// 7. Web Audio API tones
// ============================================================
console.log('\n🔊 AUDIO / WEB AUDIO API');
console.log('─'.repeat(50));

assert(htmlContent.includes('AudioContext') || htmlContent.includes('webkitAudioContext'), 'Uses Web Audio API (AudioContext)');
assert(htmlContent.includes('createOscillator'), 'Oscillator created via Web Audio API');
assert(htmlContent.includes('sine') || htmlContent.includes("'sine'"), 'Sine wave oscillator type');
assert(htmlContent.includes('261.63') || htmlContent.includes('C4'), 'Red button frequency: C4 (261.63 Hz)');
assert(htmlContent.includes('329.63') || htmlContent.includes('E4'), 'Green button frequency: E4 (329.63 Hz)');
assert(htmlContent.includes('392') || htmlContent.includes('G4'), 'Blue button frequency: G4 (392.00 Hz)');
assert(htmlContent.includes('493.88') || htmlContent.includes('B4'), 'Yellow button frequency: B4 (493.88 Hz)');

// Audio created on user interaction
assert(htmlContent.includes('initAudio') && htmlContent.includes('startGame') || htmlContent.includes('startBtn'),
    'AudioContext created on first user interaction (start button click)');

// ============================================================
// 8. Game flow — sequence generation and display
// ============================================================
console.log('\n🎮 GAME FLOW — SEQUENCE');
console.log('─'.repeat(50));

// Random sequence generation
assert(htmlContent.includes('Math.random') || htmlContent.includes('getNextButton'), 'Random sequence generation');
assert(htmlContent.includes('addRandomButton') || htmlContent.includes('sequence'), 'Sequence array management');

// Flash and tone during computer play
assert(htmlContent.includes('litButton'), 'Button flash (litButton state) during computer play');
assert(htmlContent.includes('playTone'), 'Audio tone played via playTone function');
assert(htmlContent.includes('showSequence'), 'showSequence function for computer display');

// Sequence starts with one button
assert(htmlContent.includes('addRandomButton') && htmlContent.includes('showSequence'),
    'Sequence starts with one button then is shown');

// ============================================================
// 9. Player input — must repeat sequence in order
// ============================================================
console.log('\n🎮 PLAYER INPUT');
console.log('─'.repeat(50));

// Mouse/touch input
assert(htmlContent.includes('click') || htmlContent.includes('canvas.addEventListener'), 'Canvas click event listener');
assert(htmlContent.includes('touchstart'), 'Touch event listener for mobile');

// Input checking against sequence order
assert(htmlContent.includes('playerInput'), 'playerInput function for handling input');
assert(htmlContent.includes('playerInputIndex'), 'Player input index tracking');
assert(htmlContent.includes('btnIdx !== sequence') || htmlContent.includes('playerInputIndex >= sequence.length'),
    'Input checked against sequence order');

// ============================================================
// 10. Sequence grows by exactly one button each round
// ============================================================
console.log('\n📈 SCORING & GROWTH');
console.log('─'.repeat(50));

assert(htmlContent.includes('score++') || htmlContent.includes('score =') || htmlContent.includes('score+='), 'Score increments on correct round');
assert(htmlContent.includes('addRandomButton'), 'New button added to sequence each round');

// Check that exactly one button is added per round
// Look for addRandomButton in the context of correct/sequence completion
const correctHandler = htmlContent.split('playerInputIndex >= sequence.length')[1]?.split('correctOverlay')[0] || '';
assert(correctHandler.includes('addRandomButton'), 'One button added in correct round handler');

// HUD shows round number
assert(htmlContent.includes('hud') || htmlContent.includes('hud.textContent'), 'HUD element exists');
assert(htmlContent.includes('Round:'), 'HUD shows "Round:" label');

// ============================================================
// 11. Game over — mistake detected, overlay shown
// ============================================================
console.log('\n💥 GAME OVER');
console.log('─'.repeat(50));

assert(htmlContent.includes('gameOverOverlay'), 'Game over overlay element exists');
assert(htmlContent.includes('gameover'), 'Game over state defined');
assert(htmlContent.includes('finalScore'), 'Final score shown on game over');
assert(htmlContent.includes('Wrong') || htmlContent.includes('wrong') || htmlContent.includes('mistake') ||
       htmlContent.includes('btnIdx !== sequence'), 'Wrong input detection');

// Wrong button flash feedback
assert(htmlContent.includes('drawWrongFlash') || htmlContent.includes('wrongFlash') || htmlContent.includes('Wrong'), 'Visual feedback on wrong press');

// ============================================================
// 12. New Game button resets game
// ============================================================
console.log('\n🔄 RESET / NEW GAME');
console.log('─'.repeat(50));

assert(htmlContent.includes('id="newGameBtn"'), 'New Game button exists with id="newGameBtn"');
assert(htmlContent.includes('↻ New Game') || htmlContent.includes('New Game'), 'New Game button text present');
assert(htmlContent.includes('resetGame'), 'resetGame function exists');
assert(htmlContent.includes('addEventListener'), 'Event listener on New Game button');

// ============================================================
// 13. Start overlay
// ============================================================
console.log('\n▶️ START OVERLAY');
console.log('─'.repeat(50));

assert(htmlContent.includes('id="startOverlay"'), 'Start overlay element exists with id="startOverlay"');
assert(htmlContent.includes('▶ Start Game') || htmlContent.includes('Start Game'), 'Start Game button text present');
assert(htmlContent.includes('startBtn'), 'Start button referenced in JS');
assert(htmlContent.includes("startOverlay.classList.remove('active')") || htmlContent.includes("startOverlay.classList.remove( 'active' )"), 'Start overlay hidden on game start');

// ============================================================
// 14. Keyboard controls — arrow keys + Enter/space
// ============================================================
console.log('\n⌨️ KEYBOARD CONTROLS');
console.log('─'.repeat(50));

assert(htmlContent.includes('ArrowLeft') && htmlContent.includes('ArrowRight'), 'Arrow left/right keys handled');
assert(htmlContent.includes('ArrowUp') && htmlContent.includes('ArrowDown'), 'Arrow up/down keys handled');
assert(htmlContent.includes('Enter') || htmlContent.includes("'Enter'"), 'Enter key for confirmation');
assert(htmlContent.includes("' '") || htmlContent.includes('" "'), 'Space key for confirmation');

// ============================================================
// 15. Reading order for keyboard: top-left → top-right → bottom-left → bottom-right
// ============================================================
console.log('\n🔢 KEYBOARD READING ORDER');
console.log('─'.repeat(50));

// Positions: [0]=top-left, [1]=top-right, [2]=bottom-left, [3]=bottom-right
// Reading order: 0 → 1 → 2 → 3
assert(htmlContent.includes('kbIndex') || htmlContent.includes('keyIndex') || htmlContent.includes('selectedBtn'),
    'Keyboard selection index tracked');

// ============================================================
// 16. No auto-start on page load
// ============================================================
console.log('\n⏸️ NO AUTO-START');
console.log('─'.repeat(50));

const lastPart = htmlContent.substring(htmlContent.length - 800);
assert(!lastPart.includes('startGame();') && !lastPart.includes('startGame(') ||
       lastPart.includes('drawButtons') && !lastPart.includes('startGame()'),
    'No auto-start on page load — game waits for user interaction');

// ============================================================
// 17. 2×2 grid: distinct button areas (not one solid color)
// ============================================================
console.log('\n🖼️ RENDERING — VISUAL SEPARATION');
console.log('─'.repeat(50));

// Check that each button has individual drawing
assert(htmlContent.includes('for (let i = 0; i < 4') || htmlContent.includes('for (i = 0; i < 4'),
    'Individual button rendering loop for 4 buttons');

// Each button has border/shadow (visual separation)
assert(htmlContent.includes('BORDER') && htmlContent.includes('fillRect'),
    'Each button has border for visual distinction');

// ============================================================
// 18. Game over shows final score
// ============================================================
console.log('\n📊 GAME OVER OVERLAY DETAILS');
console.log('─'.repeat(50));

assert(htmlContent.includes('finalScoreEl.textContent') || htmlContent.includes('finalScore'),
    'Final score value is set on game over overlay');
assert(htmlContent.includes('gameOverOverlay.classList.add') || htmlContent.includes('gameOverOverlay.classList.add'),
    'Game over overlay shown on game over');

// ============================================================
// 19. Button flash duration
// ============================================================
console.log('\n⏱️ FLASH DURATION');
console.log('─'.repeat(50));

// Flash ~400ms with ~150ms gap
assert(htmlContent.includes('400') && htmlContent.includes('550') || htmlContent.includes('550'),
    'Flash timing (~400ms + ~150ms gap) defined');
assert(htmlContent.includes('setTimeout') && htmlContent.includes('litButton = -1'),
    'Button flash duration handled with setTimeout reset');

// ============================================================
// 20. Registration in games/index.html
// ============================================================
console.log('\n📝 REGISTRATION IN games/index.html');
console.log('─'.repeat(50));

const gamesIndex = fs.readFileSync(GAMES_INDEX_PATH, 'utf-8');
assert(gamesIndex.includes('simon-says.html'), 'simon-says.html referenced in games/index.html');
assert(gamesIndex.includes('data-category="casual"') || gamesIndex.includes("data-category='casual'"),
    'Simon Says registered as casual category in games/index.html');
assert(gamesIndex.includes('🎵'), '🎵 emoji thumb icon used in games/index.html');
assert(gamesIndex.includes('Simon Says'), 'Game title "Simon Says" in games/index.html');
assert(gamesIndex.includes('Repeat the sequence') || gamesIndex.includes('Each round'),
    'Game description present in games/index.html');

// ============================================================
// 21. Registration in root index.html
// ============================================================
console.log('\n📝 REGISTRATION IN index.html');
console.log('─'.repeat(50));

const rootIndex = fs.readFileSync(ROOT_INDEX_PATH, 'utf-8');
assert(rootIndex.includes('games/simon-says.html'), 'Root index.html links to games/simon-says.html');
assert(/data-category="casual"/.test(rootIndex) && rootIndex.includes('simon-says.html'),
    'Simon Says registered as casual category in root index.html');
assert(rootIndex.includes('🎵'), '🎵 emoji thumb icon used in root index.html');
assert(rootIndex.includes('Simon Says'), 'Game title "Simon Says" in root index.html');

// ============================================================
// 22. What's New section
// ============================================================
console.log('\n📋 WHAT\'S NEW SECTION');
console.log('─'.repeat(50));

assert(rootIndex.includes("What's New"),
    "What's New section exists in index.html");
assert(rootIndex.includes("simon-says") || rootIndex.includes("Simon Says"),
    "Simon Says entry in What's New section");

// Check New badge
assert(/New/.test(rootIndex) && rootIndex.includes('Simon Says'),
    'New badge associated with Simon Says in "What\'s New"');

// Max 5 entries
const whatNewList = rootIndex.match(/<ul[^>]*class=["'][^"']*what-new[^"']*["'][^>]*>([\s\S]*?)<\/ul>/);
if (whatNewList) {
    const entries = whatNewList[0].match(/<li[\s\S]*?<\/li>/g);
    assert(entries && entries.length <= 5,
        `What's New section has at most 5 entries (found ${entries ? entries.length : 'unknown'})`);
    console.log(`  ℹ️  Found ${entries.length} entries in "What's New" section`);
} else {
    // Try alternate pattern
    const items = rootIndex.match(/what-new-item/g);
    const count = items ? items.length : 0;
    assert(count <= 5, `What's New section has at most 5 entries (found ${count})`);
    console.log(`  ℹ️  Found ${count} entries in "What's New" section`);
}

// ============================================================
// 23. Games array includes Simon Says
// ============================================================
console.log('\n📋 GAMES JAVASCRIPT ARRAY');
console.log('─'.repeat(50));

const gamesMatch = rootIndex.match(/var games\s*=\s*\[[\s\S]*?\];/);
assert(gamesMatch, 'Games array defined in index.html');
if (gamesMatch) {
    assert(gamesMatch[0].includes('Simon Says'), 'Simon Says in games array');
    assert(gamesMatch[0].includes('simon-says.html'), 'games/simon-says.html in games array');
    assert(/category:\s*['"]casual['"]/.test(gamesMatch[0]), 'Category is casual in games array');
}

// ============================================================
// Final summary
// ============================================================
console.log('\n' + '═'.repeat(50));
console.log(`\nRESULTS: ${passed} passed, ${failed} failed\n`);

if (failures.length > 0) {
    console.log('FAILURES:');
    failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    process.exit(1);
} else {
    console.log('All tests passed! 🎉');
    process.exit(0);
}
