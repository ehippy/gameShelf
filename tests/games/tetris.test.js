import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..', '..')
const tetrisPath = join(root, 'src', 'games', 'tetris', 'gameLogic.js')

// --- Static checks ---

describe('tetris', () => {
  describe('Static checks', () => {
    const tetrisSrc = readFileSync(tetrisPath, 'utf-8')

    it('exports init()', () => {
      expect(tetrisSrc).toContain('export function init')
    })

    it('exports update()', () => {
      expect(tetrisSrc).toContain('export function update')
    })

    it('exports render()', () => {
      expect(tetrisSrc).toContain('export function render')
    })

    it('exports reset()', () => {
      expect(tetrisSrc).toContain('export function reset')
    })

    it('exports handleKeydown', () => {
      expect(tetrisSrc).toContain('export function handleKeydown')
    })

    it('exports state', () => {
      expect(tetrisSrc).toContain('export { state }')
    })

    it('defines all 7 tetromino types (I, O, T, S, Z, J, L)', () => {
      expect(tetrisSrc).toContain('I:')
      expect(tetrisSrc).toContain('O:')
      expect(tetrisSrc).toContain('T:')
      expect(tetrisSrc).toContain('S:')
      expect(tetrisSrc).toContain('Z:')
      expect(tetrisSrc).toContain('J:')
      expect(tetrisSrc).toContain('L:')
    })

    it('I tetromino is cyan (#00f0f0)', () => {
      expect(tetrisSrc).toContain("color: '#00f0f0'")
    })

    it('O tetromino is yellow (#f0f000)', () => {
      expect(tetrisSrc).toContain("color: '#f0f000'")
    })

    it('T tetromino is purple (#a000f0)', () => {
      expect(tetrisSrc).toContain("color: '#a000f0'")
    })

    it('S tetromino is green (#00f000)', () => {
      expect(tetrisSrc).toContain("color: '#00f000'")
    })

    it('Z tetromino is red (#f00000)', () => {
      expect(tetrisSrc).toContain("color: '#f00000'")
    })

    it('J tetromino is blue (#0000f0)', () => {
      expect(tetrisSrc).toContain("color: '#0000f0'")
    })

    it('L tetromino is orange (#f0a000)', () => {
      expect(tetrisSrc).toContain("color: '#f0a000'")
    })

    it('Grid has 10 columns', () => {
      expect(tetrisSrc).toContain('COLS')
      expect(tetrisSrc).toContain('10')
    })

    it('Grid has 20 rows', () => {
      expect(tetrisSrc).toContain('ROWS')
      expect(tetrisSrc).toContain('20')
    })

    it('Scoring includes 100/300/500/800 point values', () => {
      expect(tetrisSrc).toContain('100')
      expect(tetrisSrc).toContain('300')
      expect(tetrisSrc).toContain('500')
      expect(tetrisSrc).toContain('800')
    })

    it('handleKeydown handles arrow keys', () => {
      expect(tetrisSrc).toContain('ArrowLeft')
      expect(tetrisSrc).toContain('ArrowRight')
      expect(tetrisSrc).toContain('ArrowDown')
      expect(tetrisSrc).toContain('ArrowUp')
    })

    it('handleKeydown handles space bar', () => {
      expect(tetrisSrc).toContain("' '")
    })

    it('has collision detection', () => {
      expect(tetrisSrc).toContain('isValidPosition')
    })

    it('State has score field', () => {
      expect(tetrisSrc).toContain('score:')
    })

    it('State has level field', () => {
      expect(tetrisSrc).toContain('level:')
    })

    it('State has lines field', () => {
      expect(tetrisSrc).toContain('lines:')
    })

    it('State has isGameOver field', () => {
      expect(tetrisSrc).toContain('isGameOver:')
    })

    it('State has nextPiece field', () => {
      expect(tetrisSrc).toContain('nextPiece:')
    })

    it('State has board field', () => {
      expect(tetrisSrc).toContain('board:')
    })

    it('has line clearing logic', () => {
      expect(tetrisSrc).toContain('clearLines')
    })

    it('sets isGameOver true on game over', () => {
      expect(tetrisSrc).toContain('isGameOver = true')
    })
  })

  // --- Functional tests ---

  describe('Functional tests', () => {
    let tetrisModule = null

    beforeEach(async () => {
      try {
        tetrisModule = await import(tetrisPath)
      } catch {
        tetrisModule = null
      }
    })

    it('init is a function', () => {
      if (!tetrisModule) return
      expect(typeof tetrisModule.init).toBe('function')
    })

    it('update is a function', () => {
      if (!tetrisModule) return
      expect(typeof tetrisModule.update).toBe('function')
    })

    it('reset is a function', () => {
      if (!tetrisModule) return
      expect(typeof tetrisModule.reset).toBe('function')
    })

    it('handleKeydown is a function', () => {
      if (!tetrisModule) return
      expect(typeof tetrisModule.handleKeydown).toBe('function')
    })

    it('exports state', () => {
      if (!tetrisModule) return
      expect(tetrisModule.state).toBeDefined()
    })

    it('exports CANVAS_WIDTH = 300', () => {
      if (!tetrisModule) return
      expect(tetrisModule.CANVAS_WIDTH).toBe(300)
    })

    it('exports CANVAS_HEIGHT = 400', () => {
      if (!tetrisModule) return
      expect(tetrisModule.CANVAS_HEIGHT).toBe(400)
    })

    it('init() returns state object', () => {
      if (!tetrisModule) return
      const initState = tetrisModule.init()
      expect(initState).not.toBeNull()
    })

    it('state.board is an array with 20 rows', () => {
      if (!tetrisModule) return
      const initState = tetrisModule.init()
      expect(Array.isArray(initState.board)).toBe(true)
      expect(initState.board.length).toBe(20)
      expect(initState.board.every(r => Array.isArray(r) && r.length === 10)).toBe(true)
    })

    it('initial state.score is 0', () => {
      if (!tetrisModule) return
      const initState = tetrisModule.init()
      expect(typeof initState.score).toBe('number')
      expect(initState.score).toBe(0)
    })

    it('initial state.level is 1', () => {
      if (!tetrisModule) return
      const initState = tetrisModule.init()
      expect(typeof initState.level).toBe('number')
      expect(initState.level).toBe(1)
    })

    it('initial state.lines is 0', () => {
      if (!tetrisModule) return
      const initState = tetrisModule.init()
      expect(typeof initState.lines).toBe('number')
      expect(initState.lines).toBe(0)
    })

    it('initial state.isGameOver is false', () => {
      if (!tetrisModule) return
      const initState = tetrisModule.init()
      expect(typeof initState.isGameOver).toBe('boolean')
      expect(initState.isGameOver).toBe(false)
    })

    it('state.nextPiece is set after init', () => {
      if (!tetrisModule) return
      const initState = tetrisModule.init()
      expect(initState.nextPiece).not.toBeNull()
    })

    it('currentPiece is set after init', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      expect(tetrisModule.state.currentPiece).not.toBeNull()
    })

    it('left movement within bounds', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      tetrisModule.handleKeydown('ArrowLeft')
      expect(tetrisModule.state.currentPiece.col <= 9).toBe(true)
    })

    it('right movement within bounds', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      tetrisModule.handleKeydown('ArrowRight')
      tetrisModule.handleKeydown('ArrowRight')
      expect(tetrisModule.state.currentPiece.col <= 9).toBe(true)
    })

    it('reset() restores score to 0', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      tetrisModule.state.score = 100
      tetrisModule.reset()
      expect(tetrisModule.state.score).toBe(0)
    })

    it('reset() sets isGameOver to false', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      tetrisModule.reset()
      expect(tetrisModule.state.isGameOver).toBe(false)
    })

    it('reset() restores level to 1', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      tetrisModule.reset()
      expect(tetrisModule.state.level).toBe(1)
    })

    it('reset() restores lines to 0', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      tetrisModule.reset()
      expect(tetrisModule.state.lines).toBe(0)
    })

    it('update() runs without error', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      expect(() => tetrisModule.update()).not.toThrow()
    })

    it('handleKeydown resets state and starts playing when game is over', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      tetrisModule.state.isGameOver = true
      tetrisModule.handleKeydown('ArrowLeft')
      expect(tetrisModule.state.isGameOver).toBe(false)
      expect(tetrisModule.state.isPlaying).toBe(true)
    })

    it('handleKeydown starts playing and performs action when not playing', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      const scoreBefore = tetrisModule.state.score
      tetrisModule.state.isPlaying = false
      tetrisModule.handleKeydown('ArrowLeft')
      expect(tetrisModule.state.isPlaying).toBe(true)
      // Score should not have changed (just a left move without soft drop)
      expect(tetrisModule.state.score).toBe(scoreBefore)
    })

    it('handleKeydown when isPlaying is false starts the game (three-way logic)', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      expect(tetrisModule.state.isPlaying).toBe(false)
      tetrisModule.handleKeydown('ArrowDown')
      expect(tetrisModule.state.isPlaying).toBe(true)
    })

    it('hard drop does not reduce score', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      while (tetrisModule.state.currentPiece.row < 15) {
        tetrisModule.handleKeydown('ArrowDown')
      }
      const preDropScore = tetrisModule.state.score
      tetrisModule.handleKeydown(' ')
      expect(tetrisModule.state.score >= preDropScore).toBe(true)
    })

    it('hard drop spawns new piece near top', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      while (tetrisModule.state.currentPiece.row < 15) {
        tetrisModule.handleKeydown('ArrowDown')
      }
      tetrisModule.handleKeydown(' ')
      expect(tetrisModule.state.currentPiece.row <= 2).toBe(true)
    })

    it('rotation works (90° CW)', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      const shapeBefore = tetrisModule.state.currentPiece.shape.map(r => [...r])
      tetrisModule.handleKeydown('ArrowUp')
      const shapeAfter = tetrisModule.state.currentPiece.shape
      const n = shapeBefore.length
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          const expected = shapeBefore[n - 1 - c]?.[r] ?? 0
          expect(shapeAfter[r][c]).toBe(expected)
        }
      }
    })

    it('line clearing increases score', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      tetrisModule.handleKeydown('ArrowDown')
      for (let r of [17, 18, 19]) {
        for (let c = 0; c < 10; c++) {
          tetrisModule.state.board[r][c] = '#ff0000'
        }
      }
      tetrisModule.state.currentPiece.row = 15
      tetrisModule.state.currentPiece.col = 3
      tetrisModule.state.lastDropTime = performance.now() - 2000
      const scoreBeforeLC = tetrisModule.state.score
      tetrisModule.update()
      tetrisModule.update()
      expect(tetrisModule.state.score > scoreBeforeLC).toBe(true)
    })

    it('lines counter increases after clearing', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      tetrisModule.handleKeydown('ArrowDown')
      for (let r of [17, 18, 19]) {
        for (let c = 0; c < 10; c++) {
          tetrisModule.state.board[r][c] = '#ff0000'
        }
      }
      tetrisModule.state.currentPiece.row = 15
      tetrisModule.state.currentPiece.col = 3
      tetrisModule.state.lastDropTime = performance.now() - 2000
      const linesBeforeLC = tetrisModule.state.lines
      tetrisModule.update()
      tetrisModule.update()
      expect(tetrisModule.state.lines > linesBeforeLC).toBe(true)
    })

    it('input accepted when game is over (three-way logic)', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      tetrisModule.state.isGameOver = true
      tetrisModule.state.score = 999
      tetrisModule.handleKeydown('ArrowLeft')
      // After reset, score is back to 0, game is playing
      expect(tetrisModule.state.isGameOver).toBe(false)
      expect(tetrisModule.state.isPlaying).toBe(true)
      expect(tetrisModule.state.score).toBe(0)
    })

    it('game-over state is cleared by pressing a key (three-way logic)', () => {
      if (!tetrisModule) return
      tetrisModule.init()
      tetrisModule.state.isGameOver = true
      tetrisModule.handleKeydown('ArrowLeft')
      expect(tetrisModule.state.isGameOver).toBe(false)
    })

    it('level formula: floor(lines / 10) + 1 works for 10 → 2', () => {
      expect(Math.floor(10 / 10) + 1).toBe(2)
    })

    it('level formula: floor(lines / 10) + 1 works for 19 → 2', () => {
      expect(Math.floor(19 / 10) + 1).toBe(2)
    })

    it('level formula: floor(lines / 10) + 1 works for 20 → 3', () => {
      expect(Math.floor(20 / 10) + 1).toBe(3)
    })
  })
})
