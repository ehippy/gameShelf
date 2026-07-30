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
assert(/initBoard/.test(minesweeperHtml), 'initBoard function exists');

// ============================================
// SECTION 26: Canvas wrapper
// ============================================
section('26. Canvas Wrapper');
assert(/canvas-wrapper/.test(minesweeperHtml), 'Canvas wrapper div exists');
assert(/score-bar/.test(minesweeperHtml), 'Score bar class exists');

// ============================================
// SECTION 27: Canvas size in DOM matches constants
// ============================================
section('27. DOM Canvas Attributes Match Constants');
assert(/width="400".*height="400"/.test(minesweeperHtml), 'DOM canvas has width=400 height=400');
assert(/CANVAS_SIZE\s*=\s*400/.test(minesweeperHtml), 'CANVAS_SIZE constant = 400');

// ============================================
// SECTION 28: Score bar layout
// ============================================
section('28. Score Bar Layout');
assert(/Mine|Mines|mine/.test(minesweeperHtml), 'Score bar has mine label');
assert(/Time|time|Timer|timer/.test(minesweeperHtml), 'Score bar has time label');

// ============================================
// SECTION 29: Random Game Button — index.html
// ============================================
section('29. Random Game Button — Landing Page (index.html)');
// Button exists and has correct ID and class
assert(/id="randomGameBtn"/.test(rootIndexHtml), 'Random Game button has id="randomGameBtn"');
assert(/class="random-btn"/.test(rootIndexHtml), 'Random Game button has class="random-btn"');
// Button text: 🎲 emoji followed by "Play Random Game"
assert(/🎲\s*Play Random Game/.test(rootIndexHtml), 'Button displays 🎲 emoji and "Play Random Game" text');
// Button positioned after featured-section and before what-new-section
const featuredEnd = rootIndexHtml.indexOf('</section>');
const randomBtnIdx = rootIndexHtml.indexOf('randomGameBtn');
const whatNewIdx = rootIndexHtml.indexOf('what-new-section');
assert(featuredEnd < randomBtnIdx, 'Button appears after Featured Games section (</section>)');
assert(randomBtnIdx < whatNewIdx, 'Button appears before What\'s New section');

// ============================================
// SECTION 30: Random Game Button — games/index.html
// ============================================
section('30. Random Game Button — All Games Page (games/index.html)');
assert(/id="randomGameBtn"/.test(gamesIndexHtml), 'Random Game button has id="randomGameBtn" on games page');
assert(/class="random-btn"/.test(gamesIndexHtml), 'Random Game button has class="random-btn" on games page');
assert(/🎲\s*Play Random Game/.test(gamesIndexHtml), 'Button displays 🎲 emoji and "Play Random Game" text on games page');
// Button positioned before All Games heading (h2)
const h2AllGamesIdx = gamesIndexHtml.indexOf('<h2>All Games</h2>');
const gamesPageRandomBtnIdx = gamesIndexHtml.indexOf('randomGameBtn');
assert(gamesPageRandomBtnIdx < h2AllGamesIdx, 'Button appears above "All Games" heading on games page');

