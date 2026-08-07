/**
 * Whack-a-Mole game for gameShelf platform.
 * Classic time-based reflex game with combo scoring and gamepad support.
 * API: init(difficulty?), update(), render(canvas), reset(), handleKeydown(key)
 * Exports: state (readable by GamePage)
 */

import { handleKeydownTransition } from '../shared/gameHelpers.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const COLS = 4
const ROWS = 3
const CANVAS_W = 250
const CANVAS_H = 200
const GAME_DURATION = 30 // seconds

const GAP_PADDING = 20 // px from canvas edges for grid area

// Grid cell dimensions
const HUD_HEIGHT = 36
const GRID_AREA_W = CANVAS_W - 2 * GAP_PADDING
const GRID_AREA_H = CANVAS_H - HUD_HEIGHT - GAP_PADDING - GAP_PADDING
const CELL_W = GRID_AREA_W / COLS
const CELL_H = GRID_AREA_H / ROWS
const HOLE_RADIUS = CELL_W / 2 - 6

// Grid top-left corner (below HUD bar)
const GRID_X = GAP_PADDING
const GRID_Y = HUD_HEIGHT + GAP_PADDING

// Colors
const BG_COLOR = '#d4a574'
const HOLE_COLOR = '#5c4033'
const HOLE_INNER = '#3e2723'
const MOLE_COLOR = '#8B6914'
const MOLE_DARK = '#3e2723'
const MOLE_NOSE = '#6b3020'
const MOLE_TUMBLE = '#FF69B4'
const BOMB_COLOR = '#881111'
const BOMB_X_COLOR = '#ff3333'
const CURSOR_COLOR = '#ffd700'
const HUD_BG = 'rgba(0,0,0,0.7)'

// Difficulty settings
const DIFFICULTIES = {
  Easy: { moleDuration: 2500, spawnInterval: 1500, maxSimultaneous: 1, bombChance: 0 },
  Medium: { moleDuration: 1800, spawnInterval: 1000, maxSimultaneous: 2, bombChance: 0.15 },
  Hard: { moleDuration: 1200, spawnInterval: 600, maxSimultaneous: 3, bombChance: 0.3 }
}

// ─── Audio ────────────────────────────────────────────────────────────────────

let audioCtx = null

function ensureAudioCtx() {
  if (!audioCtx && typeof window !== 'undefined') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
}

function playPop() {
  if (!audioCtx) return
  try {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.frequency.value = 600
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.08)
  } catch (_) {}
}

function playWhack() {
  if (!audioCtx) return
  try {
    const bufferSize = audioCtx.sampleRate * 0.2
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize
      data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.4
    }
    const source = audioCtx.createBufferSource()
    source.buffer = buffer
    const gain = audioCtx.createGain()
    source.connect(gain)
    gain.connect(audioCtx.destination)
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2)
    source.start()
  } catch (_) {}
}

function playMiss() {
  if (!audioCtx) return
  try {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.frequency.value = 150
    osc.type = 'sawtooth'
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.15)
  } catch (_) {}
}

function playGameOver() {
  if (!audioCtx) return
  try {
    // First tone: 400Hz
    const osc1 = audioCtx.createOscillator()
    const gain1 = audioCtx.createGain()
    osc1.connect(gain1)
    gain1.connect(audioCtx.destination)
    osc1.frequency.value = 400
    osc1.type = 'sine'
    gain1.gain.setValueAtTime(0.15, audioCtx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3)
    osc1.start()
    osc1.stop(audioCtx.currentTime + 0.3)
    // Second tone: 200Hz, starts 0.3s later
    const osc2 = audioCtx.createOscillator()
    const gain2 = audioCtx.createGain()
    osc2.connect(gain2)
    gain2.connect(audioCtx.destination)
    osc2.frequency.value = 200
    osc2.type = 'sine'
    gain2.gain.setValueAtTime(0, audioCtx.currentTime)
    gain2.gain.setValueAtTime(0.15, audioCtx.currentTime + 0.3)
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6)
    osc2.start(audioCtx.currentTime + 0.25)
    osc2.stop(audioCtx.currentTime + 0.6)
  } catch (_) {}
}

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

