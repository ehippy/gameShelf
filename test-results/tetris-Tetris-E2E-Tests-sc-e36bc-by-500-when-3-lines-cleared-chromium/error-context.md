# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> score increases by 500 when 3 lines cleared
- Location: tests/e2e/tetris.spec.js:334:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 500
Received: 536
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
        - generic [ref=f1e18]: "536"
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
  380 |     await wait(500)
  381 |     
  382 |     const scoreAfter = await page.locator('.info-value').first().textContent()
> 383 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 500)
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  384 |   })
  385 | 
  386 |   test('score increases by 800 when 4 lines cleared', async ({ page }) => {
  387 |     await page.goto('/game/tetris')
  388 |     
  389 |     // Wait for the game component to be mounted
  390 |     await page.waitForSelector('.info-value')
  391 |     await wait(500)
  392 |     
  393 |     const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  394 |     expect(isPlaying).toBe(false)
  395 |     
  396 |     await page.keyboard.press('Space')
  397 |     await wait(200)
  398 |     
  399 |     await page.evaluate(() => {
  400 |       const tetrisModule = window.__tetrisModule
  401 |       if (tetrisModule) {
  402 |         tetrisModule.state.level = 1
  403 |       }
  404 |     })
  405 |     
  406 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  407 |     
  408 |     await page.evaluate(() => {
  409 |       const tetrisModule = window.__tetrisModule
  410 |       if (!tetrisModule) return
  411 |       
  412 |       for (let c = 0; c < 10; c++) {
  413 |         tetrisModule.state.board[16][c] = '#ff0000'
  414 |         tetrisModule.state.board[17][c] = '#ff0000'
  415 |         tetrisModule.state.board[18][c] = '#ff0000'
  416 |         tetrisModule.state.board[19][c] = '#ff0000'
  417 |       }
  418 |       
  419 |       tetrisModule.state.currentPiece = {
  420 |         type: 'I',
  421 |         shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  422 |         color: '#00f0f0',
  423 |         row: 13,
  424 |         col: 0
  425 |       }
  426 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  427 |       
  428 |       // Force update to process the piece drop and line clearing
  429 |       tetrisModule.update()
  430 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  431 |       tetrisModule.update()
  432 |       
  433 |       // Update DOM directly
  434 |       const allInfoValues = document.querySelectorAll('.info-value')
  435 |       if (allInfoValues[0]) allInfoValues[0].textContent = tetrisModule.state.score
  436 |     })
  437 |     
  438 |     await wait(500)
  439 |     
  440 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  441 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
  442 |   })
  443 | 
  444 |   // ─── Test 5: Game over triggers and allows restart ──────────────────────────
  445 | 
  446 |   test('game over triggers when board is full', async ({ page }) => {
  447 |     await page.goto('/game/tetris')
  448 |     
  449 |     // Wait for the game component to be mounted
  450 |     await page.waitForSelector('.info-value')
  451 |     await wait(500)
  452 |     
  453 |     const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  454 |     expect(isPlaying).toBe(false)
  455 |     
  456 |     await page.keyboard.press('Space')
  457 |     await wait(200)
  458 |     
  459 |     // Force game over by filling the board
  460 |     await page.evaluate(() => {
  461 |       const tetrisModule = window.__tetrisModule
  462 |       if (!tetrisModule) return
  463 |       
  464 |       // Fill most of the board with blocks
  465 |       for (let r = 10; r < 20; r++) {
  466 |         for (let c = 0; c < 10; c++) {
  467 |           tetrisModule.state.board[r][c] = '#ff0000'
  468 |         }
  469 |       }
  470 |       
  471 |       // Place piece in a position where it will cause game over
  472 |       tetrisModule.state.currentPiece = {
  473 |         type: 'O',
  474 |         shape: [[1, 1], [1, 1]],
  475 |         color: '#f0f000',
  476 |         row: 0,
  477 |         col: 4
  478 |       }
  479 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  480 |       
  481 |       // Force game over by making isValidPosition return false
  482 |       tetrisModule.update()
  483 |     })
```