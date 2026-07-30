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
// READ HTML FILES
// ============================================
const minesweeperHtml = fs.readFileSync(path.join(__dirname, 'games', 'minesweeper.html'), 'utf-8');
const rootIndexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');

// ============================================
// SECTION 1: File existence
// ============================================
section('1. File Existence');
assert(fs.existsSync(path.join(__dirname, 'games', 'minesweeper.html')),
    'games/minesweeper.html exists');

// ============================================
// SECTION 2: Canvas element
// ============================================
section('2. Canvas Element (400×400)');
assert(minesweeperHtml.includes('id="gameCanvas"'), 'Canvas has id="gameCanvas"');
assert(/id="gameCanvas"[\s\S]*?width="400"/.test(minesweeperHtml), 'Canvas width=400');
assert(/id="gameCanvas"[\s\S]*?height="400"/.test(minesweeperHtml), 'Canvas height=400');

// ============================================
// SECTION 3: Grid dimensions and mine count
// ============================================
section('3. Grid Dimensions (16×16) and Mine Count (10)');
assert(/const\s+COLS\s*=\s*16/.test(minesweeperHtml), 'Grid has 16 columns');
assert(/const\s+ROWS\s*=\s*16/.test(minesweeperHtml), 'Grid has 16 rows');
assert(/const\s+MINES\s*=\s*10/.test(minesweeperHtml), 'Mine count is 10');
assert(/const\s+CELL\s*=\s*CANVAS_SIZE\s*\/\s*COLS/.test(minesweeperHtml), 'Cell size = 25px (400/16)');

// ============================================
// SECTION 4: Overlays (Start overlay with game name and Start button)
// ============================================
section('4. Start Overlay');
assert(minesweeperHtml.includes('id="startOverlay"'), 'Start overlay element exists');
assert(minesweeperHtml.includes('id="gameOverOverlay"'), 'Game Over overlay element exists');
assert(minesweeperHtml.includes('id="winOverlay"'), 'Win overlay element exists');
assert(/💣\s*Minesweeper/.test(minesweeperHtml) || /Minesweeper/.test(minesweeperHtml), 'Start overlay shows game name');
assert(/Start Game|Start\s*Game|▶ Start/.test(minesweeperHtml), 'Start overlay has Start button');

// ============================================
// SECTION 5: Arrow keys move cursor
// ============================================
section('5. Arrow Key Navigation');
assert(/ArrowUp/.test(minesweeperHtml), 'ArrowUp key handler exists');
assert(/ArrowDown/.test(minesweeperHtml), 'ArrowDown key handler exists');
assert(/ArrowLeft/.test(minesweeperHtml), 'ArrowLeft key handler exists');
assert(/ArrowRight/.test(minesweeperHtml), 'ArrowRight key handler exists');
assert(/cursorX/.test(minesweeperHtml) && /cursorY/.test(minesweeperHtml), 'Cursor X and Y tracked');

