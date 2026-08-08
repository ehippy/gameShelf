import { test, expect } from '@playwright/test'

// Helper to wait for a short time to allow game state updates
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

test.describe('Snake E2E Tests - Dynamic Window Exposure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game/snake')
    // Wait for canvas to be rendered
    await page.waitForSelector('canvas')
    await wait(100)
  })

  // ─── Test: Verify dynamic window exposure works for Snake ───────────────────

  test('window.__snakeModule is available for E2E tests', async ({ page }) => {
    const moduleAvailable = await page.evaluate(() => {
      console.log('Checking window keys:', Object.keys(window).filter(k => k.startsWith('__')))
      return window.__snakeModule !== undefined
    })
    expect(moduleAvailable).toBe(true)
  })

  test('window.__snakeReactiveState is available for E2E tests', async ({ page }) => {
    const stateAvailable = await page.evaluate(() => {
      return window.__snakeReactiveState !== undefined
    })
    expect(stateAvailable).toBe(true)
  })

  test('snake module has required exports', async ({ page }) => {
    const exportsCheck = await page.evaluate(() => {
      const snakeModule = window.__snakeModule
      if (!snakeModule) return { error: 'Module not found' }
      
      const requiredExports = ['init', 'update', 'render', 'reset', 'handleKeydown']
      const missing = requiredExports.filter(exportName => typeof snakeModule[exportName] !== 'function')
      
      return {
        hasInit: typeof snakeModule.init === 'function',
        hasUpdate: typeof snakeModule.update === 'function',
        hasRender: typeof snakeModule.render === 'function',
        hasReset: typeof snakeModule.reset === 'function',
        hasHandleKeydown: typeof snakeModule.handleKeydown === 'function',
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

  test('snake reactive state has isPlaying property', async ({ page }) => {
    const stateCheck = await page.evaluate(() => {
      const snakeState = window.__snakeReactiveState
      if (!snakeState) return { error: 'State not found' }
      
      return {
        hasIsPlaying: snakeState.isPlaying !== undefined,
        isPlayingInitial: snakeState.isPlaying === false, // Should be false initially
        hasScore: snakeState.score !== undefined,
        hasDirection: snakeState.direction !== undefined
      }
    })
    
    expect(stateCheck.hasIsPlaying).toBe(true)
    expect(stateCheck.isPlayingInitial).toBe(true) // Not playing initially
    expect(stateCheck.hasScore).toBe(true)
    expect(stateCheck.hasDirection).toBe(true)
  })

  test('keyboard controls work - ArrowUp changes direction', async ({ page }) => {
    // Start the game first with an arrow key (not Space)
    await page.keyboard.press('ArrowRight')
    await wait(200)
    
    // Verify isPlaying changed after input
    const isPlaying = await page.evaluate(() => {
      return window.__snakeReactiveState?.isPlaying ?? null
    })
    expect(isPlaying).toBe(true)
    
    // Get initial direction
    const initialDirection = await page.evaluate(() => {
      return window.__snakeReactiveState?.direction ?? null
    })
    
    // Verify initial direction is right (set by ArrowRight above)
    expect(initialDirection).toBe('right')
    
    // Press ArrowUp
    await page.keyboard.press('ArrowUp')
    await wait(100)
    
    // Verify direction changed
    const newDirection = await page.evaluate(() => {
      return window.__snakeReactiveState?.direction ?? null
    })
    
    expect(newDirection).toBe('up')
  })
})
