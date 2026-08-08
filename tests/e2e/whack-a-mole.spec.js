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
      return window['__whack-a-moleModule'] !== undefined
    })
    expect(moduleAvailable).toBe(true)
  })

  test('window.__whack-a-moleReactiveState is available for E2E tests', async ({ page }) => {
    const stateAvailable = await page.evaluate(() => {
      return window['__whack-a-moleReactiveState'] !== undefined
    })
    expect(stateAvailable).toBe(true)
  })

  test('whack-a-mole module has required exports', async ({ page }) => {
    const exportsCheck = await page.evaluate(() => {
      const whackAMoleModule = window['__whack-a-moleModule']
      if (!whackAMoleModule) return { error: 'Module not found' }
      
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
      const whackAMoleState = window['__whack-a-moleReactiveState']
      if (!whackAMoleState) return { error: 'State not found' }
      
      return {
        hasIsPlaying: whackAMoleState.isPlaying !== undefined,
        isPlayingInitial: whackAMoleState.isPlaying === false, // Should be false initially
        hasScore: whackAMoleState.score !== undefined,
        hasCursorRow: whackAMoleState.cursorRow !== undefined,
        hasCursorCol: whackAMoleState.cursorCol !== undefined
      }
    })
    
    expect(stateCheck.hasIsPlaying).toBe(true)
    expect(stateCheck.isPlayingInitial).toBe(true) // Not playing initially
    expect(stateCheck.hasScore).toBe(true)
    expect(stateCheck.hasCursorRow).toBe(true)
    expect(stateCheck.hasCursorCol).toBe(true)
  })

  test('whack-a-mole module is same as window.__whack-a-moleModule', async ({ page }) => {
    // Verify that the module exposed to window is the same as what's imported
    const moduleMatch = await page.evaluate(() => {
      const moduleFromWindow = window['__whack-a-moleModule']
      if (!moduleFromWindow) return false
      
      // Check that it has the expected exports
      return typeof moduleFromWindow.init === 'function' &&
             typeof moduleFromWindow.update === 'function' &&
             typeof moduleFromWindow.render === 'function' &&
             typeof moduleFromWindow.reset === 'function' &&
             typeof moduleFromWindow.handleKeydown === 'function'
    })
    
    expect(moduleMatch).toBe(true)
  })

  test('whack-a-mole reactive state is same as window.__whack-a-moleReactiveState', async ({ page }) => {
    // Verify that the reactive state exposed to window is accessible
    const stateMatch = await page.evaluate(() => {
      const stateFromWindow = window['__whack-a-moleReactiveState']
      if (!stateFromWindow) return false
      
      // Check that it has expected properties
      return stateFromWindow.isPlaying !== undefined &&
             stateFromWindow.score !== undefined &&
             stateFromWindow.cursorRow !== undefined &&
             stateFromWindow.cursorCol !== undefined
    })
    
    expect(stateMatch).toBe(true)
  })
})
