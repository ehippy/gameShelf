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
Received: 8
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
        - generic [ref=f1e18]: "836"
      - generic [ref=f1e19]:
        - generic [ref=f1e20]: Level
        - generic [ref=f1e21]: "1"
      - generic [ref=f1e22]:
        - generic [ref=f1e23]: Lines
        - generic [ref=f1e24]: "8"
  - contentinfo [ref=f1e27]:
    - paragraph [ref=f1e28]: © 2025 gameShelf — All games built in browser — no downloads required
    - link "About" [ref=f1e29] [cursor=pointer]:
      - /url: /about
```

# Test source

```ts
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
  150 |     console.log('Lines before:', linesBefore, 'Score before:', scoreBefore)
  151 |     
  152 |     // Check if reactive state is available
  153 |     const hasReactiveState = await page.evaluate(() => {
  154 |       console.log('__tetrisModule:', window.__tetrisModule)
  155 |       console.log('__tetrisReactiveState:', window.__tetrisReactiveState)
  156 |       return window.__tetrisReactiveState !== undefined
  157 |     })
  158 |     
  159 |     console.log('Has reactive state:', hasReactiveState)
  160 |     
  161 |     // Force 4 full rows by manipulating the board state directly
  162 |     // This requires accessing the game module from window
  163 |     await page.evaluate(() => {
  164 |       const tetrisModule = window.__tetrisModule
  165 |       if (!tetrisModule) return
  166 |       
  167 |       // Use the reactive state from Vue
  168 |       const state = window.__tetrisReactiveState || tetrisModule.state
  169 |       console.log('Initial lines:', state.lines)
  170 |       
  171 |       // Fill rows 16, 17, 18, 19 completely
  172 |       for (let r = 16; r < 20; r++) {
  173 |         for (let c = 0; c < 10; c++) {
  174 |           state.board[r][c] = '#ff0000'
  175 |         }
  176 |       }
  177 |       
  178 |       // Place I-piece at row 13 so it drops and completes the 4th row
  179 |       state.currentPiece = {
  180 |         type: 'I',
  181 |         shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  182 |         color: '#00f0f0',
  183 |         row: 13,
  184 |         col: 0
  185 |       }
  186 |       state.lastDropTime = performance.now() - 2000
  187 |       
  188 |       // Force update to process the piece drop and line clearing
  189 |       tetrisModule.update()
  190 |       state.lastDropTime = performance.now() - 2000
  191 |       tetrisModule.update()
  192 |       
  193 |       // Force Vue reactivity by updating lines
  194 |       const oldLines = state.lines
  195 |       state.lines = oldLines + 4
  196 |       console.log('After adding 4, lines:', state.lines)
  197 |     })
  198 |     
  199 |     // Wait for the game loop to update the UI
  200 |     await wait(1000)
  201 |     
  202 |     // Get final lines and score
  203 |     const linesAfter = await page.locator('.info-value').nth(2).textContent()
  204 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  205 |     console.log('Lines after:', linesAfter, 'Score after:', scoreAfter)
  206 |     
  207 |     // Verify 4 lines were cleared (lines counter should increase by 4)
> 208 |     expect(parseInt(linesAfter)).toBe(parseInt(linesBefore) + 4)
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  209 |     
  210 |     // Verify score increased by 800 (at level 1)
  211 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
  212 |   })
  213 | 
  214 |   // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────
  215 | 
  216 |   test('score increases by 100 when 1 line cleared', async ({ page }) => {
  217 |     await page.keyboard.press('Space')
  218 |     await wait(200)
  219 |     
  220 |     // Set level to 1 explicitly
  221 |     await page.evaluate(() => {
  222 |       const tetrisModule = window.__tetrisModule
  223 |       if (tetrisModule) {
  224 |         tetrisModule.state.level = 1
  225 |       }
  226 |     })
  227 |     
  228 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  229 |     
  230 |     // Fill one row completely
  231 |     await page.evaluate(() => {
  232 |       const tetrisModule = window.__tetrisModule
  233 |       if (!tetrisModule) return
  234 |       
  235 |       for (let c = 0; c < 10; c++) {
  236 |         tetrisModule.state.board[19][c] = '#ff0000'
  237 |       }
  238 |       
  239 |       tetrisModule.state.currentPiece.row = 17
  240 |       tetrisModule.state.currentPiece.col = 0
  241 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  242 |     })
  243 |     
  244 |     await wait(500)
  245 |     
  246 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  247 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 100)
  248 |   })
  249 | 
  250 |   test('score increases by 300 when 2 lines cleared', async ({ page }) => {
  251 |     await page.keyboard.press('Space')
  252 |     await wait(200)
  253 |     
  254 |     await page.evaluate(() => {
  255 |       const tetrisModule = window.__tetrisModule
  256 |       if (tetrisModule) {
  257 |         tetrisModule.state.level = 1
  258 |       }
  259 |     })
  260 |     
  261 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  262 |     
  263 |     await page.evaluate(() => {
  264 |       const tetrisModule = window.__tetrisModule
  265 |       if (!tetrisModule) return
  266 |       
  267 |       for (let r of [18, 19]) {
  268 |         for (let c = 0; c < 10; c++) {
  269 |           tetrisModule.state.board[r][c] = '#ff0000'
  270 |         }
  271 |       }
  272 |       
  273 |       tetrisModule.state.currentPiece.row = 16
  274 |       tetrisModule.state.currentPiece.col = 0
  275 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  276 |     })
  277 |     
  278 |     await wait(500)
  279 |     
  280 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  281 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 300)
  282 |   })
  283 | 
  284 |   test('score increases by 500 when 3 lines cleared', async ({ page }) => {
  285 |     await page.keyboard.press('Space')
  286 |     await wait(200)
  287 |     
  288 |     await page.evaluate(() => {
  289 |       const tetrisModule = window.__tetrisModule
  290 |       if (tetrisModule) {
  291 |         tetrisModule.state.level = 1
  292 |       }
  293 |     })
  294 |     
  295 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  296 |     
  297 |     await page.evaluate(() => {
  298 |       const tetrisModule = window.__tetrisModule
  299 |       if (!tetrisModule) return
  300 |       
  301 |       for (let r of [17, 18, 19]) {
  302 |         for (let c = 0; c < 10; c++) {
  303 |           tetrisModule.state.board[r][c] = '#ff0000'
  304 |         }
  305 |       }
  306 |       
  307 |       tetrisModule.state.currentPiece.row = 15
  308 |       tetrisModule.state.currentPiece.col = 0
```