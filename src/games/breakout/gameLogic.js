/**
 * Breakout game for gameShelf platform.
 * Classic paddle/ball/brick arcade game.
 * API: init(), update(), render(canvas), reset(), handleKeydown(key)
 * Exports: state (readable by GamePage)
 */

// ─── Imports ──────────────────────────────────────────────────────────────────

import { renderGameOver, shouldSkipUpdate } from '../shared/renderHelpers.js'
import { handleKeydownTransition } from '../shared/gameHelpers.js'

// ─── Constants ────────────────────────────────────────────────────────────────

export const CANVAS_WIDTH = 250
export const CANVAS_HEIGHT = 250

const BRICK_ROWS = 4
const BRICK_COLS = 10
const BRICK_WIDTH = 23
const BRICK_HEIGHT = 15
const BRICK_SPACING = 2
const BRICK_TOP_Y = 25
const BRICK_LEFT_PAD = 1 // (250 - 10*23 - 9*2) / 2 = 248/2 = 1

const BALL_SIZE = 6
const BALL_START_X = 123
const BALL_START_Y = 123
const BALL_INIT_DX = 2
const BALL_INIT_DY = 2

const PADDLE_WIDTH = 40
const PADDLE_HEIGHT = 8
const PADDLE_Y = 228
const PADDLE_SPEED = 10

const STARTING_LIVES = 3
const POINTS_PER_BRICK = 10

const BRICK_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12']

// ─── Game State ───────────────────────────────────────────────────────────────

let state = null

// Gamepad state tracking to prevent repeated triggering
let gamepadState = {
  dpadUpPressed: false,
  dpadDownPressed: false,
  dpadLeftPressed: false,
  dpadRightPressed: false,
  aButtonPressed: false,
  bButtonPressed: false
}

function createInitialState() {
  return {
    score: 0,
    lives: STARTING_LIVES,
    isGameOver: false,
    isPlaying: false,
    ball: {
      x: BALL_START_X,
      y: BALL_START_Y,
      dx: BALL_INIT_DX,
      dy: BALL_INIT_DY,
      size: BALL_SIZE
    },
    paddle: {
      x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
      y: PADDLE_Y,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: PADDLE_SPEED
    },
    bricks: buildBricks(),
    framesPlayed: 0,
    won: false, // ensures reset() clears stale win state (card: Breakout won flag persistence)
    gamepadConnected: false
  }
}

function buildBricks() {
  const bricks = []
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: BRICK_LEFT_PAD + c * (BRICK_WIDTH + BRICK_SPACING),
        y: BRICK_TOP_Y + r * (BRICK_HEIGHT + BRICK_SPACING),
        color: BRICK_COLORS[r],
        alive: true,
        row: r,
        col: c
      })
    }
  }
  return bricks
}

// ─── Public Functions ─────────────────────────────────────────────────────────

/**
 * Initialize the Breakout game.
 */
export function init() {
  state = createInitialState()
  return state
}

/**
 * Update the Breakout game state. Called ~60fps.
 */
export function update() {
  if (shouldSkipUpdate(state)) return

  state.framesPlayed++

  const ball = state.ball
  const paddle = state.paddle

  // ── Move ball ──
  ball.x += ball.dx
  ball.y += ball.dy

  // ── Wall bounces: top ──
  if (ball.y <= 0) {
    ball.dy = -ball.dy
  }

  // ── Wall bounces: left and right ──
  if (ball.x <= 0) {
    ball.dx = -ball.dx
  }
  if (ball.x + ball.size >= CANVAS_WIDTH) {
    ball.dx = -ball.dx
  }

  // ── Bottom death ──
  if (ball.y + ball.size >= CANVAS_HEIGHT) {
    state.lives--
    if (state.lives > 0) {
      // Reset ball to center with initial velocity
      ball.x = BALL_START_X
      ball.y = BALL_START_Y
      ball.dx = BALL_INIT_DX
      ball.dy = BALL_INIT_DY
    } else {
      state.isGameOver = true
      state.isPlaying = false
    }
    return
  }

  // ── Paddle collision ──
  const ballBottom = ball.y + ball.size
  const ballRight = ball.x + ball.size
  const paddleBottom = paddle.y + paddle.height
  const paddleRight = paddle.x + paddle.width

  if (
    ballBottom >= paddle.y &&
    ball.y <= paddleBottom &&
    ballRight >= paddle.x &&
    ball.x <= paddleRight
  ) {
    ball.dy = -Math.abs(ball.dy) // ensure upward movement
  }

  // ── Brick collision ──
  for (const brick of state.bricks) {
    if (!brick.alive) continue

    const brickRight = brick.x + BRICK_WIDTH
    const brickBottom = brick.y + BRICK_HEIGHT

    // AABB check
    if (
      ball.x < brickRight &&
      ball.x + ball.size > brick.x &&
      ball.y < brickBottom &&
      ball.y + ball.size > brick.y
    ) {
      brick.alive = false
      state.score += POINTS_PER_BRICK

      // Determine collision face and reverse appropriate velocity
      // Calculate overlap on each axis
      const overlapLeft = ballRight - brick.x
      const overlapRight = brickRight - ball.x
      const overlapTop = ballBottom - brick.y
      const overlapBottom = brickBottom - ball.y

      const minOverlapX = Math.min(overlapLeft, overlapRight)
      const minOverlapY = Math.min(overlapTop, overlapBottom)

      if (minOverlapX < minOverlapY) {
        // Hit from side → reverse dx
        ball.dx = -ball.dx
      } else {
        // Hit from top/bottom → reverse dy
        ball.dy = -ball.dy
      }

      break // only one brick per frame
    }
  }

  // ── Win condition ──
  const anyBrickAlive = state.bricks.some(b => b.alive)
  if (!anyBrickAlive) {
    state.isGameOver = false
    state.isPlaying = false
    state.won = true
    return
  }
}

