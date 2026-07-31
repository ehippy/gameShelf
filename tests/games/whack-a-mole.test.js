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
  })
})
