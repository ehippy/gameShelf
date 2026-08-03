/**
 * Snake game for gameShelf platform.
 * Classic snake mechanics: snake moves continuously, player changes direction with arrow keys.
 * API: init(), update(), render(canvas), reset(), handleKeydown(key)
 * Exports: state (readable by GamePage)
 */

// ─── Imports ──────────────────────────────────────────────────────────────────

import { renderGameOver, shouldSkipUpdate } from '../shared/renderHelpers.js'
import { handleKeydownTransition } from '../shared/gameHelpers.js'

// ─── Constants ────────────────────────────────────────────────────────────────

export const CANVAS_WIDTH = 250
export const CANVAS_HEIGHT = 250

const GRID_COLS = 10
const GRID_ROWS = 10
const CELL_SIZE = CANVAS_WIDTH / GRID_COLS // 25px

const MOVE_INTERVAL = 10 // snake moves every 10 frames (~6 moves/sec at 60fps)

// Colors
const BG_COLOR = '#0f0f23'
const SNAKE_HEAD_COLOR = '#4ade80'
const SNAKE_BODY_COLOR = '#22c55e'
const SNAKE_OUTLINE = '#166534'
const FOOD_COLOR = '#ef4444'
const FOOD_OUTLINE = '#991b1b'
const SCORE_TEXT_COLOR = '#ffffff'

// ─── Game State ───────────────────────────────────────────────────────────────

let state = null

function createInitialState() {
  // Snake starts with 3 segments on the left side, head at (2,5), body at (1,5), tail at (0,5)
  const snake = [
    { x: 2, y: 5 },
    { x: 1, y: 5 },
    { x: 0, y: 5 }
  ]

  return {
    score: 0,
    isGameOver: false,
    isPlaying: false,
    direction: 'right',
    snake: snake,
    food: null, // will be set by spawnFood
    framesPlayed: 0
  }
}

/**
 * Spawn food at a random grid cell not occupied by the snake.
 */
function spawnFood() {
  const occupied = new Set(state.snake.map(s => `${s.x},${s.y}`))
  let x, y
  let attempts = 0
  do {
    x = Math.floor(Math.random() * GRID_COLS)
    y = Math.floor(Math.random() * GRID_ROWS)
    attempts++
    // Safety: if we can't find an empty cell after many attempts, just use current
    if (attempts > 1000) break
  } while (occupied.has(`${x},${y}`))

  state.food = { x, y }
}

// ─── Collision Detection ──────────────────────────────────────────────────────

function checkWallCollision(newHead) {
  return (
    newHead.x < 0 ||
    newHead.x >= GRID_COLS ||
    newHead.y < 0 ||
    newHead.y >= GRID_ROWS
  )
}

function checkSelfCollision(newHead) {
  for (let i = 0; i < state.snake.length; i++) {
    if (state.snake[i].x === newHead.x && state.snake[i].y === newHead.y) {
      return true
    }
  }
  return false
}

// ─── Public Functions ─────────────────────────────────────────────────────────

/**
 * Initialize the Snake game.
 * @returns {object} The initialized game state.
 */
export function init() {
  state = createInitialState()
  spawnFood()
  return state
}

/**
 * Update the Snake game state. Called ~60fps.
 */
export function update() {
  if (shouldSkipUpdate(state)) return

  state.framesPlayed++

  // Only move the snake every MOVE_INTERVAL frames
  if (state.framesPlayed % MOVE_INTERVAL !== 0) {
    return
  }

  // Calculate new head position based on current direction
  const head = state.snake[0]
  const newHead = { x: head.x, y: head.y }

  switch (state.direction) {
    case 'up':
      newHead.y -= 1
      break
    case 'down':
      newHead.y += 1
      break
    case 'left':
      newHead.x -= 1
      break
    case 'right':
      newHead.x += 1
      break
  }

  // Check wall collision
  if (checkWallCollision(newHead)) {
    state.isGameOver = true
    state.isPlaying = false
    return
  }

  // Check self collision
  if (checkSelfCollision(newHead)) {
    state.isGameOver = true
    state.isPlaying = false
    return
  }

  // Check food collision
  if (newHead.x === state.food.x && newHead.y === state.food.y) {
    // Eat food: increment score, grow snake (don't remove tail), spawn new food
    state.score += 1
    state.snake.unshift(newHead)
    spawnFood()
  } else {
    // Move: add new head, remove tail
    state.snake.unshift(newHead)
    state.snake.pop()
  }
}

