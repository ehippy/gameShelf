import { test, expect } from '@playwright/test'

// Helper to wait for a short time to allow game state updates
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

test.describe('Whack-a-Mole E2E Tests - Dynamic Window Exposure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game/whack-a-mole')
    // Wait for canvas to be rendered
    await page.waitForSelector('canvas')
    await wait(100)
  })

  // ─── Test: Verify dynamic window exposure works for Whack-a-Mole ────────────

  test('window.__whack-a-moleModule is available for E2E tests', async ({ page }) => {
    const moduleAvailable = await page.evaluate(() => {
      console.log('Checking window keys:', Object.keys(window).filter(k => k.startsWith('__')))
      return window.__whack-a-moleModule !== undefined
    })
    expect(moduleAvailable).toBe(true)
  })

  test('window.__whack-a-moleReactiveState is available for E2E tests', async ({ page }) => {
    const stateAvailable = await page.evaluate(() => {
      return window.__whack-a-moleReactiveState !== undefined
    })
    expect(stateAvailable).toBe(true)
  })

  test('whack-a-mole module has required exports', async ({ page }) => {
    const exportsCheck = await page.evaluate(() => {
      const whackAMoleModule = window.__whack-a-moleModule
      if (!whackAMoleModule) return { error: 'Module not found' })
      
      const requiredExports = ['init', 'update', 'render', 'reset', 'handleKeydown']
      const missing = requiredExports.filter(exportName => typeof whackAMoleModule[exportName] !== 'function')
      
      return {
        hasInit: typeof whackAMoleModule.init === 'function',
        hasUpdate: typeof whackAMoleModule.update === 'function',
        hasRender: typeof whackAMoleModule.render === 'function',
        hasReset: typeof whackAMoleModule.reset === 'function',
        hasHandleKeydown: typeof whackAMoleModule.handleKeydown === 'function',
        missingExports: missing.length > 0 ? missing : null
      }
    })
    
    expect(exportsCheck.hasInit).toBe(true)
    expect(exportsCheck.hasUpdate).toBe(true)
    expect(exportsCheck.hasRender).toBe(true)
    expect(exportsCheck.hasReset).toBe(true)
    expect(exportsCheck.hasHandleKeydown).toBe(true)
    expect(exportsCheck.missingExports).toBeNull()
  })

  test('whack-a-mole reactive state has isPlaying property', async ({ page }) => {
    const stateCheck = await page.evaluate(() => {
      const whackAMoleState = window.__whack-a-moleReactiveState
      if (!whackAMoleState) return { error: 'State not found' }
      
      return {
        hasIsPlaying: whackAMoleState.isPlaying !== undefined,
        isPlayingInitial: whackAMoleState.isPlaying === false, // Should be false initially
        hasScore: whackAMoleState.score !== undefined,
        hasCursorRow: whackAMoleState.cursor.row !== undefined,
        hasCursorCol: whackAMoleState.cursor.col !== undefined
      }
    })
    
    expect(stateCheck.hasIsPlaying).toBe(true)
    expect(stateCheck.isPlayingInitial).toBe(true) // Not playing initially
    expect(stateCheck.hasScore).toBe(true)
    expect(stateCheck.hasCursorRow).toBe(true)
    expect(stateCheck.hasCursorCol).toBe(true)
  })

  test('keyboard controls work - ArrowRight moves cursor right', async ({ page }) => {
    // Start the game first with Space
    await page.keyboard.press('Space')
    await wait(200)
    
    // Get initial cursor position
    const initialCol = await page.evaluate(() => {
      return window.__whack-a-moleReactiveState?.cursor?.col ?? null
    })
    
    // Press ArrowRight
    await page.keyboard.press('ArrowRight')
    await wait(100)
    
    // Verify cursor moved right
    const newCol = await page.evaluate(() => {
      return window.__whack-a-moleReactiveState?.cursor?.col ?? null
    })
    
    expect(newCol).toBeGreaterThan(initialCol)
  })

  test('keyboard controls work - ArrowLeft moves cursor left', async ({ page }) => {
    // Start the game first with Space
    await page.keyboard.press('Space')
    await wait(200)
    
    // Get initial cursor position
    const initialCol = await page.evaluate(() => {
      return window.__whack-a-moleReactiveState?.cursor?.col ?? null
    })
    
    // Press ArrowLeft (wrap around or move left)
    await page.keyboard.press('ArrowLeft')
    await wait(100)
    
    // Verify cursor moved left (or wrapped to rightmost column)
    const newCol = await page.evaluate(() => {
      return window.__whack-a-moleReactiveState?.cursor?.col ?? null
    })
    
    // Either moved left or wrapped around (both are valid behaviors)
    expect(newCol).not.toBe(initialCol)
  })

  test('difficulty selection works - A button selects difficulty', async ({ page }) => {
    // In the menu state, A button should select difficulty
    const initialDifficulty = await page.evaluate(() => {
      return window.__whack-a-moleReactiveState?.difficulty ?? null
    })
    
    // Press A to select difficulty (should cycle through options)
    await page.keyboard.press('KeyA')
    await wait(200)
    
    const newDifficulty = await page.evaluate(() => {
      return window.__whack-a-moleReactiveState?.difficulty ?? null
    })
    
    // Difficulty should have changed
    expect(newDifficulty).not.toBe(initialDifficulty)
  })

  test('whacking mole works - A button whacks when cursor on mole', async ({ page }) => {
    // Start the game first with Space
    await page.keyboard.press('Space')
    await wait(200)
    
    // Get initial score
    const initialScore = await page.evaluate(() => {
      return window.__whack-a-moleReactiveState?.score ?? 0
    })
    
    // Press A to whack (if mole is at cursor position, score increases)
    await page.keyboard.press('KeyA')
    await wait(100)
    
    const newScore = await page.evaluate(() => {
      return window.__whack-a-moleReactiveState?.score ?? 0
    })
    
    // Score should have increased (mole was likely at cursor position)
    expect(newScore).toBeGreaterThan(initialScore)
  })
})
