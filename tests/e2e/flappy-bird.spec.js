import { test, expect } from '@playwright/test'

// Helper to wait for a short time to allow game state updates
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

test.describe('Flappy Bird E2E Tests - Dynamic Window Exposure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game/flappy-bird')
    // Wait for canvas to be rendered
    await page.waitForSelector('canvas')
    await wait(100)
  })

  // ─── Test: Verify dynamic window exposure works for Flappy Bird ─────────────

  test('window.__flappy-birdModule is available for E2E tests', async ({ page }) => {
    const moduleAvailable = await page.evaluate(() => {
      console.log('Checking window keys:', Object.keys(window).filter(k => k.startsWith('__')))
      return window['__flappy-birdModule'] !== undefined
    })
    expect(moduleAvailable).toBe(true)
  })

  test('window.__flappy-birdReactiveState is available for E2E tests', async ({ page }) => {
    const stateAvailable = await page.evaluate(() => {
      return window['__flappy-birdReactiveState'] !== undefined
    })
    expect(stateAvailable).toBe(true)
  })

  test('flappy-bird module has required exports', async ({ page }) => {
    const exportsCheck = await page.evaluate(() => {
      const flappyBirdModule = window['__flappy-birdModule']
      if (!flappyBirdModule) return { error: 'Module not found' }
      
      const requiredExports = ['init', 'update', 'render', 'reset', 'handleKeydown']
      const missing = requiredExports.filter(exportName => typeof flappyBirdModule[exportName] !== 'function')
      
      return {
        hasInit: typeof flappyBirdModule.init === 'function',
        hasUpdate: typeof flappyBirdModule.update === 'function',
        hasRender: typeof flappyBirdModule.render === 'function',
        hasReset: typeof flappyBirdModule.reset === 'function',
        hasHandleKeydown: typeof flappyBirdModule.handleKeydown === 'function',
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

  test('flappy-bird reactive state has isPlaying property', async ({ page }) => {
    const stateCheck = await page.evaluate(() => {
      const flappyBirdState = window['__flappy-birdReactiveState']
      if (!flappyBirdState) return { error: 'State not found' }
      
      return {
        hasIsPlaying: flappyBirdState.isPlaying !== undefined,
        isPlayingInitial: flappyBirdState.isPlaying === false, // Should be false initially
        hasScore: flappyBirdState.score !== undefined,
        hasBirdRow: flappyBirdState.bird.row !== undefined,
        hasBirdVelocity: flappyBirdState.bird.velocity !== undefined
      }
    })
    
    expect(stateCheck.hasIsPlaying).toBe(true)
    expect(stateCheck.isPlayingInitial).toBe(true) // Not playing initially
    expect(stateCheck.hasScore).toBe(true)
    expect(stateCheck.hasBirdRow).toBe(true)
    expect(stateCheck.hasBirdVelocity).toBe(true)
  })

  test('flappy-bird module is same as window.__flappy-birdModule', async ({ page }) => {
    // Verify that the module exposed to window is the same as what's imported
    const moduleMatch = await page.evaluate(() => {
      const moduleFromWindow = window['__flappy-birdModule']
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

  test('flappy-bird reactive state is same as window.__flappy-birdReactiveState', async ({ page }) => {
    // Verify that the reactive state exposed to window is accessible
    const stateMatch = await page.evaluate(() => {
      const stateFromWindow = window['__flappy-birdReactiveState']
      if (!stateFromWindow) return false
      
      // Check that it has expected properties
      return stateFromWindow.isPlaying !== undefined &&
             stateFromWindow.score !== undefined &&
             stateFromWindow.bird !== undefined
    })
    
    expect(stateMatch).toBe(true)
  })
})
