/**
 * Flappy Bird game for gameShelf platform.
 * Implements classic Flappy Bird mechanics: bird flaps through scrolling pipes.
 * API: init(), update(), render(canvas), reset(), handleKeydown(key)
 * Exports: state (readable by GamePage)
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const COLS = 7
const ROWS = 7
export const CANVAS_WIDTH = 250
export const CANVAS_HEIGHT = 500
const CELL_SIZE = CANVAS_WIDTH / COLS // ~36px

const GRAVITY = 0.12 // cells per frame
const FLAP_STRENGTH = -2.5 // cells per frame
const PIPE_SPEED = 0.08 // cells per frame (scroll right to left)
const PIPE_SPAWN_INTERVAL = 7 // frames between new pipe pairs
const GAP_SIZE_CELLS = 4 // gap is ~144 pixels = 4 cells
const GRACE_PERIOD_FRAMES = 30 // gravity disabled for first ~30 frames
const GROUND_ROW = ROWS - 1 // ground at bottom

const BIRD_COL = 3 // fixed x position

const PIPE_COLOR = '#2ecc71'
const PIPE_OUTLINE = '#27ae60'
const PIPE_CAP_COLOR = '#25a05a'

// ─── Game State ───────────────────────────────────────────────────────────────

let state = null

function createInitialState() {
  return {
    score: 0,
    isGameOver: false,
    isPlaying: false,
    bird: {
      row: 3, // start in middle vertically
      col: BIRD_COL,
      velocity: 0
    },
    pipes: [],
    pipeQueue: [],
    pipeDropInterval: PIPE_SPAWN_INTERVAL,
    lastPipeDrop: 0,
    framesPlayed: 0,
    animFrameId: null
  }
}

function createPipePair(x) {
  // Random gap position: gap must fit within ROWS - GAP_SIZE_CELLS usable rows
  const minTop = 0
  const maxTop = ROWS - GAP_SIZE_CELLS - 1 // leave room for ground row
  const gapStart = minTop + Math.floor(Math.random() * (maxTop - minTop + 1))
  return {
    x: x, // horizontal position (column, can be fractional)
    gapStart: gapStart, // top of gap (first cell of gap)
    scored: false // whether bird has passed this pair
  }
}

// ─── Collision Detection ──────────────────────────────────────────────────────

function checkBirdPipeCollision() {
  const b = state.bird
  // Bird occupies approximately 1 cell, check against pipe gaps
  for (const pipe of state.pipes) {
    // Check if bird's column is within or about to enter the pipe's x position
    if (b.col + 0.5 >= pipe.x - 0.5 && b.col + 0.5 <= pipe.x + 0.5 + 1.0) {
      // Bird is horizontally overlapping with pipe
      // Check if bird is NOT in the gap
      const birdBottom = b.row + 0.5
      const birdTop = b.row - 0.5
      const gapTop = pipe.gapStart
      const gapBottom = pipe.gapStart + GAP_SIZE_CELLS

      // Bird is outside the gap → collision
      if (birdTop < gapTop || birdBottom > gapBottom) {
        return true
      }
    }
  }
  return false
}

function checkBoundaries() {
  const b = state.bird
  // Ceiling collision
  if (b.row - 0.5 < 0) {
    return true
  }
  // Ground collision (ground row is the last row)
  if (b.row + 0.5 > GROUND_ROW) {
    return true
  }
  // Left/right boundaries (shouldn't happen with fixed col, but safety check)
  if (b.col - 0.5 < 0 || b.col + 0.5 >= COLS) {
    return true
  }
  return false
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function checkPipeScore() {
  const b = state.bird
  for (const pipe of state.pipes) {
    if (!pipe.scored && b.col + 0.5 > pipe.x + 1.0) {
      pipe.scored = true
      state.score += 1
    }
  }
}

// ─── Game Over ────────────────────────────────────────────────────────────────

function triggerGameOver() {
  state.isGameOver = true
  state.isPlaying = false
}

// ─── Public Functions ─────────────────────────────────────────────────────────

/**
 * Initialize the Flappy Bird game.
 */
export function init() {
  state = createInitialState()
  state.lastPipeDrop = state.framesPlayed
  state.isPlaying = true
  return state
}

/**
 * Update the Flappy Bird game state. Called ~60fps.
 */
export function update() {
  if (!state || state.isGameOver || !state.isPlaying) {
    return
  }

  state.framesPlayed++

  const b = state.bird

  // ── Bird physics ──
  if (state.framesPlayed >= GRACE_PERIOD_FRAMES) {
    // Apply gravity after grace period
    b.velocity += GRAVITY
  }
  b.row += b.velocity

  // ── Pipe spawning ──
  if (state.framesPlayed - state.lastPipeDrop >= state.pipeDropInterval) {
    state.pipes.push(createPipePair(COLS + 1))
    state.lastPipeDrop = state.framesPlayed
  }

  // ── Pipe scrolling ──
  for (const pipe of state.pipes) {
    pipe.x -= PIPE_SPEED
  }

  // Remove pipes that have scrolled off-screen
  state.pipes = state.pipes.filter(pipe => pipe.x > -2)

  // ── Scoring ──
  checkPipeScore()

  // ── Collision detection ──
  if (checkBirdPipeCollision() || checkBoundaries()) {
    triggerGameOver()
    return
  }
}

