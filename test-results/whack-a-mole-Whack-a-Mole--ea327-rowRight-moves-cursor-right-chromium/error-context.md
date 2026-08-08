# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: whack-a-mole.spec.js >> Whack-a-Mole E2E Tests - Dynamic Window Exposure >> whack-a-mole keyboard controls work - ArrowRight moves cursor right
- Location: tests/e2e/whack-a-mole.spec.js:78:3

# Error details

```
Error: expect(received).not.toBeNull()

Received: null
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
    - heading "Whack-a-Mole" [level=1] [ref=e13]
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
  6   | test.describe('Whack-a-Mole E2E Tests - Dynamic Window Exposure', () => {
  7   |   test.beforeEach(async ({ page }) => {
  8   |     await page.goto('/game/whack-a-mole')
  9   |     // Wait for canvas to be rendered
  10  |     await page.waitForSelector('canvas')
  11  |     await wait(100)
  12  |   })
  13  | 
  14  |   // ─── Test: Verify dynamic window exposure works for Whack-a-Mole ────────────
  15  | 
  16  |   test('window.__whack-a-moleModule is available for E2E tests', async ({ page }) => {
  17  |     const moduleAvailable = await page.evaluate(() => {
  18  |       console.log('Checking window keys:', Object.keys(window).filter(k => k.startsWith('__')))
  19  |       return window['__whack-a-moleModule'] !== undefined
  20  |     })
  21  |     expect(moduleAvailable).toBe(true)
  22  |   })
  23  | 
  24  |   test('window.__whack-a-moleReactiveState is available for E2E tests', async ({ page }) => {
  25  |     const stateAvailable = await page.evaluate(() => {
  26  |       return window['__whack-a-moleReactiveState'] !== undefined
  27  |     })
  28  |     expect(stateAvailable).toBe(true)
  29  |   })
  30  | 
  31  |   test('whack-a-mole module has required exports', async ({ page }) => {
  32  |     const exportsCheck = await page.evaluate(() => {
  33  |       const whackAMoleModule = window['__whack-a-moleModule']
  34  |       if (!whackAMoleModule) return { error: 'Module not found' }
  35  |       
  36  |       const requiredExports = ['init', 'update', 'render', 'reset', 'handleKeydown']
  37  |       const missing = requiredExports.filter(exportName => typeof whackAMoleModule[exportName] !== 'function')
  38  |       
  39  |       return {
  40  |         hasInit: typeof whackAMoleModule.init === 'function',
  41  |         hasUpdate: typeof whackAMoleModule.update === 'function',
  42  |         hasRender: typeof whackAMoleModule.render === 'function',
  43  |         hasReset: typeof whackAMoleModule.reset === 'function',
  44  |         hasHandleKeydown: typeof whackAMoleModule.handleKeydown === 'function',
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
  57  |   test('whack-a-mole reactive state has isPlaying property', async ({ page }) => {
  58  |     const stateCheck = await page.evaluate(() => {
  59  |       const whackAMoleState = window['__whack-a-moleReactiveState']
  60  |       if (!whackAMoleState) return { error: 'State not found' }
  61  |       
  62  |       return {
  63  |         hasIsPlaying: whackAMoleState.isPlaying !== undefined,
  64  |         isPlayingInitial: whackAMoleState.isPlaying === false, // Should be false initially
  65  |         hasScore: whackAMoleState.score !== undefined,
  66  |         hasCursorRow: whackAMoleState.cursor.row !== undefined,
  67  |         hasCursorCol: whackAMoleState.cursor.col !== undefined
  68  |       }
  69  |     })
  70  |     
  71  |     expect(stateCheck.hasIsPlaying).toBe(true)
  72  |     expect(stateCheck.isPlayingInitial).toBe(true) // Not playing initially
  73  |     expect(stateCheck.hasScore).toBe(true)
  74  |     expect(stateCheck.hasCursorRow).toBe(true)
  75  |     expect(stateCheck.hasCursorCol).toBe(true)
  76  |   })
  77  | 
  78  |   test('whack-a-mole keyboard controls work - ArrowRight moves cursor right', async ({ page }) => {
  79  |     // Start the game first with Space
  80  |     await page.keyboard.press('Space')
  81  |     await wait(300)
  82  |     
  83  |     // Get initial cursor position
  84  |     const initialCol = await page.evaluate(() => {
  85  |       return window['__whack-a-moleReactiveState']?.cursor?.col ?? null
  86  |     })
> 87  |     expect(initialCol).not.toBeNull()
      |                            ^ Error: expect(received).not.toBeNull()
  88  |     
  89  |     // Press ArrowRight
  90  |     await page.keyboard.press('ArrowRight')
  91  |     await wait(100)
  92  |     
  93  |     // Verify cursor moved right
  94  |     const newCol = await page.evaluate(() => {
  95  |       return window['__whack-a-moleReactiveState']?.cursor?.col ?? null
  96  |     })
  97  |     
  98  |     expect(newCol).toBeGreaterThan(initialCol)
  99  |   })
  100 | 
  101 |   test('whack-a-mole keyboard controls work - ArrowLeft moves cursor left', async ({ page }) => {
  102 |     // Start the game first with Space
  103 |     await page.keyboard.press('Space')
  104 |     await wait(300)
  105 |     
  106 |     // Get initial cursor position
  107 |     const initialCol = await page.evaluate(() => {
  108 |       return window['__whack-a-moleReactiveState']?.cursor?.col ?? null
  109 |     })
  110 |     expect(initialCol).not.toBeNull()
  111 |     
  112 |     // Press ArrowLeft (wrap around or move left)
  113 |     await page.keyboard.press('ArrowLeft')
  114 |     await wait(100)
  115 |     
  116 |     // Verify cursor moved left (or wrapped to rightmost column)
  117 |     const newCol = await page.evaluate(() => {
  118 |       return window['__whack-a-moleReactiveState']?.cursor?.col ?? null
  119 |     })
  120 |     
  121 |     // Either moved left or wrapped around (both are valid behaviors)
  122 |     expect(newCol).not.toBe(initialCol)
  123 |   })
  124 | 
  125 |   test('whack-a-mole game starts with Space', async ({ page }) => {
  126 |     // In menu state, Space should start the game
  127 |     const initialState = await page.evaluate(() => {
  128 |       const state = window['__whack-a-moleReactiveState']
  129 |       return {
  130 |         isPlaying: state.isPlaying,
  131 |         score: state.score
  132 |       }
  133 |     })
  134 |     
  135 |     expect(initialState.isPlaying).toBe(false)
  136 |     
  137 |     // Press Space to start
  138 |     await page.keyboard.press('Space')
  139 |     await wait(300)
  140 |     
  141 |     const afterSpace = await page.evaluate(() => {
  142 |       const state = window['__whack-a-moleReactiveState']
  143 |       return {
  144 |         isPlaying: state.isPlaying
  145 |       }
  146 |     })
  147 |     
  148 |     expect(afterSpace.isPlaying).toBe(true)
  149 |   })
  150 | 
  151 |   test('whack-a-mole whacking works - Space triggers whack', async ({ page }) => {
  152 |     // Start the game first with Space
  153 |     await page.keyboard.press('Space')
  154 |     await wait(300)
  155 |     
  156 |     // Get initial score
  157 |     const initialScore = await page.evaluate(() => {
  158 |       return window['__whack-a-moleReactiveState']?.score ?? 0
  159 |     })
  160 |     
  161 |     // Press Space to whack (if mole is at cursor position, score increases)
  162 |     await page.keyboard.press('Space')
  163 |     await wait(100)
  164 |     
  165 |     const newScore = await page.evaluate(() => {
  166 |       return window['__whack-a-moleReactiveState']?.score ?? 0
  167 |     })
  168 |     
  169 |     // Score should have increased (mole was likely at cursor position)
  170 |     expect(newScore).toBeGreaterThan(initialScore)
  171 |   })
  172 | })
  173 | 
```