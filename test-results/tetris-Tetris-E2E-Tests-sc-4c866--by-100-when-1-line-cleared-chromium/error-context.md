# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> score increases by 100 when 1 line cleared
- Location: tests/e2e/tetris.spec.js:228:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 100
Received: 136
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
        - generic [ref=f1e18]: "136"
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
  221 |     // Verify score increased by at least 800 (at level 1) - the exact amount depends on
  222 |     // how many rows the piece dropped before locking. The minimum is 800 for 4 lines.
  223 |     expect(parseInt(scoreAfter)).toBeGreaterThanOrEqual(parseInt(scoreBefore) + 800)
  224 |   })
  225 | 
  226 |   // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────
  227 | 
  228 |   test('score increases by 100 when 1 line cleared', async ({ page }) => {
  229 |     await page.goto('/game/tetris')
  230 |     
  231 |     // Wait for the game component to be mounted
  232 |     await page.waitForSelector('.info-value')
  233 |     await wait(500)
  234 |     
  235 |     // Verify initial state before starting
  236 |     const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  237 |     expect(isPlaying).toBe(false)
  238 |     
  239 |     // Start the game with Space
  240 |     await page.keyboard.press('Space')
  241 |     await wait(200)
  242 |     
  243 |     // Set level to 1 explicitly
  244 |     await page.evaluate(() => {
  245 |       const tetrisModule = window.__tetrisModule
  246 |       if (tetrisModule) {
  247 |         tetrisModule.state.level = 1
  248 |       }
  249 |     })
  250 |     
  251 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  252 |     
  253 |     // Fill one row completely
  254 |     await page.evaluate(() => {
  255 |       const tetrisModule = window.__tetrisModule
  256 |       if (!tetrisModule) return
  257 |       
  258 |       for (let c = 0; c < 10; c++) {
  259 |         tetrisModule.state.board[19][c] = '#ff0000'
  260 |       }
  261 |       
  262 |       tetrisModule.state.currentPiece.row = 17
  263 |       tetrisModule.state.currentPiece.col = 0
  264 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  265 |       
  266 |       // Force update to process the piece drop and line clearing
  267 |       tetrisModule.update()
  268 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  269 |       tetrisModule.update()
  270 |       
  271 |       // Update DOM directly
  272 |       const allInfoValues = document.querySelectorAll('.info-value')
  273 |       if (allInfoValues[0]) allInfoValues[0].textContent = tetrisModule.state.score
  274 |     })
  275 |     
  276 |     await wait(500)
  277 |     
  278 |     const scoreAfter = await page.locator('.info-value').first().textContent()
> 279 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 100)
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  280 |   })
  281 | 
  282 |   test('score increases by 300 when 2 lines cleared', async ({ page }) => {
  283 |     await page.goto('/game/tetris')
  284 |     
  285 |     // Wait for the game component to be mounted
  286 |     await page.waitForSelector('.info-value')
  287 |     await wait(500)
  288 |     
  289 |     const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  290 |     expect(isPlaying).toBe(false)
  291 |     
  292 |     await page.keyboard.press('Space')
  293 |     await wait(200)
  294 |     
  295 |     await page.evaluate(() => {
  296 |       const tetrisModule = window.__tetrisModule
  297 |       if (tetrisModule) {
  298 |         tetrisModule.state.level = 1
  299 |       }
  300 |     })
  301 |     
  302 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  303 |     
  304 |     await page.evaluate(() => {
  305 |       const tetrisModule = window.__tetrisModule
  306 |       if (!tetrisModule) return
  307 |       
  308 |       for (let r of [18, 19]) {
  309 |         for (let c = 0; c < 10; c++) {
  310 |           tetrisModule.state.board[r][c] = '#ff0000'
  311 |         }
  312 |       }
  313 |       
  314 |       tetrisModule.state.currentPiece.row = 16
  315 |       tetrisModule.state.currentPiece.col = 0
  316 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  317 |       
  318 |       // Force update to process the piece drop and line clearing
  319 |       tetrisModule.update()
  320 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  321 |       tetrisModule.update()
  322 |       
  323 |       // Update DOM directly
  324 |       const allInfoValues = document.querySelectorAll('.info-value')
  325 |       if (allInfoValues[0]) allInfoValues[0].textContent = tetrisModule.state.score
  326 |     })
  327 |     
  328 |     await wait(500)
  329 |     
  330 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  331 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 300)
  332 |   })
  333 | 
  334 |   test('score increases by 500 when 3 lines cleared', async ({ page }) => {
  335 |     await page.goto('/game/tetris')
  336 |     
  337 |     // Wait for the game component to be mounted
  338 |     await page.waitForSelector('.info-value')
  339 |     await wait(500)
  340 |     
  341 |     const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  342 |     expect(isPlaying).toBe(false)
  343 |     
  344 |     await page.keyboard.press('Space')
  345 |     await wait(200)
  346 |     
  347 |     await page.evaluate(() => {
  348 |       const tetrisModule = window.__tetrisModule
  349 |       if (tetrisModule) {
  350 |         tetrisModule.state.level = 1
  351 |       }
  352 |     })
  353 |     
  354 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  355 |     
  356 |     await page.evaluate(() => {
  357 |       const tetrisModule = window.__tetrisModule
  358 |       if (!tetrisModule) return
  359 |       
  360 |       for (let r of [17, 18, 19]) {
  361 |         for (let c = 0; c < 10; c++) {
  362 |           tetrisModule.state.board[r][c] = '#ff0000'
  363 |         }
  364 |       }
  365 |       
  366 |       tetrisModule.state.currentPiece.row = 15
  367 |       tetrisModule.state.currentPiece.col = 0
  368 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  369 |       
  370 |       // Force update to process the piece drop and line clearing
  371 |       tetrisModule.update()
  372 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  373 |       tetrisModule.update()
  374 |       
  375 |       // Update DOM directly
  376 |       const allInfoValues = document.querySelectorAll('.info-value')
  377 |       if (allInfoValues[0]) allInfoValues[0].textContent = tetrisModule.state.score
  378 |     })
  379 |     
```