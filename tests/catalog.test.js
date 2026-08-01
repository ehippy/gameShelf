import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const catalog = readFileSync(join(root, 'src', 'data', 'gamesCatalog.js'), 'utf-8')

// --- catalog entries ---

describe('catalog entries', () => {
  it('has snake entry', () => {
    expect(catalog).toContain("slug: 'snake'")
  })

  it('has tetris entry', () => {
    expect(catalog).toContain("slug: 'tetris'")
  })

  it('has breakout entry', () => {
    expect(catalog).toContain("slug: 'breakout'")
  })

  it('has flappy-bird entry', () => {
    expect(catalog).toContain("slug: 'flappy-bird'")
  })

  it('has whack-a-mole entry', () => {
    expect(catalog).toContain("slug: 'whack-a-mole'")
  })

  // Title fields
  it('has title Snake', () => {
    expect(catalog).toContain("title: 'Snake'")
  })

  it('has title Tetris', () => {
    expect(catalog).toContain("title: 'Tetris'")
  })

  it('has title Breakout', () => {
    expect(catalog).toContain("title: 'Breakout'")
  })

  it('has title Flappy Bird', () => {
    expect(catalog).toContain("title: 'Flappy Bird'")
  })

  it('has title Whack-a-Mole', () => {
    expect(catalog).toContain("title: 'Whack-a-Mole'")
  })

  // Categories
  it('has Arcade category', () => {
    expect(catalog).toContain("category: 'Arcade'")
  })

  it('has Puzzle category', () => {
    expect(catalog).toContain("category: 'Puzzle'")
  })

  it('has Strategy category', () => {
    expect(catalog).toContain("category: 'Strategy'")
  })

  it('has Casual category', () => {
    expect(catalog).toContain("category: 'Casual'")
  })

  // isNew flags
  it('has isNew=false entries', () => {
    expect(catalog).toContain('isNew: false')
  })

  it('has isNew=true entries', () => {
    expect(catalog).toContain('isNew: true')
  })

  // dateAdded fields
  it('has dateAdded field', () => {
    expect(catalog).toContain('2025-01-15T00:00:00Z')
  })

  it('has minesweeper dateAdded', () => {
    expect(catalog).toContain('2025-06-15T00:00:00Z')
  })

  it('has memory dateAdded', () => {
    expect(catalog).toContain('2025-06-20T00:00:00Z')
  })

  // SVG thumbnails
  it('has SVG thumbnail data URIs', () => {
    expect(catalog).toContain('data:image/svg+xml')
  })
})

// --- catalog order ---

describe('catalog order', () => {
  const slugOrder = []
  const slugRegex = /slug:\s*'([^']+)'/g
  let match
  while ((match = slugRegex.exec(catalog)) !== null) {
    slugOrder.push(match[1])
  }

  it('1st item is snake', () => {
    expect(slugOrder[0]).toBe('snake')
  })

  it('2nd item is tetris', () => {
    expect(slugOrder[1]).toBe('tetris')
  })

  it('3rd item is breakout', () => {
    expect(slugOrder[2]).toBe('breakout')
  })

  it('4th item is flappy-bird', () => {
    expect(slugOrder[3]).toBe('flappy-bird')
  })

  it('5th item is minesweeper', () => {
    expect(slugOrder[4]).toBe('minesweeper')
  })

  it('6th item is memory', () => {
    expect(slugOrder[5]).toBe('memory')
  })

  it('7th item is whack-a-mole', () => {
    expect(slugOrder[6]).toBe('whack-a-mole')
  })
})

// --- thumbnail check ---

describe('thumbnail check', () => {
  it('snake has SVG thumbnail', () => {
    const snakeMatch = catalog.match(/slug: 'snake'[\s\S]*?thumbnail: 'data:image\/svg\+xml,([^']+)'/)
    expect(snakeMatch).not.toBeNull()
  })

  it('tetris has SVG thumbnail', () => {
    const tetrisMatch = catalog.match(/slug: 'tetris'[\s\S]*?thumbnail: 'data:image\/svg\+xml,([^']+)'/)
    expect(tetrisMatch).not.toBeNull()
  })

  it('flappy-bird thumbnail uses green color scheme', () => {
    const flappyThumbMatch = catalog.match(/slug: 'flappy-bird'[\s\S]*?thumbnail: 'data:image\/svg\+xml,([^']+)'/)
    expect(flappyThumbMatch).not.toBeNull()
    expect(flappyThumbMatch[1]).toContain('%2327ae60')
  })

  it('flappy-bird is in Arcade category', () => {
    expect(catalog).toMatch(/slug: 'flappy-bird'[\s\S]*?category: 'Arcade'/)
  })

  it('flappy-bird has isNew=true', () => {
    expect(catalog).toMatch(/slug: 'flappy-bird'[\s\S]*?isNew: true/)
  })

  it('flappy-bird has dateAdded', () => {
    expect(catalog).toMatch(/slug: 'flappy-bird'[\s\S]*?dateAdded:/)
  })

  it('whack-a-mole is in Casual category', () => {
    expect(catalog).toMatch(/slug: 'whack-a-mole'[\s\S]*?category: 'Casual'/)
  })

  it('whack-a-mole has isNew=true', () => {
    expect(catalog).toMatch(/slug: 'whack-a-mole'[\s\S]*?isNew: true/)
  })

  it('whack-a-mole has dateAdded', () => {
    expect(catalog).toMatch(/slug: 'whack-a-mole'[\s\S]*?dateAdded:/)
  })
})

// --- no old fields ---

describe('no old fields', () => {
  it('gamesCatalog.js does not use old id field', () => {
    expect(catalog).not.toContain('id:')
  })

  it('gamesCatalog.js does not use old id field for snake', () => {
    expect(catalog).not.toContain("id: 'snake'")
  })

  it('gamesCatalog.js does not use old id field for tetris', () => {
    expect(catalog).not.toContain("id: 'tetris'")
  })

  it('gamesCatalog.js does not use old id field for breakout', () => {
    expect(catalog).not.toContain("id: 'breakout'")
  })

  it('gamesCatalog.js does not use old name field', () => {
    expect(catalog).not.toContain('name:')
  })

  it('gamesCatalog.js does not use old genre field', () => {
    expect(catalog).not.toContain('genre')
  })

  it('tetris entry is correct', () => {
    expect(catalog).toContain("slug: 'tetris'")
    expect(catalog).toContain("title: 'Tetris'")
    expect(catalog).toContain("category: 'Puzzle'")
  })

  it('flappy-bird has description', () => {
    expect(catalog).toContain("description: 'Guide the bird through gaps in the pipes'")
  })

  it('whack-a-mole has description', () => {
    expect(catalog).toContain("description: 'Whack moles as fast as you can!'")
  })
})
