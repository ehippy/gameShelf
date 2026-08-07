# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.js >> navigation links are present
- Location: tests/e2e/smoke.spec.js:15:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: 'About' })
Expected: visible
Error: strict mode violation: getByRole('link', { name: 'About' }) resolved to 2 elements:
    1) <a class="" href="/about" data-v-48a13218="">About</a> aka getByRole('navigation').getByRole('link', { name: 'About' })
    2) <a class="" href="/about" data-v-6704560a="">About</a> aka getByRole('contentinfo').getByRole('link', { name: 'About' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('link', { name: 'About' })

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
  11 |   const cards = page.locator('.game-card')
  12 |   await expect(cards).not.toBeEmpty()
  13 | })
  14 | 
  15 | test('navigation links are present', async ({ page }) => {
  16 |   await page.goto('/')
> 17 |   await expect(page.getByRole('link', { name: 'About' })).toBeVisible()
     |                                                           ^ Error: expect(locator).toBeVisible() failed
  18 | })
  19 | 
```