#!/usr/bin/env node
'use strict';

/**
 * Test suite for games/pacman.html — validates all acceptance criteria.
 * Uses file-based static analysis (like test/tictactoe-test.js).
 */

const fs = require('fs');
const path = require('path');

const pacmanPath = path.join(__dirname, '..', 'games', 'pacman.html');
const rootIndexPath = path.join(__dirname, '..', 'index.html');

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
    try {
        fn();
        passed++;
        results.push(`✅ PASS: ${name}`);
    } catch (e) {
        failed++;
        results.push(`❌ FAIL: ${name} — ${e.message}`);
    }
}

// ── Read files ──
const pacman = fs.readFileSync(pacmanPath, 'utf8');
const rootIndex = fs.readFileSync(rootIndexPath, 'utf8');

console.log('\n📋 FILE EXISTENCE & REGISTRATION');
console.log('─'.repeat(50));

test('File games/pacman.html exists', () => {
    if (!fs.existsSync(pacmanPath)) throw new Error('File does not exist');
});

test('Root index.html has card with href="games/pacman.html"', () => {
    if (!rootIndex.includes('href="games/pacman.html"'))
        throw new Error('No href="games/pacman.html" in root index.html');
});

test('Games index.html has card with href="pacman.html"', () => {
    if (!gamesIndex.includes('href="pacman.html"'))
        throw new Error('No href="pacman.html" in games/index.html');
});

test('Pac-Man registered in games/index.html', () => {
    if (!gamesIndex.includes('Pac-Man') && !gamesIndex.includes('pacman'))
        throw new Error('Pac-Man not mentioned in games/index.html');
});

test('Pac-Man registered in root index.html', () => {
    if (!rootIndex.includes('Pac-Man') && !rootIndex.includes('pacman'))
        throw new Error('Pac-Man not mentioned in root index.html');
});

console.log('\n📄 SELF-CONTAINED CHECKS');
console.log('─'.repeat(50));

test('Has inline <style> tag', () => {
    if (!/<style>[\s\S]*<\/style>/.test(pacman))
        throw new Error('No inline <style> tag found');
});

test('Has inline <script> tag', () => {
    if (!/<script>[\s\S]*<\/script>/.test(pacman))
        throw new Error('No inline <script> tag found');
});