// ============================================
// SECTION 6: Space/Enter reveal cell
// ============================================
section('6. Space / Enter to Reveal');
assert(/Space/.test(minesweeperHtml) || /' '/.test(minesweeperHtml), 'Space key handler exists');
assert(/Enter/.test(minesweeperHtml), 'Enter key handler exists');
assert(/revealCell/.test(minesweeperHtml), 'revealCell function exists');
// Check Space/Enter maps to reveal in keydown handler
assert(/e\.code\s*===\s*['"]Space['"]/.test(minesweeperHtml) || /e\.code\s*===\s*['"]Enter['"]/.test(minesweeperHtml), 'Space and Enter key checks in handler');

// ============================================
// SECTION 7: R key toggles flag
// ============================================
section('7. R Key to Toggle Flag');
assert(/KeyR/.test(minesweeperHtml), 'R key handler exists');
assert(/toggleFlag/.test(minesweeperHtml), 'toggleFlag function exists');
assert(/flagged/.test(minesweeperHtml), 'Flagged state tracked');
assert(/cell\.flagged/.test(minesweeperHtml), 'Cell flagged property used');

// ============================================
// SECTION 8: Revealing mine = game over with overlay
// ============================================
section('8. Game Over on Mine Reveal');
assert(/gameover/.test(minesweeperHtml), 'gameover state exists');
assert(/endGame/.test(minesweeperHtml), 'endGame function exists');
assert(/gameOverOverlay/.test(minesweeperHtml), 'gameOverOverlay shown on game over');
assert(/Game Over|game over|gameover/i.test(minesweeperHtml), 'Game Over text in overlay');
// Check that revealed mine cell shows bomb emoji
assert(/'💣'/.test(minesweeperHtml), 'Bomb emoji shown on game over');

// ============================================
// SECTION 9: Flood fill for zero-count cells
// ============================================
section('9. Flood Fill for Empty Cells');
assert(/flood/.test(minesweeperHtml), 'Flood fill referenced in code');
assert(/adjacentMines\s*===\s*0/.test(minesweeperHtml), 'Zero-count cells trigger flood fill');
assert(/getNeighbors/.test(minesweeperHtml), 'Neighbor checking exists for flood fill');

// ============================================
// SECTION 10: Numbers show adjacent mine count
// ============================================
section('10. Number Colors (Adjacent Mine Count)');
// Classic Minesweeper number colors
assert(/1\s*:\s*['"]#0000ff['"]/.test(minesweeperHtml), '1 = blue');
assert(/2\s*:\s*['"]#008000['"]/.test(minesweeperHtml), '2 = green');
assert(/3\s*:\s*['"]#ff0000['"]/.test(minesweeperHtml), '3 = red');
assert(/4\s*:\s*['"]#000080['"]/.test(minesweeperHtml), '4 = dark blue');
assert(/5\s*:\s*['"]#800000['"]/.test(minesweeperHtml), '5 = maroon');
assert(/6\s*:\s*['"]#008080['"]/.test(minesweeperHtml), '6 = teal');
assert(/7\s*:\s*['"]#000000['"]/.test(minesweeperHtml), '7 = black');
assert(/8\s*:\s*['"]#808080['"]/.test(minesweeperHtml), '8 = gray');
assert(/adjacentMines/.test(minesweeperHtml), 'adjacent mines counting');

// ============================================
// SECTION 11: HUD (mine counter, timer, smiley)
// ============================================
section('11. HUD Bar');
assert(/mineCounter/.test(minesweeperHtml), 'Mine counter element exists');
assert(/timer/.test(minesweeperHtml), 'Timer element exists');
assert(/smileyBtn|smiley/.test(minesweeperHtml), 'Smiley button exists');
assert(/😀/.test(minesweeperHtml), 'Smiley face emoji used');
assert(/padStart\s*\(\s*3\s*,\s*['"]0['"]/.test(minesweeperHtml), 'Timer is 3-digit zero-padded');
// Mine counter shows total minus flags
assert(/MINES\s*-\s*flagCount/.test(minesweeperHtml), 'Mine counter = total mines - flags');

// ============================================
// SECTION 12: Win condition overlay with time
// ============================================
section('12. Win Condition');
assert(/win/.test(minesweeperHtml), 'win state exists');
assert(/You Win/.test(minesweeperHtml) || /winOverlay/.test(minesweeperHtml), 'Win overlay exists');
assert(/COLS\s*\*\s*ROWS\s*-\s*MINES/.test(minesweeperHtml), 'Win checks all non-mine cells revealed');
assert(/winTime/.test(minesweeperHtml), 'Win time display exists');
assert(/playAgain|Play Again/.test(minesweeperHtml), 'Win overlay has restart button');

// ============================================
// SECTION 13: Mines never on first-revealed cell
// ============================================
section('13. First-Reveal Cell Protection');
assert(/firstReveal/.test(minesweeperHtml), 'First reveal tracking exists');
assert(/placeMines/.test(minesweeperHtml), 'placeMines function exists');
assert(/minesPlaced/.test(minesweeperHtml), 'Mines placed tracking exists');
// Verify mines are placed AFTER first reveal, not at init
const initBoardFn = minesweeperHtml.split('function initBoard')[1].split('function')[0];
assert(!/mine:\s*true/.test(initBoardFn), 'Mines not placed during initBoard');

// ============================================
// SECTION 14: Card links in index.html files
// ============================================
section('14. Card Registration in index.html files');
assert(/href="games\/minesweeper\.html"/.test(rootIndexHtml), 'Root index.html links to games/minesweeper.html');
assert(/data-category="puzzle"/.test(rootIndexHtml), 'Root index.html category is puzzle');

// ============================================
// SECTION 15: Header structure
// ============================================
section('15. Page Header');
assert(/class="game-header"/.test(minesweeperHtml), 'Header uses game-header class');
assert(/class="logo"/.test(minesweeperHtml) && /gameShelf/.test(minesweeperHtml), 'Logo with gameShelf text');
assert(/game-title/.test(minesweeperHtml), 'Title element has game-title class');
assert(/Minesweeper/.test(minesweeperHtml), 'Title "Minesweeper" present in header');
// Check back link
assert(/\.\.\/index\.html/.test(minesweeperHtml), 'Back link to ../index.html exists');

// ============================================
// SECTION 16: Footer structure
// ============================================
section('16. Page Footer');
assert(/class="site-footer"/.test(minesweeperHtml), 'Footer uses site-footer class');
// Home link
const homeLink = /<a href="\.\.\/index\.html">Home<\/a>/;
assert(homeLink.test(minesweeperHtml), 'Footer has Home link (href="../index.html")');
// All Games link
assert(/\.\.\/index\.html/.test(minesweeperHtml), 'Footer has All Games link to ../index.html');

// ============================================
// SECTION 17: Cell rendering details
// ============================================
section('17. Cell Rendering');
// Beveled hidden cells (classic look)
assert(/#c0c0c0/.test(minesweeperHtml), 'Hidden cells use light gray');
assert(/#d0d0d0/.test(minesweeperHtml), 'Revealed cells use darker gray');
// Bevel edges
assert(/#808080/.test(minesweeperHtml), 'Dark edge color (#808080)');
assert(/#a0a0a0/.test(minesweeperHtml), 'Medium edge color (#a0a0a0)');
assert(/#e0e0e0/.test(minesweeperHtml), 'Light edge color (#e0e0e0)');
// Cursor highlight
assert(/rgba\(0,\s*212,\s*255,\s*0\.35\)/.test(minesweeperHtml), 'Cursor highlight color');
// Flag emoji
assert(/'🚩'/.test(minesweeperHtml), 'Flag emoji rendered');
// 1px cell spacing/gap
assert(/gap\s*=\s*1/.test(minesweeperHtml), '1px cell gap');

// ============================================
// SECTION 18: Flag cannot reveal
// ============================================
section('18. Flagged Cells Cannot Be Revealed');
// Check that flagged cells are skipped in revealCell
const revealCellFn = minesweeperHtml.split('function revealCell')[1].split('function')[0];
assert(/flagged/.test(revealCellFn), 'Flag check inside revealCell');

// ============================================
// SECTION 19: Timer stops on game over / win
// ============================================
section('19. Timer Behavior');
assert(/stopTimer/.test(minesweeperHtml), 'Timer stop function exists');
assert(/startTimer/.test(minesweeperHtml), 'Timer start function exists');
// Timer should stop in endGame
const endGameFn = minesweeperHtml.split('function endGame')[1].split('function')[0];
assert(/stopTimer/.test(endGameFn), 'Timer stops in endGame');

// ============================================
// SECTION 20: Game state transitions
// ============================================
section('20. Game State Management');
assert(/'start'/.test(minesweeperHtml) || /start:/.test(minesweeperHtml), 'start state present');
assert(/'playing'/.test(minesweeperHtml) || /playing:/.test(minesweeperHtml), 'playing state present');
assert(/'gameover'/.test(minesweeperHtml) || /gameover:/.test(minesweeperHtml), 'gameover state present');
assert(/'win'/.test(minesweeperHtml) || /win:/.test(minesweeperHtml), 'win state present');

// ============================================
// SECTION 21: Smiley button restarts game
// ============================================
section('21. Smiley Restart Button');
assert(/smileyBtn/.test(minesweeperHtml), 'Smiley button exists');
assert(/smileyBtn.*addEventListener|smileyBtn.*click/.test(minesweeperHtml), 'Smiley has event handler');

// ============================================
// SECTION 22: ESC key restarts game
// ============================================
section('22. ESC Key Restart');
assert(/Escape/.test(minesweeperHtml), 'Escape key handler exists');
const keyDownFn = minesweeperHtml.split('keydown')[1]?.split('});')[0] || '';
assert(/Escape/.test(keyDownFn), 'Escape key in keydown handler');

// ============================================
// SECTION 23: Negative mine counter possible
// ============================================
section('23. Negative Mine Counter');
// The mine counter should allow negative (no clamping to 0)
assert(/MINES\s*-\s*flagCount/.test(minesweeperHtml), 'Mine counter = MINES - flagCount');
assert(/remaining\s*<\s*0/.test(minesweeperHtml) || /MINES\s*-\s*flagCount/.test(minesweeperHtml), 'Negative counter allowed');

// ============================================
// SECTION 24: HTML structure - header with back link and footer
// ============================================
section('24. Page Structure (header + footer)');
assert(/<header[\s\S]*?class="game-header"/.test(minesweeperHtml), '<header> with game-header class');
assert(/<footer[\s\S]*?class="site-footer"/.test(minesweeperHtml), '<footer> with site-footer class');
assert(minesweeperHtml.indexOf('</header>') < minesweeperHtml.indexOf('</footer>'), 'Header comes before footer');

// ============================================
// SECTION 25: Game starts in waiting state with overlay
// ============================================
section('25. Initial Waiting State');
assert(/gameState\s*=\s*['"]start['"]/.test(minesweeperHtml), 'Initial state is start');
assert(/startOverlay/.test(minesweeperHtml), 'Start overlay referenced');
// Ensure game doesn't auto-start
const initSection = minesweeperHtml.split('})();')[0];
assert(/startOverlay/.test(initSection) && /hidden/.test(initSection), 'Game starts with overlays managed');

// ============================================
// SECTION 26: Canvas wrapper
// ============================================
section('26. Canvas Wrapper');
assert(/canvas-wrapper/.test(minesweeperHtml), 'Canvas wrapper div exists');
assert(/score-bar/.test(minesweeperHtml), 'Score bar class exists');

console.log('\n========================================');
console.log('  Minesweeper Test Results');
console.log('========================================');
results.forEach(r => console.log(r));
console.log('\n========================================');
console.log(`  TOTAL: ${passed + failed}  |  PASSED: ${passed}  |  FAILED: ${failed}`);
console.log('========================================\n');

process.exit(failed > 0 ? 1 : 0);
