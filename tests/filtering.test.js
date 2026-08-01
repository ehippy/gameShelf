import { describe, it, expect } from 'vitest'
import gamesCatalog from '../src/data/gamesCatalog.js'

/**
 * Replicate the filteredGames computed from HomeView.vue
 * to test filtering behavior against the catalog.
 */
function computeFilteredGames(catalog, searchQuery, selectedCategory) {
  let results = catalog
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    results = results.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q)
    )
  }
  if (selectedCategory) {
    const cat = selectedCategory.toLowerCase()
    results = results.filter(g => g.category.toLowerCase() === cat)
  }
  return results
}

// --- Filtering behavior tests ---

describe('filtering behavior', () => {
  it('empty search + empty category → shows all 5 games', () => {
    const results = computeFilteredGames(gamesCatalog, '', '')
    expect(results.length).toBe(5)
    expect(results.map(g => g.slug)).toEqual(['snake', 'tetris', 'breakout', 'flappy-bird', 'whack-a-mole'])
  })

  it('search "snake" (case-insensitive) → shows only Snake', () => {
    const results = computeFilteredGames(gamesCatalog, 'snake', '')
    expect(results.length).toBe(1)
    expect(results[0].slug).toBe('snake')
  })

  it('search "SNAKE" (uppercase) → shows only Snake', () => {
    const results = computeFilteredGames(gamesCatalog, 'SNAKE', '')
    expect(results.length).toBe(1)
    expect(results[0].slug).toBe('snake')
  })

  it('search "snake" matches title, description, and category', () => {
    // "snake" is in title, description, and category
    const results = computeFilteredGames(gamesCatalog, 'snake', '')
    expect(results.length).toBe(1)
    expect(results[0].slug).toBe('snake')
  })

  it('search "classic" → shows Snake, Tetris, Breakout (all have "classic" in title/description)', () => {
    const results = computeFilteredGames(gamesCatalog, 'classic', '')
    expect(results.length).toBe(3)
    expect(results.map(g => g.slug).sort()).toEqual(['breakout', 'snake', 'tetris'])
  })

  it('search "bird" → shows Flappy Bird', () => {
    const results = computeFilteredGames(gamesCatalog, 'bird', '')
    expect(results.length).toBe(1)
    expect(results[0].slug).toBe('flappy-bird')
  })

  it('select "Arcade" category → shows Snake, Breakout, Flappy Bird', () => {
    const results = computeFilteredGames(gamesCatalog, '', 'Arcade')
    expect(results.length).toBe(3)
    expect(results.map(g => g.slug).sort()).toEqual(['breakout', 'flappy-bird', 'snake'])
  })

  it('select "Puzzle" category → shows only Tetris', () => {
    const results = computeFilteredGames(gamesCatalog, '', 'Puzzle')
    expect(results.length).toBe(1)
    expect(results[0].slug).toBe('tetris')
  })

  it('select "Casual" category → shows only Whack-a-Mole', () => {
    const results = computeFilteredGames(gamesCatalog, '', 'Casual')
    expect(results.length).toBe(1)
    expect(results[0].slug).toBe('whack-a-mole')
  })

  it('select "Action" category → shows none (no games with that category)', () => {
    const results = computeFilteredGames(gamesCatalog, '', 'Action')
    expect(results.length).toBe(0)
  })

  it('search "bird" + select "Arcade" → shows Flappy Bird (intersection)', () => {
    const results = computeFilteredGames(gamesCatalog, 'bird', 'Arcade')
    expect(results.length).toBe(1)
    expect(results[0].slug).toBe('flappy-bird')
  })

  it('search "bird" + select "Puzzle" → shows none (no intersection)', () => {
    const results = computeFilteredGames(gamesCatalog, 'bird', 'Puzzle')
    expect(results.length).toBe(0)
  })

  it('search "classic" + select "Arcade" → shows Snake, Breakout only (not Tetris)', () => {
    // Tetris is Puzzle, so excluded by category filter
    const results = computeFilteredGames(gamesCatalog, 'classic', 'Arcade')
    expect(results.length).toBe(2)
    expect(results.map(g => g.slug).sort()).toEqual(['breakout', 'snake'])
  })

  it('search "mole" + select "Casual" → shows Whack-a-Mole', () => {
    const results = computeFilteredGames(gamesCatalog, 'mole', 'Casual')
    expect(results.length).toBe(1)
    expect(results[0].slug).toBe('whack-a-mole')
  })

  it('search "tet" + select "Puzzle" → shows Tetris', () => {
    const results = computeFilteredGames(gamesCatalog, 'tet', 'Puzzle')
    expect(results.length).toBe(1)
    expect(results[0].slug).toBe('tetris')
  })

  it('case-insensitive search: "CLASSIC" + "arcade" (lowercase category) → Snake, Breakout', () => {
    const results = computeFilteredGames(gamesCatalog, 'CLASSIC', 'arcade')
    expect(results.length).toBe(2)
    expect(results.map(g => g.slug).sort()).toEqual(['breakout', 'snake'])
  })

  it('search "brick" → shows only Breakout', () => {
    const results = computeFilteredGames(gamesCatalog, 'brick', '')
    expect(results.length).toBe(1)
    expect(results[0].slug).toBe('breakout')
  })

  it('search "block" → shows only Tetris', () => {
    const results = computeFilteredGames(gamesCatalog, 'block', '')
    expect(results.length).toBe(1)
    expect(results[0].slug).toBe('tetris')
  })

  it('search "gap" → shows only Flappy Bird', () => {
    const results = computeFilteredGames(gamesCatalog, 'gap', '')
    expect(results.length).toBe(1)
    expect(results[0].slug).toBe('flappy-bird')
  })
})
