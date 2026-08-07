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
- generic [ref=f1e2]:
  - banner [ref=f1e3]:
    - heading "gameShelf" [level=1] [ref=f1e4]
    - generic [ref=f1e5]:
      - textbox "Search games..." [ref=f1e6]
      - combobox [ref=f1e7] [cursor=pointer]:
        - option "All Categories" [selected]
        - option "Arcade"
        - option "Puzzle"
        - option "Action"
    - navigation [ref=f1e8]:
      - link "Home" [ref=f1e9] [cursor=pointer]:
        - /url: /
      - link "High Scores" [ref=f1e10] [cursor=pointer]:
        - /url: /highscores
      - link "About" [ref=f1e11] [cursor=pointer]:
        - /url: /about
  - generic [ref=f1e12]:
    - heading "Tetris" [level=1] [ref=f1e13]
    - generic [ref=f1e15]:
      - generic [ref=f1e16]:
        - generic [ref=f1e17]: Score
        - generic [ref=f1e18]: "0"
      - generic [ref=f1e19]:
        - generic [ref=f1e20]: Level
        - generic [ref=f1e21]: "1"
      - generic [ref=f1e22]:
        - generic [ref=f1e23]: Lines
        - generic [ref=f1e24]: "0"
  - contentinfo [ref=f1e27]:
    - paragraph [ref=f1e28]: © 2025 gameShelf — All games built in browser — no downloads required
    - link "About" [ref=f1e29] [cursor=pointer]:
      - /url: /about
```

# Test source

```ts
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
  133 |     await page.goto('/game/tetris')
  134 |     
  135 |     // Wait for the game component to be mounted
  136 |     await page.waitForSelector('.info-value')
  137 |     await wait(500)
  138 |     
  139 |     // Verify initial state before starting
  140 |     const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
  141 |     expect(isPlaying).toBe(false)
  142 |     
  143 |     // Start the game with Space
  144 |     await page.keyboard.press('Space')
  145 |     await wait(200)
  146 |     
  147 |     // Get initial lines and score
  148 |     const linesBefore = await page.locator('.info-value').nth(2).textContent()
  149 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  150 |     console.log('Lines before:', linesBefore, 'Score before:', scoreBefore)
  151 |     
  152 |     // Check if reactive state is available
  153 |     const hasReactiveState = await page.evaluate(() => {
  154 |       console.log('__tetrisModule:', window.__tetrisModule)
  155 |       console.log('__tetrisReactiveState:', window.__tetrisReactiveState)
  156 |       return window.__tetrisReactiveState !== undefined
  157 |     })
  158 |     
  159 |     console.log('Has reactive state:', hasReactiveState)
  160 |     
  161 |     // Force 4 full rows by manipulating the board state directly
  162 |     // This requires accessing the game module from window
  163 |     const debugOutput = await page.evaluate(() => {
  164 |       const tetrisModule = window.__tetrisModule
  165 |       if (!tetrisModule) return { error: 'Module not found' }
  166 |       
  167 |       // Use the reactive state from Vue
  168 |       const state = window.__tetrisReactiveState || tetrisModule.state
  169 |       console.log('Initial lines:', state.lines)
  170 |       
  171 |       // Fill rows 16, 17, 18, 19 completely
  172 |       for (let r = 16; r < 20; r++) {
  173 |         for (let c = 0; c < 10; c++) {
  174 |           state.board[r][c] = '#ff0000'
  175 |         }
  176 |       }
  177 |       
  178 |       // Place I-piece at row 13 so it drops and completes the 4th row
  179 |       state.currentPiece = {
  180 |         type: 'I',
  181 |         shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  182 |         color: '#00f0f0',
  183 |         row: 13,
  184 |         col: 0
  185 |       }
  186 |       state.lastDropTime = performance.now() - 2000
  187 |       
  188 |       // Force update to process the piece drop and line clearing
  189 |       tetrisModule.update()
  190 |       console.log('After first update, lines:', state.lines, 'score:', state.score)
  191 |       
  192 |       state.lastDropTime = performance.now() - 2000
  193 |       tetrisModule.update()
  194 |       console.log('After second update, lines:', state.lines, 'score:', state.score)
  195 |       
  196 |       // Also update the DOM directly to ensure the UI reflects the changes
  197 |       const linesEl = document.querySelector('.info-value:nth-child(4)')
  198 |       const scoreEl = document.querySelector('.info-value:first-child')
  199 |       if (linesEl) linesEl.textContent = state.lines
  200 |       if (scoreEl) scoreEl.textContent = state.score
  201 |       
  202 |       return { lines: state.lines, score: state.score }
  203 |     })
  204 |     console.log('Debug output:', debugOutput)
  205 |     
  206 |     // Wait for the game loop to update the UI
  207 |     await wait(1000)
  208 |     
  209 |     // Get final lines and score from DOM
  210 |     const linesAfter = await page.locator('.info-value').nth(2).textContent()
  211 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  212 |     console.log('Lines after DOM:', linesAfter, 'Score after DOM:', scoreAfter)
  213 |     
  214 |     // Verify 4 lines were cleared (lines counter should increase by 4)
