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
  73  |     const colBefore = await page.evaluate(() => {
  74  |       const tetrisModule = window.__tetrisModule
  75  |       return tetrisModule?.state?.currentPiece?.col ?? null
  76  |     })
  77  |     
  78  |     // Press ArrowLeft
  79  |     await page.keyboard.press('ArrowLeft')
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
  164 |       tetrisModule.update()
  165 |       tetrisModule.update()
  166 |     })
  167 |     
  168 |     // Wait for the UI to update
  169 |     await wait(300)
  170 |     
  171 |     // Verify 4 lines were cleared (lines counter should increase by 4)
  172 |     const linesAfter = await page.locator('.info-value').nth(2).textContent()
> 173 |     expect(parseInt(linesAfter)).toBe(parseInt(linesBefore) + 4)
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  174 |     
  175 |     // Verify score increased by 800 (at level 1)
  176 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  177 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
  178 |   })
  179 | 
  180 |   // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────
  181 | 
  182 |   test('score increases by 100 when 1 line cleared', async ({ page }) => {
  183 |     await page.keyboard.press('Space')
  184 |     await wait(200)
  185 |     
  186 |     // Set level to 1 explicitly
  187 |     await page.evaluate(() => {
  188 |       const tetrisModule = window.__tetrisModule
  189 |       if (tetrisModule) {
  190 |         tetrisModule.state.level = 1
  191 |       }
  192 |     })
  193 |     
  194 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  195 |     
  196 |     // Fill one row completely
  197 |     await page.evaluate(() => {
  198 |       const tetrisModule = window.__tetrisModule
  199 |       if (!tetrisModule) return
  200 |       
  201 |       for (let c = 0; c < 10; c++) {
  202 |         tetrisModule.state.board[19][c] = '#ff0000'
  203 |       }
  204 |       
  205 |       tetrisModule.state.currentPiece.row = 17
  206 |       tetrisModule.state.currentPiece.col = 0
  207 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  208 |     })
  209 |     
  210 |     await wait(500)
  211 |     
  212 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  213 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 100)
  214 |   })
  215 | 
  216 |   test('score increases by 300 when 2 lines cleared', async ({ page }) => {
  217 |     await page.keyboard.press('Space')
  218 |     await wait(200)
  219 |     
  220 |     await page.evaluate(() => {
  221 |       const tetrisModule = window.__tetrisModule
  222 |       if (tetrisModule) {
  223 |         tetrisModule.state.level = 1
  224 |       }
  225 |     })
  226 |     
  227 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  228 |     
  229 |     await page.evaluate(() => {
  230 |       const tetrisModule = window.__tetrisModule
  231 |       if (!tetrisModule) return
  232 |       
  233 |       for (let r of [18, 19]) {
  234 |         for (let c = 0; c < 10; c++) {
  235 |           tetrisModule.state.board[r][c] = '#ff0000'
  236 |         }
  237 |       }
  238 |       
  239 |       tetrisModule.state.currentPiece.row = 16
  240 |       tetrisModule.state.currentPiece.col = 0
  241 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  242 |     })
  243 |     
  244 |     await wait(500)
  245 |     
  246 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  247 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 300)
  248 |   })
  249 | 
  250 |   test('score increases by 500 when 3 lines cleared', async ({ page }) => {
  251 |     await page.keyboard.press('Space')
  252 |     await wait(200)
  253 |     
  254 |     await page.evaluate(() => {
  255 |       const tetrisModule = window.__tetrisModule
  256 |       if (tetrisModule) {
  257 |         tetrisModule.state.level = 1
  258 |       }
  259 |     })
  260 |     
  261 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  262 |     
  263 |     await page.evaluate(() => {
  264 |       const tetrisModule = window.__tetrisModule
  265 |       if (!tetrisModule) return
  266 |       
  267 |       for (let r of [17, 18, 19]) {
  268 |         for (let c = 0; c < 10; c++) {
  269 |           tetrisModule.state.board[r][c] = '#ff0000'
  270 |         }
  271 |       }
  272 |       
  273 |       tetrisModule.state.currentPiece.row = 15
```