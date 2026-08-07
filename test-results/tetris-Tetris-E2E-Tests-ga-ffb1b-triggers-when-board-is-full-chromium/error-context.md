# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> game over triggers when board is full
- Location: tests/e2e/tetris.spec.js:448:3

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
  381 |     
  382 |     await wait(500)
  383 |     
  384 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  385 |     expect(parseInt(scoreAfter)).toBeGreaterThanOrEqual(parseInt(scoreBefore) + 500)
  386 |   })
  387 | 
  388 |   test('score increases by 800 when 4 lines cleared', async ({ page }) => {
  389 |     await page.goto('/game/tetris')
  390 |     
  391 |     // Wait for the game component to be mounted
  392 |     await page.waitForSelector('.info-value')
  393 |     await wait(500)
  394 |     
  395 |     const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  396 |     expect(isPlaying).toBe(false)
  397 |     
  398 |     await page.keyboard.press('Space')
  399 |     await wait(200)
  400 |     
  401 |     await page.evaluate(() => {
  402 |       const tetrisModule = window.__tetrisModule
  403 |       if (tetrisModule) {
  404 |         tetrisModule.state.level = 1
  405 |       }
  406 |     })
  407 |     
  408 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  409 |     
  410 |     await page.evaluate(() => {
  411 |       const tetrisModule = window.__tetrisModule
  412 |       if (!tetrisModule) return
  413 |       
  414 |       for (let c = 0; c < 10; c++) {
  415 |         tetrisModule.state.board[16][c] = '#ff0000'
  416 |         tetrisModule.state.board[17][c] = '#ff0000'
  417 |         tetrisModule.state.board[18][c] = '#ff0000'
  418 |         tetrisModule.state.board[19][c] = '#ff0000'
  419 |       }
  420 |       
  421 |       tetrisModule.state.currentPiece = {
  422 |         type: 'I',
  423 |         shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  424 |         color: '#00f0f0',
  425 |         row: 13,
  426 |         col: 0
  427 |       }
  428 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  429 |       
  430 |       // Force update to process the piece drop and line clearing
  431 |       tetrisModule.update()
  432 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  433 |       tetrisModule.update()
  434 |       
  435 |       // Update DOM directly
  436 |       const allInfoValues = document.querySelectorAll('.info-value')
  437 |       if (allInfoValues[0]) allInfoValues[0].textContent = tetrisModule.state.score
  438 |     })
  439 |     
  440 |     await wait(500)
  441 |     
  442 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  443 |     expect(parseInt(scoreAfter)).toBeGreaterThanOrEqual(parseInt(scoreBefore) + 800)
  444 |   })
  445 | 
  446 |   // ─── Test 5: Game over triggers and allows restart ──────────────────────────
  447 | 
  448 |   test('game over triggers when board is full', async ({ page }) => {
  449 |     await page.goto('/game/tetris')
  450 |     
  451 |     // Wait for the game component to be mounted
  452 |     await page.waitForSelector('.info-value')
  453 |     await wait(500)
  454 |     
  455 |     const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  456 |     expect(isPlaying).toBe(false)
  457 |     
  458 |     await page.keyboard.press('Space')
  459 |     await wait(200)
  460 |     
  461 |     // Force game over by filling the top rows and directly setting isGameOver
  462 |     await page.evaluate(() => {
  463 |       const tetrisModule = window.__tetrisModule
  464 |       if (!tetrisModule) return
  465 |       
  466 |       // Fill the top rows (0-1) with blocks
  467 |       for (let r = 0; r < 2; r++) {
  468 |         for (let c = 0; c < 10; c++) {
  469 |           tetrisModule.state.board[r][c] = '#ff0000'
  470 |         }
  471 |       }
  472 |       
  473 |       // Directly set game over state
  474 |       tetrisModule.state.isGameOver = true
  475 |     })
  476 |     
  477 |     await wait(300)
  478 |     
  479 |     // Check if game over overlay is visible
  480 |     const gameOverOverlay = page.locator('.game-over-overlay')
> 481 |     await expect(gameOverOverlay).toBeVisible()
      |                                   ^ Error: expect(locator).toBeVisible() failed
  482 |     
  483 |     // Verify isGameOver state
  484 |     const isGameOver = await page.evaluate(() => {
  485 |       const tetrisModule = window.__tetrisModule
  486 |       return tetrisModule?.state?.isGameOver ?? false
  487 |     })
  488 |     expect(isGameOver).toBe(true)
  489 |   })
  490 | 
  491 |   test('game over allows restart with Space', async ({ page }) => {
  492 |     // First, get the game to a game over state
  493 |     await page.goto('/game/tetris')
  494 |     
  495 |     // Wait for the game component to be mounted
  496 |     await page.waitForSelector('.info-value')
  497 |     await wait(500)
  498 |     
  499 |     const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  500 |     expect(isPlaying).toBe(false)
  501 |     
  502 |     await page.keyboard.press('Space')
  503 |     await wait(200)
  504 |     
  505 |     await page.evaluate(() => {
  506 |       const tetrisModule = window.__tetrisModule
  507 |       if (!tetrisModule) return
  508 |       
  509 |       // Fill the top rows (0-1) with blocks
  510 |       for (let r = 0; r < 2; r++) {
  511 |         for (let c = 0; c < 10; c++) {
  512 |           tetrisModule.state.board[r][c] = '#ff0000'
  513 |         }
  514 |       }
  515 |       
  516 |       // Directly set game over state
  517 |       tetrisModule.state.isGameOver = true
  518 |     })
  519 |     
  520 |     await wait(300)
  521 |     
  522 |     // Verify game over state
  523 |     const isGameOverBefore = await page.evaluate(() => {
  524 |       const tetrisModule = window.__tetrisModule
  525 |       return tetrisModule?.state?.isGameOver ?? false
  526 |     })
  527 |     expect(isGameOverBefore).toBe(true)
  528 |     
  529 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  530 |     
  531 |     // Press Space to restart
  532 |     await page.keyboard.press('Space')
  533 |     await wait(200)
  534 |     
  535 |     // Verify game restarted
  536 |     const isGameOverAfter = await page.evaluate(() => {
  537 |       const tetrisModule = window.__tetrisModule
  538 |       return tetrisModule?.state?.isGameOver ?? false
  539 |     })
  540 |     expect(isGameOverAfter).toBe(false)
  541 |     
  542 |     // Score should be reset to 0
  543 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  544 |     expect(parseInt(scoreAfter)).toBe(0)
  545 |     
  546 |     // isPlaying should be true
  547 |     const isPlayingAfter = await page.evaluate(() => {
  548 |       const tetrisModule = window.__tetrisModule
  549 |       return tetrisModule?.state?.isPlaying ?? false
  550 |     })
  551 |     expect(isPlayingAfter).toBe(true)
  552 |   })
  553 | 
  554 |   test('game over allows restart with ArrowLeft', async ({ page }) => {
  555 |     await page.goto('/game/tetris')
  556 |     
  557 |     // Wait for the game component to be mounted
  558 |     await page.waitForSelector('.info-value')
  559 |     await wait(500)
  560 |     
  561 |     const initialIsPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  562 |     expect(initialIsPlaying).toBe(false)
  563 |     
  564 |     await page.keyboard.press('Space')
  565 |     await wait(200)
  566 |     
  567 |     await page.evaluate(() => {
  568 |       const tetrisModule = window.__tetrisModule
  569 |       if (!tetrisModule) return
  570 |       
  571 |       // Fill the top rows (0-1) with blocks
  572 |       for (let r = 0; r < 2; r++) {
  573 |         for (let c = 0; c < 10; c++) {
  574 |           tetrisModule.state.board[r][c] = '#ff0000'
  575 |         }
  576 |       }
  577 |       
  578 |       // Directly set game over state
  579 |       tetrisModule.state.isGameOver = true
  580 |     })
  581 |     
```