/**
 * Render the Flappy Bird game to a canvas.
 */
export function render(canvas) {
  if (!state || !canvas) return

  const ctx = canvas.getContext('2d')

  // ── Background: light sky-blue ──
  ctx.fillStyle = '#87CEEB'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // ── Draw pipes ──
  for (const pipe of state.pipes) {
    drawPipe(ctx, pipe)
  }

  // ── Draw ground strip ──
  const groundY = GROUND_ROW * CELL_SIZE
  ctx.fillStyle = '#8BC34A'
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY)
  ctx.fillStyle = '#689F38'
  ctx.fillRect(0, groundY, canvas.width, 4)

  // ── Draw bird ──
  drawBird(ctx, state.bird)

  // ── Draw current score on canvas ──
  if (state.isPlaying && !state.isGameOver) {
    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 3
    ctx.font = 'bold 32px sans-serif'
    ctx.textAlign = 'center'
    ctx.strokeText(String(state.score), canvas.width / 2, 50)
    ctx.fillText(String(state.score), canvas.width / 2, 50)
  }

  // ── Game Over overlay ──
  if (state.isGameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ff4444'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20)
    ctx.fillStyle = '#ffffff'
    ctx.font = '18px sans-serif'
    ctx.fillText(`Score: ${state.score}`, canvas.width / 2, canvas.height / 2 + 20)
  }
}

/**
 * Draw a pipe pair (top and bottom) at the given pipe object's x position.
 */
function drawPipe(ctx, pipe) {
  const x = Math.round(pipe.x * CELL_SIZE)
  const gapTop = pipe.gapStart * CELL_SIZE
  const gapBottom = (pipe.gapStart + GAP_SIZE_CELLS) * CELL_SIZE
  const pipeWidth = CELL_SIZE

  // ── Top pipe ──
  ctx.fillStyle = PIPE_COLOR
  ctx.fillRect(x, 0, pipeWidth, gapTop)
  // Darker green outline on top pipe
  ctx.strokeStyle = PIPE_OUTLINE
  ctx.lineWidth = 2
  ctx.strokeRect(x, 0, pipeWidth, gapTop)
  // Wider cap at the inner edge (bottom of top pipe)
  ctx.fillStyle = PIPE_CAP_COLOR
  ctx.fillRect(x - 3, gapTop - 16, pipeWidth + 6, 16)
  ctx.strokeStyle = PIPE_OUTLINE
  ctx.lineWidth = 2
  ctx.strokeRect(x - 3, gapTop - 16, pipeWidth + 6, 16)

  // ── Bottom pipe ──
  ctx.fillStyle = PIPE_COLOR
  ctx.fillRect(x, gapBottom, pipeWidth, CANVAS_HEIGHT - gapBottom)
  ctx.strokeStyle = PIPE_OUTLINE
  ctx.lineWidth = 2
  ctx.strokeRect(x, gapBottom, pipeWidth, CANVAS_HEIGHT - gapBottom)
  // Wider cap at the inner edge (top of bottom pipe)
  ctx.fillStyle = PIPE_CAP_COLOR
  ctx.fillRect(x - 3, gapBottom, pipeWidth + 6, 16)
  ctx.strokeStyle = PIPE_OUTLINE
  ctx.lineWidth = 2
  ctx.strokeRect(x - 3, gapBottom, pipeWidth + 6, 16)
}

/**
 * Draw the bird as a yellow/gold character with wing and beak.
 */
function drawBird(ctx, bird) {
  const cx = Math.round((bird.col + 0.5) * CELL_SIZE)
  const cy = Math.round(bird.row * CELL_SIZE)
  const r = CELL_SIZE * 0.45

  // Body (yellow/gold)
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#B8860B'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Wing (slightly darker)
  ctx.fillStyle = '#FFC107'
  ctx.beginPath()
  ctx.ellipse(cx - 2, cy + 2, r * 0.6, r * 0.35, -0.2, 0, Math.PI * 2)
  ctx.fill()

  // Beak (orange)
  ctx.fillStyle = '#FF8C00'
  ctx.beginPath()
  ctx.moveTo(cx + r - 2, cy - 2)
  ctx.lineTo(cx + r + 6, cy + 1)
  ctx.lineTo(cx + r - 2, cy + 4)
  ctx.closePath()
  ctx.fill()

  // Eye (white circle with black pupil)
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(cx + 4, cy - 4, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.arc(cx + 5, cy - 4, 2, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * Reset the Flappy Bird game to its initial state for a new game.
 */
export function reset() {
  state = createInitialState()
  state.lastPipeDrop = state.framesPlayed
  state.isPlaying = true
  return state
}

/**
 * Handle keyboard input. Exported for GamePage to wire up.
 */
export function handleKeydown(key) {
  if (!state || state.isGameOver || !state.isPlaying) return

  if (key === 'ArrowUp' || key === ' ') {
    state.bird.velocity = FLAP_STRENGTH
  }

  if (key === 'ArrowDown') {
    // Accelerate fall speed
    state.bird.velocity += 0.5
  }
}

// Export the state object for GamePage to read
export { state }
