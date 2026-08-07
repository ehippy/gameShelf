# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> score increases by 100 when 1 line cleared
- Location: tests/e2e/tetris.spec.js:153:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 100
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
  84  | 
  85  |   test('keyboard controls work - ArrowDown moves piece down', async ({ page }) => {
  86  |     await page.keyboard.press('Space')
  87  |     await wait(200)
  88  |     
  89  |     const rowBefore = await page.evaluate(() => {
  90  |       const tetrisModule = window.__tetrisModule
  91  |       return tetrisModule?.state?.currentPiece?.row ?? null
  92  |     })
  93  |     
  94  |     await page.keyboard.press('ArrowDown')
  95  |     await wait(100)
  96  |     
  97  |     const rowAfter = await page.evaluate(() => {
  98  |       const tetrisModule = window.__tetrisModule
  99  |       return tetrisModule?.state?.currentPiece?.row ?? null
  100 |     })
  101 |     
  102 |     expect(rowAfter).toBeGreaterThan(rowBefore)
  103 |   })
  104 | 
  105 |   // ─── Test 3: Lines clear when full rows form ────────────────────────────────
  106 | 
  107 |   test('lines clear when full rows form (4 lines)', async ({ page }) => {
  108 |     await page.keyboard.press('Space')
  109 |     await wait(200)
  110 |     
  111 |     // Get initial lines and score
  112 |     const linesBefore = await page.locator('.info-value').nth(2).textContent()
  113 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  114 |     
  115 |     // Force 4 full rows by manipulating the board state directly
  116 |     // This requires accessing the game module from window
  117 |     await page.evaluate(() => {
  118 |       const tetrisModule = window.__tetrisModule
  119 |       if (!tetrisModule) return
  120 |       
  121 |       // Fill rows 16, 17, 18, 19 completely
  122 |       for (let r = 16; r < 20; r++) {
  123 |         for (let c = 0; c < 10; c++) {
  124 |           tetrisModule.state.board[r][c] = '#ff0000'
  125 |         }
  126 |       }
  127 |       
  128 |       // Place I-piece at row 13 so it drops and completes the 4th row
  129 |       tetrisModule.state.currentPiece = {
  130 |         type: 'I',
  131 |         shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  132 |         color: '#00f0f0',
  133 |         row: 13,
  134 |         col: 0
  135 |       }
  136 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  137 |     })
  138 |     
  139 |     // Wait for the piece to drop and lock
  140 |     await wait(500)
  141 |     
  142 |     // Verify 4 lines were cleared (lines counter should increase by 4)
  143 |     const linesAfter = await page.locator('.info-value').nth(2).textContent()
  144 |     expect(parseInt(linesAfter)).toBe(parseInt(linesBefore) + 4)
  145 |     
  146 |     // Verify score increased by 800 (at level 1)
  147 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  148 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
  149 |   })
  150 | 
  151 |   // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────
  152 | 
  153 |   test('score increases by 100 when 1 line cleared', async ({ page }) => {
  154 |     await page.keyboard.press('Space')
  155 |     await wait(200)
  156 |     
  157 |     // Set level to 1 explicitly
  158 |     await page.evaluate(() => {
  159 |       const tetrisModule = window.__tetrisModule
  160 |       if (tetrisModule) {
  161 |         tetrisModule.state.level = 1
  162 |       }
  163 |     })
  164 |     
  165 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  166 |     
  167 |     // Fill one row completely
  168 |     await page.evaluate(() => {
  169 |       const tetrisModule = window.__tetrisModule
  170 |       if (!tetrisModule) return
  171 |       
  172 |       for (let c = 0; c < 10; c++) {
  173 |         tetrisModule.state.board[19][c] = '#ff0000'
  174 |       }
  175 |       
  176 |       tetrisModule.state.currentPiece.row = 17
  177 |       tetrisModule.state.currentPiece.col = 0
  178 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  179 |     })
  180 |     
  181 |     await wait(500)
  182 |     
  183 |     const scoreAfter = await page.locator('.info-value').first().textContent()
> 184 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 100)
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  185 |   })
  186 | 
  187 |   test('score increases by 300 when 2 lines cleared', async ({ page }) => {
  188 |     await page.keyboard.press('Space')
  189 |     await wait(200)
  190 |     
  191 |     await page.evaluate(() => {
  192 |       const tetrisModule = window.__tetrisModule
  193 |       if (tetrisModule) {
  194 |         tetrisModule.state.level = 1
  195 |       }
  196 |     })
  197 |     
  198 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  199 |     
  200 |     await page.evaluate(() => {
  201 |       const tetrisModule = window.__tetrisModule
  202 |       if (!tetrisModule) return
  203 |       
  204 |       for (let r of [18, 19]) {
  205 |         for (let c = 0; c < 10; c++) {
  206 |           tetrisModule.state.board[r][c] = '#ff0000'
  207 |         }
  208 |       }
  209 |       
  210 |       tetrisModule.state.currentPiece.row = 16
  211 |       tetrisModule.state.currentPiece.col = 0
  212 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  213 |     })
  214 |     
  215 |     await wait(500)
  216 |     
  217 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  218 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 300)
  219 |   })
  220 | 
  221 |   test('score increases by 500 when 3 lines cleared', async ({ page }) => {
  222 |     await page.keyboard.press('Space')
  223 |     await wait(200)
  224 |     
  225 |     await page.evaluate(() => {
  226 |       const tetrisModule = window.__tetrisModule
  227 |       if (tetrisModule) {
  228 |         tetrisModule.state.level = 1
  229 |       }
  230 |     })
  231 |     
  232 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  233 |     
  234 |     await page.evaluate(() => {
  235 |       const tetrisModule = window.__tetrisModule
  236 |       if (!tetrisModule) return
  237 |       
  238 |       for (let r of [17, 18, 19]) {
  239 |         for (let c = 0; c < 10; c++) {
  240 |           tetrisModule.state.board[r][c] = '#ff0000'
  241 |         }
  242 |       }
  243 |       
  244 |       tetrisModule.state.currentPiece.row = 15
  245 |       tetrisModule.state.currentPiece.col = 0
  246 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  247 |     })
  248 |     
  249 |     await wait(500)
  250 |     
  251 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  252 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 500)
  253 |   })
  254 | 
  255 |   test('score increases by 800 when 4 lines cleared', async ({ page }) => {
  256 |     await page.keyboard.press('Space')
  257 |     await wait(200)
  258 |     
  259 |     await page.evaluate(() => {
  260 |       const tetrisModule = window.__tetrisModule
  261 |       if (tetrisModule) {
  262 |         tetrisModule.state.level = 1
  263 |       }
  264 |     })
  265 |     
  266 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  267 |     
  268 |     await page.evaluate(() => {
  269 |       const tetrisModule = window.__tetrisModule
  270 |       if (!tetrisModule) return
  271 |       
  272 |       for (let c = 0; c < 10; c++) {
  273 |         tetrisModule.state.board[16][c] = '#ff0000'
  274 |         tetrisModule.state.board[17][c] = '#ff0000'
  275 |         tetrisModule.state.board[18][c] = '#ff0000'
  276 |         tetrisModule.state.board[19][c] = '#ff0000'
  277 |       }
  278 |       
  279 |       tetrisModule.state.currentPiece = {
  280 |         type: 'I',
  281 |         shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  282 |         color: '#00f0f0',
  283 |         row: 13,
  284 |         col: 0
```