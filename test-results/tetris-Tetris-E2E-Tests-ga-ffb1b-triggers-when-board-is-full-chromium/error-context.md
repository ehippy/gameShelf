# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> game over triggers when board is full
- Location: tests/e2e/tetris.spec.js:372:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.game-over-overlay')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.game-over-overlay')

```

```yaml
- banner:
  - heading "gameShelf" [level=1]
  - textbox "Search games..."
  - combobox:
    - option "All Categories" [selected]
    - option "Arcade"
    - option "Puzzle"
    - option "Action"
  - navigation:
    - link "Home":
      - /url: /
    - link "High Scores":
      - /url: /highscores
    - link "About":
      - /url: /about
- heading "Tetris" [level=1]
- text: Score 0 Level 1 Lines 0
- contentinfo:
  - paragraph: © 2025 gameShelf — All games built in browser — no downloads required
  - link "About":
    - /url: /about
```

# Test source

```ts
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
  394 |         col: 4
  395 |       }
  396 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  397 |       
  398 |       // Force game over by making isValidPosition return false
  399 |       tetrisModule.update()
  400 |     })
  401 |     
  402 |     await wait(300)
  403 |     
  404 |     // Check if game over overlay is visible
  405 |     const gameOverOverlay = page.locator('.game-over-overlay')
> 406 |     await expect(gameOverOverlay).toBeVisible()
      |                                   ^ Error: expect(locator).toBeVisible() failed
  407 |     
  408 |     // Verify isGameOver state
  409 |     const isGameOver = await page.evaluate(() => {
  410 |       const tetrisModule = window.__tetrisModule
  411 |       return tetrisModule?.state?.isGameOver ?? false
  412 |     })
  413 |     expect(isGameOver).toBe(true)
  414 |   })
  415 | 
  416 |   test('game over allows restart with Space', async ({ page }) => {
  417 |     // First, get the game to a game over state
  418 |     await page.keyboard.press('Space')
  419 |     await wait(200)
  420 |     
  421 |     await page.evaluate(() => {
  422 |       const tetrisModule = window.__tetrisModule
  423 |       if (!tetrisModule) return
  424 |       
  425 |       // Fill board to force game over
  426 |       for (let r = 10; r < 20; r++) {
  427 |         for (let c = 0; c < 10; c++) {
  428 |           tetrisModule.state.board[r][c] = '#ff0000'
  429 |         }
  430 |       }
  431 |       
  432 |       tetrisModule.state.currentPiece = {
  433 |         type: 'O',
  434 |         shape: [[1, 1], [1, 1]],
  435 |         color: '#f0f000',
  436 |         row: 0,
  437 |         col: 4
  438 |       }
  439 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  440 |       tetrisModule.update()
  441 |     })
  442 |     
  443 |     await wait(300)
  444 |     
  445 |     // Verify game over state
  446 |     const isGameOverBefore = await page.evaluate(() => {
  447 |       const tetrisModule = window.__tetrisModule
  448 |       return tetrisModule?.state?.isGameOver ?? false
  449 |     })
  450 |     expect(isGameOverBefore).toBe(true)
  451 |     
  452 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  453 |     
  454 |     // Press Space to restart
  455 |     await page.keyboard.press('Space')
  456 |     await wait(200)
  457 |     
  458 |     // Verify game restarted
  459 |     const isGameOverAfter = await page.evaluate(() => {
  460 |       const tetrisModule = window.__tetrisModule
  461 |       return tetrisModule?.state?.isGameOver ?? false
  462 |     })
  463 |     expect(isGameOverAfter).toBe(false)
  464 |     
  465 |     // Score should be reset to 0
  466 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  467 |     expect(parseInt(scoreAfter)).toBe(0)
  468 |     
  469 |     // isPlaying should be true
  470 |     const isPlaying = await page.evaluate(() => {
  471 |       const tetrisModule = window.__tetrisModule
  472 |       return tetrisModule?.state?.isPlaying ?? false
  473 |     })
  474 |     expect(isPlaying).toBe(true)
  475 |   })
  476 | 
  477 |   test('game over allows restart with ArrowLeft', async ({ page }) => {
  478 |     await page.keyboard.press('Space')
  479 |     await wait(200)
  480 |     
  481 |     await page.evaluate(() => {
  482 |       const tetrisModule = window.__tetrisModule
  483 |       if (!tetrisModule) return
  484 |       
  485 |       for (let r = 10; r < 20; r++) {
  486 |         for (let c = 0; c < 10; c++) {
  487 |           tetrisModule.state.board[r][c] = '#ff0000'
  488 |         }
  489 |       }
  490 |       
  491 |       tetrisModule.state.currentPiece = {
  492 |         type: 'O',
  493 |         shape: [[1, 1], [1, 1]],
  494 |         color: '#f0f000',
  495 |         row: 0,
  496 |         col: 4
  497 |       }
  498 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  499 |       tetrisModule.update()
  500 |     })
  501 |     
  502 |     await wait(300)
  503 |     
  504 |     // Press ArrowLeft to restart (three-way logic handles this)
  505 |     await page.keyboard.press('ArrowLeft')
  506 |     await wait(200)
```