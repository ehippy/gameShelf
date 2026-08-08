import { test, expect } from '@playwright/test'

// Helper to wait for a short time to allow game state updates
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

test.describe('Breakout E2E Tests - Dynamic Window Exposure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game/breakout')
    // Wait for canvas to be rendered
    await page.waitForSelector('canvas')
    await wait(100)
  })

  // ─── Test: Verify dynamic window exposure works for Breakout ────────────────

  test('window.__breakoutModule is available for E2E tests', async ({ page }) => {
    const moduleAvailable = await page.evaluate(() => {
      console.log('Checking window keys:', Object.keys(window).filter(k => k.startsWith('__')))
      return window['__breakoutModule'] !== undefined
    })
    expect(moduleAvailable).toBe(true)
  })

  test('window.__breakoutReactiveState is available for E2E tests', async ({ page }) => {
    const stateAvailable = await page.evaluate(() => {
      return window['__breakoutReactiveState'] !== undefined
    })
    expect(stateAvailable).toBe(true)
  })

  test('breakout module has required exports', async ({ page }) => {
    const exportsCheck = await page.evaluate(() => {
      const breakoutModule = window['__breakoutModule']
      if (!breakoutModule) return { error: 'Module not found' }
      
      const requiredExports = ['init', 'update', 'render', 'reset', 'handleKeydown']
      const missing = requiredExports.filter(exportName => typeof breakoutModule[exportName] !== 'function')
      
      return {
        hasInit: typeof breakoutModule.init === 'function',
        hasUpdate: typeof breakoutModule.update === 'function',
        hasRender: typeof breakoutModule.render === 'function',
        hasReset: typeof breakoutModule.reset === 'function',
        hasHandleKeydown: typeof breakoutModule.handleKeydown === 'function',
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

  test('breakout reactive state has isPlaying property', async ({ page }) => {
    const stateCheck = await page.evaluate(() => {
      const breakoutState = window['__breakoutReactiveState']
      if (!breakoutState) return { error: 'State not found' }
      
      return {
        hasIsPlaying: breakoutState.isPlaying !== undefined,
        isPlayingInitial: breakoutState.isPlaying === false, // Should be false initially
        hasScore: breakoutState.score !== undefined,
        hasPaddleX: breakoutState.paddle.x !== undefined,
        hasBallX: breakoutState.ball.x !== undefined
      }
    })
    
    expect(stateCheck.hasIsPlaying).toBe(true)
    expect(stateCheck.isPlayingInitial).toBe(true) // Not playing initially
    expect(stateCheck.hasScore).toBe(true)
    expect(stateCheck.hasPaddleX).toBe(true)
    expect(stateCheck.hasBallX).toBe(true)
  })

  test('keyboard controls work - ArrowLeft moves paddle left', async ({ page }) => {
    // Start the game first with Space
    await page.keyboard.press('Space')
    await wait(200)
    
    // Get initial paddle position
    const initialX = await page.evaluate(() => {
      return window['__breakoutReactiveState']?.paddle?.x ?? null
    })
    
    // Press ArrowLeft
    await page.keyboard.press('ArrowLeft')
    await wait(100)
    
    // Verify paddle moved left
    const newX = await page.evaluate(() => {
      return window['__breakoutReactiveState']?.paddle?.x ?? null
    })
    
    expect(newX).toBeLessThan(initialX)
  })

  test('keyboard controls work - ArrowRight moves paddle right', async ({ page }) => {
    // Start the game first with Space
    await page.keyboard.press('Space')
    await wait(200)
    
    // Get initial paddle position
    const initialX = await page.evaluate(() => {
      return window['__breakoutReactiveState']?.paddle?.x ?? null
    })
    
    // Press ArrowRight
    await page.keyboard.press('ArrowRight')
    await wait(100)
    
    // Verify paddle moved right
    const newX = await page.evaluate(() => {
      return window['__breakoutReactiveState']?.paddle?.x ?? null
    })
    
    expect(newX).toBeGreaterThan(initialX)
  })
})
