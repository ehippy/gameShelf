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
        hasBirdY: flappyBirdState.bird.y !== undefined,
        hasBirdVelocity: flappyBirdState.bird.velocity !== undefined
      }
    })
    
    expect(stateCheck.hasIsPlaying).toBe(true)
    expect(stateCheck.isPlayingInitial).toBe(true) // Not playing initially
    expect(stateCheck.hasScore).toBe(true)
    expect(stateCheck.hasBirdY).toBe(true)
    expect(stateCheck.hasBirdVelocity).toBe(true)
  })

  test('keyboard controls work - Space triggers flap', async ({ page }) => {
    // Start the game first with Space (which also flaps)
    await page.keyboard.press('Space')
    await wait(200)
    
    // Verify isPlaying changed after input
    const isPlaying = await page.evaluate(() => {
      return window['__flappy-birdReactiveState']?.isPlaying ?? null
    })
    expect(isPlaying).toBe(true)
    
    // Get initial bird position
    const initialY = await page.evaluate(() => {
      return window['__flappy-birdReactiveState']?.bird?.y ?? null
    })
    const initialVelocity = await page.evaluate(() => {
      return window['__flappy-birdReactiveState']?.bird?.velocity ?? null
    })
    
    // Wait a bit for gravity to take effect
    await wait(100)
    
    // Press Space again (flap)
    await page.keyboard.press('Space')
    await wait(100)
    
    // Verify bird moved up (negative velocity means moving up in canvas coords)
    const newVelocity = await page.evaluate(() => {
      return window['__flappy-birdReactiveState']?.bird?.velocity ?? null
    })
    
    // After flap, velocity should be negative (bird moves up)
    expect(newVelocity).toBeLessThan(initialVelocity)
  })

  test('keyboard controls work - ArrowUp triggers flap', async ({ page }) => {
    // Start the game first with Space
    await page.keyboard.press('Space')
    await wait(200)
    
    // Get initial bird position
    const initialY = await page.evaluate(() => {
      return window['__flappy-birdReactiveState']?.bird?.y ?? null
    })
    
    // Press ArrowUp (which also flaps)
    await page.keyboard.press('ArrowUp')
    await wait(100)
    
    // Verify bird moved up
    const newY = await page.evaluate(() => {
      return window['__flappy-birdReactiveState']?.bird?.y ?? null
    })
    
    expect(newY).toBeLessThan(initialY)
  })
})
