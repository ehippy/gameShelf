# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: flappy-bird.spec.js >> Flappy Bird E2E Tests - Dynamic Window Exposure >> flappy-bird keyboard controls work - Space key is valid
- Location: tests/e2e/flappy-bird.spec.js:78:3

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
    - heading "Flappy Bird" [level=1] [ref=e13]
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
  7   |   test.beforeEach(async ({ page }) => {
  8   |     await page.goto('/game/flappy-bird')
  9   |     // Wait for canvas to be rendered
  10  |     await page.waitForSelector('canvas')
  11  |     await wait(100)
  12  |   })
  13  | 
  14  |   // ─── Test: Verify dynamic window exposure works for Flappy Bird ─────────────
  15  | 
  16  |   test('window.__flappy-birdModule is available for E2E tests', async ({ page }) => {
  17  |     const moduleAvailable = await page.evaluate(() => {
  18  |       console.log('Checking window keys:', Object.keys(window).filter(k => k.startsWith('__')))
  19  |       return window['__flappy-birdModule'] !== undefined
  20  |     })
  21  |     expect(moduleAvailable).toBe(true)
  22  |   })
  23  | 
  24  |   test('window.__flappy-birdReactiveState is available for E2E tests', async ({ page }) => {
  25  |     const stateAvailable = await page.evaluate(() => {
  26  |       return window['__flappy-birdReactiveState'] !== undefined
  27  |     })
  28  |     expect(stateAvailable).toBe(true)
  29  |   })
  30  | 
  31  |   test('flappy-bird module has required exports', async ({ page }) => {
  32  |     const exportsCheck = await page.evaluate(() => {
  33  |       const flappyBirdModule = window['__flappy-birdModule']
  34  |       if (!flappyBirdModule) return { error: 'Module not found' }
  35  |       
  36  |       const requiredExports = ['init', 'update', 'render', 'reset', 'handleKeydown']
  37  |       const missing = requiredExports.filter(exportName => typeof flappyBirdModule[exportName] !== 'function')
  38  |       
  39  |       return {
  40  |         hasInit: typeof flappyBirdModule.init === 'function',
  41  |         hasUpdate: typeof flappyBirdModule.update === 'function',
  42  |         hasRender: typeof flappyBirdModule.render === 'function',
  43  |         hasReset: typeof flappyBirdModule.reset === 'function',
  44  |         hasHandleKeydown: typeof flappyBirdModule.handleKeydown === 'function',
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
  57  |   test('flappy-bird reactive state has isPlaying property', async ({ page }) => {
  58  |     const stateCheck = await page.evaluate(() => {
  59  |       const flappyBirdState = window['__flappy-birdReactiveState']
  60  |       if (!flappyBirdState) return { error: 'State not found' }
  61  |       
  62  |       return {
  63  |         hasIsPlaying: flappyBirdState.isPlaying !== undefined,
  64  |         isPlayingInitial: flappyBirdState.isPlaying === false, // Should be false initially
  65  |         hasScore: flappyBirdState.score !== undefined,
  66  |         hasBirdRow: flappyBirdState.bird.row !== undefined,
  67  |         hasBirdVelocity: flappyBirdState.bird.velocity !== undefined
  68  |       }
  69  |     })
  70  |     
  71  |     expect(stateCheck.hasIsPlaying).toBe(true)
  72  |     expect(stateCheck.isPlayingInitial).toBe(true) // Not playing initially
  73  |     expect(stateCheck.hasScore).toBe(true)
  74  |     expect(stateCheck.hasBirdRow).toBe(true)
  75  |     expect(stateCheck.hasBirdVelocity).toBe(true)
  76  |   })
  77  | 
  78  |   test('flappy-bird keyboard controls work - Space key is valid', async ({ page }) => {
  79  |     // The flappy-bird game uses Space as a valid key for starting/flapping
  80  |     // Verify the game processes Space input by checking state changes
  81  |     
  82  |     // Get initial state
  83  |     const initialState = await page.evaluate(() => {
  84  |       const state = window['__flappy-birdReactiveState']
  85  |       return {
  86  |         isPlaying: state.isPlaying,
  87  |         birdRow: state.bird.row,
  88  |         birdVelocity: state.bird.velocity
  89  |       }
  90  |     })
  91  |     
  92  |     expect(initialState.isPlaying).toBe(false)
  93  |     
  94  |     // Press Space (which should start the game and flap)
  95  |     await page.keyboard.press('Space')
  96  |     await wait(500)  // Give more time for game to process
  97  |     
  98  |     // After Space, isPlaying should be true
  99  |     const afterSpace = await page.evaluate(() => {
  100 |       const state = window['__flappy-birdReactiveState']
  101 |       return {
  102 |         isPlaying: state.isPlaying,
  103 |         birdVelocity: state.bird.velocity
  104 |       }
  105 |     })
  106 |     
> 107 |     expect(afterSpace.isPlaying).toBe(true)
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  108 |   })
  109 | 
  110 |   test('flappy-bird keyboard controls work - ArrowUp key is valid', async ({ page }) => {
  111 |     // Start the game first with Space
  112 |     await page.keyboard.press('Space')
  113 |     await wait(500)  // Give more time for game to process
  114 |     
  115 |     // Get initial bird position after game started
  116 |     const initialRow = await page.evaluate(() => {
  117 |       return window['__flappy-birdReactiveState']?.bird?.row ?? null
  118 |     })
  119 |     expect(initialRow).not.toBeNull()
  120 |     
  121 |     // Press ArrowUp (which should flap)
  122 |     await page.keyboard.press('ArrowUp')
  123 |     await wait(100)
  124 |     
  125 |     // After ArrowUp, velocity should have changed (flap action)
  126 |     const newVelocity = await page.evaluate(() => {
  127 |       return window['__flappy-birdReactiveState']?.bird?.velocity ?? null
  128 |     })
  129 |     
  130 |     expect(newVelocity).not.toBeNull()
  131 |   })
  132 | })
  133 | 
```