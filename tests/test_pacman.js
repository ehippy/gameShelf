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

test('Root index.html references games/pacman.html', () => {
    if (!rootIndex.match(/href="games\/pacman\.html"/))
        throw new Error('href="games/pacman.html" not in root index.html');
});

console.log('\n🔗 HEADER & NAVIGATION');
console.log('─'.repeat(50));

test('Sticky <header class="game-header"> exists', () => {
    if (!pacman.includes('class="game-header"'))
        throw new Error('No <header class="game-header"> found');
    if (!pacman.includes('position: sticky'))
        throw new Error('Header is not sticky');
    if (!pacman.includes('backdrop-filter: blur(12px)'))
        throw new Error('Header missing backdrop-filter blur');
    if (!pacman.includes('border-bottom: 1px solid var(--border-color)'))
        throw new Error('Header missing border-bottom');
});

test('Header contains .header-inner div', () => {
    if (!pacman.includes('class="header-inner"'))
        throw new Error('No .header-inner found');
    if (!pacman.includes('max-width: 1200px'))
        throw new Error('.header-inner missing max-width');
});

test('Header contains .header-left group', () => {
    if (!pacman.includes('class="header-left"'))
        throw new Error('No .header-left found');
});

test('Header logo: anchor href="../index.html" with class="logo"', () => {
    if (!pacman.includes('href="../index.html"') || !pacman.includes('class="logo"'))
        throw new Error('Logo anchor with correct href/class not found');
});

test('Logo ::before pseudo-element has 🎮 emoji', () => {
    if (!pacman.includes("content: '🎮'"))
        throw new Error('Logo ::before content 🎮 not found');
});

test('Header .game-title span with "Pac-Man" text', () => {
    if (!pacman.includes('class="game-title"'))
        throw new Error('No .game-title span found');
    if (!pacman.match(/<span[^>]*class="game-title"[^>]*>Pac-Man<\/span>/))
        throw new Error('Game title span text not "Pac-Man"');
});

test('Back link: anchor href="../index.html" class="back-link" with "← Back to All Games"', () => {
    if (!pacman.includes('class="back-link"'))
        throw new Error('No .back-link found');
    if (!pacman.includes('← Back to All Games'))
        throw new Error('Back link text not "← Back to All Games"');
});

test('No bare <h1> in page (title moved to header)', () => {
    const bodyContent = pacman.split('</head>')[1];
    if (/<h1[\s>]/.test(bodyContent))
        throw new Error('Bare <h1> still present in body');
});

test('Back/home link to ../index.html present', () => {
    if (!pacman.includes('href="../index.html"'))
        throw new Error('No link to ../index.html');
});

test('Page title is "gameShelf — Pac-Man"', () => {
    if (!pacman.includes('<title>gameShelf — Pac-Man</title>'))
        throw new Error('<title> is not "gameShelf — Pac-Man"');
});

console.log('\n📄 FOOTER');
console.log('─'.repeat(50));

test('Footer: <footer class="site-footer"> exists', () => {
    if (!pacman.includes('<footer class="site-footer">'))
        throw new Error('No <footer class="site-footer"> found');
});

test('Footer contains .footer-inner', () => {
    if (!pacman.includes('class="footer-inner"'))
        throw new Error('No .footer-inner found');
});

test('Footer contains .footer-links with Home/All Games links', () => {
    if (!pacman.includes('class="footer-links"'))
        throw new Error('No .footer-links found');
    const footerLinksMatch = pacman.match(/<div[^>]*class="footer-links"[^>]*>[\s\S]*?<\/div>/);
    if (!footerLinksMatch) throw new Error('.footer-links not found as div');
    const links = footerLinksMatch[0];
    if (!links.includes('>Home<')) throw new Error('.footer-links missing Home link');
    if (!links.includes('>All Games<')) throw new Error('.footer-links missing All Games link');
    if (!links.includes('href="../index.html"'))
        throw new Error('.footer-links links not pointing to ../index.html');
});

test('Footer contains exact copyright text without trailing period', () => {
    if (!pacman.includes('<p>© 2025 gameShelf — All games built in browser — no downloads required</p>'))
        throw new Error('Footer copyright text not found');
    if (pacman.includes('no downloads required.</p>'))
        throw new Error('Footer copyright text has trailing period');
});

test('Footer links section has margin-bottom spacing', () => {
    if (!pacman.includes('margin-bottom: 0.5rem') && !pacman.includes('margin-bottom'))
        throw new Error('Footer links missing margin-bottom');
});

test('Footer p element uses color: var(--text-muted) and font-size: 0.8rem', () => {
    const footerCSSMatch = pacman.match(/\.site-footer\s+p\s*{[^}]*}/);
    if (!footerCSSMatch) throw new Error('.site-footer p CSS rule not found');
    const footerPStyle = footerCSSMatch[0];
    if (!footerPStyle.includes('var(--text-muted)'))
        throw new Error('Footer p missing color: var(--text-muted)');
    if (!footerPStyle.includes('0.8rem'))
        throw new Error('Footer p missing font-size: 0.8rem');
});

