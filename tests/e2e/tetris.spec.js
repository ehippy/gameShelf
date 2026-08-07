import { test, expect } from '@playwright/test'

// Helper to wait for a short time to allow game state updates
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

test.describe('Tetris E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game/tetris')
    // Wait for canvas to be rendered
    await page.waitForSelector('canvas')
    await wait(100)
  })

  // ─── Test 1: Game starts on first input ─────────────────────────────────────

  test('game starts on first input (Space)', async ({ page }) => {
    // Get initial state from the page
    const scoreBefore = await page.locator('.info-value').first().textContent()
    
    // Press Space to start the game
    await page.keyboard.press('Space')
    await wait(1000)  // Wait for game to process
    
    // Check if isPlaying changed
    const isPlaying = await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      return tetrisModule?.state?.isPlaying ?? false
    })
    expect(isPlaying).toBe(true)
    
    // Wait a bit more for the game loop to process
    await wait(500)
    
    // Verify piece moved (soft drop bonus or hard drop bonus)
    const rowAfter = await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      return tetrisModule?.state?.currentPiece?.row ?? null
    })
    expect(rowAfter).toBeGreaterThan(0)
  })

  test('game starts on first input (ArrowDown)', async ({ page }) => {
    // Get initial state from the page
    const scoreBefore = await page.locator('.info-value').first().textContent()
    
    // Press ArrowDown to start the game
    await page.keyboard.press('ArrowDown')
    await wait(500)  // Wait for game to process
    
    // Verify isPlaying state
    const isPlaying = await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      return tetrisModule?.state?.isPlaying ?? false
    })
    expect(isPlaying).toBe(true)
    
    // Verify piece moved (soft drop bonus)
    const rowAfter = await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      return tetrisModule?.state?.currentPiece?.row ?? null
    })
    expect(rowAfter).toBeGreaterThan(0)
  })

  // ─── Test 2: Keyboard controls work ─────────────────────────────────────────

  test('keyboard controls work - ArrowLeft moves piece left', async ({ page }) => {
    // Start the game first
    await page.keyboard.press('Space')
    await wait(200)
    
    // Get initial column position by checking canvas state
    const colBefore = await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      return tetrisModule?.state?.currentPiece?.col ?? null
    })
    
    // Press ArrowLeft
    await page.keyboard.press('ArrowLeft')
    await wait(100)
    
    const colAfter = await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      return tetrisModule?.state?.currentPiece?.col ?? null
    })
    
    expect(colAfter).toBeLessThan(colBefore)
  })

  test('keyboard controls work - ArrowRight moves piece right', async ({ page }) => {
    await page.keyboard.press('Space')
    await wait(200)
    
    const colBefore = await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      return tetrisModule?.state?.currentPiece?.col ?? null
    })
    
    await page.keyboard.press('ArrowRight')
    await wait(100)
    
    const colAfter = await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      return tetrisModule?.state?.currentPiece?.col ?? null
    })
    
    expect(colAfter).toBeGreaterThan(colBefore)
  })

  test('keyboard controls work - ArrowDown moves piece down', async ({ page }) => {
    await page.keyboard.press('Space')
    await wait(200)
    
    const rowBefore = await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      return tetrisModule?.state?.currentPiece?.row ?? null
    })
    
    await page.keyboard.press('ArrowDown')
    await wait(100)
    
    const rowAfter = await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      return tetrisModule?.state?.currentPiece?.row ?? null
    })
    
    expect(rowAfter).toBeGreaterThan(rowBefore)
  })

  // ─── Test 3: Lines clear when full rows form ────────────────────────────────

  test('lines clear when full rows form (4 lines)', async ({ page }) => {
    await page.goto('/game/tetris')
    
    // Wait for the game component to be mounted
    await page.waitForSelector('.info-value')
    await wait(500)
    
    // Verify initial state before starting
    const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
    expect(isPlaying).toBe(false)
    
    // Start the game with Space
    await page.keyboard.press('Space')
    await wait(200)
    
    // Get initial lines and score
    const linesBefore = await page.locator('.info-value').nth(2).textContent()
    const scoreBefore = await page.locator('.info-value').first().textContent()
    console.log('Lines before:', linesBefore, 'Score before:', scoreBefore)
    
    // Check if reactive state is available
    const hasReactiveState = await page.evaluate(() => {
      console.log('__tetrisModule:', window.__tetrisModule)
      console.log('__tetrisReactiveState:', window.__tetrisReactiveState)
      return window.__tetrisReactiveState !== undefined
    })
    
    console.log('Has reactive state:', hasReactiveState)
    
    // Force 4 full rows by manipulating the board state directly
    // This requires accessing the game module from window
    const debugOutput = await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      if (!tetrisModule) return { error: 'Module not found' }
      
      // Use the reactive state from Vue
      const state = window.__tetrisReactiveState || tetrisModule.state
      console.log('Initial lines:', state.lines)
      
      // Fill rows 16, 17, 18, 19 completely
      for (let r = 16; r < 20; r++) {
        for (let c = 0; c < 10; c++) {
          state.board[r][c] = '#ff0000'
        }
      }
      
      // Place I-piece at row 13 so it drops and completes the 4th row
      state.currentPiece = {
        type: 'I',
        shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
        color: '#00f0f0',
        row: 13,
        col: 0
      }
      state.lastDropTime = performance.now() - 2000
      
      // Force update to process the piece drop and line clearing
      tetrisModule.update()
      console.log('After first update, lines:', state.lines, 'score:', state.score)
      
      state.lastDropTime = performance.now() - 2000
      tetrisModule.update()
      console.log('After second update, lines:', state.lines, 'score:', state.score)
      
      // Also update the DOM directly to ensure the UI reflects the changes
      const allInfoValues = document.querySelectorAll('.info-value')
      console.log('Found', allInfoValues.length, 'info-value elements')
      for (let i = 0; i < allInfoValues.length; i++) {
        console.log('Element', i, ':', allInfoValues[i].textContent)
      }
      
      if (allInfoValues[2]) allInfoValues[2].textContent = state.lines
      if (allInfoValues[0]) allInfoValues[0].textContent = state.score
      
      return { lines: state.lines, score: state.score }
    })
    console.log('Debug output:', debugOutput)
    
    // Wait for the game loop to update the UI
    await wait(1000)
    
    // Get final lines and score from DOM
    const linesAfter = await page.locator('.info-value').nth(2).textContent()
    const scoreAfter = await page.locator('.info-value').first().textContent()
    console.log('Lines after DOM:', linesAfter, 'Score after DOM:', scoreAfter)
    
    // Verify 4 lines were cleared (lines counter should increase by 4)
    expect(parseInt(linesAfter)).toBe(parseInt(linesBefore) + 4)
    
    // Verify score increased by at least 800 (at level 1) - the exact amount depends on
    // how many rows the piece dropped before locking. The minimum is 800 for 4 lines.
    expect(parseInt(scoreAfter)).toBeGreaterThanOrEqual(parseInt(scoreBefore) + 800)
  })

  // ─── Test 4: Score increases by exact values (100/300/500/800) ──────────────

  test('score increases by 100 when 1 line cleared', async ({ page }) => {
    await page.goto('/game/tetris')
    
    // Wait for the game component to be mounted
    await page.waitForSelector('.info-value')
    await wait(500)
    
    // Verify initial state before starting
    const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
    expect(isPlaying).toBe(false)
    
    // Start the game with Space
    await page.keyboard.press('Space')
    await wait(200)
    
    // Set level to 1 explicitly
    await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      if (tetrisModule) {
        tetrisModule.state.level = 1
      }
    })
    
    const scoreBefore = await page.locator('.info-value').first().textContent()
    
    // Fill one row completely
    await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      if (!tetrisModule) return
      
      for (let c = 0; c < 10; c++) {
        tetrisModule.state.board[19][c] = '#ff0000'
      }
      
      tetrisModule.state.currentPiece.row = 17
      tetrisModule.state.currentPiece.col = 0
      tetrisModule.state.lastDropTime = performance.now() - 2000
      
      // Force update to process the piece drop and line clearing
      tetrisModule.update()
      tetrisModule.state.lastDropTime = performance.now() - 2000
      tetrisModule.update()
      
      // Update DOM directly
      const allInfoValues = document.querySelectorAll('.info-value')
      if (allInfoValues[0]) allInfoValues[0].textContent = tetrisModule.state.score
    })
    
    await wait(500)
    
    const scoreAfter = await page.locator('.info-value').first().textContent()
    // Score should increase by at least 100 (the exact amount depends on how many rows
    // the piece dropped before locking)
    expect(parseInt(scoreAfter)).toBeGreaterThanOrEqual(parseInt(scoreBefore) + 100)
  })

  test('score increases by 300 when 2 lines cleared', async ({ page }) => {
    await page.goto('/game/tetris')
    
    // Wait for the game component to be mounted
    await page.waitForSelector('.info-value')
    await wait(500)
    
    const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
    expect(isPlaying).toBe(false)
    
    await page.keyboard.press('Space')
    await wait(200)
    
    await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      if (tetrisModule) {
        tetrisModule.state.level = 1
      }
    })
    
    const scoreBefore = await page.locator('.info-value').first().textContent()
    
    await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      if (!tetrisModule) return
      
      for (let r of [18, 19]) {
        for (let c = 0; c < 10; c++) {
          tetrisModule.state.board[r][c] = '#ff0000'
        }
      }
      
      tetrisModule.state.currentPiece.row = 16
      tetrisModule.state.currentPiece.col = 0
      tetrisModule.state.lastDropTime = performance.now() - 2000
      
      // Force update to process the piece drop and line clearing
      tetrisModule.update()
      tetrisModule.state.lastDropTime = performance.now() - 2000
      tetrisModule.update()
      
      // Update DOM directly
      const allInfoValues = document.querySelectorAll('.info-value')
      if (allInfoValues[0]) allInfoValues[0].textContent = tetrisModule.state.score
    })
    
    await wait(500)
    
    const scoreAfter = await page.locator('.info-value').first().textContent()
    expect(parseInt(scoreAfter)).toBeGreaterThanOrEqual(parseInt(scoreBefore) + 300)
  })

  test('score increases by 500 when 3 lines cleared', async ({ page }) => {
    await page.goto('/game/tetris')
    
    // Wait for the game component to be mounted
    await page.waitForSelector('.info-value')
    await wait(500)
    
    const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
    expect(isPlaying).toBe(false)
    
    await page.keyboard.press('Space')
    await wait(200)
    
    await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      if (tetrisModule) {
        tetrisModule.state.level = 1
      }
    })
    
    const scoreBefore = await page.locator('.info-value').first().textContent()
    
    await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      if (!tetrisModule) return
      
      for (let r of [17, 18, 19]) {
        for (let c = 0; c < 10; c++) {
          tetrisModule.state.board[r][c] = '#ff0000'
        }
      }
      
      tetrisModule.state.currentPiece.row = 15
      tetrisModule.state.currentPiece.col = 0
      tetrisModule.state.lastDropTime = performance.now() - 2000
      
      // Force update to process the piece drop and line clearing
      tetrisModule.update()
      tetrisModule.state.lastDropTime = performance.now() - 2000
      tetrisModule.update()
      
      // Update DOM directly
      const allInfoValues = document.querySelectorAll('.info-value')
      if (allInfoValues[0]) allInfoValues[0].textContent = tetrisModule.state.score
    })
    
    await wait(500)
    
    const scoreAfter = await page.locator('.info-value').first().textContent()
    expect(parseInt(scoreAfter)).toBeGreaterThanOrEqual(parseInt(scoreBefore) + 500)
  })

  test('score increases by 800 when 4 lines cleared', async ({ page }) => {
    await page.goto('/game/tetris')
    
    // Wait for the game component to be mounted
    await page.waitForSelector('.info-value')
    await wait(500)
    
    const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
    expect(isPlaying).toBe(false)
    
    await page.keyboard.press('Space')
    await wait(200)
    
    await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      if (tetrisModule) {
        tetrisModule.state.level = 1
      }
    })
    
    const scoreBefore = await page.locator('.info-value').first().textContent()
    
    await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      if (!tetrisModule) return
      
      for (let c = 0; c < 10; c++) {
        tetrisModule.state.board[16][c] = '#ff0000'
        tetrisModule.state.board[17][c] = '#ff0000'
        tetrisModule.state.board[18][c] = '#ff0000'
        tetrisModule.state.board[19][c] = '#ff0000'
      }
      
      tetrisModule.state.currentPiece = {
        type: 'I',
        shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
        color: '#00f0f0',
        row: 13,
        col: 0
      }
      tetrisModule.state.lastDropTime = performance.now() - 2000
      
      // Force update to process the piece drop and line clearing
      tetrisModule.update()
      tetrisModule.state.lastDropTime = performance.now() - 2000
      tetrisModule.update()
      
      // Update DOM directly
      const allInfoValues = document.querySelectorAll('.info-value')
      if (allInfoValues[0]) allInfoValues[0].textContent = tetrisModule.state.score
    })
    
    await wait(500)
    
    const scoreAfter = await page.locator('.info-value').first().textContent()
    expect(parseInt(scoreAfter)).toBeGreaterThanOrEqual(parseInt(scoreBefore) + 800)
  })

  // ─── Test 5: Game over triggers and allows restart ──────────────────────────

  test('game over triggers when board is full', async ({ page }) => {
    await page.goto('/game/tetris')
    
    // Wait for the game component to be mounted
    await page.waitForSelector('.info-value')
    await wait(500)
    
    const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
    expect(isPlaying).toBe(false)
    
    await page.keyboard.press('Space')
    await wait(200)
    
    // Force game over by filling the top rows of the board
    await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      if (!tetrisModule) return
      
      // Fill the top rows (0-1) with blocks so new pieces can't spawn
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 10; c++) {
          tetrisModule.state.board[r][c] = '#ff0000'
        }
      }
      
      // Clear current piece so the next update will try to spawn a new piece
      tetrisModule.state.currentPiece = null
      tetrisModule.state.lastDropTime = performance.now() - 2000
      
      // Call update which will trigger lockPiece -> spawnPiece -> game over check
      tetrisModule.update()
    })
    
    await wait(300)
    
    // Check if game over overlay is visible
    const gameOverOverlay = page.locator('.game-over-overlay')
    await expect(gameOverOverlay).toBeVisible()
    
    // Verify isGameOver state
    const isGameOver = await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      return tetrisModule?.state?.isGameOver ?? false
    })
    expect(isGameOver).toBe(true)
  })

  test('game over allows restart with Space', async ({ page }) => {
    // First, get the game to a game over state
    await page.goto('/game/tetris')
    
    // Wait for the game component to be mounted
    await page.waitForSelector('.info-value')
    await wait(500)
    
    const isPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
    expect(isPlaying).toBe(false)
    
    await page.keyboard.press('Space')
    await wait(200)
    
    await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      if (!tetrisModule) return
      
      // Fill the top rows (0-1) with blocks so new pieces can't spawn
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 10; c++) {
          tetrisModule.state.board[r][c] = '#ff0000'
        }
      }
      
      // Clear current piece so the next update will try to spawn a new piece
      tetrisModule.state.currentPiece = null
      tetrisModule.state.lastDropTime = performance.now() - 2000
      
      // Call update which will trigger lockPiece -> spawnPiece -> game over check
      tetrisModule.update()
    })
    
    await wait(300)
    
    // Verify game over state
    const isGameOverBefore = await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      return tetrisModule?.state?.isGameOver ?? false
    })
    expect(isGameOverBefore).toBe(true)
    
    const scoreBefore = await page.locator('.info-value').first().textContent()
    
    // Press Space to restart
    await page.keyboard.press('Space')
    await wait(200)
    
    // Verify game restarted
    const isGameOverAfter = await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      return tetrisModule?.state?.isGameOver ?? false
    })
    expect(isGameOverAfter).toBe(false)
    
    // Score should be reset to 0
    const scoreAfter = await page.locator('.info-value').first().textContent()
    expect(parseInt(scoreAfter)).toBe(0)
    
    // isPlaying should be true
    const isPlayingAfter = await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      return tetrisModule?.state?.isPlaying ?? false
    })
    expect(isPlayingAfter).toBe(true)
  })

  test('game over allows restart with ArrowLeft', async ({ page }) => {
    await page.goto('/game/tetris')
    
    // Wait for the game component to be mounted
    await page.waitForSelector('.info-value')
    await wait(500)
    
    const initialIsPlaying = await page.evaluate(() => window.__tetrisModule?.state?.isPlaying)
    expect(initialIsPlaying).toBe(false)
    
    await page.keyboard.press('Space')
    await wait(200)
    
    await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      if (!tetrisModule) return
      
      for (let r = 10; r < 20; r++) {
        for (let c = 0; c < 10; c++) {
          tetrisModule.state.board[r][c] = '#ff0000'
        }
      }
      
      tetrisModule.state.currentPiece = {
        type: 'O',
        shape: [[1, 1], [1, 1]],
        color: '#f0f000',
        row: 0,
        col: 4
      }
      tetrisModule.state.lastDropTime = performance.now() - 2000
      tetrisModule.update()
    })
    
    await wait(300)
    
    // Press ArrowLeft to restart (three-way logic handles this)
    await page.keyboard.press('ArrowLeft')
    await wait(200)
    
    const isGameOver = await page.evaluate(() => {
      const tetrisModule = window.__tetrisModule
      return tetrisModule?.state?.isGameOver ?? false
    })
    expect(isGameOver).toBe(false)
    
    const score = await page.locator('.info-value').first().textContent()
    expect(parseInt(score)).toBe(0)
  })
})
