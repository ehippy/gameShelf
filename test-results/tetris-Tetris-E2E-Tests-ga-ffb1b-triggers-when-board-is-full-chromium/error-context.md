# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> game over triggers when board is full
- Location: tests/e2e/tetris.spec.js:446:3

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
  484 |     
  485 |     await wait(300)
  486 |     
  487 |     // Check if game over overlay is visible
  488 |     const gameOverOverlay = page.locator('.game-over-overlay')
> 489 |     await expect(gameOverOverlay).toBeVisible()
      |                                   ^ Error: expect(locator).toBeVisible() failed
  490 |     
  491 |     // Verify isGameOver state
  492 |     const isGameOver = await page.evaluate(() => {
  493 |       const tetrisModule = window.__tetrisModule
  494 |       return tetrisModule?.state?.isGameOver ?? false
  495 |     })
  496 |     expect(isGameOver).toBe(true)
  497 |   })
  498 | 
  499 |   test('game over allows restart with Space', async ({ page }) => {
  500 |     // First, get the game to a game over state
  501 |     await page.goto('/game/tetris')
  502 |     
  503 |     // Wait for the game component to be mounted
  504 |     await page.waitForSelector('.info-value')
  505 |     await wait(500)
  506 |     
  507 |     const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  508 |     expect(isPlaying).toBe(false)
  509 |     
  510 |     await page.keyboard.press('Space')
  511 |     await wait(200)
  512 |     
  513 |     await page.evaluate(() => {
  514 |       const tetrisModule = window.__tetrisModule
  515 |       if (!tetrisModule) return
  516 |       
  517 |       // Fill board to force game over
  518 |       for (let r = 10; r < 20; r++) {
  519 |         for (let c = 0; c < 10; c++) {
  520 |           tetrisModule.state.board[r][c] = '#ff0000'
  521 |         }
  522 |       }
  523 |       
  524 |       tetrisModule.state.currentPiece = {
  525 |         type: 'O',
  526 |         shape: [[1, 1], [1, 1]],
  527 |         color: '#f0f000',
  528 |         row: 0,
  529 |         col: 4
  530 |       }
  531 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  532 |       tetrisModule.update()
  533 |     })
  534 |     
  535 |     await wait(300)
  536 |     
  537 |     // Verify game over state
  538 |     const isGameOverBefore = await page.evaluate(() => {
  539 |       const tetrisModule = window.__tetrisModule
  540 |       return tetrisModule?.state?.isGameOver ?? false
  541 |     })
  542 |     expect(isGameOverBefore).toBe(true)
  543 |     
  544 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  545 |     
  546 |     // Press Space to restart
  547 |     await page.keyboard.press('Space')
  548 |     await wait(200)
  549 |     
  550 |     // Verify game restarted
  551 |     const isGameOverAfter = await page.evaluate(() => {
  552 |       const tetrisModule = window.__tetrisModule
  553 |       return tetrisModule?.state?.isGameOver ?? false
  554 |     })
  555 |     expect(isGameOverAfter).toBe(false)
  556 |     
  557 |     // Score should be reset to 0
  558 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  559 |     expect(parseInt(scoreAfter)).toBe(0)
  560 |     
  561 |     // isPlaying should be true
  562 |     const isPlayingAfter = await page.evaluate(() => {
  563 |       const tetrisModule = window.__tetrisModule
  564 |       return tetrisModule?.state?.isPlaying ?? false
  565 |     })
  566 |     expect(isPlayingAfter).toBe(true)
  567 |   })
  568 | 
  569 |   test('game over allows restart with ArrowLeft', async ({ page }) => {
  570 |     await page.goto('/game/tetris')
  571 |     
  572 |     // Wait for the game component to be mounted
  573 |     await page.waitForSelector('.info-value')
  574 |     await wait(500)
  575 |     
  576 |     const initialIsPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  577 |     expect(initialIsPlaying).toBe(false)
  578 |     
  579 |     await page.keyboard.press('Space')
  580 |     await wait(200)
  581 |     
  582 |     await page.evaluate(() => {
  583 |       const tetrisModule = window.__tetrisModule
  584 |       if (!tetrisModule) return
  585 |       
  586 |       for (let r = 10; r < 20; r++) {
  587 |         for (let c = 0; c < 10; c++) {
  588 |           tetrisModule.state.board[r][c] = '#ff0000'
  589 |         }
```