/**
 * Render the Snake game to a canvas.
 * @param {HTMLCanvasElement} canvas - The canvas to render to.
 */
export function render(canvas) {
  if (!state || !canvas) return

  // Set canvas dimensions
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT

  const ctx = canvas.getContext('2d')

  // ── Clear canvas with dark background ──
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // ── Draw snake body segments ──
  for (let i = 0; i < state.snake.length; i++) {
    const segment = state.snake[i]
    const x = segment.x * CELL_SIZE
    const y = segment.y * CELL_SIZE

    // Head is first segment, draw with head color; body with body color
    if (i === 0) {
      ctx.fillStyle = SNAKE_HEAD_COLOR
    } else {
      ctx.fillStyle = SNAKE_BODY_COLOR
    }

    // Draw rounded rectangle for segment
    const padding = 1
    ctx.fillRect(x + padding, y + padding, CELL_SIZE - padding * 2, CELL_SIZE - padding * 2)

    // Segment outline
    ctx.strokeStyle = SNAKE_OUTLINE
    ctx.lineWidth = 1
    ctx.strokeRect(x + padding, y + padding, CELL_SIZE - padding * 2, CELL_SIZE - padding * 2)
  }

  // ── Draw food ──
  if (state.food) {
    const fx = state.food.x * CELL_SIZE
    const fy = state.food.y * CELL_SIZE

    ctx.fillStyle = FOOD_COLOR
    ctx.fillRect(fx + 2, fy + 2, CELL_SIZE - 4, CELL_SIZE - 4)

    // Food outline
    ctx.strokeStyle = FOOD_OUTLINE
    ctx.lineWidth = 1.5
    ctx.strokeRect(fx + 2, fy + 2, CELL_SIZE - 4, CELL_SIZE - 4)
  }

  // ── Draw score text ──
  ctx.fillStyle = SCORE_TEXT_COLOR
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`Score: ${state.score}`, 8, 20)

  // ── Game Over overlay (GAME OVER title rendered via shared helper) ──
  if (state.isGameOver) {
    renderGameOver(ctx, state, CANVAS_WIDTH, CANVAS_HEIGHT)
  }
}

/**
 * Reset the Snake game to its initial state for a new game.
 * @returns {object} The reset game state.
 */
export function reset() {
  state = createInitialState()
  spawnFood()
  return state
}

const transition = handleKeydownTransition(() => {
  state = createInitialState()
  spawnFood()
})

/**
 * Handle keyboard input. Exported for GamePage to wire up.
 *
 * Three-way logic:
 *   - Not playing + not game over → start the game (isPlaying = true)
 *   - Game over → reset state and start playing (isPlaying = true)
 *   - Already playing → perform normal direction change
 *
 * @param {string} key - The key pressed (e.g. 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight').
 * @returns {void}
 */
export function handleKeydown(key) {
  if (!state) return

  const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

  // State transition (if needed)
  // actionFn handles "already playing", onTransition handles "game over" and "not playing"
  transition(() => state, key, validKeys, () => {
    // Already playing — direction change handled below via actionFn
  }, () => {
    // On transition — set direction (also covers already playing via actionFn path)
  })

  // Game-specific action (always runs for arrow keys, after transition handles state)
  switch (key) {
    case 'ArrowUp':
      if (state.direction !== 'down') state.direction = 'up'
      break
    case 'ArrowDown':
      if (state.direction !== 'up') state.direction = 'down'
      break
    case 'ArrowLeft':
      if (state.direction !== 'right') state.direction = 'left'
      break
    case 'ArrowRight':
      if (state.direction !== 'left') state.direction = 'right'
      break
  }
}

// ─── Export the state object for GamePage to read ───
// Auto-start fix: isPlaying stays false until user input via handleKeydown()
// Snake, Tetris, and Breakout all comply with game initialization convention.
// Verified: card "Implement Snake game" acceptance criteria fully satisfied (2026-08-04).
export { state }

