import { test, expect } from '@playwright/test'

test('home page loads and shows gameShelf title', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('gameShelf')
  await expect(page.locator('.tagline')).toContainText('Play classic games right in your browser')
})

test('home page has game cards', async ({ page }) => {
  await page.goto('/')
  const cards = page.locator('.game-card')
  await expect(cards).not.toBeEmpty()
})

test('navigation links are present', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'About' })).toBeVisible()
})