function createInitialState(preserveDifficulty) {
  const initial = {
    score: 0,
    isGameOver: false,
    isPlaying: false,
    combo: 1,
    highestCombo: 1,
    difficulty: 'Easy',
    timer: GAME_DURATION,
    activeMoles: [],
    whackEffects: [],
    lastMoleSpawn: 0,
    framesPlayed: 0,
    gamepadConnected: false,
    cursorCol: 1,
    cursorRow: 1,
    startedAt: null,
    animFrameId: null,
    _canvas: null,
    _clickHandler: null
  }
  if (preserveDifficulty && state && state.difficulty) {
    initial.difficulty = state.difficulty
  }
  return initial
}

// ─── Grid Helpers ─────────────────────────────────────────────────────────────

function cellCenter(col, row) {
  return {
    x: GRID_X + col * CELL_W + CELL_W / 2,
    y: GRID_Y + row * CELL_H + CELL_H / 2
  }
}

function cellRect(col, row) {
  return {
    x: GRID_X + col * CELL_W,
    y: GRID_Y + row * CELL_H,
    w: CELL_W,
    h: CELL_H
  }
}

function isInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h
}

function randomAvailableCell(occupied, maxCount) {
  // Get list of available cells
  const available = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!occupied.find(m => m.col === c && m.row === r)) {
        available.push({ col: c, row: r })
      }
    }
  }
  if (available.length === 0) return null
  // Cap total moles to maxCount: only pick maxCount - occupied.length new cells
  const canSpawn = Math.max(0, maxCount - occupied.length)
  if (canSpawn === 0) return null
  const count = Math.min(canSpawn, available.length)
  const picked = []
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * available.length)
    picked.push(available.splice(idx, 1)[0])
  }
  return count === 1 ? picked[0] : picked
}

// ─── Mole Spawning ────────────────────────────────────────────────────────────

function spawnMoles() {
  const diff = DIFFICULTIES[state.difficulty]
  const occupied = state.activeMoles.map(m => ({ col: m.col, row: m.row }))
  const available = randomAvailableCell(occupied, diff.maxSimultaneous)
  if (!available) return

  // Ensure available is an array
  const cells = Array.isArray(available) ? available : [available]

  for (const cell of cells) {
    const isBomb = Math.random() < diff.bombChance
    state.activeMoles.push({
      col: cell.col,
      row: cell.row,
      isBomb,
      phase: 0,
      elapsed: 0,
      maxDuration: diff.moleDuration
    })
  }

  // Only play pop for the first mole spawned in a batch
  if (cells.length > 0) {
    playPop()
  }
}

// ─── Whack Logic ──────────────────────────────────────────────────────────────

export function whackCell(col, row) {
  const mole = state.activeMoles.find(
    m => m.col === col && m.row === row && m.phase < 66 // whackable: rising or idle
  )

  if (mole) {
    // Remove the mole
    state.activeMoles = state.activeMoles.filter(m => m !== mole)
    // Add whack effect
    state.whackEffects.push({ col: mole.col, row: mole.row, type: mole.isBomb ? 'bomb' : 'mole', phase: 0 })

    if (mole.isBomb) {
      // Bomb penalty
      state.score = Math.max(0, state.score - 20)
      state.combo = 1
      playMiss()
    } else {
      // Normal mole
      state.score += 10 * state.combo
      state.combo++
      state.highestCombo = Math.max(state.highestCombo, state.combo)
      playWhack()
    }
  } else {
    // Clicked empty hole - miss
    state.combo = 1
    playMiss()
  }
}

// ─── Public Functions ─────────────────────────────────────────────────────────

/**
 * Initialize the Whack-a-Mole game.
 * @param {string} [difficulty] - 'Easy', 'Medium', or 'Hard'. Sets initial difficulty but does NOT auto-start.
 */
export function init(difficulty) {
  state = createInitialState()

  // Set up difficulty
  if (difficulty && DIFFICULTIES[difficulty]) {
    state.difficulty = difficulty
  }

  // Gamepad detection
  function onGamepadConnected(e) {
    state.gamepadConnected = true
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('gamepadconnected', onGamepadConnected)
  }
  state._gamepadConnectedListener = onGamepadConnected

  // Check if gamepad is already connected
  try {
    const gamepads = navigator.getGamepads()
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        state.gamepadConnected = true
        break
      }
    }
  } catch (_) {}

  return state
}

function startGame(difficulty) {
  state.difficulty = difficulty
  state.isPlaying = true
  state.isGameOver = false
  state.score = 0
  state.combo = 1
  state.highestCombo = 1
  state.timer = GAME_DURATION
  state.activeMoles = []
  state.whackEffects = []
  state.lastMoleSpawn = 0
  state.framesPlayed = 0
  state.startedAt = performance.now()
}

