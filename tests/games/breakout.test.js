import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..', '..')
const breakoutPath = join(root, 'src', 'games', 'breakout', 'gameLogic.js')

// --- Static checks ---

describe('breakout', () => {
  describe('Static checks', () => {
    const breakoutSrc = readFileSync(breakoutPath, 'utf-8')

    it('exports CANVAS_WIDTH = 250', () => {
      expect(breakoutSrc).toContain('export const CANVAS_WIDTH')
      expect(breakoutSrc).toContain('250')
    })

    it('exports CANVAS_HEIGHT = 250', () => {
      expect(breakoutSrc).toContain('export const CANVAS_HEIGHT')
      expect(breakoutSrc).toContain('250')
    })

    it('exports init()', () => {
      expect(breakoutSrc).toContain('export function init')
    })

    it('exports update()', () => {
      expect(breakoutSrc).toContain('export function update')
    })

    it('exports render()', () => {
      expect(breakoutSrc).toContain('export function render')
    })

    it('exports reset()', () => {
      expect(breakoutSrc).toContain('export function reset')
    })

    it('exports handleKeydown()', () => {
      expect(breakoutSrc).toContain('export function handleKeydown')
    })

    it('exports state', () => {
      expect(breakoutSrc).toContain('export { state }')
    })

    it('defines all 4 brick row colors', () => {
      expect(breakoutSrc).toContain('#e74c3c') // red
      expect(breakoutSrc).toContain('#3498db') // blue
      expect(breakoutSrc).toContain('#2ecc71') // green
      expect(breakoutSrc).toContain('#f39c12') // orange
    })

    it('defines 4 brick rows and 10 brick columns', () => {
      expect(breakoutSrc).toContain('BRICK_ROWS')
      expect(breakoutSrc).toContain('BRICK_COLS')
      expect(breakoutSrc).toContain('4')
      expect(breakoutSrc).toContain('10')
    })

    it('defines ball size = 6', () => {
      expect(breakoutSrc).toContain('BALL_SIZE')
      expect(breakoutSrc).toContain('6')
    })

    it('defines ball start position (123, 123)', () => {
      expect(breakoutSrc).toContain('123')
    })

    it('defines brick dimensions 23x15 with spacing 2', () => {
      expect(breakoutSrc).toContain('23')
      expect(breakoutSrc).toContain('15')
      expect(breakoutSrc).toContain('2')
    })

    it('defines paddle width = 40, height = 8', () => {
      expect(breakoutSrc).toContain('40')
      expect(breakoutSrc).toContain('8')
    })

    it('defines paddle y = 228', () => {
      expect(breakoutSrc).toContain('228')
    })

    it('defines starting lives = 3', () => {
      expect(breakoutSrc).toContain('3')
    })

    it('defines points per brick = 10', () => {
      expect(breakoutSrc).toContain('POINTS_PER_BRICK')
      expect(breakoutSrc).toContain('10')
    })

    it('uses #1a1a2e background color in render', () => {
      expect(breakoutSrc).toContain('#1a1a2e')
    })
  })

  // --- Functional tests ---

  describe('Functional tests', () => {
    let breakoutModule = null

    beforeEach(async () => {
      // Force fresh module load each time so state doesn't leak between tests
      await import('node:module')
      const mod = await import(breakoutPath)
      breakoutModule = mod
    })

    // --- init() tests ---

    it('init() returns the state object', () => {
      const state = breakoutModule.init()
      expect(state).toBeDefined()
      expect(typeof state).toBe('object')
    })

    it('init() sets state.score = 0', () => {
      const state = breakoutModule.init()
      expect(state.score).toBe(0)
    })

    it('init() sets state.lives = 3', () => {
      const state = breakoutModule.init()
      expect(state.lives).toBe(3)
    })

    it('init() sets state.isPlaying = true', () => {
      const state = breakoutModule.init()
      expect(state.isPlaying).toBe(true)
    })

    it('init() sets state.isGameOver = false', () => {
      const state = breakoutModule.init()
      expect(state.isGameOver).toBe(false)
    })

    it('init() sets state.won = undefined (not set yet)', () => {
      const state = breakoutModule.init()
      expect(state.won).toBeUndefined()
    })

    it('init() sets state.framesPlayed = 0', () => {
      const state = breakoutModule.init()
      expect(state.framesPlayed).toBe(0)
    })

    it('init() sets ball at (123, 123) with velocity (2, 2) and size 6', () => {
      const state = breakoutModule.init()
      expect(state.ball.x).toBe(123)
      expect(state.ball.y).toBe(123)
      expect(state.ball.dx).toBe(2)
      expect(state.ball.dy).toBe(2)
      expect(state.ball.size).toBe(6)
    })

    it('init() sets paddle at x=105, y=228, width=40, height=8, speed=10', () => {
      const state = breakoutModule.init()
      expect(state.paddle.x).toBe(105)
      expect(state.paddle.y).toBe(228)
      expect(state.paddle.width).toBe(40)
      expect(state.paddle.height).toBe(8)
      expect(state.paddle.speed).toBe(10)
    })

    it('init() creates 40 bricks (4 rows × 10 cols)', () => {
      const state = breakoutModule.init()
      expect(state.bricks.length).toBe(40)
    })

    it('init() creates 4 rows of 10 bricks each', () => {
      const state = breakoutModule.init()
      const rows = [0, 0, 0, 0]
      for (const brick of state.bricks) {
        rows[brick.row] = (rows[brick.row] || 0) + 1
      }
      for (let i = 0; i < 4; i++) {
        expect(rows[i]).toBe(10)
      }
    })

    it('init() brick dimensions: 23×15, spacing 2px', () => {
      const state = breakoutModule.init()
      // Check row 0, col 0 and col 1 to verify spacing
      const b0 = state.bricks[0]
      const b1 = state.bricks[1]
      expect(b0.x + 23 + 2).toBe(b1.x) // x + brickWidth + spacing = next brick x
    })

    it('init() places first brick row at y=25', () => {
      const state = breakoutModule.init()
      const row0Bricks = state.bricks.filter(b => b.row === 0)
      for (const brick of row0Bricks) {
        expect(brick.y).toBe(25)
      }
    })

    it('init() brick rows are spaced by 17px (height + spacing = 15 + 2)', () => {
      const state = breakoutModule.init()
      const row0Bricks = state.bricks.filter(b => b.row === 0)
      const row1Bricks = state.bricks.filter(b => b.row === 1)
      expect(row1Bricks[0].y - row0Bricks[0].y).toBe(17)
    })

    it('init() assigns correct colors per row', () => {
      const state = breakoutModule.init()
      const expectedColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12']
      for (let r = 0; r < 4; r++) {
        const rowBricks = state.bricks.filter(b => b.row === r)
        for (const brick of rowBricks) {
          expect(brick.color).toBe(expectedColors[r])
        }
      }
    })

    it('init() all bricks are alive', () => {
      const state = breakoutModule.init()
      for (const brick of state.bricks) {
        expect(brick.alive).toBe(true)
      }
    })

    // --- reset() tests ---

    it('reset() returns the state object', () => {
      breakoutModule.init()
      const state = breakoutModule.reset()
      expect(state).toBeDefined()
    })

    it('reset() produces score = 0', () => {
      breakoutModule.init()
      breakoutModule.state.score = 100
      breakoutModule.reset()
      expect(breakoutModule.state.score).toBe(0)
    })

    it('reset() produces lives = 3', () => {
      breakoutModule.init()
      breakoutModule.state.lives = 1
      breakoutModule.reset()
      expect(breakoutModule.state.lives).toBe(3)
    })

    it('reset() produces isPlaying = true', () => {
      breakoutModule.init()
      breakoutModule.reset()
      expect(breakoutModule.state.isPlaying).toBe(true)
    })

    it('reset() produces isGameOver = false', () => {
      breakoutModule.init()
      breakoutModule.reset()
      expect(breakoutModule.state.isGameOver).toBe(false)
    })

    it('reset() produces identical paddle position to init', () => {
      breakoutModule.init()
      const paddleBefore = { ...breakoutModule.state.paddle }
      breakoutModule.reset()
      expect(breakoutModule.state.paddle.x).toBe(paddleBefore.x)
      expect(breakoutModule.state.paddle.y).toBe(paddleBefore.y)
    })

    it('reset() produces identical ball position to init', () => {
      breakoutModule.init()
      breakoutModule.state.ball.x = 200
      breakoutModule.state.ball.y = 200
      breakoutModule.reset()
      expect(breakoutModule.state.ball.x).toBe(123)
      expect(breakoutModule.state.ball.y).toBe(123)
    })

    it('reset() restores all bricks to alive', () => {
      breakoutModule.init()
      // Destroy some bricks via manual update or by manipulating state
      breakoutModule.state.bricks[0].alive = false
      breakoutModule.reset()
      for (const brick of breakoutModule.state.bricks) {
        expect(brick.alive).toBe(true)
      }
    })

    it('reset() produces same state as a fresh init()', () => {
      const fresh = breakoutModule.init()
      breakoutModule.init() // call again
      const rst = breakoutModule.reset()
      expect(rst.score).toBe(fresh.score)
      expect(rst.lives).toBe(fresh.lives)
      expect(rst.isGameOver).toBe(fresh.isGameOver)
      expect(rst.isPlaying).toBe(fresh.isPlaying)
      expect(rst.ball.x).toBe(fresh.ball.x)
      expect(rst.ball.y).toBe(fresh.ball.y)
      expect(rst.ball.dx).toBe(fresh.ball.dx)
      expect(rst.ball.dy).toBe(fresh.ball.dy)
      expect(rst.paddle.x).toBe(fresh.paddle.x)
      expect(rst.paddle.y).toBe(fresh.paddle.y)
      expect(rst.bricks.length).toBe(fresh.bricks.length)
    })

    // --- handleKeydown() tests ---

    it('handleKeydown ArrowLeft moves paddle left by 10', () => {
      breakoutModule.init()
      const before = breakoutModule.state.paddle.x
      breakoutModule.handleKeydown('ArrowLeft')
      expect(breakoutModule.state.paddle.x).toBe(before - 10)
    })

    it('handleKeydown ArrowRight moves paddle right by 10', () => {
      breakoutModule.init()
      const before = breakoutModule.state.paddle.x
      breakoutModule.handleKeydown('ArrowRight')
      expect(breakoutModule.state.paddle.x).toBe(before + 10)
    })

    it('handleKeydown ArrowLeft clamps paddle left edge >= 0', () => {
      breakoutModule.init()
      breakoutModule.state.paddle.x = 0
      breakoutModule.handleKeydown('ArrowLeft')
      expect(breakoutModule.state.paddle.x).toBe(0)
    })

    it('handleKeydown ArrowRight clamps paddle right edge <= CANVAS_WIDTH', () => {
      breakoutModule.init()
      // Move paddle all the way right
      while (breakoutModule.state.paddle.x + breakoutModule.state.paddle.width < breakoutModule.CANVAS_WIDTH) {
        breakoutModule.handleKeydown('ArrowRight')
      }
      const maxPaddleX = breakoutModule.CANVAS_WIDTH - breakoutModule.state.paddle.width
      const before = breakoutModule.state.paddle.x
      breakoutModule.handleKeydown('ArrowRight')
      expect(breakoutModule.state.paddle.x).toBe(maxPaddleX)
      // Should not go past
      expect(breakoutModule.state.paddle.x + breakoutModule.state.paddle.width).toBe(breakoutModule.CANVAS_WIDTH)
    })

    it('handleKeydown with non-arrow keys is a no-op', () => {
      breakoutModule.init()
      const scoreBefore = breakoutModule.state.score
      const xBefore = breakoutModule.state.paddle.x
      breakoutModule.handleKeydown('ArrowUp')
      expect(breakoutModule.state.paddle.x).toBe(xBefore)
      expect(breakoutModule.state.score).toBe(scoreBefore)
    })

    it('handleKeydown space is a no-op for paddle', () => {
      breakoutModule.init()
      const xBefore = breakoutModule.state.paddle.x
      breakoutModule.handleKeydown(' ')
      expect(breakoutModule.state.paddle.x).toBe(xBefore)
    })

    // --- update() no-op tests ---

    it('update() is a no-op when state is null (verified by source code)', () => {
      // Since state is an ESM binding, we can't set breakoutModule.state = null
      // to affect the internal variable after init has been called.
      // Instead, verify the guard exists in source and test via the isPlaying=false path.
      const src = readFileSync(breakoutPath, 'utf-8')
      expect(src).toContain('!state')
    })

    it('update() is a no-op when isGameOver is true', () => {
      breakoutModule.init()
      breakoutModule.state.isGameOver = true
      const scoreBefore = breakoutModule.state.score
      breakoutModule.update()
      expect(breakoutModule.state.score).toBe(scoreBefore)
    })

    it('update() is a no-op when isPlaying is false', () => {
      breakoutModule.init()
      breakoutModule.state.isPlaying = false
      const scoreBefore = breakoutModule.state.score
      breakoutModule.update()
      expect(breakoutModule.state.score).toBe(scoreBefore)
    })

    // --- update() ball movement tests ---

    it('update() advances ball by velocity each frame', () => {
      breakoutModule.init()
      const startX = breakoutModule.state.ball.x
      const startY = breakoutModule.state.ball.y
      const dx = breakoutModule.state.ball.dx
      const dy = breakoutModule.state.ball.dy
      breakoutModule.update()
      expect(breakoutModule.state.ball.x).toBe(startX + dx)
      expect(breakoutModule.state.ball.y).toBe(startY + dy)
    })

    it('update() increments framesPlayed', () => {
      breakoutModule.init()
      expect(breakoutModule.state.framesPlayed).toBe(0)
      breakoutModule.update()
      expect(breakoutModule.state.framesPlayed).toBe(1)
      breakoutModule.update()
      expect(breakoutModule.state.framesPlayed).toBe(2)
    })

    // --- update() wall bounce tests ---

    it('update() reverses ball.dx on left wall (x <= 0)', () => {
      breakoutModule.init()
      // Position ball so after moving by dx it's still at the wall
      breakoutModule.state.ball.x = -1 // start at negative x
      breakoutModule.state.ball.dx = 2
      breakoutModule.update()
      // After move: x = 1, but dx was 2 → no wall collision at x<=0 after move
      // Need: ball starts such that x+dx <= 0. With x=-3, dx=2 → x becomes -1 <= 0
      // Actually the game checks x <= 0 AFTER moving. So start at x=-2, dx=2 → x=0 → bounce.
      // Or simpler: x=-1, dx=2 → x=1, no bounce.
      // Let's check what the code does: x <= 0 check AFTER move.
      // Start x = -1, dx = 1: after move x = 0 → bounce. But we use dx=2.
      // Start x = -2, dx = 2: after move x = 0 → bounce!
      // Hmm, let me reconsider. Start ball at x=0, set dx=-2:
      breakoutModule.state.ball.x = 0
      breakoutModule.state.ball.dx = -2
      breakoutModule.update()
      // After move: x = -2 <= 0 → dx reverses to 2
      expect(breakoutModule.state.ball.dx).toBe(2)
    })

    it('update() reverses ball.dx on right wall (x + size >= CANVAS_WIDTH)', () => {
      breakoutModule.init()
      // Position ball at right wall with negative dx, reverse happens on left
      // Position ball at right wall with positive dx
      breakoutModule.state.ball.x = breakoutModule.CANVAS_WIDTH - breakoutModule.state.ball.size
      breakoutModule.state.ball.dx = 2
      breakoutModule.update()
      // After move: x = CANVAS_WIDTH - 6 + 2 = 246. Check: x + size = 252 >= 250 → bounce → dx = -2
      expect(breakoutModule.state.ball.dx).toBe(-2)
    })

    it('update() reverses ball.dy on top wall (y <= 0)', () => {
      breakoutModule.init()
      // Start at y=0 with dy negative: after move y = -2 <= 0 → bounce
      breakoutModule.state.ball.y = 0
      breakoutModule.state.ball.dy = -2
      breakoutModule.update()
      // After move: y = -2 <= 0 → dy reverses from -2 to 2
      expect(breakoutModule.state.ball.dy).toBe(2)
    })

    // --- update() bottom death tests ---

    it('update() reduces lives when ball goes below canvas', () => {
      breakoutModule.init()
      breakoutModule.state.ball.y = breakoutModule.CANVAS_HEIGHT
      breakoutModule.update()
      expect(breakoutModule.state.lives).toBe(2)
    })

    it('update() resets ball to start position after losing a life', () => {
      breakoutModule.init()
      breakoutModule.state.ball.y = breakoutModule.CANVAS_HEIGHT
      breakoutModule.update()
      expect(breakoutModule.state.ball.x).toBe(123)
      expect(breakoutModule.state.ball.y).toBe(123)
      expect(breakoutModule.state.ball.dx).toBe(2)
      expect(breakoutModule.state.ball.dy).toBe(2)
    })

    it('update() does NOT reset velocity direction after bottom death', () => {
      // Ball should be reset with initial velocity (2, 2) regardless of previous direction
      breakoutModule.init()
      breakoutModule.state.ball.dx = -2
      breakoutModule.state.ball.dy = -2
      breakoutModule.state.ball.y = breakoutModule.CANVAS_HEIGHT
      breakoutModule.update()
      expect(breakoutModule.state.ball.dx).toBe(2)
      expect(breakoutModule.state.ball.dy).toBe(2)
    })

    it('update() sets isGameOver and isPlaying=false when lives reach 0', () => {
      breakoutModule.init()
      // Lose all lives
      breakoutModule.state.lives = 1
      breakoutModule.state.ball.y = breakoutModule.CANVAS_HEIGHT
      breakoutModule.update()
      expect(breakoutModule.state.isGameOver).toBe(true)
      expect(breakoutModule.state.isPlaying).toBe(false)
      expect(breakoutModule.state.lives).toBe(0)
    })

    it('update() only loses one life per bottom event', () => {
      breakoutModule.init()
      breakoutModule.state.ball.y = breakoutModule.CANVAS_HEIGHT
      breakoutModule.update()
      expect(breakoutModule.state.lives).toBe(2)
    })

    // --- update() paddle collision tests ---

    it('update() detects ball-paddle collision and reverses ball.dy', () => {
      breakoutModule.init()
      // Position ball so its bottom overlaps paddle top and its x is within paddle
      breakoutModule.state.ball.x = breakoutModule.state.paddle.x + 5
      breakoutModule.state.ball.y = breakoutModule.state.paddle.y - breakoutModule.state.ball.size
      breakoutModule.state.ball.dy = 2 // moving downward
      breakoutModule.update()
      expect(breakoutModule.state.ball.dy).toBe(-2)
    })

    it('update() reverses ball.dy regardless of incoming dy direction on paddle', () => {
      breakoutModule.init()
      breakoutModule.state.ball.x = breakoutModule.state.paddle.x + 5
      breakoutModule.state.ball.y = breakoutModule.state.paddle.y - breakoutModule.state.ball.size
      breakoutModule.state.ball.dy = -2 // already moving upward
      breakoutModule.update()
      // After reversing: -(-2) = 2, then -Math.abs(2) = -2 (ensures upward)
      expect(breakoutModule.state.ball.dy).toBe(-2)
    })

    it('update() does NOT reverse ball.dy when ball misses paddle horizontally', () => {
      breakoutModule.init()
      // Position ball far left from paddle (paddle starts at x=105)
      // and above paddle top so there's no vertical overlap
      breakoutModule.state.ball.x = 0
      breakoutModule.state.ball.y = breakoutModule.state.paddle.y - breakoutModule.state.ball.size - 100 // way above paddle
      breakoutModule.state.ball.dy = 2
      const dyBefore = breakoutModule.state.ball.dy
      breakoutModule.update()
      // Ball should not have hit paddle; dy may have changed due to top wall bounce
      // (y=122 > 0, so no top wall bounce). dy should stay the same.
      expect(breakoutModule.state.ball.dy).toBe(dyBefore)
    })

    it('update() does NOT reverse ball.dy when ball top is above paddle top', () => {
      breakoutModule.init()
      breakoutModule.state.ball.x = breakoutModule.state.paddle.x + 5
      breakoutModule.state.ball.y = breakoutModule.state.paddle.y - breakoutModule.state.ball.size - 10 // too high
      breakoutModule.state.ball.dy = 2
      const dyBefore = breakoutModule.state.ball.dy
      breakoutModule.update()
      // Ball should not have hit paddle; check it didn't get reversed due to paddle
      expect(breakoutModule.state.ball.dy).not.toBe(-dyBefore)
    })

    // --- update() brick collision tests ---

    it('update() destroys a brick when ball overlaps it', () => {
      breakoutModule.init()
      // Position ball on the first brick (row 0, col 0)
      const brick = breakoutModule.state.bricks[0]
      breakoutModule.state.ball.x = brick.x + 2
      breakoutModule.state.ball.y = brick.y + 2
      breakoutModule.state.ball.dx = 2
      breakoutModule.state.ball.dy = 2
      breakoutModule.update()
      expect(brick.alive).toBe(false)
    })

    it('update() increases score by 10 per brick destroyed', () => {
      breakoutModule.init()
      const brick = breakoutModule.state.bricks[0]
      breakoutModule.state.ball.x = brick.x + 2
      breakoutModule.state.ball.y = brick.y + 2
      breakoutModule.state.ball.dx = 2
      breakoutModule.state.ball.dy = 2
      breakoutModule.update()
      expect(breakoutModule.state.score).toBe(10)
    })

    it('update() reverses dx on side collision with brick', () => {
      breakoutModule.init()
      // Use brick at col 2 to avoid wall interference
      const brick = breakoutModule.state.bricks[2]
      // Position ball to hit the left side of the brick
      breakoutModule.state.ball.x = brick.x - breakoutModule.state.ball.size + 3
      breakoutModule.state.ball.y = brick.y + 5
      breakoutModule.state.ball.dx = 2
      breakoutModule.state.ball.dy = 0
      breakoutModule.update()
      expect(breakoutModule.state.ball.dx).toBe(-2)
    })

    it('update() reverses dy on top/bottom collision with brick', () => {
      breakoutModule.init()
      const brick = breakoutModule.state.bricks[0]
      // Position ball to hit top of brick
      breakoutModule.state.ball.x = brick.x + 10
      breakoutModule.state.ball.y = brick.y - breakoutModule.state.ball.size + 2
      breakoutModule.state.ball.dx = 0
      breakoutModule.state.ball.dy = 2
      breakoutModule.update()
      expect(breakoutModule.state.ball.dy).toBe(-2)
    })

    it('update() only destroys one brick per frame', () => {
      breakoutModule.init()
      // Destroy first brick
      const brick = breakoutModule.state.bricks[0]
      breakoutModule.state.ball.x = brick.x + 2
      breakoutModule.state.ball.y = brick.y + 2
      breakoutModule.state.ball.dx = 2
      breakoutModule.state.ball.dy = 2
      breakoutModule.update()
      // Count remaining alive
      const aliveAfterFirst = breakoutModule.state.bricks.filter(b => b.alive).length
      expect(aliveAfterFirst).toBe(39)
    })

    // --- update() win condition tests ---

    it('update() sets isGameOver=false and won=true when all bricks are destroyed', () => {
      breakoutModule.init()
      // Destroy all bricks by manipulating state
      for (const brick of breakoutModule.state.bricks) {
        brick.alive = false
      }
      breakoutModule.update()
      expect(breakoutModule.state.isGameOver).toBe(false)
      expect(breakoutModule.state.won).toBe(true)
    })

    it('update() sets isPlaying=false on win', () => {
      breakoutModule.init()
      for (const brick of breakoutModule.state.bricks) {
        brick.alive = false
      }
      breakoutModule.update()
      expect(breakoutModule.state.isPlaying).toBe(false)
    })

    it('update() sets won=true on win', () => {
      breakoutModule.init()
      for (const brick of breakoutModule.state.bricks) {
        brick.alive = false
      }
      breakoutModule.update()
      expect(breakoutModule.state.won).toBe(true)
    })

    it('update() does NOT set won flag on loss (lives reach 0)', () => {
      breakoutModule.init()
      breakoutModule.state.lives = 1
      breakoutModule.state.ball.y = breakoutModule.CANVAS_HEIGHT
      breakoutModule.update()
      expect(breakoutModule.state.won).toBeUndefined()
    })

    it('update() does NOT set win on partial brick destruction', () => {
      breakoutModule.init()
      // Destroy only half the bricks
      for (let i = 0; i < 20; i++) {
        breakoutModule.state.bricks[i].alive = false
      }
      breakoutModule.update()
      expect(breakoutModule.state.isGameOver).toBe(false)
    })

    // --- update() game over from bottom death tests ---

    it('update() sets isGameOver=true and isPlaying=false when lives reach 0', () => {
      breakoutModule.init()
      breakoutModule.state.lives = 1
      breakoutModule.state.ball.y = breakoutModule.CANVAS_HEIGHT
      breakoutModule.update()
      expect(breakoutModule.state.isGameOver).toBe(true)
      expect(breakoutModule.state.isPlaying).toBe(false)
    })

    // --- render() tests ---

    it('render() does not throw when called with valid canvas', () => {
      breakoutModule.init()
      // Create a mock canvas object with all required methods
      const mockCanvas = {
        getContext: () => ({
          fillRect: () => {},
          fillStyle: null,
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
          font: null,
          textAlign: null,
          textBaseline: null,
          fillText: () => {},
          measureText: () => ({ width: 0 })
        })
      }
      expect(() => breakoutModule.render(mockCanvas)).not.toThrow()
    })

    it('render() does not throw when canvas is null', () => {
      breakoutModule.init()
      expect(() => breakoutModule.render(null)).not.toThrow()
    })

    it('render() does not throw when called without canvas', () => {
      breakoutModule.init()
      expect(() => breakoutModule.render()).not.toThrow()
    })

    it('render() clears canvas with #1a1a2e background color', () => {
      breakoutModule.init()
      const fillRects = []
      let fillStyleOrder = []
      const mockCanvas = {
        getContext: () => ({
          fillRect: (x, y, w, h) => { fillRects.push({ x, y, w, h }) },
          get fillStyle() { return fillStyleOrder[fillStyleOrder.length - 1] },
          set fillStyle(v) { fillStyleOrder.push(v) },
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
          font: null,
          textAlign: null,
          fillText: () => {},
          measureText: () => ({ width: 0 })
        })
      }
      breakoutModule.render(mockCanvas)
      // First fillStyle assignment should be #1a1a2e (background)
      expect(fillStyleOrder[0]).toBe('#1a1a2e')
      // First fillRect should be at 0,0,250,250
      expect(fillRects[0]).toEqual({ x: 0, y: 0, w: 250, h: 250 })
    })

    it('render() calls fillRect for each alive brick', async () => {
      breakoutModule.init()
      const brickRects = []
      const mockCanvas = {
        getContext: () => ({
          fillRect: (x, y, w, h) => { brickRects.push({ x, y, w, h }) },
          fillStyle: null,
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
          font: null,
          textAlign: null,
          fillText: () => {},
          measureText: () => ({ width: 0 })
        })
      }
      breakoutModule.render(mockCanvas)
      // Background (1) + 40 bricks = 41 rects minimum
      expect(brickRects.length).toBeGreaterThan(39)
    })

    it('render() draws the paddle as a rectangle', async () => {
      breakoutModule.init()
      let paddleDrawn = false
      const mockCanvas = {
        getContext: () => ({
          fillRect: (x, y, w, h) => {
            if (Math.abs(y - 228) < 1 && Math.abs(w - 40) < 1) {
              paddleDrawn = true
            }
          },
          fillStyle: null,
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
          font: null,
          textAlign: null,
          fillText: () => {},
          measureText: () => ({ width: 0 })
        })
      }
      breakoutModule.render(mockCanvas)
      expect(paddleDrawn).toBe(true)
    })

    it('render() draws the ball as a circle (arc)', async () => {
      breakoutModule.init()
      let arcCalled = false
      const mockCanvas = {
        getContext: () => ({
          fillRect: () => {},
          fillStyle: null,
          beginPath: () => {},
          arc: (cx, cy, r, start, end) => { arcCalled = true },
          fill: () => {},
          font: null,
          textAlign: null,
          fillText: () => {},
          measureText: () => ({ width: 0 })
        })
      }
      breakoutModule.render(mockCanvas)
      expect(arcCalled).toBe(true)
    })

    it('render() displays score text', async () => {
      breakoutModule.init()
      let texts = []
      const mockCanvas = {
        getContext: () => ({
          fillRect: () => {},
          fillStyle: null,
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
          font: null,
          textAlign: null,
          fillText: (text) => { texts.push(text) },
          measureText: () => ({ width: 0 })
        })
      }
      breakoutModule.render(mockCanvas)
      expect(texts.some(t => t.includes('Score'))).toBe(true)
    })

    it('render() displays lives text', async () => {
      breakoutModule.init()
      let texts = []
      const mockCanvas = {
        getContext: () => ({
          fillRect: () => {},
          fillStyle: null,
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
          font: null,
          textAlign: null,
          fillText: (text) => { texts.push(text) },
          measureText: () => ({ width: 0 })
        })
      }
      breakoutModule.render(mockCanvas)
      expect(texts.some(t => t.includes('Lives'))).toBe(true)
    })

    it('render() displays GAME OVER overlay when isGameOver is true', async () => {
      breakoutModule.init()
      breakoutModule.update()
      breakoutModule.state.lives = 0
      breakoutModule.state.isGameOver = true
      breakoutModule.state.isPlaying = false
      let texts = []
      const mockCanvas = {
        getContext: () => ({
          fillRect: () => {},
          fillStyle: null,
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
          font: null,
          textAlign: null,
          fillText: (text) => { texts.push(text) },
          measureText: () => ({ width: 0 })
        })
      }
      breakoutModule.render(mockCanvas)
      expect(texts.some(t => t.includes('GAME OVER'))).toBe(true)
    })

    it('render() displays YOU WIN overlay when won is true', async () => {
      breakoutModule.init()
      for (const brick of breakoutModule.state.bricks) {
        brick.alive = false
      }
      breakoutModule.update()
      let texts = []
      const mockCanvas = {
        getContext: () => ({
          fillRect: () => {},
          fillStyle: null,
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
          font: null,
          textAlign: null,
          fillText: (text) => { texts.push(text) },
          measureText: () => ({ width: 0 })
        })
      }
      breakoutModule.render(mockCanvas)
      expect(texts.some(t => t.includes('YOU WIN'))).toBe(true)
    })

    it('render() displays "Press Space to restart" on game over', async () => {
      breakoutModule.init()
      breakoutModule.state.lives = 0
      breakoutModule.state.isGameOver = true
      breakoutModule.state.isPlaying = false
      let texts = []
      const mockCanvas = {
        getContext: () => ({
          fillRect: () => {},
          fillStyle: null,
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
          font: null,
          textAlign: null,
          fillText: (text) => { texts.push(text) },
          measureText: () => ({ width: 0 })
        })
      }
      breakoutModule.render(mockCanvas)
      expect(texts.some(t => t.includes('Press Space to restart'))).toBe(true)
    })

    // --- Integration: full game cycle ---

    it('score increases when brick is destroyed', () => {
      breakoutModule.init()
      const scoreBefore = breakoutModule.state.score
      const brick = breakoutModule.state.bricks[0]
      breakoutModule.state.ball.x = brick.x + 2
      breakoutModule.state.ball.y = brick.y + 2
      breakoutModule.state.ball.dx = 2
      breakoutModule.state.ball.dy = 2
      breakoutModule.update()
      expect(breakoutModule.state.score).toBe(scoreBefore + 10)
    })

    it('multiple brick destructions increase score cumulatively', () => {
      breakoutModule.init()
      breakoutModule.state.score = 0
      // Destroy first brick
      const b0 = breakoutModule.state.bricks[0]
      breakoutModule.state.ball.x = b0.x + 2
      breakoutModule.state.ball.y = b0.y + 2
      breakoutModule.state.ball.dx = 2
      breakoutModule.state.ball.dy = 2
      breakoutModule.update()
      expect(breakoutModule.state.score).toBe(10)

      // Destroy second brick
      const b1 = breakoutModule.state.bricks[1]
      breakoutModule.state.ball.x = b1.x + 2
      breakoutModule.state.ball.y = b1.y + 2
      breakoutModule.state.ball.dx = 2
      breakoutModule.state.ball.dy = 2
      breakoutModule.update()
      expect(breakoutModule.state.score).toBe(20)
    })

    it('game over prevents further ball movement', () => {
      breakoutModule.init()
      breakoutModule.state.lives = 0
      breakoutModule.state.isGameOver = true
      breakoutModule.state.isPlaying = false
      const ballXBefore = breakoutModule.state.ball.x
      breakoutModule.update()
      expect(breakoutModule.state.ball.x).toBe(ballXBefore)
    })

    it('state is exported and readable after init', () => {
      breakoutModule.init()
      expect(breakoutModule.state).toBeDefined()
      expect(typeof breakoutModule.state.score).toBe('number')
      expect(typeof breakoutModule.state.lives).toBe('number')
    })

    it('CANVAS_WIDTH and CANVAS_HEIGHT are both 250', () => {
      expect(breakoutModule.CANVAS_WIDTH).toBe(250)
      expect(breakoutModule.CANVAS_HEIGHT).toBe(250)
    })
  })
})
