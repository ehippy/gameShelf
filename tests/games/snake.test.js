import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..', '..')
const snakePath = join(root, 'src', 'games', 'snake', 'gameLogic.js')

// --- Static checks ---

describe('snake', () => {
  describe('Static checks', () => {
    const snakeSrc = readFileSync(snakePath, 'utf-8')

    it('exports init()', () => {
      expect(snakeSrc).toContain('export function init')
    })

    it('exports update()', () => {
      expect(snakeSrc).toContain('export function update')
    })

    it('exports render()', () => {
      expect(snakeSrc).toContain('export function render')
    })

    it('exports reset()', () => {
      expect(snakeSrc).toContain('export function reset')
    })

    it('exports state', () => {
      expect(snakeSrc).toContain('export { state }')
    })

    it('exports handleKeydown()', () => {
      expect(snakeSrc).toContain('export function handleKeydown')
    })

    it('exports CANVAS_WIDTH = 250', () => {
      expect(snakeSrc).toContain('export const CANVAS_WIDTH')
      expect(snakeSrc).toContain('250')
    })

    it('exports CANVAS_HEIGHT = 250', () => {
      expect(snakeSrc).toContain('export const CANVAS_HEIGHT')
      expect(snakeSrc).toContain('250')
    })

    it('uses 10x10 grid (GRID_COLS and GRID_ROWS = 10)', () => {
      expect(snakeSrc).toContain('GRID_COLS')
      expect(snakeSrc).toContain('GRID_ROWS')
      expect(snakeSrc).toContain('10')
    })

    it('uses CELL_SIZE for grid cells', () => {
      expect(snakeSrc).toContain('CELL_SIZE')
    })

    it('has createInitialState helper', () => {
      expect(snakeSrc).toContain('createInitialState')
    })

    it('state has score field', () => {
      expect(snakeSrc).toContain('score:')
    })

    it('state has isGameOver field', () => {
      expect(snakeSrc).toContain('isGameOver:')
    })

    it('state has isPlaying field', () => {
      expect(snakeSrc).toContain('isPlaying:')
    })

    it('state has direction field', () => {
      expect(snakeSrc).toContain('direction:')
    })

    it('state has snake field', () => {
      expect(snakeSrc).toContain('snake:')
    })

    it('state has food field', () => {
      expect(snakeSrc).toContain('food:')
    })

    it('state has framesPlayed field', () => {
      expect(snakeSrc).toContain('framesPlayed:')
    })

    it('handleKeydown handles ArrowUp', () => {
      expect(snakeSrc).toContain('ArrowUp')
    })

    it('handleKeydown handles ArrowDown', () => {
      expect(snakeSrc).toContain('ArrowDown')
    })

    it('handleKeydown handles ArrowLeft', () => {
      expect(snakeSrc).toContain('ArrowLeft')
    })

    it('handleKeydown handles ArrowRight', () => {
      expect(snakeSrc).toContain('ArrowRight')
    })

    it('rejects reverse directions', () => {
      // Must check opposite direction pairs
      expect(snakeSrc).toContain('up')
      expect(snakeSrc).toContain('down')
      expect(snakeSrc).toContain('left')
      expect(snakeSrc).toContain('right')
    })

    it('checks wall collision', () => {
      expect(snakeSrc).toContain('checkWallCollision') || expect(snakeSrc).toContain('WallCollision')
    })

    it('checks self collision', () => {
      expect(snakeSrc).toContain('checkSelfCollision') || expect(snakeSrc).toContain('SelfCollision')
    })

    it('renders with canvas context', () => {
      expect(snakeSrc).toContain("getContext('2d')")
    })

    it('renders GAME OVER overlay', () => {
      expect(snakeSrc).toContain('GAME OVER')
    })
  })

  // --- Functional tests ---

  describe('Functional tests', () => {
    let snakeModule = null

    beforeEach(async () => {
      snakeModule = await import(snakePath)
    })

    // ─── init() tests ───

    it('init() returns the state object', () => {
      const state = snakeModule.init()
      expect(state).toBeDefined()
      expect(typeof state).toBe('object')
    })

    it('init() sets state.score to 0', () => {
      const state = snakeModule.init()
      expect(typeof state.score).toBe('number')
      expect(state.score).toBe(0)
    })

    it('init() sets state.isGameOver to false', () => {
      const state = snakeModule.init()
      expect(typeof state.isGameOver).toBe('boolean')
      expect(state.isGameOver).toBe(false)
    })

    it('init() sets state.isPlaying to true', () => {
      const state = snakeModule.init()
      expect(typeof state.isPlaying).toBe('boolean')
      expect(state.isPlaying).toBe(true)
    })

    it('init() sets state.direction to "right"', () => {
      const state = snakeModule.init()
      expect(state.direction).toBe('right')
    })

    it('init() sets state.snake as array with 3 segments', () => {
      const state = snakeModule.init()
      expect(Array.isArray(state.snake)).toBe(true)
      expect(state.snake.length).toBe(3)
    })

    it('init() snake head is at {x: 2, y: 5}', () => {
      const state = snakeModule.init()
      expect(state.snake[0].x).toBe(2)
      expect(state.snake[0].y).toBe(5)
    })

    it('init() snake body segments are at {x: 1, y: 5} and {x: 0, y: 5}', () => {
      const state = snakeModule.init()
      expect(state.snake[1].x).toBe(1)
      expect(state.snake[1].y).toBe(5)
      expect(state.snake[2].x).toBe(0)
      expect(state.snake[2].y).toBe(5)
    })

    it('init() sets state.food as {x, y} object', () => {
      const state = snakeModule.init()
      expect(state.food).toBeDefined()
      expect(typeof state.food.x).toBe('number')
      expect(typeof state.food.y).toBe('number')
    })

    it('init() food is not on any snake segment', () => {
      snakeModule.init()
      const food = snakeModule.state.food
      for (const seg of snakeModule.state.snake) {
        expect(`${food.x},${food.y}`).not.toBe(`${seg.x},${seg.y}`)
      }
    })

    it('init() sets state.framesPlayed to 0', () => {
      const state = snakeModule.init()
      expect(state.framesPlayed).toBe(0)
    })

    // ─── reset() tests ───

    it('reset() restores state.score to 0', () => {
      snakeModule.init()
      snakeModule.state.score = 42
      snakeModule.reset()
      expect(snakeModule.state.score).toBe(0)
    })

    it('reset() restores state.isGameOver to false', () => {
      snakeModule.init()
      snakeModule.state.isGameOver = true
      snakeModule.reset()
      expect(snakeModule.state.isGameOver).toBe(false)
    })

    it('reset() restores state.isPlaying to true', () => {
      snakeModule.init()
      snakeModule.state.isPlaying = false
      snakeModule.reset()
      expect(snakeModule.state.isPlaying).toBe(true)
    })

    it('reset() restores state.direction to "right"', () => {
      snakeModule.init()
      snakeModule.state.direction = 'left'
      snakeModule.reset()
      expect(snakeModule.state.direction).toBe('right')
    })

    it('reset() restores state.snake to 3 segments at initial positions', () => {
      snakeModule.init()
      snakeModule.state.snake = [{ x: 9, y: 9 }]
      snakeModule.reset()
      expect(snakeModule.state.snake.length).toBe(3)
      expect(snakeModule.state.snake[0]).toEqual({ x: 2, y: 5 })
      expect(snakeModule.state.snake[1]).toEqual({ x: 1, y: 5 })
      expect(snakeModule.state.snake[2]).toEqual({ x: 0, y: 5 })
    })

    it('reset() spawns new food at a grid position', () => {
      snakeModule.init()
      snakeModule.state.score = 10
      snakeModule.reset()
      expect(snakeModule.state.food).toBeDefined()
      expect(typeof snakeModule.state.food.x).toBe('number')
      expect(typeof snakeModule.state.food.y).toBe('number')
    })

    it('reset() produces same state as a fresh init()', () => {
      const fresh = snakeModule.init()
      snakeModule.init() // call again to change state
      snakeModule.state.score = 99
      snakeModule.state.direction = 'up'
      snakeModule.state.snake = [{ x: 5, y: 5 }, { x: 5, y: 6 }]
      snakeModule.reset()
      expect(snakeModule.state.score).toBe(fresh.score)
      expect(snakeModule.state.isGameOver).toBe(fresh.isGameOver)
      expect(snakeModule.state.isPlaying).toBe(fresh.isPlaying)
      expect(snakeModule.state.direction).toBe(fresh.direction)
      expect(snakeModule.state.snake.length).toBe(fresh.snake.length)
      expect(snakeModule.state.snake[0].x).toBe(fresh.snake[0].x)
    })

    it('reset() returns the state object', () => {
      snakeModule.init()
      const result = snakeModule.reset()
      expect(result).toBeDefined()
      expect(result.score).toBe(0)
    })

    // ─── handleKeydown() tests ───

    it('handleKeydown("ArrowUp") changes direction to "up"', () => {
      snakeModule.init()
      snakeModule.handleKeydown('ArrowUp')
      expect(snakeModule.state.direction).toBe('up')
    })

    it('handleKeydown("ArrowDown") changes direction to "down"', () => {
      snakeModule.init()
      snakeModule.handleKeydown('ArrowDown')
      expect(snakeModule.state.direction).toBe('down')
    })

    it('handleKeydown("ArrowLeft") changes direction to "left"', () => {
      snakeModule.init()
      snakeModule.state.direction = 'up'
      snakeModule.handleKeydown('ArrowLeft')
      expect(snakeModule.state.direction).toBe('left')
    })

    it('handleKeydown("ArrowRight") changes direction to "right"', () => {
      snakeModule.init()
      snakeModule.state.direction = 'down'
      snakeModule.handleKeydown('ArrowRight')
      expect(snakeModule.state.direction).toBe('right')
    })

    it('handleKeydown rejects ArrowUp when moving down (180°)', () => {
      snakeModule.init()
      snakeModule.state.direction = 'down'
      snakeModule.handleKeydown('ArrowUp')
      expect(snakeModule.state.direction).toBe('down')
    })

    it('handleKeydown rejects ArrowDown when moving up (180°)', () => {
      snakeModule.init()
      snakeModule.state.direction = 'up'
      snakeModule.handleKeydown('ArrowDown')
      expect(snakeModule.state.direction).toBe('up')
    })

    it('handleKeydown rejects ArrowLeft when moving right (180°)', () => {
      snakeModule.init()
      snakeModule.state.direction = 'right'
      snakeModule.handleKeydown('ArrowLeft')
      expect(snakeModule.state.direction).toBe('right')
    })

    it('handleKeydown rejects ArrowRight when moving left (180°)', () => {
      snakeModule.init()
      snakeModule.state.direction = 'left'
      snakeModule.handleKeydown('ArrowRight')
      expect(snakeModule.state.direction).toBe('left')
    })

    it('handleKeydown ignores non-arrow keys (no direction change)', () => {
      snakeModule.init()
      const dirBefore = snakeModule.state.direction
      snakeModule.handleKeydown(' ')
      snakeModule.handleKeydown('Enter')
      snakeModule.handleKeydown('ArrowLeft')
      expect(snakeModule.state.direction).toBe(dirBefore)
    })

    it('handleKeydown is a no-op when isGameOver is true', () => {
      snakeModule.init()
      snakeModule.state.isGameOver = true
      snakeModule.handleKeydown('ArrowUp')
      expect(snakeModule.state.direction).toBe('right') // unchanged
    })

    it('handleKeydown is a no-op when isPlaying is false', () => {
      snakeModule.init()
      snakeModule.state.isPlaying = false
      snakeModule.handleKeydown('ArrowUp')
      expect(snakeModule.state.direction).toBe('right') // unchanged
    })

    it('handleKeydown allows valid direction changes (not 180°)', () => {
      snakeModule.init()
      snakeModule.handleKeydown('ArrowUp')
      expect(snakeModule.state.direction).toBe('up')
      snakeModule.handleKeydown('ArrowLeft')
      expect(snakeModule.state.direction).toBe('left')
      snakeModule.handleKeydown('ArrowDown')
      expect(snakeModule.state.direction).toBe('down')
      snakeModule.handleKeydown('ArrowRight')
      expect(snakeModule.state.direction).toBe('right')
    })

    // ─── update() movement tests ───

    it('update() increments framesPlayed each move frame', () => {
      snakeModule.init()
      expect(snakeModule.state.framesPlayed).toBe(0)
      snakeModule.update() // frame 0→1
      // After 10 updates, framesPlayed = 10
      for (let i = 1; i < 10; i++) {
        snakeModule.update()
      }
      expect(snakeModule.state.framesPlayed).toBe(10)
    })

    it('update() moves snake right by 1 cell on a move frame', () => {
      snakeModule.init()
      const headBefore = { ...snakeModule.state.snake[0] }
      // After first update: framesPlayed=1, no move (1%10≠0). After 9 more: framesPlayed=10, move occurs.
      for (let i = 0; i < 9; i++) {
        snakeModule.update()
      }
      // Now framesPlayed=9. Next update makes it 10 (a move frame).
      snakeModule.update()
      const headAfter = snakeModule.state.snake[0]
      expect(headAfter.x).toBe(headBefore.x + 1)
      expect(headAfter.y).toBe(headBefore.y)
    })

    it('update() moves snake up by 1 cell on move frame', () => {
      snakeModule.init()
      snakeModule.handleKeydown('ArrowUp')
      const headBefore = { ...snakeModule.state.snake[0] }
      for (let i = 0; i < 9; i++) {
        snakeModule.update()
      }
      snakeModule.update()
      const headAfter = snakeModule.state.snake[0]
      expect(headAfter.x).toBe(headBefore.x)
      expect(headAfter.y).toBe(headBefore.y - 1)
    })

    it('update() moves snake down by 1 cell on move frame', () => {
      snakeModule.init()
      snakeModule.handleKeydown('ArrowDown')
      const headBefore = { ...snakeModule.state.snake[0] }
      for (let i = 0; i < 9; i++) {
        snakeModule.update()
      }
      snakeModule.update()
      const headAfter = snakeModule.state.snake[0]
      expect(headAfter.x).toBe(headBefore.x)
      expect(headAfter.y).toBe(headBefore.y + 1)
    })

    it('update() moves snake left by 1 cell on move frame', () => {
      snakeModule.init()
      // The initial snake [{2,5},{1,5},{0,5}] would self-collide going left.
      // Reposition so body is going downward, then turn left to move safely.
      snakeModule.state.snake = [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 5, y: 7 }
      ]
      snakeModule.state.direction = 'up'
      snakeModule.handleKeydown('ArrowLeft')
      expect(snakeModule.state.direction).toBe('left')
      const headBefore = { ...snakeModule.state.snake[0] }
      expect(headBefore.x).toBe(5)
      // Reset framesPlayed to ensure we hit a move frame
      snakeModule.state.framesPlayed = 0
      for (let i = 0; i < 9; i++) {
        snakeModule.update()
      }
      snakeModule.update()
      const headAfter = snakeModule.state.snake[0]
      expect(headAfter.x).toBe(headBefore.x - 1)
      expect(headAfter.y).toBe(headBefore.y)
    })

    // ─── update() wall collision tests ───

    it('update() triggers game over on right wall collision', () => {
      snakeModule.init()
      snakeModule.state.direction = 'right'
      // Move snake to position head at x=9 (last valid column)
      // Snake starts with head at (2,5). After 7 move-right moves, head is at (9,5).
      for (let move = 0; move < 7; move++) {
        for (let f = 0; f < 9; f++) {
          snakeModule.update()
        }
        snakeModule.update() // this is the move frame
      }
      // Head should now be at (9,5). Next move takes it to (10,5) → wall collision.
      for (let f = 0; f < 9; f++) {
        snakeModule.update()
      }
      snakeModule.update()
      expect(snakeModule.state.isGameOver).toBe(true)
      expect(snakeModule.state.isPlaying).toBe(false)
    })

    it('update() triggers game over on left wall collision', () => {
      snakeModule.init()
      snakeModule.state.direction = 'up'
      snakeModule.handleKeydown('ArrowLeft')
      // Snake starts with head at (2,5). After 2 left moves, head at (0,5).
      for (let move = 0; move < 2; move++) {
        for (let f = 0; f < 9; f++) {
          snakeModule.update()
        }
        snakeModule.update()
      }
      // Head at (0,5). Next left move takes it to (-1,5) → wall collision.
      for (let f = 0; f < 9; f++) {
        snakeModule.update()
      }
      snakeModule.update()
      expect(snakeModule.state.isGameOver).toBe(true)
      expect(snakeModule.state.isPlaying).toBe(false)
    })

    it('update() triggers game over on top wall collision', () => {
      snakeModule.init()
      snakeModule.handleKeydown('ArrowUp')
      // Snake starts with head at (2,5). After 5 up moves, head at (2,0).
      for (let move = 0; move < 5; move++) {
        for (let f = 0; f < 9; f++) {
          snakeModule.update()
        }
        snakeModule.update()
      }
      // Next up move: head to (2,-1) → wall collision.
      for (let f = 0; f < 9; f++) {
        snakeModule.update()
      }
      snakeModule.update()
      expect(snakeModule.state.isGameOver).toBe(true)
      expect(snakeModule.state.isPlaying).toBe(false)
    })

    it('update() triggers game over on bottom wall collision', () => {
      snakeModule.init()
      snakeModule.handleKeydown('ArrowDown')
      // Snake starts with head at (2,5). After 4 down moves, head at (2,9).
      for (let move = 0; move < 4; move++) {
        for (let f = 0; f < 9; f++) {
          snakeModule.update()
        }
        snakeModule.update()
      }
      // Next down move: head to (2,10) → wall collision.
      for (let f = 0; f < 9; f++) {
        snakeModule.update()
      }
      snakeModule.update()
      expect(snakeModule.state.isGameOver).toBe(true)
      expect(snakeModule.state.isPlaying).toBe(false)
    })

    // ─── update() self collision tests ───

    it('update() triggers game over on self collision', () => {
      snakeModule.init()
      // Make a snake that will self-collide
      snakeModule.state.snake = [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 6, y: 6 },
        { x: 6, y: 5 }
      ]
      snakeModule.state.direction = 'right'
      // Place food away from collision path
      snakeModule.state.food = { x: 7, y: 5 }
      // Next move: head goes to (6,5) which overlaps body segment at index 3
      for (let f = 0; f < 9; f++) {
        snakeModule.update()
      }
      snakeModule.update()
      expect(snakeModule.state.isGameOver).toBe(true)
      expect(snakeModule.state.isPlaying).toBe(false)
    })

    // ─── update() food collision tests ───

    it('update() increments score when snake eats food', () => {
      snakeModule.init()
      const scoreBefore = snakeModule.state.score
      // Head starts at (2,5), direction is 'right'. Food at (3,5).
      snakeModule.state.food = { x: 3, y: 5 }
      // After 1 move: head goes from (2,5) to (3,5) which is the food position.
      for (let f = 0; f < 9; f++) {
        snakeModule.update()
      }
      snakeModule.update()
      expect(snakeModule.state.score).toBe(scoreBefore + 1)
    })

    it('update() grows snake by 1 when eating food (tail is not removed)', () => {
      snakeModule.init()
      const lenBefore = snakeModule.state.snake.length
      snakeModule.state.food = { x: 3, y: 5 }
      for (let f = 0; f < 9; f++) {
        snakeModule.update()
      }
      snakeModule.update()
      expect(snakeModule.state.snake.length).toBe(lenBefore + 1)
    })

    it('update() spawns new food after eating existing food', () => {
      snakeModule.init()
      // Head at (2,5), food at (3,5)
      snakeModule.state.food = { x: 3, y: 5 }
      for (let f = 0; f < 9; f++) {
        snakeModule.update()
      }
      snakeModule.update()
      const newFood = snakeModule.state.food
      // New food should be at a valid grid position
      expect(typeof newFood.x).toBe('number')
      expect(typeof newFood.y).toBe('number')
    })

    it('update() new food after eating does not spawn on snake body', () => {
      snakeModule.init()
      snakeModule.state.food = { x: 3, y: 5 }
      for (let f = 0; f < 9; f++) {
        snakeModule.update()
      }
      snakeModule.update()
      // Food should not overlap any snake segment
      const food = snakeModule.state.food
      for (const seg of snakeModule.state.snake) {
        expect(`${food.x},${food.y}`).not.toBe(`${seg.x},${seg.y}`)
      }
    })

    // ─── update() non-food movement tests ───

    it('update() moves snake correctly (head added, tail removed) when no food eaten', () => {
      snakeModule.init()
      const lenBefore = snakeModule.state.snake.length
      const headBefore = { ...snakeModule.state.snake[0] }
      const tailBefore = { ...snakeModule.state.snake[lenBefore - 1] } // save old tail BEFORE update
      // Move in a direction where food is NOT in the path
      snakeModule.state.food = { x: 0, y: 0 } // far away
      for (let f = 0; f < 9; f++) {
        snakeModule.update()
      }
      snakeModule.update()
      const headAfter = snakeModule.state.snake[0]
      const lenAfter = snakeModule.state.snake.length
      expect(lenAfter).toBe(lenBefore) // same length
      // Head moved right by 1
      expect(headAfter.x).toBe(headBefore.x + 1)
      expect(headAfter.y).toBe(headBefore.y)
      // Tail was removed - new tail is different from old tail
      expect(snakeModule.state.snake[lenAfter - 1]).not.toEqual(tailBefore)
    })

    // ─── update() guard tests ───

    it('update() is a no-op when isGameOver is true', () => {
      snakeModule.init()
      snakeModule.state.isGameOver = true
      const scoreBefore = snakeModule.state.score
      const lenBefore = snakeModule.state.snake.length
      snakeModule.update()
      expect(snakeModule.state.score).toBe(scoreBefore)
      expect(snakeModule.state.snake.length).toBe(lenBefore)
    })

    it('update() is a no-op when isPlaying is false', () => {
      snakeModule.init()
      snakeModule.state.isPlaying = false
      const scoreBefore = snakeModule.state.score
      snakeModule.update()
      expect(snakeModule.state.score).toBe(scoreBefore)
    })

    // ─── render() tests ───

    it('render() does not throw with a valid mock canvas', () => {
      snakeModule.init()
      const mockCanvas = {
        getContext: () => ({
          fillRect: () => {},
          fillStyle: null,
          strokeRect: () => {},
          strokeStyle: null,
          lineWidth: null,
          font: null,
          textAlign: null,
          fillText: () => {},
          measureText: () => ({ width: 0 })
        })
      }
      expect(() => snakeModule.render(mockCanvas)).not.toThrow()
    })

    it('render() does not throw when canvas is null', () => {
      snakeModule.init()
      expect(() => snakeModule.render(null)).not.toThrow()
    })

    it('render() does not throw when called without canvas', () => {
      snakeModule.init()
      expect(() => snakeModule.render()).not.toThrow()
    })

    it('render() sets canvas width to CANVAS_WIDTH (250)', () => {
      snakeModule.init()
      let actualWidth = null
      const mockCanvas = {
        get width() { return actualWidth },
        set width(v) { actualWidth = v },
        get height() { return null },
        set height(v) {},
        getContext: () => ({
          fillRect: () => {}, fillStyle: null, strokeRect: () => {},
          strokeStyle: null, lineWidth: null, font: null,
          textAlign: null, fillText: () => {}, measureText: () => ({ width: 0 })
        })
      }
      snakeModule.render(mockCanvas)
      expect(actualWidth).toBe(250)
    })

    it('render() sets canvas height to CANVAS_HEIGHT (250)', () => {
      snakeModule.init()
      let actualHeight = null
      const mockCanvas = {
        get width() { return 0 },
        set width(v) {},
        get height() { return actualHeight },
        set height(v) { actualHeight = v },
        getContext: () => ({
          fillRect: () => {}, fillStyle: null, strokeRect: () => {},
          strokeStyle: null, lineWidth: null, font: null,
          textAlign: null, fillText: () => {}, measureText: () => ({ width: 0 })
        })
      }
      snakeModule.render(mockCanvas)
      expect(actualHeight).toBe(250)
    })

    it('render() draws a background fillRect', () => {
      snakeModule.init()
      const fillRects = []
      const mockCanvas = {
        getContext: () => ({
          fillRect: (x, y, w, h) => { fillRects.push({ x, y, w, h }) },
          fillStyle: null, strokeRect: () => {}, strokeStyle: null,
          lineWidth: null, font: null, textAlign: null,
          fillText: () => {}, measureText: () => ({ width: 0 })
        })
      }
      snakeModule.render(mockCanvas)
      expect(fillRects.length).toBeGreaterThan(0)
    })

    it('render() draws the snake body (green colors for head and body)', () => {
      snakeModule.init()
      let fillStyleSequence = []
      const mockCanvas = {
        getContext: () => ({
          fillRect: () => {},
          get fillStyle() { return fillStyleSequence[fillStyleSequence.length - 1] },
          set fillStyle(v) { fillStyleSequence.push(v) },
          strokeRect: () => {}, strokeStyle: null,
          lineWidth: null, font: null, textAlign: null,
          fillText: () => {}, measureText: () => ({ width: 0 })
        })
      }
      snakeModule.render(mockCanvas)
      // Should have at least green colors (head + body)
      expect(fillStyleSequence.length).toBeGreaterThanOrEqual(3)
    })

    it('render() draws the food as a distinct color (red)', () => {
      snakeModule.init()
      let fillStyleSequence = []
      const mockCanvas = {
        getContext: () => ({
          fillRect: () => {},
          get fillStyle() { return fillStyleSequence[fillStyleSequence.length - 1] },
          set fillStyle(v) { fillStyleSequence.push(v) },
          strokeRect: () => {}, strokeStyle: null,
          lineWidth: null, font: null, textAlign: null,
          fillText: () => {}, measureText: () => ({ width: 0 })
        })
      }
      snakeModule.render(mockCanvas)
      expect(fillStyleSequence).toContain('#ef4444')
    })

    it('render() draws score text on canvas', () => {
      snakeModule.init()
      snakeModule.state.score = 5
      let texts = []
      const mockCanvas = {
        getContext: () => ({
          fillRect: () => {}, fillStyle: null, strokeRect: () => {},
          strokeStyle: null, lineWidth: null, font: null,
          textAlign: null, fillText: (text) => { texts.push(text) },
          measureText: () => ({ width: 0 })
        })
      }
      snakeModule.render(mockCanvas)
      expect(texts.some(t => t.includes('Score'))).toBe(true)
      expect(texts.some(t => t.includes('5'))).toBe(true)
    })

    it('render() draws GAME OVER overlay when isGameOver is true', () => {
      snakeModule.init()
      snakeModule.state.isGameOver = true
      snakeModule.state.isPlaying = false
      let texts = []
      const mockCanvas = {
        getContext: () => ({
          fillRect: () => {}, fillStyle: null, strokeRect: () => {},
          strokeStyle: null, lineWidth: null, font: null,
          textAlign: null, fillText: (text) => { texts.push(text) },
          measureText: () => ({ width: 0 })
        })
      }
      snakeModule.render(mockCanvas)
      expect(texts.some(t => t.includes('GAME OVER'))).toBe(true)
    })

    it('render() draws final score in GAME OVER overlay', () => {
      snakeModule.init()
      snakeModule.state.score = 7
      snakeModule.state.isGameOver = true
      snakeModule.state.isPlaying = false
      let texts = []
      const mockCanvas = {
        getContext: () => ({
          fillRect: () => {}, fillStyle: null, strokeRect: () => {},
          strokeStyle: null, lineWidth: null, font: null,
          textAlign: null, fillText: (text) => { texts.push(text) },
          measureText: () => ({ width: 0 })
        })
      }
      snakeModule.render(mockCanvas)
      expect(texts.some(t => t.includes('Score'))).toBe(true)
      expect(texts.some(t => t.includes('7'))).toBe(true)
    })

    it('render() uses semi-transparent overlay (rgba)', () => {
      snakeModule.init()
      snakeModule.state.isGameOver = true
      snakeModule.state.isPlaying = false
      let fillStyleSequence = []
      const mockCanvas = {
        getContext: () => ({
          fillRect: () => {},
          get fillStyle() { return fillStyleSequence[fillStyleSequence.length - 1] },
          set fillStyle(v) { fillStyleSequence.push(v) },
          strokeRect: () => {}, strokeStyle: null,
          lineWidth: null, font: null, textAlign: null,
          fillText: () => {}, measureText: () => ({ width: 0 })
        })
      }
      snakeModule.render(mockCanvas)
      expect(fillStyleSequence.some(s => s.startsWith('rgba'))).toBe(true)
    })

    // ─── state export tests ───

    it('state is exported and readable', () => {
      snakeModule.init()
      expect(snakeModule.state).toBeDefined()
      expect(typeof snakeModule.state.score).toBe('number')
      expect(typeof snakeModule.state.isGameOver).toBe('boolean')
    })

    it('state.score is readable after init', () => {
      snakeModule.init()
      expect(snakeModule.state.score).toBe(0)
    })

    it('state.isGameOver is readable after init', () => {
      snakeModule.init()
      expect(snakeModule.state.isGameOver).toBe(false)
    })

    // ─── integration: full game cycle ───

    it('full cycle: init → play → eat food → score increases → reset', () => {
      snakeModule.init()
      expect(snakeModule.state.score).toBe(0)
      snakeModule.state.food = { x: 3, y: 5 }
      for (let f = 0; f < 9; f++) {
        snakeModule.update()
      }
      snakeModule.update()
      expect(snakeModule.state.score).toBe(1)
      expect(snakeModule.state.snake.length).toBe(4)
      snakeModule.reset()
      expect(snakeModule.state.score).toBe(0)
      expect(snakeModule.state.snake.length).toBe(3)
      expect(snakeModule.state.direction).toBe('right')
      expect(snakeModule.state.isGameOver).toBe(false)
    })

    it('multiple food eats increase score cumulatively', () => {
      snakeModule.init()
      for (let i = 0; i < 3; i++) {
        const head = snakeModule.state.snake[0]
        const dir = snakeModule.state.direction
        let foodX = head.x
        let foodY = head.y
        if (dir === 'right') foodX++
        else if (dir === 'left') foodX--
        else if (dir === 'up') foodY--
        else if (dir === 'down') foodY++
        snakeModule.state.food = { x: foodX, y: foodY }
        for (let f = 0; f < 9; f++) {
          snakeModule.update()
        }
        snakeModule.update()
      }
      expect(snakeModule.state.score).toBe(3)
      expect(snakeModule.state.snake.length).toBe(6)
    })
  })
})
