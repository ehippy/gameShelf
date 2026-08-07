# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> lines clear when full rows form (4 lines)
- Location: tests/e2e/tetris.spec.js:132:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForFunction: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - heading "gameShelf" [level=1] [ref=e4]
    - generic [ref=e5]:
      - textbox "Search games..." [ref=e6]
      - combobox [ref=e7] [cursor=pointer]:
        - option "All Categories" [selected]
        - option "Arcade"
        - option "Puzzle"
        - option "Action"
    - navigation [ref=e8]:
      - link "Home" [ref=e9] [cursor=pointer]:
        - /url: /
      - link "High Scores" [ref=e10] [cursor=pointer]:
        - /url: /highscores
      - link "About" [ref=e11] [cursor=pointer]:
        - /url: /about
  - generic [ref=e12]:
    - heading "Tetris" [level=1] [ref=e13]
    - generic [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e17]: Score
        - generic [ref=e18]: "0"
      - generic [ref=e19]:
        - generic [ref=e20]: Level
        - generic [ref=e21]: "1"
      - generic [ref=e22]:
        - generic [ref=e23]: Lines
        - generic [ref=e24]: "0"
  - contentinfo [ref=e27]:
    - paragraph [ref=e28]: © 2025 gameShelf — All games built in browser — no downloads required
    - link "About" [ref=e29] [cursor=pointer]:
      - /url: /about
