# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tetris.spec.js >> Tetris E2E Tests >> score increases by 300 when 2 lines cleared
- Location: tests/e2e/tetris.spec.js:209:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 300
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
  140 |       const tetrisModule = window.__tetrisModule
  141 |       if (!tetrisModule) return
  142 |       
  143 |       // Fill rows 16, 17, 18, 19 completely
  144 |       for (let r = 16; r < 20; r++) {
  145 |         for (let c = 0; c < 10; c++) {
  146 |           tetrisModule.state.board[r][c] = '#ff0000'
  147 |         }
  148 |       }
  149 |       
  150 |       // Place I-piece at row 13 so it drops and completes the 4th row
  151 |       tetrisModule.state.currentPiece = {
  152 |         type: 'I',
  153 |         shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  154 |         color: '#00f0f0',
  155 |         row: 13,
  156 |         col: 0
  157 |       }
  158 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  159 |     })
  160 |     
  161 |     // Wait for the piece to drop and lock
  162 |     await wait(500)
  163 |     
  164 |     // Verify 4 lines were cleared (lines counter should increase by 4)
  165 |     const linesAfter = await page.locator('.info-value').nth(2).textContent()
  166 |     expect(parseInt(linesAfter)).toBe(parseInt(linesBefore) + 4)
  167 |     
  168 |     // Verify score increased by 800 (at level 1)
  169 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  170 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
  171 |   })
  172 | 
  173 |   // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────
  174 | 
  175 |   test('score increases by 100 when 1 line cleared', async ({ page }) => {
  176 |     await page.keyboard.press('Space')
  177 |     await wait(200)
  178 |     
  179 |     // Set level to 1 explicitly
  180 |     await page.evaluate(() => {
  181 |       const tetrisModule = window.__tetrisModule
  182 |       if (tetrisModule) {
  183 |         tetrisModule.state.level = 1
  184 |       }
  185 |     })
  186 |     
  187 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  188 |     
  189 |     // Fill one row completely
  190 |     await page.evaluate(() => {
  191 |       const tetrisModule = window.__tetrisModule
  192 |       if (!tetrisModule) return
  193 |       
  194 |       for (let c = 0; c < 10; c++) {
  195 |         tetrisModule.state.board[19][c] = '#ff0000'
  196 |       }
  197 |       
  198 |       tetrisModule.state.currentPiece.row = 17
  199 |       tetrisModule.state.currentPiece.col = 0
  200 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  201 |     })
  202 |     
  203 |     await wait(500)
  204 |     
  205 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  206 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 100)
  207 |   })
  208 | 
  209 |   test('score increases by 300 when 2 lines cleared', async ({ page }) => {
  210 |     await page.keyboard.press('Space')
  211 |     await wait(200)
  212 |     
  213 |     await page.evaluate(() => {
  214 |       const tetrisModule = window.__tetrisModule
  215 |       if (tetrisModule) {
  216 |         tetrisModule.state.level = 1
  217 |       }
  218 |     })
  219 |     
  220 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  221 |     
  222 |     await page.evaluate(() => {
  223 |       const tetrisModule = window.__tetrisModule
  224 |       if (!tetrisModule) return
  225 |       
  226 |       for (let r of [18, 19]) {
  227 |         for (let c = 0; c < 10; c++) {
  228 |           tetrisModule.state.board[r][c] = '#ff0000'
  229 |         }
  230 |       }
  231 |       
  232 |       tetrisModule.state.currentPiece.row = 16
  233 |       tetrisModule.state.currentPiece.col = 0
  234 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  235 |     })
  236 |     
  237 |     await wait(500)
  238 |     
  239 |     const scoreAfter = await page.locator('.info-value').first().textContent()
> 240 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 300)
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  241 |   })
  242 | 
  243 |   test('score increases by 500 when 3 lines cleared', async ({ page }) => {
  244 |     await page.keyboard.press('Space')
  245 |     await wait(200)
  246 |     
  247 |     await page.evaluate(() => {
  248 |       const tetrisModule = window.__tetrisModule
  249 |       if (tetrisModule) {
  250 |         tetrisModule.state.level = 1
  251 |       }
  252 |     })
  253 |     
  254 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  255 |     
  256 |     await page.evaluate(() => {
  257 |       const tetrisModule = window.__tetrisModule
  258 |       if (!tetrisModule) return
  259 |       
  260 |       for (let r of [17, 18, 19]) {
  261 |         for (let c = 0; c < 10; c++) {
  262 |           tetrisModule.state.board[r][c] = '#ff0000'
  263 |         }
  264 |       }
  265 |       
  266 |       tetrisModule.state.currentPiece.row = 15
  267 |       tetrisModule.state.currentPiece.col = 0
  268 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  269 |     })
  270 |     
  271 |     await wait(500)
  272 |     
  273 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  274 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 500)
  275 |   })
  276 | 
  277 |   test('score increases by 800 when 4 lines cleared', async ({ page }) => {
  278 |     await page.keyboard.press('Space')
  279 |     await wait(200)
  280 |     
  281 |     await page.evaluate(() => {
  282 |       const tetrisModule = window.__tetrisModule
  283 |       if (tetrisModule) {
  284 |         tetrisModule.state.level = 1
  285 |       }
  286 |     })
  287 |     
  288 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  289 |     
  290 |     await page.evaluate(() => {
  291 |       const tetrisModule = window.__tetrisModule
  292 |       if (!tetrisModule) return
  293 |       
  294 |       for (let c = 0; c < 10; c++) {
  295 |         tetrisModule.state.board[16][c] = '#ff0000'
  296 |         tetrisModule.state.board[17][c] = '#ff0000'
  297 |         tetrisModule.state.board[18][c] = '#ff0000'
  298 |         tetrisModule.state.board[19][c] = '#ff0000'
  299 |       }
  300 |       
  301 |       tetrisModule.state.currentPiece = {
  302 |         type: 'I',
  303 |         shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  304 |         color: '#00f0f0',
  305 |         row: 13,
  306 |         col: 0
  307 |       }
  308 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  309 |     })
  310 |     
  311 |     await wait(500)
  312 |     
  313 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  314 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
  315 |   })
  316 | 
  317 |   // ─── Test 5: Game over triggers and allows restart ──────────────────────────
  318 | 
  319 |   test('game over triggers when board is full', async ({ page }) => {
  320 |     await page.keyboard.press('Space')
  321 |     await wait(200)
  322 |     
  323 |     // Force game over by filling the board
  324 |     await page.evaluate(() => {
  325 |       const tetrisModule = window.__tetrisModule
  326 |       if (!tetrisModule) return
  327 |       
  328 |       // Fill most of the board with blocks
  329 |       for (let r = 10; r < 20; r++) {
  330 |         for (let c = 0; c < 10; c++) {
  331 |           tetrisModule.state.board[r][c] = '#ff0000'
  332 |         }
  333 |       }
  334 |       
  335 |       // Place piece in a position where it will cause game over
  336 |       tetrisModule.state.currentPiece = {
  337 |         type: 'O',
  338 |         shape: [[1, 1], [1, 1]],
  339 |         color: '#f0f000',
  340 |         row: 0,
```