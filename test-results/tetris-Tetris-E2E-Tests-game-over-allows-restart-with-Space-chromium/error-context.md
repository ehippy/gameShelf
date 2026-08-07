# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> game over allows restart with Space
- Location: tests/e2e/tetris.spec.js:507:3

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
  497 |     await expect(gameOverOverlay).toBeVisible()
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
> 550 |     expect(isGameOverBefore).toBe(true)
      |                              ^ Error: expect(received).toBe(expected) // Object.is equality
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
  598 |       }
  599 |       
  600 |       tetrisModule.state.currentPiece = {
  601 |         type: 'O',
  602 |         shape: [[1, 1], [1, 1]],
  603 |         color: '#f0f000',
  604 |         row: 0,
  605 |         col: 4
  606 |       }
  607 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  608 |       tetrisModule.update()
  609 |     })
  610 |     
  611 |     await wait(300)
  612 |     
  613 |     // Press ArrowLeft to restart (three-way logic handles this)
  614 |     await page.keyboard.press('ArrowLeft')
  615 |     await wait(200)
  616 |     
  617 |     const isGameOver = await page.evaluate(() => {
  618 |       const tetrisModule = window.__tetrisModule
  619 |       return tetrisModule?.state?.isGameOver ?? false
  620 |     })
  621 |     expect(isGameOver).toBe(false)
  622 |     
  623 |     const score = await page.locator('.info-value').first().textContent()
  624 |     expect(parseInt(score)).toBe(0)
  625 |   })
  626 | })
  627 | 
```