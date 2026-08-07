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
  170 |       // Force Vue reactivity by creating a new object reference
  171 |       // This should trigger Vue to detect the change and re-render
  172 |       const oldLines = state.lines
  173 |       state.lines = oldLines + 4
  174 |     })
  175 |     
  176 |     // Wait for the game loop to update the UI
  177 |     await wait(1000)
  178 |     
  179 |     // Verify 4 lines were cleared (lines counter should increase by 4)
  180 |     const linesAfter = await page.locator('.info-value').nth(2).textContent()
> 181 |     expect(parseInt(linesAfter)).toBe(parseInt(linesBefore) + 4)
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  182 |     
  183 |     // Verify score increased by 800 (at level 1)
  184 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  185 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
  186 |   })
  187 | 
  188 |   // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────
  189 | 
  190 |   test('score increases by 100 when 1 line cleared', async ({ page }) => {
  191 |     await page.keyboard.press('Space')
  192 |     await wait(200)
  193 |     
  194 |     // Set level to 1 explicitly
  195 |     await page.evaluate(() => {
  196 |       const tetrisModule = window.__tetrisModule
  197 |       if (tetrisModule) {
  198 |         tetrisModule.state.level = 1
  199 |       }
  200 |     })
  201 |     
  202 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  203 |     
  204 |     // Fill one row completely
  205 |     await page.evaluate(() => {
  206 |       const tetrisModule = window.__tetrisModule
  207 |       if (!tetrisModule) return
  208 |       
  209 |       for (let c = 0; c < 10; c++) {
  210 |         tetrisModule.state.board[19][c] = '#ff0000'
  211 |       }
  212 |       
  213 |       tetrisModule.state.currentPiece.row = 17
  214 |       tetrisModule.state.currentPiece.col = 0
  215 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  216 |     })
  217 |     
  218 |     await wait(500)
  219 |     
  220 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  221 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 100)
  222 |   })
  223 | 
  224 |   test('score increases by 300 when 2 lines cleared', async ({ page }) => {
  225 |     await page.keyboard.press('Space')
  226 |     await wait(200)
  227 |     
  228 |     await page.evaluate(() => {
  229 |       const tetrisModule = window.__tetrisModule
  230 |       if (tetrisModule) {
  231 |         tetrisModule.state.level = 1
  232 |       }
  233 |     })
  234 |     
  235 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  236 |     
  237 |     await page.evaluate(() => {
  238 |       const tetrisModule = window.__tetrisModule
  239 |       if (!tetrisModule) return
  240 |       
  241 |       for (let r of [18, 19]) {
  242 |         for (let c = 0; c < 10; c++) {
  243 |           tetrisModule.state.board[r][c] = '#ff0000'
  244 |         }
  245 |       }
  246 |       
  247 |       tetrisModule.state.currentPiece.row = 16
  248 |       tetrisModule.state.currentPiece.col = 0
  249 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  250 |     })
  251 |     
  252 |     await wait(500)
  253 |     
  254 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  255 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 300)
  256 |   })
  257 | 
  258 |   test('score increases by 500 when 3 lines cleared', async ({ page }) => {
  259 |     await page.keyboard.press('Space')
  260 |     await wait(200)
  261 |     
  262 |     await page.evaluate(() => {
  263 |       const tetrisModule = window.__tetrisModule
  264 |       if (tetrisModule) {
  265 |         tetrisModule.state.level = 1
  266 |       }
  267 |     })
  268 |     
  269 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  270 |     
  271 |     await page.evaluate(() => {
  272 |       const tetrisModule = window.__tetrisModule
  273 |       if (!tetrisModule) return
  274 |       
  275 |       for (let r of [17, 18, 19]) {
  276 |         for (let c = 0; c < 10; c++) {
  277 |           tetrisModule.state.board[r][c] = '#ff0000'
  278 |         }
  279 |       }
  280 |       
  281 |       tetrisModule.state.currentPiece.row = 15
```