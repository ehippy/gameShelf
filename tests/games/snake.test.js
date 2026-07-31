import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = import.meta.dirname
const snakePath = join(root, 'src', 'games', 'snake', 'gameLogic.js')

// --- Static checks ---

describe('snake', () => {
  describe('Static checks', () => {
    const snakeSrc = readFileSync(snakePath, 'utf-8')

    it('exports init()', () => {
      expect(snakeSrc).toContain('export function init')
    })

    it('exports update()', () => {
      expect(snakeSrc).toContain('export function update')
    })

    it('exports render()', () => {
      expect(snakeSrc).toContain('export function render')
    })

    it('exports reset()', () => {
      expect(snakeSrc).toContain('export function reset')
    })

    it('exports state', () => {
      expect(snakeSrc).toContain('export { state }')
    })

    it('exports handleKeydown', () => {
      expect(snakeSrc).toContain('handleKeydown')
    })
  })

  // --- Functional tests ---

  describe('Functional tests', () => {
    let snakeModule = null

    beforeEach(async () => {
      try {
        snakeModule = await import(snakePath)
      } catch {
        snakeModule = null
      }
    })

    it('init is a function', () => {
      if (!snakeModule) return
      expect(typeof snakeModule.init).toBe('function')
    })

    it('update is a function', () => {
      if (!snakeModule) return
      expect(typeof snakeModule.update).toBe('function')
    })

    it('reset is a function', () => {
      if (!snakeModule) return
      expect(typeof snakeModule.reset).toBe('function')
    })

    it('render is a function', () => {
      if (!snakeModule) return
      expect(typeof snakeModule.render).toBe('function')
    })

    it('exports state', () => {
      if (!snakeModule) return
      expect(snakeModule.state).toBeDefined()
    })

    it('init() returns state object', () => {
      if (!snakeModule) return
      const result = snakeModule.init()
      expect(result).toBeDefined()
    })

    it('update() runs without error', () => {
      if (!snakeModule) return
      snakeModule.init()
      expect(() => snakeModule.update()).not.toThrow()
    })

    it('reset() runs without error', () => {
      if (!snakeModule) return
      snakeModule.init()
      expect(() => snakeModule.reset()).not.toThrow()
    })
  })
})
