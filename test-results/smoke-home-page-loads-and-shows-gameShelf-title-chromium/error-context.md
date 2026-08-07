# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.js >> home page loads and shows gameShelf title
- Location: tests/e2e/smoke.spec.js:3:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: locator('h1')
Expected: "gameShelf"
Error: strict mode violation: locator('h1') resolved to 2 elements:
    1) <h1 class="brand" data-v-548b7c5a="">gameShelf</h1> aka getByRole('banner').getByRole('heading', { name: 'gameShelf' })
    2) <h1>gameShelf</h1> aka getByRole('heading', { name: 'gameShelf' }).nth(1)

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for locator('h1')

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
    - heading "gameShelf" [level=1] [ref=e13]
    - paragraph [ref=e14]: Play classic games right in your browser
    - generic [ref=e15]:
      - heading "What's New" [level=2] [ref=e16]
      - generic [ref=e17]:
        - generic [ref=e18]:
          - heading "Whack-a-Mole" [level=3] [ref=e20]
          - paragraph [ref=e21]: Whack moles as fast as you can!
          - generic [ref=e22]: Casual
          - link "Play" [ref=e23] [cursor=pointer]:
            - /url: /game/whack-a-mole
        - generic [ref=e24]:
          - heading "Flappy Bird" [level=3] [ref=e26]
          - paragraph [ref=e27]: Guide the bird through gaps in the pipes
          - generic [ref=e28]: Arcade
          - link "Play" [ref=e29] [cursor=pointer]:
            - /url: /game/flappy-bird
        - generic [ref=e30]:
          - heading "Breakout" [level=3] [ref=e32]
          - paragraph [ref=e33]: Classic brick-breaking game
          - generic [ref=e34]: Arcade
          - link "Play" [ref=e35] [cursor=pointer]:
            - /url: /game/breakout
    - heading "Most Played" [level=2] [ref=e37]
    - button "🎲 Play Random Game" [ref=e39] [cursor=pointer]
    - generic [ref=e40]:
      - generic [ref=e41]:
        - img "Snake" [ref=e43]
        - heading "Snake" [level=3] [ref=e44]
        - paragraph [ref=e45]: Classic snake game
        - generic [ref=e46]: Arcade
        - link "Play" [ref=e47] [cursor=pointer]:
          - /url: /game/snake
      - generic [ref=e48]:
        - img "Tetris" [ref=e50]
        - heading "Tetris" [level=3] [ref=e51]
        - paragraph [ref=e52]: Classic block-stacking game
        - generic [ref=e53]: Puzzle
        - link "Play" [ref=e54] [cursor=pointer]:
          - /url: /game/tetris
  - contentinfo [ref=e55]:
    - paragraph [ref=e56]: © 2025 gameShelf — All games built in browser — no downloads required
    - link "About" [ref=e57] [cursor=pointer]:
      - /url: /about
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test('home page loads and shows gameShelf title', async ({ page }) => {
  4  |   await page.goto('/')
> 5  |   await expect(page.locator('h1')).toHaveText('gameShelf')
     |                                    ^ Error: expect(locator).toHaveText(expected) failed
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
  17 |   await expect(page.getByRole('link', { name: 'About' })).toBeVisible()
  18 | })
  19 | 
```