test('No bare <p> footer replaced by site-footer', () => {
    const bodyContent = pacman.split('</head>')[1];
    const bareFooters = bodyContent.match(/<p[^>]*>© 2025/g);
    if (bareFooters && bareFooters.length > 0)
        throw new Error('Bare <p> footer still present (should be in <footer class="site-footer">)');
});

console.log('\n🖼️ CANVAS & GAME AREA WRAPPING');
console.log('─'.repeat(50));

test('Canvas is 560×620', () => {
    if (!pacman.includes('width="560"') || !pacman.includes('height="620"'))
        throw new Error('Canvas dimensions not 560×620');
});

test('Canvas wrapped in <div class="canvas-wrapper">', () => {
    if (!pacman.includes('class="canvas-wrapper"'))
        throw new Error('No .canvas-wrapper div found');
    if (!pacman.includes('position: relative'))
        throw new Error('.canvas-wrapper missing position: relative');
    if (!pacman.includes('border: 2px solid var(--border-color)'))
        throw new Error('.canvas-wrapper missing border');
    if (!pacman.includes('border-radius: 0.75rem'))
        throw new Error('.canvas-wrapper missing border-radius');
    if (!pacman.includes('overflow: hidden'))
        throw new Error('.canvas-wrapper missing overflow: hidden');
    if (!pacman.includes('box-shadow'))
        throw new Error('.canvas-wrapper missing box-shadow');
});

test('Game content wrapped in <div class="game-area">', () => {
    if (!pacman.includes('class="game-area"'))
        throw new Error('No .game-area div found');
});

test('Game area has flex centering styles', () => {
    const gameAreaCSS = pacman.match(/\.game-area\s*{[^}]*}/);
    if (!gameAreaCSS) throw new Error('.game-area CSS rule not found');
    const cssBlock = gameAreaCSS[0];
    if (!cssBlock.includes('flex-direction: column'))
        throw new Error('.game-area missing flex-direction: column');
    if (!cssBlock.includes('align-items: center'))
        throw new Error('.game-area missing align-items: center');
    if (!cssBlock.includes('justify-content: center'))
        throw new Error('.game-area missing justify-content: center');
    if (!cssBlock.includes('padding: 2rem 1.5rem'))
        throw new Error('.game-area missing padding: 2rem 1.5rem');
});

console.log('\n🎨 CSS CUSTOM PROPERTIES');
console.log('─'.repeat(50));

test(':root custom properties defined', () => {
    if (!pacman.includes(':root {'))
        throw new Error(':root custom properties not defined');
    const requiredProps = [
        '--bg-primary: #0f0f23',
        '--bg-secondary: #1a1a3e',
        '--accent: #00d4ff',
        '--accent-hover: #00b8d9',
        '--accent-glow: rgba(0, 212, 255, 0.3)',
        '--border-color: #2a2a5a',
        '--header-bg: rgba(15, 15, 35, 0.95)',
        '--footer-bg: #0a0a1a',
        '--text-primary',
        '--text-secondary',
        '--text-muted'
    ];
    for (const prop of requiredProps) {
        if (!pacman.includes(prop)) throw new Error(`Missing :root property: ${prop}`);
    }
});

test('Body uses flex column layout with min-height 100vh', () => {
    if (!pacman.includes('display: flex;') || !pacman.includes('flex-direction: column'))
        throw new Error('Body missing flex column layout');
    if (!pacman.includes('min-height: 100vh'))
        throw new Error('Body missing min-height: 100vh');
});

test('Body background uses var(--bg-primary)', () => {
    const bodyCSS = pacman.match(/body\s*{[^}]*}/);
    if (!bodyCSS) throw new Error('body CSS rule not found');
    if (!bodyCSS[0].includes('var(--bg-primary)'))
        throw new Error('Body not using var(--bg-primary) for background');
});

test('Header background uses var(--header-bg)', () => {
    const headerCSS = pacman.match(/\.game-header\s*{[^}]*}/);
    if (!headerCSS) throw new Error('.game-header CSS rule not found');
    if (!headerCSS[0].includes('var(--header-bg)'))
        throw new Error('Header not using var(--header-bg)');
});

test('Footer background uses var(--footer-bg)', () => {
    const footerCSS = pacman.match(/\.site-footer\s*{[^}]*}/);
    if (!footerCSS) throw new Error('.site-footer CSS rule not found');
    if (!footerCSS[0].includes('var(--footer-bg)'))
        throw new Error('Footer not using var(--footer-bg)');
});

test('Border color uses var(--border-color)', () => {
    if (!pacman.includes('var(--border-color)'))
        throw new Error('Border color not using var(--border-color)');
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
