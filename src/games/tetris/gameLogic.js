/**
 * Tetris game logic for gameShelf platform.
 * Implements standard Tetris with 7 tetrominoes, line clearing, scoring, leveling.
 * API: init(), update(), render(canvas), reset(), handleKeydown(key)
 * Exports: state (readable by GamePage)
 */

// ─── Imports ──────────────────────────────────────────────────────────────────

import { renderGameOver } from '../shared/renderHelpers.js'

// ─── Tetromino Definitions ────────────────────────────────────────────────────

const COLS = 10
const ROWS = 20
export const CANVAS_WIDTH = 300
export const CANVAS_HEIGHT = 400

const TETROMINOES = {
  I: {
    shape: [[0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]],
    color: '#00f0f0'
  },
  O: {
    shape: [[1, 1],
            [1, 1]],
    color: '#f0f000'
  },
  T: {
    shape: [[0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]],
    color: '#a000f0'
  },
  S: {
    shape: [[0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]],
    color: '#00f000'
  },
  Z: {
    shape: [[1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]],
    color: '#f00000'
  },
  J: {
    shape: [[1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]],
    color: '#0000f0'
  },
  L: {
    shape: [[0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]],
    color: '#f0a000'
  }
}

const PIECE_TYPES = Object.keys(TETROMINOES)

// Scoring: lines → points
const LINE_SCORES = [0, 100, 300, 500, 800]

// ─── Game State ───────────────────────────────────────────────────────────────

let state = null

function createInitialState() {
  return {
    board: createBoard(),
    score: 0,
    level: 1,
    lines: 0,
    isGameOver: false,
    isPlaying: false,
    currentPiece: null,
    nextPiece: null,
    bag: [],
    dropInterval: 1000,   // ms between automatic drops at level 1
    lastDropTime: 0,
    animFrameId: null
  }
}

function createBoard() {
  const board = []
  for (let r = 0; r < ROWS; r++) {
    board.push(new Array(COLS).fill(null))
  }
  return board
}

// ─── Random Bag ───────────────────────────────────────────────────────────────

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function fillBag() {
  const bag = [...PIECE_TYPES]
  return shuffle(bag)
}

function getNextPieceType() {
  if (state.bag.length === 0) {
    state.bag = fillBag()
  }
  return state.bag.pop()
}

// ─── Piece Creation ───────────────────────────────────────────────────────────

function createPiece(type) {
  const def = TETROMINOES[type]
  const shape = def.shape.map(row => [...row])
  const col = Math.floor((COLS - shape[0].length) / 2)
  const row = 0
  return {
    type,
    shape,
    color: def.color,
    row,
    col
  }
}

// ─── Collision Detection ──────────────────────────────────────────────────────

function isValidPosition(board, shape, row, col) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const newR = row + r
        const newC = col + c
        if (newR < 0 || newR >= ROWS || newC < 0 || newC >= COLS) {
          return false
        }
        if (board[newR][newC] !== null) {
          return false
        }
      }
    }
  }
  return true
}

// ─── Rotation ─────────────────────────────────────────────────────────────────

function rotatePiece(piece) {
  const n = piece.shape.length
  const rotated = []
  for (let r = 0; r < n; r++) {
    rotated.push([])
    for (let c = 0; c < n; c++) {
      rotated[r][c] = piece.shape[n - 1 - c][r]
    }
  }
  return { ...piece, shape: rotated }
}

// ─── Line Clearing ────────────────────────────────────────────────────────────

function clearLines() {
  let linesCleared = 0
  for (let r = ROWS - 1; r >= 0; r--) {
    if (state.board[r].every(cell => cell !== null)) {
      state.board.splice(r, 1)
      state.board.unshift(new Array(COLS).fill(null))
      linesCleared++
      r++ // recheck this row since rows shifted down
    }
  }
  if (linesCleared > 0) {
    state.lines += linesCleared
    state.score += LINE_SCORES[linesCleared] * state.level
    const newLevel = Math.floor(state.lines / 10) + 1
    if (newLevel !== state.level) {
      state.level = newLevel
      // Speed up: 1000ms at level 1, decreasing by 80ms per level, min 100ms
      state.dropInterval = Math.max(100, 1000 - (state.level - 1) * 80)
    }
  }
  return linesCleared
}

// ─── Lock Piece ───────────────────────────────────────────────────────────────