test('Does NOT link external stylesheets (CDN)', () => {
    if (/<link[^>]*href="https?:\/\//.test(pacman))
        throw new Error('Links external stylesheet');
});

test('Does NOT link external scripts (CDN)', () => {
    if (/<script[^>]*src="https?:\/\//.test(pacman))
        throw new Error('Links external script');
});

console.log('\n🎮 CANVAS & GAME STRUCTURE');
console.log('─'.repeat(50));

test('Has canvas element', () => {
    if (!/<canvas[^>]+id=/.test(pacman))
        throw new Error('No canvas element found');
});

test('Canvas width is present', () => {
    if (!pacman.includes('width='))
        throw new Error('No canvas width attribute');
});

test('Canvas height is present', () => {
    if (!pacman.includes('height='))
        throw new Error('No canvas height attribute');
});

test('Uses 2D canvas context (getContext)', () => {
    if (!pacman.includes('getContext'))
        throw new Error('No 2D canvas context found');
});

console.log('\n👻 GHOSTS & MAZE');
console.log('─'.repeat(50));

test('Maze dimensions: 28 columns × 31 rows', () => {
    if (!pacman.includes('COLS = 28') || !pacman.includes('ROWS = 31'))
        throw new Error('Maze dimensions 28×31 not found');
});

test('4 ghosts defined (Blinky, Pinky, Inky, Clyde)', () => {
    const ghostIds = ['0', '1', '2', '3'];
    let count = 0;
    for (const id of ghostIds) {
        if (pacman.includes(`case ${id}:`)) count++;
    }
    if (count < 4) throw new Error(`Only ${count}/4 ghost targeting cases found`);
});

test('Ghost colors defined (red, pink, cyan, orange)', () => {
    const colors = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'];
    for (const c of colors) {
        if (!pacman.includes(c)) throw new Error(`Ghost color ${c} not found`);
    }
});

test('Ghost targeting AI: Blinky chases Pac-Man', () => {
    if (!pacman.includes('Blinky') || !pacman.includes('chaser'))
        throw new Error('Blinky targeting AI not found');
});

test('Ghost targeting AI: Pinky ambushes 4 tiles ahead', () => {
    if (!pacman.includes('Pinky') || !pacman.includes('ambusher'))
        throw new Error('Pinky targeting AI not found');
});

test('Ghost targeting AI: Inky uses two-vector approach', () => {
    if (!pacman.includes('Inky') || !pacman.includes('tactician'))
        throw new Error('Inky targeting AI not found');
});

test('Ghost targeting AI: Clyde has random/drifter behavior', () => {
    if (!pacman.includes('Clyde'))
        throw new Error('Clyde targeting AI not found');
});

test('Ghost house area defined in maze', () => {
    if (!pacman.includes('ghost house') && !pacman.includes('GHOUSE'))
        throw new Error('Ghost house area not found');
});

console.log('\n⚡ GAME MECHANICS');
console.log('─'.repeat(50));

test('Walls defined (type 1)', () => {
    if (!pacman.includes('WALL = 1'))
        throw new Error('Wall constant not found');
});

test('Dots defined (type 0)', () => {
    if (!pacman.includes('DOT = 0'))
        throw new Error('Dot constant not found');
});

test('Power pellets defined (type 2)', () => {
    if (!pacman.includes('PEL = 2'))
        throw new Error('Power pellet constant not found');
});

test('Tunnel/wrap-around implemented', () => {
    if (!pacman.includes('TUNNEL') && !pacman.match(/x\s*<\s*0/) && !pacman.includes('tunnel'))
        throw new Error('No tunnel wrap logic found');
});

test('Frightened mode toggle', () => {
    if (!pacman.includes('frightened'))
        throw new Error('Frightened mode not found');
});

test('Ghost eating score multiplier (200 × 2^n)', () => {
    if (!pacman.includes('200') || !pacman.includes('Math.pow'))
        throw new Error('Ghost eating score multiplier not found');
});

test('Lives system (3 lives)', () => {
    if (!pacman.includes('lives = 3') && !pacman.includes("lives;"))
        throw new Error('Lives system not found');
});

test('Score tracking', () => {
    if (!pacman.includes('score'))
        throw new Error('Score tracking not found');
});

test('High score persistence via localStorage', () => {
    if (!pacman.includes('localStorage') && !pacman.includes('pacmanHS'))
        throw new Error('localStorage for high score not found');
});

test('Dots eaten increment score', () => {
    if (!pacman.includes('score += 10'))
        throw new Error('Dot scoring logic not found');
});

test('Power pellets eaten increment score (50)', () => {
    if (!pacman.includes('score += 50'))
        throw new Error('Pellet scoring logic not found');
});

test('All dots must be eaten to win', () => {
    if (!pacman.includes('dotCount >= totalDots'))
        throw new Error('Win condition (all dots eaten) not found');
});

console.log('\n🎮 KEYBOARD CONTROLS');
console.log('─'.repeat(50));

test('ArrowUp key handled', () => {
    if (!pacman.includes('ArrowUp'))
        throw new Error('ArrowUp key not handled');
});

test('ArrowDown key handled', () => {
    if (!pacman.includes('ArrowDown'))
        throw new Error('ArrowDown key not handled');
});

test('ArrowLeft key handled', () => {
    if (!pacman.includes('ArrowLeft'))
        throw new Error('ArrowLeft key not handled');
});

test('ArrowRight key handled', () => {
    if (!pacman.includes('ArrowRight'))
        throw new Error('ArrowRight key not handled');
});

test('WASD keys also handled', () => {
    if (!pacman.includes('case \'w\'') && !pacman.includes('case \'W\''))
        throw new Error('WASD keys not found');
});

test('ESC key for pause', () => {
    if (!pacman.includes('Escape') && !pacman.includes('ESC'))
        throw new Error('ESC key for pause not found');
});

test('Pause state implemented', () => {
    if (!pacman.includes('paused'))
        throw new Error('Pause state not implemented');
});

console.log('\n🏁 GAME STATES & OVERLAYS');
console.log('─'.repeat(50));

test('Game over state exists', () => {
    if (!pacman.includes('gameover'))
        throw new Error('Game over state not found');
});

test('Win state exists', () => {
    if (!pacman.includes("'win'"))
        throw new Error('Win state not found');
});

test('Game over screen shows "GAME OVER" text', () => {
    if (!pacman.includes('GAME OVER'))
        throw new Error('GAME OVER text not found');
});

test('Win screen shows "YOU WIN" text', () => {
    if (!pacman.includes('YOU WIN'))
        throw new Error('YOU WIN text not found');
});

test('Play Again button exists', () => {
    if (!pacman.includes('id="playBtn"'))
        throw new Error('Play Again button not found');
});

test('Play Again restarts game', () => {
    if (!pacman.includes('__restart'))
        throw new Error('Restart function not found');
});

test('Ready timer before gameplay', () => {
    if (!pacman.includes('readyTimer') || !pacman.includes('READY'))
        throw new Error('Ready timer not implemented');
});

test('Dying animation state', () => {
    if (!pacman.includes('dying'))
        throw new Error('Dying animation state not found');
});

console.log('\n🖼️ RENDERING');
console.log('─'.repeat(50));

test('Uses requestAnimationFrame', () => {
    if (!pacman.includes('requestAnimationFrame'))
        throw new Error('requestAnimationFrame not used');
});

test('Draws maze walls', () => {
    if (!pacman.includes('drawMaze') || !pacman.includes('fillRect'))
        throw new Error('Maze drawing not found');
});

test('Draws Pac-Man character', () => {
    if (!pacman.includes('drawPac') || !pacman.includes('arc'))
        throw new Error('Pac-Man drawing not found');
});

test('Draws ghost characters', () => {
    if (!pacman.includes('drawGhost'))
        throw new Error('Ghost drawing not found');
});

test('Pac-Man mouth animation (mouthAngle)', () => {
    if (!pacman.includes('mouthAngle'))
        throw new Error('Pac-Man mouth animation not found');
});

test('Power pellet pulsing animation', () => {
    if (!pacman.includes('Math.sin(Date.now()'))
        throw new Error('Power pellet pulsing not found');
});

test('Draws dots on the board', () => {
    if (!pacman.includes('v === DOT') || !pacman.includes('arc'))
        throw new Error('Dot drawing not found');
});

test('Draws power pellets on the board', () => {
    if (!pacman.includes('v === PEL'))
        throw new Error('Power pellet drawing not found');
});

test('Dark background theme', () => {
    if (!pacman.includes('#0f0f23'))
        throw new Error('Dark background theme not found');
});

test('Yellow/gold Pac-Man color (#facc15)', () => {
    if (!pacman.includes('#facc15'))
        throw new Error('Pac-Man yellow color not found');
});

console.log('\n📝 REGISTRATION VERIFICATION');
console.log('─'.repeat(50));

test('games/index.html references pacman.html in href', () => {
    if (!gamesIndex.match(/href="pacman\.html"/))
        throw new Error('href="pacman.html" not in games/index.html');
});

test('games/index.html has Pac-Man category', () => {
    if (!gamesIndex.match(/<a[^>]*href="pacman\.html"[^>]*class="game-card"/))
        throw new Error('Pac-Man not registered as game card in games/index.html');
});

test('Root index.html references games/pacman.html', () => {
    if (!rootIndex.match(/href="games\/pacman\.html"/))
        throw new Error('href="games/pacman.html" not in root index.html');
});

test('Root index.html JS catalog includes Pac-Man', () => {
    if (!rootIndex.includes("'games/pacman.html'"))
        throw new Error('Pac-Man not in root index.html JS catalog');
});

console.log('\n🔗 NAVIGATION');
console.log('─'.repeat(50));

test('Has click handler for game restart on canvas', () => {
    if (!pacman.includes('addEventListener("click"') && !pacman.includes('click', pacman))
        throw new Error('Canvas click handler not found');
});

// ── Summary ──
console.log('\n' + '═'.repeat(50));
console.log(`\nRESULTS: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
    console.log('FAILURES:');
    results.forEach(r => {
        if (r.startsWith('❌')) console.log(r);
    });
    process.exit(1);
} else {
    console.log('All tests passed! 🎉');
    process.exit(0);
}
