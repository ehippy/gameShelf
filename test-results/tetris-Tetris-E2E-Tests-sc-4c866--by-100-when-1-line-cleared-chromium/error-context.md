# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> score increases by 100 when 1 line cleared
- Location: tests/e2e/tetris.spec.js:178:3

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
  162 |     })
  163 |     
  164 |     // Wait for the piece to drop and lock
  165 |     await wait(500)
  166 |     
  167 |     // Verify 4 lines were cleared (lines counter should increase by 4)
  168 |     const linesAfter = await page.locator('.info-value').nth(2).textContent()
  169 |     expect(parseInt(linesAfter)).toBe(parseInt(linesBefore) + 4)
  170 |     
  171 |     // Verify score increased by 800 (at level 1)
  172 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  173 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
  174 |   })
  175 | 
  176 |   // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────
  177 | 
  178 |   test('score increases by 100 when 1 line cleared', async ({ page }) => {
  179 |     await page.keyboard.press('Space')
  180 |     await wait(200)
  181 |     
  182 |     // Set level to 1 explicitly
  183 |     await page.evaluate(() => {
  184 |       const tetrisModule = window.__tetrisModule
  185 |       if (tetrisModule) {
  186 |         tetrisModule.state.level = 1
  187 |       }
  188 |     })
  189 |     
  190 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  191 |     
  192 |     // Fill one row completely
  193 |     await page.evaluate(() => {
  194 |       const tetrisModule = window.__tetrisModule
  195 |       if (!tetrisModule) return
  196 |       
  197 |       for (let c = 0; c < 10; c++) {
  198 |         tetrisModule.state.board[19][c] = '#ff0000'
  199 |       }
  200 |       
  201 |       tetrisModule.state.currentPiece.row = 17
  202 |       tetrisModule.state.currentPiece.col = 0
  203 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  204 |     })
  205 |     
  206 |     await wait(500)
  207 |     
  208 |     const scoreAfter = await page.locator('.info-value').first().textContent()
> 209 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 100)
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  210 |   })
  211 | 
  212 |   test('score increases by 300 when 2 lines cleared', async ({ page }) => {
  213 |     await page.keyboard.press('Space')
  214 |     await wait(200)
  215 |     
  216 |     await page.evaluate(() => {
  217 |       const tetrisModule = window.__tetrisModule
  218 |       if (tetrisModule) {
  219 |         tetrisModule.state.level = 1
  220 |       }
  221 |     })
  222 |     
  223 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  224 |     
  225 |     await page.evaluate(() => {
  226 |       const tetrisModule = window.__tetrisModule
  227 |       if (!tetrisModule) return
  228 |       
  229 |       for (let r of [18, 19]) {
  230 |         for (let c = 0; c < 10; c++) {
  231 |           tetrisModule.state.board[r][c] = '#ff0000'
  232 |         }
  233 |       }
  234 |       
  235 |       tetrisModule.state.currentPiece.row = 16
  236 |       tetrisModule.state.currentPiece.col = 0
  237 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  238 |     })
  239 |     
  240 |     await wait(500)
  241 |     
  242 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  243 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 300)
  244 |   })
  245 | 
  246 |   test('score increases by 500 when 3 lines cleared', async ({ page }) => {
  247 |     await page.keyboard.press('Space')
  248 |     await wait(200)
  249 |     
  250 |     await page.evaluate(() => {
  251 |       const tetrisModule = window.__tetrisModule
  252 |       if (tetrisModule) {
  253 |         tetrisModule.state.level = 1
  254 |       }
  255 |     })
  256 |     
  257 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  258 |     
  259 |     await page.evaluate(() => {
  260 |       const tetrisModule = window.__tetrisModule
  261 |       if (!tetrisModule) return
  262 |       
  263 |       for (let r of [17, 18, 19]) {
  264 |         for (let c = 0; c < 10; c++) {
  265 |           tetrisModule.state.board[r][c] = '#ff0000'
  266 |         }
  267 |       }
  268 |       
  269 |       tetrisModule.state.currentPiece.row = 15
  270 |       tetrisModule.state.currentPiece.col = 0
  271 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  272 |     })
  273 |     
  274 |     await wait(500)
  275 |     
  276 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  277 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 500)
  278 |   })
  279 | 
  280 |   test('score increases by 800 when 4 lines cleared', async ({ page }) => {
  281 |     await page.keyboard.press('Space')
  282 |     await wait(200)
  283 |     
  284 |     await page.evaluate(() => {
  285 |       const tetrisModule = window.__tetrisModule
  286 |       if (tetrisModule) {
  287 |         tetrisModule.state.level = 1
  288 |       }
  289 |     })
  290 |     
  291 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  292 |     
  293 |     await page.evaluate(() => {
  294 |       const tetrisModule = window.__tetrisModule
  295 |       if (!tetrisModule) return
  296 |       
  297 |       for (let c = 0; c < 10; c++) {
  298 |         tetrisModule.state.board[16][c] = '#ff0000'
  299 |         tetrisModule.state.board[17][c] = '#ff0000'
  300 |         tetrisModule.state.board[18][c] = '#ff0000'
  301 |         tetrisModule.state.board[19][c] = '#ff0000'
  302 |       }
  303 |       
  304 |       tetrisModule.state.currentPiece = {
  305 |         type: 'I',
  306 |         shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  307 |         color: '#00f0f0',
  308 |         row: 13,
  309 |         col: 0
```