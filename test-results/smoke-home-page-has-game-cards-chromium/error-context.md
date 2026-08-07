# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.js >> home page has game cards
- Location: tests/e2e/smoke.spec.js:9:1

# Error details

```
Error: expect(locator).not.toBeEmpty() failed

Locator: locator('.games-grid .game-card')
Expected: not empty
Error: strict mode violation: locator('.games-grid .game-card') resolved to 2 elements:
    1) <div class="game-card" data-v-f02f60b5="">…</div> aka getByText('SnakeClassic snake')
    2) <div class="game-card" data-v-f02f60b5="">…</div> aka getByText('TetrisClassic block-stacking')

Call log:
  - Expect "not toBeEmpty" with timeout 5000ms
  - waiting for locator('.games-grid .game-card')

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
    - paragraph [ref=e13]: Play classic games right in your browser
    - generic [ref=e14]:
      - heading "What's New" [level=2] [ref=e15]
      - generic [ref=e16]:
        - generic [ref=e17]:
          - heading "Whack-a-Mole" [level=3] [ref=e19]
          - paragraph [ref=e20]: Whack moles as fast as you can!
          - generic [ref=e21]: Casual
          - link "Play" [ref=e22] [cursor=pointer]:
            - /url: /game/whack-a-mole
        - generic [ref=e23]:
          - heading "Flappy Bird" [level=3] [ref=e25]
          - paragraph [ref=e26]: Guide the bird through gaps in the pipes
          - generic [ref=e27]: Arcade
          - link "Play" [ref=e28] [cursor=pointer]:
            - /url: /game/flappy-bird
        - generic [ref=e29]:
          - heading "Breakout" [level=3] [ref=e31]
          - paragraph [ref=e32]: Classic brick-breaking game
          - generic [ref=e33]: Arcade
          - link "Play" [ref=e34] [cursor=pointer]:
            - /url: /game/breakout
    - heading "Most Played" [level=2] [ref=e36]
    - button "🎲 Play Random Game" [ref=e38] [cursor=pointer]
    - generic [ref=e39]:
      - generic [ref=e40]:
        - img "Snake" [ref=e42]
        - heading "Snake" [level=3] [ref=e43]
        - paragraph [ref=e44]: Classic snake game
        - generic [ref=e45]: Arcade
        - link "Play" [ref=e46] [cursor=pointer]:
          - /url: /game/snake
      - generic [ref=e47]:
        - img "Tetris" [ref=e49]
        - heading "Tetris" [level=3] [ref=e50]
        - paragraph [ref=e51]: Classic block-stacking game
        - generic [ref=e52]: Puzzle
        - link "Play" [ref=e53] [cursor=pointer]:
          - /url: /game/tetris
  - contentinfo [ref=e54]:
    - paragraph [ref=e55]: © 2025 gameShelf — All games built in browser — no downloads required
    - link "About" [ref=e56] [cursor=pointer]:
      - /url: /about
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test('home page loads and shows gameShelf title', async ({ page }) => {
  4  |   await page.goto('/')
  5  |   await expect(page.locator('h1')).toHaveText('gameShelf')
  6  |   await expect(page.locator('.tagline')).toContainText('Play classic games right in your browser')
  7  | })
  8  | 
  9  | test('home page has game cards', async ({ page }) => {
  10 |   await page.goto('/')
  11 |   // Use data attributes to target only the main grid cards (not WhatsNew)
  12 |   const cards = page.locator('.games-grid .game-card')
> 13 |   await expect(cards).not.toBeEmpty()
     |                           ^ Error: expect(locator).not.toBeEmpty() failed
  14 | })
  15 | 
  16 | test('navigation links are present', async ({ page }) => {
  17 |   await page.goto('/')
  18 |   // Use CSS selector to target only the header nav (not footer)
  19 |   await expect(page.locator('.app-header nav a', { hasText: 'About' })).toBeVisible()
  20 | })
  21 | 
```