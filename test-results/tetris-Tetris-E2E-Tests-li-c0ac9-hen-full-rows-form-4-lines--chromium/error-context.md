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
  142 |     const result = await page.evaluate(() => {
  143 |       const tetrisModule = window.__tetrisModule
  144 |       if (!tetrisModule) return { error: 'Module not found' }
  145 |       
  146 |       // Fill rows 16, 17, 18, 19 completely
  147 |       for (let r = 16; r < 20; r++) {
  148 |         for (let c = 0; c < 10; c++) {
  149 |           tetrisModule.state.board[r][c] = '#ff0000'
  150 |         }
  151 |       }
  152 |       
  153 |       // Place I-piece at row 13 so it drops and completes the 4th row
  154 |       tetrisModule.state.currentPiece = {
  155 |         type: 'I',
  156 |         shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  157 |         color: '#00f0f0',
  158 |         row: 13,
  159 |         col: 0
  160 |       }
  161 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  162 |       
  163 |       // Force update to process the piece drop and line clearing
  164 |       // The piece should drop from row 13 to 15 (hitting collision at shape row 1 → board[16])
  165 |       tetrisModule.update()
  166 |       // After first update: piece at row 14, lastDropTime reset
  167 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  168 |       tetrisModule.update()
  169 |       // After second update: piece at row 15, then locks and clears 4 lines
  170 |       
  171 |       return {
  172 |         lines: tetrisModule.state.lines,
  173 |         score: tetrisModule.state.score,
  174 |         currentPieceRow: tetrisModule.state.currentPiece?.row,
  175 |         isGameOver: tetrisModule.state.isGameOver
  176 |       }
  177 |     })
  178 |     
  179 |     // Debug output
  180 |     console.log('Result:', result)
  181 |     
  182 |     // Wait for the UI to update
  183 |     await wait(300)
  184 |     
  185 |     // Verify 4 lines were cleared (lines counter should increase by 4)
  186 |     const linesAfter = await page.locator('.info-value').nth(2).textContent()
> 187 |     expect(parseInt(linesAfter)).toBe(parseInt(linesBefore) + 4)
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  188 |     
  189 |     // Verify score increased by 800 (at level 1)
  190 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  191 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
  192 |   })
  193 | 
  194 |   // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────
  195 | 
  196 |   test('score increases by 100 when 1 line cleared', async ({ page }) => {
  197 |     await page.keyboard.press('Space')
  198 |     await wait(200)
  199 |     
  200 |     // Set level to 1 explicitly
  201 |     await page.evaluate(() => {
  202 |       const tetrisModule = window.__tetrisModule
  203 |       if (tetrisModule) {
  204 |         tetrisModule.state.level = 1
  205 |       }
  206 |     })
  207 |     
  208 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  209 |     
  210 |     // Fill one row completely
  211 |     await page.evaluate(() => {
  212 |       const tetrisModule = window.__tetrisModule
  213 |       if (!tetrisModule) return
  214 |       
  215 |       for (let c = 0; c < 10; c++) {
  216 |         tetrisModule.state.board[19][c] = '#ff0000'
  217 |       }
  218 |       
  219 |       tetrisModule.state.currentPiece.row = 17
  220 |       tetrisModule.state.currentPiece.col = 0
  221 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  222 |     })
  223 |     
  224 |     await wait(500)
  225 |     
  226 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  227 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 100)
  228 |   })
  229 | 
  230 |   test('score increases by 300 when 2 lines cleared', async ({ page }) => {
  231 |     await page.keyboard.press('Space')
  232 |     await wait(200)
  233 |     
  234 |     await page.evaluate(() => {
  235 |       const tetrisModule = window.__tetrisModule
  236 |       if (tetrisModule) {
  237 |         tetrisModule.state.level = 1
  238 |       }
  239 |     })
  240 |     
  241 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  242 |     
  243 |     await page.evaluate(() => {
  244 |       const tetrisModule = window.__tetrisModule
  245 |       if (!tetrisModule) return
  246 |       
  247 |       for (let r of [18, 19]) {
  248 |         for (let c = 0; c < 10; c++) {
  249 |           tetrisModule.state.board[r][c] = '#ff0000'
  250 |         }
  251 |       }
  252 |       
  253 |       tetrisModule.state.currentPiece.row = 16
  254 |       tetrisModule.state.currentPiece.col = 0
  255 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  256 |     })
  257 |     
  258 |     await wait(500)
  259 |     
  260 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  261 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 300)
  262 |   })
  263 | 
  264 |   test('score increases by 500 when 3 lines cleared', async ({ page }) => {
  265 |     await page.keyboard.press('Space')
  266 |     await wait(200)
  267 |     
  268 |     await page.evaluate(() => {
  269 |       const tetrisModule = window.__tetrisModule
  270 |       if (tetrisModule) {
  271 |         tetrisModule.state.level = 1
  272 |       }
  273 |     })
  274 |     
  275 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  276 |     
  277 |     await page.evaluate(() => {
  278 |       const tetrisModule = window.__tetrisModule
  279 |       if (!tetrisModule) return
  280 |       
  281 |       for (let r of [17, 18, 19]) {
  282 |         for (let c = 0; c < 10; c++) {
  283 |           tetrisModule.state.board[r][c] = '#ff0000'
  284 |         }
  285 |       }
  286 |       
  287 |       tetrisModule.state.currentPiece.row = 15
```