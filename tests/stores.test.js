import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = import.meta.dirname

// Load source files for content assertions
const gameStoreSrc = readFileSync(join(root, 'src', 'stores', 'gameStore.js'), 'utf-8')
const scoreStoreSrc = readFileSync(join(root, 'src', 'stores', 'scoreStore.js'), 'utf-8')
const userStoreSrc = readFileSync(join(root, 'src', 'stores', 'userStore.js'), 'utf-8')

// --- gameStore ---

describe('gameStore', () => {
  it('exports useGameStore', () => {
    expect(gameStoreSrc).toContain('useGameStore')
  })

  it('has catalog state', () => {
    expect(gameStoreSrc).toContain('catalog')
  })

  it('has activeGame state', () => {
    expect(gameStoreSrc).toContain('activeGame')
  })

  it('has addGame action', () => {
    expect(gameStoreSrc).toContain('addGame')
  })

  it('has removeGame action', () => {
    expect(gameStoreSrc).toContain('removeGame')
  })

  it('has getGameBySlug action', () => {
    expect(gameStoreSrc).toContain('getGameBySlug')
  })

  it('has setActiveGame action', () => {
    expect(gameStoreSrc).toContain('setActiveGame')
  })

  it('uses slug field for getGameBySlug', () => {
    expect(gameStoreSrc).toContain('g.slug === slug')
  })

  it('has gamesByCategory computed', () => {
    expect(gameStoreSrc).toContain('gamesByCategory')
  })

  it('has newestGames getter', () => {
    expect(gameStoreSrc).toContain('newestGames')
  })

  it('does not have old getGameById method', () => {
    expect(gameStoreSrc).not.toContain('getGameById')
  })
})

// --- scoreStore ---

describe('scoreStore', () => {
  it('exports useScoreStore', () => {
    expect(scoreStoreSrc).toContain('useScoreStore')
  })

  it('has scores state', () => {
    expect(scoreStoreSrc).toContain('scores')
  })

  it('has submitScore action', () => {
    expect(scoreStoreSrc).toContain('submitScore')
  })

  it('has getScores action', () => {
    expect(scoreStoreSrc).toContain('getScores')
  })

  it('has getAllScores action', () => {
    expect(scoreStoreSrc).toContain('getAllScores')
  })

  it('has clearScores action', () => {
    expect(scoreStoreSrc).toContain('clearScores')
  })

  it('uses gamescore_ localStorage key format', () => {
    expect(scoreStoreSrc).toContain('gamescore_')
  })

  it('does not have old addScore method', () => {
    expect(scoreStoreSrc).not.toContain('addScore')
  })

  it('does not have old getHighScores method', () => {
    expect(scoreStoreSrc).not.toContain('getHighScores')
  })

  it('does not use old highScores state', () => {
    expect(scoreStoreSrc).not.toContain('highScores')
  })
})

// --- userStore ---

describe('userStore', () => {
  it('exports useUserStore', () => {
    expect(userStoreSrc).toContain('useUserStore')
  })

  it('has recentlyPlayed state', () => {
    expect(userStoreSrc).toContain('recentlyPlayed')
  })

  it('has markPlayed action', () => {
    expect(userStoreSrc).toContain('markPlayed')
  })

  it('has getRecentlyPlayed action', () => {
    expect(userStoreSrc).toContain('getRecentlyPlayed')
  })

  it('persists to user_recentlyPlayed localStorage key', () => {
    expect(userStoreSrc).toContain('user_recentlyPlayed')
  })

  it('does not have old setUserName method', () => {
    expect(userStoreSrc).not.toContain('setUserName')
  })

  it('does not have old setLastPlayedGame method', () => {
    expect(userStoreSrc).not.toContain('setLastPlayedGame')
  })
})
