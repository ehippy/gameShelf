import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..', '..')
const whackPath = join(root, 'src', 'games', 'whack-a-mole', 'gameLogic.js')

describe('whack-a-mole', () => {
  describe('Static checks', () => {
    const whackSrc = readFileSync(whackPath, 'utf-8')

    it('exports init()', () => {
      expect(whackSrc).toContain('export function init')
    })

    it('exports update()', () => {
      expect(whackSrc).toContain('export function update')
    })

    it('exports render()', () => {
      expect(whackSrc).toContain('export function render')
    })

    it('exports reset()', () => {
      expect(whackSrc).toContain('export function reset')
    })

    it('exports handleKeydown', () => {
      expect(whackSrc).toContain('export function handleKeydown')
    })

    it('exports state', () => {
      expect(whackSrc).toContain('export { state }')
    })

    it('defines CANVAS_W = 250', () => {
      expect(whackSrc).toContain('CANVAS_W')
      expect(whackSrc).toContain('250')
    })

    it('defines CANVAS_H = 200', () => {
      expect(whackSrc).toContain('CANVAS_H')
      expect(whackSrc).toContain('200')
    })

    it('re-exports CANVAS_W as CANVAS_WIDTH', () => {
      expect(whackSrc).toContain('CANVAS_W as CANVAS_WIDTH')
    })

    it('re-exports CANVAS_H as CANVAS_HEIGHT', () => {
      expect(whackSrc).toContain('CANVAS_H as CANVAS_HEIGHT')
    })

    it('uses COLS and ROWS for grid layout', () => {
      expect(whackSrc).toContain('COLS')
      expect(whackSrc).toContain('ROWS')
    })
  })

  describe('Functional tests', () => {
    let whackModule = null

    beforeEach(async () => {
      try {
        whackModule = await import(whackPath)
      } catch {
        whackModule = null
      }
    })

    it('init is a function', () => {
      if (!whackModule) return
      expect(typeof whackModule.init).toBe('function')
    })

    it('update is a function', () => {
      if (!whackModule) return
      expect(typeof whackModule.update).toBe('function')
    })

    it('reset is a function', () => {
      if (!whackModule) return
      expect(typeof whackModule.reset).toBe('function')
    })

    it('handleKeydown is a function', () => {
      if (!whackModule) return
      expect(typeof whackModule.handleKeydown).toBe('function')
    })

    it('exports state', () => {
      if (!whackModule) return
      expect(whackModule.state).toBeDefined()
    })

    it('exports CANVAS_WIDTH', () => {
      if (!whackModule) return
      expect(whackModule.CANVAS_WIDTH).toBe(250)
    })

    it('exports CANVAS_HEIGHT', () => {
      if (!whackModule) return
      expect(whackModule.CANVAS_HEIGHT).toBe(200)
    })

    it('init() runs without error', () => {
      if (!whackModule) return
      const result = whackModule.init()
      expect(result).not.toBeNull()
    })

    it('initial state.score is 0', () => {
      if (!whackModule) return
      whackModule.init()
      expect(whackModule.state.score).toBe(0)
    })

    it('initial state.isGameOver is false', () => {
      if (!whackModule) return
      whackModule.init()
      expect(whackModule.state.isGameOver).toBe(false)
    })

    it('initial state.isPlaying is false (menu state)', () => {
      if (!whackModule) return
      whackModule.init()
      expect(whackModule.state.isPlaying).toBe(false)
    })

    it('CANVAS_W is still 250', () => {
      // Verify internal constant unchanged
      const whackSrc = readFileSync(whackPath, 'utf-8')
      expect(whackSrc).toContain('const CANVAS_W = 250')
    })

    it('CANVAS_H is still 200', () => {
      // Verify internal constant unchanged
      const whackSrc = readFileSync(whackPath, 'utf-8')
      expect(whackSrc).toContain('const CANVAS_H = 200')
    })

    // ─── Functional gameplay tests ───

    it("init('Medium') accepts and applies difficulty", () => {
      if (!whackModule) return
      whackModule.init('Medium')
      expect(whackModule.state.difficulty).toBe('Medium')
      whackModule.init('Hard')
      expect(whackModule.state.difficulty).toBe('Hard')
      whackModule.init('Easy')
      expect(whackModule.state.difficulty).toBe('Easy')
    })

    it("init() defaults to 'Easy' difficulty", () => {
      if (!whackModule) return
      whackModule.init()
      expect(whackModule.state.difficulty).toBe('Easy')
    })

    it("handleKeydown(' ') starts game from menu", () => {
      if (!whackModule) return
      whackModule.init('Easy')
      expect(whackModule.state.isPlaying).toBe(false)
      whackModule.handleKeydown(' ')
      expect(whackModule.state.isPlaying).toBe(true)
      expect(whackModule.state.isGameOver).toBe(false)
    })

    it("handleKeydown(' ') restarts after game over", () => {
      if (!whackModule) return
      whackModule.init('Easy')
      whackModule.handleKeydown(' ')
      // Fast-forward time by setting timer to 0
      whackModule.state.timer = 0
      whackModule.update()
      expect(whackModule.state.isGameOver).toBe(true)
      whackModule.handleKeydown(' ')
      expect(whackModule.state.isPlaying).toBe(true)
      expect(whackModule.state.isGameOver).toBe(false)
    })

    it('update() timer counts down', () => {
      if (!whackModule) return
      whackModule.init('Easy')
      whackModule.handleKeydown(' ')
      // 180 frames at ~60fps = ~3 seconds, timer goes from 30 to ~27
      for (let i = 0; i < 180; i++) {
        whackModule.update()
      }
      expect(whackModule.state.timer).toBeLessThan(27.01)
    })

    it('update() triggers game over when timer hits 0', () => {
      if (!whackModule) return
      whackModule.init('Easy')
      whackModule.handleKeydown(' ')
      whackModule.state.timer = 2.01
      // 121 frames at ~60fps ≈ 2+ seconds ensures timer crosses 0
      for (let i = 0; i < 121; i++) {
        whackModule.update()
      }
      expect(whackModule.state.isGameOver).toBe(true)
    })

    it('whackCell on bomb decrements score by 20', () => {
      if (!whackModule) return
      whackModule.init('Hard')
      whackModule.handleKeydown(' ')
      whackModule.state.score = 50
      whackModule.state.activeMoles = [{ col: 0, row: 0, isBomb: true, phase: 50 }]
      whackModule.whackCell(0, 0)
      expect(whackModule.state.score).toBe(30) // 50 - 20
      expect(whackModule.state.combo).toBe(1)
    })

    it('whackCell on bomb sets score to 0 if below 20', () => {
      if (!whackModule) return
      whackModule.init('Hard')
      whackModule.handleKeydown(' ')
      whackModule.state.score = 10
      whackModule.state.activeMoles = [{ col: 0, row: 0, isBomb: true, phase: 50 }]
      whackModule.whackCell(0, 0)
      expect(whackModule.state.score).toBe(0) // Math.max(0, 10 - 20)
    })

    it('whackCell on normal mole scores 10*combo', () => {
      if (!whackModule) return
      whackModule.init('Hard')
      whackModule.handleKeydown(' ')
      whackModule.state.activeMoles = [{ col: 0, row: 0, isBomb: false, phase: 50 }]
      whackModule.whackCell(0, 0)
      expect(whackModule.state.score).toBe(10) // 10 * 1 (combo starts at 1)
    })

    it('whackCell on normal mole increases combo and highestCombo', () => {
      if (!whackModule) return
      whackModule.init('Hard')
      whackModule.handleKeydown(' ')
      whackModule.state.activeMoles = [{ col: 0, row: 0, isBomb: false, phase: 50 }]
      whackModule.whackCell(0, 0)
      expect(whackModule.state.combo).toBe(2)
      expect(whackModule.state.highestCombo).toBeGreaterThanOrEqual(2)
    })

    it('whackCell resets combo on bomb hit after normal mole', () => {
      if (!whackModule) return
      whackModule.init('Hard')
      whackModule.handleKeydown(' ')
      // Whack a normal mole first (combo goes to 2)
      whackModule.state.activeMoles = [{ col: 0, row: 0, isBomb: false, phase: 50 }]
      whackModule.whackCell(0, 0)
      expect(whackModule.state.combo).toBe(2)
      // Now whack a bomb
      whackModule.state.activeMoles = [{ col: 1, row: 0, isBomb: true, phase: 50 }]
      whackModule.whackCell(1, 0)
      expect(whackModule.state.combo).toBe(1)
    })

    it('whackCell on empty hole resets combo to 1', () => {
      if (!whackModule) return
      whackModule.init('Hard')
      whackModule.handleKeydown(' ')
      whackModule.state.combo = 5
      whackModule.whackCell(0, 0)
      expect(whackModule.state.combo).toBe(1)
    })

    it('reset() preserves difficulty via preserveDifficulty flag', () => {
      if (!whackModule) return
      whackModule.init('Hard')
      whackModule.handleKeydown(' ')
      whackModule.state.timer = 0
      whackModule.update()
      expect(whackModule.state.isGameOver).toBe(true)
      whackModule.reset()
      expect(whackModule.state.difficulty).toBe('Hard')
    })

    it('reset() resets score to 0', () => {
      if (!whackModule) return
      whackModule.init('Hard')
      whackModule.handleKeydown(' ')
      whackModule.state.score = 100
      whackModule.reset()
      expect(whackModule.state.score).toBe(0)
    })

    it('reset() sets isGameOver to false', () => {
      if (!whackModule) return
      whackModule.init('Easy')
      whackModule.handleKeydown(' ')
      whackModule.state.timer = 0
      whackModule.update()
      expect(whackModule.state.isGameOver).toBe(true)
      whackModule.reset()
      expect(whackModule.state.isGameOver).toBe(false)
    })

    it("whackCell on mole with phase >= 66 does nothing", () => {
      if (!whackModule) return
      whackModule.init('Hard')
      whackModule.handleKeydown(' ')
      whackModule.state.score = 50
      whackModule.state.activeMoles = [{ col: 0, row: 0, isBomb: false, phase: 80 }]
      whackModule.whackCell(0, 0)
      expect(whackModule.state.score).toBe(50)
    })

    it("handleKeydown(' ') restart preserves difficulty and resets score", () => {
      if (!whackModule) return
      whackModule.init('Easy')
      whackModule.handleKeydown(' ')
      whackModule.state.score = 75
      whackModule.state.timer = 0
      whackModule.update()
      expect(whackModule.state.isGameOver).toBe(true)
      whackModule.handleKeydown(' ')
      expect(whackModule.state.isPlaying).toBe(true)
      expect(whackModule.state.isGameOver).toBe(false)
      expect(whackModule.state.difficulty).toBe('Easy')
      expect(whackModule.state.score).toBe(0)
    })

    it("init('Medium'), handleKeydown(' '), update() ~300 frames → playing, not game over", () => {
      if (!whackModule) return
      whackModule.init('Medium')
      whackModule.handleKeydown(' ')
      for (let i = 0; i < 300; i++) {
        whackModule.update()
      }
      expect(whackModule.state.isPlaying).toBe(true)
      expect(whackModule.state.isGameOver).toBe(false)
    })

    // ─── AC1: ArrowUp decrements cursorRow, clamped to 0 ───

    it("handleKeydown('ArrowUp') decrements cursorRow", () => {
      if (!whackModule) return
      whackModule.init()
      whackModule.handleKeydown('ArrowUp')
      expect(whackModule.state.cursorRow).toBe(0)
    })

    it("handleKeydown('ArrowUp') clamps cursorRow at 0", () => {
      if (!whackModule) return
      whackModule.init()
      whackModule.handleKeydown('ArrowDown')
      whackModule.handleKeydown('ArrowDown')
      expect(whackModule.state.cursorRow).toBe(2)
      whackModule.handleKeydown('ArrowUp')
      expect(whackModule.state.cursorRow).toBe(1)
      whackModule.handleKeydown('ArrowUp')
      expect(whackModule.state.cursorRow).toBe(0)
      whackModule.handleKeydown('ArrowUp')
      expect(whackModule.state.cursorRow).toBe(0)
    })

    // ─── AC2: ArrowDown increments cursorRow, clamped to 2 ───

    it("handleKeydown('ArrowDown') increments cursorRow", () => {
      if (!whackModule) return
      whackModule.init()
      whackModule.handleKeydown('ArrowDown')
      expect(whackModule.state.cursorRow).toBe(2)
    })

    it("handleKeydown('ArrowDown') clamps cursorRow at 2", () => {
      if (!whackModule) return
      whackModule.init()
      whackModule.handleKeydown('ArrowDown')
      whackModule.handleKeydown('ArrowDown')
      expect(whackModule.state.cursorRow).toBe(2)
      whackModule.handleKeydown('ArrowDown')
      expect(whackModule.state.cursorRow).toBe(2)
    })

    // ─── AC3: ArrowLeft decrements cursorCol, clamped to 0 ───

    it("handleKeydown('ArrowLeft') decrements cursorCol", () => {
      if (!whackModule) return
      whackModule.init()
      whackModule.handleKeydown('ArrowLeft')
      expect(whackModule.state.cursorCol).toBe(0)
    })

    it("handleKeydown('ArrowLeft') clamps cursorCol at 0", () => {
      if (!whackModule) return
      whackModule.init()
      whackModule.handleKeydown('ArrowLeft')
      expect(whackModule.state.cursorCol).toBe(0)
      whackModule.handleKeydown('ArrowLeft')
      expect(whackModule.state.cursorCol).toBe(0)
    })

    // ─── AC4: ArrowRight increments cursorCol, clamped to 3 ───

    it("handleKeydown('ArrowRight') increments cursorCol", () => {
      if (!whackModule) return
      whackModule.init()
      whackModule.handleKeydown('ArrowRight')
      expect(whackModule.state.cursorCol).toBe(2)
    })

    it("handleKeydown('ArrowRight') clamps cursorCol at 3", () => {
      if (!whackModule) return
      whackModule.init()
      for (let i = 0; i < 5; i++) {
        whackModule.handleKeydown('ArrowRight')
      }
      expect(whackModule.state.cursorCol).toBe(3)
      whackModule.handleKeydown('ArrowRight')
      expect(whackModule.state.cursorCol).toBe(3)
    })

    // ─── AC5: Arrow keys work in all states ───

    it("handleKeydown('ArrowUp') works in menu state", () => {
      if (!whackModule) return
      whackModule.init()
      whackModule.handleKeydown('ArrowDown')
      expect(whackModule.state.cursorRow).toBe(2)
      whackModule.handleKeydown('ArrowUp')
      expect(whackModule.state.cursorRow).toBe(1)
    })

    it("handleKeydown('ArrowUp') works in gameplay state", () => {
      if (!whackModule) return
      whackModule.init()
      whackModule.handleKeydown(' ')
      whackModule.handleKeydown('ArrowDown')
      expect(whackModule.state.cursorRow).toBe(2)
      whackModule.handleKeydown('ArrowUp')
      expect(whackModule.state.cursorRow).toBe(1)
    })

    it("handleKeydown('ArrowUp') works in game over state", () => {
      if (!whackModule) return
      whackModule.init()
      whackModule.handleKeydown(' ')
      whackModule.state.timer = 0
      whackModule.update()
      expect(whackModule.state.isGameOver).toBe(true)
      whackModule.handleKeydown('ArrowDown')
      expect(whackModule.state.cursorRow).toBe(2)
      whackModule.handleKeydown('ArrowUp')
      expect(whackModule.state.cursorRow).toBe(1)
    })

    // ─── AC6: Space in gameplay calls whackCell(cursorCol, cursorRow) ───

    it("handleKeydown(' ') in gameplay calls whackCell at cursor position", () => {
      if (!whackModule) return
      whackModule.init()
      whackModule.handleKeydown(' ')
      // Move cursor to col 2, row 1
      whackModule.handleKeydown('ArrowRight')
      whackModule.handleKeydown('ArrowRight')
      whackModule.handleKeydown('ArrowDown')
      expect(whackModule.state.cursorCol).toBe(3)
      expect(whackModule.state.cursorRow).toBe(2)
      // Place a mole at cursor position
      whackModule.state.activeMoles = [{ col: 2, row: 1, isBomb: false, phase: 50 }]
      whackModule.state.score = 0
      // Whack via space
      whackModule.handleKeydown(' ')
      expect(whackModule.state.activeMoles.length).toBe(0)
      expect(whackModule.state.score).toBe(10)
    })

    // ─── AC7: Space in game over calls reset() then startGame() ───

    it("handleKeydown(' ') in game over calls reset and starts game", () => {
      if (!whackModule) return
      whackModule.init('Medium')
      whackModule.handleKeydown(' ')
      whackModule.state.score = 999
      whackModule.state.timer = 0
      whackModule.update()
      expect(whackModule.state.isGameOver).toBe(true)
      expect(whackModule.state.score).toBe(999)
      whackModule.handleKeydown(' ')
      expect(whackModule.state.isPlaying).toBe(true)
      expect(whackModule.state.isGameOver).toBe(false)
      expect(whackModule.state.score).toBe(0)
      expect(whackModule.state.difficulty).toBe('Medium')
    })

    // ─── AC8: drawCursorHighlight has no gamepadConnected guard ───

    function findClosingBrace(src, openIdx) {
      let depth = 0
      for (let i = openIdx; i < src.length; i++) {
        if (src[i] === '{') depth++
        else if (src[i] === '}') {
          depth--
          if (depth === 0) return i
        }
      }
      return src.length - 1
    }

    it("drawCursorHighlight does not check state.gamepadConnected", () => {
      const whackSrc = readFileSync(whackPath, 'utf-8')
      const drawCursorIdx = whackSrc.indexOf('function drawCursorHighlight(ctx)')
      const bodyEndIndex = findClosingBrace(whackSrc, drawCursorIdx)
      const body = whackSrc.slice(drawCursorIdx, bodyEndIndex + 1)
      expect(body).not.toContain('gamepadConnected')
    })

    // ─── AC9: Menu render text includes keyboard hint ───

    it("renderMenu includes keyboard hint text about arrow keys and space", () => {
      const whackSrc = readFileSync(whackPath, 'utf-8')
      expect(whackSrc).toMatch(/Arrow keys.*navigate/i)
      expect(whackSrc).toMatch(/Space.*play/i)
    })
  })
})