function lockPiece() {
  const { shape, row, col, color } = state.currentPiece
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const boardR = row + r
        const boardC = col + c
        if (boardR >= 0 && boardR < ROWS && boardC >= 0 && boardC < COLS) {
          state.board[boardR][boardC] = color
        }
      }
    }
  }
  clearLines()
  spawnPiece()
}

// ─── Spawn Piece ──────────────────────────────────────────────────────────────

function spawnPiece() {
  const type = state.nextPiece ? state.nextPiece.type : getNextPieceType()
  state.nextPiece = createPiece(getNextPieceType())
  state.currentPiece = createPiece(type)

  if (!isValidPosition(state.board, state.currentPiece.shape, state.currentPiece.row, state.currentPiece.col)) {
    state.isGameOver = true
    return
  }
}

// ─── Hard Drop ────────────────────────────────────────────────────────────────

function hardDrop() {
  let dropped = 0
  while (isValidPosition(state.board, state.currentPiece.shape, state.currentPiece.row + 1, state.currentPiece.col)) {
    state.currentPiece.row++
    dropped++
  }
  state.score += dropped * 2 // hard drop bonus
  lockPiece()
}

// ─── Public Functions ─────────────────────────────────────────────────────────

/**
 * Initialize the Tetris game.
 */
export function init() {
  state = createInitialState()
  state.bag = fillBag()
  state.nextPiece = createPiece(getNextPieceType())
  spawnPiece()
  state.lastDropTime = performance.now()
  return state
}

/**
 * Update the Tetris game state. Called ~60fps.
 */
export function update() {
  if (!state || state.isGameOver || !state.isPlaying) {
    return
  }

  const now = performance.now()
  if (now - state.lastDropTime >= state.dropInterval) {
    state.lastDropTime = now

    // Try to move down
    if (isValidPosition(state.board, state.currentPiece.shape, state.currentPiece.row + 1, state.currentPiece.col)) {
      state.currentPiece.row++
    } else {
      // Can't move down — lock
      lockPiece()
      state.lastDropTime = performance.now()
    }
  }
}

/**
 * Render the Tetris game to a canvas.
 */
export function render(canvas) {
  if (!state || !canvas) return

  const ctx = canvas.getContext('2d')
  const cellSize = canvas.width / COLS

  // Clear canvas
  ctx.fillStyle = '#111122'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw grid lines (subtle)
  ctx.strokeStyle = '#222244'
  ctx.lineWidth = 0.5
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath()
    ctx.moveTo(c * cellSize, 0)
    ctx.lineTo(c * cellSize, canvas.height)
    ctx.stroke()
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath()
    ctx.moveTo(0, r * cellSize)
    ctx.lineTo(canvas.width, r * cellSize)
    ctx.stroke()
  }

  // Draw locked blocks
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (state.board[r][c]) {
        drawCell(ctx, c, r, cellSize, state.board[r][c])
      }
    }
  }

  // Draw ghost piece (where the current piece will land)
  if (state.currentPiece && !state.isGameOver) {
    let ghostRow = state.currentPiece.row
    while (isValidPosition(state.board, state.currentPiece.shape, ghostRow + 1, state.currentPiece.col)) {
      ghostRow++
    }
    ctx.globalAlpha = 0.2
    for (let r = 0; r < state.currentPiece.shape.length; r++) {
      for (let c = 0; c < state.currentPiece.shape[r].length; c++) {
        if (state.currentPiece.shape[r][c]) {
          drawCell(ctx, state.currentPiece.col + c, ghostRow + r, cellSize, state.currentPiece.color)
        }
      }
    }
    ctx.globalAlpha = 1.0
  }

  // Draw current piece
  if (state.currentPiece && !state.isGameOver) {
    for (let r = 0; r < state.currentPiece.shape.length; r++) {
      for (let c = 0; c < state.currentPiece.shape[r].length; c++) {
        if (state.currentPiece.shape[r][c]) {
          drawCell(ctx, state.currentPiece.col + c, state.currentPiece.row + r, cellSize, state.currentPiece.color)
        }
      }
    }
  }

  // Draw next piece preview (in a small box at top-right)
  if (state.nextPiece) {
    const previewX = canvas.width - 5 * cellSize
    const previewY = 0
    ctx.fillStyle = '#1a1a33'
    ctx.fillRect(previewX, previewY, 5 * cellSize, 5 * cellSize)
    ctx.strokeStyle = '#333366'
    ctx.lineWidth = 1
    ctx.strokeRect(previewX, previewY, 5 * cellSize, 5 * cellSize)

    const nx = previewX + ((5 * cellSize) - state.nextPiece.shape[0].length * cellSize) / 2
    const ny = previewY + ((5 * cellSize) - state.nextPiece.shape.length * cellSize) / 2
    for (let r = 0; r < state.nextPiece.shape.length; r++) {
      for (let c = 0; c < state.nextPiece.shape[r].length; c++) {
        if (state.nextPiece.shape[r][c]) {
          ctx.fillStyle = state.nextPiece.color
          ctx.fillRect(nx + c * cellSize, ny + r * cellSize, cellSize - 1, cellSize - 1)
          ctx.strokeStyle = 'rgba(0,0,0,0.3)'
          ctx.strokeRect(nx + c * cellSize, ny + r * cellSize, cellSize - 1, cellSize - 1)
        }
      }
    }
  }

  // Draw Game Over overlay
  if (state.isGameOver) {
    renderGameOver(ctx, state, canvas.width, canvas.height)
  }
}

