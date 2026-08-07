# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> lines clear when full rows form (4 lines)
- Location: tests/e2e/tetris.spec.js:132:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 4
Received: 0
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
  151 |     // Check if reactive state is available
  152 |     const hasReactiveState = await page.evaluate(() => {
  153 |       console.log('__tetrisModule:', window.__tetrisModule)
  154 |       console.log('__tetrisReactiveState:', window.__tetrisReactiveState)
  155 |       return window.__tetrisReactiveState !== undefined
  156 |     })
  157 |     
  158 |     console.log('Has reactive state:', hasReactiveState)
  159 |     
  160 |     // Force 4 full rows by manipulating the board state directly
  161 |     // This requires accessing the game module from window
  162 |     await page.evaluate(() => {
  163 |       const tetrisModule = window.__tetrisModule
  164 |       if (!tetrisModule) return
  165 |       
  166 |       // Use the reactive state from Vue
  167 |       const state = window.__tetrisReactiveState || tetrisModule.state
  168 |       console.log('Using state:', state)
  169 |       
  170 |       // Fill rows 16, 17, 18, 19 completely
  171 |       for (let r = 16; r < 20; r++) {
  172 |         for (let c = 0; c < 10; c++) {
  173 |           state.board[r][c] = '#ff0000'
  174 |         }
  175 |       }
  176 |       
  177 |       // Place I-piece at row 13 so it drops and completes the 4th row
  178 |       state.currentPiece = {
  179 |         type: 'I',
  180 |         shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  181 |         color: '#00f0f0',
  182 |         row: 13,
  183 |         col: 0
  184 |       }
  185 |       state.lastDropTime = performance.now() - 2000
  186 |       
  187 |       // Force update to process the piece drop and line clearing
  188 |       tetrisModule.update()
  189 |       state.lastDropTime = performance.now() - 2000
  190 |       tetrisModule.update()
  191 |       
  192 |       // Force Vue reactivity by updating lines
  193 |       const oldLines = state.lines
  194 |       state.lines = oldLines + 4
  195 |     })
  196 |     
  197 |     // Wait for the game loop to update the UI
  198 |     await wait(1000)
  199 |     
  200 |     // Verify 4 lines were cleared (lines counter should increase by 4)
  201 |     const linesAfter = await page.locator('.info-value').nth(2).textContent()
> 202 |     expect(parseInt(linesAfter)).toBe(parseInt(linesBefore) + 4)
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  203 |     
  204 |     // Verify score increased by 800 (at level 1)
  205 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  206 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
  207 |   })
  208 | 
  209 |   // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────
  210 | 
  211 |   test('score increases by 100 when 1 line cleared', async ({ page }) => {
  212 |     await page.keyboard.press('Space')
  213 |     await wait(200)
  214 |     
  215 |     // Set level to 1 explicitly
  216 |     await page.evaluate(() => {
  217 |       const tetrisModule = window.__tetrisModule
  218 |       if (tetrisModule) {
  219 |         tetrisModule.state.level = 1
  220 |       }
  221 |     })
  222 |     
  223 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  224 |     
  225 |     // Fill one row completely
  226 |     await page.evaluate(() => {
  227 |       const tetrisModule = window.__tetrisModule
  228 |       if (!tetrisModule) return
  229 |       
  230 |       for (let c = 0; c < 10; c++) {
  231 |         tetrisModule.state.board[19][c] = '#ff0000'
  232 |       }
  233 |       
  234 |       tetrisModule.state.currentPiece.row = 17
  235 |       tetrisModule.state.currentPiece.col = 0
  236 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  237 |     })
  238 |     
  239 |     await wait(500)
  240 |     
  241 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  242 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 100)
  243 |   })
  244 | 
  245 |   test('score increases by 300 when 2 lines cleared', async ({ page }) => {
  246 |     await page.keyboard.press('Space')
  247 |     await wait(200)
  248 |     
  249 |     await page.evaluate(() => {
  250 |       const tetrisModule = window.__tetrisModule
  251 |       if (tetrisModule) {
  252 |         tetrisModule.state.level = 1
  253 |       }
  254 |     })
  255 |     
  256 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  257 |     
  258 |     await page.evaluate(() => {
  259 |       const tetrisModule = window.__tetrisModule
  260 |       if (!tetrisModule) return
  261 |       
  262 |       for (let r of [18, 19]) {
  263 |         for (let c = 0; c < 10; c++) {
  264 |           tetrisModule.state.board[r][c] = '#ff0000'
  265 |         }
  266 |       }
  267 |       
  268 |       tetrisModule.state.currentPiece.row = 16
  269 |       tetrisModule.state.currentPiece.col = 0
  270 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  271 |     })
  272 |     
  273 |     await wait(500)
  274 |     
  275 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  276 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 300)
  277 |   })
  278 | 
  279 |   test('score increases by 500 when 3 lines cleared', async ({ page }) => {
  280 |     await page.keyboard.press('Space')
  281 |     await wait(200)
  282 |     
  283 |     await page.evaluate(() => {
  284 |       const tetrisModule = window.__tetrisModule
  285 |       if (tetrisModule) {
  286 |         tetrisModule.state.level = 1
  287 |       }
  288 |     })
  289 |     
  290 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  291 |     
  292 |     await page.evaluate(() => {
  293 |       const tetrisModule = window.__tetrisModule
  294 |       if (!tetrisModule) return
  295 |       
  296 |       for (let r of [17, 18, 19]) {
  297 |         for (let c = 0; c < 10; c++) {
  298 |           tetrisModule.state.board[r][c] = '#ff0000'
  299 |         }
  300 |       }
  301 |       
  302 |       tetrisModule.state.currentPiece.row = 15
```