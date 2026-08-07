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

Expected: 800
Received: 836
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
        - generic [ref=f1e24]: "4"
  - contentinfo [ref=f1e27]:
    - paragraph [ref=f1e28]: © 2025 gameShelf — All games built in browser — no downloads required
    - link "About" [ref=f1e29] [cursor=pointer]:
      - /url: /about
```

# Test source

```ts
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
  163 |     const debugOutput = await page.evaluate(() => {
  164 |       const tetrisModule = window.__tetrisModule
  165 |       if (!tetrisModule) return { error: 'Module not found' }
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
  190 |       console.log('After first update, lines:', state.lines, 'score:', state.score)
  191 |       
  192 |       state.lastDropTime = performance.now() - 2000
  193 |       tetrisModule.update()
  194 |       console.log('After second update, lines:', state.lines, 'score:', state.score)
  195 |       
  196 |       // Also update the DOM directly to ensure the UI reflects the changes
  197 |       const allInfoValues = document.querySelectorAll('.info-value')
  198 |       console.log('Found', allInfoValues.length, 'info-value elements')
  199 |       for (let i = 0; i < allInfoValues.length; i++) {
  200 |         console.log('Element', i, ':', allInfoValues[i].textContent)
  201 |       }
  202 |       
  203 |       if (allInfoValues[2]) allInfoValues[2].textContent = state.lines
  204 |       if (allInfoValues[0]) allInfoValues[0].textContent = state.score
  205 |       
  206 |       return { lines: state.lines, score: state.score }
  207 |     })
  208 |     console.log('Debug output:', debugOutput)
  209 |     
  210 |     // Wait for the game loop to update the UI
  211 |     await wait(1000)
  212 |     
  213 |     // Get final lines and score from DOM
  214 |     const linesAfter = await page.locator('.info-value').nth(2).textContent()
  215 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  216 |     console.log('Lines after DOM:', linesAfter, 'Score after DOM:', scoreAfter)
  217 |     
  218 |     // Verify 4 lines were cleared (lines counter should increase by 4)
  219 |     expect(parseInt(linesAfter)).toBe(parseInt(linesBefore) + 4)
  220 |     
  221 |     // Verify score increased by 800 (at level 1)
> 222 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  223 |   })
  224 | 
  225 |   // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────
  226 | 
  227 |   test('score increases by 100 when 1 line cleared', async ({ page }) => {
  228 |     await page.keyboard.press('Space')
  229 |     await wait(200)
  230 |     
  231 |     // Set level to 1 explicitly
  232 |     await page.evaluate(() => {
  233 |       const tetrisModule = window.__tetrisModule
  234 |       if (tetrisModule) {
  235 |         tetrisModule.state.level = 1
  236 |       }
  237 |     })
  238 |     
  239 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  240 |     
  241 |     // Fill one row completely
  242 |     await page.evaluate(() => {
  243 |       const tetrisModule = window.__tetrisModule
  244 |       if (!tetrisModule) return
  245 |       
  246 |       for (let c = 0; c < 10; c++) {
  247 |         tetrisModule.state.board[19][c] = '#ff0000'
  248 |       }
  249 |       
  250 |       tetrisModule.state.currentPiece.row = 17
  251 |       tetrisModule.state.currentPiece.col = 0
  252 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  253 |     })
  254 |     
  255 |     await wait(500)
  256 |     
  257 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  258 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 100)
  259 |   })
  260 | 
  261 |   test('score increases by 300 when 2 lines cleared', async ({ page }) => {
  262 |     await page.keyboard.press('Space')
  263 |     await wait(200)
  264 |     
  265 |     await page.evaluate(() => {
  266 |       const tetrisModule = window.__tetrisModule
  267 |       if (tetrisModule) {
  268 |         tetrisModule.state.level = 1
  269 |       }
  270 |     })
  271 |     
  272 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  273 |     
  274 |     await page.evaluate(() => {
  275 |       const tetrisModule = window.__tetrisModule
  276 |       if (!tetrisModule) return
  277 |       
  278 |       for (let r of [18, 19]) {
  279 |         for (let c = 0; c < 10; c++) {
  280 |           tetrisModule.state.board[r][c] = '#ff0000'
  281 |         }
  282 |       }
  283 |       
  284 |       tetrisModule.state.currentPiece.row = 16
  285 |       tetrisModule.state.currentPiece.col = 0
  286 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  287 |     })
  288 |     
  289 |     await wait(500)
  290 |     
  291 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  292 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 300)
  293 |   })
  294 | 
  295 |   test('score increases by 500 when 3 lines cleared', async ({ page }) => {
  296 |     await page.keyboard.press('Space')
  297 |     await wait(200)
  298 |     
  299 |     await page.evaluate(() => {
  300 |       const tetrisModule = window.__tetrisModule
  301 |       if (tetrisModule) {
  302 |         tetrisModule.state.level = 1
  303 |       }
  304 |     })
  305 |     
  306 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  307 |     
  308 |     await page.evaluate(() => {
  309 |       const tetrisModule = window.__tetrisModule
  310 |       if (!tetrisModule) return
  311 |       
  312 |       for (let r of [17, 18, 19]) {
  313 |         for (let c = 0; c < 10; c++) {
  314 |           tetrisModule.state.board[r][c] = '#ff0000'
  315 |         }
  316 |       }
  317 |       
  318 |       tetrisModule.state.currentPiece.row = 15
  319 |       tetrisModule.state.currentPiece.col = 0
  320 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  321 |     })
  322 |     
```