// ============================================
// SECTION 31: Games Catalog — all 9 games
// ============================================
section('31. Shared Games Catalog (script.js)');
const scriptJs = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf-8');
assert(/window\.gamesCatalog\s*=\s*\[/ .test(scriptJs), 'window.gamesCatalog is defined in script.js');
assert(/Math\.floor\s*\(\s*Math\.random\s*\(\s*\)\s*\s*\*\s*window\.gamesCatalog\.length\s*\)/.test(scriptJs),
    'Random selection uses Math.floor(Math.random() * gamesCatalog.length)');
// All 9 games present
assert(scriptJs.includes("'Snake'") || scriptJs.includes('"Snake"'), 'Catalog includes Snake');
assert(scriptJs.includes("'Tetris'") || scriptJs.includes('"Tetris"'), 'Catalog includes Tetris');
assert(scriptJs.includes("'2048'") || scriptJs.includes('"2048"'), 'Catalog includes 2048');
assert(scriptJs.includes("'Breakout'") || scriptJs.includes('"Breakout"'), 'Catalog includes Breakout');
assert(scriptJs.includes("'Pac-Man'") || scriptJs.includes('"Pac-Man"'), 'Catalog includes Pac-Man');
assert(scriptJs.includes("'Minesweeper'") || scriptJs.includes('"Minesweeper"'), 'Catalog includes Minesweeper');
assert(scriptJs.includes("'Tic Tac Toe'") || scriptJs.includes('"Tic Tac Toe"'), 'Catalog includes Tic Tac Toe');
assert(scriptJs.includes("'Memory Match'") || scriptJs.includes('"Memory Match"'), 'Catalog includes Memory Match');
assert(scriptJs.includes("'Simon Says'") || scriptJs.includes('"Simon Says"'), 'Catalog includes Simon Says');
// Catalog has 9 entries
const catalogMatch = scriptJs.match(/window\.gamesCatalog\s*=\s*\[([\s\S]*?)\];/);
assert(catalogMatch, 'gamesCatalog array syntax valid');
const catalogItems = catalogMatch[1].split('},').filter(s => s.trim().length > 0).length;
assert(catalogItems >= 9, `Catalog has 9 games (found ${catalogItems})`);
// Each entry has name, href, and category fields
assert(/name:\s*['"]Snake['"]/.test(scriptJs) || /'name'\s*:\s*['"]Snake['"]/.test(scriptJs), 'Entries have name field');
assert(/href:\s*['"]snake\.html['"]/.test(scriptJs) || /'href'\s*:\s*['"]snake\.html['"]/.test(scriptJs), 'Entries have href field');
assert(/category:\s*['"]arcade['"]/.test(scriptJs), 'Entries have category field');

// ============================================
// SECTION 32: Navigation logic
// ============================================
section('32. Navigation Logic');
// Uses window.location.assign (or window.location.href)
assert(/window\.location\.assign/.test(scriptJs) || /window\.location\.href\s*=/.test(scriptJs),
    'Uses window.location.assign or window.location.href to navigate');
// Context-aware path resolution for games page vs root
assert(/isGamesPage/.test(scriptJs), 'Detects games page context');
assert(/\/games\//.test(scriptJs), 'Context detection checks for /games/ in path');

// ============================================
// SECTION 33: No deduplication — same game can be picked repeatedly
// ============================================
section('33. No Deduplication');
// The random selection is a single Math.floor call — no deduplication logic
assert(scriptJs.indexOf('Math.floor') === scriptJs.lastIndexOf('Math.floor'), 'No deduplication: single random selection');

// ============================================
// SECTION 34: .random-btn styling
// ============================================
section('34. Random Button Styling (styles.css)');
const stylesCss = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf-8');
assert(/\.random-btn\s*\{/.test(stylesCss), '.random-btn class defined in styles.css');
// Bright multi-stop gradient
assert(/linear-gradient/.test(stylesCss) && /#ff006e/.test(stylesCss) && /#8338ec/.test(stylesCss) && /#3a86ff/.test(stylesCss),
    'Gradient uses vibrant multi-stop palette (#ff006e → #8338ec → #3a86ff)');
// White text
assert(/color:\s*#ffffff/.test(stylesCss), 'Button text is white (#ffffff)');
// Bold text
assert(/font-weight:\s*700/.test(stylesCss), 'Font weight is bold (700)');
// Padding
assert(/padding:\s*0\.65rem\s+1\.75rem/.test(stylesCss), 'Generous padding (0.65rem 1.75rem)');
// Rounded corners (pill shape)
assert(/border-radius:\s*var\(--radius-full\)/.test(stylesCss), 'Pill shape with --radius-full');
// No border
assert(/border:\s*none/.test(stylesCss), 'No border on button');
// Pointer cursor
assert(/cursor:\s*pointer/.test(stylesCss), 'Pointer cursor');
// Text shadow
assert(/text-shadow/.test(stylesCss) && /rgba\(0,\s*0,\s*0,\s*0\.3\)/.test(stylesCss), 'Subtle dark text shadow for contrast');
// Box shadow
assert(/box-shadow/.test(stylesCss) && /rgba\(131,\s*56,\s*236,\s*0\.3\)/.test(stylesCss), 'Soft purple box shadow');
// Hover: brightness increase
assert(/\.random-btn:hover/.test(stylesCss) && /filter:\s*brightness\(\s*1\.1\s*\)/.test(stylesCss), 'Hover increases brightness');
// Hover: upward transform
assert(/transform:\s*translateY\(\s*-2px\s*\)/.test(stylesCss), 'Hover lifts button (translateY(-2px))');
// Transition
assert(/transition:\s*all\s+0\.25s\s+ease/.test(stylesCss), 'Smooth 0.25s transition on all properties');

// ============================================
// SECTION 35: Footer text unchanged on all pages
// ============================================
section('35. Footer Text Consistency');
assert(/©\s*2025\s+gameShelf\s*—\s*All games built in browser\s*—\s*no downloads required/.test(rootIndexHtml),
    'Root index.html footer text unchanged');
assert(/©\s*2025\s+gameShelf\s*—\s*All games built in browser\s*—\s*no downloads required/.test(gamesIndexHtml),
    'games/index.html footer text unchanged');

// ============================================
// SECTION 36: Timer only starts on first reveal
// ============================================
section('36. Timer Only Starts on First Reveal');

// Check that beginPlaying does NOT call startTimer
const beginPlayingFn = minesweeperHtml.split('function beginPlaying')[1]?.split('function')[0] || '';
assert(!beginPlayingFn.includes('startTimer'), 'beginPlaying() does NOT call startTimer');

// Check that handleFirstReveal DOES call startTimer
const handleFirstRevealFn = minesweeperHtml.split('function handleFirstReveal')[1]?.split('function')[0] || '';
assert(handleFirstRevealFn.includes('startTimer'), 'handleFirstReveal() calls startTimer');
assert(handleFirstRevealFn.includes('beginPlaying'), 'handleFirstReveal() calls beginPlaying');

// Check that startBtn handler does NOT call startTimer
const startBtnHandler = minesweeperHtml.match(/startBtn\.addEventListener\('click'[\s\S]*?\n\s*\}\);/);
assert(startBtnHandler, 'startBtn click handler exists');
assert(startBtnHandler[0] && !startBtnHandler[0].includes('startTimer'), 'startBtn click handler does NOT start timer');
assert(startBtnHandler[0] && startBtnHandler[0].includes("gameState = 'start'"), 'startBtn sets gameState to start');
assert(startBtnHandler[0] && startBtnHandler[0].includes("startOverlay.classList.add('hidden')"), 'startBtn hides overlay');

// Check that handleFirstReveal sets minesPlaced = true
assert(handleFirstRevealFn.includes('minesPlaced = true'), 'handleFirstReveal sets minesPlaced = true');

// Check that handleFirstReveal is called from start-state keyboard handler
const startStateBlock = minesweeperHtml.match(/if \(gameState === ['"]start['"]\)[\s\S]*?if \(gameState === ['"]gameover['"]/);
assert(startStateBlock, 'Start-state keydown block exists');
assert(startStateBlock[0] && startStateBlock[0].includes('handleFirstReveal'), 'handleFirstReveal called from start-state keydown handler');
assert(startStateBlock[0] && /Enter|Space/.test(startStateBlock[0]), 'HandleFirstReveal triggered on Enter/Space in start state');

// Check that mouse click handler allows first reveal from 'start' state
const mouseClickHandler = minesweeperHtml.match(/canvas\.addEventListener\('click'[\s\S]*?\n\s*\}\);/);
assert(mouseClickHandler, 'Mouse click handler exists');
assert(mouseClickHandler[0] && /gameState === ['"]start['"]/.test(mouseClickHandler[0]), 'Mouse handler checks for start state for first reveal');

// Check arrow keys work during 'start' state (via KEY_MAP reference)
assert(startStateBlock && /KEY_MAP/.test(startStateBlock[0]), 'Arrow keys via KEY_MAP handled during start state');
assert(startStateBlock && /cursorX/.test(startStateBlock[0]) && /cursorY/.test(startStateBlock[0]), 'Cursor moves during start state');

// ============================================
// SECTION 37: Game-over and win overlays work with accurate timer
// ============================================
section('37. Game-Over and Win Overlays with Accurate Timer');
// endGame stops timer and sets game over/win states
assert(endGameFn.includes('stopTimer'), 'endGame stops timer on game end');
assert(endGameFn.includes("gameOverOverlay"), 'gameOverOverlay shown on game over');
assert(endGameFn.includes("winOverlay"), 'winOverlay shown on win');
assert(endGameFn.includes("gameState = 'gameover'"), 'gameState set to gameover on loss');
assert(endGameFn.includes("gameState = 'win'"), 'gameState set to win on victory');
assert(endGameFn.includes("winTimeEl"), 'win time is displayed on win');

console.log('  Minesweeper Test Results');
console.log('========================================');
results.forEach(r => console.log(r));
console.log('\n========================================');
console.log(`  TOTAL: ${passed + failed}  |  PASSED: ${passed}  |  FAILED: ${failed}`);
console.log('========================================\n');

process.exit(failed > 0 ? 1 : 0);
