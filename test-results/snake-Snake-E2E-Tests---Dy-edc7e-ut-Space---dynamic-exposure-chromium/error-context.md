# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: snake.spec.js >> Snake E2E Tests - Dynamic Window Exposure >> game starts on first input (Space) - dynamic exposure
- Location: tests/e2e/snake.spec.js:76:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
    - heading "Snake" [level=1] [ref=e13]
    - generic [ref=e16]:
      - generic [ref=e17]: Score
      - generic [ref=e18]: "0"
  - contentinfo [ref=e21]:
    - paragraph [ref=e22]: © 2025 gameShelf — All games built in browser — no downloads required
    - link "About" [ref=e23] [cursor=pointer]:
      - /url: /about
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | // Helper to wait for a short time to allow game state updates
  4   | const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  5   | 
  6   | test.describe('Snake E2E Tests - Dynamic Window Exposure', () => {
  7   |   test.beforeEach(async ({ page }) => {
  8   |     await page.goto('/game/snake')
  9   |     // Wait for canvas to be rendered
  10  |     await page.waitForSelector('canvas')
  11  |     await wait(100)
  12  |   })
  13  | 
  14  |   // ─── Test: Verify dynamic window exposure works for Snake ───────────────────
  15  | 
  16  |   test('window.__snakeModule is available for E2E tests', async ({ page }) => {
  17  |     const moduleAvailable = await page.evaluate(() => {
  18  |       console.log('Checking window keys:', Object.keys(window).filter(k => k.startsWith('__')))
  19  |       return window.__snakeModule !== undefined
  20  |     })
  21  |     expect(moduleAvailable).toBe(true)
  22  |   })
  23  | 
  24  |   test('window.__snakeReactiveState is available for E2E tests', async ({ page }) => {
  25  |     const stateAvailable = await page.evaluate(() => {
  26  |       return window.__snakeReactiveState !== undefined
  27  |     })
  28  |     expect(stateAvailable).toBe(true)
  29  |   })
  30  | 
  31  |   test('snake module has required exports', async ({ page }) => {
  32  |     const exportsCheck = await page.evaluate(() => {
  33  |       const snakeModule = window.__snakeModule
  34  |       if (!snakeModule) return { error: 'Module not found' }
  35  |       
  36  |       const requiredExports = ['init', 'update', 'render', 'reset', 'handleKeydown']
  37  |       const missing = requiredExports.filter(exportName => typeof snakeModule[exportName] !== 'function')
  38  |       
  39  |       return {
  40  |         hasInit: typeof snakeModule.init === 'function',
  41  |         hasUpdate: typeof snakeModule.update === 'function',
  42  |         hasRender: typeof snakeModule.render === 'function',
  43  |         hasReset: typeof snakeModule.reset === 'function',
  44  |         hasHandleKeydown: typeof snakeModule.handleKeydown === 'function',
  45  |         missingExports: missing.length > 0 ? missing : null
  46  |       }
  47  |     })
  48  |     
  49  |     expect(exportsCheck.hasInit).toBe(true)
  50  |     expect(exportsCheck.hasUpdate).toBe(true)
  51  |     expect(exportsCheck.hasRender).toBe(true)
  52  |     expect(exportsCheck.hasReset).toBe(true)
  53  |     expect(exportsCheck.hasHandleKeydown).toBe(true)
  54  |     expect(exportsCheck.missingExports).toBeNull()
  55  |   })
  56  | 
  57  |   test('snake reactive state has isPlaying property', async ({ page }) => {
  58  |     const stateCheck = await page.evaluate(() => {
  59  |       const snakeState = window.__snakeReactiveState
  60  |       if (!snakeState) return { error: 'State not found' }
  61  |       
  62  |       return {
  63  |         hasIsPlaying: snakeState.isPlaying !== undefined,
  64  |         isPlayingInitial: snakeState.isPlaying === false, // Should be false initially
  65  |         hasScore: snakeState.score !== undefined,
  66  |         hasDirection: snakeState.direction !== undefined
  67  |       }
  68  |     })
  69  |     
  70  |     expect(stateCheck.hasIsPlaying).toBe(true)
  71  |     expect(stateCheck.isPlayingInitial).toBe(true) // Not playing initially
  72  |     expect(stateCheck.hasScore).toBe(true)
  73  |     expect(stateCheck.hasDirection).toBe(true)
  74  |   })
  75  | 
  76  |   test('game starts on first input (Space) - dynamic exposure', async ({ page }) => {
  77  |     // Verify initial state before starting
  78  |     const initialPlaying = await page.evaluate(() => {
  79  |       return window.__snakeReactiveState?.isPlaying ?? null
  80  |     })
  81  |     expect(initialPlaying).toBe(false)
  82  |     
  83  |     // Press Space to start the game (three-way logic)
  84  |     await page.keyboard.press('Space')
  85  |     await wait(500)
  86  |     
  87  |     // Verify isPlaying changed after input
  88  |     const isPlaying = await page.evaluate(() => {
  89  |       return window.__snakeReactiveState?.isPlaying ?? null
  90  |     })
> 91  |     expect(isPlaying).toBe(true)
      |                       ^ Error: expect(received).toBe(expected) // Object.is equality
  92  |   })
  93  | 
  94  |   test('keyboard controls work - ArrowUp changes direction', async ({ page }) => {
  95  |     // Start the game first
  96  |     await page.keyboard.press('Space')
  97  |     await wait(200)
  98  |     
  99  |     // Get initial direction
  100 |     const initialDirection = await page.evaluate(() => {
  101 |       return window.__snakeReactiveState?.direction ?? null
  102 |     })
  103 |     
  104 |     // Press ArrowUp
  105 |     await page.keyboard.press('ArrowUp')
  106 |     await wait(100)
  107 |     
  108 |     // Verify direction changed
  109 |     const newDirection = await page.evaluate(() => {
  110 |       return window.__snakeReactiveState?.direction ?? null
  111 |     })
  112 |     
  113 |     expect(newDirection).toBe('up')
  114 |   })
  115 | })
  116 | 
```