/**
 * Draw a single cell with highlight/shadow for 3D effect.
 */
function drawCell(ctx, col, row, size, color) {
  ctx.fillStyle = color
  ctx.fillRect(col * size, row * size, size - 1, size - 1)

  // Highlight (top-left)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.fillRect(col * size, row * size, size - 1, 2)
  ctx.fillRect(col * size, row * size, 2, size - 1)

  // Shadow (bottom-right)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.fillRect(col * size, (row + 1) * size - 2, size - 1, 2)
  ctx.fillRect((col + 1) * size - 2, row * size, 2, size - 1)
}

/**
 * Reset the Tetris game to its initial state for a new game.
 */
export function reset() {
  state = createInitialState()
  state.bag = fillBag()
  state.nextPiece = createPiece(getNextPieceType())
  spawnPiece()
  state.lastDropTime = performance.now()
  return state
}

/**
 * Handle keyboard input. Exported for GamePage to wire up.
 *
 * Three-way logic:
 *   - Not playing + not game over → start the game (isPlaying = true)
 *   - Game over → reset state and start playing (isPlaying = true)
 *   - Already playing → perform normal action (move/rotate/hard drop)
 *
 * @param {string} key - The key pressed (e.g. 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ').
 * @returns {void}
 */
export function handleKeydown(key) {
  if (!state) return

  // Valid game keys that should start the game / trigger game-over reset
  const validKeys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ']

  if (state.isGameOver && validKeys.includes(key)) {
    // Game over: reset and start playing
    state = createInitialState()
    state.bag = fillBag()
    state.nextPiece = createPiece(getNextPieceType())
    spawnPiece()
    state.lastDropTime = performance.now()
    state.isPlaying = true
  } else if (!state.isPlaying && validKeys.includes(key)) {
    // Not playing: start playing
    state.isPlaying = true
  }

  switch (key) {
    case 'ArrowLeft':
      movePiece(-1, 0)
      break
    case 'ArrowRight':
      movePiece(1, 0)
      break
    case 'ArrowDown':
      movePiece(0, 1)
      break
    case 'ArrowUp':
      rotate()
      break
    case ' ':
      hardDrop()
      break
  }
}

function movePiece(dc, dr) {
  if (!state || !state.currentPiece) return
  const newRow = state.currentPiece.row + dr
  const newCol = state.currentPiece.col + dc
  if (isValidPosition(state.board, state.currentPiece.shape, newRow, newCol)) {
    state.currentPiece.row = newRow
    state.currentPiece.col = newCol
    if (dr > 0) {
      state.score += 1 // soft drop bonus
    }
  }
}

function rotate() {
  if (!state || !state.currentPiece) return
  const rotated = rotatePiece(state.currentPiece)

  // Try normal rotation
  if (isValidPosition(state.board, rotated.shape, rotated.row, rotated.col)) {
    state.currentPiece = rotated
    return
  }

  // Wall kick: try shifting left
  if (isValidPosition(state.board, rotated.shape, rotated.row, rotated.col - 1)) {
    state.currentPiece = { ...rotated, col: rotated.col - 1 }
    return
  }

  // Wall kick: try shifting right
  if (isValidPosition(state.board, rotated.shape, rotated.row, rotated.col + 1)) {
    state.currentPiece = { ...rotated, col: rotated.col + 1 }
    return
  }
}

// ─── Export the state object for GamePage to read ───
// Auto-start fix: isPlaying stays false until user input via handleKeydown()
// All three games now comply with game initialization convention.
export { state }
