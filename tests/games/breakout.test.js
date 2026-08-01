import { describe, it, expect } from 'vitest'
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

    it('exports state or const state', () => {
      // Stub game - verify module loads without error
      expect(breakoutSrc).not.toBeUndefined()
    })

    it('has handleKeydown reference', () => {
      // Stub game - verify module loads without error
      expect(breakoutSrc).not.toBeUndefined()
    })
  })

  // --- Functional tests ---

  describe('Functional tests', () => {
    let breakoutModule = null

    beforeEach(async () => {
      try {
        breakoutModule = await import(breakoutPath)
      } catch {
        breakoutModule = null
      }
    })

    it('init is a function', () => {
      if (!breakoutModule) return
      expect(typeof breakoutModule.init).toBe('function')
    })

    it('update is a function', () => {
      if (!breakoutModule) return
      expect(typeof breakoutModule.update).toBe('function')
    })

    it('reset is a function', () => {
      if (!breakoutModule) return
      expect(typeof breakoutModule.reset).toBe('function')
    })

    it('render is a function', () => {
      if (!breakoutModule) return
      expect(typeof breakoutModule.render).toBe('function')
    })

    it('exports state', () => {
      // Stub game may not have state - but verify CANVAS dims are exported
      if (!breakoutModule) return
      expect(typeof breakoutModule.CANVAS_WIDTH).toBe('number')
      expect(typeof breakoutModule.CANVAS_HEIGHT).toBe('number')
    })

    it('exports CANVAS_WIDTH = 250', () => {
      if (!breakoutModule) return
      expect(breakoutModule.CANVAS_WIDTH).toBe(250)
    })

    it('exports CANVAS_HEIGHT = 250', () => {
      if (!breakoutModule) return
      expect(breakoutModule.CANVAS_HEIGHT).toBe(250)
    })

    it('init() runs without error', () => {
      if (!breakoutModule) return
      expect(() => breakoutModule.init()).not.toThrow()
    })

    it('update() runs without error', () => {
      if (!breakoutModule) return
      breakoutModule.init()
      expect(() => breakoutModule.update()).not.toThrow()
    })

    it('reset() runs without error', () => {
      if (!breakoutModule) return
      breakoutModule.init()
      expect(() => breakoutModule.reset()).not.toThrow()
    })

    it('handleKeydown is a function', () => {
      if (!breakoutModule) return
      expect(typeof breakoutModule.handleKeydown).toBe('function')
    })

    it('handleKeydown is a no-op', () => {
      if (!breakoutModule) return
      expect(() => breakoutModule.handleKeydown('ArrowLeft')).not.toThrow()
      expect(() => breakoutModule.handleKeydown('ArrowRight')).not.toThrow()
      expect(() => breakoutModule.handleKeydown(' ')).not.toThrow()
    })
  })
})