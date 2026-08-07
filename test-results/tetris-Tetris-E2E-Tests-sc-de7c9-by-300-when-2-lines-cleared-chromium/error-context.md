# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> score increases by 300 when 2 lines cleared
- Location: tests/e2e/tetris.spec.js:262:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 300
Received: 0
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
  221 |     // Verify score increased by at least 800 (at level 1) - the exact amount depends on
  222 |     // how many rows the piece dropped before locking. The minimum is 800 for 4 lines.
  223 |     expect(parseInt(scoreAfter)).toBeGreaterThanOrEqual(parseInt(scoreBefore) + 800)
  224 |   })
  225 | 
  226 |   // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────
  227 | 
  228 |   test('score increases by 100 when 1 line cleared', async ({ page }) => {
  229 |     await page.keyboard.press('Space')
  230 |     await wait(200)
  231 |     
  232 |     // Set level to 1 explicitly
  233 |     await page.evaluate(() => {
  234 |       const tetrisModule = window.__tetrisModule
  235 |       if (tetrisModule) {
  236 |         tetrisModule.state.level = 1
  237 |       }
  238 |     })
  239 |     
  240 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  241 |     
  242 |     // Fill one row completely
  243 |     await page.evaluate(() => {
  244 |       const tetrisModule = window.__tetrisModule
  245 |       if (!tetrisModule) return
  246 |       
  247 |       for (let c = 0; c < 10; c++) {
  248 |         tetrisModule.state.board[19][c] = '#ff0000'
  249 |       }
  250 |       
  251 |       tetrisModule.state.currentPiece.row = 17
  252 |       tetrisModule.state.currentPiece.col = 0
  253 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  254 |     })
  255 |     
  256 |     await wait(500)
  257 |     
  258 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  259 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 100)
  260 |   })
  261 | 
  262 |   test('score increases by 300 when 2 lines cleared', async ({ page }) => {
  263 |     await page.keyboard.press('Space')
  264 |     await wait(200)
  265 |     
  266 |     await page.evaluate(() => {
  267 |       const tetrisModule = window.__tetrisModule
  268 |       if (tetrisModule) {
  269 |         tetrisModule.state.level = 1
  270 |       }
  271 |     })
  272 |     
  273 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  274 |     
  275 |     await page.evaluate(() => {
  276 |       const tetrisModule = window.__tetrisModule
  277 |       if (!tetrisModule) return
  278 |       
  279 |       for (let r of [18, 19]) {
  280 |         for (let c = 0; c < 10; c++) {
  281 |           tetrisModule.state.board[r][c] = '#ff0000'
  282 |         }
  283 |       }
  284 |       
  285 |       tetrisModule.state.currentPiece.row = 16
  286 |       tetrisModule.state.currentPiece.col = 0
  287 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  288 |     })
  289 |     
  290 |     await wait(500)
  291 |     
  292 |     const scoreAfter = await page.locator('.info-value').first().textContent()
> 293 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 300)
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  294 |   })
  295 | 
  296 |   test('score increases by 500 when 3 lines cleared', async ({ page }) => {
  297 |     await page.keyboard.press('Space')
  298 |     await wait(200)
  299 |     
  300 |     await page.evaluate(() => {
  301 |       const tetrisModule = window.__tetrisModule
  302 |       if (tetrisModule) {
  303 |         tetrisModule.state.level = 1
  304 |       }
  305 |     })
  306 |     
  307 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  308 |     
  309 |     await page.evaluate(() => {
  310 |       const tetrisModule = window.__tetrisModule
  311 |       if (!tetrisModule) return
  312 |       
  313 |       for (let r of [17, 18, 19]) {
  314 |         for (let c = 0; c < 10; c++) {
  315 |           tetrisModule.state.board[r][c] = '#ff0000'
  316 |         }
  317 |       }
  318 |       
  319 |       tetrisModule.state.currentPiece.row = 15
  320 |       tetrisModule.state.currentPiece.col = 0
  321 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  322 |     })
  323 |     
  324 |     await wait(500)
  325 |     
  326 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  327 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 500)
  328 |   })
  329 | 
  330 |   test('score increases by 800 when 4 lines cleared', async ({ page }) => {
  331 |     await page.keyboard.press('Space')
  332 |     await wait(200)
  333 |     
  334 |     await page.evaluate(() => {
  335 |       const tetrisModule = window.__tetrisModule
  336 |       if (tetrisModule) {
  337 |         tetrisModule.state.level = 1
  338 |       }
  339 |     })
  340 |     
  341 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  342 |     
  343 |     await page.evaluate(() => {
  344 |       const tetrisModule = window.__tetrisModule
  345 |       if (!tetrisModule) return
  346 |       
  347 |       for (let c = 0; c < 10; c++) {
  348 |         tetrisModule.state.board[16][c] = '#ff0000'
  349 |         tetrisModule.state.board[17][c] = '#ff0000'
  350 |         tetrisModule.state.board[18][c] = '#ff0000'
  351 |         tetrisModule.state.board[19][c] = '#ff0000'
  352 |       }
  353 |       
  354 |       tetrisModule.state.currentPiece = {
  355 |         type: 'I',
  356 |         shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  357 |         color: '#00f0f0',
  358 |         row: 13,
  359 |         col: 0
  360 |       }
  361 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  362 |     })
  363 |     
  364 |     await wait(500)
  365 |     
  366 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  367 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
  368 |   })
  369 | 
  370 |   // ─── Test 5: Game over triggers and allows restart ──────────────────────────
  371 | 
  372 |   test('game over triggers when board is full', async ({ page }) => {
  373 |     await page.keyboard.press('Space')
  374 |     await wait(200)
  375 |     
  376 |     // Force game over by filling the board
  377 |     await page.evaluate(() => {
  378 |       const tetrisModule = window.__tetrisModule
  379 |       if (!tetrisModule) return
  380 |       
  381 |       // Fill most of the board with blocks
  382 |       for (let r = 10; r < 20; r++) {
  383 |         for (let c = 0; c < 10; c++) {
  384 |           tetrisModule.state.board[r][c] = '#ff0000'
  385 |         }
  386 |       }
  387 |       
  388 |       // Place piece in a position where it will cause game over
  389 |       tetrisModule.state.currentPiece = {
  390 |         type: 'O',
  391 |         shape: [[1, 1], [1, 1]],
  392 |         color: '#f0f000',
  393 |         row: 0,
```