/**
 * Render the Breakout game to a canvas.
 * @param {HTMLCanvasElement} canvas - The canvas to render to.
 */
export function render(canvas) {
  if (!state || !canvas) return

  const ctx = canvas.getContext('2d')

  // Clear canvas with dark background
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // ── Draw bricks ──
  for (const brick of state.bricks) {
    if (!brick.alive) continue
    ctx.fillStyle = brick.color
    ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT)
  }

  // ── Draw paddle ──
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(state.paddle.x, state.paddle.y, state.paddle.width, state.paddle.height)

  // ── Draw ball ──
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(
    state.ball.x + state.ball.size / 2,
    state.ball.y + state.ball.size / 2,
    state.ball.size / 2,
    0,
    Math.PI * 2
  )
  ctx.fill()

  // ── Draw score and lives ──
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`Score: ${state.score}`, 4, CANVAS_HEIGHT - 6)

  ctx.textAlign = 'right'
  ctx.fillText(`Lives: ${state.lives}`, CANVAS_WIDTH - 4, CANVAS_HEIGHT - 6)

  // ── Game Over overlay ──
  if (state.isGameOver || state.won) {
    renderGameOver(ctx, state, CANVAS_WIDTH, CANVAS_HEIGHT, {
      overlayColor: 'rgba(0, 0, 0, 0.7)',
      title: state.won ? 'YOU WIN!' : 'GAME OVER',
      titleColor: state.won ? '#2ecc71' : '#ff4444',
      titleFont: 'bold 24px sans-serif',
      titleY: CANVAS_HEIGHT / 2 - 10,
      scoreFont: '14px sans-serif',
      scoreY: CANVAS_HEIGHT / 2 + 20,
      showRestartPrompt: true,
      restartPromptY: CANVAS_HEIGHT / 2 + 45
    })
  }
}

/**
 * Reset the Breakout game to its initial state for a new game.
 */
export function reset() {
  state = createInitialState()
  return state
}

const transition = handleKeydownTransition(() => {
  Object.assign(state, createInitialState())
})

/**
 * Handle keyboard input. Exported for GamePage to wire up.
 *
 * Three-way logic:
 *   - Not playing + not game over → start the game (isPlaying = true)
 *   - Game over → reset state and start playing (isPlaying = true)
 *   - Already playing → perform normal paddle movement
 *
 * @param {string} key - The key pressed (e.g. 'ArrowLeft', 'ArrowRight').
 * @returns {void}
 */
export function handleKeydown(key) {
  if (!state) return

  const validKeys = ['ArrowLeft', 'ArrowRight']

  // State transition
  transition(state, key, validKeys, () => {
    // Already playing — action handled below
  })

  // Game-specific action
  if (key === 'ArrowLeft') {
    state.paddle.x -= PADDLE_SPEED
    if (state.paddle.x < 0) {
      state.paddle.x = 0
    }
  } else if (key === 'ArrowRight') {
    state.paddle.x += PADDLE_SPEED
    if (state.paddle.x + state.paddle.width > CANVAS_WIDTH) {
      state.paddle.x = CANVAS_WIDTH - state.paddle.width
    }
  }
}

// ─── Export the state object for GamePage to read ───
// Auto-start fix verified: 2025-07-10 — card "Fix auto-start violations in Snake, Tetris, and Breakout" complete.
// All three games comply with game initialization convention: isPlaying: false on init/reset, three-way handleKeydown.
export { state }
