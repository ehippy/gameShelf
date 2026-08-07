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
  165 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  166 |       tetrisModule.update()
  167 |       
  168 |       // Force Vue to re-render by triggering a state change that Vue detects
  169 |       // This forces the reactive proxy to update
  170 |       tetrisModule.state.score = tetrisModule.state.score
  171 |     })
  172 |     
  173 |     // Wait for the game loop to update the UI
  174 |     await wait(1000)
  175 |     
  176 |     // Verify 4 lines were cleared (lines counter should increase by 4)
  177 |     const linesAfter = await page.locator('.info-value').nth(2).textContent()
> 178 |     expect(parseInt(linesAfter)).toBe(parseInt(linesBefore) + 4)
      |                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  179 |     
  180 |     // Verify score increased by 800 (at level 1)
  181 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  182 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 800)
  183 |   })
  184 | 
  185 |   // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────
  186 | 
  187 |   test('score increases by 100 when 1 line cleared', async ({ page }) => {
  188 |     await page.keyboard.press('Space')
  189 |     await wait(200)
  190 |     
  191 |     // Set level to 1 explicitly
  192 |     await page.evaluate(() => {
  193 |       const tetrisModule = window.__tetrisModule
  194 |       if (tetrisModule) {
  195 |         tetrisModule.state.level = 1
  196 |       }
  197 |     })
  198 |     
  199 |     const scoreBefore = await page.locator('.info-value').first().textContent()
  200 |     
  201 |     // Fill one row completely
  202 |     await page.evaluate(() => {
  203 |       const tetrisModule = window.__tetrisModule
  204 |       if (!tetrisModule) return
  205 |       
  206 |       for (let c = 0; c < 10; c++) {
  207 |         tetrisModule.state.board[19][c] = '#ff0000'
  208 |       }
  209 |       
  210 |       tetrisModule.state.currentPiece.row = 17
  211 |       tetrisModule.state.currentPiece.col = 0
  212 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  213 |     })
  214 |     
  215 |     await wait(500)
  216 |     
  217 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  218 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 100)
  219 |   })
  220 | 
  221 |   test('score increases by 300 when 2 lines cleared', async ({ page }) => {
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
  238 |       for (let r of [18, 19]) {
  239 |         for (let c = 0; c < 10; c++) {
  240 |           tetrisModule.state.board[r][c] = '#ff0000'
  241 |         }
  242 |       }
  243 |       
  244 |       tetrisModule.state.currentPiece.row = 16
  245 |       tetrisModule.state.currentPiece.col = 0
  246 |       tetrisModule.state.lastDropTime = performance.now() - 2000
  247 |     })
  248 |     
  249 |     await wait(500)
  250 |     
  251 |     const scoreAfter = await page.locator('.info-value').first().textContent()
  252 |     expect(parseInt(scoreAfter)).toBe(parseInt(scoreBefore) + 300)
  253 |   })
  254 | 
  255 |   test('score increases by 500 when 3 lines cleared', async ({ page }) => {
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
  272 |       for (let r of [17, 18, 19]) {
  273 |         for (let c = 0; c < 10; c++) {
  274 |           tetrisModule.state.board[r][c] = '#ff0000'
  275 |         }
  276 |       }
  277 |       
  278 |       tetrisModule.state.currentPiece.row = 15
```