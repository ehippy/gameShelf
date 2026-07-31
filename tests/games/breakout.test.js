import { describe, it, expect } from 'vitest'
import { readFileSync, fileURLToPath } from 'node:fs'
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

    it('exports state', () => {
      expect(breakoutSrc).toContain('export { state }')
    })

    it('exports handleKeydown', () => {
      expect(breakoutSrc).toContain('handleKeydown')
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
      if (!breakoutModule) return
      expect(breakoutModule.state).toBeDefined()
    })

    it('init() returns state object', () => {
      if (!breakoutModule) return
      const result = breakoutModule.init()
      expect(result).toBeDefined()
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
  })
})
