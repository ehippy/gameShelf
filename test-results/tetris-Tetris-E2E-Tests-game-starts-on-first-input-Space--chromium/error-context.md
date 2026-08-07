# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> game starts on first input (Space)
- Location: tests/e2e/tetris.spec.js:16:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('canvas') to be visible

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | // Helper to wait for a short time to allow game state updates
  4   | const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  5   | 
  6   | test.describe('Tetris E2E Tests', () => {
  7   |   test.beforeEach(async ({ page }) => {
  8   |     await page.goto('/game/tetris')
  9   |     // Wait for canvas to be rendered
> 10  |     await page.waitForSelector('canvas')
      |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  11  |     await wait(100)
  12  |   })
  13  | 
  14  |   // ─── Test 1: Game starts on first input ─────────────────────────────────────
  15  | 
  16  |   test('game starts on first input (Space)', async ({ page }) => {
  17  |     // Get initial state from the page
  18  |     const scoreBefore = await page.locator('.info-value').first().textContent()
  19  |     
  20  |     // Press Space to start the game
  21  |     await page.keyboard.press('Space')
  22  |     await wait(100)
  23  |     
  24  |     // Verify isPlaying changed (score should increase from soft drop bonus)
  25  |     const scoreAfter = await page.locator('.info-value').first().textContent()
  26  |     expect(parseInt(scoreAfter)).toBeGreaterThan(parseInt(scoreBefore))
  27  |   })
  28  | 
  29  |   test('game starts on first input (ArrowDown)', async ({ page }) => {
  30  |     const scoreBefore = await page.locator('.info-value').first().textContent()
  31  |     
  32  |     // Press ArrowDown to start the game
  33  |     await page.keyboard.press('ArrowDown')
  34  |     await wait(100)
  35  |     
  36  |     const scoreAfter = await page.locator('.info-value').first().textContent()
  37  |     expect(parseInt(scoreAfter)).toBeGreaterThan(parseInt(scoreBefore))
  38  |   })
  39  | 
  40  |   // ─── Test 2: Keyboard controls work ─────────────────────────────────────────
  41  | 
  42  |   test('keyboard controls work - ArrowLeft moves piece left', async ({ page }) => {
  43  |     // Start the game first
  44  |     await page.keyboard.press('Space')
  45  |     await wait(200)
  46  |     
  47  |     // Get initial column position by checking canvas state
  48  |     const colBefore = await page.evaluate(() => {
  49  |       const tetrisModule = window.__tetrisModule
  50  |       return tetrisModule?.state?.currentPiece?.col ?? null
  51  |     })
  52  |     
  53  |     // Press ArrowLeft
  54  |     await page.keyboard.press('ArrowLeft')
  55  |     await wait(100)
  56  |     
  57  |     const colAfter = await page.evaluate(() => {
  58  |       const tetrisModule = window.__tetrisModule
  59  |       return tetrisModule?.state?.currentPiece?.col ?? null
  60  |     })
  61  |     
  62  |     expect(colAfter).toBeLessThan(colBefore)
  63  |   })
  64  | 
  65  |   test('keyboard controls work - ArrowRight moves piece right', async ({ page }) => {
  66  |     await page.keyboard.press('Space')
  67  |     await wait(200)
  68  |     
  69  |     const colBefore = await page.evaluate(() => {
  70  |       const tetrisModule = window.__tetrisModule
  71  |       return tetrisModule?.state?.currentPiece?.col ?? null
  72  |     })
  73  |     
  74  |     await page.keyboard.press('ArrowRight')
  75  |     await wait(100)
  76  |     
  77  |     const colAfter = await page.evaluate(() => {
  78  |       const tetrisModule = window.__tetrisModule
  79  |       return tetrisModule?.state?.currentPiece?.col ?? null
  80  |     })
  81  |     
  82  |     expect(colAfter).toBeGreaterThan(colBefore)
  83  |   })
  84  | 
  85  |   test('keyboard controls work - ArrowDown moves piece down', async ({ page }) => {
  86  |     await page.keyboard.press('Space')
  87  |     await wait(200)
  88  |     
  89  |     const rowBefore = await page.evaluate(() => {
  90  |       const tetrisModule = window.__tetrisModule
  91  |       return tetrisModule?.state?.currentPiece?.row ?? null
  92  |     })
  93  |     
  94  |     await page.keyboard.press('ArrowDown')
  95  |     await wait(100)
  96  |     
  97  |     const rowAfter = await page.evaluate(() => {
  98  |       const tetrisModule = window.__tetrisModule
  99  |       return tetrisModule?.state?.currentPiece?.row ?? null
  100 |     })
  101 |     
  102 |     expect(rowAfter).toBeGreaterThan(rowBefore)
  103 |   })
  104 | 
  105 |   // ─── Test 3: Lines clear when full rows form ────────────────────────────────
  106 | 
  107 |   test('lines clear when full rows form (4 lines)', async ({ page }) => {
  108 |     await page.keyboard.press('Space')
  109 |     await wait(200)
  110 |     
```