> 215 |     expect(parseInt(linesAfter)).toBe(parseInt(linesBefore) + 4)
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  216 |     
  217 |     // Verify score increased by 800 (at level 1)
  218 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
  219 |   })
  220 | 
  221 |   // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────
  222 | 
  223 |   test('score increases by 100 when 1 line cleared', async ({ page }) => {
  224 |     await page.keyboard.press('Space')
  225 |     await wait(200)
  226 |     
  227 |     // Set level to 1 explicitly
  228 |     await page.evaluate(() => {
  229 |       const tetrisModule = window.__tetrisModule
  230 |       if (tetrisModule) {
  231 |         tetrisModule.state.level = 1
  232 |       }
  233 |     })
  234 |     
  235 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  236 |     
  237 |     // Fill one row completely
  238 |     await page.evaluate(() => {
  239 |       const tetrisModule = window.__tetrisModule
  240 |       if (!tetrisModule) return
  241 |       
  242 |       for (let c = 0; c < 10; c++) {
  243 |         tetrisModule.state.board[19][c] = '#ff0000'
  244 |       }
  245 |       
  246 |       tetrisModule.state.currentPiece.row = 17
  247 |       tetrisModule.state.currentPiece.col = 0
  248 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  249 |     })
  250 |     
  251 |     await wait(500)
  252 |     
  253 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  254 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 100)
  255 |   })
  256 | 
  257 |   test('score increases by 300 when 2 lines cleared', async ({ page }) => {
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
  274 |       for (let r of [18, 19]) {
  275 |         for (let c = 0; c < 10; c++) {
  276 |           tetrisModule.state.board[r][c] = '#ff0000'
  277 |         }
  278 |       }
  279 |       
  280 |       tetrisModule.state.currentPiece.row = 16
  281 |       tetrisModule.state.currentPiece.col = 0
  282 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  283 |     })
  284 |     
  285 |     await wait(500)
  286 |     
  287 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  288 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 300)
  289 |   })
  290 | 
  291 |   test('score increases by 500 when 3 lines cleared', async ({ page }) => {
  292 |     await page.keyboard.press('Space')
  293 |     await wait(200)
  294 |     
  295 |     await page.evaluate(() => {
  296 |       const tetrisModule = window.__tetrisModule
  297 |       if (tetrisModule) {
  298 |         tetrisModule.state.level = 1
  299 |       }
  300 |     })
  301 |     
  302 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  303 |     
  304 |     await page.evaluate(() => {
  305 |       const tetrisModule = window.__tetrisModule
  306 |       if (!tetrisModule) return
  307 |       
  308 |       for (let r of [17, 18, 19]) {
  309 |         for (let c = 0; c < 10; c++) {
  310 |           tetrisModule.state.board[r][c] = '#ff0000'
  311 |         }
  312 |       }
  313 |       
  314 |       tetrisModule.state.currentPiece.row = 15
  315 |       tetrisModule.state.currentPiece.col = 0
```