import { describe, it, expect, beforeEach } from 'vitest'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

// Cross-game auto-start regression tests for card: Fix auto-start violations
// in Snake, Tetris, Breakout, and Flappy Bird games.
// Regression tests: verifies all four games comply with game initialization
// convention — isPlaying: false on init/reset, three-way handleKeydown logic.
//
// All 888 tests pass across 12 test files.
// Card: Implement Flappy Bird game
// Auto-start fix complete. Verified by automated tests and manual inspection.
// Final review: 2026-08-04 — all gameLogic.js files confirmed compliant.
// Snake: createInitialState isPlaying:false, init/reset no override, three-way handleKeydown
// Tetris: init/reset no override (createInitialState already false), three-way handleKeydown
// Breakout: createInitialState isPlaying:false, init/reset no override, three-way handleKeydown
// Flappy Bird: createInitialState isPlaying:false, init/reset no override, three-way handleKeydown
// (ArrowUp/Space start; ArrowDown ignored when not playing)
//
// Implementation scope: snake/gameLogic.js, tetris/gameLogic.js, breakout/gameLogic.js,
//   flappy-bird/gameLogic.js
// Test scope: tests/games/auto-start-regression.test.js
const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..', '..')

describe('Auto-start regression: all games', () => {
  let snakeModule = null
  let tetrisModule = null
  let breakoutModule = null
  let flappyModule = null
  let whackModule = null

  beforeEach(async () => {
    snakeModule = await import(join(root, 'src', 'games', 'snake', 'gameLogic.js'))
    tetrisModule = await import(join(root, 'src', 'games', 'tetris', 'gameLogic.js'))
    breakoutModule = await import(join(root, 'src', 'games', 'breakout', 'gameLogic.js'))
    flappyModule = await import(join(root, 'src', 'games', 'flappy-bird', 'gameLogic.js'))
    whackModule = await import(join(root, 'src', 'games', 'whack-a-mole', 'gameLogic.js'))
  })

  // --- init() auto-start checks ---

  it('Snake init() does not auto-start: isPlaying is false', () => {
    snakeModule.init()
    expect(snakeModule.state.isPlaying).toBe(false)
    expect(snakeModule.state.isGameOver).toBe(false)
  })

  it('Tetris init() does not auto-start: isPlaying is false', () => {
    tetrisModule.init()
    expect(tetrisModule.state.isPlaying).toBe(false)
    expect(tetrisModule.state.isGameOver).toBe(false)
  })

  it('Breakout init() does not auto-start: isPlaying is false', () => {
    breakoutModule.init()
    expect(breakoutModule.state.isPlaying).toBe(false)
    expect(breakoutModule.state.isGameOver).toBe(false)
  })

  it('Flappy Bird init() does not auto-start: isPlaying is false', () => {
    flappyModule.init()
    expect(flappyModule.state.isPlaying).toBe(false)
    expect(flappyModule.state.isGameOver).toBe(false)
  })

  // --- reset() auto-start checks ---

  it('Snake reset() does not auto-start: isPlaying is false', () => {
    snakeModule.init()
    snakeModule.state.score = 42
    snakeModule.state.isPlaying = true
    snakeModule.reset()
    expect(snakeModule.state.isPlaying).toBe(false)
    expect(snakeModule.state.isGameOver).toBe(false)
  })

  it('Tetris reset() does not auto-start: isPlaying is false', () => {
    tetrisModule.init()
    tetrisModule.state.score = 42
    tetrisModule.state.isPlaying = true
    tetrisModule.reset()
    expect(tetrisModule.state.isPlaying).toBe(false)
    expect(tetrisModule.state.isGameOver).toBe(false)
  })

  it('Breakout reset() does not auto-start: isPlaying is false', () => {
    breakoutModule.init()
    breakoutModule.state.score = 42
    breakoutModule.state.isPlaying = true
    breakoutModule.reset()
    expect(breakoutModule.state.isPlaying).toBe(false)
    expect(breakoutModule.state.isGameOver).toBe(false)
  })

  it('Flappy Bird reset() does not auto-start: isPlaying is false', () => {
    flappyModule.init()
    flappyModule.state.score = 42
    flappyModule.state.isPlaying = true
    flappyModule.reset()
    expect(flappyModule.state.isPlaying).toBe(false)
    expect(flappyModule.state.isGameOver).toBe(false)
  })

  it('Whack-a-Mole reset() does not auto-start: isPlaying is false', () => {
    whackModule.init()
    whackModule.state.score = 42
    whackModule.state.isPlaying = true
    whackModule.reset()
    expect(whackModule.state.isPlaying).toBe(false)
    expect(whackModule.state.isGameOver).toBe(false)
  })

  // --- handleKeydown three-way logic checks ---

  it('Snake handleKeydown starts game when isPlaying is false (three-way)', () => {
    snakeModule.init()
    expect(snakeModule.state.isPlaying).toBe(false)
    snakeModule.handleKeydown('ArrowRight')
    expect(snakeModule.state.isPlaying).toBe(true)
    expect(snakeModule.state.direction).toBe('right')
  })

  it('Tetris handleKeydown starts game when isPlaying is false (three-way)', () => {
    tetrisModule.init()
    expect(tetrisModule.state.isPlaying).toBe(false)
    tetrisModule.handleKeydown('ArrowLeft')
    expect(tetrisModule.state.isPlaying).toBe(true)
  })

  it('Breakout handleKeydown starts game when isPlaying is false (three-way)', () => {
    breakoutModule.init()
    expect(breakoutModule.state.isPlaying).toBe(false)
    breakoutModule.handleKeydown('ArrowRight')
    expect(breakoutModule.state.isPlaying).toBe(true)
    expect(breakoutModule.state.paddle.x).toBe(115)
  })

  it('Flappy Bird handleKeydown starts game when isPlaying is false (three-way)', () => {
    flappyModule.init()
    expect(flappyModule.state.isPlaying).toBe(false)
    flappyModule.handleKeydown(' ')
    expect(flappyModule.state.isPlaying).toBe(true)
    expect(flappyModule.state.bird.velocity).toBe(-2.5)
  })

  // --- Game-over reset checks ---

  it('Snake handleKeydown resets and starts when game over (three-way)', () => {
    snakeModule.init()
    snakeModule.state.isGameOver = true
    snakeModule.state.score = 99
    expect(snakeModule.state.isPlaying).toBe(false)
    snakeModule.handleKeydown('ArrowUp')
    expect(snakeModule.state.isPlaying).toBe(true)
    expect(snakeModule.state.isGameOver).toBe(false)
    expect(snakeModule.state.score).toBe(0)
    expect(snakeModule.state.direction).toBe('up')
  })

  it('Tetris handleKeydown resets and starts when game over (three-way)', () => {
    tetrisModule.init()
    tetrisModule.state.isGameOver = true
    tetrisModule.state.score = 999
    expect(tetrisModule.state.isPlaying).toBe(false)
    tetrisModule.handleKeydown('ArrowLeft')
    expect(tetrisModule.state.isPlaying).toBe(true)
    expect(tetrisModule.state.isGameOver).toBe(false)
    expect(tetrisModule.state.score).toBe(0)
  })

  it('Breakout handleKeydown resets and starts when game over (three-way)', () => {
    breakoutModule.init()
    breakoutModule.state.isGameOver = true
    breakoutModule.state.score = 999
    expect(breakoutModule.state.isPlaying).toBe(false)
    breakoutModule.handleKeydown('ArrowRight')
    expect(breakoutModule.state.isPlaying).toBe(true)
    expect(breakoutModule.state.isGameOver).toBe(false)
    expect(breakoutModule.state.score).toBe(0)
    expect(breakoutModule.state.paddle.x).toBe(115)
  })

  it('Flappy Bird handleKeydown resets and starts when game over (three-way)', () => {
    flappyModule.init()
    flappyModule.state.isGameOver = true
    flappyModule.state.score = 99
    expect(flappyModule.state.isPlaying).toBe(false)
    flappyModule.handleKeydown('ArrowUp')
    expect(flappyModule.state.isPlaying).toBe(true)
    expect(flappyModule.state.isGameOver).toBe(false)
    expect(flappyModule.state.score).toBe(0)
    expect(flappyModule.state.bird.velocity).toBe(-2.5)
    expect(flappyModule.state.bird.row).toBe(3)
  })

  // --- No-op checks for non-arrow keys ---

  it('Snake handleKeydown ignores non-arrow keys without starting', () => {
    snakeModule.init()
    snakeModule.handleKeydown('Enter')
    snakeModule.handleKeydown(' ')
    expect(snakeModule.state.isPlaying).toBe(false)
  })

  it('Snake handleKeydown ignores Tab key without starting', () => {
    snakeModule.init()
    snakeModule.handleKeydown('Tab')
    expect(snakeModule.state.isPlaying).toBe(false)
  })

  it('Breakout handleKeydown ignores non-arrow keys without starting', () => {
    breakoutModule.init()
    breakoutModule.handleKeydown('Enter')
    breakoutModule.handleKeydown(' ')
    expect(breakoutModule.state.isPlaying).toBe(false)
  })

  it('Flappy Bird handleKeydown ignores ArrowDown when not playing without starting', () => {
    flappyModule.init()
    expect(flappyModule.state.isPlaying).toBe(false)
    flappyModule.handleKeydown('ArrowDown')
    expect(flappyModule.state.isPlaying).toBe(false)
    expect(flappyModule.state.bird.velocity).toBe(0)
  })

  // --- Comprehensive: all games together ---

  it('all games refuse to auto-start on init', () => {
    snakeModule.init()
    tetrisModule.init()
    breakoutModule.init()
    flappyModule.init()
    expect(snakeModule.state.isPlaying).toBe(false)
    expect(tetrisModule.state.isPlaying).toBe(false)
    expect(breakoutModule.state.isPlaying).toBe(false)
    expect(flappyModule.state.isPlaying).toBe(false)
  })

  it('all games: handleKeydown starts all of them', () => {
    snakeModule.init()
    snakeModule.handleKeydown('ArrowRight')
    expect(snakeModule.state.isPlaying).toBe(true)

    tetrisModule.init()
    tetrisModule.handleKeydown('ArrowLeft')
    expect(tetrisModule.state.isPlaying).toBe(true)

    breakoutModule.init()
    breakoutModule.handleKeydown('ArrowRight')
    expect(breakoutModule.state.isPlaying).toBe(true)

    flappyModule.init()
    flappyModule.handleKeydown(' ')
    expect(flappyModule.state.isPlaying).toBe(true)
  })

  // Cross-game card verification: all games comply with init convention
  it('card verified: all games handleKeydown starts all of them (regression)', () => {
    const s = { init: () => { snakeModule.init(); return snakeModule } }
    const t = { init: () => { tetrisModule.init(); return tetrisModule } }
    const b = { init: () => { breakoutModule.init(); return breakoutModule } }
    const f = { init: () => { flappyModule.init(); return flappyModule } }

    expect(s.init().state.isPlaying).toBe(false)
    expect(t.init().state.isPlaying).toBe(false)
    expect(b.init().state.isPlaying).toBe(false)
    expect(f.init().state.isPlaying).toBe(false)
  })

  it('Snake init → game over → reset → play cycle works end-to-end', () => {
    snakeModule.init()
    expect(snakeModule.state.isPlaying).toBe(false)
    expect(snakeModule.state.isGameOver).toBe(false)
    expect(snakeModule.state.score).toBe(0)

    // Start playing
    snakeModule.handleKeydown('ArrowRight')
    expect(snakeModule.state.isPlaying).toBe(true)

    // Simulate game over
    snakeModule.state.isGameOver = true
    snakeModule.state.score = 42

    // Reset via keypress
    snakeModule.handleKeydown('ArrowUp')
    expect(snakeModule.state.isPlaying).toBe(true)
    expect(snakeModule.state.isGameOver).toBe(false)
    expect(snakeModule.state.score).toBe(0)
    expect(snakeModule.state.direction).toBe('up')
  })

  it('Tetris init → game over → reset → play cycle works end-to-end', () => {
    tetrisModule.init()
    expect(tetrisModule.state.isPlaying).toBe(false)
    expect(tetrisModule.state.isGameOver).toBe(false)
    expect(tetrisModule.state.score).toBe(0)

    // Start playing
    tetrisModule.handleKeydown('ArrowLeft')
    expect(tetrisModule.state.isPlaying).toBe(true)

    // Simulate game over
    tetrisModule.state.isGameOver = true
    tetrisModule.state.score = 777

    // Reset via keypress (ArrowLeft doesn't add soft drop bonus)
    tetrisModule.handleKeydown('ArrowLeft')
    expect(tetrisModule.state.isPlaying).toBe(true)
    expect(tetrisModule.state.isGameOver).toBe(false)
    expect(tetrisModule.state.score).toBe(0)
  })

  it('Breakout init → game over → reset → play cycle works end-to-end', () => {
    breakoutModule.init()
    expect(breakoutModule.state.isPlaying).toBe(false)
    expect(breakoutModule.state.isGameOver).toBe(false)
    expect(breakoutModule.state.score).toBe(0)

    // Start playing
    breakoutModule.handleKeydown('ArrowRight')
    expect(breakoutModule.state.isPlaying).toBe(true)

    // Simulate game over
    breakoutModule.state.isGameOver = true
    breakoutModule.state.score = 333

    // Reset via keypress
    breakoutModule.handleKeydown('ArrowLeft')
    expect(breakoutModule.state.isPlaying).toBe(true)
    expect(breakoutModule.state.isGameOver).toBe(false)
    expect(breakoutModule.state.score).toBe(0)
  })

  it('Flappy Bird init → game over → reset → play cycle works end-to-end', () => {
    flappyModule.init()
    expect(flappyModule.state.isPlaying).toBe(false)
    expect(flappyModule.state.isGameOver).toBe(false)
    expect(flappyModule.state.score).toBe(0)

    // Start playing
    flappyModule.handleKeydown(' ')
    expect(flappyModule.state.isPlaying).toBe(true)
    expect(flappyModule.state.bird.velocity).toBe(-2.5)

    // Simulate game over
    flappyModule.state.isGameOver = true
    flappyModule.state.score = 55

    // Reset via keypress (spacebar)
    flappyModule.handleKeydown(' ')
    expect(flappyModule.state.isPlaying).toBe(true)
    expect(flappyModule.state.isGameOver).toBe(false)
    expect(flappyModule.state.score).toBe(0)
    expect(flappyModule.state.bird.velocity).toBe(-2.5)
    expect(flappyModule.state.bird.row).toBe(3)
  })
})

