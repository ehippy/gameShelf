import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = import.meta.dirname + '/..'

// Load view source files
const homeViewSrc = readFileSync(join(root, 'src', 'views', 'HomeView.vue'), 'utf-8')
const aboutViewSrc = readFileSync(join(root, 'src', 'views', 'AboutView.vue'), 'utf-8')
const gamePageSrc = readFileSync(join(root, 'src', 'views', 'GamePage.vue'), 'utf-8')
const highScoresViewSrc = readFileSync(join(root, 'src', 'views', 'HighScoresView.vue'), 'utf-8')
const notFoundViewSrc = readFileSync(join(root, 'src', 'views', 'NotFoundView.vue'), 'utf-8')

// --- HomeView ---

describe('HomeView', () => {
  it('has h1 heading', () => {
    expect(homeViewSrc).toContain('<h1>')
  })

  it('shows gameShelf brand', () => {
    expect(homeViewSrc).toContain('gameShelf')
  })

  it('has tagline', () => {
    expect(homeViewSrc).toContain('tagline') || expect(homeViewSrc).toContain('Play classic games')
  })

  it('renders games grid from gameStore', () => {
    expect(homeViewSrc).toContain('gameStore.catalog')
  })

  it('imports and uses GameCard component', () => {
    expect(homeViewSrc).toContain('GameCard')
  })

  it('has GameCard import statement', () => {
    expect(homeViewSrc).toContain('from') && expect(homeViewSrc).toContain('GameCard')
  })

  it('passes :slug prop from catalog', () => {
    expect(homeViewSrc).toContain(':slug="game.slug"')
  })

  it('passes :title prop from catalog', () => {
    expect(homeViewSrc).toContain(':title="game.title"')
  })

  it('passes :description prop from catalog', () => {
    expect(homeViewSrc).toContain(':description="game.description"')
  })

  it('passes :thumbnail prop from catalog', () => {
    expect(homeViewSrc).toContain(':thumbnail="game.thumbnail"')
  })

  it('passes :category prop from catalog', () => {
    expect(homeViewSrc).toContain(':category="game.category"')
  })

  it('iterates over gameStore.catalog with v-for', () => {
    expect(homeViewSrc).toContain('v-for="game in gameStore.catalog"')
  })

  it('uses game.slug as key', () => {
    expect(homeViewSrc).toContain(':key="game.slug"')
  })

  it('has no reference to game.id', () => {
    expect(homeViewSrc).not.toContain('game.id')
  })

  it('has no reference to game.name', () => {
    expect(homeViewSrc).not.toContain('game.name')
  })

  it('has no reference to game.genre', () => {
    expect(homeViewSrc).not.toContain('game.genre')
  })

  it('has a GameCard loop using v-for', () => {
    const gameCardLoopMatch = homeViewSrc.match(/<GameCard[\s\S]*?v-for="game in gameStore.catalog"[\s\S]*?\/>/)
    expect(gameCardLoopMatch).not.toBeNull()
  })

  it('has games-grid wrapper div', () => {
    expect(homeViewSrc).toContain('<div class="games-grid">') || expect(homeViewSrc).toContain('games-grid')
  })

  it('has h1 with gameShelf', () => {
    expect(homeViewSrc).toContain('<h1>gameShelf</h1>')
  })

  it('has tagline element', () => {
    expect(homeViewSrc).toContain('class="tagline"') || expect(homeViewSrc).toContain('"tagline"')
  })
})

// --- AboutView ---

describe('AboutView', () => {
  it('has h1 About gameShelf', () => {
    expect(aboutViewSrc).toContain('<h1>About gameShelf</h1>') || expect(aboutViewSrc).toContain('About gameShelf')
  })

  it('has paragraph about the project', () => {
    expect(aboutViewSrc).toContain('<p>')
  })
})

// --- GamePage ---

describe('GamePage', () => {
  it('reads route params', () => {
    expect(gamePageSrc).toContain('route.params.id') || expect(gamePageSrc).toContain('useRoute()')
  })

  it('looks up game in store', () => {
    expect(gamePageSrc).toContain('gameStore') || expect(gamePageSrc).toContain('getGameBySlug')
  })

  it('has game canvas', () => {
    expect(gamePageSrc).toContain('<canvas')
  })

  it('has a game loop with requestAnimationFrame', () => {
    expect(gamePageSrc).toContain('requestAnimationFrame')
  })

  it('forwards key events to handleKeydown', () => {
    expect(gamePageSrc).toContain('handleKeydown')
  })

  it('has a Play Again button', () => {
    expect(gamePageSrc).toContain('Play Again')
  })

  it('checks isGameOver for overlay', () => {
    expect(gamePageSrc).toContain('isGameOver')
  })

  it('calls submitScore', () => {
    expect(gamePageSrc).toContain('submitScore')
  })

  it('removes keydown listener on unmount', () => {
    expect(gamePageSrc).toContain('removeEventListener')
  })

  it('cancels animation frame on unmount', () => {
    expect(gamePageSrc).toContain('cancelAnimationFrame')
  })

  it('calls reset on Play Again', () => {
    expect(gamePageSrc).toContain('gameLogic.reset') || expect(gamePageSrc).toContain('reset()')
  })

  it('does NOT show old placeholder text', () => {
    expect(gamePageSrc).not.toContain('Game canvas coming soon')
  })
})

// --- HighScoresView ---

describe('HighScoresView', () => {
  it('reads from scoreStore', () => {
    expect(highScoresViewSrc).toContain('scoreStore')
  })

  it('renders a table', () => {
    expect(highScoresViewSrc).toContain('<table')
  })
})

// --- NotFoundView ---

describe('NotFoundView', () => {
  it('renders 404 heading', () => {
    expect(notFoundViewSrc).toContain('<h1>404</h1>') || expect(notFoundViewSrc).toContain('404')
  })

  it('has Page not found text', () => {
    expect(notFoundViewSrc).toContain('Page not found')
  })

  it('has router-link pointing to /', () => {
    expect(notFoundViewSrc).toContain("to=\"/\"") || expect(notFoundViewSrc).toContain("to='/'")
  })
})
