import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// Load component source files
const appHeaderSrc = readFileSync(join(root, 'src', 'components', 'AppHeader.vue'), 'utf-8')
const appFooterSrc = readFileSync(join(root, 'src', 'components', 'AppFooter.vue'), 'utf-8')
const gameCardContent = readFileSync(join(root, 'src', 'components', 'GameCard.vue'), 'utf-8')
const mostPlayedSrc = readFileSync(join(root, 'src', 'components', 'MostPlayedCarousel.vue'), 'utf-8')
const randomGameBtnSrc = readFileSync(join(root, 'src', 'components', 'RandomGameBtn.vue'), 'utf-8')
const whatsNewSrc = readFileSync(join(root, 'src', 'components', 'WhatsNew.vue'), 'utf-8')

// --- AppHeader ---

describe('AppHeader', () => {
  it('has header element', () => {
    expect(appHeaderSrc).toContain('<header')
  })

  it('has brand name gameShelf', () => {
    expect(appHeaderSrc).toContain('gameShelf')
  })

  it('has router-link nav items', () => {
    expect(appHeaderSrc).toContain('router-link')
  })

  it('has Home nav link', () => {
    expect(appHeaderSrc).toContain('Home')
  })

  it('has Games nav link', () => {
    expect(appHeaderSrc).toContain('Games')
  })

  it('has High Scores nav link', () => {
    expect(appHeaderSrc).toContain('High Scores')
  })

  it('has About nav link', () => {
    expect(appHeaderSrc).toContain('About')
  })

  it('has search input with type=text', () => {
    expect(appHeaderSrc).toContain("type=\"text\"")
  })

  it('has search input placeholder', () => {
    expect(appHeaderSrc).toContain('Search games')
  })

  it('has select element for category filter', () => {
    expect(appHeaderSrc).toContain('<select')
  })

  it('category filter has All Categories option', () => {
    expect(appHeaderSrc).toContain('All Categories')
  })

  it('category filter has Arcade option', () => {
    expect(appHeaderSrc).toContain('Arcade')
  })

  it('category filter has Puzzle option', () => {
    expect(appHeaderSrc).toContain('Puzzle')
  })

  it('category filter has Action option', () => {
    expect(appHeaderSrc).toContain('Action')
  })

  it('styles include position: sticky', () => {
    expect(appHeaderSrc).toContain('position: sticky')
  })

  it('brand references accent color', () => {
    expect(appHeaderSrc).toMatch(/#7f5af0|var\(--color-accent\)/)
  })
})

// --- AppFooter ---

describe('AppFooter', () => {
  it('has footer element', () => {
    expect(appFooterSrc).toContain('<footer')
  })

  it('has copyright with year and name', () => {
    expect(appFooterSrc).toContain('2025')
    expect(appFooterSrc).toContain('gameShelf')
  })

  it('has no downloads required text', () => {
    expect(appFooterSrc).toContain('no downloads required')
  })

  it('has all exact copyright text', () => {
    expect(appFooterSrc).toContain('2025')
    expect(appFooterSrc).toContain('gameShelf')
    expect(appFooterSrc).toContain('All games built in browser')
    expect(appFooterSrc).toContain('no downloads required')
  })

  it('has router-link to /about', () => {
    expect(appFooterSrc).toContain("to=\"/about\"") || expect(appFooterSrc).toContain("to='/about'")
  })
})

// --- GameCard ---

describe('GameCard', () => {
  it('has title prop', () => {
    expect(gameCardContent).toContain('title')
  })

  it('has description prop', () => {
    expect(gameCardContent).toContain('description')
  })

  it('has thumbnail prop', () => {
    expect(gameCardContent).toContain('thumbnail')
  })

  it('has category prop', () => {
    expect(gameCardContent).toContain('category')
  })

  it('has slug prop', () => {
    expect(gameCardContent).toContain('slug')
  })

  it('renders a Play button using router-link', () => {
    expect(gameCardContent).toContain('router-link')
  })

  it('renders router-link to /game/:slug', () => {
    expect(gameCardContent).toContain("'/game/' + slug")
  })

  it('router-link uses dynamic slug path', () => {
    expect(gameCardContent).toContain(":to=\"'/game/' + slug\"")
  })

  it('truncates description with overflow:hidden and text-overflow:ellipsis', () => {
    expect(gameCardContent).toContain('overflow: hidden')
    expect(gameCardContent).toContain('text-overflow: ellipsis')
  })

  it('uses <style scoped>', () => {
    expect(gameCardContent).toContain('scoped')
  })
})

// --- MostPlayedCarousel ---

describe('MostPlayedCarousel', () => {
  it('imports and uses useGameStore', () => {
    expect(mostPlayedSrc).toContain('useGameStore')
  })

  it('uses gameStore', () => {
    expect(mostPlayedSrc).toContain('gameStore')
  })

  it('renders GameCard components', () => {
    expect(mostPlayedSrc).toContain('GameCard')
  })

  it('has games prop', () => {
    expect(mostPlayedSrc).toContain('games')
  })

  it('uses <style scoped>', () => {
    expect(mostPlayedSrc).toContain('scoped')
  })

  it('calls gameStore.getGameBySlug (not getGameById)', () => {
    expect(mostPlayedSrc).toContain('getGameBySlug')
  })

  it('does not call old getGameById method', () => {
    expect(mostPlayedSrc).not.toContain('getGameById')
  })

  it('uses ?.title for title binding', () => {
    expect(mostPlayedSrc).toMatch(/getGameBySlug\(slug\)\?\.\s*title/)
  })

  it('does not use old ?.name field', () => {
    expect(mostPlayedSrc).not.toMatch(/getGameBySlug\(slug\)\?\.\s*name/)
  })

  it('uses ?.category for category binding', () => {
    expect(mostPlayedSrc).toMatch(/getGameBySlug\(slug\)\?\.\s*category/)
  })

  it('uses "Arcade" as category default', () => {
    expect(mostPlayedSrc).toContain("'Arcade'")
  })

  it('does not use old ?.genre field', () => {
    expect(mostPlayedSrc).not.toMatch(/getGameBySlug\(slug\)\?\.\s*genre/)
  })
})

// --- RandomGameBtn ---

describe('RandomGameBtn', () => {
  it('imports useGameStore', () => {
    expect(randomGameBtnSrc).toContain('useGameStore')
  })

  it('uses gameStore', () => {
    expect(randomGameBtnSrc).toContain('gameStore')
  })

  it('navigates with router.push', () => {
    expect(randomGameBtnSrc).toContain('router.push')
  })

  it('picks a random game using Math.random', () => {
    expect(randomGameBtnSrc).toContain('Math.random')
  })

  it('uses <style scoped>', () => {
    expect(randomGameBtnSrc).toContain('scoped')
  })
  it('uses randomGame.slug in router.push path', () => {
    expect(randomGameBtnSrc).toMatch(/router\.push\('\/game\/' \+ randomGame\.slug\)/)
  })

  it('does not use old randomGame.id field', () => {
    expect(randomGameBtnSrc).not.toMatch(/randomGame\.id/)
  })

  it('uses randomGame.slug for navigation (not .id)', () => {
    expect(randomGameBtnSrc).toContain('randomGame.slug')
  })

  it('does NOT use randomGame.id for navigation', () => {
    expect(randomGameBtnSrc).not.toContain('randomGame.id')
  })
})

// --- WhatsNew ---

describe('WhatsNew', () => {
  it('uses gameStore.newestGames', () => {
    expect(whatsNewSrc).toContain('newestGames')
  })

  it('renders GameCard components', () => {
    expect(whatsNewSrc).toContain('GameCard')
  })

  it('uses <style scoped>', () => {
    expect(whatsNewSrc).toContain('scoped')
  })

  it('uses game.slug for :key binding', () => {
    expect(whatsNewSrc).toMatch(/:key="game\.slug"/)
  })

  it('uses game.slug for :slug binding', () => {
    expect(whatsNewSrc).toMatch(/:slug="game\.slug"/)
  })

  it('does not use old game.id field', () => {
    expect(whatsNewSrc).not.toMatch(/game\.id/)
  })

  it('uses game.title for :title binding', () => {
    expect(whatsNewSrc).toMatch(/:title="game\.title"/)
  })

  it('does not use old game.name field', () => {
    expect(whatsNewSrc).not.toMatch(/game\.name/)
  })

  it('uses game.category for :category binding', () => {
    expect(whatsNewSrc).toMatch(/:category="game\.category"/)
  })

  it('does not use old game.genre field', () => {
    expect(whatsNewSrc).not.toMatch(/game\.genre/)
  })

  it('uses game.description for :description binding (unchanged)', () => {
    expect(whatsNewSrc).toMatch(/:description="game\.description"/)
  })
})