/**
 * Update the game state. Called ~60fps.
 */
export function update() {
  if (!state || state.isGameOver) {
    return
  }

  if (!state.isPlaying) {
    // Menu state: process gamepad for menu
    processGamepad()
    return
  }

  state.framesPlayed++

  // ── Timer ──
  state.timer -= 1 / 60
  if (state.timer <= 0) {
    state.timer = 0
    state.isGameOver = true
    state.isPlaying = false
    playGameOver()
    return
  }

  // ── Spawn moles ──
  const diff = DIFFICULTIES[state.difficulty]
  const elapsed = state.framesPlayed * (1000 / 60) // approximate ms
  if (elapsed - state.lastMoleSpawn >= diff.spawnInterval) {
    spawnMoles()
    state.lastMoleSpawn = elapsed
  }

  // ── Update mole phases ──
  for (let i = state.activeMoles.length - 1; i >= 0; i--) {
    const mole = state.activeMoles[i]
    const dt = 1000 / 60 // ~16.67ms per frame
    mole.elapsed += dt
    mole.phase = Math.min(100, (mole.elapsed / mole.maxDuration) * 100)
    if (mole.phase >= 100) {
      state.activeMoles.splice(i, 1)
    }
  }

  // ── Update whack effects ──
  for (let i = state.whackEffects.length - 1; i >= 0; i--) {
    const effect = state.whackEffects[i]
    effect.phase += 3
    if (effect.phase >= 100) {
      state.whackEffects.splice(i, 1)
    }
  }

  // ── Gamepad ──
  processGamepad()
}

function processGamepad() {
  if (!state) return
  try {
    const gamepads = navigator.getGamepads()
    let gp = null
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        gp = gamepads[i]
        break
      }
    }
    if (!gp) return

    state.gamepadConnected = true

    const dpadUp = gp.buttons[12]
    const dpadDown = gp.buttons[13]
    const dpadLeft = gp.buttons[14]
    const dpadRight = gp.buttons[15]
    const aButton = gp.buttons[0]
    const bButton = gp.buttons[1]

    // D-pad movement (only on press, not hold)
    const moveCursor = (dc, dr) => {
      const newCol = state.cursorCol + dc
      const newRow = state.cursorRow + dr
      if (newCol >= 0 && newCol < COLS && newRow >= 0 && newRow < ROWS) {
        state.cursorCol = newCol
        state.cursorRow = newRow
      }
    }

    if (dpadUp && !state.gamepadState.dpadUpPressed) {
      moveCursor(0, -1)
      state.gamepadState.dpadUpPressed = true
    } else if (!dpadUp) {
      state.gamepadState.dpadUpPressed = false
    }

    if (dpadDown && !state.gamepadState.dpadDownPressed) {
      moveCursor(0, 1)
      state.gamepadState.dpadDownPressed = true
    } else if (!dpadDown) {
      state.gamepadState.dpadDownPressed = false
    }

    if (dpadLeft && !state.gamepadState.dpadLeftPressed) {
      moveCursor(-1, 0)
      state.gamepadState.dpadLeftPressed = true
    } else if (!dpadLeft) {
      state.gamepadState.dpadLeftPressed = false
    }

    if (dpadRight && !state.gamepadState.dpadRightPressed) {
      moveCursor(1, 0)
      state.gamepadState.dpadRightPressed = true
    } else if (!dpadRight) {
      state.gamepadState.dpadRightPressed = false
    }

    // A button - whack (in gameplay) or select difficulty (in menu)
    if (aButton && aButton.pressed) {
      if (state.isPlaying) {
        whackCell(state.cursorCol, state.cursorRow)
      } else if (state.isGameOver) {
        // Do nothing, wait for B button
      } else {
        // Menu: select current difficulty
        startGame(state.difficulty)
      }
      state.gamepadState.buttonAPressed = true
    } else {
      state.gamepadState.buttonAPressed = false
    }

    // B button - start/restart
    if (bButton && bButton.pressed) {
      if (state.isGameOver) {
        reset()
        startGame(state.difficulty)
      } else if (!state.isPlaying && !state.isGameOver) {
        startGame(state.difficulty)
      }
      state.gamepadState.buttonBPressed = true
    } else {
      state.gamepadState.buttonBPressed = false
    }
  } catch (_) {}
}

/**
 * Render the game to a canvas.
 * @param {HTMLCanvasElement} canvas - The canvas to render to.
 */
