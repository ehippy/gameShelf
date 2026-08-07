# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> game starts on first input (Space)
- Location: tests/e2e/tetris.spec.js:16:3

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - heading "gameShelf" [level=1] [ref=e4]
    - generic [ref=e5]:
      - textbox "Search games..." [ref=e6]
      - combobox [ref=e7] [cursor=pointer]:
        - option "All Categories" [selected]
        - option "Arcade"
        - option "Puzzle"
        - option "Action"
    - navigation [ref=e8]:
      - link "Home" [ref=e9] [cursor=pointer]:
        - /url: /
      - link "High Scores" [ref=e10] [cursor=pointer]:
        - /url: /highscores
      - link "About" [ref=e11] [cursor=pointer]:
        - /url: /about
  - generic [ref=e12]:
    - heading "Tetris" [level=1] [ref=e13]
    - generic [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e17]: Score
        - generic [ref=e18]: "0"
      - generic [ref=e19]:
        - generic [ref=e20]: Level
        - generic [ref=e21]: "1"
      - generic [ref=e22]:
        - generic [ref=e23]: Lines
        - generic [ref=e24]: "0"
  - contentinfo [ref=e27]:
    - paragraph [ref=e28]: © 2025 gameShelf — All games built in browser — no downloads required
    - link "About" [ref=e29] [cursor=pointer]:
      - /url: /about
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
  10  |     await page.waitForSelector('canvas')
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
  22  |     await wait(500)  // Wait for game to process
  23  |     
  24  |     // Verify isPlaying state
  25  |     const isPlaying = await page.evaluate(() => {
  26  |       const tetrisModule = window.__tetrisModule
  27  |       return tetrisModule?.state?.isPlaying ?? false
  28  |     })
  29  |     expect(isPlaying).toBe(true)
  30  |     
  31  |     // Verify piece moved (soft drop bonus or hard drop bonus)
  32  |     const rowAfter = await page.evaluate(() => {
  33  |       const tetrisModule = window.__tetrisModule
  34  |       return tetrisModule?.state?.currentPiece?.row ?? null
  35  |     })
> 36  |     expect(rowAfter).toBeGreaterThan(0)
      |                      ^ Error: expect(received).toBeGreaterThan(expected)
  37  |   })
  38  | 
  39  |   test('game starts on first input (ArrowDown)', async ({ page }) => {
  40  |     // Get initial state from the page
  41  |     const scoreBefore = await page.locator('.info-value').first().textContent()
  42  |     
  43  |     // Press ArrowDown to start the game
  44  |     await page.keyboard.press('ArrowDown')
  45  |     await wait(500)  // Wait for game to process
  46  |     
  47  |     // Verify isPlaying state
  48  |     const isPlaying = await page.evaluate(() => {
  49  |       const tetrisModule = window.__tetrisModule
  50  |       return tetrisModule?.state?.isPlaying ?? false
  51  |     })
  52  |     expect(isPlaying).toBe(true)
  53  |     
  54  |     // Verify piece moved (soft drop bonus)
  55  |     const rowAfter = await page.evaluate(() => {
  56  |       const tetrisModule = window.__tetrisModule
  57  |       return tetrisModule?.state?.currentPiece?.row ?? null
  58  |     })
  59  |     expect(rowAfter).toBeGreaterThan(0)
  60  |   })
  61  | 
  62  |   // ─── Test 2: Keyboard controls work ─────────────────────────────────────────
  63  | 
  64  |   test('keyboard controls work - ArrowLeft moves piece left', async ({ page }) => {
  65  |     // Start the game first
  66  |     await page.keyboard.press('Space')
  67  |     await wait(200)
  68  |     
  69  |     // Get initial column position by checking canvas state
  70  |     const colBefore = await page.evaluate(() => {
  71  |       const tetrisModule = window.__tetrisModule
  72  |       return tetrisModule?.state?.currentPiece?.col ?? null
  73  |     })
  74  |     
  75  |     // Press ArrowLeft
  76  |     await page.keyboard.press('ArrowLeft')
  77  |     await wait(100)
  78  |     
  79  |     const colAfter = await page.evaluate(() => {
  80  |       const tetrisModule = window.__tetrisModule
  81  |       return tetrisModule?.state?.currentPiece?.col ?? null
  82  |     })
  83  |     
  84  |     expect(colAfter).toBeLessThan(colBefore)
  85  |   })
  86  | 
  87  |   test('keyboard controls work - ArrowRight moves piece right', async ({ page }) => {
  88  |     await page.keyboard.press('Space')
  89  |     await wait(200)
  90  |     
  91  |     const colBefore = await page.evaluate(() => {
  92  |       const tetrisModule = window.__tetrisModule
  93  |       return tetrisModule?.state?.currentPiece?.col ?? null
  94  |     })
  95  |     
  96  |     await page.keyboard.press('ArrowRight')
  97  |     await wait(100)
  98  |     
  99  |     const colAfter = await page.evaluate(() => {
  100 |       const tetrisModule = window.__tetrisModule
  101 |       return tetrisModule?.state?.currentPiece?.col ?? null
  102 |     })
  103 |     
  104 |     expect(colAfter).toBeGreaterThan(colBefore)
  105 |   })
  106 | 
  107 |   test('keyboard controls work - ArrowDown moves piece down', async ({ page }) => {
  108 |     await page.keyboard.press('Space')
  109 |     await wait(200)
  110 |     
  111 |     const rowBefore = await page.evaluate(() => {
  112 |       const tetrisModule = window.__tetrisModule
  113 |       return tetrisModule?.state?.currentPiece?.row ?? null
  114 |     })
  115 |     
  116 |     await page.keyboard.press('ArrowDown')
  117 |     await wait(100)
  118 |     
  119 |     const rowAfter = await page.evaluate(() => {
  120 |       const tetrisModule = window.__tetrisModule
  121 |       return tetrisModule?.state?.currentPiece?.row ?? null
  122 |     })
  123 |     
  124 |     expect(rowAfter).toBeGreaterThan(rowBefore)
  125 |   })
  126 | 
  127 |   // ─── Test 3: Lines clear when full rows form ────────────────────────────────
  128 | 
  129 |   test('lines clear when full rows form (4 lines)', async ({ page }) => {
  130 |     await page.keyboard.press('Space')
  131 |     await wait(200)
  132 |     
  133 |     // Get initial lines and score
  134 |     const linesBefore = await page.locator('.info-value').nth(2).textContent()
  135 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  136 |     
```