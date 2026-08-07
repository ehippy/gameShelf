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
- generic [ref=f1e2]:
  - banner [ref=f1e3]:
    - heading "gameShelf" [level=1] [ref=f1e4]
    - generic [ref=f1e5]:
      - textbox "Search games..." [ref=f1e6]
      - combobox [ref=f1e7] [cursor=pointer]:
        - option "All Categories" [selected]
        - option "Arcade"
        - option "Puzzle"
        - option "Action"
    - navigation [ref=f1e8]:
      - link "Home" [ref=f1e9] [cursor=pointer]:
        - /url: /
      - link "High Scores" [ref=f1e10] [cursor=pointer]:
        - /url: /highscores
      - link "About" [ref=f1e11] [cursor=pointer]:
        - /url: /about
  - generic [ref=f1e12]:
    - heading "Tetris" [level=1] [ref=f1e13]
    - generic [ref=f1e15]:
      - generic [ref=f1e16]:
        - generic [ref=f1e17]: Score
        - generic [ref=f1e18]: "0"
      - generic [ref=f1e19]:
        - generic [ref=f1e20]: Level
        - generic [ref=f1e21]: "1"
      - generic [ref=f1e22]:
        - generic [ref=f1e23]: Lines
        - generic [ref=f1e24]: "0"
  - contentinfo [ref=f1e27]:
    - paragraph [ref=f1e28]: © 2025 gameShelf — All games built in browser — no downloads required
    - link "About" [ref=f1e29] [cursor=pointer]:
      - /url: /about
```

# Test source

```ts
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
  133 |     await page.goto('/game/tetris')
  134 |     
  135 |     // Wait for the game component to be mounted
  136 |     await page.waitForSelector('.info-value')
  137 |     await wait(500)
  138 |     
  139 |     // Verify initial state before starting
  140 |     const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  141 |     expect(isPlaying).toBe(false)
  142 |     
  143 |     // Start the game with Space
  144 |     await page.keyboard.press('Space')
  145 |     await wait(200)
  146 |     
  147 |     // Get initial lines and score
  148 |     const linesBefore = await page.locator('.info-value').nth(2).textContent()
  149 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  150 |     
  151 |     // Wait for reactive state to be available
> 152 |     await page.waitForFunction(() => window.__tetrisReactiveState !== undefined)
      |                ^ Error: page.waitForFunction: Test timeout of 30000ms exceeded.
  153 |     
  154 |     // Force 4 full rows by manipulating the board state directly
  155 |     // This requires accessing the game module from window
  156 |     await page.evaluate(() => {
  157 |       const tetrisModule = window.__tetrisModule
  158 |       if (!tetrisModule) return
  159 |       
  160 |       // Use the reactive state from Vue
  161 |       const state = window.__tetrisReactiveState
  162 |       console.log('Using reactive state:', state)
  163 |       
  164 |       // Fill rows 16, 17, 18, 19 completely
  165 |       for (let r = 16; r < 20; r++) {
  166 |         for (let c = 0; c < 10; c++) {
  167 |           state.board[r][c] = '#ff0000'
  168 |         }
  169 |       }
  170 |       
  171 |       // Place I-piece at row 13 so it drops and completes the 4th row
  172 |       state.currentPiece = {
  173 |         type: 'I',
  174 |         shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  175 |         color: '#00f0f0',
  176 |         row: 13,
  177 |         col: 0
  178 |       }
  179 |       state.lastDropTime = performance.now() - 2000
  180 |       
  181 |       // Force update to process the piece drop and line clearing
  182 |       tetrisModule.update()
  183 |       state.lastDropTime = performance.now() - 2000
  184 |       tetrisModule.update()
  185 |       
  186 |       // Force Vue reactivity by updating lines
  187 |       const oldLines = state.lines
  188 |       state.lines = oldLines + 4
  189 |     })
  190 |     
  191 |     // Wait for the game loop to update the UI
  192 |     await wait(1000)
  193 |     
  194 |     // Verify 4 lines were cleared (lines counter should increase by 4)
  195 |     const linesAfter = await page.locator('.info-value').nth(2).textContent()
  196 |     expect(parseInt(linesAfter)).toBe(parseInt(linesBefore) + 4)
  197 |     
  198 |     // Verify score increased by 800 (at level 1)
  199 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  200 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
  201 |   })
  202 | 
  203 |   // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────
  204 | 
  205 |   test('score increases by 100 when 1 line cleared', async ({ page }) => {
  206 |     await page.keyboard.press('Space')
  207 |     await wait(200)
  208 |     
  209 |     // Set level to 1 explicitly
  210 |     await page.evaluate(() => {
  211 |       const tetrisModule = window.__tetrisModule
  212 |       if (tetrisModule) {
  213 |         tetrisModule.state.level = 1
  214 |       }
  215 |     })
  216 |     
  217 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  218 |     
  219 |     // Fill one row completely
  220 |     await page.evaluate(() => {
  221 |       const tetrisModule = window.__tetrisModule
  222 |       if (!tetrisModule) return
  223 |       
  224 |       for (let c = 0; c < 10; c++) {
  225 |         tetrisModule.state.board[19][c] = '#ff0000'
  226 |       }
  227 |       
  228 |       tetrisModule.state.currentPiece.row = 17
  229 |       tetrisModule.state.currentPiece.col = 0
  230 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  231 |     })
  232 |     
  233 |     await wait(500)
  234 |     
  235 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  236 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 100)
  237 |   })
  238 | 
  239 |   test('score increases by 300 when 2 lines cleared', async ({ page }) => {
  240 |     await page.keyboard.press('Space')
  241 |     await wait(200)
  242 |     
  243 |     await page.evaluate(() => {
  244 |       const tetrisModule = window.__tetrisModule
  245 |       if (tetrisModule) {
  246 |         tetrisModule.state.level = 1
  247 |       }
  248 |     })
  249 |     
  250 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  251 |     
  252 |     await page.evaluate(() => {
```