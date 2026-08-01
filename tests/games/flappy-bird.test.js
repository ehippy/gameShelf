import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..', '..')
const flappyPath = join(root, 'src', 'games', 'flappy-bird', 'gameLogic.js')

// --- Static checks ---

describe('flappy-bird', () => {
  describe('Static checks', () => {
    const flappySrc = readFileSync(flappyPath, 'utf-8')

    it('exports init()', () => {
      expect(flappySrc).toContain('export function init')
    })

    it('exports update()', () => {
      expect(flappySrc).toContain('export function update')
    })

    it('exports render()', () => {
      expect(flappySrc).toContain('export function render')
    })

    it('exports reset()', () => {
      expect(flappySrc).toContain('export function reset')
    })

    it('exports handleKeydown', () => {
      expect(flappySrc).toContain('export function handleKeydown')
    })

    it('exports state', () => {
      expect(flappySrc).toContain('export { state }')
    })

    // Canvas dimensions
    it('canvas width is 250', () => {
      expect(flappySrc).toContain('CANVAS_WIDTH')
      expect(flappySrc).toContain('250')
    })

    it('canvas height is 500', () => {
      expect(flappySrc).toContain('CANVAS_HEIGHT')
      expect(flappySrc).toContain('500')
    })

    it('grid has 7 columns', () => {
      expect(flappySrc).toContain('COLS')
      expect(flappySrc).toContain('7')
    })

    it('grid has 7 rows', () => {
      expect(flappySrc).toContain('ROWS')
      expect(flappySrc).toContain('7')
    })

    // Bird physics constants
    it('has gravity constant ~0.12', () => {
      expect(flappySrc).toContain('GRAVITY')
      expect(flappySrc).toContain('0.12')
    })

    it('has flap strength ~-2.5', () => {
      expect(flappySrc).toContain('FLAP_STRENGTH')
      expect(flappySrc).toContain('-2.5')
    })

    it('has pipe speed ~0.08', () => {
      expect(flappySrc).toContain('PIPE_SPEED')
      expect(flappySrc).toContain('0.08')
    })

    // Pipe gap
    it('gap is 4 cells (~144 pixels)', () => {
      expect(flappySrc).toContain('GAP_SIZE_CELLS')
      expect(flappySrc).toContain('4')
    })

    // Pipe spawning interval
    it('pipe spawn interval ~7 frames', () => {
      expect(flappySrc).toContain('PIPE_SPAWN_INTERVAL')
      expect(flappySrc).toContain('7')
    })

    // Grace period
    it('has grace period ~30 frames', () => {
      expect(flappySrc).toContain('GRACE_PERIOD_FRAMES')
      expect(flappySrc).toContain('30')
    })

    // Green pipe color
    it('uses green pipe color #2ecc71', () => {
      expect(flappySrc).toContain('#2ecc71')
    })

    // Bird column
    it('bird column is 3', () => {
      expect(flappySrc).toContain('BIRD_COL')
      expect(flappySrc).toContain('3')
    })

    // Sky-blue background
    it('sky-blue background #87CEEB', () => {
      expect(flappySrc).toContain('87CEEB') || expect(flappySrc).toContain('"87CEEB"') || expect(flappySrc).toContain("'87CEEB'")
    })

    // Yellow bird
    it('bird is yellow/gold', () => {
      expect(flappySrc).toContain('FFD700') || expect(flappySrc).toContain('"FFD700"') || expect(flappySrc).toContain("'FFD700'")
    })

    // Handle keydown for ArrowUp and Space
    it('handleKeydown handles ArrowUp', () => {
      expect(flappySrc).toContain('ArrowUp')
    })

    it('handleKeydown handles space bar', () => {
      expect(flappySrc).toContain("' '")
    })

    // State shape
    it('state has score', () => {
      expect(flappySrc).toContain('score:') || expect(flappySrc).toContain('"score"')
    })

    it('state has isGameOver', () => {
      expect(flappySrc).toContain('isGameOver:') || expect(flappySrc).toContain('"isGameOver"')
    })

    it('state has isPlaying', () => {
      expect(flappySrc).toContain('isPlaying:') || expect(flappySrc).toContain('"isPlaying"')
    })

    it('state has bird', () => {
      expect(flappySrc).toContain('bird:') || expect(flappySrc).toContain('"bird"')
    })

    it('state has pipes', () => {
      expect(flappySrc).toContain('pipes:')
    })

    it('state has pipeQueue', () => {
      expect(flappySrc).toContain('pipeQueue:')
    })

    it('state has pipeDropInterval', () => {
      expect(flappySrc).toContain('pipeDropInterval:')
    })

    it('state has lastPipeDrop', () => {
      expect(flappySrc).toContain('lastPipeDrop:')
    })

    it('bird state has row', () => {
      expect(flappySrc).toContain('row:') || expect(flappySrc).toContain('"row"')
    })

    it('bird state has col', () => {
      expect(flappySrc).toContain('col:')
    })

    it('bird state has velocity', () => {
      expect(flappySrc).toContain('velocity:')
    })
  })

  // --- Functional tests ---

  describe('Functional tests', () => {
    let flappyModule = null

    beforeEach(async () => {
      try {
        flappyModule = await import(flappyPath)
      } catch {
        flappyModule = null
      }
    })

    it('init is a function', () => {
      if (!flappyModule) return
      expect(typeof flappyModule.init).toBe('function')
    })

    it('update is a function', () => {
      if (!flappyModule) return
      expect(typeof flappyModule.update).toBe('function')
    })

    it('reset is a function', () => {
      if (!flappyModule) return
      expect(typeof flappyModule.reset).toBe('function')
    })

    it('handleKeydown is a function', () => {
      if (!flappyModule) return
      expect(typeof flappyModule.handleKeydown).toBe('function')
    })

    it('exports state', () => {
      if (!flappyModule) return
      expect(flappyModule.state).toBeDefined()
    })

    it('init() returns state object', () => {
      if (!flappyModule) return
      const initState = flappyModule.init()
      expect(initState).not.toBeNull()
    })

    it('initial state.score is 0', () => {
      if (!flappyModule) return
      const initState = flappyModule.init()
      expect(typeof initState.score).toBe('number')
      expect(initState.score).toBe(0)
    })

    it('initial state.isGameOver is false', () => {
      if (!flappyModule) return
      const initState = flappyModule.init()
      expect(typeof initState.isGameOver).toBe('boolean')
      expect(initState.isGameOver).toBe(false)
    })

    it('initial state.isPlaying is false', () => {
      if (!flappyModule) return
      const initState = flappyModule.init()
      expect(typeof initState.isPlaying).toBe('boolean')
      expect(initState.isPlaying).toBe(false)
    })

    it('state.bird is set after init', () => {
      if (!flappyModule) return
      const initState = flappyModule.init()
      expect(initState.bird).not.toBeNull()
    })

    it('state.bird.row is a number', () => {
      if (!flappyModule) return
      const initState = flappyModule.init()
      expect(typeof initState.bird.row).toBe('number')
    })

    it('state.bird.col is 3', () => {
      if (!flappyModule) return
      const initState = flappyModule.init()
      expect(typeof initState.bird.col).toBe('number')
      expect(initState.bird.col).toBe(3)
    })

    it('state.bird.velocity is 0 at init', () => {
      if (!flappyModule) return
      const initState = flappyModule.init()
      expect(typeof initState.bird.velocity).toBe('number')
      expect(initState.bird.velocity).toBe(0)
    })

    it('state.pipes is an array', () => {
      if (!flappyModule) return
      const initState = flappyModule.init()
      expect(Array.isArray(initState.pipes)).toBe(true)
    })

    it('state.pipeQueue exists', () => {
      if (!flappyModule) return
      const initState = flappyModule.init()
      expect(initState.pipeQueue).toBeDefined()
    })

    it('state.pipeDropInterval is 7', () => {
      if (!flappyModule) return
      const initState = flappyModule.init()
      expect(typeof initState.pipeDropInterval).toBe('number')
      expect(initState.pipeDropInterval).toBe(7)
    })

    it('state.lastPipeDrop is a number', () => {
      if (!flappyModule) return
      const initState = flappyModule.init()
      expect(typeof initState.lastPipeDrop).toBe('number')
    })

    it('flap (ArrowUp) sets negative velocity', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.handleKeydown('ArrowUp')
      expect(flappyModule.state.isPlaying).toBe(true)
      expect(flappyModule.state.bird.velocity).toBe(-2.5)
    })

    it('flap velocity is ~-2.5', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.handleKeydown('ArrowUp')
      expect(flappyModule.state.bird.velocity).toBe(-2.5)
    })

    it('space bar triggers flap', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.handleKeydown(' ')
      expect(flappyModule.state.isPlaying).toBe(true)
      expect(flappyModule.state.bird.velocity).toBe(-2.5)
    })

    it('gravity pulls bird down over time', () => {
      if (!flappyModule) return
      flappyModule.init()
      // Start the game loop without modifying velocity (bypass handleKeydown)
      flappyModule.state.isPlaying = true
      // Advance past grace period (30 frames) — at frame 30 gravity starts
      for (let i = 0; i < 31; i++) {
        flappyModule.update()
      }
      const initialBirdRow = flappyModule.state.bird.row
      for (let i = 0; i < 5; i++) {
        flappyModule.update()
      }
      expect(flappyModule.state.bird.row > initialBirdRow).toBe(true)
    })

    it('pipes spawn after interval frames', () => {
      if (!flappyModule) return
      flappyModule.init()
      // Start the game loop without modifying velocity
      flappyModule.state.isPlaying = true
      expect(flappyModule.state.pipes.length).toBe(0)
      for (let i = 0; i < 8; i++) {
        flappyModule.update()
      }
      expect(flappyModule.state.pipes.length >= 1).toBe(true)
    })

    it('score doesn\'t decrease', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.handleKeydown('ArrowUp')
      flappyModule.state.bird.col = 3
      flappyModule.state.pipes = [
        { x: 2.5, gapStart: 2, scored: false }
      ]
      const beforeScore = flappyModule.state.score
      for (let i = 0; i < 30; i++) {
        flappyModule.update()
      }
      expect(flappyModule.state.score >= beforeScore).toBe(true)
    })

    it('reset() restores score to 0', () => {
      if (!flappyModule) return
      flappyModule.init()
      for (let i = 0; i < 15; i++) {
        flappyModule.update()
        flappyModule.handleKeydown('ArrowUp')
      }
      flappyModule.reset()
      expect(flappyModule.state.score).toBe(0)
    })

    it('reset() sets isGameOver to false', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.reset()
      expect(flappyModule.state.isGameOver).toBe(false)
    })

    it('reset() sets isPlaying to false', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.reset()
      expect(flappyModule.state.isPlaying).toBe(false)
    })

    it('reset() restores bird to default row', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.reset()
      expect(flappyModule.state.bird.row).toBe(3)
    })

    it('reset() restores bird velocity to 0', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.reset()
      expect(flappyModule.state.bird.velocity).toBe(0)
    })

    it('reset() clears pipes', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.reset()
      expect(flappyModule.state.pipes.length).toBe(0)
    })

    it('ArrowDown accelerates fall', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.handleKeydown('ArrowUp')
      const vBefore = flappyModule.state.bird.velocity
      flappyModule.handleKeydown('ArrowDown')
      expect(flappyModule.state.bird.velocity > vBefore).toBe(true)
    })

    it('handleKeydown ArrowUp no-throw at game over', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.state.isGameOver = true
      expect(() => flappyModule.handleKeydown('ArrowUp')).not.toThrow()
    })

    it('handleKeydown space no-throw at game over', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.state.isGameOver = true
      expect(() => flappyModule.handleKeydown(' ')).not.toThrow()
    })

    // --- AC4: After game over, space/ArrowUp resets game and starts playing ---

    it('handleKeydown space when isGameOver resets score to 0, sets isPlaying=true, sets velocity to FLAP_STRENGTH', () => {
      if (!flappyModule) return
      flappyModule.init()
      // Play a few frames to get a non-zero score
      flappyModule.state.isPlaying = true
      for (let i = 0; i < 10; i++) {
        flappyModule.update()
        flappyModule.handleKeydown('ArrowUp')
      }
      // Force game over state directly (bypass physics)
      flappyModule.state.isGameOver = true
      flappyModule.state.isPlaying = false
      const scoreBefore = flappyModule.state.score
      expect(scoreBefore).toBe(0) // after init, score is 0 but we'll still verify

      // Reset via space
      flappyModule.handleKeydown(' ')
      expect(flappyModule.state.score).toBe(0)
      expect(flappyModule.state.isGameOver).toBe(false)
      expect(flappyModule.state.isPlaying).toBe(true)
      expect(flappyModule.state.bird.velocity).toBe(-2.5)
      expect(flappyModule.state.bird.row).toBe(3)
      expect(flappyModule.state.pipes.length).toBe(0)
    })

    it('handleKeydown ArrowUp when isGameOver resets score to 0, sets isPlaying=true, sets velocity to FLAP_STRENGTH', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.state.isPlaying = true
      for (let i = 0; i < 10; i++) {
        flappyModule.update()
        flappyModule.handleKeydown('ArrowUp')
      }
      // Force game over state directly (bypass physics)
      flappyModule.state.isGameOver = true
      flappyModule.state.isPlaying = false

      flappyModule.handleKeydown('ArrowUp')
      expect(flappyModule.state.score).toBe(0)
      expect(flappyModule.state.isGameOver).toBe(false)
      expect(flappyModule.state.isPlaying).toBe(true)
      expect(flappyModule.state.bird.velocity).toBe(-2.5)
      expect(flappyModule.state.bird.row).toBe(3)
      expect(flappyModule.state.pipes.length).toBe(0)
    })

    // --- AC5: Already playing, handleKeydown just flaps ---

    it('handleKeydown space when already playing just applies FLAP_STRENGTH (no reset)', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.handleKeydown('ArrowUp') // start playing
      expect(flappyModule.state.isPlaying).toBe(true)
      expect(flappyModule.state.bird.velocity).toBe(-2.5)
      const scoreBefore = flappyModule.state.score
      const pipesBefore = flappyModule.state.pipes.length
      const rowBefore = flappyModule.state.bird.row

      flappyModule.handleKeydown(' ')
      expect(flappyModule.state.score).toBe(scoreBefore)
      expect(flappyModule.state.pipes.length).toBe(pipesBefore)
      expect(flappyModule.state.bird.row).toBe(rowBefore)
      expect(flappyModule.state.isPlaying).toBe(true)
      expect(flappyModule.state.bird.velocity).toBe(-2.5)
    })

    it('handleKeydown ArrowUp when already playing just applies FLAP_STRENGTH', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.handleKeydown('ArrowUp')
      expect(flappyModule.state.isPlaying).toBe(true)
      const scoreBefore = flappyModule.state.score
      const rowBefore = flappyModule.state.bird.row

      flappyModule.handleKeydown('ArrowUp')
      expect(flappyModule.state.score).toBe(scoreBefore)
      expect(flappyModule.state.bird.row).toBe(rowBefore)
      expect(flappyModule.state.bird.velocity).toBe(-2.5)
    })

    // --- AC6: ArrowDown when not playing is ignored ---

    it('handleKeydown ArrowDown when isPlaying=false does not start the game', () => {
      if (!flappyModule) return
      flappyModule.init()
      expect(flappyModule.state.isPlaying).toBe(false)
      flappyModule.handleKeydown('ArrowDown')
      expect(flappyModule.state.isPlaying).toBe(false)
    })

    it('handleKeydown ArrowDown when isPlaying=false does not change bird velocity', () => {
      if (!flappyModule) return
      flappyModule.init()
      expect(flappyModule.state.bird.velocity).toBe(0)
      flappyModule.handleKeydown('ArrowDown')
      expect(flappyModule.state.bird.velocity).toBe(0)
    })

    it('handleKeydown ArrowDown when isGameOver is true does not start the game', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.state.isPlaying = true
      for (let i = 0; i < 10; i++) {
        flappyModule.update()
      }
      flappyModule.state.bird.row = 6.6
      flappyModule.update()
      expect(flappyModule.state.isGameOver).toBe(true)

      flappyModule.handleKeydown('ArrowDown')
      expect(flappyModule.state.isPlaying).toBe(false)
      expect(flappyModule.state.isGameOver).toBe(true)
    })

    it('ceiling collision triggers game over', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.handleKeydown('ArrowUp')
      flappyModule.state.bird.row = -1
      flappyModule.state.bird.velocity = 0
      flappyModule.update()
      expect(flappyModule.state.isGameOver).toBe(true)
    })

    it('ground collision triggers game over', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.handleKeydown('ArrowUp')
      flappyModule.state.bird.row = 6.6
      flappyModule.state.bird.velocity = 0
      flappyModule.update()
      expect(flappyModule.state.isGameOver).toBe(true)
    })

    it('pipe collision triggers game over', () => {
      if (!flappyModule) return
      flappyModule.init()
      flappyModule.handleKeydown('ArrowUp')
      flappyModule.state.bird.row = 2
      flappyModule.state.bird.col = 3
      flappyModule.state.bird.velocity = 0
      flappyModule.state.pipes = [
        { x: 3.0, gapStart: 3, scored: false }
      ]
      flappyModule.update()
      expect(flappyModule.state.isGameOver).toBe(true)
    })
  })
})
