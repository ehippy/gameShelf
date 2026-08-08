# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: flappy-bird.spec.js >> Flappy Bird E2E Tests - Dynamic Window Exposure >> keyboard controls work - ArrowUp triggers flap
- Location: tests/e2e/flappy-bird.spec.js:113:3

# Error details

```
Error: expect(received).toBeLessThan(expected)

Matcher error: received value must be a number or bigint

Received has value: null
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
  66  |         hasBirdY: flappyBirdState.bird.y !== undefined,
  67  |         hasBirdVelocity: flappyBirdState.bird.velocity !== undefined
  68  |       }
  69  |     })
  70  |     
  71  |     expect(stateCheck.hasIsPlaying).toBe(true)
  72  |     expect(stateCheck.isPlayingInitial).toBe(true) // Not playing initially
  73  |     expect(stateCheck.hasScore).toBe(true)
  74  |     expect(stateCheck.hasBirdY).toBe(true)
  75  |     expect(stateCheck.hasBirdVelocity).toBe(true)
  76  |   })
  77  | 
  78  |   test('keyboard controls work - Space triggers flap', async ({ page }) => {
  79  |     // Start the game first with Space (which also flaps)
  80  |     await page.keyboard.press('Space')
  81  |     await wait(200)
  82  |     
  83  |     // Verify isPlaying changed after input
  84  |     const isPlaying = await page.evaluate(() => {
  85  |       return window['__flappy-birdReactiveState']?.isPlaying ?? null
  86  |     })
  87  |     expect(isPlaying).toBe(true)
  88  |     
  89  |     // Get initial bird position
  90  |     const initialY = await page.evaluate(() => {
  91  |       return window['__flappy-birdReactiveState']?.bird?.y ?? null
  92  |     })
  93  |     const initialVelocity = await page.evaluate(() => {
  94  |       return window['__flappy-birdReactiveState']?.bird?.velocity ?? null
  95  |     })
  96  |     
  97  |     // Wait a bit for gravity to take effect
  98  |     await wait(100)
  99  |     
  100 |     // Press Space again (flap)
  101 |     await page.keyboard.press('Space')
  102 |     await wait(100)
  103 |     
  104 |     // Verify bird moved up (negative velocity means moving up in canvas coords)
  105 |     const newVelocity = await page.evaluate(() => {
  106 |       return window['__flappy-birdReactiveState']?.bird?.velocity ?? null
  107 |     })
  108 |     
  109 |     // After flap, velocity should be negative (bird moves up)
  110 |     expect(newVelocity).toBeLessThan(initialVelocity)
  111 |   })
  112 | 
  113 |   test('keyboard controls work - ArrowUp triggers flap', async ({ page }) => {
  114 |     // Start the game first with Space
  115 |     await page.keyboard.press('Space')
  116 |     await wait(200)
  117 |     
  118 |     // Get initial bird position
  119 |     const initialY = await page.evaluate(() => {
  120 |       return window['__flappy-birdReactiveState']?.bird?.y ?? null
  121 |     })
  122 |     
  123 |     // Press ArrowUp (which also flaps)
  124 |     await page.keyboard.press('ArrowUp')
  125 |     await wait(100)
  126 |     
  127 |     // Verify bird moved up
  128 |     const newY = await page.evaluate(() => {
  129 |       return window['__flappy-birdReactiveState']?.bird?.y ?? null
  130 |     })
  131 |     
> 132 |     expect(newY).toBeLessThan(initialY)
      |                  ^ Error: expect(received).toBeLessThan(expected)
  133 |   })
  134 | })
  135 | 
```