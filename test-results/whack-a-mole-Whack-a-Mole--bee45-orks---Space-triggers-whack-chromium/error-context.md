# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: whack-a-mole.spec.js >> Whack-a-Mole E2E Tests - Dynamic Window Exposure >> whack-a-mole whacking works - Space triggers whack
- Location: tests/e2e/whack-a-mole.spec.js:151:3

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
  85  |       return window['__whack-a-moleReactiveState']?.cursorCol ?? null
  86  |     })
  87  |     expect(initialCol).not.toBeNull()
  88  |     
  89  |     // Press ArrowRight
  90  |     await page.keyboard.press('ArrowRight')
  91  |     await wait(100)
  92  |     
  93  |     // Verify cursor moved right
  94  |     const newCol = await page.evaluate(() => {
  95  |       return window['__whack-a-moleReactiveState']?.cursorCol ?? null
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
  108 |       return window['__whack-a-moleReactiveState']?.cursorCol ?? null
  109 |     })
  110 |     expect(initialCol).not.toBeNull()
  111 |     
  112 |     // Press ArrowLeft (wrap around or move left)
  113 |     await page.keyboard.press('ArrowLeft')
  114 |     await wait(100)
  115 |     
  116 |     // Verify cursor moved left (or wrapped to rightmost column)
  117 |     const newCol = await page.evaluate(() => {
  118 |       return window['__whack-a-moleReactiveState']?.cursorCol ?? null
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
> 170 |     expect(newScore).toBeGreaterThan(initialScore)
      |                      ^ Error: expect(received).toBeGreaterThan(expected)
  171 |   })
  172 | })
  173 | 
```