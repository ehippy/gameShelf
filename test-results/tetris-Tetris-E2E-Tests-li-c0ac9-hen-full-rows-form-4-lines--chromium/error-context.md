# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> lines clear when full rows form (4 lines)
- Location: tests/e2e/tetris.spec.js:132:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 4
Received: 0
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
  80  |     await wait(100)
  81  |     
  82  |     const colAfter = await page.evaluate(() => {
  83  |       const tetrisModule = window.__tetrisModule
  84  |       return tetrisModule?.state?.currentPiece?.col ?? null
  85  |     })
  86  |     
  87  |     expect(colAfter).toBeLessThan(colBefore)
  88  |   })
  89  | 
  90  |   test('keyboard controls work - ArrowRight moves piece right', async ({ page }) => {
  91  |     await page.keyboard.press('Space')
  92  |     await wait(200)
  93  |     
  94  |     const colBefore = await page.evaluate(() => {
  95  |       const tetrisModule = window.__tetrisModule
  96  |       return tetrisModule?.state?.currentPiece?.col ?? null
  97  |     })
  98  |     
  99  |     await page.keyboard.press('ArrowRight')
  100 |     await wait(100)
  101 |     
  102 |     const colAfter = await page.evaluate(() => {
  103 |       const tetrisModule = window.__tetrisModule
  104 |       return tetrisModule?.state?.currentPiece?.col ?? null
  105 |     })
  106 |     
  107 |     expect(colAfter).toBeGreaterThan(colBefore)
  108 |   })
  109 | 
  110 |   test('keyboard controls work - ArrowDown moves piece down', async ({ page }) => {
  111 |     await page.keyboard.press('Space')
  112 |     await wait(200)
  113 |     
  114 |     const rowBefore = await page.evaluate(() => {
  115 |       const tetrisModule = window.__tetrisModule
  116 |       return tetrisModule?.state?.currentPiece?.row ?? null
  117 |     })
  118 |     
  119 |     await page.keyboard.press('ArrowDown')
  120 |     await wait(100)
  121 |     
  122 |     const rowAfter = await page.evaluate(() => {
  123 |       const tetrisModule = window.__tetrisModule
  124 |       return tetrisModule?.state?.currentPiece?.row ?? null
  125 |     })
  126 |     
  127 |     expect(rowAfter).toBeGreaterThan(rowBefore)
  128 |   })
  129 | 
  130 |   // ─── Test 3: Lines clear when full rows form ────────────────────────────────
  131 | 
  132 |   test('lines clear when full rows form (4 lines)', async ({ page }) => {
  133 |     await page.keyboard.press('Space')
  134 |     await wait(200)
  135 |     
  136 |     // Get initial lines and score
  137 |     const linesBefore = await page.locator('.info-value').nth(2).textContent()
  138 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  139 |     
  140 |     // Force 4 full rows by manipulating the board state directly
  141 |     // This requires accessing the game module from window
  142 |     await page.evaluate(() => {
  143 |       const tetrisModule = window.__tetrisModule
  144 |       if (!tetrisModule) return
  145 |       
  146 |       const state = tetrisModule.state
  147 |       
  148 |       // Fill rows 16, 17, 18, 19 completely
  149 |       for (let r = 16; r < 20; r++) {
  150 |         for (let c = 0; c < 10; c++) {
  151 |           state.board[r][c] = '#ff0000'
  152 |         }
  153 |       }
  154 |       
  155 |       // Place I-piece at row 13 so it drops and completes the 4th row
  156 |       state.currentPiece = {
  157 |         type: 'I',
  158 |         shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  159 |         color: '#00f0f0',
  160 |         row: 13,
  161 |         col: 0
  162 |       }
  163 |       state.lastDropTime = performance.now() - 2000
  164 |       
  165 |       // Force update to process the piece drop and line clearing
  166 |       tetrisModule.update()
  167 |       state.lastDropTime = performance.now() - 2000
  168 |       tetrisModule.update()
  169 |       
  170 |       // Force Vue to re-render by directly modifying a reactive property
  171 |       // This should trigger Vue's reactivity system
  172 |       state.lines = state.lines
  173 |     })
  174 |     
  175 |     // Wait for the game loop to update the UI
  176 |     await wait(1000)
  177 |     
  178 |     // Verify 4 lines were cleared (lines counter should increase by 4)
  179 |     const linesAfter = await page.locator('.info-value').nth(2).textContent()
> 180 |     expect(parseInt(linesAfter)).toBe(parseInt(linesBefore) + 4)
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  181 |     
  182 |     // Verify score increased by 800 (at level 1)
  183 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  184 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
  185 |   })
  186 | 
  187 |   // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────
  188 | 
  189 |   test('score increases by 100 when 1 line cleared', async ({ page }) => {
  190 |     await page.keyboard.press('Space')
  191 |     await wait(200)
  192 |     
  193 |     // Set level to 1 explicitly
  194 |     await page.evaluate(() => {
  195 |       const tetrisModule = window.__tetrisModule
  196 |       if (tetrisModule) {
  197 |         tetrisModule.state.level = 1
  198 |       }
  199 |     })
  200 |     
  201 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  202 |     
  203 |     // Fill one row completely
  204 |     await page.evaluate(() => {
  205 |       const tetrisModule = window.__tetrisModule
  206 |       if (!tetrisModule) return
  207 |       
  208 |       for (let c = 0; c < 10; c++) {
  209 |         tetrisModule.state.board[19][c] = '#ff0000'
  210 |       }
  211 |       
  212 |       tetrisModule.state.currentPiece.row = 17
  213 |       tetrisModule.state.currentPiece.col = 0
  214 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  215 |     })
  216 |     
  217 |     await wait(500)
  218 |     
  219 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  220 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 100)
  221 |   })
  222 | 
  223 |   test('score increases by 300 when 2 lines cleared', async ({ page }) => {
  224 |     await page.keyboard.press('Space')
  225 |     await wait(200)
  226 |     
  227 |     await page.evaluate(() => {
  228 |       const tetrisModule = window.__tetrisModule
  229 |       if (tetrisModule) {
  230 |         tetrisModule.state.level = 1
  231 |       }
  232 |     })
  233 |     
  234 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  235 |     
  236 |     await page.evaluate(() => {
  237 |       const tetrisModule = window.__tetrisModule
  238 |       if (!tetrisModule) return
  239 |       
  240 |       for (let r of [18, 19]) {
  241 |         for (let c = 0; c < 10; c++) {
  242 |           tetrisModule.state.board[r][c] = '#ff0000'
  243 |         }
  244 |       }
  245 |       
  246 |       tetrisModule.state.currentPiece.row = 16
  247 |       tetrisModule.state.currentPiece.col = 0
  248 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  249 |     })
  250 |     
  251 |     await wait(500)
  252 |     
  253 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  254 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 300)
  255 |   })
  256 | 
  257 |   test('score increases by 500 when 3 lines cleared', async ({ page }) => {
  258 |     await page.keyboard.press('Space')
  259 |     await wait(200)
  260 |     
  261 |     await page.evaluate(() => {
  262 |       const tetrisModule = window.__tetrisModule
  263 |       if (tetrisModule) {
  264 |         tetrisModule.state.level = 1
  265 |       }
  266 |     })
  267 |     
  268 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  269 |     
  270 |     await page.evaluate(() => {
  271 |       const tetrisModule = window.__tetrisModule
  272 |       if (!tetrisModule) return
  273 |       
  274 |       for (let r of [17, 18, 19]) {
  275 |         for (let c = 0; c < 10; c++) {
  276 |           tetrisModule.state.board[r][c] = '#ff0000'
  277 |         }
  278 |       }
  279 |       
  280 |       tetrisModule.state.currentPiece.row = 15
```