export function render(canvas) {
  if (!state || !canvas) return

  // Store canvas reference for click handling
  state._canvas = canvas

  // Register click handlers once per canvas
  if (!state._clickHandlerRegistered) {
    state._clickHandlerRegistered = true
    registerClickHandlers()
  }

  const ctx = canvas.getContext('2d')

  // Set canvas dimensions
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H

  // Clear canvas
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  if (!state.isPlaying && !state.isGameOver) {
    renderMenu(ctx)
  } else if (state.isPlaying) {
    renderGameplay(ctx)
  }
}

// ─── Click Handling ───────────────────────────────────────────────────────────

function registerClickHandlers() {
  const canvas = state._canvas
  if (!canvas) return

  // Gameplay click handler
  const handler = (e) => {
    ensureAudioCtx()

    if (state.isGameOver || !state.isPlaying) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const px = (e.clientX - rect.left) * scaleX
    const py = (e.clientY - rect.top) * scaleY

    // Check if click is in grid area
    const cellCol = Math.floor((px - GRID_X) / CELL_W)
    const cellRow = Math.floor((py - GRID_Y) / CELL_H)
    if (cellCol >= 0 && cellCol < COLS && cellRow >= 0 && cellRow < ROWS) {
      whackCell(cellCol, cellRow)
    }
  }
  canvas.addEventListener('click', handler)
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    handler({ clientX: touch.clientX, clientY: touch.clientY })
  }, { passive: false })
  state._clickHandler = handler

  // Menu difficulty button click handler
  const menuHandler = (e) => {
    ensureAudioCtx()
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const px = (e.clientX - rect.left) * scaleX
    const py = (e.clientY - rect.top) * scaleY

    // Difficulty buttons on menu screen
    const btnW = CANVAS_W / 3 - 10
    const btnH = 35
    const btnY = 120
    const diffNames = ['Easy', 'Medium', 'Hard']

    for (let i = 0; i < 3; i++) {
      const btnX = 10 + i * (btnW + 10)
      if (isInRect(px, py, { x: btnX, y: btnY, w: btnW, h: btnH })) {
        startGame(diffNames[i])
        return
      }
    }
  }
  canvas.addEventListener('click', menuHandler)
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    menuHandler({ clientX: touch.clientX, clientY: touch.clientY })
  }, { passive: false })
  state._menuClickHandler = menuHandler
}

function renderMenu(ctx) {
  // Title
  ctx.fillStyle = '#3e2723'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('WHACK-A-MOLE', CANVAS_W / 2, 60)

  // Subtitle
  ctx.fillStyle = '#5c4033'
  ctx.font = '14px sans-serif'
  ctx.fillText('Select difficulty:', CANVAS_W / 2, 90)

  // Difficulty buttons
  const diffNames = ['Easy', 'Medium', 'Hard']
  const colors = ['#2cb67d', '#f97316', '#dc2626']
  const btnW = CANVAS_W / 3 - 10
  const btnH = 35
  const btnY = 120

  for (let i = 0; i < 3; i++) {
    const btnX = 10 + i * (btnW + 10)
    const isSelected = state.difficulty === diffNames[i]

    // Button background
    ctx.fillStyle = isSelected ? colors[i] : '#aaa'
    ctx.beginPath()
    ctx.roundRect(btnX, btnY, btnW, btnH, 5)
    ctx.fill()

    // Button text
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(diffNames[i], btnX + btnW / 2, btnY + 23)
  }

  // Instructions
  ctx.fillStyle = '#5c4033'
  ctx.font = '12px sans-serif'
  ctx.fillText('Click/tap a difficulty to start', CANVAS_W / 2, btnY + btnH + 20)
  ctx.fillText('Use mouse, touch, or gamepad', CANVAS_W / 2, btnY + btnH + 40)
  ctx.fillText('Arrow keys to navigate, Space to play', CANVAS_W / 2, btnY + btnH + 60)

  // Draw gamepad hint if connected
  if (state.gamepadConnected) {
    ctx.fillStyle = '#7f5af0'
    ctx.font = '11px sans-serif'
    ctx.fillText('Gamepad: D-pad to move, A to select, B to start', CANVAS_W / 2, CANVAS_H - 30)
  }
}

