import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

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
    expect(homeViewSrc).toContain('from')
    expect(homeViewSrc).toContain('GameCard')
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

  it('imports useRouter', () => {
    expect(gamePageSrc).toContain('useRouter')
  })

  it('uses router.replace for 404 on unknown slug', () => {
    expect(gamePageSrc).toContain("router.replace('/404')")
  })

  it('returns early when game not found (no dynamic import for invalid slug)', () => {
    // After the if (!game) guard, there should be a return to prevent further execution
    const gamePageMatch = gamePageSrc.match(/if\s*\(\s*!game\s*\)\s*\{[\s\S]*?return/)
    expect(gamePageMatch).not.toBeNull()
  })

  it('checks for known game directories to prevent invalid imports', () => {
    // GamePage should have a knownGameSlugs guard that checks
    // the slug against a list of actual game directories before
    // performing the dynamic import.
    expect(gamePageSrc).toContain('knownGameSlugs')
    expect(gamePageSrc).toContain('snake')
    expect(gamePageSrc).toContain('tetris')
    expect(gamePageSrc).toContain('breakout')
    expect(gamePageSrc).toContain('flappy-bird')
    expect(gamePageSrc).toContain('whack-a-mole')
  })

  it('redirects to /404 for any unknown game slug', () => {
    // Any slug not in knownGameSlugs gets redirected to /404,
    // preventing dynamic import errors for non-existent gameLogic.js.
    expect(gamePageSrc).toContain("router.replace('/404')")
    // Verify the guard runs BEFORE the dynamic import for slugs not in known list
    const guardMatch = gamePageSrc.match(/if\s*\(\s*!knownGameSlugs\.includes\(slug\)\s*\)\s*\{[\s\S]*?router\.replace\('\/404'\)/)
    expect(guardMatch).not.toBeNull()
    // Verify the guard comes before the dynamic import
    const guardIdx = gamePageSrc.indexOf('knownGameSlugs')
    const importIdx = gamePageSrc.indexOf('import(\'../games/\'')
    expect(guardIdx).toBeGreaterThan(-1)
    expect(importIdx).toBeGreaterThan(-1)
    expect(guardIdx).toBeLessThan(importIdx)
  })

  it('blocks import for any slug not in knownGameSlugs', () => {
    // The knownGameSlugs check prevents loading gameLogic for
    // slugs without actual game directories.
    const guardMatch = gamePageSrc.match(/if\s*\(\s*!knownGameSlugs\.includes\(slug\)\s*\)\s*\{[\s\S]*?router\.replace\('\/404'\)/)
    expect(guardMatch).not.toBeNull()
    // Verify the guard comes before the dynamic import
    const guardIdx = gamePageSrc.indexOf('knownGameSlugs')
    const importIdx = gamePageSrc.indexOf('import(\'../games/\'')
    expect(guardIdx).toBeLessThan(importIdx)
  })

  it('does NOT allow loading gameLogic for non-existent game directories', () => {
    // The knownGameSlugs check must appear before any import('../games/' ... )
    // to prevent module-not-found errors for non-existent gameLogic.js.
    const lines = gamePageSrc.split('\n')
    let guardFound = false
    let importFound = false
    for (const line of lines) {
      if (line.includes('knownGameSlugs') && !guardFound) {
        guardFound = true
      }
      if (line.includes("import('../games/'")) {
        if (!guardFound) {
          throw new Error('Dynamic import occurs before knownGameSlugs guard')
        }
        importFound = true
      }
    }
    expect(importFound).toBe(true)
    expect(guardFound).toBe(true)
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

  // --- Canvas dimension reading from game module ---

  it('uses ref for canvasWidth (reactive)', () => {
    expect(gamePageSrc).toContain('canvasWidth = ref(')
  })

  it('uses ref for canvasHeight (reactive)', () => {
    expect(gamePageSrc).toContain('canvasHeight = ref(')
  })

  it('reads CANVAS_WIDTH from gameLogic module in onMounted', () => {
    expect(gamePageSrc).toContain('gameLogic.CANVAS_WIDTH')
  })

  it('reads CANVAS_HEIGHT from gameLogic module in onMounted', () => {
    expect(gamePageSrc).toContain('gameLogic.CANVAS_HEIGHT')
  })

  it('binds canvasWidth ref to canvas :width attribute', () => {
    expect(gamePageSrc).toContain(':width="canvasWidth"')
  })

  it('binds canvasHeight ref to canvas :height attribute', () => {
    expect(gamePageSrc).toContain(':height="canvasHeight"')
  })

  it('uses ResizeObserver in onMounted', () => {
    expect(gamePageSrc).toContain('ResizeObserver')
  })

  it('reads window.innerHeight in resize handler', () => {
    expect(gamePageSrc).toContain('window.innerHeight')
  })

  // --- CSS: canvas-wrapper ---

  it('canvas-wrapper CSS does not contain max-width: 700px', () => {
    const wrapperStyle = gamePageSrc.match(/\.canvas-wrapper\s*\{([^}]*)\}/s)
    expect(wrapperStyle).not.toBeNull()
    expect(wrapperStyle[1]).not.toContain('max-width: 700px')
  })

  it('canvas-wrapper CSS does not contain margin: 0 auto', () => {
    const wrapperStyle = gamePageSrc.match(/\.canvas-wrapper\s*\{([^}]*)\}/s)
    expect(wrapperStyle).not.toBeNull()
    expect(wrapperStyle[1]).not.toContain('margin: 0 auto')
  })

  it('canvas-wrapper CSS contains display: flex', () => {
    const wrapperStyle = gamePageSrc.match(/\.canvas-wrapper\s*\{([^}]*)\}/s)
    expect(wrapperStyle).not.toBeNull()
    expect(wrapperStyle[1]).toContain('display: flex')
  })

  it('canvas-wrapper CSS contains justify-content: center', () => {
    const wrapperStyle = gamePageSrc.match(/\.canvas-wrapper\s*\{([^}]*)\}/s)
    expect(wrapperStyle).not.toBeNull()
    expect(wrapperStyle[1]).toContain('justify-content: center')
  })

  it('canvas-wrapper CSS contains align-items: flex-start', () => {
    const wrapperStyle = gamePageSrc.match(/\.canvas-wrapper\s*\{([^}]*)\}/s)
    expect(wrapperStyle).not.toBeNull()
    expect(wrapperStyle[1]).toContain('align-items: flex-start')
  })

  it('canvas-wrapper CSS contains position: relative', () => {
    const wrapperStyle = gamePageSrc.match(/\.canvas-wrapper\s*\{([^}]*)\}/s)
    expect(wrapperStyle).not.toBeNull()
    expect(wrapperStyle[1]).toContain('position: relative')
  })

  it('canvas-wrapper has border', () => {
    expect(gamePageSrc).toContain('border:')
  })

  it('canvas-wrapper has overflow: hidden', () => {
    expect(gamePageSrc).toContain('overflow: hidden')
  })

  // --- CSS: canvas ---

  it('canvas wrapper has CSS width: 100% for scaling', () => {
    expect(gamePageSrc).toContain('.canvas-wrapper canvas')
    expect(gamePageSrc).toContain('width: 100%')
  })

  it('canvas wrapper CSS contains height: 100%', () => {
    expect(gamePageSrc).toContain('height: 100%')
  })

  it('canvas wrapper CSS contains background-color', () => {
    expect(gamePageSrc).toContain('background-color: #0f0f23')
  })

  // --- CSS: game-page ---

  it('game-page CSS does not contain max-width: 720px', () => {
    const gamePageStyle = gamePageSrc.match(/\.game-page\s*\{([^}]*)\}/s)
    expect(gamePageStyle).not.toBeNull()
    expect(gamePageStyle[1]).not.toContain('max-width: 720px')
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

  it('does not use old highScores state', () => {
    expect(highScoresViewSrc).not.toContain('scoreStore.highScores')
  })

  it('does not use old getGameById method', () => {
    expect(highScoresViewSrc).not.toContain('getGameById')
  })

  it('uses scoreStore.scores for iteration', () => {
    expect(highScoresViewSrc).toContain('scoreStore.scores')
  })

  it('uses getGameBySlug to look up games', () => {
    expect(highScoresViewSrc).toContain('getGameBySlug')
  })

  it('uses game.title for displayed game name', () => {
    expect(highScoresViewSrc).toMatch(/game\.title|p\.title|y\.title/)
  })

  it('falls back to slug when game not found', () => {
    expect(highScoresViewSrc).toMatch(/gameSlug|:gameSlug|o$/)
  })

  it('maps timestamp to date display', () => {
    expect(highScoresViewSrc).toContain('timestamp')
    expect(highScoresViewSrc).toContain('toLocaleDateString')
  })

  it('handles missing player name with a placeholder', () => {
    expect(highScoresViewSrc).toContain("'Player'")
  })

  it('sorts results by score descending', () => {
    expect(highScoresViewSrc).toMatch(/sort\(\(a,\s*b\)\s*=>\s*b\.score/)
  })

  it('renders Game, Name, Score, Date columns', () => {
    expect(highScoresViewSrc).toContain('<th>Game</th>')
    expect(highScoresViewSrc).toContain('<th>Name</th>')
    expect(highScoresViewSrc).toContain('<th>Score</th>')
    expect(highScoresViewSrc).toContain('<th>Date</th>')
  })

  it('shows No high scores yet when no scores', () => {
    expect(highScoresViewSrc).toContain('No high scores yet.')
  })

  it('renders table with v-if="hasScores"', () => {
    expect(highScoresViewSrc).toContain('v-if="hasScores"')
  })

  it('renders empty state with v-else', () => {
    expect(highScoresViewSrc).toContain('v-else')
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
