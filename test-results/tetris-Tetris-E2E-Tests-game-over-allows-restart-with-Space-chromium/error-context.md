# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> game over allows restart with Space
- Location: tests/e2e/tetris.spec.js:501:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
  483 |       // Force game over by making isValidPosition return false
  484 |       tetrisModule.update()
  485 |     })
  486 |     
  487 |     await wait(300)
  488 |     
  489 |     // Check if game over overlay is visible
  490 |     const gameOverOverlay = page.locator('.game-over-overlay')
  491 |     await expect(gameOverOverlay).toBeVisible()
  492 |     
  493 |     // Verify isGameOver state
  494 |     const isGameOver = await page.evaluate(() => {
  495 |       const tetrisModule = window.__tetrisModule
  496 |       return tetrisModule?.state?.isGameOver ?? false
  497 |     })
  498 |     expect(isGameOver).toBe(true)
  499 |   })
  500 | 
  501 |   test('game over allows restart with Space', async ({ page }) => {
  502 |     // First, get the game to a game over state
  503 |     await page.goto('/game/tetris')
  504 |     
  505 |     // Wait for the game component to be mounted
  506 |     await page.waitForSelector('.info-value')
  507 |     await wait(500)
  508 |     
  509 |     const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  510 |     expect(isPlaying).toBe(false)
  511 |     
  512 |     await page.keyboard.press('Space')
  513 |     await wait(200)
  514 |     
  515 |     await page.evaluate(() => {
  516 |       const tetrisModule = window.__tetrisModule
  517 |       if (!tetrisModule) return
  518 |       
  519 |       // Fill board to force game over
  520 |       for (let r = 10; r < 20; r++) {
  521 |         for (let c = 0; c < 10; c++) {
  522 |           tetrisModule.state.board[r][c] = '#ff0000'
  523 |         }
  524 |       }
  525 |       
  526 |       tetrisModule.state.currentPiece = {
  527 |         type: 'O',
  528 |         shape: [[1, 1], [1, 1]],
  529 |         color: '#f0f000',
  530 |         row: 0,
  531 |         col: 4
  532 |       }
  533 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  534 |       tetrisModule.update()
  535 |     })
  536 |     
  537 |     await wait(300)
  538 |     
  539 |     // Verify game over state
  540 |     const isGameOverBefore = await page.evaluate(() => {
  541 |       const tetrisModule = window.__tetrisModule
  542 |       return tetrisModule?.state?.isGameOver ?? false
  543 |     })
> 544 |     expect(isGameOverBefore).toBe(true)
      |                              ^ Error: expect(received).toBe(expected) // Object.is equality
  545 |     
  546 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  547 |     
  548 |     // Press Space to restart
  549 |     await page.keyboard.press('Space')
  550 |     await wait(200)
  551 |     
  552 |     // Verify game restarted
  553 |     const isGameOverAfter = await page.evaluate(() => {
  554 |       const tetrisModule = window.__tetrisModule
  555 |       return tetrisModule?.state?.isGameOver ?? false
  556 |     })
  557 |     expect(isGameOverAfter).toBe(false)
  558 |     
  559 |     // Score should be reset to 0
  560 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  561 |     expect(parseInt(scoreAfter)).toBe(0)
  562 |     
  563 |     // isPlaying should be true
  564 |     const isPlayingAfter = await page.evaluate(() => {
  565 |       const tetrisModule = window.__tetrisModule
  566 |       return tetrisModule?.state?.isPlaying ?? false
  567 |     })
  568 |     expect(isPlayingAfter).toBe(true)
  569 |   })
  570 | 
  571 |   test('game over allows restart with ArrowLeft', async ({ page }) => {
  572 |     await page.goto('/game/tetris')
  573 |     
  574 |     // Wait for the game component to be mounted
  575 |     await page.waitForSelector('.info-value')
  576 |     await wait(500)
  577 |     
  578 |     const initialIsPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  579 |     expect(initialIsPlaying).toBe(false)
  580 |     
  581 |     await page.keyboard.press('Space')
  582 |     await wait(200)
  583 |     
  584 |     await page.evaluate(() => {
  585 |       const tetrisModule = window.__tetrisModule
  586 |       if (!tetrisModule) return
  587 |       
  588 |       for (let r = 10; r < 20; r++) {
  589 |         for (let c = 0; c < 10; c++) {
  590 |           tetrisModule.state.board[r][c] = '#ff0000'
  591 |         }
  592 |       }
  593 |       
  594 |       tetrisModule.state.currentPiece = {
  595 |         type: 'O',
  596 |         shape: [[1, 1], [1, 1]],
  597 |         color: '#f0f000',
  598 |         row: 0,
  599 |         col: 4
  600 |       }
  601 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  602 |       tetrisModule.update()
  603 |     })
  604 |     
  605 |     await wait(300)
  606 |     
  607 |     // Press ArrowLeft to restart (three-way logic handles this)
  608 |     await page.keyboard.press('ArrowLeft')
  609 |     await wait(200)
  610 |     
  611 |     const isGameOver = await page.evaluate(() => {
  612 |       const tetrisModule = window.__tetrisModule
  613 |       return tetrisModule?.state?.isGameOver ?? false
  614 |     })
  615 |     expect(isGameOver).toBe(false)
  616 |     
  617 |     const score = await page.locator('.info-value').first().textContent()
  618 |     expect(parseInt(score)).toBe(0)
  619 |   })
  620 | })
  621 | 
```