function renderHUD(ctx) {
  // HUD background bar
  ctx.fillStyle = HUD_BG
  ctx.fillRect(0, 0, CANVAS_W, 36)

  // Score
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`Score: ${state.score}`, 8, 15)

  // Combo
  if (state.combo > 1) {
    ctx.fillStyle = '#ffd700'
    ctx.font = 'bold 13px sans-serif'
    ctx.fillText(`Combo: x${state.combo}`, 8, 30)
  }

  // Timer
  const mins = Math.floor(state.timer / 60)
  const secs = Math.floor(state.timer % 60)
  ctx.fillStyle = state.timer <= 5 ? '#ff4444' : '#ffffff'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`${mins}:${secs.toString().padStart(2, '0')}`, CANVAS_W / 2, 15)

  // Difficulty
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(state.difficulty, CANVAS_W - 8, 15)
}

function drawHole(ctx, cx, cy) {
  // Hole shadow
  ctx.fillStyle = HOLE_COLOR
  ctx.beginPath()
  ctx.ellipse(cx, cy + 4, HOLE_RADIUS + 2, HOLE_RADIUS / 3 + 2, 0, 0, Math.PI * 2)
  ctx.fill()

  // Hole main
  ctx.fillStyle = HOLE_COLOR
  ctx.beginPath()
  ctx.ellipse(cx, cy, HOLE_RADIUS, HOLE_RADIUS / 3, 0, 0, Math.PI * 2)
  ctx.fill()

  // Hole inner (darker)
  ctx.fillStyle = HOLE_INNER
  ctx.beginPath()
  ctx.ellipse(cx, cy, HOLE_RADIUS - 3, HOLE_RADIUS / 3 - 1, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawMole(ctx, mole) {
  const center = cellCenter(mole.col, mole.row)
  const r = HOLE_RADIUS - 4
  const phase = mole.phase

  // Calculate mole vertical offset (rises from hole center)
  // Rising phase: 0-33% → mole rises from -r to -r + (r + 6)
  // Idle phase: 33-66% → mole stays fully up at -r - 2
  // Dying phase: 66-100% → mole sinks back to 0
  let riseY = 0
  if (phase <= 33) {
    // Rising
    const t = phase / 33
    riseY = -r + t * (r + 6)
  } else if (phase <= 66) {
    // Idle
    riseY = -r - 2
  } else {
    // Dying
    const t = (phase - 66) / 34
    riseY = (-r - 2) + (1 - t) * (r + 8)
  }

  const cy = center.y + riseY

  // Draw mole body
  ctx.fillStyle = mole.isBomb ? BOMB_COLOR : MOLE_COLOR
  ctx.beginPath()
  ctx.arc(center.x, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // Mole outline
  ctx.strokeStyle = mole.isBomb ? '#660000' : '#5c3a0a'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Eyes
  const eyeY = cy - 3
  const eyeSpacing = r * 0.35
  const eyeR = 3

  // White part of eyes
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(center.x - eyeSpacing, eyeY, eyeR, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(center.x + eyeSpacing, eyeY, eyeR, 0, Math.PI * 2)
  ctx.fill()

  // Pupils
  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.arc(center.x - eyeSpacing + 1, eyeY - 0.5, 1.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(center.x + eyeSpacing + 1, eyeY - 0.5, 1.5, 0, Math.PI * 2)
  ctx.fill()

  // Nose
  ctx.fillStyle = MOLE_NOSE
  ctx.beginPath()
  ctx.ellipse(center.x, cy + 4, 4, 3, 0, 0, Math.PI * 2)
  ctx.fill()

  // Tumbleweed spot (just decoration on normal moles)
  if (!mole.isBomb) {
    ctx.fillStyle = MOLE_TUMBLE
    ctx.beginPath()
    ctx.ellipse(center.x, cy + r - 3, 3, 2, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // Bomb marking - red X on bomb moles
  if (mole.isBomb) {
    const xSize = r * 0.45
    const xOff = 2
    ctx.strokeStyle = BOMB_X_COLOR
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(center.x - xOff - xSize, cy - xOff - xSize)
    ctx.lineTo(center.x - xOff + xSize, cy - xOff + xSize)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(center.x - xOff + xSize, cy - xOff - xSize)
    ctx.lineTo(center.x - xOff - xSize, cy - xOff + xSize)
    ctx.stroke()
  }
}

function drawGrid(ctx) {
  // Draw all holes
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      drawHole(ctx, cellCenter(c, r).x, cellCenter(c, r).y)
    }
  }
}

function renderGameplay(ctx) {
  renderHUD(ctx)
  drawGrid(ctx)

  // Draw moles (dying ones behind, then active)
  for (const mole of state.activeMoles) {
    drawMole(ctx, mole)
  }

  // Draw whack effects
  for (const effect of state.whackEffects) {
    drawWhackEffect(ctx, effect)
  }

  // Draw cursor highlight
  drawCursorHighlight(ctx)
}

function drawWhackEffect(ctx, effect) {
  const center = cellCenter(effect.col, effect.row)
  const r = HOLE_RADIUS + effect.phase * 1.2 // expands over time
  const alpha = 1 - (effect.phase / 100)

  if (effect.type === 'mole') {
    // White radial burst
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(center.x, center.y, r * 0.6, 0, Math.PI * 2)
    ctx.stroke()

    // Star burst lines
    ctx.strokeStyle = `rgba(255,220,100,${alpha * 0.7})`
    ctx.lineWidth = 2
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i + effect.phase * 0.01
      const len = r * 0.5 * (effect.phase / 100)
      ctx.beginPath()
      ctx.moveTo(center.x, center.y)
      ctx.lineTo(center.x + Math.cos(angle) * len, center.y + Math.sin(angle) * len)
      ctx.stroke()
    }
  } else {
    // Bomb whack effect - red X flash
    ctx.fillStyle = `rgba(255,0,0,${alpha * 0.5})`
    ctx.beginPath()
    ctx.arc(center.x, center.y, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = `rgba(255,255,255,${alpha})`
    ctx.lineWidth = 3
    const xSize = r * 0.3
    ctx.beginPath()
    ctx.moveTo(center.x - xSize, center.y - xSize)
    ctx.lineTo(center.x + xSize, center.y + xSize)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(center.x + xSize, center.y - xSize)
    ctx.lineTo(center.x - xSize, center.y + xSize)
    ctx.stroke()
  }
}

function drawCursorHighlight(ctx) {
  const center = cellCenter(state.cursorCol, state.cursorRow)
  const pulsePhase = Math.sin(state.framesPlayed * 0.1) * 0.3 + 0.7

  // Outer glow
  ctx.strokeStyle = `rgba(255, 215, 0, ${pulsePhase * 0.3})`
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(center.x, center.y, HOLE_RADIUS + 6, 0, Math.PI * 2)
  ctx.stroke()

  // Inner ring
  ctx.strokeStyle = CURSOR_COLOR
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(center.x, center.y, HOLE_RADIUS + 3, 0, Math.PI * 2)
  ctx.stroke()
}

/**
 * Reset the game to initial state for a new game.
 */
export function reset() {
  if (!state) return

  // Remove event listeners
  if (state._canvas && state._clickHandler) {
    state._canvas.removeEventListener('click', state._clickHandler)
    state._canvas.removeEventListener('touchstart', state._clickHandler)
  }
  if (state._canvas && state._menuClickHandler) {
    state._canvas.removeEventListener('click', state._menuClickHandler)
    state._canvas.removeEventListener('touchstart', state._menuClickHandler)
  }
  if (typeof window !== 'undefined' && state._gamepadConnectedListener) {
    window.removeEventListener('gamepadconnected', state._gamepadConnectedListener)
  }

  Object.assign(state, createInitialState(true))
  return state
}

const transition = handleKeydownTransition(() => {
  reset()
})

/**
 * Handle keyboard input. Exported for GamePage to wire up.
 * @param {string} key - The key pressed.
 */
export function handleKeydown(key) {
  if (!state) return

  const validKeys = [' ']

  // Space bar: transition (start/restart/whack)
  transition(state, key, validKeys, () => {
    // Already playing — whack the mole under the cursor
    whackCell(state.cursorCol, state.cursorRow)
  })

  // Start the game when transitioning from non-playing state
  if (!state.isPlaying && !state.isGameOver) {
    ensureAudioCtx()
    startGame(state.difficulty)
  }

  // Arrow keys: cursor movement (always, regardless of state)
  if (key === 'ArrowUp') {
    state.cursorRow = Math.max(0, state.cursorRow - 1)
  } else if (key === 'ArrowDown') {
    state.cursorRow = Math.min(ROWS - 1, state.cursorRow + 1)
  } else if (key === 'ArrowLeft') {
    state.cursorCol = Math.max(0, state.cursorCol - 1)
  } else if (key === 'ArrowRight') {
    state.cursorCol = Math.min(COLS - 1, state.cursorCol + 1)
  }
}

// Export the state object for GamePage to read
export { state }

export { CANVAS_W as CANVAS_WIDTH, CANVAS_H as CANVAS_HEIGHT }
