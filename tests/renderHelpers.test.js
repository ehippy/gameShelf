import { describe, it, expect } from 'vitest'
import { shouldSkipUpdate } from '../src/games/shared/renderHelpers.js'

describe('shouldSkipUpdate', () => {
  it('returns true when state is null', () => {
    expect(shouldSkipUpdate(null)).toBe(true)
  })

  it('returns true when state is undefined', () => {
    expect(shouldSkipUpdate(undefined)).toBe(true)
  })

  it('returns true when state.isGameOver is true', () => {
    expect(shouldSkipUpdate({ isGameOver: true, isPlaying: true })).toBe(true)
  })

  it('returns true when state.isPlaying is false', () => {
    expect(shouldSkipUpdate({ isGameOver: false, isPlaying: false })).toBe(true)
  })

  it('returns true when state.isPlaying is falsy (0)', () => {
    expect(shouldSkipUpdate({ isGameOver: false, isPlaying: 0 })).toBe(true)
  })

  it('returns false when state is a valid active game state', () => {
    expect(shouldSkipUpdate({ isGameOver: false, isPlaying: true })).toBe(false)
  })

  it('returns false when state has extra properties but is active', () => {
    expect(shouldSkipUpdate({ isGameOver: false, isPlaying: true, score: 42 })).toBe(false)
  })

  it('returns true when both isGameOver and isPlaying are false', () => {
    expect(shouldSkipUpdate({ isGameOver: false, isPlaying: false })).toBe(true)
  })
})
