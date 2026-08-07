import { test, expect } from '@playwright/test'

test('home page loads and shows gameShelf title', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('gameShelf')
  await expect(page.locator('.tagline')).toContainText('Play classic games right in your browser')
})

test('home page has game cards', async ({ page }) => {
  await page.goto('/')
  // Use data attributes to target only the main grid cards (not WhatsNew)
  const cards = page.locator('.games-grid .game-card')
  await expect(cards).not.toBeEmpty()
})

test('navigation links are present', async ({ page }) => {
  await page.goto('/')
  // Use CSS selector to target only the header nav (not footer)
  await expect(page.locator('.app-header nav a', { hasText: 'About' })).toBeVisible()
})
