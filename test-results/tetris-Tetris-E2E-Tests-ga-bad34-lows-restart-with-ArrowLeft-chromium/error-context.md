# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> game over allows restart with ArrowLeft
- Location: tests/e2e/tetris.spec.js:556:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 36
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
    - generic [ref=f1e14]:
      - generic [ref=f1e15]:
        - generic [ref=f1e16]:
          - generic [ref=f1e17]: Score
          - generic [ref=f1e18]: "36"
        - generic [ref=f1e19]:
          - generic [ref=f1e20]: Level
          - generic [ref=f1e21]: "1"
        - generic [ref=f1e22]:
          - generic [ref=f1e23]: Lines
          - generic [ref=f1e24]: "0"
      - generic [ref=f1e27]:
        - heading "Game Over" [level=2] [ref=f1e28]
        - paragraph [ref=f1e29]: "Score: 36"
        - button "Play Again" [ref=f1e30] [cursor=pointer]
  - contentinfo [ref=f1e31]:
    - paragraph [ref=f1e32]: © 2025 gameShelf — All games built in browser — no downloads required
    - link "About" [ref=f1e33] [cursor=pointer]:
      - /url: /about
```

# Test source

```ts
  498 |     await wait(500)
  499 |     
  500 |     const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  501 |     expect(isPlaying).toBe(false)
  502 |     
  503 |     await page.keyboard.press('Space')
  504 |     await wait(200)
  505 |     
  506 |     await page.evaluate(() => {
  507 |       const tetrisModule = window.__tetrisModule
  508 |       const reactiveState = window.__tetrisReactiveState
  509 |       if (!tetrisModule || !reactiveState) return
  510 |       
  511 |       // Fill the top rows (0-1) with blocks
  512 |       for (let r = 0; r < 2; r++) {
  513 |         for (let c = 0; c < 10; c++) {
  514 |           tetrisModule.state.board[r][c] = '#ff0000'
  515 |         }
  516 |       }
  517 |       
  518 |       // Directly set game over state on the reactive object
  519 |       reactiveState.isGameOver = true
  520 |     })
  521 |     
  522 |     await wait(300)
  523 |     
  524 |     // Verify game over state
  525 |     const isGameOverBefore = await page.evaluate(() => {
  526 |       const tetrisModule = window.__tetrisModule
  527 |       return tetrisModule?.state?.isGameOver ?? false
  528 |     })
  529 |     expect(isGameOverBefore).toBe(true)
  530 |     
  531 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  532 |     
  533 |     // Press Space to restart
  534 |     await page.keyboard.press('Space')
  535 |     await wait(200)
  536 |     
  537 |     // Verify game restarted
  538 |     const isGameOverAfter = await page.evaluate(() => {
  539 |       const tetrisModule = window.__tetrisModule
  540 |       return tetrisModule?.state?.isGameOver ?? false
  541 |     })
  542 |     expect(isGameOverAfter).toBe(false)
  543 |     
  544 |     // Score should be reset to 0
  545 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  546 |     expect(parseInt(scoreAfter)).toBe(0)
  547 |     
  548 |     // isPlaying should be true
  549 |     const isPlayingAfter = await page.evaluate(() => {
  550 |       const tetrisModule = window.__tetrisModule
  551 |       return tetrisModule?.state?.isPlaying ?? false
  552 |     })
  553 |     expect(isPlayingAfter).toBe(true)
  554 |   })
  555 | 
  556 |   test('game over allows restart with ArrowLeft', async ({ page }) => {
  557 |     await page.goto('/game/tetris')
  558 |     
  559 |     // Wait for the game component to be mounted
  560 |     await page.waitForSelector('.info-value')
  561 |     await wait(500)
  562 |     
  563 |     const initialIsPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  564 |     expect(initialIsPlaying).toBe(false)
  565 |     
  566 |     await page.keyboard.press('Space')
  567 |     await wait(200)
  568 |     
  569 |     await page.evaluate(() => {
  570 |       const tetrisModule = window.__tetrisModule
  571 |       const reactiveState = window.__tetrisReactiveState
  572 |       if (!tetrisModule || !reactiveState) return
  573 |       
  574 |       // Fill the top rows (0-1) with blocks
  575 |       for (let r = 0; r < 2; r++) {
  576 |         for (let c = 0; c < 10; c++) {
  577 |           tetrisModule.state.board[r][c] = '#ff0000'
  578 |         }
  579 |       }
  580 |       
  581 |       // Directly set game over state on the reactive object
  582 |       reactiveState.isGameOver = true
  583 |     })
  584 |     
  585 |     await wait(300)
  586 |     
  587 |     // Press ArrowLeft to restart (three-way logic handles this)
  588 |     await page.keyboard.press('ArrowLeft')
  589 |     await wait(200)
  590 |     
  591 |     const isGameOver = await page.evaluate(() => {
  592 |       const tetrisModule = window.__tetrisModule
  593 |       return tetrisModule?.state?.isGameOver ?? false
  594 |     })
  595 |     expect(isGameOver).toBe(false)
  596 |     
  597 |     const score = await page.locator('.info-value').first().textContent()
> 598 |     expect(parseInt(score)).toBe(0)
      |                             ^ Error: expect(received).toBe(expected) // Object.is equality
  599 |   })
  600 | })
  601 | 
```