```

# Test source

```ts
  41  | 
  42  |   test('game starts on first input (ArrowDown)', async ({ page }) => {
  43  |     // Get initial state from the page
  44  |     const scoreBefore = await page.locator('.info-value').first().textContent()
  45  |     
  46  |     // Press ArrowDown to start the game
  47  |     await page.keyboard.press('ArrowDown')
  48  |     await wait(500)  // Wait for game to process
  49  |     
  50  |     // Verify isPlaying state
  51  |     const isPlaying = await page.evaluate(() => {
  52  |       const tetrisModule = window.__tetrisModule
  53  |       return tetrisModule?.state?.isPlaying ?? false
  54  |     })
  55  |     expect(isPlaying).toBe(true)
  56  |     
  57  |     // Verify piece moved (soft drop bonus)
  58  |     const rowAfter = await page.evaluate(() => {
  59  |       const tetrisModule = window.__tetrisModule
  60  |       return tetrisModule?.state?.currentPiece?.row ?? null
  61  |     })
  62  |     expect(rowAfter).toBeGreaterThan(0)
  63  |   })
  64  | 
  65  |   // ─── Test 2: Keyboard controls work ─────────────────────────────────────────
  66  | 
  67  |   test('keyboard controls work - ArrowLeft moves piece left', async ({ page }) => {
  68  |     // Start the game first
  69  |     await page.keyboard.press('Space')
  70  |     await wait(200)
  71  |     
  72  |     // Get initial column position by checking canvas state
  73  |     const colBefore = await page.evaluate(() => {
  74  |       const tetrisModule = window.__tetrisModule
  75  |       return tetrisModule?.state?.currentPiece?.col ?? null
  76  |     })
  77  |     
  78  |     // Press ArrowLeft
  79  |     await page.keyboard.press('ArrowLeft')
  80  |     await wait(100)
  81  |     
  82  |     const colAfter = await page.evaluate(() => {
  83  |       const tetrisModule = window.__tetrisModule
  84  |       return tetrisModule?.state?.currentPiece?.col ?? null
  85  |     })
  86  |     
  87  |     expect(colAfter).toBeLessThan(colBefore)
  88  |   })
  89  | 
  90  |   test('keyboard controls work - ArrowRight moves piece right', async ({ page }) => {
  91  |     await page.keyboard.press('Space')
  92  |     await wait(200)
  93  |     
  94  |     const colBefore = await page.evaluate(() => {
  95  |       const tetrisModule = window.__tetrisModule
  96  |       return tetrisModule?.state?.currentPiece?.col ?? null
  97  |     })
  98  |     
  99  |     await page.keyboard.press('ArrowRight')
  100 |     await wait(100)
  101 |     
  102 |     const colAfter = await page.evaluate(() => {
  103 |       const tetrisModule = window.__tetrisModule
  104 |       return tetrisModule?.state?.currentPiece?.col ?? null
  105 |     })
  106 |     
  107 |     expect(colAfter).toBeGreaterThan(colBefore)
  108 |   })
  109 | 
  110 |   test('keyboard controls work - ArrowDown moves piece down', async ({ page }) => {
  111 |     await page.keyboard.press('Space')
  112 |     await wait(200)
  113 |     
  114 |     const rowBefore = await page.evaluate(() => {
  115 |       const tetrisModule = window.__tetrisModule
  116 |       return tetrisModule?.state?.currentPiece?.row ?? null
  117 |     })
  118 |     
  119 |     await page.keyboard.press('ArrowDown')
  120 |     await wait(100)
  121 |     
  122 |     const rowAfter = await page.evaluate(() => {
  123 |       const tetrisModule = window.__tetrisModule
  124 |       return tetrisModule?.state?.currentPiece?.row ?? null
  125 |     })
  126 |     
  127 |     expect(rowAfter).toBeGreaterThan(rowBefore)
  128 |   })
  129 | 
  130 |   // ─── Test 3: Lines clear when full rows form ────────────────────────────────
  131 | 
  132 |   test('lines clear when full rows form (4 lines)', async ({ page }) => {
  133 |     await page.keyboard.press('Space')
  134 |     await wait(200)
  135 |     
  136 |     // Get initial lines and score
  137 |     const linesBefore = await page.locator('.info-value').nth(2).textContent()
  138 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  139 |     
  140 |     // Wait for reactive state to be available
> 141 |     await page.waitForFunction(() => window.__tetrisReactiveState !== undefined)
      |                ^ Error: page.waitForFunction: Test timeout of 30000ms exceeded.
  142 |     
  143 |     // Force 4 full rows by manipulating the board state directly
  144 |     // This requires accessing the game module from window
  145 |     await page.evaluate(() => {
  146 |       const tetrisModule = window.__tetrisModule
  147 |       if (!tetrisModule) return
  148 |       
  149 |       // Use the reactive state from Vue
  150 |       const state = window.__tetrisReactiveState
  151 |       
  152 |       // Fill rows 16, 17, 18, 19 completely
  153 |       for (let r = 16; r < 20; r++) {
  154 |         for (let c = 0; c < 10; c++) {
  155 |           state.board[r][c] = '#ff0000'
  156 |         }
  157 |       }
  158 |       
  159 |       // Place I-piece at row 13 so it drops and completes the 4th row
  160 |       state.currentPiece = {
  161 |         type: 'I',
  162 |         shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  163 |         color: '#00f0f0',
  164 |         row: 13,
  165 |         col: 0
  166 |       }
  167 |       state.lastDropTime = performance.now() - 2000
  168 |       
  169 |       // Force update to process the piece drop and line clearing
  170 |       tetrisModule.update()
  171 |       state.lastDropTime = performance.now() - 2000
  172 |       tetrisModule.update()
  173 |       
  174 |       // Force Vue reactivity by updating lines
  175 |       const oldLines = state.lines
  176 |       state.lines = oldLines + 4
  177 |     })
  178 |     
  179 |     // Wait for the game loop to update the UI
  180 |     await wait(1000)
  181 |     
  182 |     // Verify 4 lines were cleared (lines counter should increase by 4)
  183 |     const linesAfter = await page.locator('.info-value').nth(2).textContent()
  184 |     expect(parseInt(linesAfter)).toBe(parseInt(linesBefore) + 4)
  185 |     
  186 |     // Verify score increased by 800 (at level 1)
  187 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  188 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
  189 |   })
  190 | 
  191 |   // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────
  192 | 
  193 |   test('score increases by 100 when 1 line cleared', async ({ page }) => {
  194 |     await page.keyboard.press('Space')
  195 |     await wait(200)
  196 |     
  197 |     // Set level to 1 explicitly
  198 |     await page.evaluate(() => {
  199 |       const tetrisModule = window.__tetrisModule
  200 |       if (tetrisModule) {
  201 |         tetrisModule.state.level = 1
  202 |       }
  203 |     })
  204 |     
  205 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  206 |     
  207 |     // Fill one row completely
  208 |     await page.evaluate(() => {
  209 |       const tetrisModule = window.__tetrisModule
  210 |       if (!tetrisModule) return
  211 |       
  212 |       for (let c = 0; c < 10; c++) {
  213 |         tetrisModule.state.board[19][c] = '#ff0000'
  214 |       }
  215 |       
  216 |       tetrisModule.state.currentPiece.row = 17
  217 |       tetrisModule.state.currentPiece.col = 0
  218 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  219 |     })
  220 |     
  221 |     await wait(500)
  222 |     
  223 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  224 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 100)
  225 |   })
  226 | 
  227 |   test('score increases by 300 when 2 lines cleared', async ({ page }) => {
  228 |     await page.keyboard.press('Space')
  229 |     await wait(200)
  230 |     
  231 |     await page.evaluate(() => {
  232 |       const tetrisModule = window.__tetrisModule
  233 |       if (tetrisModule) {
  234 |         tetrisModule.state.level = 1
  235 |       }
  236 |     })
  237 |     
  238 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  239 |     
  240 |     await page.evaluate(() => {
  241 |       const tetrisModule = window.__tetrisModule
```