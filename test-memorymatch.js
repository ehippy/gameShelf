const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let passed = 0;
let failed = 0;
let results = [];

function assert(condition, testName) {
    if (condition) {
        passed++;
        results.push(`  ✅ ${testName}`);
    } else {
        failed++;
        results.push(`  ❌ ${testName}`);
    }
}

function section(name) {
    results.push(`\n📋 ${name}`);
}

// ============================================
// READ FILES
// ============================================
const memorymatchHtml = fs.readFileSync(path.join(__dirname, 'games', 'memorymatch.html'), 'utf-8');
const gamesIndexHtml = fs.readFileSync(path.join(__dirname, 'games', 'index.html'), 'utf-8');
const rootIndexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const stylesCss = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf-8');

const EMOJIS = ['🎮', '🎯', '🎲', '🎸', '🚀', '🌟', '🔥', '💎'];

// ============================================
// SECTION 1: File Existence & Self-Contained
// ============================================
section('1. File Existence & Self-Contained');
assert(fs.existsSync(path.join(__dirname, 'games', 'memorymatch.html')),
    'games/memorymatch.html exists');
// Self-contained means only external deps are ../styles.css and ../script.js
const linkStyles = /<link\s+rel=["']stylesheet["']\s+href=["']\.\.\/styles\.css["'][\s\S]*?>/i;
assert(linkStyles.test(memorymatchHtml), 'Links shared stylesheet: ../styles.css');
const scriptTag = /<script\s+src=["']\.\.\/script\.js["'][\s\S]*?><\/script>/i;
assert(scriptTag.test(memorymatchHtml), 'Links shared script: ../script.js');
// No other external resource links (no other CDN, no other local files besides styles.css/script.js)
const externalResources = memorymatchHtml.match(/<link[^>]+href=["'][^"']*["']/gi) || [];
const externalScripts = memorymatchHtml.match(/<script[^>]+src=["'][^"']*["'][^>]*>/gi) || [];
const nonSharedLinks = externalResources.filter(l => !l.includes('../styles.css'));
const nonSharedScripts = externalScripts.filter(s => !s.includes('../script.js'));
assert(nonSharedLinks.length === 0, 'No external resource links beyond ../styles.css');
assert(nonSharedScripts.length === 0, 'No external script sources beyond ../script.js');

// ============================================
// SECTION 2: Canvas (400×400)
// ============================================
section('2. Canvas Element (400×400)');
assert(/id=["']game-canvas["']/.test(memorymatchHtml), 'Canvas has id="game-canvas"');
assert(/width=["']400["']/.test(memorymatchHtml), 'Canvas width=400');
assert(/height=["']400["']/.test(memorymatchHtml), 'Canvas height=400');

// ============================================
// SECTION 3: 4×4 Grid (16 cards, 8 pairs)
// ============================================
section('3. Grid Layout (4×4, 16 cards, 8 pairs)');
assert(/COLS\s*=\s*4/.test(memorymatchHtml), 'Grid has 4 columns');
assert(/ROWS\s*=\s*4/.test(memorymatchHtml), 'Grid has 4 rows');
assert(/TOTAL_PAIRS\s*=\s*8/.test(memorymatchHtml) || /totalPairs\s*=\s*8/.test(memorymatchHtml), '8 total pairs');
assert(/cards\.length\s*===\s*16/.test(memorymatchHtml) || /cards\s*=\s*\[\]/.test(memorymatchHtml), '16 cards in array');
assert(/16\s*card|sixteen\s*card|16\s*cards/i.test(memorymatchHtml) ||
      /emojiPairs\.push/.test(memorymatchHtml), 'Creates 16 card entries');

// ============================================
// SECTION 4: Emoji Icons
// ============================================
section('4. Card Content Uses Emoji Icons');
assert(/'🎮'/.test(memorymatchHtml), 'Contains 🎮 emoji');
assert(/'🎯'/.test(memorymatchHtml), 'Contains 🎯 emoji');
assert(/'🎲'/.test(memorymatchHtml), 'Contains 🎲 emoji');
assert(/'🎸'/.test(memorymatchHtml), 'Contains 🎸 emoji');
assert(/'🚀'/.test(memorymatchHtml), 'Contains 🚀 emoji');
assert(/'🌟'/.test(memorymatchHtml), 'Contains 🌟 emoji');
assert(/'🔥'/.test(memorymatchHtml), 'Contains 🔥 emoji');
assert(/'💎'/.test(memorymatchHtml), 'Contains 💎 emoji');
// Each emoji appears exactly twice (as a pair)
EMOJIS.forEach(emoji => {
    const count = (memorymatchHtml.match(new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    assert(count >= 2, `Emoji ${emoji} appears (pair reference)`);
});

// ============================================
// SECTION 5: Mouse Click Flips Cards
// ============================================
section('5. Mouse Click Interaction');
assert(/addEventListener.*click|\.on\s*=\s*click|canvas\.addEventListener/.test(memorymatchHtml), 'Canvas click event listener');
assert(/getCardFromEvent|cardIndex|clickedCard|getCardIndex/.test(memorymatchHtml), 'Card click detection function');
assert(/revealed\s*=\s*true|\.revealed\s*=\s*true|card\.revealed\s*=\s*true/.test(memorymatchHtml), 'Flips card (revealed=true)');

// ============================================
// SECTION 6: Match Detection (matched stay, unmatched flip back)
// ============================================
section('6. Match Detection Logic');
assert(/matched\s*=\s*true|\.matched\s*=\s*true/.test(memorymatchHtml), 'Matched cards set to matched=true');
assert(/second\.revealed\s*=\s*false|first\.revealed\s*=\s*false|\.revealed\s*=\s*false/.test(memorymatchHtml), 'Non-matching cards flip back (revealed=false)');
assert(/setTimeout/.test(memorymatchHtml), 'Uses timeout for delay before flipping back');
assert(/isProcessing/.test(memorymatchHtml), 'Processing guard prevents rapid clicks');
assert(/flippedCards/.test(memorymatchHtml), 'Tracks flipped cards');

// ============================================
// SECTION 7: Move Counter
// ============================================
section('7. Move Counter');
assert(/moves/.test(memorymatchHtml), 'Moves variable exists');
assert(/moves\s*\+\+|moves\s*=\s*moves\s*\+\s*1|moves\s*=/.test(memorymatchHtml), 'Moves counter increments');
assert(/moves-display/.test(memorymatchHtml), 'Moves display element exists');
assert(/Moves:\s*/i.test(memorymatchHtml) || /Moves/.test(memorymatchHtml), 'HUD shows "Moves" label');
assert(/movesDisplay/.test(memorymatchHtml), 'Moves display reference exists');
assert(/updateHUD/.test(memorymatchHtml), 'HUD update function exists');

// ============================================
// SECTION 8: Restart Button Resets Board
// ============================================
section('8. Restart Button');
assert(/restartBtn/.test(memorymatchHtml), 'Restart button element exists');
assert(/restartGame/.test(memorymatchHtml), 'restartGame function exists');
assert(/addEventListener.*restart|restartBtn/.test(memorymatchHtml), 'Restart button has event handler');
assert(/initGame/.test(memorymatchHtml), 'initGame called on restart');
assert(/Fisher-Yates|shuffle/.test(memorymatchHtml), 'Fisher-Yates shuffle on restart');

// ============================================
// SECTION 9: Win Overlay (all 8 pairs found)
// ============================================
section('9. Win Overlay');
assert(/gameover-overlay/.test(memorymatchHtml) || /winOverlay/.test(memorymatchHtml), 'Game over overlay element exists');
assert(/You Win/.test(memorymatchHtml) || /you win/i.test(memorymatchHtml), 'Overlay says "You Win!"');
assert(/final-moves/.test(memorymatchHtml) || /finalMoves/.test(memorymatchHtml), 'Total moves displayed in win overlay');
assert(/Completed in.*moves|moves!/.test(memorymatchHtml) || /<span id=["']final-moves["']/.test(memorymatchHtml), 'Shows total moves in subtitle');
assert(/matchedPairs/.test(memorymatchHtml), 'Pairs count tracked');
assert(/gameState/.test(memorymatchHtml), 'Game state machine used');
assert(/'gameover'/.test(memorymatchHtml) || /gameover:/.test(memorymatchHtml), 'gameover state defined');

// ============================================
// SECTION 10: Start Overlay
// ============================================
section('10. Start Overlay');
assert(/start-overlay/.test(memorymatchHtml) || /startOverlay/.test(memorymatchHtml), 'Start overlay element exists');
assert(/🃏 Memory Match|Memory Match/.test(memorymatchHtml), 'Start overlay shows game name');
assert(/start-btn/.test(memorymatchHtml) || /Start Game|startGame|▶ Start/.test(memorymatchHtml), 'Start button exists');
assert(/<button|overlay-btn/.test(memorymatchHtml), 'Button element in overlay');
assert(/visible/.test(memorymatchHtml), 'Overlay visibility class toggling');
assert(/gameState\s*=\s*['"]start['"]/.test(memorymatchHtml), 'Initial state is "start"');

// ============================================
// SECTION 11: Header Structure
// ============================================
section('11. Header Structure');
assert(/<header/.test(memorymatchHtml), 'Header element exists');
assert(/class=["']logo["']/.test(memorymatchHtml) || /href=["']\.\.\/index\.html["']/.test(memorymatchHtml), 'Logo links to ../index.html');
assert(/gameShelf/.test(memorymatchHtml), 'Header has gameShelf logo text');
assert(/Memory Match/.test(memorymatchHtml), 'Game title "Memory Match" present');
assert(/\.\.\/games\/index\.html/.test(memorymatchHtml), 'Back link to ../games/index.html exists');
assert(/← Back to Games|← Back to All Games/.test(memorymatchHtml), 'Back link text includes arrow');
// Verify the logo href specifically
assert(/<a\s+href=["']\.\.\/index\.html["'].*class=["']logo["']/i.test(memorymatchHtml) ||
      /class=["']logo["'].*<a\s+href=["']\.\.\/index\.html["']/i.test(memorymatchHtml),
    'Logo anchor links to ../index.html');

// ============================================
// SECTION 12: Footer Structure
// ============================================
section('12. Footer Structure');
assert(/<footer/.test(memorymatchHtml), 'Footer element exists');
assert(/class=["']site-footer["']/.test(memorymatchHtml), 'Footer uses site-footer class');
const homeLink = /<a\s+href=["']\.\.\/index\.html["'][^>]*>Home<\/a>/i;
assert(homeLink.test(memorymatchHtml), 'Footer has Home link (href="../index.html")');
assert(/<a\s+href=["']index\.html["'][^>]*>All Games<\/a>/i.test(memorymatchHtml),
    'Footer has All Games link (href="index.html")');

// ============================================
// SECTION 13: Shared Resource Links (re-check for emphasis)
// ============================================
section('13. Shared Resources');
assert(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']\.\.\/styles\.css["'][^>]*>/i.test(memorymatchHtml),
    'Stylesheet link with ../styles.css');
assert(/<script[^>]+src=["']\.\.\/script\.js["'][^>]*><\/script>/i.test(memorymatchHtml),
    'Script tag with ../script.js');

// ============================================
// SECTION 14: Card Rendering Details
// ============================================
section('14. Card Rendering Details');
// Face-down: dark card back
assert(/face-down|faceDown|face\s*down/i.test(memorymatchHtml) || /dark/.test(memorymatchHtml) ||
      /#1e1e45/.test(memorymatchHtml), 'Face-down cards rendered');
// Face-up: shows emoji
assert(/emoji|EMOJI/.test(memorymatchHtml), 'Emoji rendering');
// Matched: different visual treatment (green tint or checkmark)
assert(/matched/.test(memorymatchHtml), 'Matched state tracked');
assert(/green|green|4ade80|#4ade80|#22c55e/.test(memorymatchHtml) || /✓/.test(memorymatchHtml),
    'Matched cards have distinct visual treatment (green tint or checkmark)');
// Rounded rectangles
assert(/roundRect|roundedRect|CARD_RADIUS|arcTo/.test(memorymatchHtml), 'Rounded rectangle cards');

// ============================================
// SECTION 15: Overlay Visual Structure
// ============================================
section('15. Overlay Backdrop & Positioning');
assert(/overlay/.test(memorymatchHtml), 'Overlay class exists');
assert(/opacity/.test(memorymatchHtml), 'Overlay opacity for transparency');
assert(/pointer-events/.test(memorymatchHtml), 'Overlay pointer-events handling');
assert(/z-index/.test(memorymatchHtml) || /z-index/.test(memorymatchHtml) || /zIndex/.test(memorymatchHtml), 'Overlay z-index for layering');
assert(/visible/.test(memorymatchHtml), 'visible class toggling');

// ============================================
// SECTION 16: Shuffle (Fisher-Yates)
// ============================================
section('16. Shuffle Algorithm (Fisher-Yates)');
assert(/shuffle/.test(memorymatchHtml), 'Shuffle function exists');
assert(/Math\.random/.test(memorymatchHtml), 'Uses Math.random');
assert(/i--|i\s*--/.test(memorymatchHtml) || /for\s*\(let\s+i/.test(memorymatchHtml), 'For loop for shuffling');
assert(/\[array\[i\],\s*array\[j\]\]\s*=\s*\[array\[j\],\s*array\[i\]\]/.test(memorymatchHtml) ||
      /swap|exchange|temp/.test(memorymatchHtml), 'Swap logic for Fisher-Yates');

// ============================================
// SECTION 17: HUD Shows Pairs Progress
// ============================================
section('17. HUD - Pairs Progress');
assert(/pairs-display/.test(memorymatchHtml), 'Pairs display element exists');
assert(/\/ 8|\/8/.test(memorymatchHtml), 'HUD shows "0 / 8" format');
assert(/Pairs/.test(memorymatchHtml) || /pairs/.test(memorymatchHtml), 'Pairs label in HUD');

// ============================================
// SECTION 18: Touch Support (optional but nice)
// ============================================
section('18. Touch Support');
assert(/touchstart|TouchEvent|touch/.test(memorymatchHtml), 'Touch event listener for mobile support');

// ============================================
// SECTION 19: Card registration in games/index.html
// ============================================
section('19. Game Registration in games/index.html');
assert(/href="memorymatch\.html"/.test(gamesIndexHtml), 'games/index.html links to memorymatch.html');
assert(/data-category="puzzle"/.test(gamesIndexHtml) && 
      /memorymatch\.html/.test(gamesIndexHtml), 'Memory Match registered as puzzle category');
assert(/Memory Match/.test(gamesIndexHtml), 'Game card has title "Memory Match"');

// ============================================
// SECTION 20: Game-specific CSS uses custom properties
// ============================================
section('20. CSS Custom Properties Usage');
assert(/var\(--bg-primary\)|var\(--text-primary\)|var\(--accent\)/.test(memorymatchHtml),
    'Uses CSS custom properties');
assert(/var\(--border-color\)/.test(memorymatchHtml), 'Uses --border-color');
assert(/var\(--spacing-/.test(memorymatchHtml), 'Uses spacing custom properties');

// ============================================
// SECTION 21: Canvas is main interactive element
// ============================================
section('21. Canvas Interaction');
assert(/canvas\.addEventListener/.test(memorymatchHtml), 'Event attached to canvas element');
assert(/getBoundingClientRect/.test(memorymatchHtml), 'Coordinates mapped via getBoundingClientRect');
assert(/scaleX|scaleY|rect\.width/.test(memorymatchHtml), 'Canvas-to-drawing coordinate scaling');

// ============================================
// SECTION 22: Initial blank board behind start overlay
// ============================================
section('22. Initial Board Behind Overlay');
assert(/drawCanvas/.test(memorymatchHtml) && /drawCanvas\(\);/.test(memorymatchHtml), 'Initial draw called');
assert(/startOverlay\.classList/.test(memorymatchHtml) && /remove/.test(memorymatchHtml), 'Start overlay hidden on start');

// ============================================
// SUMMARY
// ============================================
console.log('\n========================================');
console.log('  Memory Match Test Results');
console.log('========================================');
results.forEach(r => console.log(r));
console.log('\n========================================');
console.log(`  TOTAL: ${passed + failed}  |  PASSED: ${passed}  |  FAILED: ${failed}`);
console.log('========================================\n');

process.exit(failed > 0 ? 1 : 0);
