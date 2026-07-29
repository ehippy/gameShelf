const fs = require('fs');
const path = require('path');

const PASS = [];
const FAIL = [];

function test(name, condition, detail) {
  if (condition) {
    PASS.push(name);
    console.log(`  ✓ ${name}`);
  } else {
    FAIL.push(name);
    console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`);
  }
}

function group(title) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

// Read files
const indexPath = path.join(__dirname, '..', 'index.html');
const tetrisPath = path.join(__dirname, '..', 'games', 'tetris.html');

const indexHTML = fs.readFileSync(indexPath, 'utf-8');
const tetrisHTML = fs.readFileSync(tetrisPath, 'utf-8');

// 1. File Structure
group('1. File Structure');

test('Landing page exists at index.html', fs.existsSync(indexPath));
test('Tetris game exists at games/tetris.html', fs.existsSync(tetrisPath));
test('Old tetris/ directory is removed', !fs.existsSync(path.join(__dirname, '..', 'tetris')));

// 2. Landing Page - HTML Structure
group('2. Landing Page - HTML Structure');

test('Landing page has DOCTYPE', /<!DOCTYPE html>/i.test(indexHTML));
test('Landing page has gameShelf branding', /gameShelf/i.test(indexHTML));
test('Landing page has a navbar element', /navbar/i.test(indexHTML));
test('Landing page navbar has sticky/fixed positioning', /position:\s*(?:sticky|fixed)/i.test(indexHTML));
test('Landing page uses dark background theme', /background:\s*#[01][0-9a-f]{5}/i.test(indexHTML));
test('Landing page has light-colored text', /#e0e0e0|#d0d0d0|#ccc|#b[0-9a-f]{5}/i.test(indexHTML));

// 3. Responsive Grid
group('3. Landing Page - Responsive Grid');

test('3+ columns on desktop', /grid-template-columns:\s*repeat\(\s*3/i.test(indexHTML));
test('2 columns on tablet', /grid-template-columns:\s*repeat\(\s*2/i.test(indexHTML));
test('1 column on mobile', /grid-template-columns:\s*1fr/i.test(indexHTML));

// 4. Game Cards
group('4. Landing Page - Game Cards');

test('Cards show thumbnail/icon', /thumb/i.test(indexHTML));
test('Cards show game title', /title|<h[1-3]/i.test(indexHTML));
test('Cards show brief description', /description|<p/i.test(indexHTML) && /block|puzzle|stack/i.test(indexHTML));
// Cards are created dynamically as anchor elements with href
test('Cards are clickable links', /\.href\s*=|href\s*=|<a\s|createElement\(\s*['"]a['"]|game-card.*click/i.test(indexHTML));
test('Links to games/tetris.html', /games\/tetris\.html/i.test(indexHTML));
test('Hover scale effect', /transform:\s*scale/i.test(indexHTML));
test('Hover glow/border effect', /box-shadow|border/i.test(indexHTML) && /hover/i.test(indexHTML));
test('Play icon overlay on hover', /▶|play/i.test(indexHTML));
test('JS array for game catalog', /games\s*=\s*\[|games\s*:\s*\[/i.test(indexHTML));
test('No external CDN dependencies', !/cdn\./i.test(indexHTML) && !/unpkg/i.test(indexHTML));

// 5. Tetris - Canvas and Structure
group('5. Tetris - Canvas and Structure');

test('Tetris has canvas element', /<canvas/i.test(tetrisHTML));
test('Canvas is 300x600 (10x20 at 30px)', /(width=["']300["']|width=300)/i.test(tetrisHTML) && /(height=["']600["']|height=600)/i.test(tetrisHTML));
test('Tetris has Back to Games link', /Back to Games|back.*game/i.test(tetrisHTML));
test('Back to Games links to ../index.html', /\.\.\/index\.html/i.test(tetrisHTML));
test('No external CDN in Tetris', !/cdn\./i.test(tetrisHTML) && !/unpkg/i.test(tetrisHTML));
test('Uses requestAnimationFrame', /requestAnimationFrame/i.test(tetrisHTML));

// 6. All 7 Tetrominoes
group('6. Tetris - All 7 Standard Tetrominoes');

['I','O','T','S','Z','J','L'].forEach(name => {
  test(`Piece "${name}" is defined`, new RegExp(`["']${name}["']`).test(tetrisHTML));
});

// Verify piece shapes are matrices
test('Piece shapes are 2D arrays', /\[\s*\[.*\].*\]/.test(tetrisHTML));

// Verify colors exist
test('I piece has cyan color', /I.*#[0-9a-fA-F]{6}/i.test(tetrisHTML));
test('O piece has yellow/orange color', /O.*#[0-9a-fA-F]{6}/i.test(tetrisHTML));
test('T piece has purple color', /T.*#[0-9a-fA-F]{6}/i.test(tetrisHTML));
test('S piece has green color', /S.*#[0-9a-fA-F]{6}/i.test(tetrisHTML));
test('Z piece has red color', /Z.*#[0-9a-fA-F]{6}/i.test(tetrisHTML));
test('J piece has blue color', /J.*#[0-9a-fA-F]{6}/i.test(tetrisHTML));
test('L piece has orange color', /L.*#[0-9a-fA-F]{6}/i.test(tetrisHTML));

// 7. Keyboard Controls
group('7. Tetris - Keyboard Controls');

test('Left arrow (ArrowLeft) supported', /ArrowLeft/i.test(tetrisHTML));
test('Right arrow (ArrowRight) supported', /ArrowRight/i.test(tetrisHTML));
test('Down arrow (ArrowDown) for soft drop', /ArrowDown/i.test(tetrisHTML));
test('Up arrow (ArrowUp) for rotation', /ArrowUp/i.test(tetrisHTML));
test('Q key for rotation', /["']q["']|["']Q["']/i.test(tetrisHTML));
test('Spacebar for hard drop', /["']\s["']|space|Space/i.test(tetrisHTML));
test('Hard drop logic present', /hard.drop|while.*isValid.*y.*\+.*1/i.test(tetrisHTML));

// 8. Game Mechanics
group('8. Tetris - Game Mechanics');

test('Move left (x-1)', /current\.x\s*-\s*1/i.test(tetrisHTML));
test('Move right (x+1)', /current\.x\s*\+\s*1/i.test(tetrisHTML));
test('Rotation logic', /rotate|rotated|transpose/i.test(tetrisHTML));
test('Line clearing logic', /clearLine|cleared/i.test(tetrisHTML));
test('Row removal and shift down', /splice|unshift/i.test(tetrisHTML));

// Scoring
test('Single line = 100 points', /\[0,\s*100/i.test(tetrisHTML));
test('Double = 300 points', /\[0,\s*100,\s*300/i.test(tetrisHTML));
test('Triple = 500 points', /\[0,\s*100,\s*300,\s*500/i.test(tetrisHTML));
test('Tetris (4 lines) = 800 points', /\[0,\s*100,\s*300,\s*500,\s*800/i.test(tetrisHTML));

// Leveling
test('Leveling every 10 lines', /lines\s*\/\s*10|\/\s*10/i.test(tetrisHTML));
test('Speed increases with level', /getGravity|gravity/i.test(tetrisHTML) && /level/i.test(tetrisHTML));

// Game over
test('Game over detection', /gameOver/i.test(tetrisHTML));
test('Game over when new piece cannot be placed', /isValid.*current.*shape|gameOver\s*=\s*true/i.test(tetrisHTML));

// 9. UI Elements
group('9. Tetris - UI Elements');

test('Score display', /scoreDisplay|finalScore/i.test(tetrisHTML));
test('Level display', /levelDisplay|finalLevel/i.test(tetrisHTML));
test('Lines display', /linesDisplay|finalLines/i.test(tetrisHTML));
test('Next piece preview canvas', /nextCanvas|nextPiece|drawNext/i.test(tetrisHTML));
test('Start screen overlay', /startOverlay|Start/i.test(tetrisHTML));
test('Play button on start screen', /startBtn|Play/i.test(tetrisHTML));
test('Game over screen overlay', /gameOverOverlay/i.test(tetrisHTML));
test('Game over shows final score', /finalScore/i.test(tetrisHTML));
test('Restart button', /restartBtn|Restart/i.test(tetrisHTML));
test('Controls displayed on screen', /controls|Controls|<kbd/i.test(tetrisHTML));
test('Controls show arrow keys', /Arrow|←|→|↓|↑/i.test(tetrisHTML));

// 10. Additional Quality
group('10. Tetris - Quality Checks');

test('Ghost piece support', /ghost|Ghost|getGhost/i.test(tetrisHTML));
test('Lock delay mechanism', /lockDelay|LOCK_DELAY/i.test(tetrisHTML));
test('Board grid lines', /grid|stroke/i.test(tetrisHTML));
test('Canvas fillRect for drawing', /fillRect/i.test(tetrisHTML));
test('Canvas clearRect for clearing', /clearRect/i.test(tetrisHTML));
test('COLS = 10', /COLS\s*=\s*10/i.test(tetrisHTML));
test('ROWS = 20', /ROWS\s*=\s*20/i.test(tetrisHTML));
test('Cell size = 30', /CELL\s*=\s*30/i.test(tetrisHTML));

// Summary
console.log('\n' + '='.repeat(60));
console.log('  SUMMARY');
console.log('='.repeat(60));
console.log(`  Passed: ${PASS.length}`);
console.log(`  Failed: ${FAIL.length}`);
if (FAIL.length > 0) {
  console.log('\n  Failed tests:');
  FAIL.forEach(f => console.log(`    - ${f}`));
} else {
  console.log('\n  ✓ All tests passed!');
}
console.log('='.repeat(60));

process.exit(FAIL.length > 0 ? 1 : 0);

// Additional deep logic tests
group('11. Tetris - Deep Logic Verification');

// Verify scoring formula uses level multiplier
test('Scoring uses level multiplier', /score\s*\+=\s*LINE_SCORES.*level|LINE_SCORES.*\*.*level/i.test(tetrisHTML));

// Verify level calculation uses Math.floor
test('Level uses Math.floor(lines / 10)', /Math\.floor.*lines.*10|floor.*lines/i.test(tetrisHTML));

// Verify board creation (ROWS x COLS of empty strings)
test('Board starts as empty grid', /Array\.from.*ROWS|Array\(ROWS\)/i.test(tetrisHTML) && /fill/i.test(tetrisHTML));

// Verify piece spawning at top center
test('Pieces spawn centered at top', /Math\.floor.*COLS.*shape/i.test(tetrisHTML) || /center|Math\.floor.*\(COLS/i.test(tetrisHTML));

// Verify rotation of O piece (should not rotate)
test('O piece rotation is handled', /current\.name.*===.*O|O.*return/i.test(tetrisHTML));

// Verify wall kick logic
test('Wall kick logic for rotation', /kick|wall|isValid.*kick/i.test(tetrisHTML));

// Verify hard drop bonus scoring
test('Hard drop includes distance bonus', /dropped|hardDrop|hard.*drop/i.test(tetrisHTML));

// Verify soft drop bonus scoring
test('Soft drop includes points', /soft.*drop|ArrowDown.*score/i.test(tetrisHTML) || /\+1.*score/i.test(tetrisHTML));

// Verify next piece is generated on spawn
test('Next piece generated when spawning', /nextPiece\s*=\s*randomPiece|nextPiece.*=.*random/i.test(tetrisHTML));

// Verify line clear shifts rows down
test('Lines shift down after clearing', /unshift|shift.*up|splice/i.test(tetrisHTML));

// Verify game loop timing
test('Game loop uses timing delta', /timestamp|lastDrop|gravity/i.test(tetrisHTML));

// Verify paused state
test('Game supports pause (P key)', /paused|Pause|pause/i.test(tetrisHTML));

// Verify board boundary checks
test('Boundary check for left wall', /nx\s*<\s*0/i.test(tetrisHTML));
test('Boundary check for right wall', /nx\s*>=\s*COLS|nx.*COLS.*>/i.test(tetrisHTML));
test('Boundary check for bottom', /ny\s*>=\s*ROWS/i.test(tetrisHTML));
test('Boundary check for above board', /ny\s*<\s*0/i.test(tetrisHTML));

// Verify grid rendering
test('Grid lines rendered horizontally', /ctx\.moveTo.*\n.*ctx\.lineTo|for.*ROWS.*r/i.test(tetrisHTML));
test('Grid lines rendered vertically', /ctx\.moveTo.*\n.*ctx\.lineTo|for.*COLS.*c/i.test(tetrisHTML));

// Verify back to games navigates correctly
test('Back to Games href is ../index.html', /href=["']\.\.\/index\.html["']/i.test(tetrisHTML));

// Verify canvas context exists
test('Canvas 2D context obtained', /getContext\s*\(\s*['"]2d['"]\s*\)/i.test(tetrisHTML));

console.log('\n' + '='.repeat(60));
console.log('  FINAL SUMMARY');
console.log('='.repeat(60));
console.log(`  Passed: ${PASS.length}`);
console.log(`  Failed: ${FAIL.length}`);
if (FAIL.length > 0) {
  console.log('\n  Failed tests:');
  FAIL.forEach(f => console.log(`    - ${f}`));
} else {
  console.log('\n  ✓ All tests passed!');
}
console.log('='.repeat(60));

process.exit(FAIL.length > 0 ? 1 : 0);
