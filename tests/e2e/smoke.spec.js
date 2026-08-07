import { test, expect } from '@playwright/test'

test('home page loads and shows gameShelf title', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('gameShelf')
  await expect(page.locator('.tagline')).toContainText('Play classic games right in your browser')
})

test('home page has game cards', async ({ page }) => {
  await page.goto('/')
  // Check that there's at least one game card on the page (in either grid or WhatsNew)
  const cards = page.locator('.game-card')
  await expect(cards.first()).toBeVisible()
})

test('navigation links are present', async ({ page }) => {
  await page.goto('/')
  // Use CSS selector to target only the header nav (not footer)
  await expect(page.locator('.app-header nav a', { hasText: 'About' })).toBeVisible()
})
