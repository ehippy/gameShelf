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
  461 |     // Force game over by filling the board
  462 |     await page.evaluate(() => {
  463 |       const tetrisModule = window.__tetrisModule
  464 |       if (!tetrisModule) return
  465 |       
  466 |       // Fill most of the board with blocks
  467 |       for (let r = 10; r < 20; r++) {
  468 |         for (let c = 0; c < 10; c++) {
  469 |           tetrisModule.state.board[r][c] = '#ff0000'
  470 |         }
  471 |       }
  472 |       
  473 |       // Place piece in a position where it will cause game over
  474 |       tetrisModule.state.currentPiece = {
  475 |         type: 'O',
  476 |         shape: [[1, 1], [1, 1]],
  477 |         color: '#f0f000',
  478 |         row: 0,
  479 |         col: 4
  480 |       }
  481 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  482 |       
  483 |       // Force game over by calling spawnPiece which will check isValidPosition
  484 |       // Since the piece is at row 0 and there are blocks in the board, spawnPiece should fail
  485 |       // But we need to clear the nextPiece first so spawnPiece creates a new piece
  486 |       tetrisModule.state.nextPiece = null
  487 |       tetrisModule.state.bag = []
  488 |       
  489 |       // Call update which will trigger lockPiece -> spawnPiece -> game over check
  490 |       tetrisModule.update()
  491 |     })
  492 |     
  493 |     await wait(300)
  494 |     
  495 |     // Check if game over overlay is visible
  496 |     const gameOverOverlay = page.locator('.game-over-overlay')
> 497 |     await expect(gameOverOverlay).toBeVisible()
      |                                   ^ Error: expect(locator).toBeVisible() failed
  498 |     
  499 |     // Verify isGameOver state
  500 |     const isGameOver = await page.evaluate(() => {
  501 |       const tetrisModule = window.__tetrisModule
  502 |       return tetrisModule?.state?.isGameOver ?? false
  503 |     })
  504 |     expect(isGameOver).toBe(true)
  505 |   })
  506 | 
  507 |   test('game over allows restart with Space', async ({ page }) => {
  508 |     // First, get the game to a game over state
  509 |     await page.goto('/game/tetris')
  510 |     
  511 |     // Wait for the game component to be mounted
  512 |     await page.waitForSelector('.info-value')
  513 |     await wait(500)
  514 |     
  515 |     const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  516 |     expect(isPlaying).toBe(false)
  517 |     
  518 |     await page.keyboard.press('Space')
  519 |     await wait(200)
  520 |     
  521 |     await page.evaluate(() => {
  522 |       const tetrisModule = window.__tetrisModule
  523 |       if (!tetrisModule) return
  524 |       
  525 |       // Fill board to force game over
  526 |       for (let r = 10; r < 20; r++) {
  527 |         for (let c = 0; c < 10; c++) {
  528 |           tetrisModule.state.board[r][c] = '#ff0000'
  529 |         }
  530 |       }
  531 |       
  532 |       tetrisModule.state.currentPiece = {
  533 |         type: 'O',
  534 |         shape: [[1, 1], [1, 1]],
  535 |         color: '#f0f000',
  536 |         row: 0,
  537 |         col: 4
  538 |       }
  539 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  540 |       tetrisModule.update()
  541 |     })
  542 |     
  543 |     await wait(300)
  544 |     
  545 |     // Verify game over state
  546 |     const isGameOverBefore = await page.evaluate(() => {
  547 |       const tetrisModule = window.__tetrisModule
  548 |       return tetrisModule?.state?.isGameOver ?? false
  549 |     })
  550 |     expect(isGameOverBefore).toBe(true)
  551 |     
  552 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  553 |     
  554 |     // Press Space to restart
  555 |     await page.keyboard.press('Space')
  556 |     await wait(200)
  557 |     
  558 |     // Verify game restarted
  559 |     const isGameOverAfter = await page.evaluate(() => {
  560 |       const tetrisModule = window.__tetrisModule
  561 |       return tetrisModule?.state?.isGameOver ?? false
  562 |     })
  563 |     expect(isGameOverAfter).toBe(false)
  564 |     
  565 |     // Score should be reset to 0
  566 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  567 |     expect(parseInt(scoreAfter)).toBe(0)
  568 |     
  569 |     // isPlaying should be true
  570 |     const isPlayingAfter = await page.evaluate(() => {
  571 |       const tetrisModule = window.__tetrisModule
  572 |       return tetrisModule?.state?.isPlaying ?? false
  573 |     })
  574 |     expect(isPlayingAfter).toBe(true)
  575 |   })
  576 | 
  577 |   test('game over allows restart with ArrowLeft', async ({ page }) => {
  578 |     await page.goto('/game/tetris')
  579 |     
  580 |     // Wait for the game component to be mounted
  581 |     await page.waitForSelector('.info-value')
  582 |     await wait(500)
  583 |     
  584 |     const initialIsPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  585 |     expect(initialIsPlaying).toBe(false)
  586 |     
  587 |     await page.keyboard.press('Space')
  588 |     await wait(200)
  589 |     
  590 |     await page.evaluate(() => {
  591 |       const tetrisModule = window.__tetrisModule
  592 |       if (!tetrisModule) return
  593 |       
  594 |       for (let r = 10; r < 20; r++) {
  595 |         for (let c = 0; c < 10; c++) {
  596 |           tetrisModule.state.board[r][c] = '#ff0000'
  597 |         }
```