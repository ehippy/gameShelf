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
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for locator('h1')

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